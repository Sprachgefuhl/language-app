const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getUsersDecks, getDeck, createDeck } = require('../controllers/decks');
const { getUsersCards, filterDueCards, countDueCardsPerDeck, handleCardReview, getRandomCard, createCard, handleCardEdit, getNativeAudio, getCardsByDeck } = require('../controllers/cards');
const langData = require('../utils/langData');

router.get('/', authenticateToken, async (req, res) => {
  const decks = await getUsersDecks(req.currentUserId);
  const cards = await getUsersCards(req.currentUserId);
  const dueCards = filterDueCards(cards);
  const dueCardsPerDeck = countDueCardsPerDeck(decks, dueCards);
  
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
// router.delete('/card/delete/:cardId', deleteCard);
router.get('/review/:id', authenticateToken, async (req, res) => {
  const deck = await getDeck(req.params.id);
  const cards = await getCardsByDeck(req.currentUserId, req.params.id);
  const dueCards = filterDueCards(cards);
  const randomCard = getRandomCard(dueCards);

  res.render('decks/review', { currentUser: req.user, deck, card: randomCard, totalDue: dueCards.length });
});
router.post('/review/:cardId', authenticateToken, handleCardReview);


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