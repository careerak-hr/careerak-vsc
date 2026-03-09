/**
 * مثال على استخدام نظام الشهادات
 * Certificate System Usage Example
 */

const certificateService = require('../src/services/certificateService');

// ========== مثال 1: إصدار شهادة جديدة ==========
async function exampleIssueCertificate() {
  console.log('\n========== مثال 1: إصدار شهادة جديدة ==========\n');

  try {
    const result = await certificateService.issueCertificate(
      'user123',      // معرف المستخدم
      'course456',    // معرف الدورة
      {
        issueDate: new Date(),
        expiryDate: null,  // لا تنتهي
        templateId: null   // استخدام القالب الافتراضي
      }
    );

    console.log('✅ تم إصدار الشهادة بنجاح!');
    console.log('رقم الشهادة:', result.certificate.certificateId);
    console.log('اسم المستخدم:', result.certificate.userName);
    console.log('اسم الدورة:', result.certificate.courseName);
    console.log('تاريخ الإصدار:', result.certificate.issueDate);
    console.log('رابط التحقق:', result.certificate.verificationUrl);
    console.log('QR Code:', result.certificate.qrCode.substring(0, 50) + '...');
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ========== مثال 2: الحصول على شهادة بواسطة رقمها ==========
async function exampleGetCertificate() {
  console.log('\n========== مثال 2: الحصول على شهادة بواسطة رقمها ==========\n');

  try {
    const certificateId = 'cert-uuid-123';
    const result = await certificateService.getCertificateById(certificateId);

    console.log('✅ تم جلب الشهادة بنجاح!');
    console.log('رقم الشهادة:', result.certificate.certificateId);
    console.log('اسم المستخدم:', result.certificate.userName);
    console.log('البريد الإلكتروني:', result.certificate.userEmail);
    console.log('اسم الدورة:', result.certificate.courseName);
    console.log('الحالة:', result.certificate.status);
    console.log('صالحة؟', result.certificate.isValid ? 'نعم' : 'لا');
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ========== مثال 3: الحصول على جميع شهادات المستخدم ==========
async function exampleGetUserCertificates() {
  console.log('\n========== مثال 3: الحصول على جميع شهادات المستخدم ==========\n');

  try {
    const userId = 'user123';
    const result = await certificateService.getUserCertificates(userId, {
      status: 'active',  // فقط الشهادات النشطة
      limit: 10,
      skip: 0
    });

    console.log(`✅ تم جلب ${result.count} شهادة`);
    result.certificates.forEach((cert, index) => {
      console.log(`\n${index + 1}. ${cert.courseName}`);
      console.log('   رقم الشهادة:', cert.certificateId);
      console.log('   تاريخ الإصدار:', cert.issueDate);
      console.log('   الحالة:', cert.status);
    });
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ========== مثال 4: التحقق من صحة الشهادة ==========
async function exampleVerifyCertificate() {
  console.log('\n========== مثال 4: التحقق من صحة الشهادة ==========\n');

  try {
    const certificateId = 'cert-uuid-123';
    const result = await certificateService.verifyCertificate(certificateId);

    console.log('✅ نتيجة التحقق:');
    console.log('صالحة؟', result.valid ? 'نعم ✓' : 'لا ✗');
    console.log('الرسالة:', result.messageAr);
    
    if (result.certificate) {
      console.log('\nتفاصيل الشهادة:');
      console.log('رقم الشهادة:', result.certificate.certificateId);
      console.log('اسم المستخدم:', result.certificate.userName);
      console.log('اسم الدورة:', result.certificate.courseName);
      console.log('تاريخ الإصدار:', result.certificate.issueDate);
      console.log('الحالة:', result.certificate.status);
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ========== مثال 5: إلغاء شهادة ==========
async function exampleRevokeCertificate() {
  console.log('\n========== مثال 5: إلغاء شهادة ==========\n');

  try {
    const certificateId = 'cert-uuid-123';
    const revokedBy = 'admin123';
    const reason = 'تم اكتشاف خطأ في البيانات';

    const result = await certificateService.revokeCertificate(
      certificateId,
      revokedBy,
      reason
    );

    console.log('✅', result.messageAr);
    console.log('رقم الشهادة:', result.certificate.certificateId);
    console.log('الحالة الجديدة:', result.certificate.status);
    console.log('تاريخ الإلغاء:', result.certificate.revokedAt);
    console.log('السبب:', result.certificate.reason);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ========== مثال 6: إعادة إصدار شهادة ==========
async function exampleReissueCertificate() {
  console.log('\n========== مثال 6: إعادة إصدار شهادة ==========\n');

  try {
    const originalCertificateId = 'cert-uuid-123';
    const reissuedBy = 'admin123';
    const reason = 'تصحيح خطأ في الاسم';

    const result = await certificateService.reissueCertificate(
      originalCertificateId,
      reissuedBy,
      reason
    );

    console.log('✅', result.messageAr);
    console.log('رقم الشهادة الجديدة:', result.certificate.certificateId);
    console.log('رقم الشهادة الأصلية:', result.certificate.originalCertificateId);
    console.log('رابط التحقق الجديد:', result.certificate.verificationUrl);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ========== مثال 7: تحديد الشهادة كمشاركة على LinkedIn ==========
async function exampleMarkAsShared() {
  console.log('\n========== مثال 7: تحديد الشهادة كمشاركة على LinkedIn ==========\n');

  try {
    const certificateId = 'cert-uuid-123';
    const result = await certificateService.markAsSharedOnLinkedIn(certificateId);

    console.log('✅', result.messageAr);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ========== مثال 8: الحصول على إحصائيات الشهادات ==========
async function exampleGetStats() {
  console.log('\n========== مثال 8: الحصول على إحصائيات الشهادات ==========\n');

  try {
    const userId = 'user123'; // أو null للإحصائيات العامة
    const result = await certificateService.getCertificateStats(userId);

    console.log('✅ إحصائيات الشهادات:');
    console.log('النشطة:', result.stats.active);
    console.log('الملغاة:', result.stats.revoked);
    console.log('المنتهية:', result.stats.expired);
    console.log('الإجمالي:', result.stats.total);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// ========== تشغيل جميع الأمثلة ==========
async function runAllExamples() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         أمثلة استخدام نظام الشهادات والإنجازات          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // ملاحظة: هذه الأمثلة تحتاج اتصال بقاعدة البيانات
  // await exampleIssueCertificate();
  // await exampleGetCertificate();
  // await exampleGetUserCertificates();
  // await exampleVerifyCertificate();
  // await exampleRevokeCertificate();
  // await exampleReissueCertificate();
  // await exampleMarkAsShared();
  // await exampleGetStats();

  console.log('\n✅ جميع الأمثلة جاهزة للاستخدام!');
  console.log('💡 قم بإلغاء التعليق عن الأمثلة التي تريد تشغيلها\n');
}

// تشغيل
if (require.main === module) {
  runAllExamples();
}

module.exports = {
  exampleIssueCertificate,
  exampleGetCertificate,
  exampleGetUserCertificates,
  exampleVerifyCertificate,
  exampleRevokeCertificate,
  exampleReissueCertificate,
  exampleMarkAsShared,
  exampleGetStats
};
