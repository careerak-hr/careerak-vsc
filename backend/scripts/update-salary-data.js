/**
 * سكريبت لتحديث بيانات الرواتب بشكل دوري
 * يجب تشغيله شهرياً عبر cron job
 * 
 * الاستخدام:
 * node scripts/update-salary-data.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const salaryEstimatorService = require('../src/services/salaryEstimatorService');
const logger = require('../src/utils/logger');

async function main() {
  try {
    // الاتصال بقاعدة البيانات
    logger.info('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to database successfully');

    // تحديث بيانات الرواتب
    logger.info('Starting salary data update...');
    const result = await salaryEstimatorService.updateSalaryData();
    
    logger.info('Salary data update completed:');
    logger.info(`- Total jobs processed: ${result.totalJobs}`);
    logger.info(`- Salary groups created: ${result.groups}`);
    logger.info(`- Records created: ${result.created}`);
    logger.info(`- Records updated: ${result.updated}`);

    // حذف البيانات القديمة
    logger.info('Cleaning up old salary data...');
    const cleanupResult = await salaryEstimatorService.cleanupOldData();
    logger.info(`Deleted ${cleanupResult.deletedCount} old records`);

    // عرض الإحصائيات
    logger.info('Getting salary statistics...');
    const statistics = await salaryEstimatorService.getStatistics();
    logger.info(`Total salary records: ${statistics.totalRecords}`);
    logger.info('Top 5 fields by salary data:');
    statistics.byField.slice(0, 5).forEach((field, index) => {
      logger.info(`  ${index + 1}. ${field._id}: ${field.count} records, avg salary: ${Math.round(field.avgSalary)} SAR`);
    });

    logger.info('✅ Salary data update completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error updating salary data:', error);
    process.exit(1);
  }
}

// تشغيل السكريبت
main();
