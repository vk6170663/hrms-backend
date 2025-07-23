const jwt = require('jsonwebtoken');
const AppError = require('./appError');

exports.protect = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) return next(new AppError('No token provided', 401));
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return next(new AppError('Invalid or expired token', 401));
    }
};