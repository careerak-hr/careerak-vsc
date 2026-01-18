const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // إعدادات إضافية لضمان استقرار الاتصال السحابي
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // الانتظار 5 ثواني فقط
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // لا نستخدم process.exit(1) هنا في بيئة Vercel لأنها تقتل السيرفر بالكامل
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
