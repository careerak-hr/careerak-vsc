/**
 * أمثلة على استخدام خدمة تقدير الرواتب
 * 
 * هذا الملف يحتوي على أمثلة عملية لاستخدام salaryEstimatorService
 */

const salaryEstimatorService = require('../src/services/salaryEstimatorService');
const JobPosting = require('../src/models/JobPosting');
const SalaryData = require('../src/models/SalaryData');

// ============================================
// مثال 1: تقدير راتب وظيفة معينة
// ============================================
async function example1_estimateSalary() {
  console.log('\n=== مثال 1: تقدير راتب وظيفة ===\n');

  // جلب وظيفة من قاعدة البيانات
  const job = await JobPosting.findOne({ 
    status: 'active', 
    salary: { $gt: 0 } 
  });

  if (!job) {
    console.log('لا توجد وظائف نشطة');
    return;
  }

  console.log(`الوظيفة: ${job.title}`);
  console.log(`المجال: ${job.field}`);
  console.log(`الراتب المعروض: ${job.salary} SAR`);

  // تقدير الراتب
  const estimate = await salaryEstimatorService.estimateSalary(job);

  if (!estimate) {
    console.log('❌ لا توجد بيانات كافية لتقدير الراتب');
    return;
  }

  console.log('\n📊 تقدير الراتب:');
  console.log(`- الراتب المعروض: ${estimate.provided} SAR`);
  console.log(`- متوسط السوق: ${estimate.market.average} SAR`);
  console.log(`- النطاق: ${estimate.market.min} - ${estimate.market.max} SAR`);
  console.log(`- عدد الوظائف: ${estimate.market.count}`);
  console.log(`- المقارنة: ${estimate.comparison}`);
  
  if (estimate.percentageDiff > 0) {
    console.log(`- الفرق: ${estimate.percentageDiff}%`);
  }

  // تفسير النتيجة
  if (estimate.comparison === 'below') {
    console.log('\n🔴 الراتب أقل من متوسط السوق');
  } else if (estimate.comparison === 'above') {
    console.log('\n🟢 الراتب أعلى من متوسط السوق');
  } else {
    console.log('\n🟡 الراتب في متوسط السوق');
  }
}

// ============================================
// مثال 2: تقدير راتب بواسطة ID مع التخزين المؤقت
// ============================================
async function example2_estimateSalaryByJobId() {
  console.log('\n=== مثال 2: تقدير راتب بواسطة ID ===\n');

  // جلب معرف وظيفة
  const job = await JobPosting.findOne({ 
    status: 'active', 
    salary: { $gt: 0 } 
  });

  if (!job) {
    console.log('لا توجد وظائف نشطة');
    return;
  }

  console.log(`معرف الوظيفة: ${job._id}`);

  // المحاولة الأولى (من قاعدة البيانات)
  console.log('\n⏱️ المحاولة الأولى (من قاعدة البيانات)...');
  const start1 = Date.now();
  const estimate1 = await salaryEstimatorService.estimateSalaryByJobId(job._id);
  const time1 = Date.now() - start1;
  console.log(`✅ تم في ${time1}ms`);

  // المحاولة الثانية (من الـ cache)
  console.log('\n⚡ المحاولة الثانية (من الـ cache)...');
  const start2 = Date.now();
  const estimate2 = await salaryEstimatorService.estimateSalaryByJobId(job._id);
  const time2 = Date.now() - start2;
  console.log(`✅ تم في ${time2}ms`);

  console.log(`\n📈 تحسين الأداء: ${Math.round((time1 - time2) / time1 * 100)}%`);
}

// ============================================
// مثال 3: تحديث بيانات الرواتب
// ============================================
async function example3_updateSalaryData() {
  console.log('\n=== مثال 3: تحديث بيانات الرواتب ===\n');

  console.log('🔄 بدء التحديث...');
  const result = await salaryEstimatorService.updateSalaryData();

  console.log('\n✅ التحديث مكتمل:');
  console.log(`- إجمالي الوظائف: ${result.totalJobs}`);
  console.log(`- المجموعات: ${result.groups}`);
  console.log(`- سجلات جديدة: ${result.created}`);
  console.log(`- سجلات محدثة: ${result.updated}`);
}

