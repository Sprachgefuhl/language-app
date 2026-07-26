const supabase = require('../config/postgres');
const genai = require('@google/genai').GoogleGenAI;
const ai = new genai({});
const cheerio = require('cheerio');
const { compilePrompt } = require('../utils/prompt');
const { standardizeDate, isValidJSON, getTermPositionsInStr, timeoutPromise } = require('../utils/func');
const { getUserByID } = require('./user');
const langData = require('../utils/langData');

const createArchive = async (userId, language, date, analysis, content) => {
  const { data, err } = await supabase
    .from('archives')
    .insert({
      user_id: userId,
      language: language,
      date: date,
      analysis: analysis,
      content: content,
    })
    .select()

  if (err) console.log(err.message);
  return data;
}

const getArchive = async (userId, language, date) => {
  const { data, err } = await supabase
    .from('archives')
    .select('*')
    .eq('user_id', userId)
    .eq('language', language)
    .eq('date', date)

  if (err) console.log(err.message);
  return data;
}

const getDailyText = async (language, date) => {
  const scraperUrl = langData.find(lang => lang.name === language).scraperUrl;
  const url = `${scraperUrl}${date}`;
  const data = await fetch(url).then(res => res.text());

  const $ = cheerio.load(data);
  const text = $('.bodyTxt').text();
  const textCleaned = text.split(/\r?\n\s*\r?\n/)[1];

  return textCleaned;
}

const analyseDailyText = async (userId, language, date, content) => {
  console.log('Starting analysis');
  const prompt = compilePrompt(language, content);
  try {
    const response = await timeoutPromise(ai.models.generateContent({
      signal: AbortSignal.timeout(500),
      model: 'gemini-3.1-flash-lite', // gemini-3.5-flash
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            difficultyLevel: {
              type: 'number',
              minimum: 0,
              maximum: 1
            },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['chunk', 'noun']
                  },
                  // content: { type: 'string' },
                  // singular: { type: 'string' },
                  // plural: { type: 'string' },
                  content: { type: 'string' },
                  translation: { type: 'string' }
                },
                required: ['type', 'content', 'translation']
              }
            }
          },
          required: ['difficultyLevel', 'data']
        }
      }
    }), 55000);

    const analysis = JSON.parse(response.text);
    // console.log(analysis);
    const newArchive = await createArchive(userId, language, date, analysis, content);
  } catch (error) {
    console.error('Error communicating with Gemini API:', error);
    return error;
  }
}

// const analyseDailyText = async (userId, language, date, content) => {
//   console.log('Starting analysis');
//   const prompt = compilePrompt(language, content);
//   try {
//     const response = await timeoutPromise(ai.models.generateContent({
//       signal: AbortSignal.timeout(500),
//       model: 'gemini-3.1-flash-lite', // gemini-3.5-flash
//       contents: prompt,
//       config: {
//         responseMimeType: 'application/json',
//         responseSchema: {
//           type: 'object',
//           properties: {
//             difficultyLevel: {
//               type: 'number',
//               minimum: 0,
//               maximum: 1
//             },
//             data: {
//               type: 'array',
//               items: {
//                 type: 'object',
//                 properties: {
//                   type: {
//                     type: 'string',
//                     enum: ['noun', 'adjective', 'verb']
//                   },
//                   content: { type: 'string' },
//                   // singular: { type: 'string' },
//                   // plural: { type: 'string' },
//                   natural_translation: { type: 'string' }
//                 },
//                 required: ['type', 'content', 'natural_translation']
//               }
//             }
//           },
//           required: ['difficultyLevel', 'data']
//         }
//       }
//     }), 55000);

//     const analysis = JSON.parse(response.text);
//     const newArchive = await createArchive(userId, language, date, analysis, content);
//   } catch (error) {
//     console.error('Error communicating with Gemini API:', error);
//     return error;
//   }
// }

const compileDailyTextAsHtml = async (archive) => {
  let html = '';
  const content = archive[0].content;
  const analysed = archive[0].analysis.data;
  const terms = analysed.map(item => item.content);
  const wordRanges = getTermPositionsInStr(content, terms)

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const matchingIndex = wordRanges.find(word => word.start == i)

    // return single char and jump to next iteration
    if (!matchingIndex) {
      html += `<span>${char}</span>`;
      continue;
    }

    // returns entire formatted word and jumps iterations
    const matchingAnalysed = analysed.find(item => item.content === matchingIndex.term);
    const range = matchingAnalysed.content.length - 1;

    html += `<span id="${i}" class="${matchingAnalysed.type}" data-analysis='${JSON.stringify(matchingAnalysed)}'>${matchingAnalysed.content}</span>`

    i += range;
  }

  return html;
}

module.exports = { createArchive, getArchive, getDailyText, analyseDailyText, compileDailyTextAsHtml };