/**
 * سكريبت مراقبة تحليلات المشاركة - الأسبوع الأول
 * First Week Share Analytics Monitoring Script
 *
 * الاستخدام / Usage:
 *   node backend/scripts/monitor-share-analytics-week1.js
 *
 * يتصل مباشرة بـ MongoDB ويولد تقرير شامل لأول أسبوع من تشغيل ميزة المشاركة.
 * Connects directly to MongoDB and generates a comprehensive report for the first week.
 */

'use strict';

const path = require('path');
const fs = require('fs');

// تحميل متغيرات البيئة من backend/.env
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');

// ===== الإعدادات / Configuration =====
const PERIOD_DAYS = 7;
const TOP_CONTENT_LIMIT = 10;
const REPORT_OUTPUT_PATH = path.join(__dirname, '..', 'exports', 'share-analytics-week1-report.json');

// ===== التسميات العربية / Arabic Labels =====
const LABELS = {
  contentTypes: {
    job:     'وظيفة',
    course:  'دورة',
    profile: 'ملف شخصي',
    company: 'شركة'
  },
  shareMethods: {
    facebook:      'فيسبوك',
    twitter:       'تويتر',
    linkedin:      'لينكدإن',
    whatsapp:      'واتساب',
    telegram:      'تيليغرام',
    email:         'بريد إلكتروني',
    copy_link:     'نسخ الرابط',
    internal_chat: 'دردشة داخلية',
    native:        'مشاركة أصلية',
    copy:          'نسخ'
  }
};

// ===== الاتصال بقاعدة البيانات / DB Connection =====
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI غير موجود في ملف .env');
  }
  await mongoose.connect(uri);
  console.log('✅ تم الاتصال بقاعدة البيانات');
}

// ===== بناء فلتر التاريخ / Build Date Filter =====
function buildDateFilter(days) {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  startDate.setHours(0, 0, 0, 0);

  // يدعم كلا الحقلين: createdAt (timestamps:true) و timestamp (الحقل القديم)
  const dateRange = { $gte: startDate, $lte: endDate };
  return {
    filter: { $or: [{ createdAt: dateRange }, { timestamp: dateRange }] },
    startDate,
    endDate
  };
}

