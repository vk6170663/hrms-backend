const mongoose = require('mongoose');

let cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = cached;
}

async function dbConnect() {
    if (cached.conn) {
        console.log('Using cached MongoDB connection');
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
            maxPoolSize: 10,
            autoIndex: false,
        };

        const dbUri = process.env.MONGODB_URI ||
            (process.env.DATABASE && process.env.DATABASE_PASSWORD
                ? process.env.DATABASE.replace('<PASSWORD>', encodeURIComponent(process.env.DATABASE_PASSWORD))
                : undefined);

        if (!dbUri) {
            throw new Error('Missing MONGODB_URI or DATABASE/DATABASE_PASSWORD in config.env');
        }

        cached.promise = mongoose.connect(dbUri, opts).then((mongoose) => {
            console.log('MongoDB connection established');
            return mongoose;
        }).catch((err) => {
            console.error('MongoDB connection failed:', err.message);
            throw err;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

module.exports = dbConnect;