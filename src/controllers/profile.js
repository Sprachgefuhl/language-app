const supabase = require('../config/postgres');
const bcrypt = require('bcrypt');
const { getUserByID } = require('./user');

const updateProfile = async (req, res) => {
  let { first, last, password, repeat } = req.body;
  const user = await getUserByID(req.currentUserId);

  // validate name not empty
  if (!first.length || !last.length) return res.status(400).json({ msg: 'Missing required fields' });

  // validate password
  if (password !== repeat) return res.status(401).json({ msg: 'Password does not match' });
  if (password) password = await bcrypt.hash(password, 12);
  else password = user.password;

  const { data, error } = await supabase
    .from('users')
    .update({
      first: first,
      last: last,
      password: password
    })
    .eq('id', user.id)
    .select()

  if (error) throw new Error(error.message);
  console.log(`👤 ${user.first} ${user.last}'s profile has been updated`);
  res.status(200).json({ msg: 'Profile updated' });
}

module.exports = { updateProfile }