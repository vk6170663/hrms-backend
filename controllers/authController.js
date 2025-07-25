const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const AppError = require('../middleware/appError');
const dbConnect = require('../config/db');

exports.login = async (req, res, next) => {
    await dbConnect();
    const { email, password } = req.body;
    if (!email || !password) return next(new AppError('Email and password are required', 400));

    try {
        const user = await User.findOne({ email }).select('+password');
        console.log('User from DB:', user);

        if (!user || !(await user.correctPassword(password, user.password))) {
            console.log('Provided password:', password, 'Stored hash:', user.password);
            return next(new AppError('Invalid credentials', 401));
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 2 * 60 * 60 * 1000,
        });
        res.json({ user: { id: user._id, email: user.email, role: user.role, token } });
    } catch (error) {
        next(error);
    }
};

exports.register = async (req, res, next) => {
    await dbConnect();
    const { email, password, passwordConfirm, role } = req.body;

    // Validate required fields
    if (!email || !password || !passwordConfirm) {
        return next(new AppError('Email, password, and confirm password are required', 400));
    }

    // Validate password match
    if (password !== passwordConfirm) {
        return next(new AppError('Passwords do not match', 400));
    }

    try {
        const user = new User({ email, password, passwordConfirm, role });
        await user.save();

        // Remove sensitive data from response if needed
        user.password = undefined;
        user.passwordConfirm = undefined;

        res.status(201).json({ message: 'User registered', user: { id: user._id, email: user.email, role: user.role } });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return next(new AppError(messages.join(' '), 400));
        } else if (error.code === 11000) { // Duplicate key error (e.g., email)
            return next(new AppError('Email already exists', 400));
        }
        next(new AppError('Server error', 500));
    }
};

exports.logout = async (req, res, next) => {
    await dbConnect();
    try {
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        next(new AppError('Error logging out', 500));
    }
};

exports.getMe = async (req, res, next) => {
    await dbConnect();
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return next(new AppError('User not found', 404));
        }
        res.json({ user: { id: user._id, email: user.email, role: user.role } });
    } catch (error) {
        next(new AppError('Error fetching user', 500));
    }
};