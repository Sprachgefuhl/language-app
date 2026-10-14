const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { updateProfile } = require('../controllers/profile');
const langData = require('../utils/langData');

router.get('/show', authenticateToken, async (req, res) => res.render('profile/index', { currentUser: req.user }));
router.get('/edit', authenticateToken, async (req, res) => res.render('profile/edit', { currentUser: req.user, langData: langData }));
router.post('/edit', authenticateToken, updateProfile);

module.exports = router;