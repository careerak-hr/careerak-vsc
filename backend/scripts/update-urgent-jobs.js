/**
 * سكريبت لتحديث حقل isUrgent للوظائف الموجودة
 * يحسب تلقائياً إذا كانت الوظيفة عاجلة بناءً على تاريخ الانتهاء
 */

require('dotenv').config();
const mongoose = require('mongoose');
const JobPosting = require('../src/models/JobPosting');

async function updateUrgentJobs() {
  try {
    console.log('🔄 جاري الاتصال بقاعدة البيانات...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح\n');

    // جلب جميع الوظائف النشطة
    const jobs = await JobPosting.find({ status: 'Open' });
    console.log(`📊 عدد الوظائف النشطة: ${jobs.length}\n`);

    let updatedCount = 0;
    let urgentCount = 0;

    for (const job of jobs) {
      let needsUpdate = false;
      
      // إذا لم يكن هناك تاريخ انتهاء، تعيين تاريخ افتراضي (30 يوم من تاريخ النشر)
      if (!job.expiryDate) {
        const createdAt = new Date(job.createdAt);
        job.expiryDate = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
        needsUpdate = true;
      }

      // حساب isUrgent
      const now = new Date();
      const expiry = new Date(job.expiryDate);
      const diffMs = expiry - now;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      
      const isUrgent = diffDays > 0 && diffDays <= 7;
      
      if (job.isUrgent !== isUrgent) {
        job.isUrgent = isUrgent;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await job.save();
        updatedCount++;
        
        if (isUrgent) {
          urgentCount++;
          console.log(`⚠️  وظيفة عاجلة: ${job.title} (تنتهي خلال ${diffDays} أيام)`);
        }
      }
    }

    console.log('\n📈 النتائج:');
    console.log(`   - تم تحديث ${updatedCount} وظيفة`);
    console.log(`   - ${urgentCount} وظيفة عاجلة (تنتهي خلال 7 أيام)`);
    console.log(`   - ${jobs.length - urgentCount} وظيفة عادية`);

    console.log('\n✅ تم التحديث بنجاح!');
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

// تشغيل السكريبت
updateUrgentJobs();
