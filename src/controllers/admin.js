const { createArchive, getArchive, getDailyText, getAlignments } = require('./text');
const { standardizeDate } = require('../utils/func');
const langData = require('../utils/langData');

const updateDailyTextArchives = async ({ future, depth }) => {
  for (let i = 0; i < depth; i++) {
    let today = new Date();
    if (future) today.setDate(today.getDate() + i);
    else today.setDate(today.getDate() - i);

    const dateOfText = standardizeDate(today);
    
    for (const lang of langData) {
      // if (lang.name !== 'Spanish' && lang.name !== 'Portuguese') continue;
      // if (lang.name !== 'Spanish') continue;

      const archive = await getArchive(lang.name, dateOfText);
      if (archive.length) continue;

      const text = await getDailyText(lang.name, dateOfText);
      const alignments = await getAlignments(text);

      const newArchive = await createArchive(lang.name, dateOfText, text, alignments);
      console.log(`Archive created: ${lang.name} ${dateOfText}`);
    }
  }

  console.log('Finished');
}

module.exports = { updateDailyTextArchives }