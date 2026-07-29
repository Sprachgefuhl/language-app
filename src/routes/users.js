const express = require('express');
const router = express.Router();
const { authenticateToken, isNotAlreadyAuthenticated } = require('../middleware/auth');
const { denyUserAccess } = require('../middleware/roles');
const { getUserByID, getAllUsers, createUser } = require('../controllers/user');

router.get('/', authenticateToken, denyUserAccess, async (req, res) => {
  res.render('users/index', { currentUser: await getUserByID(req.currentUserId), users: await getAllUsers() });
});

router.get('/create', authenticateToken, denyUserAccess, async (req, res) => {
  res.render('users/create', { currentUser: await getUserByID(req.currentUserId) });
});
router.post('/create', createUser);

module.exports = router;