const supabase = require('../config/postgres');
const bcrypt = require('bcrypt');

const getUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  return data;
}

const getUserByID = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) throw error;
  return data;
}

const createUser = async (req, res) => {
  const { first, last, email } = req.body;
  const user = await getUserByEmail(email.trim().toLowerCase());

  if (user) return res.status(400).send({ msg: 'Email already exists' });
  else {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        first: first,
        last: last,
        current_language: null,
        email: email.trim().toLowerCase(),
        password: await bcrypt.hash('123', 12),
        role: 'user'
      }])
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    console.log(`👤 New user: ${data.first} ${data.last}`);
  }

  res.redirect('/admin/users');
}

const deleteUser = async () => {
  const { data, error } = await supabase
    .from('subscribers')
    .delete('*')
    .eq('unsubscribe_token', token)
    .select('*')
    .maybeSingle();

  if (error) throw new Error(error.message);
  console.log(`🥹 ${data.email} has unsubscribed`);
  // await sendEmail({
  //   to: process.env.ADMIN_EMAIL,
  //   subject: 'Admin Event',
  //   template: 'unsubscribed',
  //   htmlData: {
  //     email: data.email
  //   }
  // });
  // return data;
}

module.exports = { getUserByEmail, getUserByID, getAllUsers, createUser, deleteUser };