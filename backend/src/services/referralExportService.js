/**
 * Referral Export Service
 * تصدير تقارير الإحالات والمكافآت بصيغة PDF أو Excel
 * Requirements: 7.4
 */

const XLSX = require('xlsx');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const Referral = require('../models/Referral');
const PointsTransaction = require('../models/PointsTransaction');
const { User } = require('../models/User');

// ألوان المشروع
const COLORS = {
  primary: [48, 75, 96],    // #304B60
  secondary: [227, 218, 209], // #E3DAD1
  accent: [212, 129, 97],   // #D48161
  white: [255, 255, 255],
  text: [44, 62, 80]
};

/**
 * جلب بيانات الإحالات الشخصية للمستخدم
 */
async function fetchUserReferralData(userId) {
  const [referrals, transactions, user] = await Promise.all([
    Referral.find({ referrerId: userId })
      .populate('referredUserId', 'name email createdAt')
      .sort({ createdAt: -1 })
      .lean(),
    PointsTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .lean(),
    User.findById(userId).select('name email pointsBalance').lean()
  ]);

  // حساب الإحصائيات
  const totalReferrals = referrals.length;
  const completedReferrals = referrals.filter(r => r.status === 'completed').length;
  const conversionRate = totalReferrals > 0
    ? Math.round((completedReferrals / totalReferrals) * 100)
    : 0;

  const totalEarned = transactions
    .filter(t => t.type === 'earn')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRedeemed = transactions
    .filter(t => t.type === 'redeem')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    user,
    referrals,
    transactions,
    stats: {
      totalReferrals,
      completedReferrals,
      pendingReferrals: referrals.filter(r => r.status === 'pending').length,
      cancelledReferrals: referrals.filter(r => r.status === 'cancelled').length,
      conversionRate,
      totalEarned,
      totalRedeemed,
      currentBalance: user?.pointsBalance || 0
    }
  };
}

/**
 * جلب بيانات الإحالات الإدارية الشاملة
 */
async function fetchAdminReferralData(filters = {}) {
  const query = {};
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }
  if (filters.status) query.status = filters.status;

  const [referrals, transactions, totalUsers] = await Promise.all([
    Referral.find(query)
      .populate('referrerId', 'name email')
      .populate('referredUserId', 'name email createdAt')
      .sort({ createdAt: -1 })
      .lean(),
    PointsTransaction.find(filters.startDate || filters.endDate ? {
      createdAt: query.createdAt
    } : {}).lean(),
    User.countDocuments()
  ]);

  const totalReferrals = referrals.length;
  const completedReferrals = referrals.filter(r => r.status === 'completed').length;
  const totalPointsEarned = transactions
    .filter(t => t.type === 'earn')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalPointsRedeemed = transactions
    .filter(t => t.type === 'redeem')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    referrals,
    transactions,
    stats: {
      totalReferrals,
      completedReferrals,
      pendingReferrals: referrals.filter(r => r.status === 'pending').length,
      cancelledReferrals: referrals.filter(r => r.status === 'cancelled').length,
      conversionRate: totalReferrals > 0
        ? Math.round((completedReferrals / totalReferrals) * 100)
        : 0,
      totalPointsEarned,
      totalPointsRedeemed,
      totalUsers,
      activeReferrers: new Set(referrals.map(r => r.referrerId?._id?.toString())).size
    }
  };
}

/**
 * تصدير تقرير الإحالات الشخصية - Excel
 */
