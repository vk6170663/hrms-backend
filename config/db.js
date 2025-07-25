const mongoose = require('mongoose');

let cachedDb = null;

const connectDB = async () => {
    if (cachedDb) {
        return cachedDb;
    }

    try {
        const dbUri = process.env.DATABASE.replace('<PASSWORD>', encodeURIComponent(process.env.DATABASE_PASSWORD));
        cachedDb = await mongoose.connect(dbUri, {
            serverSelectionTimeoutMS: 30000,
            bufferCommands: false, // Requires connection to be ready
            autoIndex: false, // Optional: Disable auto-indexing for performance
        });
        console.log('DB connection successful!');
        return cachedDb;
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
};

module.exports = connectDB;