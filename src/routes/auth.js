const express = require('express');
const router = express.Router();
const { loginUser, logoutUser } = require('../controllers/auth');
const { getUserByID } = require('../controllers/user');
const { authenticateToken, isNotAlreadyAuthenticated } = require('../middleware/auth');
const { denyUserAccess } = require('../middleware/roles');

router.get('/', authenticateToken, async (req, res) => res.redirect('/text'));
router.get('/login', isNotAlreadyAuthenticated, (req, res) => { res.render('auth/login') });
router.post('/login/auth', loginUser);
router.delete('/logout', logoutUser);

module.exports = router;