async function exportUserReferralsExcel(userId) {
  const data = await fetchUserReferralData(userId);
  const workbook = XLSX.utils.book_new();

  // ورقة الملخص
  const summaryData = [
    { 'المقياس': 'إجمالي الإحالات', 'القيمة': data.stats.totalReferrals },
    { 'المقياس': 'الإحالات المكتملة', 'القيمة': data.stats.completedReferrals },
    { 'المقياس': 'الإحالات المعلقة', 'القيمة': data.stats.pendingReferrals },
    { 'المقياس': 'الإحالات الملغاة', 'القيمة': data.stats.cancelledReferrals },
    { 'المقياس': 'معدل التحويل', 'القيمة': `${data.stats.conversionRate}%` },
    { 'المقياس': 'إجمالي النقاط المكتسبة', 'القيمة': data.stats.totalEarned },
    { 'المقياس': 'إجمالي النقاط المستبدلة', 'القيمة': data.stats.totalRedeemed },
    { 'المقياس': 'الرصيد الحالي', 'القيمة': data.stats.currentBalance }
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'الملخص');

  // ورقة الإحالات
  const referralsData = data.referrals.map(r => ({
    'المُحال': r.referredUserId?.name || 'لم يسجل بعد',
    'البريد الإلكتروني': r.referredUserId?.email || '-',
    'الحالة': _translateStatus(r.status),
    'قناة المشاركة': _translateSource(r.source),
    'تاريخ الإحالة': _formatDate(r.createdAt),
    'تاريخ الإكمال': r.completedAt ? _formatDate(r.completedAt) : '-',
    'النقاط المكتسبة': r.rewards?.reduce((s, rw) => s + (rw.points || 0), 0) || 0
  }));
  const referralsSheet = XLSX.utils.json_to_sheet(referralsData);
  XLSX.utils.book_append_sheet(workbook, referralsSheet, 'الإحالات');

  // ورقة سجل النقاط
  const transactionsData = data.transactions.map(t => ({
    'النوع': t.type === 'earn' ? 'مكتسبة' : t.type === 'redeem' ? 'مستبدلة' : 'منتهية',
    'المبلغ': t.amount,
    'الرصيد بعد المعاملة': t.balance,
    'المصدر': _translateTransactionSource(t.source),
    'الوصف': t.description,
    'التاريخ': _formatDate(t.createdAt)
  }));
  const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
  XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'سجل النقاط');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * تصدير تقرير الإحالات الإدارية - Excel
 */
async function exportAdminReferralsExcel(filters = {}) {
  const data = await fetchAdminReferralData(filters);
  const workbook = XLSX.utils.book_new();

  // ورقة الملخص الإداري
  const summaryData = [
    { 'المقياس': 'إجمالي الإحالات', 'القيمة': data.stats.totalReferrals },
    { 'المقياس': 'الإحالات المكتملة', 'القيمة': data.stats.completedReferrals },
    { 'المقياس': 'الإحالات المعلقة', 'القيمة': data.stats.pendingReferrals },
    { 'المقياس': 'الإحالات الملغاة', 'القيمة': data.stats.cancelledReferrals },
    { 'المقياس': 'معدل التحويل', 'القيمة': `${data.stats.conversionRate}%` },
    { 'المقياس': 'إجمالي النقاط الممنوحة', 'القيمة': data.stats.totalPointsEarned },
    { 'المقياس': 'إجمالي النقاط المستبدلة', 'القيمة': data.stats.totalPointsRedeemed },
    { 'المقياس': 'إجمالي المستخدمين', 'القيمة': data.stats.totalUsers },
    { 'المقياس': 'عدد المحيلين النشطين', 'القيمة': data.stats.activeReferrers }
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'الملخص');

  // ورقة جميع الإحالات
  const referralsData = data.referrals.map(r => ({
    'المحيل': r.referrerId?.name || '-',
    'بريد المحيل': r.referrerId?.email || '-',
    'المُحال': r.referredUserId?.name || 'لم يسجل بعد',
    'بريد المُحال': r.referredUserId?.email || '-',
    'الحالة': _translateStatus(r.status),
    'قناة المشاركة': _translateSource(r.source),
    'تاريخ الإحالة': _formatDate(r.createdAt),
    'تاريخ الإكمال': r.completedAt ? _formatDate(r.completedAt) : '-',
    'النقاط الممنوحة': r.rewards?.reduce((s, rw) => s + (rw.points || 0), 0) || 0
  }));
  const referralsSheet = XLSX.utils.json_to_sheet(referralsData);
  XLSX.utils.book_append_sheet(workbook, referralsSheet, 'جميع الإحالات');

  // ورقة سجل المعاملات
  const transactionsData = data.transactions.slice(0, 1000).map(t => ({
    'النوع': t.type === 'earn' ? 'مكتسبة' : t.type === 'redeem' ? 'مستبدلة' : 'منتهية',
    'المبلغ': t.amount,
    'المصدر': _translateTransactionSource(t.source),
    'الوصف': t.description,
    'التاريخ': _formatDate(t.createdAt)
  }));
  const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
  XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'سجل المعاملات');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * تصدير تقرير الإحالات الشخصية - PDF
 */
