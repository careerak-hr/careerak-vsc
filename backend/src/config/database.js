const mongoose = require('mongoose');

// ✅ ذاكرة مؤقتة للاتصال خارج نطاق الدالة (Global Cache)
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    console.log("♻️ Using cached MongoDB connection");
    return cachedConnection;
  }

  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      dbName: 'careerak_db'
    };

    console.log("📡 Connecting to MongoDB Atlas...");
    cachedConnection = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ New MongoDB Connected: ${cachedConnection.connection.host}`);
    return cachedConnection;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error; // نمرر الخطأ ليتم معالجته في البوابة
  }
};

module.exports = connectDB;
