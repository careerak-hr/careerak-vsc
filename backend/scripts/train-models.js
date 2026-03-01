/**
 * Model Training Script
 * 
 * سكريبت لتشغيل pipeline تدريب النماذج
 * 
 * الاستخدام:
 * node scripts/train-models.js
 * node scripts/train-models.js --models content_based,hybrid
 * node scripts/train-models.js --test-size 0.3
 * node scripts/train-models.js --min-interactions 20
 */

require('dotenv').config();
const mongoose = require('mongoose');
const ModelTrainingPipeline = require('../src/services/modelTrainingPipeline');

// معالجة الأرجومنتات
const args = process.argv.slice(2);
const options = {
  modelTypes: ['content_based', 'collaborative', 'hybrid'],
  testSize: 0.2,
  minInteractions: 10,
  saveModels: true
};

// تحليل الأرجومنتات
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--models' && args[i + 1]) {
    options.modelTypes = args[i + 1].split(',');
    i++;
  } else if (args[i] === '--test-size' && args[i + 1]) {
    options.testSize = parseFloat(args[i + 1]);
    i++;
  } else if (args[i] === '--min-interactions' && args[i + 1]) {
    options.minInteractions = parseInt(args[i + 1]);
    i++;
  } else if (args[i] === '--no-save') {
    options.saveModels = false;
  }
}

async function main() {
  try {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║         Model Training Pipeline - Careerak AI              ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // الاتصال بقاعدة البيانات
    console.log('🔌 الاتصال بقاعدة البيانات...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بنجاح\n');

    // عرض الإعدادات
    console.log('⚙️  إعدادات التدريب:');
    console.log(`   - النماذج: ${options.modelTypes.join(', ')}`);
    console.log(`   - حجم الاختبار: ${(options.testSize * 100).toFixed(0)}%`);
    console.log(`   - الحد الأدنى للتفاعلات: ${options.minInteractions}`);
    console.log(`   - حفظ النماذج: ${options.saveModels ? 'نعم' : 'لا'}\n`);

    // تشغيل pipeline
    const pipeline = new ModelTrainingPipeline();
    const result = await pipeline.runFullPipeline(options);

    // عرض النتائج
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    نتائج التدريب                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('📊 ملخص النماذج:\n');
    
    for (const model of result.trainedModels) {
      console.log(`🎯 ${model.modelType.toUpperCase()}`);
      console.log(`   Version: ${model.version}`);
      console.log(`   Accuracy: ${(model.metrics.accuracy * 100).toFixed(2)}%`);
      console.log(`   Precision: ${(model.metrics.precision * 100).toFixed(2)}%`);
      console.log(`   Recall: ${(model.metrics.recall * 100).toFixed(2)}%`);
      console.log(`   F1-Score: ${(model.metrics.f1Score * 100).toFixed(2)}%`);
      console.log(`   NDCG: ${(model.metrics.ndcg * 100).toFixed(2)}%`);
      console.log(`   MRR: ${(model.metrics.mrr * 100).toFixed(2)}%`);
      console.log(`   Training Time: ${model.trainingTime.toFixed(2)}s`);
      console.log('');
    }

    console.log('🏆 أفضل نموذج:');
    console.log(`   ${result.bestModel.modelType.toUpperCase()}`);
    console.log(`   F1-Score: ${(result.bestModel.metrics.f1Score * 100).toFixed(2)}%\n`);

    // عرض التوصيات
    if (result.report.recommendations.length > 0) {
      console.log('💡 توصيات للتحسين:\n');
      
      for (const rec of result.report.recommendations) {
        console.log(`   ⚠️  ${rec.model}: ${rec.issue}`);
        console.log(`      → ${rec.suggestion}\n`);
      }
    } else {
      console.log('✅ جميع النماذج تعمل بشكل ممتاز!\n');
    }

    // حفظ التقرير
    const fs = require('fs');
    const reportPath = `./training-reports/report-${Date.now()}.json`;
    
    // إنشاء المجلد إذا لم يكن موجوداً
    if (!fs.existsSync('./training-reports')) {
      fs.mkdirSync('./training-reports', { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(result.report, null, 2));
    console.log(`📄 تم حفظ التقرير: ${reportPath}\n`);

    console.log('✅ اكتمل التدريب بنجاح!');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ خطأ في التدريب:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// معالجة الإشارات
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  تم إيقاف التدريب...');
  await mongoose.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n⚠️  تم إيقاف التدريب...');
  await mongoose.disconnect();
  process.exit(0);
});

// تشغيل
main();
