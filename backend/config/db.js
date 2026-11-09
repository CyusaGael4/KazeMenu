const mongoose = require('mongoose');

let connectionPromise = null;

const getConnectionUri = () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }
  return uri;
};

const connectDB = async () => {
  // Reuse a single pending connection across warm invocations so
  // Vercel serverless functions do not start a fresh connection on every
  // cold start when the runtime is reused.
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(getConnectionUri(), {
      serverSelectionTimeoutMS: 10000,
    }).catch((err) => {
      connectionPromise = null;
      throw err;
    });
  }

  await connectionPromise;
  console.log('MongoDB connected');
  return mongoose.connection;
};

const getDbReady = () => {
  const readyState = mongoose.connection.readyState;
  if (readyState === 1) return Promise.resolve();
  if (readyState === 0) {
    return connectDB();
  }
  // 2 = connecting, 3 = disconnecting; wait for the existing promise.
  if (connectionPromise) return connectionPromise;
  return connectDB();
};

module.exports = { connectDB, getDbReady };
