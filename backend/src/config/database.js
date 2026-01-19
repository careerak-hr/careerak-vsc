const mongoose = require('mongoose');

// ✅ منع إعادة الاتصال المتكرر في بيئة Vercel
let cachedDb = null;

const connectDB = async () => {
  if (cachedDb) {
    console.log("Using existing MongoDB connection");
    return cachedDb;
  }

  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      dbName: 'careerak_db'
    };

    console.log("Connecting to MongoDB Atlas...");
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    cachedDb = conn;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // في Vercel لا نريد قتل العملية بل نريد إظهار الخطأ
    throw error;
  }
};

module.exports = connectDB;
