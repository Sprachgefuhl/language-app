const supabase = require('../config/postgres');
const genai = require('@google/genai').GoogleGenAI;
const ai = new genai({});
const cheerio = require('cheerio');
const { compilePrompt } = require('../utils/prompt');
const { standardizeDate, timeoutPromise } = require('../utils/func');
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

// const getDailyText = async (language, date) => {
//   if (!language) return null;
//   const scraperUrl = langData.find(lang => lang.name === language).scraperUrl;
//   const url = `${scraperUrl}${date}`;
//   const data = await fetch(url).then(res => res.text());

//   const $ = cheerio.load(data);
//   const text = $('.bodyTxt').text();
//   const textCleaned = text.split(/\r?\n\s*\r?\n/)[1];
//   const cleaned = textCleaned.replace(/\u00A0/g, ' ');

//   return cleaned;
// }

const getDailyText = async (language, date) => {
  if (!language) return null;

  const lang = langData.find(l => l.name === language);
  if (!lang) {
    console.error('Language not found:', language);
    return null;
  }

  const url = `${lang.scraperUrl}${date}`;
  console.log('Fetching:', url);

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  console.log('Status:', res.status);
  const data = await res.text();
  console.log('HTML length:', data.length);
  console.log('First 500 chars:', data.slice(0, 500));

  const $ = cheerio.load(data);
  const text = $('.bodyTxt').text();
  console.log('bodyTxt length:', text.length);

  // ...
};

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

const translateChunk = async (chunk, language, dailyText) => {
  const prompt = compilePrompt(chunk, language, dailyText);
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
            chunk: { type: 'string' },
            translation: { type: 'string' }
          },
          required: ['chunk', 'translation']
        }
      }
    }), 15000);

    const translation = JSON.parse(response.text);
    // const newArchive = await createArchive(userId, language, date, analysis, content);
    return translation;
  } catch (error) {
    console.error('Error communicating with Gemini API:', error);
    return error;
  }
}

module.exports = { createArchive, getArchive, getDailyText, translateChunk };