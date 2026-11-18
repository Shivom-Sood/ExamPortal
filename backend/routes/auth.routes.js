const express = require('express');
const router = express.Router();
const { register, login, refresh, logout } = require('../controller/auth.controller.js');

router.post('/api/auth/register', register);
router.post('/api/auth/login', login);
router.post('/api/auth/refresh', refresh);
router.post('/api/auth/logout', logout);

module.exports = router;