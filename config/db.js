const mongoose = require("mongoose");

let cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = cached;
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.conn) {
        const opts = {
            bufferCommands: false,
            useNewUrlParser: true,
            useColors: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 20,
        };

        cached.conn = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => mongoose);
    }

    cached.conn = await cached.conn;
    return cached.conn;
}

module.exports = dbConnect;