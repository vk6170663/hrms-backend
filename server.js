const dotenv = require('dotenv');
const connectDB = require('./config/db');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const startServer = async () => {
    try {
        await connectDB();
        const port = process.env.PORT || 5000;
        const server = app.listen(port, () => {
            console.log(`App running on port ${port}...`);
        });
    } catch (err) {
        console.error('Server startup error:', err);
        process.exit(1);
    }
};

startServer();

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
        console.log('💥 Process terminated!');
    });
});

module.exports = app;