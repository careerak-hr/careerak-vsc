/**
 * Checkpoint 4: التأكد من التوصيات الأساسية
 * 
 * هذا السكريبت يتحقق من:
 * 1. اختبار دقة التوصيات
 * 2. اختبار نسب التطابق
 * 3. مراجعة شرح التوصيات
 * 
 * Requirements: 1.1, 1.3, 1.4
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Services
const ContentBasedFiltering = require('../src/services/contentBasedFiltering');

// Models
const User = require('../src/models/User');
const JobPosting = require('../src/models/JobPosting');

const contentBasedFiltering = new ContentBasedFiltering();

// ============================================================================
// Helper Functions
// ============================================================================

function printHeader(title) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 ${title}`);
  console.log(`${'='.repeat(70)}\n`);
}

function printSection(title) {
  console.log(`\n${'─'.repeat(70)}`);
  console.log(`📋 ${title}`);
  console.log(`${'─'.repeat(70)}\n`);
}

function printSuccess(message) {
  console.log(`✅ ${message}`);
}

function printError(message) {
  console.log(`❌ ${message}`);
}

function printInfo(message) {
  console.log(`ℹ️  ${message}`);
}

// ============================================================================
// Test 1: اختبار دقة التوصيات
// ============================================================================

async function testRecommendationAccuracy() {
  printSection('Test 1: اختبار دقة التوصيات');

  try {
    // إنشاء مستخدم اختبار
    const testUser = await User.findOne({ email: 'checkpoint4-test@example.com' });
    let user;
    
    if (testUser) {
      user = testUser;
      printInfo('استخدام مستخدم اختبار موجود');
    } else {
      user = await User.create({
        name: 'Checkpoint 4 Test User',
        email: 'checkpoint4-test@example.com',
        password: 'hashedpassword123',
        role: 'job_seeker',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        experience: 3,
        education: 'Bachelor',
        location: 'Cairo',
        preferredJobType: 'full-time'
      });
      printSuccess('تم إنشاء مستخدم اختبار جديد');
    }

    // الحصول على التوصيات
    printInfo('جاري الحصول على التوصيات...');
    const recommendations = await contentBasedFiltering.getJobRecommendations(user._id, 10);

    if (!recommendations || recommendations.length === 0) {
      printError('لم يتم العثور على توصيات');
      return {
        passed: false,
        relevanceRate: 0,
        totalRecommendations: 0
      };
    }

    printSuccess(`تم الحصول على ${recommendations.length} توصية`);

    // تحليل التوصيات
    console.log(`\n📊 أفضل 5 توصيات:`);
    recommendations.slice(0, 5).forEach((rec, index) => {
      console.log(`\n${index + 1}. ${rec.job.title}`);
      console.log(`   📈 الدرجة: ${rec.score.toFixed(2)}`);
      console.log(`   📝 الأسباب: ${rec.reasons.length} سبب`);
      rec.reasons.slice(0, 2).forEach(reason => {
        console.log(`      - ${reason}`);
      });
    });

    // حساب نسبة التوصيات ذات الصلة
    const relevantRecommendations = recommendations.filter(rec => rec.score >= 50);
    const relevanceRate = (relevantRecommendations.length / recommendations.length) * 100;

    console.log(`\n📊 الإحصائيات:`);
    console.log(`   - إجمالي التوصيات: ${recommendations.length}`);
    console.log(`   - توصيات ذات صلة (≥50): ${relevantRecommendations.length}`);
    console.log(`   - نسبة الصلة: ${relevanceRate.toFixed(2)}%`);
    console.log(`   - متوسط الدرجة: ${(recommendations.reduce((sum, rec) => sum + rec.score, 0) / recommendations.length).toFixed(2)}`);

    // التحقق من المعيار (75% على الأقل)
    if (relevanceRate >= 75) {
      printSuccess(`نسبة الصلة ${relevanceRate.toFixed(2)}% تتجاوز المعيار (75%)`);
      return {
        passed: true,
        relevanceRate,
        totalRecommendations: recommendations.length
      };
    } else {
      printError(`نسبة الصلة ${relevanceRate.toFixed(2)}% أقل من المعيار (75%)`);
      return {
        passed: false,
        relevanceRate,
        totalRecommendations: recommendations.length
      };
    }

  } catch (error) {
    printError(`خطأ في اختبار دقة التوصيات: ${error.message}`);
    return {
      passed: false,
      error: error.message
    };
  }
}

// ============================================================================
// Test 2: اختبار نسب التطابق
// ============================================================================

async function testMatchScores() {
  printSection('Test 2: اختبار نسب التطابق');

  try {
    // الحصول على مستخدم ووظيفة للاختبار
    const user = await User.findOne({ role: 'job_seeker' }).limit(1);
    const jobs = await JobPosting.find({ status: 'active' }).limit(5);

    if (!user || jobs.length === 0) {
      printError('لا توجد بيانات كافية للاختبار');
      return { passed: false };
    }

    printInfo(`اختبار ${jobs.length} وظائف مع المستخدم: ${user.name}`);

    const scores = [];
    let allScoresValid = true;

    console.log(`\n📊 نتائج التطابق:`);
    for (const job of jobs) {
      const match = await contentBasedFiltering.calculateMatchScore(user, job);
      scores.push(match.score);

      console.log(`\n   ${job.title}:`);
      console.log(`   📈 الدرجة: ${match.score.toFixed(2)}`);
      console.log(`   📝 عدد الأسباب: ${match.reasons.length}`);

      // التحقق من صحة الدرجة
      if (match.score < 0 || match.score > 100 || isNaN(match.score)) {
        printError(`   ❌ درجة غير صالحة: ${match.score}`);
        allScoresValid = false;
      }
    }

    // الإحصائيات
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);

    console.log(`\n📊 الإحصائيات:`);
    console.log(`   - متوسط الدرجة: ${avgScore.toFixed(2)}`);
    console.log(`   - أقل درجة: ${minScore.toFixed(2)}`);
    console.log(`   - أعلى درجة: ${maxScore.toFixed(2)}`);

    if (allScoresValid) {
      printSuccess('جميع الدرجات صالحة (0-100)');
      return {
        passed: true,
        avgScore,
        minScore,
        maxScore
      };
    } else {
      printError('بعض الدرجات غير صالحة');
      return {
        passed: false,
        avgScore,
        minScore,
        maxScore
      };
    }

  } catch (error) {
    printError(`خطأ في اختبار نسب التطابق: ${error.message}`);
    return {
      passed: false,
      error: error.message
    };
  }
}

// ============================================================================
// Test 3: مراجعة شرح التوصيات
// ============================================================================

async function testExplanations() {
  printSection('Test 3: مراجعة شرح التوصيات');

  try {
    const user = await User.findOne({ role: 'job_seeker' }).limit(1);
    const jobs = await JobPosting.find({ status: 'active' }).limit(3);

    if (!user || jobs.length === 0) {
      printError('لا توجد بيانات كافية للاختبار');
      return { passed: false };
    }

    printInfo(`اختبار شرح التوصيات لـ ${jobs.length} وظائف`);

    let allHaveExplanations = true;
    let totalReasons = 0;

    console.log(`\n📝 شرح التوصيات:`);
    for (const job of jobs) {
      const match = await contentBasedFiltering.calculateMatchScore(user, job);

      console.log(`\n   ${job.title} (${match.score.toFixed(2)}):`);

      if (!match.reasons || match.reasons.length === 0) {
        printError(`   ❌ لا يوجد شرح`);
        allHaveExplanations = false;
      } else {
        printSuccess(`   ✅ ${match.reasons.length} سبب`);
        totalReasons += match.reasons.length;
        
        match.reasons.forEach((reason, index) => {
          console.log(`      ${index + 1}. ${reason}`);
        });
      }
    }

    const avgReasons = totalReasons / jobs.length;

    console.log(`\n📊 الإحصائيات:`);
    console.log(`   - متوسط عدد الأسباب: ${avgReasons.toFixed(2)}`);
    console.log(`   - إجمالي الأسباب: ${totalReasons}`);

    if (allHaveExplanations && avgReasons > 0) {
      printSuccess('جميع التوصيات تحتوي على شرح');
      return {
        passed: true,
        avgReasons,
        totalReasons
      };
    } else {
      printError('بعض التوصيات لا تحتوي على شرح');
      return {
        passed: false,
        avgReasons,
        totalReasons
      };
    }

  } catch (error) {
    printError(`خطأ في مراجعة شرح التوصيات: ${error.message}`);
    return {
      passed: false,
      error: error.message
    };
  }
}

// ============================================================================
// Main Function
// ============================================================================

async function runCheckpoint4() {
  printHeader('Checkpoint 4: التأكد من التوصيات الأساسية');

  try {
    // الاتصال بقاعدة البيانات
    printInfo('جاري الاتصال بقاعدة البيانات...');
    await mongoose.connect(process.env.MONGODB_URI);
    printSuccess('تم الاتصال بقاعدة البيانات');

    // تشغيل الاختبارات
    const results = {
      test1: await testRecommendationAccuracy(),
      test2: await testMatchScores(),
      test3: await testExplanations()
    };

    // ملخص النتائج
    printHeader('ملخص النتائج');

    console.log(`\n1️⃣  اختبار دقة التوصيات:`);
    if (results.test1.passed) {
      printSuccess(`نجح - نسبة الصلة: ${results.test1.relevanceRate?.toFixed(2)}%`);
    } else {
      printError(`فشل - ${results.test1.error || 'نسبة الصلة منخفضة'}`);
    }

    console.log(`\n2️⃣  اختبار نسب التطابق:`);
    if (results.test2.passed) {
      printSuccess(`نجح - متوسط الدرجة: ${results.test2.avgScore?.toFixed(2)}`);
    } else {
      printError(`فشل - ${results.test2.error || 'درجات غير صالحة'}`);
    }

    console.log(`\n3️⃣  مراجعة شرح التوصيات:`);
    if (results.test3.passed) {
      printSuccess(`نجح - متوسط الأسباب: ${results.test3.avgReasons?.toFixed(2)}`);
    } else {
      printError(`فشل - ${results.test3.error || 'شرح غير كافٍ'}`);
    }

    // النتيجة النهائية
    const allPassed = results.test1.passed && results.test2.passed && results.test3.passed;

    console.log(`\n${'='.repeat(70)}`);
    if (allPassed) {
      printSuccess('✅ Checkpoint 4 مكتمل بنجاح!');
      console.log(`\n🎉 جميع الاختبارات نجحت!`);
      console.log(`   - دقة التوصيات: ✅`);
      console.log(`   - نسب التطابق: ✅`);
      console.log(`   - شرح التوصيات: ✅`);
    } else {
      printError('❌ Checkpoint 4 فشل');
      console.log(`\n⚠️  بعض الاختبارات فشلت. يرجى مراجعة النتائج أعلاه.`);
    }
    console.log(`${'='.repeat(70)}\n`);

    return allPassed;

  } catch (error) {
    printError(`خطأ في تشغيل Checkpoint 4: ${error.message}`);
    console.error(error);
    return false;
  } finally {
    await mongoose.disconnect();
    printInfo('تم قطع الاتصال بقاعدة البيانات');
  }
}

// تشغيل السكريبت
if (require.main === module) {
  runCheckpoint4()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runCheckpoint4 };
