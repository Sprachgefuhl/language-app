const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getUserByID } = require('../controllers/user');
const { getArchive, analyseDailyText, getDailyText, compileDailyTextAsHtml } = require('../controllers/text');
const { standardizeDate, timeoutAsyncFunc } = require('../utils/func');
const langData = require('../utils/langData');

router.get('/', authenticateToken, async (req, res) => {
  const user = await getUserByID(req.currentUserId);
  const date = req.query.date ? new Date(req.query.date) : new Date();
  const dateOfText = standardizeDate(date);

  // check if today's archive already exists in language 
  const archive = await getArchive(user.id, user.current_language, dateOfText);
  if (archive.length) {
    // create the html from archive
    const compiledDailyText = await compileDailyTextAsHtml(archive);

    // display archive
    res.render('text/index', { currentUser: user, date: dateOfText, compiledDailyText: compiledDailyText });
  } else res.render('text/new', { currentUser: user, date: dateOfText });
});

router.post('/analyse', authenticateToken, async (req, res) => {
  try {
    const user = await getUserByID(req.currentUserId);
    const dateQuery = standardizeDate(req.body.date);
    const dailyText = await getDailyText(user.current_language, dateQuery);
    if (!dailyText) return res.status(404).json({ msg: 'Daily text not found' });

    const analysis = await analyseDailyText(user.id, user.current_language, dateQuery, dailyText);
    if (analysis == 'Error: Timeout') return res.status(504).json({ msg: 'Request timed out. Please try again' });

    res.status(200).json({ msg: 'Successfully analysed' });
  } catch (error) {
    console.log('Error analysing daily text', error);
  }
});

module.exports = router;