/**
 * 📚 Daily Recommendations Usage Examples
 * أمثلة استخدام نظام التوصيات اليومية
 * 
 * Task: 12.2 تحديث يومي
 */

const dailyRecommendationService = require('../src/services/dailyRecommendationService');
const dailyRecommendationCron = require('../src/jobs/dailyRecommendationCron');

// ═══════════════════════════════════════════════════════════
// مثال 1: تشغيل التحديث اليومي يدوياً
// ═══════════════════════════════════════════════════════════

async function example1_ManualUpdate() {
  console.log('\n📝 مثال 1: تشغيل التحديث اليومي يدوياً\n');
  
  try {
    const result = await dailyRecommendationService.runDailyUpdate({
      lastActiveWithinDays: 30,      // المستخدمون النشطون خلال آخر 30 يوم
      minProfileCompleteness: 30,    // اكتمال الملف الشخصي 30% على الأقل
      batchSize: 10,                 // معالجة 10 مستخدمين في كل دفعة
      maxUsers: 100                  // حد أقصى 100 مستخدم
    });
    
    if (result.success) {
      console.log('✅ نجح التحديث اليومي');
      console.log(`📊 الإحصائيات:`);
      console.log(`   - المستخدمون المعالجون: ${result.stats.processedUsers}`);
      console.log(`   - إجمالي التوصيات: ${result.stats.totalRecommendations}`);
      console.log(`   - المدة: ${Math.round(result.stats.duration / 1000)} ثانية`);
    } else {
      console.log('❌ فشل التحديث اليومي:', result.message);
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════
// مثال 2: جلب التوصيات الجديدة للمستخدم
// ═══════════════════════════════════════════════════════════

async function example2_GetNewRecommendations() {
  console.log('\n📝 مثال 2: جلب التوصيات الجديدة للمستخدم\n');
  
  try {
    const userId = '507f1f77bcf86cd799439011'; // معرف المستخدم
    
    const recommendations = await dailyRecommendationService.getNewRecommendations(userId, {
      limit: 10
    });
    
    console.log(`✅ تم جلب ${recommendations.length} توصية جديدة`);
    
    recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. ${rec.job.title}`);
      console.log(`   نسبة التطابق: ${rec.matchScore.percentage}%`);
      console.log(`   الشركة: ${rec.job.postedBy?.companyName || 'غير محدد'}`);
      console.log(`   الموقع: ${rec.job.location || 'غير محدد'}`);
      
      if (rec.reasons && rec.reasons.length > 0) {
        console.log(`   السبب: ${rec.reasons[0].message}`);
      }
    });
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════
// مثال 3: تحديد توصية كمشاهدة
// ═══════════════════════════════════════════════════════════

async function example3_MarkAsSeen() {
  console.log('\n📝 مثال 3: تحديد توصية كمشاهدة\n');
  
  try {
    const recommendationId = '507f1f77bcf86cd799439011'; // معرف التوصية
    
    await dailyRecommendationService.markRecommendationAsSeen(recommendationId);
    
    console.log('✅ تم تحديد التوصية كمشاهدة');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════
// مثال 4: الحصول على حالة التحديث اليومي
// ═══════════════════════════════════════════════════════════

function example4_GetStatus() {
  console.log('\n📝 مثال 4: الحصول على حالة التحديث اليومي\n');
  
  const status = dailyRecommendationService.getStatus();
  
  console.log('📊 حالة التحديث اليومي:');
  console.log(`   - قيد التشغيل: ${status.isRunning ? 'نعم' : 'لا'}`);
  console.log(`   - آخر تشغيل: ${status.lastRunTime || 'لم يتم التشغيل بعد'}`);
  console.log(`   - إجمالي المستخدمين: ${status.stats.totalUsers}`);
  console.log(`   - المستخدمون المعالجون: ${status.stats.processedUsers}`);
  console.log(`   - إجمالي التوصيات: ${status.stats.totalRecommendations}`);
}

// ═══════════════════════════════════════════════════════════
// مثال 5: بدء جدولة التحديث اليومي
// ═══════════════════════════════════════════════════════════

function example5_StartSchedule() {
  console.log('\n📝 مثال 5: بدء جدولة التحديث اليومي\n');
  
  try {
    dailyRecommendationCron.start({
      schedule: '0 2 * * *',      // كل يوم في الساعة 2:00 صباحاً
      timezone: 'Africa/Cairo'    // توقيت القاهرة
    });
    
    const status = dailyRecommendationCron.getStatus();
    
    console.log('✅ تم بدء جدولة التحديث اليومي');
    console.log(`📅 الجدول: ${status.schedule}`);
    console.log(`🌍 المنطقة الزمنية: ${status.timezone}`);
    console.log(`⏰ التشغيل التالي: ${status.nextRunTime}`);
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════
// مثال 6: إيقاف جدولة التحديث اليومي
// ═══════════════════════════════════════════════════════════

function example6_StopSchedule() {
  console.log('\n📝 مثال 6: إيقاف جدولة التحديث اليومي\n');
  
  try {
    dailyRecommendationCron.stop();
    
    console.log('✅ تم إيقاف جدولة التحديث اليومي');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════
// مثال 7: تشغيل يدوي من Cron Job
// ═══════════════════════════════════════════════════════════

async function example7_ManualRunFromCron() {
  console.log('\n📝 مثال 7: تشغيل يدوي من Cron Job\n');
  
  try {
    const result = await dailyRecommendationCron.runManually({
      lastActiveWithinDays: 7,       // المستخدمون النشطون خلال آخر 7 أيام
      minProfileCompleteness: 50,    // اكتمال الملف الشخصي 50% على الأقل
      batchSize: 5,                  // معالجة 5 مستخدمين في كل دفعة
      maxUsers: 50                   // حد أقصى 50 مستخدم
    });
    
    if (result.success) {
      console.log('✅ نجح التشغيل اليدوي');
      console.log(`📊 الإحصائيات:`);
      console.log(`   - المستخدمون المعالجون: ${result.stats.processedUsers}`);
      console.log(`   - إجمالي التوصيات: ${result.stats.totalRecommendations}`);
    } else {
      console.log('❌ فشل التشغيل اليدوي:', result.message);
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════
// مثال 8: الحصول على حالة Cron Job
// ═══════════════════════════════════════════════════════════

function example8_GetCronStatus() {
  console.log('\n📝 مثال 8: الحصول على حالة Cron Job\n');
  
  const status = dailyRecommendationCron.getStatus();
  
  console.log('📊 حالة Cron Job:');
  console.log(`   - مجدول: ${status.isScheduled ? 'نعم' : 'لا'}`);
  console.log(`   - الجدول: ${status.schedule}`);
  console.log(`   - المنطقة الزمنية: ${status.timezone}`);
  console.log(`   - التشغيل التالي: ${status.nextRunTime}`);
  
  if (status.serviceStatus) {
    console.log(`\n   حالة الخدمة:`);
    console.log(`   - قيد التشغيل: ${status.serviceStatus.isRunning ? 'نعم' : 'لا'}`);
    console.log(`   - آخر تشغيل: ${status.serviceStatus.lastRunTime || 'لم يتم التشغيل بعد'}`);
  }
}

// ═══════════════════════════════════════════════════════════
// تشغيل الأمثلة
// ═══════════════════════════════════════════════════════════

async function runAllExamples() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         Daily Recommendations Usage Examples              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  // مثال 4: الحصول على حالة التحديث اليومي
  example4_GetStatus();
  
  // مثال 5: بدء جدولة التحديث اليومي
  example5_StartSchedule();
  
  // مثال 8: الحصول على حالة Cron Job
  example8_GetCronStatus();
  
  // مثال 6: إيقاف جدولة التحديث اليومي
  // example6_StopSchedule();
  
  // ملاحظة: الأمثلة التي تتطلب قاعدة بيانات معطلة
  // يمكن تفعيلها عند الحاجة:
  // await example1_ManualUpdate();
  // await example2_GetNewRecommendations();
  // await example3_MarkAsSeen();
  // await example7_ManualRunFromCron();
  
  console.log('\n✅ اكتملت جميع الأمثلة\n');
}

// تشغيل الأمثلة إذا تم تشغيل الملف مباشرة
if (require.main === module) {
  runAllExamples().catch(console.error);
}

module.exports = {
  example1_ManualUpdate,
  example2_GetNewRecommendations,
  example3_MarkAsSeen,
  example4_GetStatus,
  example5_StartSchedule,
  example6_StopSchedule,
  example7_ManualRunFromCron,
  example8_GetCronStatus
};
