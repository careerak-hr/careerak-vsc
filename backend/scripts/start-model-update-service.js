#!/usr/bin/env node

/**
 * 🤖 Model Update Service Startup Script
 * سكريبت بدء خدمة تحديث النماذج
 * 
 * يبدأ خدمة إعادة تدوير النماذج الدورية بناءً على تفاعلات المستخدمين
 */

require('dotenv').config();
const mongoose = require('mongoose');
const ModelUpdateService = require('../src/services/modelUpdateService');

// تكوين الاتصال بقاعدة البيانات
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak';

// تهيئة خدمة تحديث النماذج
const modelUpdateService = new ModelUpdateService();

/**
 * بدء الخدمة
 */
async function startService() {
  console.log('🚀 بدء خدمة تحديث النماذج...');
  
  try {
    // الاتصال بقاعدة البيانات
    console.log('🔗 الاتصال بقاعدة البيانات...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ تم الاتصال بقاعدة البيانات');
    
    // بدء خدمة إعادة التدوير الدورية
    modelUpdateService.startPeriodicRetraining();
    
    // عرض حالة الخدمة
    const status = modelUpdateService.getRetrainingStatus();
    console.log('📊 حالة خدمة تحديث النماذج:');
    console.log(`   - إعادة التدوير قيد التنفيذ: ${status.isRetraining ? 'نعم' : 'لا'}`);
    console.log(`   - آخر إعادة تدوير: ${status.lastRetrainingDate || 'لم تتم بعد'}`);
    console.log(`   - فاصل إعادة التدوير: ${status.retrainingInterval / (24 * 60 * 60 * 1000)} أيام`);
    console.log(`   - مجدولة: ${status.isScheduled ? 'نعم' : 'لا'}`);
    
    // إبقاء السكريبت قيد التشغيل
    console.log('\n⏳ الخدمة تعمل... (اضغط Ctrl+C لإيقاف)');
    
    // معالجة إشارة الإيقاف
    process.on('SIGINT', async () => {
      console.log('\n🛑 إيقاف خدمة تحديث النماذج...');
      modelUpdateService.stopPeriodicRetraining();
      await mongoose.connection.close();
      console.log('✅ تم إيقاف الخدمة');
      process.exit(0);
    });
    
    // معالجة أخطاء غير متوقعة
    process.on('uncaughtException', (error) => {
      console.error('❌ خطأ غير متوقع:', error.message);
      console.error(error.stack);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ وعد مرفوض غير معالج:', reason);
    });
    
  } catch (error) {
    console.error('❌ خطأ في بدء الخدمة:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * تشغيل إعادة تدوير يدوية
 */
async function runManualRetraining() {
  console.log('🔄 تشغيل إعادة تدوير يدوية...');
  
  try {
    // الاتصال بقاعدة البيانات
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ تم الاتصال بقاعدة البيانات');
    
    // تشغيل إعادة التدوير
    const result = await modelUpdateService.retrainModels();
    
    console.log('📊 نتيجة إعادة التدوير:');
    console.log(`   - الحالة: ${result.status}`);
    console.log(`   - الرسالة: ${result.message}`);
    
    if (result.data) {
      console.log(`   - معرف إعادة التدوير: ${result.data.retrainingId}`);
      console.log(`   - عدد التفاعلات: ${result.data.interactionStats?.totalInteractions || 0}`);
      console.log(`   - عدد المستخدمين المحللين: ${result.data.userPreferences?.totalUsersAnalyzed || 0}`);
    }
    
    // إغلاق الاتصال
    await mongoose.connection.close();
    console.log('✅ اكتملت إعادة التدوير اليدوية');
    
  } catch (error) {
    console.error('❌ خطأ في إعادة التدوير اليدوية:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * عرض حالة الخدمة
 */
async function showStatus() {
  try {
    // الاتصال بقاعدة البيانات
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('📊 حالة خدمة تحديث النماذج:');
    
    const status = modelUpdateService.getRetrainingStatus();
    console.log(`   - إعادة التدوير قيد التنفيذ: ${status.isRetraining ? 'نعم' : 'لا'}`);
    console.log(`   - آخر إعادة تدوير: ${status.lastRetrainingDate || 'لم تتم بعد'}`);
    console.log(`   - فاصل إعادة التدوير: ${status.retrainingInterval / (24 * 60 * 60 * 1000)} أيام`);
    console.log(`   - الحد الأدنى للتفاعلات: ${status.minInteractionsForRetraining}`);
    console.log(`   - مجدولة: ${status.isScheduled ? 'نعم' : 'لا'}`);
    
    // جمع إحصاءات التفاعلات
    const Interaction = require('../src/models/UserInteraction');
    const totalInteractions = await Interaction.countDocuments();
    const uniqueUsers = await Interaction.distinct('userId').count();
    
    console.log('\n📊 إحصاءات التفاعلات:');
    console.log(`   - إجمالي التفاعلات: ${totalInteractions}`);
    console.log(`   - مستخدمين فريدين: ${uniqueUsers}`);
    console.log(`   - كافية لإعادة التدوير: ${totalInteractions >= status.minInteractionsForRetraining ? 'نعم' : 'لا'}`);
    
    // إغلاق الاتصال
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ خطأ في عرض الحالة:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * عرض المساعدة
 */
function showHelp() {
  console.log(`
🤖 Model Update Service - Careerak

الأوامر المتاحة:
  start        بدء خدمة تحديث النماذج الدورية
  retrain      تشغيل إعادة تدوير يدوية
  status       عرض حالة الخدمة والإحصاءات
  help         عرض هذه الرسالة

أمثلة:
  node scripts/start-model-update-service.js start
  node scripts/start-model-update-service.js retrain
  node scripts/start-model-update-service.js status
  `);
}

// معالجة الأمر
const command = process.argv[2] || 'help';

switch (command) {
  case 'start':
    startService();
    break;
    
  case 'retrain':
    runManualRetraining();
    break;
    
  case 'status':
    showStatus();
    break;
    
  case 'help':
  default:
    showHelp();
    break;
}