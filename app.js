const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const AppError = require('./middleware/appError');
const authRouter = require('./routes/authRoutes');
const candidateRouter = require('./routes/candidateRoutes');
const employeeRouter = require('./routes/employeesRoutes');
const attendanceRouter = require('./routes/attendanceRoutes');
const leaveRouter = require('./routes/leavesRoutes');

const app = express();

app.set('views', path.join(__dirname, 'views'));

const corsOptions = {
    origin: [process.env.CLIENT_URL || 'https://psqr.vercel.app', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Security headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rate limiting
// const limiter = rateLimit({
//     max: 100,
//     windowMs: 60 * 60 * 1000,
//     message: 'Too many requests from this IP, please try again in an hour!',
// });
// app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to HRMS API' });
});

app.use(mongoSanitize());
app.use(xss());

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/candidates', candidateRouter);
app.use('/api/v1/employees', employeeRouter);
app.use('/api/v1/attendance', attendanceRouter);
app.use('/api/v1/leaves', leaveRouter);

// Handle 404
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling
app.use(require('./middleware/error'));

module.exports = app;