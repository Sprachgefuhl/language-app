const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getUsersDecks, getDeck, createDeck } = require('../controllers/decks');
const { getUsersCards, filterDueCards, countDueCardsPerDeck, handleCardReview, getRandomCard, createCard, handleCardEdit, getNativeAudio, getDueCardsByDeck, getNextCard } = require('../controllers/cards');
const langData = require('../utils/langData');

router.get('/', authenticateToken, async (req, res) => {
  const [decks, cards] = await Promise.all([
    getUsersDecks(req.user.id),
    getUsersCards(req.user.id)
  ]);

  const dueCards = filterDueCards(cards);
  const dueCardsPerDeck = countDueCardsPerDeck(decks, dueCards);
  
  res.render('decks/index', {
    currentUser: req.user,
    decks,
    dueCardsPerDeck,
    langData
  });
})

router.get('/create', authenticateToken, (req, res) => res.render('decks/create', { currentUser: req.user }));
router.post('/create', authenticateToken, createDeck);
router.post('/:id/create-card', authenticateToken, createCard);
// router.delete('/card/delete/:cardId', deleteCard);

router.get('/review/:id', authenticateToken, async (req, res) => {
  const dueCards = await getDueCardsByDeck(req.user.id, req.params.id);
  const nextCard = getNextCard(dueCards);

  res.render('decks/review', {
    currentUser: req.user,
    card: nextCard,
    totalDue: dueCards.length
  });
})

router.post('/review/:cardId', authenticateToken, handleCardReview);

router.get('/show/:id', authenticateToken, async (req, res) => {
  const deck = await getDeck(req.params.id);
  res.render('decks/show', { currentUser: req.user, deck });
})
router.get('/:deckId/card/edit/:cardId', authenticateToken, async (req, res) => {
  const deck = await getDeck(req.params.deckId);
  const card = deck.cards.filter(card => card.id === req.params.cardId);
  res.render('decks/card/edit', { currentUser: req.user, deck, card: card[0] });
})
router.post('/:deckId/card/edit/:cardId', authenticateToken, handleCardEdit);
router.post('/card/native-audio', authenticateToken, getNativeAudio);

module.exports = router;