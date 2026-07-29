const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getUserByID } = require('../controllers/user');
const { updateProfile, updateLanguage } = require('../controllers/profile');
const langData = require('../utils/langData');

router.get('/show', authenticateToken, async (req, res) => res.render('profile/index', { currentUser: await getUserByID(req.currentUserId) }));
router.get('/edit', authenticateToken, async (req, res) => res.render('profile/edit', { currentUser: await getUserByID(req.currentUserId), langData: langData }));
router.post('/edit', authenticateToken, updateProfile);
router.get('/edit/language', authenticateToken, async (req, res) => res.render('profile/edit-lang', { currentUser: await getUserByID(req.currentUserId), langData: langData }));
router.post('/edit/language', authenticateToken, updateLanguage);

module.exports = router;