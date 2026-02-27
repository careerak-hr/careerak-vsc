/**
 * 🎯 Improve Recommendation Accuracy Script
 * سكريبت لتحسين دقة التوصيات بشكل دوري
 * 
 * يقوم بتحليل دقة التوصيات وتحديث النماذج بناءً على التفاعلات
 */

const mongoose = require('mongoose');
require('dotenv').config();

const RecommendationAccuracyService = require('../src/services/recommendationAccuracyService');
const ModelUpdateService = require('../src/services/modelUpdateService');
const UserInteractionService = require('../src/services/userInteractionService');

// الاتصال بقاعدة البيانات
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات');
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error.message);
    process.exit(1);
  }
}

// تحليل دقة النظام
async function analyzeSystemAccuracy() {
  console.log('\n📊 تحليل دقة التوصيات على مستوى النظام...\n');
  
  const accuracyService = new RecommendationAccuracyService();
  
  try {
    const result = await accuracyService.calculateSystemAccuracy({
      itemType: 'job',
      period: 30 * 24 * 60 * 60 * 1000, // آخر 30 يوم
      sampleSize: 100
    });
    
    if (result.status === 'success') {
      console.log('✅ تحليل دقة النظام:');
      console.log(`   الدقة الإجمالية: ${(result.accuracy.overall * 100).toFixed(1)}%`);
      console.log(`   المستوى: ${result.level.label}`);
      console.log(`   عدد المستخدمين: ${result.sampleSize}`);
      console.log(`   معدل التفاعل: ${(result.accuracy.avgInteractionRate * 100).toFixed(1)}%`);
      
      console.log('\n📈 التوزيع حسب المستوى:');
      Object.entries(result.accuracy.distributionPercentage).forEach(([level, percentage]) => {
        console.log(`   ${level}: ${percentage}%`);
      });
      
      if (result.report.insights.length > 0) {
        console.log('\n💡 الرؤى:');
        result.report.insights.forEach(insight => {
          console.log(`   [${insight.type}] ${insight.message}`);
        });
      }
      
      return result;
    } else {
      console.log('⚠️ لا توجد بيانات كافية لتحليل دقة النظام');
      return null;
    }
  } catch (error) {
    console.error('❌ خطأ في تحليل دقة النظام:', error.message);
    return null;
  }
}

// تحديث النماذج بناءً على التفاعلات
async function updateModels() {
  console.log('\n🔄 تحديث نماذج التوصيات...\n');
  
  const modelUpdateService = new ModelUpdateService();
  
  try {
    const result = await modelUpdateService.retrainModels();
    
    if (result.status === 'success') {
      console.log('✅ تم تحديث النماذج بنجاح');
      console.log(`   إجمالي التفاعلات: ${result.data.interactionStats.totalInteractions}`);
      console.log(`   المستخدمون المحللون: ${result.data.userPreferences.totalUsersAnalyzed}`);
      
      if (result.data.updatedWeights) {
        console.log('\n⚖️ الأوزان المحدثة:');
        Object.entries(result.data.updatedWeights).forEach(([key, value]) => {
          if (typeof value === 'number') {
            console.log(`   ${key}: ${(value * 100).toFixed(1)}%`);
          }
        });
      }
      
      return result;
    } else if (result.status === 'insufficient_data') {
      console.log('⚠️ لا توجد تفاعلات كافية لإعادة تدوير النماذج');
      return null;
    } else {
      console.log('❌ فشل تحديث النماذج:', result.message);
      return null;
    }
  } catch (error) {
    console.error('❌ خطأ في تحديث النماذج:', error.message);
    return null;
  }
}

