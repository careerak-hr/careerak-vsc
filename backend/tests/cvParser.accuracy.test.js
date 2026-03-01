/**
 * CV Parser Accuracy Tests
 * اختبارات دقة تحليل السيرة الذاتية
 * 
 * الهدف: التحقق من أن دقة التحليل > 90%
 * Requirements: 4.2 (استخراج المهارات والخبرات بدقة > 90%)
 */

const cvParserService = require('../src/services/cvParserService');

/**
 * حساب دقة الاستخراج
 * @param {Array} extracted - العناصر المستخرجة
 * @param {Array} expected - العناصر المتوقعة
 * @returns {number} - نسبة الدقة (0-100)
 */
function calculateAccuracy(extracted, expected) {
  if (expected.length === 0) return 100;
  
  // تحويل إلى lowercase للمقارنة
  const extractedLower = extracted.map(item => 
    typeof item === 'string' ? item.toLowerCase() : item
  );
  const expectedLower = expected.map(item => 
    typeof item === 'string' ? item.toLowerCase() : item
  );
  
  // حساب عدد العناصر الصحيحة
  let correctCount = 0;
  for (const item of expectedLower) {
    if (typeof item === 'string') {
      if (extractedLower.includes(item)) {
        correctCount++;
      }
    } else {
      // للكائنات (مثل الخبرات والتعليم)
      const found = extractedLower.some(extracted => 
        JSON.stringify(extracted) === JSON.stringify(item)
      );
      if (found) correctCount++;
    }
  }
  
  return (correctCount / expected.length) * 100;
}

/**
 * حساب Precision و Recall
 */
function calculatePrecisionRecall(extracted, expected) {
  const extractedSet = new Set(extracted.map(i => typeof i === 'string' ? i.toLowerCase() : JSON.stringify(i)));
  const expectedSet = new Set(expected.map(i => typeof i === 'string' ? i.toLowerCase() : JSON.stringify(i)));
  
  // True Positives: موجود في كلاهما
  const truePositives = [...extractedSet].filter(item => expectedSet.has(item)).length;
  
  // False Positives: موجود في extracted فقط
  const falsePositives = extractedSet.size - truePositives;
  
  // False Negatives: موجود في expected فقط
  const falseNegatives = expectedSet.size - truePositives;
  
  // Precision: من المستخرج، كم منها صحيح؟
  const precision = extractedSet.size > 0 ? (truePositives / extractedSet.size) * 100 : 0;
  
  // Recall: من المتوقع، كم منها تم استخراجه؟
  const recall = expectedSet.size > 0 ? (truePositives / expectedSet.size) * 100 : 0;
  
  // F1 Score: المتوسط التوافقي
  const f1Score = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  
  return { precision, recall, f1Score, truePositives, falsePositives, falseNegatives };
}

