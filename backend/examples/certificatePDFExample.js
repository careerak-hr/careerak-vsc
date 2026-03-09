/**
 * مثال كامل لاستخدام PDF Generator
 * 
 * هذا المثال يوضح:
 * 1. توليد PDF مباشرة
 * 2. حفظ PDF محلياً
 * 3. رفع PDF إلى Cloudinary
 * 4. استخدام مع CertificateService
 */

const PDFGenerator = require('../src/services/pdfGenerator');
const certificateService = require('../src/services/certificateService');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════
// مثال 1: توليد PDF مباشرة
// ═══════════════════════════════════════════════════════════

async function example1_DirectPDFGeneration() {
  console.log('\n📄 مثال 1: توليد PDF مباشرة\n');

  const pdfGenerator = new PDFGenerator();

  const certificateData = {
    certificateId: 'abc-123-def-456',
    userName: 'أحمد محمد علي',
    courseName: 'تطوير تطبيقات الويب الحديثة باستخدام React و Node.js',
    issueDate: new Date('2026-03-09'),
    qrCodeData: 'https://careerak.com/verify/abc-123-def-456',
    verificationUrl: 'https://careerak.com/verify/abc-123-def-456',
    instructorName: 'د. محمد علي',
    instructorSignature: null // اختياري
  };

  try {
    const startTime = Date.now();
    const pdfBuffer = await pdfGenerator.generateCertificate(certificateData);
    const endTime = Date.now();

    console.log('✅ PDF generated successfully!');
    console.log(`⚡ Generation time: ${endTime - startTime}ms`);
    console.log(`📦 File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);

    // حفظ محلياً
    const outputPath = path.join(__dirname, 'output', 'certificate-example-1.pdf');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, pdfBuffer);
    console.log(`💾 Saved to: ${outputPath}`);

    return pdfBuffer;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════
// مثال 2: توليد عدة شهادات
// ═══════════════════════════════════════════════════════════

async function example2_BatchGeneration() {
  console.log('\n📄 مثال 2: توليد عدة شهادات\n');

  const pdfGenerator = new PDFGenerator();

  const students = [
    { name: 'أحمد محمد', course: 'React Fundamentals' },
    { name: 'فاطمة علي', course: 'Node.js Backend' },
    { name: 'محمد حسن', course: 'Full Stack Development' }
  ];

  const startTime = Date.now();

  for (const student of students) {
    const certificateData = {
      certificateId: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userName: student.name,
      courseName: student.course,
      issueDate: new Date(),
      qrCodeData: `https://careerak.com/verify/${student.name}`,
      verificationUrl: `https://careerak.com/verify/${student.name}`
    };

    const pdfBuffer = await pdfGenerator.generateCertificate(certificateData);
    
    const outputPath = path.join(__dirname, 'output', `certificate-${student.name}.pdf`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, pdfBuffer);

    console.log(`✅ Generated certificate for ${student.name}`);
  }

  const endTime = Date.now();
  const avgTime = (endTime - startTime) / students.length;

  console.log(`\n⚡ Total time: ${endTime - startTime}ms`);
  console.log(`⚡ Average time per certificate: ${avgTime.toFixed(2)}ms`);
}

// ═══════════════════════════════════════════════════════════
// مثال 3: استخدام مع CertificateService
// ═══════════════════════════════════════════════════════════

