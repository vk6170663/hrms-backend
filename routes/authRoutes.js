const express = require('express');
const { login, register, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' } });

const router = express.Router();

router.post('/login', csrfProtection, login);
router.post('/register', csrfProtection, register);
router.post('/logout', csrfProtection, logout);
router.get('/me', protect, getMe);

module.exports = router;