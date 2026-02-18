// إعداد البيئة للاختبارات
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key';
process.env.SESSION_SECRET = 'test_session_secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/careerak_test';

// تعطيل السجلات أثناء الاختبار
const logger = require('../src/utils/logger');
logger.transports.forEach(transport => {
  transport.silent = true;
});

// إعداد قاعدة البيانات للاختبار
const mongoose = require('mongoose');

beforeAll(async () => {
  // الاتصال بقاعدة بيانات الاختبار
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      });
    } catch (error) {
      console.warn('MongoDB connection failed for tests, using memory database');
    }
  }
}, 30000); // Increased timeout for beforeAll

afterAll(async () => {
  // تنظيف قاعدة البيانات وإغلاق الاتصال
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  }
}, 30000); // Increased timeout for afterAll

beforeEach(async () => {
  // تنظيف البيانات قبل كل اختبار
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});