async function exportUserReferralsPDF(userId) {
  const data = await fetchUserReferralData(userId);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  _addPDFHeader(doc, `تقرير إحالاتي - ${data.user?.name || ''}`);

  // قسم الملخص
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.primary);
  doc.text('ملخص الإحالات', 14, 50);

  doc.autoTable({
    startY: 55,
    head: [['المقياس', 'القيمة']],
    body: [
      ['إجمالي الإحالات', data.stats.totalReferrals],
      ['الإحالات المكتملة', data.stats.completedReferrals],
      ['الإحالات المعلقة', data.stats.pendingReferrals],
      ['معدل التحويل', `${data.stats.conversionRate}%`],
      ['إجمالي النقاط المكتسبة', data.stats.totalEarned],
      ['النقاط المستبدلة', data.stats.totalRedeemed],
      ['الرصيد الحالي', data.stats.currentBalance]
    ],
    ..._tableStyles()
  });

  // قائمة الإحالات
  const afterSummary = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.primary);
  doc.text('قائمة الإحالات', 14, afterSummary);

  const referralRows = data.referrals.slice(0, 50).map(r => [
    r.referredUserId?.name || 'لم يسجل بعد',
    _translateStatus(r.status),
    _translateSource(r.source),
    _formatDate(r.createdAt),
    r.rewards?.reduce((s, rw) => s + (rw.points || 0), 0) || 0
  ]);

  doc.autoTable({
    startY: afterSummary + 5,
    head: [['المُحال', 'الحالة', 'القناة', 'التاريخ', 'النقاط']],
    body: referralRows.length > 0 ? referralRows : [['لا توجد إحالات', '', '', '', '']],
    ..._tableStyles()
  });

  // سجل المكافآت
  const afterReferrals = doc.lastAutoTable.finalY + 10;
  if (afterReferrals < 250) {
    doc.setFontSize(13);
    doc.setTextColor(...COLORS.primary);
    doc.text('سجل المكافآت (آخر 20 معاملة)', 14, afterReferrals);

    const txRows = data.transactions.slice(0, 20).map(t => [
      t.type === 'earn' ? 'مكتسبة' : t.type === 'redeem' ? 'مستبدلة' : 'منتهية',
      t.amount,
      _translateTransactionSource(t.source),
      _formatDate(t.createdAt)
    ]);

    doc.autoTable({
      startY: afterReferrals + 5,
      head: [['النوع', 'المبلغ', 'المصدر', 'التاريخ']],
      body: txRows.length > 0 ? txRows : [['لا توجد معاملات', '', '', '']],
      ..._tableStyles()
    });
  }

  _addPDFFooter(doc);
  return Buffer.from(doc.output('arraybuffer'));
}

/**
 * تصدير تقرير الإحالات الإداري - PDF
 */
