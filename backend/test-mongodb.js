/**
 * اختبار اتصال MongoDB
 * تشغيل: node test-mongodb.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

console.log('🧪 اختبار اتصال MongoDB...\n');

// التحقق من المفاتيح
console.log('📋 معلومات الاتصال:');
console.log('  MONGODB_URI:', process.env.MONGODB_URI ? '✅ موجود' : '❌ غير موجود');
console.log('');

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI غير موجود في .env');
  process.exit(1);
}

// الاتصال بـ MongoDB
const connectDB = async () => {
  try {
    console.log('📡 جاري الاتصال بـ MongoDB Atlas...');
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      dbName: 'careerak'
    };
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log('✅ تم الاتصال بنجاح!');
    console.log('');
    console.log('📊 معلومات الاتصال:');
    console.log('  Host:', conn.connection.host);
    console.log('  Database:', conn.connection.name);
    console.log('  Port:', conn.connection.port);
    console.log('  Ready State:', conn.connection.readyState === 1 ? 'متصل' : 'غير متصل');
    console.log('');
    
    // اختبار عملية بسيطة
    console.log('🧪 اختبار عملية بسيطة...');
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('✅ عدد المجموعات:', collections.length);
    
    if (collections.length > 0) {
      console.log('📦 المجموعات الموجودة:');
      collections.forEach(col => {
        console.log('  -', col.name);
      });
    }
    console.log('');
    
    console.log('🎉 جميع الاختبارات نجحت!');
    console.log('');
    console.log('💡 الآن يمكنك:');
    console.log('   1. تشغيل Backend: npm start');
    console.log('   2. اختبار API: curl http://localhost:5000/reviews/user/USER_ID');
    console.log('');
    
    // إغلاق الاتصال
    await mongoose.connection.close();
    console.log('👋 تم إغلاق الاتصال');
    
  } catch (error) {
    console.error('❌ فشل الاتصال:', error.message);
    console.error('');
    console.error('💡 تحقق من:');
    console.error('   1. MONGODB_URI في .env صحيح');
    console.error('   2. الإنترنت متصل');
    console.error('   3. MongoDB Atlas مفعّل');
    console.error('   4. IP Address مسموح في MongoDB Atlas');
    console.error('');
    process.exit(1);
  }
};

connectDB();
