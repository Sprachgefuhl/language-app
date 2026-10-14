const express = require('express');
const router = express.Router();
const { loginUser, logoutUser } = require('../controllers/auth');
const { authenticateToken, isNotAlreadyAuthenticated } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => res.redirect('/home'));
router.get('/login', isNotAlreadyAuthenticated, (req, res) => { res.render('auth/login') });
router.post('/login/auth', loginUser);
router.delete('/logout', logoutUser);

module.exports = router;