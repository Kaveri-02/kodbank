const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    try {
        // Read JWT from cookie
        const token = req.cookies?.kodbank_token;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        }

        // Verify and decode the JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { sub: username, role: role, iat, exp }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
        }
        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
};

module.exports = authMiddleware;
