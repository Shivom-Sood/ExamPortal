const express = require('express');
const router = express.Router();
const { register, login, refresh, logout, getMe } = require('../controller/auth.controller.js');
const { verifyToken } = require('../middleware/auth.middleware.js');

router.post('/api/auth/register', register);
router.post('/api/auth/login', login);
router.post('/api/auth/refresh', refresh);
router.post('/api/auth/logout', logout);

// protected route - needs a valid access token
router.get('/api/auth/me', verifyToken, getMe);

module.exports = router;