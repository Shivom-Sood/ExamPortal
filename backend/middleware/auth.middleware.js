const jwt = require('jsonwebtoken');

// checks the access token sent as: Authorization: Bearer <token>
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token, please login' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // throws an error if fake or expired (error middleware sends 401)
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = decoded; // { id, role } - now every controller knows who is logged in
        next();
    } catch (error) {
        next(error);
    }
}

// only admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only admin can do this' });
    }
    next();
}

// teacher (admin is also allowed)
const isTeacher = (req, res, next) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only teachers can do this' });
    }
    next();
}

// only student
const isStudent = (req, res, next) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ success: false, message: 'Only students can do this' });
    }
    next();
}

module.exports = { verifyToken, isAdmin, isTeacher, isStudent };