// ============================================
// مثال 4: حذف البيانات القديمة
// ============================================
async function example4_cleanupOldData() {
  console.log('\n=== مثال 4: حذف البيانات القديمة ===\n');

  console.log('🧹 بدء التنظيف...');
  const result = await salaryEstimatorService.cleanupOldData();

  console.log('\n✅ التنظيف مكتمل:');
  console.log(`- السجلات المحذوفة: ${result.deletedCount}`);
}

// ============================================
// مثال 5: الحصول على الإحصائيات
// ============================================
async function example5_getStatistics() {
  console.log('\n=== مثال 5: الإحصائيات ===\n');

  const stats = await salaryEstimatorService.getStatistics();

  console.log(`📊 إجمالي السجلات: ${stats.totalRecords}`);
  
  console.log('\n🏆 أفضل 5 مجالات:');
  stats.byField.slice(0, 5).forEach((field, index) => {
    console.log(`  ${index + 1}. ${field._id}`);
    console.log(`     - عدد السجلات: ${field.count}`);
    console.log(`     - متوسط الراتب: ${Math.round(field.avgSalary)} SAR`);
  });

  console.log('\n🕐 آخر التحديثات:');
  stats.recentUpdates.forEach((update, index) => {
    console.log(`  ${index + 1}. ${update.jobTitle} (${update.field})`);
    console.log(`     - الموقع: ${update.location}`);
    console.log(`     - متوسط الراتب: ${Math.round(update.statistics.average)} SAR`);
    console.log(`     - آخر تحديث: ${update.lastUpdated.toLocaleDateString('ar-SA')}`);
  });
}

// ============================================
// مثال 6: استخدام في API endpoint
// ============================================
async function example6_apiEndpoint() {
  console.log('\n=== مثال 6: استخدام في API endpoint ===\n');

  // مثال على controller
  const getSalaryEstimate = async (req, res) => {
    try {
      const { jobId } = req.params;

      // تقدير الراتب
      const estimate = await salaryEstimatorService.estimateSalaryByJobId(jobId);

      if (!estimate) {
        return res.status(404).json({
          success: false,
          message: 'لا توجد بيانات كافية لتقدير الراتب'
        });
      }

      return res.json({
        success: true,
        estimate
      });
    } catch (error) {
      console.error('Error getting salary estimate:', error);
      return res.status(500).json({
        success: false,
        message: 'خطأ في الحصول على تقدير الراتب'
      });
    }
  };

  console.log('✅ مثال على API endpoint:');
  console.log('GET /api/jobs/:jobId/salary-estimate');
  console.log('\nResponse:');
  console.log(JSON.stringify({
    success: true,
    estimate: {
      provided: 7500,
      market: {
        average: 8500,
        min: 8000,
        max: 9000,
        count: 15
      },
      comparison: 'below',
      percentageDiff: 12
    }
  }, null, 2));
}

// ============================================
// مثال 7: استخدام في نظام التوصيات
// ============================================
async function example7_recommendations() {
  console.log('\n=== مثال 7: استخدام في نظام التوصيات ===\n');

  // جلب وظائف
  const jobs = await JobPosting.find({ 
    status: 'active', 
    salary: { $gt: 0 } 
  }).limit(5);

  console.log('🎯 تحسين التوصيات بناءً على الراتب:\n');

  for (const job of jobs) {
    const estimate = await salaryEstimatorService.estimateSalary(job);

    if (!estimate) continue;

    let priority = 0;

    // زيادة الأولوية للوظائف ذات الرواتب الأعلى
    if (estimate.comparison === 'above') {
      priority += 10;
      console.log(`✅ ${job.title}: أولوية +10 (راتب أعلى من المتوسط)`);
    } else if (estimate.comparison === 'average') {
      priority += 5;
      console.log(`🟡 ${job.title}: أولوية +5 (راتب متوسط)`);
    } else {
      console.log(`⚠️ ${job.title}: أولوية عادية (راتب أقل من المتوسط)`);
    }
  }
}

