const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const dbUri = process.env.DATABASE.replace('<PASSWORD>', encodeURIComponent(process.env.DATABASE_PASSWORD));
        await mongoose.connect(dbUri, {
            serverSelectionTimeoutMS: 30000,
            bufferCommands: false,
        });
        console.log('DB connection successful!');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        throw err;
    }
};

module.exports = connectDB;