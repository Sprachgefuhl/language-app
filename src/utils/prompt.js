const compilePrompt = (chunk, language, dailyText) => {
  return `Keeping in mind the context of this ${language} paragraph: ${dailyText}
  
    What would "${chunk}" naturally translate to in English?
    
    - in the JSON response, "translation" should be the translation
    - "chunk" should be the exact part of the paragraph the translation is referencing
  `;
}

module.exports = { compilePrompt };