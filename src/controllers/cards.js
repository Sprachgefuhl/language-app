const supabase = require('../config/postgres');
const { shuffleArray } = require('../utils/func');

const createCard = async (req, res) => {
  const deckId = parseInt(req.params.id);
  const { front, back, audio } = req.body;

  // empty fields
  if (!front.length || !back.length) return res.status(400).json({ msg: 'Empty fields' });

  const { err } = await supabase
    .from('cards')
    .insert({
      front: front,
      back: back,
      audio: audio,
      easiness: 2.5,
      interval: 0,
      successes: 0,
      due: generateNewDueDate(0),
      state: 'new',
      deck_id: deckId,
      user_id: req.user.id,
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

const getDueCardsByDeck = async (userId, deckId) => {
  const now = Date.now();

  const { data, error } = await supabase
    .from('cards')
    .select('id, due, state, front, back, audio, easiness, interval, successes')
    .eq('user_id', userId)
    .eq('deck_id', deckId)
    .lte('due', now);

  if (error) {
    console.error(error.message);
    return [];
  }

  return data || [];
}

const updateCard = async (cardId, updates = {}) => {
  const { error } = await supabase
    .from('cards')
    .update(updates)
    .eq('id', cardId)

  if (error) throw error;
}

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
}

const getRandomCard = (cards) => {
  return cards[Math.floor(Math.random() * cards.length)];
}

const handleCardReview = async (req, res) => {
  const { card, success } = req.body;

  if (success) {
    if (card.state === 'new') {
      card.interval = 0.5;
      console.log(card.interval);
      card.state = 'learning';
    } else if (card.successes === 0) {
      card.interval = 1;
    } else {
      card.interval = Math.round(card.interval * card.easiness);
    }

    card.easiness = Math.min(3.5, card.easiness + 0.15);
    card.successes++;

    const canGraduate = (card.state === 'learning' || card.state === 'relearning');
    if (canGraduate && card.successes >= 3 && card.interval >= 21) {
      card.state = 'mature';
    }
  } else {
    card.successes = 0;

    if (card.state === 'mature') {
      card.state = 'relearning';
      card.interval = 1;
      card.easiness = Math.max(1.3, card.easiness - 0.2);
    } else {
      card.state = 'learning';
      card.interval = 0;
    }
  }

  card.interval = Math.min(180, card.interval);
  card.due = generateNewDueDate(card.interval);

  await updateCard(card.id, {
    due: card.due,
    state: card.state,
    easiness: card.easiness,
    interval: card.interval,
    successes: card.successes,
  });

  res.status(200).json({ msg: 'Card reviewed' });
}

const generateNewDueDate = (interval) => {
  const now = Date.now();
  const intervalMiliseconds = interval * (1000 * 60 * 60 * 24);
  const dueDate = now + intervalMiliseconds;
  if (interval === 0) return now;
  else return dueDate;
}

const getNextCard = (dueCards) => {
  const intraSession = dueCards.filter(c => 
    (c.state === 'learning' || c.state === 'relearning') && 
    c.interval === 0
  );
  const dueRelearning = dueCards.filter(c => 
    c.state === 'relearning' && 
    c.interval > 0
  );
  const dueLearning = dueCards.filter(c => c.state === 'learning' && c.interval > 0);
  const dueMature = dueCards.filter(c => c.state === 'mature');
  const newCards = dueCards.filter(c => c.state === 'new');

  let nextCard = null;
  if (intraSession.length) nextCard = shuffleArray(intraSession)[0];
  if (dueRelearning.length) nextCard = shuffleArray(dueRelearning)[0];
  if (dueLearning.length) nextCard = shuffleArray(dueLearning)[0];
  if (dueMature.length) nextCard = shuffleArray(dueMature)[0];
  if (newCards.length) nextCard = shuffleArray(newCards)[0];

  return nextCard;
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
  const chunk = req.body.back;
  const langCode = req.body.langCode;
  if (!chunk.length) return res.status(400).json({ msg: `'Back' field empty` });
  let url = `https://apifree.forvo.com/action/word-pronunciations/format/json/word/${chunk}/language/${langCode}/order/rate-desc/key/${process.env.FORVO_KEY}/`;
  if (langCode == 'pt') url += 'country/BRA';

  const result = await fetch(url);
  const data = await result.json();
  if (!data.items.length) return res.status(404).json({ msg: 'No audio found' });

  const audio = data.items[0].pathmp3;
  res.status(200).json({ msg: 'Audio found', audio: audio });
}

module.exports = { createCard, getUsersCards, getDueCardsByDeck, countDueCardsPerDeck, getNextCard, filterDueCards, handleCardEdit, handleCardReview, getRandomCard, getNativeAudio }