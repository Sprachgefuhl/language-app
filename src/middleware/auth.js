const { verifyAccessToken } = require("../utils/jwt");

const authenticateToken = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    const result = verifyAccessToken(token);

    if (result.success) {
      req.currentUserId = result.data.id;
      return next();
    }
  }

  res.redirect('/login');
}

const isNotAlreadyAuthenticated = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) return res.redirect('/');
  next();
}

module.exports = { authenticateToken, isNotAlreadyAuthenticated }