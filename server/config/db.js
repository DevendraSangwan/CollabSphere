const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let memoryServer;

const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected via MONGO_URI');
      return;
    }

    memoryServer = await MongoMemoryServer.create({
      binary: {
        version: '7.0.5'
      }
    });

    const mongoUri = memoryServer.getUri();
    await mongoose.connect(mongoUri, {
      dbName: 'collabsphere'
    });

    console.log('MongoDB connected with in-memory database');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();

  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
