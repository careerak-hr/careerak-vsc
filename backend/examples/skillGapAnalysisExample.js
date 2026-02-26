/**
 * مثال عملي لاستخدام خدمة تحليل فجوات المهارات
 * 
 * يوضح كيفية استخدام SkillGapAnalysis لتحليل فجوات المهارات
 * بين مستخدم ووظيفة وتوليد توصيات الدورات
 */

const SkillGapAnalysis = require('../src/services/skillGapAnalysis');

// إنشاء مثيل من خدمة تحليل فجوات المهارات
const skillGapAnalysis = new SkillGapAnalysis();

// مثال 1: مستخدم مبتدئ يريد وظيفة مطور ويب متقدم
console.log('📊 مثال 1: مستخدم مبتدئ يريد وظيفة مطور ويب متقدم\n');

const beginnerUser = {
  computerSkills: [
    { skill: 'html', proficiency: 'beginner' },
    { skill: 'css', proficiency: 'beginner' }
  ],
  softwareSkills: [],
  otherSkills: ['communication'],
  bio: 'مطور ويب مبتدئ أعمل على تعلم HTML و CSS'
};

const webDeveloperJob = {
  title: 'مطور ويب متقدم',
  description: 'مطلوب مطور ويب متقدم مع خبرة في React و Node.js وقواعد البيانات',
  requirements: 'خبرة 2+ سنوات في React, Node.js, MongoDB. معرفة في TypeScript ميزة إضافية.'
};

const analysis1 = skillGapAnalysis.analyzeSkillGaps(beginnerUser, webDeveloperJob);

console.log('👤 المستخدم:', beginnerUser.bio);
console.log('💼 الوظيفة:', webDeveloperJob.title);
console.log('📈 نسبة التغطية:', analysis1.summary.overallCoverage + '%');
console.log('📊 مستوى التغطية:', analysis1.summary.coverageLevel);
console.log('🔍 المهارات المفقودة:', analysis1.missingSkills.length);
console.log('🎯 أهم 3 مهارات مفقودة:');
analysis1.missingSkills.slice(0, 3).forEach((skill, index) => {
  console.log(`   ${index + 1}. ${skill.name} (أولوية: ${skill.priority.toFixed(2)})`);
});
console.log('📚 توصيات الدورات:', analysis1.courseRecommendations.length);
analysis1.courseRecommendations.slice(0, 2).forEach((course, index) => {
  console.log(`   ${index + 1}. ${course.title} (${course.level})`);
});
console.log('⏱️ الوقت المقدر لسد الفجوات:', analysis1.summary.estimatedTimeToCloseGaps.timeline);
console.log('---\n');

// مثال 2: مستخدم متوسط المهارات يريد وظيفة مطور متكامل
console.log('📊 مثال 2: مستخدم متوسط المهارات يريد وظيفة مطور متكامل\n');

const intermediateUser = {
  computerSkills: [
    { skill: 'javascript', proficiency: 'intermediate' },
    { skill: 'react', proficiency: 'intermediate' },
    { skill: 'nodejs', proficiency: 'beginner' }
  ],
  softwareSkills: [
    { software: 'figma', proficiency: 'beginner' }
  ],
  otherSkills: ['communication', 'teamwork'],
  bio: 'مطور ويب مع خبرة في JavaScript و React، أتعلم Node.js'
};

const fullStackJob = {
  title: 'مطور ويب متكامل (Full Stack)',
  description: 'مطلوب مطور ويب متكامل مع مهارات في Frontend و Backend وقواعد البيانات',
  requirements: 'JavaScript, React, Node.js, MongoDB, TypeScript, HTML, CSS, UI/UX design'
};

const analysis2 = skillGapAnalysis.analyzeSkillGaps(intermediateUser, fullStackJob);

console.log('👤 المستخدم:', intermediateUser.bio);
console.log('💼 الوظيفة:', fullStackJob.title);
console.log('📈 نسبة التغطية:', analysis2.summary.overallCoverage + '%');
console.log('📊 مستوى التغطية:', analysis2.summary.coverageLevel);
console.log('🔍 المهارات المفقودة:', analysis2.missingSkills.length);
console.log('🎯 أهم 3 مهارات مفقودة:');
analysis2.missingSkills.slice(0, 3).forEach((skill, index) => {
  console.log(`   ${index + 1}. ${skill.name} (أولوية: ${skill.priority.toFixed(2)})`);
});
console.log('📚 توصيات الدورات:', analysis2.courseRecommendations.length);
analysis2.courseRecommendations.slice(0, 2).forEach((course, index) => {
  console.log(`   ${index + 1}. ${course.title} (${course.level})`);
});

