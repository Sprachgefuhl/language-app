const { getUserByID } = require("../controllers/user");

const denyUserAccess = async (req, res, next) => {
  const user = await getUserByID(req.currentUserId);
  const userRole = user.role;

  if (userRole === 'user') return res.status(403).json({ msg: 'Permission denied' });
  next();
}

module.exports = { denyUserAccess }