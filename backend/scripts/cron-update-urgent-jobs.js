/**
 * Cron Job لتحديث حقل isUrgent للوظائف بشكل دوري
 * يعمل كل 6 ساعات لتحديث حالة الوظائف العاجلة
 */

require('dotenv').config();
const mongoose = require('mongoose');
const JobPosting = require('../src/models/JobPosting');

async function updateUrgentJobsCron() {
  try {
    console.log(`[${new Date().toISOString()}] 🔄 بدء تحديث الوظائف العاجلة...`);
    
    await mongoose.connect(process.env.MONGODB_URI);

    // جلب جميع الوظائف النشطة فقط
    const jobs = await JobPosting.find({ 
      status: 'Open',
      expiryDate: { $exists: true }
    });

    let updatedCount = 0;
    let urgentCount = 0;
    let expiredCount = 0;

    const now = new Date();

    for (const job of jobs) {
      const expiry = new Date(job.expiryDate);
      const diffMs = expiry - now;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      
      // إذا انتهت الوظيفة، تحديث الحالة إلى Closed
      if (diffDays < 0) {
        job.status = 'Closed';
        job.isUrgent = false;
        await job.save();
        expiredCount++;
        continue;
      }

      // حساب isUrgent
      const isUrgent = diffDays > 0 && diffDays <= 7;
      
      if (job.isUrgent !== isUrgent) {
        job.isUrgent = isUrgent;
        await job.save();
        updatedCount++;
        
        if (isUrgent) {
          urgentCount++;
        }
      } else if (isUrgent) {
        urgentCount++;
      }
    }

    console.log(`[${new Date().toISOString()}] ✅ التحديث مكتمل:`);
    console.log(`   - ${updatedCount} وظيفة تم تحديثها`);
    console.log(`   - ${urgentCount} وظيفة عاجلة حالياً`);
    console.log(`   - ${expiredCount} وظيفة منتهية تم إغلاقها`);

    await mongoose.connection.close();
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ خطأ:`, error.message);
  }
}

// تشغيل السكريبت
updateUrgentJobsCron();
