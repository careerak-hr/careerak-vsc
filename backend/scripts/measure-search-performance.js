/**
 * سكريبت قياس مؤشرات الأداء (KPIs) لنظام البحث والفلترة
 * 
 * يقيس:
 * 1. سرعة البحث: < 500ms
 * 2. معدل استخدام الفلاتر: > 60%
 * 3. معدل حفظ عمليات البحث: > 30%
 * 4. معدل تفعيل التنبيهات: > 20%
 * 5. معدل استخدام Map View: > 15%
 */

const mongoose = require('mongoose');
const SearchHistory = require('../src/models/SearchHistory');
const SavedSearch = require('../src/models/SavedSearch');
const SearchAlert = require('../src/models/SearchAlert');
const JobPosting = require('../src/models/JobPosting');

// الألوان للطباعة
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function printHeader(title) {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.cyan}${title}${colors.reset}`);
  console.log('='.repeat(60));
}

function printMetric(name, value, target, unit = '') {
  const status = value >= target ? '✅' : '❌';
  const color = value >= target ? colors.green : colors.red;
  console.log(`${status} ${name}: ${color}${value}${unit}${colors.reset} (الهدف: ${target}${unit})`);
}

async function measureSearchSpeed() {
  printHeader('KPI 1: سرعة البحث');

  const queries = ['developer', 'designer', 'manager', 'engineer', 'analyst'];
  const durations = [];

  for (const query of queries) {
    const start = Date.now();
    
    await JobPosting.find({
      $text: { $search: query }
    }).limit(20).lean();
    
    const duration = Date.now() - start;
    durations.push(duration);
    
    console.log(`  "${query}": ${duration}ms`);
  }

  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const maxDuration = Math.max(...durations);

  console.log(`\n📊 متوسط الوقت: ${avgDuration.toFixed(0)}ms`);
  console.log(`📊 أقصى وقت: ${maxDuration}ms`);
  
  printMetric('متوسط سرعة البحث', avgDuration.toFixed(0), 500, 'ms');
  printMetric('أقصى سرعة بحث', maxDuration, 500, 'ms');

  return {
    avgDuration,
    maxDuration,
    target: 500,
    passed: avgDuration < 500 && maxDuration < 500
  };
}

async function measureFilterUsage() {
  printHeader('KPI 2: معدل استخدام الفلاتر');

  // حساب عمليات البحث في آخر 30 يوم
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const totalSearches = await SearchHistory.countDocuments({
    timestamp: { $gte: thirtyDaysAgo }
  });

  const searchesWithFilters = await SearchHistory.countDocuments({
    timestamp: { $gte: thirtyDaysAgo },
    filters: { $exists: true, $ne: {} }
  });

  const filterUsageRate = totalSearches > 0 
    ? (searchesWithFilters / totalSearches * 100).toFixed(1)
    : 0;

  console.log(`📊 إجمالي عمليات البحث: ${totalSearches}`);
  console.log(`📊 عمليات بحث مع فلاتر: ${searchesWithFilters}`);
  
  printMetric('معدل استخدام الفلاتر', filterUsageRate, 60, '%');

  return {
    totalSearches,
    searchesWithFilters,
    rate: parseFloat(filterUsageRate),
    target: 60,
    passed: parseFloat(filterUsageRate) >= 60
  };
}

async function measureSavedSearchRate() {
  printHeader('KPI 3: معدل حفظ عمليات البحث');

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // عدد المستخدمين الذين بحثوا
  const uniqueSearchers = await SearchHistory.distinct('userId', {
    timestamp: { $gte: thirtyDaysAgo }
  });

  // عدد المستخدمين الذين حفظوا بحث
  const uniqueSavers = await SavedSearch.distinct('userId', {
    createdAt: { $gte: thirtyDaysAgo }
  });

  const savedSearchRate = uniqueSearchers.length > 0
    ? (uniqueSavers.length / uniqueSearchers.length * 100).toFixed(1)
    : 0;

  console.log(`📊 مستخدمون بحثوا: ${uniqueSearchers.length}`);
  console.log(`📊 مستخدمون حفظوا بحث: ${uniqueSavers.length}`);
  
  printMetric('معدل حفظ عمليات البحث', savedSearchRate, 30, '%');

  return {
    uniqueSearchers: uniqueSearchers.length,
    uniqueSavers: uniqueSavers.length,
    rate: parseFloat(savedSearchRate),
    target: 30,
    passed: parseFloat(savedSearchRate) >= 30
  };
}

async function measureAlertActivationRate() {
  printHeader('KPI 4: معدل تفعيل التنبيهات');

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // عدد المستخدمين الذين حفظوا بحث
  const uniqueSavers = await SavedSearch.distinct('userId', {
    createdAt: { $gte: thirtyDaysAgo }
  });

  // عدد المستخدمين الذين فعّلوا تنبيهات
  const uniqueAlertUsers = await SearchAlert.distinct('userId', {
    createdAt: { $gte: thirtyDaysAgo },
    isActive: true
  });

  const alertActivationRate = uniqueSavers.length > 0
    ? (uniqueAlertUsers.length / uniqueSavers.length * 100).toFixed(1)
    : 0;

  console.log(`📊 مستخدمون حفظوا بحث: ${uniqueSavers.length}`);
  console.log(`📊 مستخدمون فعّلوا تنبيهات: ${uniqueAlertUsers.length}`);
  
  printMetric('معدل تفعيل التنبيهات', alertActivationRate, 20, '%');

  return {
    uniqueSavers: uniqueSavers.length,
    uniqueAlertUsers: uniqueAlertUsers.length,
    rate: parseFloat(alertActivationRate),
    target: 20,
    passed: parseFloat(alertActivationRate) >= 20
  };
}

async function measureMapViewUsage() {
  printHeader('KPI 5: معدل استخدام Map View');

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // عمليات البحث العادية
  const totalSearches = await SearchHistory.countDocuments({
    timestamp: { $gte: thirtyDaysAgo }
  });

  // عمليات البحث على الخريطة (تحتوي على bounds)
  const mapSearches = await SearchHistory.countDocuments({
    timestamp: { $gte: thirtyDaysAgo },
    'filters.bounds': { $exists: true }
  });

  const mapViewUsageRate = totalSearches > 0
    ? (mapSearches / totalSearches * 100).toFixed(1)
    : 0;

  console.log(`📊 إجمالي عمليات البحث: ${totalSearches}`);
  console.log(`📊 عمليات بحث على الخريطة: ${mapSearches}`);
  
  printMetric('معدل استخدام Map View', mapViewUsageRate, 15, '%');

  return {
    totalSearches,
    mapSearches,
    rate: parseFloat(mapViewUsageRate),
    target: 15,
    passed: parseFloat(mapViewUsageRate) >= 15
  };
}

async function generateReport(results) {
  printHeader('📊 ملخص مؤشرات الأداء (KPIs)');

  const allPassed = Object.values(results).every(r => r.passed);

  console.log('\n');
  Object.entries(results).forEach(([key, result]) => {
    const status = result.passed ? '✅' : '❌';
    const color = result.passed ? colors.green : colors.red;
    console.log(`${status} ${key}: ${color}${result.rate || result.avgDuration}${result.rate ? '%' : 'ms'}${colors.reset}`);
  });

  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log(`${colors.green}✅ جميع مؤشرات الأداء تلبي المتطلبات!${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ بعض مؤشرات الأداء لا تلبي المتطلبات${colors.reset}`);
  }
  console.log('='.repeat(60) + '\n');

  return allPassed;
}

async function main() {
  try {
    console.log(`${colors.cyan}🚀 بدء قياس مؤشرات الأداء...${colors.reset}\n`);

    // الاتصال بقاعدة البيانات
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`${colors.green}✅ تم الاتصال بقاعدة البيانات${colors.reset}\n`);

    // قياس جميع المؤشرات
    const results = {
      'سرعة البحث': await measureSearchSpeed(),
      'معدل استخدام الفلاتر': await measureFilterUsage(),
      'معدل حفظ عمليات البحث': await measureSavedSearchRate(),
      'معدل تفعيل التنبيهات': await measureAlertActivationRate(),
      'معدل استخدام Map View': await measureMapViewUsage()
    };

    // توليد التقرير
    const allPassed = await generateReport(results);

    // إغلاق الاتصال
    await mongoose.connection.close();

    // الخروج بالكود المناسب
    process.exit(allPassed ? 0 : 1);

  } catch (error) {
    console.error(`${colors.red}❌ خطأ: ${error.message}${colors.reset}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// تشغيل السكريبت
if (require.main === module) {
  main();
}

module.exports = {
  measureSearchSpeed,
  measureFilterUsage,
  measureSavedSearchRate,
  measureAlertActivationRate,
  measureMapViewUsage
};
