const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  const payload = {
    id: user.id,
  };

  const secret = process.env.JWT_SECRET;
  const options = { expiresIn: '1d' };

  return jwt.sign(payload, secret, options);
}

const verifyAccessToken = (token) => {
  const secret = process.env.JWT_SECRET;

  try {
    const decoded = jwt.verify(token, secret);
    return { success: true, data: decoded };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { generateAccessToken, verifyAccessToken }