async function exportAdminReferralsPDF(filters = {}) {
  const data = await fetchAdminReferralData(filters);

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  _addPDFHeader(doc, 'تقرير برنامج الإحالة - لوحة الإدارة');

  // ملخص إداري
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.primary);
  doc.text('الملخص الإداري', 14, 50);

  doc.autoTable({
    startY: 55,
    head: [['المقياس', 'القيمة']],
    body: [
      ['إجمالي الإحالات', data.stats.totalReferrals],
      ['الإحالات المكتملة', data.stats.completedReferrals],
      ['الإحالات المعلقة', data.stats.pendingReferrals],
      ['الإحالات الملغاة', data.stats.cancelledReferrals],
      ['معدل التحويل', `${data.stats.conversionRate}%`],
      ['إجمالي النقاط الممنوحة', data.stats.totalPointsEarned],
      ['إجمالي النقاط المستبدلة', data.stats.totalPointsRedeemed],
      ['عدد المحيلين النشطين', data.stats.activeReferrers],
      ['إجمالي المستخدمين', data.stats.totalUsers]
    ],
    ..._tableStyles(),
    tableWidth: 100
  });

  // جدول الإحالات
  const afterSummary = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.primary);
  doc.text(`قائمة الإحالات (أحدث ${Math.min(data.referrals.length, 100)})`, 14, afterSummary);

  const referralRows = data.referrals.slice(0, 100).map(r => [
    r.referrerId?.name || '-',
    r.referredUserId?.name || 'لم يسجل بعد',
    _translateStatus(r.status),
    _translateSource(r.source),
    _formatDate(r.createdAt),
    r.rewards?.reduce((s, rw) => s + (rw.points || 0), 0) || 0
  ]);

  doc.autoTable({
    startY: afterSummary + 5,
    head: [['المحيل', 'المُحال', 'الحالة', 'القناة', 'التاريخ', 'النقاط']],
    body: referralRows.length > 0 ? referralRows : [['لا توجد بيانات', '', '', '', '', '']],
    ..._tableStyles()
  });

  if (data.referrals.length > 100) {
    const note = doc.lastAutoTable.finalY + 5;
    doc.setFontSize(9);
    doc.setTextColor(200, 0, 0);
    doc.text(`* تم عرض أحدث 100 إحالة من إجمالي ${data.referrals.length}`, 14, note);
  }

  _addPDFFooter(doc);
  return Buffer.from(doc.output('arraybuffer'));
}

// ===== دوال مساعدة =====

function _addPDFHeader(doc, title) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // شريط العنوان
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 35, 'F');

  // اسم المنصة
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.white);
  doc.text('Careerak', 14, 15);

  // العنوان
  doc.setFontSize(13);
  doc.text(title, 14, 27);

  // التاريخ
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.secondary);
  const dateStr = `تاريخ التصدير: ${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}`;
  doc.text(dateStr, pageWidth - 14, 27, { align: 'right' });
}

function _addPDFFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...COLORS.secondary);
    doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.text);
    doc.text('www.careerak.com', 14, pageHeight - 4);
    doc.text(`صفحة ${i} من ${pageCount}`, pageWidth / 2, pageHeight - 4, { align: 'center' });
    doc.text(new Date().getFullYear().toString(), pageWidth - 14, pageHeight - 4, { align: 'right' });
  }
}

function _tableStyles() {
  return {
    styles: { fontSize: 9, cellPadding: 3, font: 'helvetica' },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: 'bold'
    },
    alternateRowStyles: { fillColor: COLORS.secondary },
    margin: { left: 14, right: 14 }
  };
}

function _formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

function _translateStatus(status) {
  const map = { pending: 'معلق', completed: 'مكتمل', cancelled: 'ملغي' };
  return map[status] || status;
}

function _translateSource(source) {
  const map = {
    whatsapp: 'واتساب', email: 'بريد إلكتروني',
    direct: 'مباشر', copy: 'نسخ الرابط', other: 'أخرى'
  };
  return map[source] || source;
}

function _translateTransactionSource(source) {
  const map = {
    referral_signup: 'إحالة - تسجيل',
    referral_first_course: 'إحالة - أول دورة',
    referral_job: 'إحالة - وظيفة',
    referral_five_courses: 'إحالة - 5 دورات',
    referral_paid_subscription: 'إحالة - اشتراك مدفوع',
    welcome_bonus: 'مكافأة ترحيب',
    redemption: 'استبدال',
    expiry: 'انتهاء صلاحية',
    admin: 'إداري'
  };
  return map[source] || source;
}

module.exports = {
  exportUserReferralsExcel,
  exportAdminReferralsExcel,
  exportUserReferralsPDF,
  exportAdminReferralsPDF
};
