const supabase = require('../config/postgres');
const { createArchive, getArchive, getDailyText } = require('./text');
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

      const content = await getDailyText(lang.name, dateOfText);
      const archive = await getArchive(lang.name, dateOfText);
      if (archive.length) continue;
      const newArchive = await createArchive(lang.name, dateOfText, content);
      console.log(`Archive created: ${lang.name} ${dateOfText}`);
    }
  }

  console.log('Finished');
}

module.exports = { updateDailyTextArchives }