// تحليل أفضل وأسوأ المستخدمين من حيث الدقة
async function analyzeTopAndBottomUsers() {
  console.log('\n👥 تحليل أفضل وأسوأ المستخدمين من حيث دقة التوصيات...\n');
  
  const accuracyService = new RecommendationAccuracyService();
  const UserInteraction = require('../src/models/UserInteraction');
  
  try {
    // جلب عينة من المستخدمين النشطين
    const activeUsers = await UserInteraction.aggregate([
      {
        $group: {
          _id: '$userId',
          interactionCount: { $sum: 1 }
        }
      },
      { $sort: { interactionCount: -1 } },
      { $limit: 20 }
    ]);
    
    if (activeUsers.length === 0) {
      console.log('⚠️ لا توجد مستخدمين نشطين');
      return;
    }
    
    // حساب الدقة لكل مستخدم
    const userAccuracies = [];
    for (const user of activeUsers) {
      try {
        const accuracy = await accuracyService.calculateUserAccuracy(user._id, {
          itemType: 'job',
          period: 30 * 24 * 60 * 60 * 1000
        });
        
        if (accuracy.status === 'success') {
          userAccuracies.push({
            userId: user._id,
            accuracy: accuracy.accuracy.overall,
            level: accuracy.level.level,
            interactionCount: user.interactionCount
          });
        }
      } catch (error) {
        // تخطي المستخدمين الذين يحدث خطأ في تحليلهم
      }
    }
    
    if (userAccuracies.length === 0) {
      console.log('⚠️ لا توجد بيانات دقة كافية');
      return;
    }
    
    // ترتيب حسب الدقة
    userAccuracies.sort((a, b) => b.accuracy - a.accuracy);
    
    // أفضل 5 مستخدمين
    console.log('🏆 أفضل 5 مستخدمين (دقة عالية):');
    userAccuracies.slice(0, 5).forEach((user, index) => {
      console.log(`   ${index + 1}. المستخدم ${user.userId}`);
      console.log(`      الدقة: ${(user.accuracy * 100).toFixed(1)}%`);
      console.log(`      المستوى: ${user.level}`);
      console.log(`      التفاعلات: ${user.interactionCount}`);
    });
    
    // أسوأ 5 مستخدمين
    console.log('\n⚠️ أسوأ 5 مستخدمين (دقة منخفضة):');
    userAccuracies.slice(-5).reverse().forEach((user, index) => {
      console.log(`   ${index + 1}. المستخدم ${user.userId}`);
      console.log(`      الدقة: ${(user.accuracy * 100).toFixed(1)}%`);
      console.log(`      المستوى: ${user.level}`);
      console.log(`      التفاعلات: ${user.interactionCount}`);
    });
    
  } catch (error) {
    console.error('❌ خطأ في تحليل المستخدمين:', error.message);
  }
}

// توليد تقرير شامل
async function generateReport(systemAccuracy, modelUpdate) {
  console.log('\n📄 توليد التقرير الشامل...\n');
  
  const report = {
    timestamp: new Date(),
    systemAccuracy: systemAccuracy ? {
      overall: systemAccuracy.accuracy.overall,
      level: systemAccuracy.level.label,
      sampleSize: systemAccuracy.sampleSize,
      distribution: systemAccuracy.accuracy.distributionPercentage
    } : null,
    modelUpdate: modelUpdate ? {
      status: modelUpdate.status,
      totalInteractions: modelUpdate.data?.interactionStats?.totalInteractions,
      usersAnalyzed: modelUpdate.data?.userPreferences?.totalUsersAnalyzed
    } : null,
    recommendations: []
  };
  
  // إضافة توصيات بناءً على النتائج
  if (systemAccuracy) {
    if (systemAccuracy.accuracy.overall < 0.45) {
      report.recommendations.push({
        priority: 'high',
        message: 'دقة النظام منخفضة. يُنصح بإعادة تدوير النماذج فوراً.',
        action: 'retrain_models'
      });
    }
    
    if (systemAccuracy.accuracy.avgInteractionRate < 0.3) {
      report.recommendations.push({
        priority: 'medium',
        message: 'معدل التفاعل منخفض. يُنصح بتحسين جودة التوصيات.',
        action: 'improve_recommendations'
      });
    }
    
    if (systemAccuracy.accuracy.distributionPercentage.poor > 30) {
      report.recommendations.push({
        priority: 'high',
        message: 'أكثر من 30% من المستخدمين يحصلون على توصيات ضعيفة.',
        action: 'review_algorithm'
      });
    }
  }
  
  console.log('✅ التقرير:');
  console.log(JSON.stringify(report, null, 2));
  
  return report;
}

// الدالة الرئيسية
async function main() {
  console.log('🎯 بدء تحسين دقة التوصيات...\n');
  console.log('=' .repeat(60));
  
  try {
    // الاتصال بقاعدة البيانات
    await connectDB();
    
    // 1. تحليل دقة النظام
    const systemAccuracy = await analyzeSystemAccuracy();
    
    // 2. تحديث النماذج
    const modelUpdate = await updateModels();
    
    // 3. تحليل أفضل وأسوأ المستخدمين
    await analyzeTopAndBottomUsers();
    
    // 4. توليد التقرير
    const report = await generateReport(systemAccuracy, modelUpdate);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ اكتمل تحسين دقة التوصيات بنجاح!');
    
  } catch (error) {
    console.error('\n❌ خطأ في تحسين دقة التوصيات:', error.message);
    process.exit(1);
  } finally {
    // إغلاق الاتصال بقاعدة البيانات
    await mongoose.connection.close();
    console.log('\n👋 تم إغلاق الاتصال بقاعدة البيانات');
  }
}

// تشغيل السكريبت
if (require.main === module) {
  main();
}

module.exports = { main, analyzeSystemAccuracy, updateModels };
