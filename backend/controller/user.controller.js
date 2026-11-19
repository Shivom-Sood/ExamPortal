const User = require('../model/user.model.js');

// Get all users (admin) - optional filter: /api/users?role=teacher
const getUsers = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.role) {
            filter.role = req.query.role;
        }

        const users = await User.find(filter).select('-password -refreshToken').sort('-createdAt');
        res.json({ success: true, count: users.length, users: users });
    } catch (error) {
        next(error);
    }
}

// Change a user's role (admin)
const updateRole = async (req, res, next) => {
    try {
        const { role } = req.body || {};

        if (!['student', 'teacher', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Role must be student, teacher or admin' });
        }

        // admin should not remove their own admin access by mistake
        if (req.params.id === req.user.id) {
            return res.status(400).json({ success: false, message: 'You cannot change your own role' });
        }

        const user = await User.findByIdAndUpdate(req.params.id, { role: role }, {
            returnDocument: 'after',
            runValidators: true
        }).select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'Role updated', user: user });
    } catch (error) {
        next(error);
    }
}

// Delete a user (admin)
const deleteUser = async (req, res, next) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ success: false, message: 'You cannot delete yourself' });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        next(error);
    }
}

module.exports = { getUsers, updateRole, deleteUser };