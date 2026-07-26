const supabase = require('../config/postgres');
const bcrypt = require('bcrypt');
const { getUserByID } = require('./user');

const updateProfile = async (req, res) => {
  let { first, last, password, repeat } = req.body;
  const user = await getUserByID(req.currentUserId);
  const language = user.current_language;

  // validate password
  if (password && password !== repeat || repeat && repeat !== password) return res.status(401).send('Password does not match');
  if (password) password = await bcrypt.hash(password, 12);
  else password = user.password;

  const { data, error } = await supabase
    .from('users')
    .update({
      first: first,
      last: last,
      current_language: language,
      password: password
    })
    .eq('id', user.id)
    .select()

  if (error) throw new Error(error.message);
  console.log(`👤 ${user.first} ${user.last}'s profile has been updated`);

  res.redirect('/profile/show');
}

const updateLanguage = async (req, res) => {
  const language = req.body.language
  const user = await getUserByID(req.currentUserId);

  const { data, error } = await supabase
    .from('users')
    .update({
      current_language: language
    })
    .eq('id', user.id)
    .select()

  if (error) throw new Error(error.message);
  console.log(`👤 ${user.first} ${user.last} has updated language to ${language}`);
  res.status(200).json({ msg: 'Successfully updated language' });
}

module.exports = { updateProfile, updateLanguage }