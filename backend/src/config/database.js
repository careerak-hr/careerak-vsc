const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      // تحديد اسم قاعدة البيانات لضمان عدم الاختلاط مع عينات MongoDB
      dbName: 'careerak_db'
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`✅ Careerak Database Connected: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
