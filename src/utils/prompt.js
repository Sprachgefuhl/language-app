// const compilePrompt = (language, text) => {
//   return `Analyze the following ${language} paragraph.

// Your task:
// - Extract nouns
// - Extract adjectives
// - Extract verbs
// - Translate all words into a natural translation for someone learning ${language}

// Rules:
// - "word" should include the word extracted from the text. It must be clean (no surrounding punctuation or extra whitespace).
// - "type" should be 1 of the 3 types (noun, adjective, verb)
// - If there are multiple conjugations of 1 verb, make sure to extract all of them as their own unique "verb"
// - "natural_translation" should be the natural ${language} translation of the content.
// - "difficultyLevel" is a number between 0.0 and 1.0 representing the overall difficulty of the paragraph.
// - Return ONLY valid JSON. No explanations, no markdown, no extra text.

// MAKE SURE you have found all of the nouns, adjectives and verbs before returning output.

// Here is the paragraph:
// ${text}`
// }

// module.exports = { compilePrompt };

const compilePrompt = (language, text) => {
  return `I am trying to learn ${language}.
- Break this ${language} paragraph down into general, approximately 1-3 word chunks that would benefit a languager learning.
- The chunks shouldn't be so specific that they could only be used in a very particular situation. They should be general, reusable patterns that can be applied in lots of situations. For example if a chunk includes a noun, it would make sense to exclude that noun from the chunk, as that would make it too specific of a pattern to learn.
- Output the chunk into "content", along with its natural meaning into "translation".
- Extract every single unique noun in the paragraph.
- Output the noun into "content", along with its natural meaning into "translation".
- "type" should be 1 of the 2 types (chunk, noun)
- "difficultyLevel" is a number between 0.0 and 1.0 representing the overall difficulty of the entire paragraph.
- Return ONLY valid JSON. No explanations, no markdown, no extra text or whitespace.

MAKE SURE you have found all of the nouns before returning output.

${text}`
}

module.exports = { compilePrompt };