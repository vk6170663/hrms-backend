const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const dbUri = process.env.DATABASE.replace('<PASSWORD>', encodeURIComponent(process.env.DATABASE_PASSWORD));
        await mongoose.connect(dbUri, {
            serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
            bufferCommands: false, // Disable buffering if connection is guaranteed
        });
        console.log('DB connection successful!');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err; // Re-throw to be caught by startServer
    }
};

module.exports = connectDB;