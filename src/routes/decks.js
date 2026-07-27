const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getUserByID } = require('../controllers/user');

router.get('/', authenticateToken, async (req, res) => {
  const user = await getUserByID(req.currentUserId);
  const decks = user.decks;
  
  res.render('decks/index', { currentUser: user, decks: decks });
});

router.get('/new', authenticateToken, async (req, res) => res.render('decks/create', { currentUser: await getUserByID(req.currentUserId) }));

module.exports = router;