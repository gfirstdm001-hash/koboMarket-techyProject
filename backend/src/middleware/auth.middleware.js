const JWT = require('jsonwebtoken');
const User = require('../models/mongo/user.models');

const authenticateUser = async (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Bearer authorization is required' });
    }

    const token = authorization.slice('Bearer '.length).trim();
    if (!token) {
        return res.status(401).json({ message: 'Token is required' });
    }

    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not configured');
        return res.status(500).json({ message: 'Authentication is not configured' });
    }

    try {
        const decodedToken = JWT.verify(token, process.env.JWT_SECRET);
        if (decodedToken.type !== 'access' || !decodedToken.id) {
            return res.status(401).json({ message: 'Invalid access token' });
        }

        const authenticatedUser = await User.findById(decodedToken.id).select('_id email roles');
        if (!authenticatedUser) {
            return res.status(401).json({ message: 'Invalid access token' });
        }

        req.user = authenticatedUser;
        return next();
    } catch (error) {
        if (['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(error.name)) {
            return res.status(401).json({ message: 'Invalid or expired access token' });
        }

        console.error('Authentication failed:', error);
        return res.status(500).json({ message: 'Authentication failed' });
    }
};

module.exports = authenticateUser;