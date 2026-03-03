/**
 * سكريبت لإنشاء indexes البحث في قاعدة البيانات
 * يجب تشغيله مرة واحدة بعد إعداد المشروع
 */

require('dotenv').config();
const mongoose = require('mongoose');
const JobPosting = require('../src/models/JobPosting');

async function createSearchIndexes() {
  try {
    console.log('🔌 الاتصال بقاعدة البيانات...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بنجاح');

    console.log('\n📊 إنشاء indexes للبحث...');
    
    try {
      // إنشاء جميع الـ indexes المعرفة في النموذج
      await JobPosting.createIndexes();
      console.log('✅ تم إنشاء جميع الـ indexes بنجاح');
    } catch (indexError) {
      console.error('⚠️ خطأ في إنشاء الـ indexes:', indexError.message);
      console.log('ℹ️ قد تكون الـ indexes موجودة بالفعل، سنتابع...');
    }

    // عرض الـ indexes الموجودة
    const indexes = await JobPosting.collection.getIndexes();
    console.log('\n📋 الـ Indexes الموجودة:');
    Object.keys(indexes).forEach(indexName => {
      console.log(`  - ${indexName}`);
    });

    console.log('\n✅ اكتمل الإعداد بنجاح!');
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

createSearchIndexes();
