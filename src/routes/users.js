const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { denyUserAccess } = require('../middleware/roles');
const { getAllUsers, createUser } = require('../controllers/user');

router.get('/', authenticateToken, denyUserAccess, async (req, res) => {
  res.render('users/index', { currentUser: req.user, users: await getAllUsers() });
});

router.get('/create', authenticateToken, denyUserAccess, (req, res) => {
  res.render('users/create', { currentUser: req.user });
});

router.post('/create', createUser);

module.exports = router;