describe('CV Parser Accuracy Tests (> 90%)', () => {
  // Sample CV 1: English Technical CV
  const sampleCV1 = `
John Doe
Software Engineer
john.doe@example.com | +1-555-123-4567
linkedin.com/in/johndoe | github.com/johndoe

PROFESSIONAL SUMMARY
Experienced Full-Stack Developer with 5+ years of experience in web development

TECHNICAL SKILLS
Programming Languages: JavaScript, Python, Java, TypeScript
Frontend: React, Vue.js, Angular, HTML, CSS
Backend: Node.js, Express, Django, Flask
Databases: MongoDB, PostgreSQL, MySQL, Redis
Cloud: AWS, Azure, Docker, Kubernetes
Tools: Git, Jenkins, Webpack

PROFESSIONAL EXPERIENCE

Senior Software Engineer | Tech Corp Inc. | 2020 - Present
- Led development of microservices architecture using Node.js and Docker
- Managed team of 5 developers
- Improved application performance by 40%

Software Developer | Startup LLC | 2018 - 2020
- Developed REST APIs using Python and Flask
- Built responsive web applications with React
- Implemented CI/CD pipelines

Junior Developer | Web Agency | 2016 - 2018
- Created websites using HTML, CSS, and JavaScript
- Worked with MySQL databases

EDUCATION

Master of Computer Science | MIT | 2016
Specialized in Artificial Intelligence

Bachelor of Software Engineering | Stanford University | 2014
GPA: 3.8/4.0
  `;

  const expectedCV1 = {
    contactInfo: {
      emails: ['john.doe@example.com'],
      phones: ['+1-555-123-4567'],
      linkedin: 'linkedin.com/in/johndoe',
      github: 'github.com/johndoe',
    },
    skills: [
      'javascript', 'python', 'java', 'typescript',
      'react', 'vue', 'angular', 'html', 'css',
      'node.js', 'express', 'django', 'flask',
      'mongodb', 'postgresql', 'mysql', 'redis',
      'aws', 'azure', 'docker', 'kubernetes',
      'git', 'jenkins', 'webpack'
    ],
    experienceCount: 3,
    educationCount: 2,
    totalExperience: 10, // 2016-2018 (2) + 2018-2020 (2) + 2020-2026 (6) = 10
  };

  // Sample CV 2: Arabic CV
  const sampleCV2 = `
أحمد محمد
مطور برمجيات
ahmed@example.com | 0501234567

الملخص المهني
مطور ويب متمرس مع خبرة 4 سنوات في تطوير التطبيقات

المهارات التقنية
- جافاسكريبت، بايثون، جافا
- React، Node.js
- MongoDB، MySQL
- AWS، Docker

الخبرات العملية

مطور أول | شركة التقنية | 2021 - الآن
- تطوير تطبيقات ويب باستخدام React و Node.js
- إدارة فريق من 3 مطورين

مطور برمجيات | شركة ناشئة | 2019 - 2021
- تطوير APIs باستخدام Python
- العمل مع قواعد بيانات MongoDB

التعليم

بكالوريوس علوم الحاسوب | جامعة الملك سعود | 2019
  `;

  const expectedCV2 = {
    contactInfo: {
      emails: ['ahmed@example.com'],
      phones: ['0501234567'],
    },
    skills: [
      'javascript', 'python', 'java',
      'react', 'node.js',
      'mongodb', 'mysql',
      'aws', 'docker'
    ],
    experienceCount: 2,
    educationCount: 1,
    totalExperience: 5, // 2019-2024
  };

  describe('Skills Extraction Accuracy', () => {
    test('English CV: Skills accuracy should be > 90%', async () => {
      const buffer = Buffer.from(sampleCV1, 'utf-8');
      const result = await cvParserService.parseCV(buffer, 'text/plain');
      
      expect(result.success).toBe(true);
      
      const metrics = calculatePrecisionRecall(result.data.skills, expectedCV1.skills);
      
      console.log('\n📊 Skills Extraction Metrics (English CV):');
      console.log(`   Precision: ${metrics.precision.toFixed(2)}%`);
      console.log(`   Recall: ${metrics.recall.toFixed(2)}%`);
      console.log(`   F1 Score: ${metrics.f1Score.toFixed(2)}%`);
      console.log(`   True Positives: ${metrics.truePositives}`);
      console.log(`   False Positives: ${metrics.falsePositives}`);
      console.log(`   False Negatives: ${metrics.falseNegatives}`);
      
      // الهدف: F1 Score > 90%
      expect(metrics.f1Score).toBeGreaterThan(90);
    });

    test('Arabic CV: Skills accuracy should be > 90%', async () => {
      const buffer = Buffer.from(sampleCV2, 'utf-8');
      const result = await cvParserService.parseCV(buffer, 'text/plain');
      
      expect(result.success).toBe(true);
      
      const metrics = calculatePrecisionRecall(result.data.skills, expectedCV2.skills);
      
      console.log('\n📊 Skills Extraction Metrics (Arabic CV):');
      console.log(`   Precision: ${metrics.precision.toFixed(2)}%`);
      console.log(`   Recall: ${metrics.recall.toFixed(2)}%`);
      console.log(`   F1 Score: ${metrics.f1Score.toFixed(2)}%`);
      
      // الهدف: F1 Score > 90%
      expect(metrics.f1Score).toBeGreaterThan(90);
    });
  });

  describe('Contact Info Extraction Accuracy', () => {
    test('English CV: Contact info accuracy should be 100%', async () => {
      const buffer = Buffer.from(sampleCV1, 'utf-8');
      const result = await cvParserService.parseCV(buffer, 'text/plain');
      
      expect(result.success).toBe(true);
      
      // Email
      expect(result.data.contactInfo.emails).toContain('john.doe@example.com');
      
      // Phone (قد يكون التنسيق مختلف قليلاً)
      const hasPhone = result.data.contactInfo.phones.some(p => p.includes('555'));
      expect(hasPhone).toBe(true);
      
      // LinkedIn
      expect(result.data.contactInfo.linkedin).toContain('linkedin.com/in/johndoe');
      
      // GitHub
      expect(result.data.contactInfo.github).toContain('github.com/johndoe');
      
      console.log('\n✅ Contact Info Extraction: 100% accurate');
    });

    test('Arabic CV: Contact info accuracy should be 100%', async () => {
      const buffer = Buffer.from(sampleCV2, 'utf-8');
      const result = await cvParserService.parseCV(buffer, 'text/plain');
      
      expect(result.success).toBe(true);
      
      // Email
      expect(result.data.contactInfo.emails).toContain('ahmed@example.com');
      
      // Phone
      const hasPhone = result.data.contactInfo.phones.some(p => p.includes('050'));
      expect(hasPhone).toBe(true);
      
      console.log('\n✅ Contact Info Extraction (Arabic): 100% accurate');
    });
  });

  describe('Experience Extraction Accuracy', () => {
    test('English CV: Experience count should be accurate', async () => {
      const buffer = Buffer.from(sampleCV1, 'utf-8');
      const result = await cvParserService.parseCV(buffer, 'text/plain');
      
      expect(result.success).toBe(true);
      
      const accuracy = (result.data.experience.length / expectedCV1.experienceCount) * 100;
      
      console.log('\n📊 Experience Extraction:');
      console.log(`   Expected: ${expectedCV1.experienceCount}`);
      console.log(`   Extracted: ${result.data.experience.length}`);
      console.log(`   Accuracy: ${accuracy.toFixed(2)}%`);
      
      // الهدف: استخراج على الأقل 90% من الخبرات
      expect(accuracy).toBeGreaterThanOrEqual(90);
    });

    test('Arabic CV: Experience count should be accurate', async () => {
      const buffer = Buffer.from(sampleCV2, 'utf-8');
      const result = await cvParserService.parseCV(buffer, 'text/plain');
      
      expect(result.success).toBe(true);
      
      const accuracy = (result.data.experience.length / expectedCV2.experienceCount) * 100;
      
      console.log('\n📊 Experience Extraction (Arabic):');
      console.log(`   Expected: ${expectedCV2.experienceCount}`);
      console.log(`   Extracted: ${result.data.experience.length}`);
      console.log(`   Accuracy: ${accuracy.toFixed(2)}%`);
      
      expect(accuracy).toBeGreaterThanOrEqual(90);
    });

    test('Total experience calculation should be accurate', async () => {
      const buffer = Buffer.from(sampleCV1, 'utf-8');
      const result = await cvParserService.parseCV(buffer, 'text/plain');
      
      expect(result.success).toBe(true);
      
      // التحقق من أن الحساب قريب من المتوقع (±1 سنة)
      const diff = Math.abs(result.data.totalExperience - expectedCV1.totalExperience);
      
      console.log('\n📊 Total Experience Calculation:');
      console.log(`   Expected: ${expectedCV1.totalExperience} years`);
      console.log(`   Calculated: ${result.data.totalExperience} years`);
      console.log(`   Difference: ${diff} years`);
      
      expect(diff).toBeLessThanOrEqual(1);
    });
  });

  describe('Education Extraction Accuracy', () => {
    test('English CV: Education count should be accurate', async () => {
      const buffer = Buffer.from(sampleCV1, 'utf-8');
      const result = await cvParserService.parseCV(buffer, 'text/plain');
      
      expect(result.success).toBe(true);
      
      const accuracy = (result.data.education.length / expectedCV1.educationCount) * 100;
      
      console.log('\n📊 Education Extraction:');
      console.log(`   Expected: ${expectedCV1.educationCount}`);
      console.log(`   Extracted: ${result.data.education.length}`);
      console.log(`   Accuracy: ${accuracy.toFixed(2)}%`);
      
      expect(accuracy).toBeGreaterThanOrEqual(90);
    });

    test('Arabic CV: Education count should be accurate', async () => {
      const buffer = Buffer.from(sampleCV2, 'utf-8');
      const result = await cvParserService.parseCV(buffer, 'text/plain');
      
      expect(result.success).toBe(true);
      
      const accuracy = (result.data.education.length / expectedCV2.educationCount) * 100;
      
      console.log('\n📊 Education Extraction (Arabic):');
      console.log(`   Expected: ${expectedCV2.educationCount}`);
      console.log(`   Extracted: ${result.data.education.length}`);
      console.log(`   Accuracy: ${accuracy.toFixed(2)}%`);
      
      expect(accuracy).toBeGreaterThanOrEqual(90);
    });
  });

  describe('Overall Accuracy', () => {
    test('Overall CV parsing accuracy should be > 90%', async () => {
      const buffer1 = Buffer.from(sampleCV1, 'utf-8');
      const result1 = await cvParserService.parseCV(buffer1, 'text/plain');
      
      const buffer2 = Buffer.from(sampleCV2, 'utf-8');
      const result2 = await cvParserService.parseCV(buffer2, 'text/plain');
      
      // حساب الدقة الإجمالية
      const skillsMetrics1 = calculatePrecisionRecall(result1.data.skills, expectedCV1.skills);
      const skillsMetrics2 = calculatePrecisionRecall(result2.data.skills, expectedCV2.skills);
      
      const expAccuracy1 = (result1.data.experience.length / expectedCV1.experienceCount) * 100;
      const expAccuracy2 = (result2.data.experience.length / expectedCV2.experienceCount) * 100;
      
      const eduAccuracy1 = (result1.data.education.length / expectedCV1.educationCount) * 100;
      const eduAccuracy2 = (result2.data.education.length / expectedCV2.educationCount) * 100;
      
      // المتوسط الإجمالي
      const overallAccuracy = (
        skillsMetrics1.f1Score +
        skillsMetrics2.f1Score +
        expAccuracy1 +
        expAccuracy2 +
        eduAccuracy1 +
        eduAccuracy2
      ) / 6;
      
      console.log('\n' + '='.repeat(60));
      console.log('📊 OVERALL CV PARSING ACCURACY REPORT');
      console.log('='.repeat(60));
      console.log(`\n✅ Overall Accuracy: ${overallAccuracy.toFixed(2)}%`);
      console.log(`\n   Skills (English):    ${skillsMetrics1.f1Score.toFixed(2)}%`);
      console.log(`   Skills (Arabic):     ${skillsMetrics2.f1Score.toFixed(2)}%`);
      console.log(`   Experience (English): ${expAccuracy1.toFixed(2)}%`);
      console.log(`   Experience (Arabic):  ${expAccuracy2.toFixed(2)}%`);
      console.log(`   Education (English):  ${eduAccuracy1.toFixed(2)}%`);
      console.log(`   Education (Arabic):   ${eduAccuracy2.toFixed(2)}%`);
      console.log('\n' + '='.repeat(60));
      
      if (overallAccuracy >= 90) {
        console.log('✅ SUCCESS: CV parsing accuracy meets the 90% threshold!');
      } else {
        console.log(`⚠️  WARNING: CV parsing accuracy (${overallAccuracy.toFixed(2)}%) is below 90% threshold`);
      }
      console.log('='.repeat(60) + '\n');
      
      // الهدف: دقة إجمالية > 90%
      expect(overallAccuracy).toBeGreaterThan(90);
    });
  });
});
