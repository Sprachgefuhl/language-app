const { getUserByID } = require("../controllers/user");
const { verifyAccessToken } = require("../utils/jwt");

const authenticateToken = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.redirect('/login');

  const result = verifyAccessToken(token);
  if (!result.success) return res.redirect('/login');

  const user = await getUserByID(result.data.id);
  if (!user) return res.redirect('/login');

  req.user = user;
  req.currentUserId = user.id;
  next();
};

const isNotAlreadyAuthenticated = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) return res.redirect('/');
  next();
}

module.exports = { authenticateToken, isNotAlreadyAuthenticated }