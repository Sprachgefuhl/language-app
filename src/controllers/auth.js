const bcrypt = require('bcrypt');
const { getUserByEmail } = require('./user');
const { generateAccessToken, verifyAccessToken } = require('../utils/jwt');

const loginUser = async (req, res, next) => {
  const formEmail = req.body.email.toLowerCase().trim();
  const formPassword = req.body.password;

  // missing details
  if (!formEmail || !formPassword) {
    return res.status(400).json({ msg: 'Email and password required' })
  }

  const user = await getUserByEmail(formEmail);

  // no user
  if (!user) {
    return res.status(401).json({ msg: 'Invalid credentials' });
  }

  // password check
  const passMatch = await bcrypt.compare(formPassword, user.password);
  if (passMatch) {
    const token = generateAccessToken(user);
    res.cookie('jwt', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 });
    return res.status(200).json({ msg: 'Successfully logged in' });
  }

  return res.status(401).json({ msg: 'Invalid credentials' });
}

const logoutUser = (req, res, next) => {
  res.clearCookie('jwt');
  res.redirect('/');
}

module.exports = { loginUser, logoutUser }