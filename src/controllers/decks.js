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

const countDueCardsPerDeck = (decks) => {
  let dueCardsPerDecks = [];
  for (const deck of decks) {
    const cardsDue = getDueCards(deck.cards);
    dueCardsPerDecks.push({
      deckId: deck.id,
      totalCardsDue: cardsDue.length
    });
  };
  return dueCardsPerDecks;
}

// CARDS
const createCard = async (req, res) => {
  const deckId = parseInt(req.params.id);
  const deck = await getDeck(deckId);
  const front = req.body.front;
  const back = req.body.back;

  // empty fields
  if (!front.length || !back.length) return res.status(400).json({ msg: 'Empty fields' });

  deck.cards.push({
    id: generateToken(),
    due: generateNewDueDate(0),
    front: front,
    back: back,
    easiness: 2.5,
    interval: 0,
    successes: 0
  });

  const { error } = await supabase
    .from('decks')
    .update({ cards: deck.cards })
    .eq('id', deckId)

  if (error) throw new Error(error.message);

  res.status(200).json({ msg: 'Card created' });
}

const deleteCard = async (req, res) => {
  // const cardId = req.params.cardId;
  // const user = await getUserByID(req.currentUserId);
  // const deckId = parseInt(req.params.id);
  // const deck = await getDeck(deckId);

  // deck.cards.push({
  //   id: generateToken(),
  //   due: generateNewDueDate(0),
  //   back: req.body.back,
  //   front: req.body.front,
  //   easiness: 2.5,
  //   interval: 0,
  //   successes: 0
  // });

  // const { error } = await supabase
  //   .from('decks')
  //   .update({ cards: deck.cards })
  //   .eq('id', deckId)

  // if (error) throw new Error(error.message);

  // res.status(200).json({ msg: 'created' });
}

const getDueCards = (cards) => {
  if (!cards.length) return [];
  const now = Date.now();
  const due = cards.filter(card => card.due <= now);
  return due;
}

const updateCard = async (deckId, updatedCard) => {
  const deck = await getDeck(deckId);
  if (!deck) throw new Error('Deck not found');

  const cards = deck.cards.map(c => c.id === updatedCard.id ? updatedCard : c);

  const { error } = await supabase
    .from('decks')
    .update({ cards })
    .eq('id', deckId);

  if (error) throw error;
};

const handleCardEdit = async (req, res) => {
  const { front, back } = req.body;
  const deck = await getDeck (req.params.deckId);
  const card = deck.cards.filter(card => card.id === req.params.cardId);
  card[0].front = front;
  card[0].back = back;

  await updateCard(deck, card[0]);
  res.status(200).json({ msg: 'Card updated' });
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

  await updateCard(deck, card);
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

const getNativeAudio = async (req, res) => {
  const front = req.body.front;
  const langCode = req.body.langCode;
  if (!front.length) return res.status(400).json({ msg: `'Front' field empty` });

  let url = `https://apifree.forvo.com/action/word-pronunciations/format/json/word/${front}/language/${langCode}/order/rate-desc/key/${process.env.FORVO_KEY}/`;
  if (langCode == 'pt') url += 'country/BRA';
  console.log(url);
  const result = await fetch(url);
  const data = await result.json();
  if (!data.items.length) return res.status(404).json({ msg: 'No audio found' });

  const audio = data.items[0].pathmp3;
  res.status(200).json({ msg: 'Audio found', audio: audio });
}

module.exports = { createDeck, getDeck, getUserDecks, countDueCardsPerDeck, createCard, deleteCard, getDueCards, handleCardEdit, handleCardReview, getRandomCard, getNativeAudio }