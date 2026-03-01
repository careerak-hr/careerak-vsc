/**
 * مثال شامل لاستخدام نظام الحذف التلقائي للتسجيلات
 */

const recordingService = require('../src/services/recordingService');
const recordingCleanupCron = require('../src/jobs/recordingCleanupCron');
const InterviewRecording = require('../src/models/InterviewRecording');

// ============================================
// مثال 1: إنشاء تسجيل جديد
// ============================================
async function example1_createRecording() {
  console.log('\n=== مثال 1: إنشاء تسجيل جديد ===\n');

  try {
    const recording = await recordingService.startRecording(
      '507f1f77bcf86cd799439011', // interviewId
      90 // retentionDays (اختياري)
    );

    console.log('✅ تم إنشاء التسجيل:');
    console.log('Recording ID:', recording.recordingId);
    console.log('Expires at:', recording.expiresAt);
    console.log('Retention days:', recording.retentionDays);
    console.log('Days remaining:', Math.ceil((recording.expiresAt - new Date()) / (1000 * 60 * 60 * 24)));
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ============================================
// مثال 2: تحديث فترة الاحتفاظ
// ============================================
async function example2_updateRetention() {
  console.log('\n=== مثال 2: تحديث فترة الاحتفاظ ===\n');

  try {
    const recordingId = 'YOUR_RECORDING_ID';
    const newRetentionDays = 120;

    const recording = await recordingService.updateRetentionPeriod(
      recordingId,
      newRetentionDays
    );

    console.log('✅ تم تحديث فترة الاحتفاظ:');
    console.log('Recording ID:', recording.recordingId);
    console.log('Old expires at:', recording.expiresAt);
    console.log('New retention days:', recording.retentionDays);
    console.log('New expires at:', recording.expiresAt);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ============================================
// مثال 3: جدولة الحذف
// ============================================
async function example3_scheduleDelete() {
  console.log('\n=== مثال 3: جدولة الحذف ===\n');

  try {
    const recordingId = 'YOUR_RECORDING_ID';

    const result = await recordingService.scheduleDelete(
      recordingId,
      60 // retentionDays جديد (اختياري)
    );

    console.log('✅ تم جدولة الحذف:');
    console.log('Recording ID:', result.recordingId);
    console.log('Expires at:', result.expiresAt);
    console.log('Retention days:', result.retentionDays);
    console.log('Days remaining:', result.daysRemaining);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ============================================
// مثال 4: حذف يدوي
// ============================================
async function example4_manualDelete() {
  console.log('\n=== مثال 4: حذف يدوي ===\n');

  try {
    const recordingId = 'YOUR_RECORDING_ID';
    const userId = '507f1f77bcf86cd799439012';

    const recording = await recordingService.deleteRecording(
      recordingId,
      userId,
      'user_request' // السبب
    );

    console.log('✅ تم حذف التسجيل:');
    console.log('Recording ID:', recording.recordingId);
    console.log('Status:', recording.status);
    console.log('Deleted at:', recording.deletedAt);
    console.log('Deleted by:', recording.deletedBy);
    console.log('Deletion reason:', recording.deletionReason);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ============================================
// مثال 5: الحصول على التسجيلات المنتهية
// ============================================
async function example5_findExpired() {
  console.log('\n=== مثال 5: الحصول على التسجيلات المنتهية ===\n');

  try {
    const expiredRecordings = await InterviewRecording.findExpired();

    console.log(`✅ وجدنا ${expiredRecordings.length} تسجيل منتهي:`);
    
    expiredRecordings.forEach((recording, index) => {
      console.log(`\n${index + 1}. Recording ID: ${recording.recordingId}`);
      console.log(`   Expired at: ${recording.expiresAt}`);
      console.log(`   Days overdue: ${Math.ceil((new Date() - recording.expiresAt) / (1000 * 60 * 60 * 24))}`);
    });
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ============================================
// مثال 6: الحصول على التسجيلات التي ستنتهي قريباً
// ============================================
async function example6_findExpiringSoon() {
  console.log('\n=== مثال 6: التسجيلات التي ستنتهي خلال 7 أيام ===\n');

  try {
    const expiringSoon = await InterviewRecording.findExpiringSoon(7);

    console.log(`✅ وجدنا ${expiringSoon.length} تسجيل سينتهي قريباً:`);
    
    expiringSoon.forEach((recording, index) => {
      const daysRemaining = Math.ceil((recording.expiresAt - new Date()) / (1000 * 60 * 60 * 24));
      console.log(`\n${index + 1}. Recording ID: ${recording.recordingId}`);
      console.log(`   Expires at: ${recording.expiresAt}`);
      console.log(`   Days remaining: ${daysRemaining}`);
    });
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ============================================
// مثال 7: تشغيل التنظيف يدوياً
// ============================================
async function example7_runCleanup() {
  console.log('\n=== مثال 7: تشغيل التنظيف يدوياً ===\n');

  try {
    console.log('⏳ جاري التنظيف...');
    
    await recordingCleanupCron.runManually();

    const stats = recordingCleanupCron.getStats();

    console.log('\n✅ اكتمل التنظيف:');
    console.log('Total runs:', stats.totalRuns);
    console.log('Total deleted:', stats.totalDeleted);
    console.log('Total errors:', stats.totalErrors);
    
    if (stats.lastRunStats) {
      console.log('\nآخر تشغيل:');
      console.log('Timestamp:', stats.lastRunStats.timestamp);
      console.log('Duration:', stats.lastRunStats.duration + 'ms');
      console.log('Found:', stats.lastRunStats.found);
      console.log('Deleted:', stats.lastRunStats.deleted);
      console.log('Errors:', stats.lastRunStats.errors);
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ============================================
// مثال 8: الحصول على إحصائيات التسجيلات
// ============================================
async function example8_getStats() {
  console.log('\n=== مثال 8: إحصائيات التسجيلات ===\n');

  try {
    const stats = await recordingService.getRecordingStats();

    console.log('✅ الإحصائيات:');
    
    console.log('\nحسب الحالة:');
    stats.byStatus.forEach(stat => {
      console.log(`${stat._id}:`);
      console.log(`  Count: ${stat.count}`);
      console.log(`  Total size: ${(stat.totalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Total duration: ${(stat.totalDuration / 60).toFixed(2)} minutes`);
    });

    console.log('\nالتسجيلات المنتهية:', stats.expired);
    console.log('التسجيلات التي ستنتهي قريباً:', stats.expiringSoon);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ============================================
// مثال 9: بدء وإيقاف Cron Job
// ============================================
function example9_cronJobControl() {
  console.log('\n=== مثال 9: التحكم في Cron Job ===\n');

  // بدء Cron Job
  console.log('✅ بدء Cron Job...');
  recordingCleanupCron.start();
  console.log('Cron Job يعمل الآن');
  console.log('- التنظيف اليومي: 2:00 صباحاً');
  console.log('- الفحص الأسبوعي: الأحد 10:00 صباحاً');

  // الحصول على الإحصائيات
  const stats = recordingCleanupCron.getStats();
  console.log('\nالإحصائيات:');
  console.log('Is running:', stats.isRunning);
  console.log('Last run:', stats.lastRun);
  console.log('Total runs:', stats.totalRuns);

  // إيقاف Cron Job (عند الحاجة)
  // recordingCleanupCron.stop();
  // console.log('\n✅ تم إيقاف Cron Job');
}

// ============================================
// مثال 10: سيناريو كامل
// ============================================
async function example10_fullScenario() {
  console.log('\n=== مثال 10: سيناريو كامل ===\n');

  try {
    // 1. إنشاء تسجيل
    console.log('1️⃣ إنشاء تسجيل جديد...');
    const recording = await recordingService.startRecording(
      '507f1f77bcf86cd799439011',
      1 // يوم واحد للاختبار
    );
    console.log('✅ تم إنشاء التسجيل:', recording.recordingId);

    // 2. إيقاف التسجيل
    console.log('\n2️⃣ إيقاف التسجيل...');
    await recordingService.stopRecording(
      recording.recordingId,
      'https://cloudinary.com/video.mp4',
      1024000,
      3600
    );
    console.log('✅ تم إيقاف التسجيل');

    // 3. معالجة التسجيل
    console.log('\n3️⃣ معالجة التسجيل...');
    await recordingService.processRecording(recording.recordingId);
    console.log('✅ تم معالجة التسجيل');

    // 4. تحديث فترة الاحتفاظ
    console.log('\n4️⃣ تحديث فترة الاحتفاظ...');
    await recordingService.updateRetentionPeriod(recording.recordingId, 30);
    console.log('✅ تم تحديث فترة الاحتفاظ إلى 30 يوم');

    // 5. الحصول على التسجيل
    console.log('\n5️⃣ الحصول على التسجيل...');
    const updatedRecording = await recordingService.getRecording(recording.recordingId);
    console.log('✅ التسجيل:');
    console.log('   Status:', updatedRecording.status);
    console.log('   Expires at:', updatedRecording.expiresAt);
    console.log('   Retention days:', updatedRecording.retentionDays);

    // 6. حذف يدوي (اختياري)
    // await recordingService.deleteRecording(
    //   recording.recordingId,
    //   '507f1f77bcf86cd799439012',
    //   'manual'
    // );
    // console.log('✅ تم حذف التسجيل');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ============================================
// تشغيل الأمثلة
// ============================================
async function runExamples() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     أمثلة نظام الحذف التلقائي للتسجيلات                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // اختر المثال الذي تريد تشغيله
  // await example1_createRecording();
  // await example2_updateRetention();
  // await example3_scheduleDelete();
  // await example4_manualDelete();
  // await example5_findExpired();
  // await example6_findExpiringSoon();
  // await example7_runCleanup();
  // await example8_getStats();
  // example9_cronJobControl();
  // await example10_fullScenario();

  console.log('\n✅ انتهت الأمثلة');
}

// تشغيل إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  runExamples().catch(console.error);
}

module.exports = {
  example1_createRecording,
  example2_updateRetention,
  example3_scheduleDelete,
  example4_manualDelete,
  example5_findExpired,
  example6_findExpiringSoon,
  example7_runCleanup,
  example8_getStats,
  example9_cronJobControl,
  example10_fullScenario
};
