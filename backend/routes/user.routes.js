const express = require('express');
const router = express.Router();
const { getUsers, updateRole, deleteUser } = require('../controller/user.controller.js');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware.js');

// RBAC routes - logged in AND admin
router.get('/api/users', verifyToken, isAdmin, getUsers);
router.patch('/api/users/:id/role', verifyToken, isAdmin, updateRole);
router.delete('/api/users/:id', verifyToken, isAdmin, deleteUser);

module.exports = router;