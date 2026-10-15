const denyUserAccess = async (req, res, next) => {
  if (req.user.role === 'user') return res.status(403).json({ msg: 'Permission denied' });
  next();
}

module.exports = { denyUserAccess }