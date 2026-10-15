const supabase = require('../config/postgres');

const createCard = async (req, res) => {
  const deckId = parseInt(req.params.id);
  const front = req.body.front;
  const back = req.body.back;

  // empty fields
  if (!front.length || !back.length) return res.status(400).json({ msg: 'Empty fields' });

  const { err } = await supabase
    .from('cards')
    .insert({
      due: generateNewDueDate(0),
      front: front,
      back: back,
      easiness: 2.5,
      interval: 0,
      successes: 0,
      deck_id: deckId,
      user_id: req.currentUserId,
    });

  if (err) console.log(err.message);
  res.status(200).json({ msg: 'Card created' });
}

const getUsersCards = async (userId) => {
  const { data, err } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', userId)

  if (err) console.log(err.message);
  return data;
}

const getCardsByDeck = async (userId, deckId) => {
  const { data, err } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', userId)
    .eq('deck_id', deckId)

  if (err) console.log(err.message);
  return data;
}

const updateCard = async (cardId, updatedCard) => {
  const { error } = await supabase
    .from('cards')
    .update(updatedCard)
    .eq('id', cardId)

  if (error) throw error;
};

const filterDueCards = (cards) => {
  const now = Date.now();
  const due = cards.filter(card => card.due <= now);
  return due;
}

const countDueCardsPerDeck = (decks, dueCards) => {
  const counts = {};

  for (const card of dueCards) {
    counts[card.deck_id] = (counts[card.deck_id] || 0) + 1;
  }

  return decks.map(deck => ({
    deckId: deck.id,
    count: counts[deck.id] || 0
  }));
};

const getRandomCard = (cards) => {
  return cards[Math.floor(Math.random() * cards.length)];
}

const handleCardReview = async (req, res) => {
  const { card, success } = req.body;
  const cardId = card.id;

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

  delete card.created_at;
  delete card.id;
  delete card.deck_id;
  delete card.user_id;

  await updateCard(cardId, card);
  res.status(200).json({ msg: 'Card reviewed' });
}

const generateNewDueDate = (interval) => {
  const now = Date.now();
  const intervalMiliseconds = interval * (1000 * 60 * 60 * 24);
  const dueDate = now + intervalMiliseconds;
  if (interval == 0) return now;
  else return dueDate;
}

const handleCardEdit = async (req, res) => {
  const { front, back } = req.body;
  const deck = await getDeck (req.params.deckId);
  const card = deck.cards.filter(card => card.id === req.params.cardId);
  card[0].front = front;
  card[0].back = back;

  await updateCard(deck, card[0]);
  res.status(200).json({ msg: 'Card updated' });
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

module.exports = { createCard, getUsersCards, getCardsByDeck, countDueCardsPerDeck, filterDueCards, handleCardEdit, handleCardReview, getRandomCard, getNativeAudio }