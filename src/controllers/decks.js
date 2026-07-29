const supabase = require('../config/postgres');
const { getUserByID } = require('./user');
const { generateToken } = require('../utils/func');

const createDeck = async (req, res) => {
  let { name } = req.body;
  const user = await getUserByID(req.currentUserId);

  if (!name.length) return res.status(400).json({ msg: 'Name field required' });

  const { data, err } = await supabase
    .from('decks')
    .insert({
      name: name,
      cards: [],
      user_id: user.id,
    })
    .select()

  if (err) console.log(err.message);
  res.status(200).json({ msg: 'Successfully created deck' });
}

const getDeck = async (deckId) => {
  const { data, err } = await supabase
    .from('decks')
    .select('*')
    .eq('id', deckId)
    .single()

  if (err) console.log(err.message);
  return data;
}

const getUserDecks = async (userId) => {
  const { data, err } = await supabase
    .from('decks')
    .select('*')
    .eq('user_id', userId)

  if (err) console.log(err.message);
  return data;
}

const countDueCardsPerDeck = async (decks) => {
  let dueCardsPerDecks = [];
  for (const deck of decks) {
    const cardsDue = await getDueCards(deck.cards);
    dueCardsPerDecks.push({
      deckId: deck.id,
      totalCardsDue: cardsDue.length
    });
  };
  return dueCardsPerDecks;
}

// CARDS
const createCard = async (req, res) => {
  const user = await getUserByID(req.currentUserId);
  const deckId = parseInt(req.params.id);
  const deck = await getDeck(deckId);

  deck.cards.push({
    id: generateToken(),
    due: generateNewDueDate(0),
    back: req.body.back,
    front: req.body.front,
    easiness: 2.5,
    interval: 0,
    successes: 0
  });

  const { error } = await supabase
    .from('decks')
    .update({ cards: deck.cards })
    .eq('id', deckId)

  if (error) throw new Error(error.message);

  res.status(200).json({ msg: 'created' });
}

const getDueCards = async (cards) => {
  if (!cards.length) return [];
  const now = Date.now();
  const due = cards.filter(card => card.due <= now);
  return due;
}

const updateCard = async (userId, deck, newCard) => {
  const updatedCards = deck.cards.map(card => {
    if (card.id === newCard.id) {
      return newCard;
    }

    return card;
  });

  const { error } = await supabase
    .from('decks')
    .update({ cards: updatedCards })
    .eq('id', deck.id)

  if (error) throw new Error(error.message);
}

const handleCardReview = async (req, res) => {
  const { deck, card, success } = req.body;

  if (success) {
    if (card.successes == 0) card.interval = 1;
    else card.interval = Math.round(card.interval * card.easiness);
    card.easiness = Math.min(3.5, card.easiness + 0.2);
    card.successes++;
    card.due = generateNewDueDate(card.interval);
  } else {
    card.successes = 0;
    card.interval = 0;
    card.easiness = Math.max(1.3, card.easiness - 0.35);
    card.due = generateNewDueDate(card.interval);
  }

  await updateCard(req.currentUserId, deck, card);
  res.status(200).json({ msg: 'Card reviewed' });
}

const generateNewDueDate = (interval) => {
  const now = Date.now();
  const intervalMiliseconds = interval * (1000 * 60 * 60 * 24);
  const dueDate = now + intervalMiliseconds;
  if (interval == 0) return now;
  else return dueDate;
}

const getRandomCard = (cards) => {
  return cards[Math.floor(Math.random() * cards.length)];
}

module.exports = { createDeck, getDeck, getUserDecks, countDueCardsPerDeck, createCard, getDueCards, handleCardReview, getRandomCard }