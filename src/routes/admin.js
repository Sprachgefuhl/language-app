const express = require('express');
const router = express.Router();
const { authenticateToken, isNotAlreadyAuthenticated } = require('../middleware/auth');
const { denyUserAccess } = require('../middleware/roles');
const { getUserByID, getAllUsers, createUser } = require('../controllers/user');

router.get('/users', authenticateToken, denyUserAccess, async (req, res) => {
  res.render('admin/users', { currentUser: await getUserByID(req.currentUserId), users: await getAllUsers() });
});

router.get('/users/new', authenticateToken, denyUserAccess, async (req, res) => {
  res.render('admin/newUser', { currentUser: await getUserByID(req.currentUserId) });
});
router.post('/users/new', createUser);

module.exports = router;