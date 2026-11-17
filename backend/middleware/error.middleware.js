// for routes that don't exist
const notFound = (req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
}

// centralized error handler
const errorHandler = (err, req, res, next) => {
    // schema validation errors
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ success: false, message: messages });
    }

    // duplicate value for a unique field (email, one attempt per exam)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue).join(', ');
        return res.status(409).json({ success: false, message: 'Duplicate value for ' + field });
    }

    // wrong type of value (bad id etc.)
    if (err.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid value for ' + err.path });
    }

    // jwt errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired' });
    }

    // errors we throw ourselves with a status code
    if (err.statusCode) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
    }

    console.log(err);
    res.status(500).json({ success: false, message: 'Server error' });
}

module.exports = { notFound, errorHandler };