// ============================================
// مثال 8: استخدام في نظام الإشعارات
// ============================================
async function example8_notifications() {
  console.log('\n=== مثال 8: استخدام في نظام الإشعارات ===\n');

  // جلب وظيفة
  const job = await JobPosting.findOne({ 
    status: 'active', 
    salary: { $gt: 0 } 
  });

  if (!job) {
    console.log('لا توجد وظائف نشطة');
    return;
  }

  const estimate = await salaryEstimatorService.estimateSalary(job);

  if (!estimate) {
    console.log('لا توجد بيانات كافية');
    return;
  }

  console.log(`الوظيفة: ${job.title}`);
  console.log(`الراتب: ${job.salary} SAR`);
  console.log(`المقارنة: ${estimate.comparison}`);

  // إرسال إشعار إذا كان الراتب أقل من المتوسط
  if (estimate.comparison === 'below') {
    console.log('\n📧 إرسال إشعار للمستخدم:');
    console.log(`"الراتب المعروض أقل من متوسط السوق بنسبة ${estimate.percentageDiff}%"`);
    console.log(`"متوسط السوق: ${estimate.market.average} SAR"`);
  }
}

// ============================================
// مثال 9: البحث عن بيانات راتب معينة
// ============================================
async function example9_searchSalaryData() {
  console.log('\n=== مثال 9: البحث عن بيانات راتب ===\n');

  // البحث عن بيانات راتب لمطور Full Stack في الرياض
  const salaryData = await SalaryData.findOne({
    jobTitle: { $regex: 'Full Stack', $options: 'i' },
    field: 'Software Development',
    location: 'Riyadh',
    experienceLevel: 'mid'
  });

  if (!salaryData) {
    console.log('لا توجد بيانات');
    return;
  }

  console.log('📊 بيانات الراتب:');
  console.log(`- العنوان: ${salaryData.jobTitle}`);
  console.log(`- المجال: ${salaryData.field}`);
  console.log(`- الموقع: ${salaryData.location}`);
  console.log(`- مستوى الخبرة: ${salaryData.experienceLevel}`);
  console.log(`\n📈 الإحصائيات:`);
  console.log(`- المتوسط: ${salaryData.statistics.average} SAR`);
  console.log(`- الوسيط: ${salaryData.statistics.median} SAR`);
  console.log(`- الأدنى: ${salaryData.statistics.min} SAR`);
  console.log(`- الأعلى: ${salaryData.statistics.max} SAR`);
  console.log(`- العدد: ${salaryData.statistics.count}`);
  console.log(`- آخر تحديث: ${salaryData.lastUpdated.toLocaleDateString('ar-SA')}`);
}

// ============================================
// مثال 10: تشغيل جميع الأمثلة
// ============================================
async function runAllExamples() {
  try {
    // الاتصال بقاعدة البيانات
    require('dotenv').config();
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات');

    // تشغيل الأمثلة
    await example1_estimateSalary();
    await example2_estimateSalaryByJobId();
    await example3_updateSalaryData();
    await example4_cleanupOldData();
    await example5_getStatistics();
    await example6_apiEndpoint();
    await example7_recommendations();
    await example8_notifications();
    await example9_searchSalaryData();

    console.log('\n✅ جميع الأمثلة اكتملت بنجاح');
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
}

// تشغيل الأمثلة إذا تم تشغيل الملف مباشرة
if (require.main === module) {
  runAllExamples();
}

// تصدير الأمثلة للاستخدام في ملفات أخرى
module.exports = {
  example1_estimateSalary,
  example2_estimateSalaryByJobId,
  example3_updateSalaryData,
  example4_cleanupOldData,
  example5_getStatistics,
  example6_apiEndpoint,
  example7_recommendations,
  example8_notifications,
  example9_searchSalaryData,
  runAllExamples
};
