const supabase = require('../config/postgres');

const createDeck = async (req, res) => {
  let { name } = req.body;
  if (!name.length) return res.status(400).json({ msg: 'Name field required' });

  const { err } = await supabase
    .from('decks')
    .insert({
      name: name,
      user_id: req.currentUserId,
    })
    .select()

  if (err) console.log(err.message);
  res.status(200).json({ msg: 'Deck created' });
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

const getUsersDecks = async (userId) => {
  const { data, err } = await supabase
    .from('decks')
    .select('*')
    .eq('user_id', userId)

  if (err) console.log(err.message);
  return data;
}

module.exports = { createDeck, getDeck, getUsersDecks }