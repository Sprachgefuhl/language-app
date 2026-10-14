const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const langData = require('../utils/langData');
const {
  createDeck,
  getUserDecks,
  getDeck,
  countDueCardsPerDeck,
  getDueCards,
  handleCardReview,
  getRandomCard,
  createCard,
  handleCardEdit,
  getNativeAudio,
  deleteCard
} = require('../controllers/decks');

router.get('/', authenticateToken, async (req, res) => {
  const decks = await getUserDecks(req.currentUserId);
  const dueCardsPerDeck = await countDueCardsPerDeck(decks);
  
  res.render('decks/index', {
    currentUser: req.user,
    decks,
    dueCardsPerDeck,
    langData
  });
});
router.get('/create', authenticateToken, (req, res) => res.render('decks/create', { currentUser: req.user }));
router.post('/create', authenticateToken, createDeck);
router.post('/:id/create-card', authenticateToken, createCard);
router.delete('/card/delete/:cardId', deleteCard);
router.get('/review/:id', authenticateToken, async (req, res) => {
  const deck = await getDeck(req.params.id);
  const cardsDue = await getDueCards(deck.cards);
  const randomCard = getRandomCard(cardsDue);

  res.render('decks/review', { currentUser: req.user, deck, card: randomCard, totalDue: cardsDue.length });
});
router.post('/review/:id', authenticateToken, handleCardReview);
router.get('/show/:id', authenticateToken, async (req, res) => {
  const deck = await getDeck(req.params.id);
  res.render('decks/show', { currentUser: req.user, deck });
});
router.get('/:deckId/card/edit/:cardId', authenticateToken, async (req, res) => {
  const deck = await getDeck(req.params.deckId);
  const card = deck.cards.filter(card => card.id === req.params.cardId);
  res.render('decks/card/edit', { currentUser: req.user, deck, card: card[0] });
});
router.post('/:deckId/card/edit/:cardId', authenticateToken, handleCardEdit);
router.post('/card/native-audio', authenticateToken, getNativeAudio);

module.exports = router;