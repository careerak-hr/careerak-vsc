/**
 * سكريبت تحديث معدلات استجابة الشركات
 * يُشغل دورياً (شهرياً) لتحديث معدلات الاستجابة لجميع الشركات
 * 
 * الاستخدام:
 * node scripts/update-company-response-rates.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const companyResponseRateService = require('../src/services/companyResponseRateService');

async function updateAllCompanyResponseRates() {
  try {
    console.log('🚀 بدء تحديث معدلات استجابة الشركات...\n');
    
    // الاتصال بقاعدة البيانات
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات\n');
    
    // تحديث معدلات الاستجابة
    const results = await companyResponseRateService.updateAllCompaniesResponseRates();
    
    console.log('\n📊 نتائج التحديث:');
    console.log(`   إجمالي الشركات: ${results.total}`);
    console.log(`   ✅ تم التحديث: ${results.updated}`);
    console.log(`   ❌ فشل: ${results.failed}`);
    
    if (results.errors.length > 0) {
      console.log('\n⚠️  الأخطاء:');
      results.errors.forEach(error => {
        console.log(`   - الشركة ${error.companyId}: ${error.error}`);
      });
    }
    
    console.log('\n✅ اكتمل التحديث بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في تحديث معدلات الاستجابة:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 تم قطع الاتصال بقاعدة البيانات');
    process.exit(0);
  }
}

// تشغيل السكريبت
updateAllCompanyResponseRates();
