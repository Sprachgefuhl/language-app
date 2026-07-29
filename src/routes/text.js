const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getUserByID } = require('../controllers/user');
const { getArchive, translateChunk, getDailyText } = require('../controllers/text');
const { getUserDecks } = require('../controllers/decks');
const { standardizeDate, timeoutAsyncFunc, humanizeDate } = require('../utils/func');
const langData = require('../utils/langData');

router.get('/', authenticateToken, async (req, res) => {
  const user = await getUserByID(req.currentUserId);
  const decks = await getUserDecks(req.currentUserId);
  const date = req.query.date ? new Date(req.query.date) : new Date();
  const dateOfText = standardizeDate(date);
  let dailyText = '';

  if (user.current_language) dailyText = await getDailyText(user.current_language, dateOfText);

  console.log(dailyText);

  res.render('text/index', { currentUser: user, decks: decks, date: dateOfText, dailyText: dailyText });
});

router.post('/translate', authenticateToken, async (req, res) => {
  try {
    const user = await getUserByID(req.currentUserId);
    const chunk = req.body.chunk;
    const dailyText = req.body.dailyText;
    // const dailyText = await getDailyText(user.current_language, dateQuery);
    // if (!dailyText) return res.status(404).json({ msg: 'Daily text not found' });

    // const analysis = await analyseDailyText(user.id, user.current_language, dateQuery, dailyText);
    // if (analysis == 'Error: Timeout') return res.status(504).json({ msg: 'Request timed out. Please try again' });

    const translation = await translateChunk(chunk, user.current_language, dailyText);

    res.status(200).json({ translation: translation.translation, msg: 'translated' });
  } catch (error) {
    console.log('Error analysing daily text', error);
  }
});

module.exports = router;