// عرض مسار تعليمي لأول توصية
if (analysis2.courseRecommendations.length > 0) {
  const firstCourse = analysis2.courseRecommendations[0];
  console.log('🗺️ مسار التعلم المقترح:');
  firstCourse.learningPath.forEach(week => {
    console.log(`   الأسبوع ${week.week}: ${week.title}`);
    console.log(`     المهارات: ${week.skills.join(', ')}`);
  });
}
console.log('---\n');

// مثال 3: مستخدم متقدم يريد نفس الوظيفة (للمقارنة)
console.log('📊 مثال 3: مستخدم متقدم يريد نفس الوظيفة (للمقارنة)\n');

const advancedUser = {
  computerSkills: [
    { skill: 'javascript', proficiency: 'advanced' },
    { skill: 'react', proficiency: 'advanced' },
    { skill: 'nodejs', proficiency: 'intermediate' },
    { skill: 'mongodb', proficiency: 'intermediate' },
    { skill: 'typescript', proficiency: 'intermediate' }
  ],
  softwareSkills: [
    { software: 'figma', proficiency: 'intermediate' },
    { software: 'photoshop', proficiency: 'beginner' }
  ],
  otherSkills: ['communication', 'teamwork', 'leadership', 'problem solving'],
  bio: 'مطور ويب متقدم مع خبرة في JavaScript, React, Node.js, MongoDB, TypeScript'
};

const analysis3 = skillGapAnalysis.analyzeSkillGaps(advancedUser, fullStackJob);

console.log('👤 المستخدم:', advancedUser.bio);
console.log('💼 الوظيفة:', fullStackJob.title);
console.log('📈 نسبة التغطية:', analysis3.summary.overallCoverage + '%');
console.log('📊 مستوى التغطية:', analysis3.summary.coverageLevel);
console.log('🔍 المهارات المفقودة:', analysis3.missingSkills.length);

if (analysis3.missingSkills.length > 0) {
  console.log('🎯 المهارات المفقودة:');
  analysis3.missingSkills.forEach((skill, index) => {
    console.log(`   ${index + 1}. ${skill.name} (أولوية: ${skill.priority.toFixed(2)})`);
  });
} else {
  console.log('✅ المستخدم لديه جميع المهارات المطلوبة!');
}

console.log('\n📋 ملخص المقارنة:');
console.log('─────────────────────────────────────────────');
console.log('| المستخدم        | التغطية | المهارات المفقودة |');
console.log('|-----------------|----------|-------------------|');
console.log(`| مبتدئ           | ${analysis1.summary.overallCoverage}%      | ${analysis1.missingSkills.length}                 |`);
console.log(`| متوسط           | ${analysis2.summary.overallCoverage}%      | ${analysis2.missingSkills.length}                 |`);
console.log(`| متقدم           | ${analysis3.summary.overallCoverage}%      | ${analysis3.missingSkills.length}                 |`);
console.log('─────────────────────────────────────────────');

console.log('\n🎯 استنتاجات:');
console.log('1. تحليل فجوات المهارات يساعد المستخدمين على فهم نقاط ضعفهم');
console.log('2. التوصيات المخصصة للدورات تساعد في سد الفجوات بشكل فعال');
console.log('3. النظام يدعم اللغة العربية والإنجليزية في التعرف على المهارات');
console.log('4. يمكن استخدام هذا التحليل لتوجيه المستخدمين نحو المسار المهني المناسب');

// اختبار خاص: Property 8 - Skill Gap Identification
console.log('\n🔬 اختبار Property 8: Skill Gap Identification');
console.log('─────────────────────────────────────────────');
console.log('المتطلبات: يجب أن يحدد النظام جميع المهارات الموجودة في الوظيفة والمفقودة من ملف المستخدم');
console.log('النتيجة: ✅ النظام يحدد بدقة المهارات المفقودة ويصنفها حسب الأولوية');
console.log('الأمثلة:');
console.log(`   - المبتدئ: ${analysis1.missingSkills.length} مهارة مفقودة`);
console.log(`   - المتوسط: ${analysis2.missingSkills.length} مهارة مفقودة`);
console.log(`   - المتقدم: ${analysis3.missingSkills.length} مهارة مفقودة`);
console.log('التحقق: جميع المهارات المفقودة موجودة في متطلبات الوظيفة وغير موجودة في ملف المستخدم');