// ===== جمع البيانات / Data Collection =====
async function collectAnalytics(Share, filter, startDate, endDate) {
  const [
    totalShares,
    byContentType,
    byPlatform,
    topContent,
    dailyTrend,
    uniqueUsersResult
  ] = await Promise.all([
    // إجمالي المشاركات
    Share.countDocuments(filter),

    // المشاركات حسب نوع المحتوى
    Share.aggregate([
      { $match: filter },
      { $group: { _id: '$contentType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),

    // المشاركات حسب المنصة/الطريقة
    Share.aggregate([
      { $match: filter },
      { $group: { _id: '$shareMethod', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),

    // أكثر 10 محتويات مشاركة
    Share.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { contentType: '$contentType', contentId: '$contentId' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: TOP_CONTENT_LIMIT },
      {
        $project: {
          _id: 0,
          contentType: '$_id.contentType',
          contentId: '$_id.contentId',
          shareCount: '$count'
        }
      }
    ]),

    // الاتجاه اليومي (يوم بيوم)
    Share.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: {
                $ifNull: ['$createdAt', '$timestamp']
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // المستخدمون الفريدون الذين شاركوا
    Share.aggregate([
      { $match: { ...filter, userId: { $ne: null } } },
      { $group: { _id: '$userId' } },
      { $count: 'uniqueUsers' }
    ])
  ]);

  // يوم الذروة
  let peakDay = null;
  let peakCount = 0;
  for (const day of dailyTrend) {
    if (day.count > peakCount) {
      peakCount = day.count;
      peakDay = day._id;
    }
  }

  const uniqueUsers = uniqueUsersResult.length > 0 ? uniqueUsersResult[0].uniqueUsers : 0;

  return {
    totalShares,
    byContentType,
    byPlatform,
    topContent,
    dailyTrend,
    uniqueUsers,
    peakDay,
    peakCount,
    startDate,
    endDate
  };
}

// ===== طباعة التقرير / Print Report =====
function printReport(data) {
  const sep = '═'.repeat(60);
  const line = '─'.repeat(60);

  console.log('\n' + sep);
  console.log('  📊 تقرير تحليلات المشاركة - الأسبوع الأول');
  console.log('  Share Analytics Report - Week 1');
  console.log(sep);

  console.log(`\n📅 الفترة / Period: ${data.startDate.toLocaleDateString('ar-EG')} → ${data.endDate.toLocaleDateString('ar-EG')}`);
  console.log(`🕐 تاريخ التقرير / Generated: ${new Date().toLocaleString('ar-EG')}`);

  // ===== الإجمالي =====
  console.log('\n' + line);
  console.log('  📈 الإجمالي / Overview');
  console.log(line);

  if (data.totalShares === 0) {
    console.log('  ⚠️  لا توجد مشاركات في هذه الفترة / No shares in this period');
  } else {
    console.log(`  إجمالي المشاركات / Total Shares:    ${data.totalShares}`);
    console.log(`  مستخدمون فريدون / Unique Users:     ${data.uniqueUsers}`);
    console.log(`  يوم الذروة / Peak Day:              ${data.peakDay || 'N/A'} (${data.peakCount} مشاركة)`);
  }

  // ===== حسب نوع المحتوى =====
  console.log('\n' + line);
  console.log('  📂 المشاركات حسب نوع المحتوى / By Content Type');
  console.log(line);

  if (data.byContentType.length === 0) {
    console.log('  لا بيانات / No data');
  } else {
    for (const item of data.byContentType) {
      const label = LABELS.contentTypes[item._id] || item._id;
      const bar = '█'.repeat(Math.min(Math.round((item.count / data.totalShares) * 30), 30));
      const pct = data.totalShares > 0 ? ((item.count / data.totalShares) * 100).toFixed(1) : '0.0';
      console.log(`  ${label.padEnd(16)} ${String(item.count).padStart(5)}  ${bar} ${pct}%`);
    }
  }

  // ===== حسب المنصة =====
  console.log('\n' + line);
  console.log('  🌐 المشاركات حسب المنصة / By Platform');
  console.log(line);

  if (data.byPlatform.length === 0) {
    console.log('  لا بيانات / No data');
  } else {
    for (const item of data.byPlatform) {
      const label = LABELS.shareMethods[item._id] || item._id;
      const bar = '█'.repeat(Math.min(Math.round((item.count / data.totalShares) * 30), 30));
      const pct = data.totalShares > 0 ? ((item.count / data.totalShares) * 100).toFixed(1) : '0.0';
      console.log(`  ${label.padEnd(20)} ${String(item.count).padStart(5)}  ${bar} ${pct}%`);
    }
  }

  // ===== أكثر المحتويات مشاركة =====
  console.log('\n' + line);
  console.log(`  🏆 أكثر ${TOP_CONTENT_LIMIT} محتويات مشاركة / Top ${TOP_CONTENT_LIMIT} Shared Content`);
  console.log(line);

  if (data.topContent.length === 0) {
    console.log('  لا بيانات / No data');
  } else {
    data.topContent.forEach((item, idx) => {
      const typeLabel = LABELS.contentTypes[item.contentType] || item.contentType;
      console.log(`  ${String(idx + 1).padStart(2)}. [${typeLabel}] ${item.contentId}  →  ${item.shareCount} مشاركة`);
    });
  }

  // ===== الاتجاه اليومي =====
  console.log('\n' + line);
  console.log('  📅 الاتجاه اليومي / Daily Trend');
  console.log(line);

  if (data.dailyTrend.length === 0) {
    console.log('  لا بيانات / No data');
  } else {
    const maxCount = Math.max(...data.dailyTrend.map(d => d.count), 1);
    for (const day of data.dailyTrend) {
      const bar = '█'.repeat(Math.min(Math.round((day.count / maxCount) * 30), 30));
      console.log(`  ${day._id}  ${String(day.count).padStart(5)}  ${bar}`);
    }
  }

  console.log('\n' + sep);
  console.log(`  ✅ تم حفظ التقرير في: ${REPORT_OUTPUT_PATH}`);
  console.log(sep + '\n');
}

// ===== بناء كائن JSON للتقرير / Build JSON Report =====
function buildJsonReport(data) {
  return {
    reportTitle: 'تقرير تحليلات المشاركة - الأسبوع الأول / Share Analytics Week 1 Report',
    generatedAt: new Date().toISOString(),
    period: {
      days: PERIOD_DAYS,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString()
    },
    overview: {
      totalShares: data.totalShares,
      uniqueUsers: data.uniqueUsers,
      peakDay: data.peakDay,
      peakDayCount: data.peakCount
    },
    byContentType: data.byContentType.map(item => ({
      contentType: item._id,
      label: LABELS.contentTypes[item._id] || item._id,
      count: item.count,
      percentage: data.totalShares > 0
        ? parseFloat(((item.count / data.totalShares) * 100).toFixed(2))
        : 0
    })),
    byPlatform: data.byPlatform.map(item => ({
      platform: item._id,
      label: LABELS.shareMethods[item._id] || item._id,
      count: item.count,
      percentage: data.totalShares > 0
        ? parseFloat(((item.count / data.totalShares) * 100).toFixed(2))
        : 0
    })),
    topContent: data.topContent.map((item, idx) => ({
      rank: idx + 1,
      contentType: item.contentType,
      contentTypeLabel: LABELS.contentTypes[item.contentType] || item.contentType,
      contentId: String(item.contentId),
      shareCount: item.shareCount
    })),
    dailyTrend: data.dailyTrend.map(day => ({
      date: day._id,
      count: day.count
    }))
  };
}

// ===== حفظ التقرير / Save Report =====
function saveReport(report) {
  const dir = path.dirname(REPORT_OUTPUT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(REPORT_OUTPUT_PATH, JSON.stringify(report, null, 2), 'utf8');
}

// ===== الدالة الرئيسية / Main =====
async function main() {
  try {
    await connectDB();

    // تحميل نموذج Share
    const Share = require('../src/models/Share');

    const { filter, startDate, endDate } = buildDateFilter(PERIOD_DAYS);

    console.log(`\n🔍 جاري تحليل بيانات آخر ${PERIOD_DAYS} أيام...`);

    const data = await collectAnalytics(Share, filter, startDate, endDate);

    printReport(data);

    const jsonReport = buildJsonReport(data);
    saveReport(jsonReport);

    console.log('✅ اكتمل التقرير بنجاح / Report completed successfully\n');
  } catch (err) {
    console.error('❌ خطأ / Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();
