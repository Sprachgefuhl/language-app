const express = require('express');
const router = express.Router();
const { loginUser, logoutUser } = require('../controllers/auth');
const { authenticateToken, isNotAlreadyAuthenticated } = require('../middleware/auth');
const { deleteCard } = require('../controllers/decks');

router.get('/', authenticateToken, async (req, res) => res.redirect('/text'));
router.get('/login', isNotAlreadyAuthenticated, (req, res) => { res.render('auth/login') });
router.post('/login/auth', loginUser);
router.delete('/logout', logoutUser);
router.delete('/card/delete/:cardId', deleteCard);

module.exports = router;