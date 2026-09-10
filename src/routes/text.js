const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getUserByID } = require('../controllers/user');
const { getArchive, getDateOfText } = require('../controllers/text');
const { getUserDecks } = require('../controllers/decks');
const { standardizeDate } = require('../utils/func');

router.get('/', authenticateToken, async (req, res) => {
  const user = await getUserByID(req.currentUserId);
  const decks = await getUserDecks(req.currentUserId);
  const date = req.query.date ? new Date(req.query.date) : new Date();
  const standardizedDate = standardizeDate(date);
  const targetArchive = await getArchive(user.current_language, standardizedDate);
  const dateOfText = getDateOfText(standardizedDate);

  res.render('text/index', {
    currentUser: user,
    decks: decks,
    date: dateOfText,
    archive: targetArchive.length ? targetArchive : '',
  });
});

module.exports = router;