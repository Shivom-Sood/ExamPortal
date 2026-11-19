const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/user.model.js');

// short-life token sent with every request
const createAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
}

// long-life token used only to get a new access token
const createRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
}

// Register a new user (always as student)
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body || {};

        // check length here because after hashing the password is always long
        if (!password || password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        // hash the password before saving (10 salt rounds)
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name,
            email: email,
            password: hashedPassword
        });

        res.status(201).json({
            success: true,
            message: 'Registered successfully',
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        next(error);
    }
}

// Login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // compare typed password with the hashed one in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);

        // save refresh token in DB so we can cancel it on logout
        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            success: true,
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        next(error);
    }
}

// Get a new access token using the refresh token
const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body || {};

        if (!refreshToken) {
            return res.status(401).json({ success: false, message: 'Refresh token is required' });
        }

        // throws an error if fake or expired (error middleware sends 401)
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // token must match the one saved in DB (not logged out)
        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ success: false, message: 'Refresh token is not valid' });
        }

        const accessToken = createAccessToken(user);
        res.json({ success: true, accessToken: accessToken });
    } catch (error) {
        next(error);
    }
}

// Logout - remove refresh token from DB
const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body || {};

        if (!refreshToken) {
            return res.status(400).json({ success: false, message: 'Refresh token is required' });
        }

        const user = await User.findOne({ refreshToken: refreshToken });
        if (user) {
            user.refreshToken = null;
            await user.save();
        }

        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
}

// Get logged in user's details (needs verifyToken)
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password -refreshToken');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user: user });
    } catch (error) {
        next(error);
    }
}

module.exports = { register, login, refresh, logout, getMe };