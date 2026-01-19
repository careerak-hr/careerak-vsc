const mongoose = require('mongoose');

// ذاكرة مؤقتة للاتصال لضمان استقرار Vercel (Caching)
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("♻️ MongoDB: Using existing connection");
    return cachedConnection;
  }

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      // تأكيد اسم قاعدة البيانات لضمان عدم الاختلاط مع العينات
      dbName: 'careerak_db'
    };

    console.log("📡 MongoDB: Connecting to Atlas...");
    cachedConnection = await mongoose.connect(uri, options);

    console.log(`✅ MongoDB: Connected to ${cachedConnection.connection.host}/${cachedConnection.connection.name}`);
    return cachedConnection;
  } catch (error) {
    console.error(`❌ MongoDB: Connection Error: ${error.message}`);
    // لا نقتل العملية في Vercel، بل نمرر الخطأ
    throw error;
  }
};

module.exports = connectDB;