async function example3_WithCertificateService() {
  console.log('\n📄 مثال 3: استخدام مع CertificateService\n');

  // ملاحظة: هذا المثال يتطلب اتصال MongoDB وشهادة موجودة
  
  const certificateId = 'your-certificate-id-here';

  try {
    // توليد PDF فقط
    console.log('🔄 Generating PDF...');
    const pdfBuffer = await certificateService.generatePDF(certificateId);
    
    console.log('✅ PDF generated!');
    console.log(`📦 Size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);

    // حفظ محلياً
    const outputPath = path.join(__dirname, 'output', `certificate-${certificateId}.pdf`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, pdfBuffer);
    console.log(`💾 Saved to: ${outputPath}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('💡 Tip: Make sure MongoDB is connected and certificate exists');
  }
}

// ═══════════════════════════════════════════════════════════
// مثال 4: توليد ورفع إلى Cloudinary
// ═══════════════════════════════════════════════════════════

async function example4_UploadToCloudinary() {
  console.log('\n📄 مثال 4: توليد ورفع إلى Cloudinary\n');

  const certificateId = 'your-certificate-id-here';

  try {
    console.log('🔄 Generating and uploading PDF...');
    const result = await certificateService.generateAndUploadPDF(certificateId);

    console.log('✅ Success!');
    console.log(`🔗 PDF URL: ${result.pdfUrl}`);
    console.log(`📝 Message: ${result.messageAr}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('💡 Tip: Make sure Cloudinary credentials are configured');
  }
}

// ═══════════════════════════════════════════════════════════
// مثال 5: اختبار الأداء
// ═══════════════════════════════════════════════════════════

async function example5_PerformanceTest() {
  console.log('\n📄 مثال 5: اختبار الأداء\n');

  const pdfGenerator = new PDFGenerator();
  const iterations = 10;

  const testData = {
    certificateId: 'perf-test',
    userName: 'اختبار الأداء',
    courseName: 'دورة اختبار الأداء',
    issueDate: new Date(),
    qrCodeData: 'https://careerak.com/verify/perf-test',
    verificationUrl: 'https://careerak.com/verify/perf-test'
  };

  console.log(`🔄 Running ${iterations} iterations...\n`);

  const times = [];
  const sizes = [];

  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    const pdfBuffer = await pdfGenerator.generateCertificate(testData);
    const endTime = Date.now();

    const time = endTime - startTime;
    const size = pdfBuffer.length / 1024;

    times.push(time);
    sizes.push(size);

    console.log(`  Iteration ${i + 1}: ${time}ms, ${size.toFixed(2)} KB`);
  }

  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;

  console.log('\n📊 Performance Summary:');
  console.log(`  Average time: ${avgTime.toFixed(2)}ms`);
  console.log(`  Min time: ${minTime}ms`);
  console.log(`  Max time: ${maxTime}ms`);
  console.log(`  Average size: ${avgSize.toFixed(2)} KB`);
  console.log(`  Target: < 2000ms ✅`);
}

// ═══════════════════════════════════════════════════════════
// مثال 6: مع توقيع مخصص
// ═══════════════════════════════════════════════════════════

async function example6_WithCustomSignature() {
  console.log('\n📄 مثال 6: مع توقيع مخصص\n');

  const pdfGenerator = new PDFGenerator();

  const certificateData = {
    certificateId: 'cert-with-signature',
    userName: 'سارة أحمد',
    courseName: 'تصميم واجهات المستخدم (UI/UX)',
    issueDate: new Date(),
    qrCodeData: 'https://careerak.com/verify/cert-with-signature',
    verificationUrl: 'https://careerak.com/verify/cert-with-signature',
    instructorName: 'د. محمد علي',
    instructorSignature: path.join(__dirname, '../assets/signatures/instructor-123.png')
  };

  try {
    const pdfBuffer = await pdfGenerator.generateCertificate(certificateData);
    
    const outputPath = path.join(__dirname, 'output', 'certificate-with-signature.pdf');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, pdfBuffer);

    console.log('✅ Certificate with signature generated!');
    console.log(`💾 Saved to: ${outputPath}`);
    console.log('💡 Note: If signature file doesn\'t exist, it will be skipped');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════
// تشغيل الأمثلة
// ═══════════════════════════════════════════════════════════

async function runAllExamples() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         Certificate PDF Generator - Examples              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    // مثال 1: توليد PDF مباشرة
    await example1_DirectPDFGeneration();

    // مثال 2: توليد عدة شهادات
    await example2_BatchGeneration();

    // مثال 5: اختبار الأداء
    await example5_PerformanceTest();

    // مثال 6: مع توقيع مخصص
    await example6_WithCustomSignature();

    // الأمثلة التالية تتطلب MongoDB و Cloudinary
    // await example3_WithCertificateService();
    // await example4_UploadToCloudinary();

    console.log('\n✅ All examples completed successfully!');
    console.log('📁 Check the output/ folder for generated PDFs');

  } catch (error) {
    console.error('\n❌ Error running examples:', error);
  }
}

// تشغيل إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  runAllExamples();
}

// تصدير الأمثلة للاستخدام الخارجي
module.exports = {
  example1_DirectPDFGeneration,
  example2_BatchGeneration,
  example3_WithCertificateService,
  example4_UploadToCloudinary,
  example5_PerformanceTest,
  example6_WithCustomSignature,
  runAllExamples
};
