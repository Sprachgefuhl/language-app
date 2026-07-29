const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getUserByID } = require('../controllers/user');
const { createDeck, getUserDecks, getDeck, countDueCardsPerDeck, getDueCards, handleCardReview, getRandomCard, createCard } = require('../controllers/decks');

router.get('/', authenticateToken, async (req, res) => {
  const user = await getUserByID(req.currentUserId);
  const decks = await getUserDecks(user.id);
  const dueCardsPerDeck = await countDueCardsPerDeck(decks);
  
  res.render('decks/index', { currentUser: user, decks: decks, dueCardsPerDeck: dueCardsPerDeck });
});

router.get('/create', authenticateToken, async (req, res) => res.render('decks/create', { currentUser: await getUserByID(req.currentUserId) }));
router.post('/create', authenticateToken, createDeck);

router.post('/:id/create-card', authenticateToken, createCard);

router.get('/review/:id', authenticateToken, async (req, res) => {
  const user = await getUserByID(req.currentUserId);
  const deck = await getDeck(req.params.id);
  const cardsDue = await getDueCards(deck.cards);
  const randomCard = getRandomCard(cardsDue);

  res.render('decks/review', { currentUser: user, deck: deck, card: randomCard, totalDue: cardsDue.length });
});

router.post('/review/:id', authenticateToken, handleCardReview);

module.exports = router;