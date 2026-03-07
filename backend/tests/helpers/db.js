/**
 * Database Helper for Tests
 * Provides utilities for connecting to test database
 */

const mongoose = require('mongoose');

/**
 * Connect to test database
 */
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    const mongoUri = process.env.MONGODB_URI_TEST || 
                     process.env.MONGODB_URI || 
                     'mongodb://localhost:27017/careerak_test';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }
};

/**
 * Disconnect from test database
 */
const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};

/**
 * Clear all collections in test database
 */
const clearDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  clearDatabase
};
