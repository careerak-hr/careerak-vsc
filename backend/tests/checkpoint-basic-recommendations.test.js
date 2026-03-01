/**
 * Checkpoint 4: التأكد من التوصيات الأساسية
 * 
 * هذا الاختبار يتحقق من:
 * 1. اختبار دقة التوصيات
 * 2. اختبار نسب التطابق
 * 3. مراجعة شرح التوصيات
 * 
 * Requirements: 1.1, 1.3, 1.4
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Services
const ContentBasedFiltering = require('../src/services/contentBasedFiltering');
const skillGapAnalysis = require('../src/services/skillGapAnalysis');
const profileAnalysisService = require('../src/services/profileAnalysisService');

// Models
const User = require('../src/models/User');
const JobPosting = require('../src/models/JobPosting');

let mongoServer;
const contentBasedFiltering = new ContentBasedFiltering();

// ============================================================================
// Setup & Teardown
// ============================================================================

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// ============================================================================
// CHECKPOINT 4.1: اختبار دقة التوصيات
// ============================================================================

describe('Checkpoint 4.1: اختبار دقة التوصيات', () => {
  
  test('يجب أن تكون التوصيات ذات صلة بمهارات المستخدم', async () => {
    // إنشاء مستخدم بمهارات محددة
    const user = await User.create({
      name: 'محمد أحمد',
      email: 'mohamed@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      experience: 3,
      education: 'Bachelor',
      location: 'Cairo',
      preferredJobType: 'full-time'
    });

    // إنشاء وظائف متنوعة
    const jobs = await JobPosting.insertMany([
      {
        title: 'Full Stack Developer',
        description: 'Looking for MERN stack developer',
        company: new mongoose.Types.ObjectId(),
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        experienceLevel: 'mid',
        location: 'Cairo',
        jobType: 'full-time',
        status: 'active'
      },
      {
        title: 'Frontend Developer',
        description: 'React developer needed',
        company: new mongoose.Types.ObjectId(),
        requiredSkills: ['JavaScript', 'React', 'CSS'],
        experienceLevel: 'mid',
        location: 'Cairo',
        jobType: 'full-time',
        status: 'active'
      },
      {
        title: 'Python Developer',
        description: 'Django developer needed',
        company: new mongoose.Types.ObjectId(),
        requiredSkills: ['Python', 'Django', 'PostgreSQL'],
        experienceLevel: 'mid',
        location: 'Cairo',
        jobType: 'full-time',
        status: 'active'
      },
      {
        title: 'Java Developer',
        description: 'Spring Boot developer',
        company: new mongoose.Types.ObjectId(),
        requiredSkills: ['Java', 'Spring Boot', 'MySQL'],
        experienceLevel: 'senior',
        location: 'Alexandria',
        jobType: 'full-time',
        status: 'active'
      }
    ]);

    // الحصول على التوصيات
    const recommendations = await contentBasedFiltering.getJobRecommendations(user._id, 10);

    // التحقق من وجود توصيات
    expect(recommendations).toBeDefined();
    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations.length).toBeGreaterThan(0);

    // التحقق من أن أفضل توصية هي Full Stack Developer
    const topRecommendation = recommendations[0];
    expect(topRecommendation.job.title).toBe('Full Stack Developer');
    expect(topRecommendation.score).toBeGreaterThan(70);

    // التحقق من أن التوصيات مرتبة حسب الدرجة
    for (let i = 0; i < recommendations.length - 1; i++) {
      expect(recommendations[i].score).toBeGreaterThanOrEqual(recommendations[i + 1].score);
    }

    // حساب نسبة التوصيات ذات الصلة (score >= 50)
    const relevantRecommendations = recommendations.filter(rec => rec.score >= 50);
    const relevanceRate = (relevantRecommendations.length / recommendations.length) * 100;

    console.log(`\n📊 نسبة التوصيات ذات الصلة: ${relevanceRate.toFixed(2)}%`);
    console.log(`✅ توصيات ذات صلة: ${relevantRecommendations.length}/${recommendations.length}`);

    // يجب أن تكون 75% على الأقل من التوصيات ذات صلة
    expect(relevanceRate).toBeGreaterThanOrEqual(75);
  });

  test('يجب أن تتحسن التوصيات مع ملف شخصي أكثر اكتمالاً', async () => {
    // مستخدم بملف شخصي غير مكتمل
    const incompleteUser = await User.create({
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript']
    });

    // مستخدم بملف شخصي مكتمل
    const completeUser = await User.create({
      name: 'سارة علي',
      email: 'sara@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: 3,
      education: 'Bachelor',
      location: 'Cairo',
      bio: 'Experienced full stack developer',
      preferredJobType: 'full-time'
    });

    // إنشاء وظيفة
    const job = await JobPosting.create({
      title: 'Full Stack Developer',
      description: 'MERN stack position',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['JavaScript', 'React', 'Node.js'],
      experienceLevel: 'mid',
      location: 'Cairo',
      jobType: 'full-time',
      status: 'active'
    });

    // حساب التطابق لكلا المستخدمين
    const incompleteMatch = await contentBasedFiltering.calculateMatchScore(incompleteUser, job);
    const completeMatch = await contentBasedFiltering.calculateMatchScore(completeUser, job);

    console.log(`\n📊 درجة التطابق (ملف غير مكتمل): ${incompleteMatch.score.toFixed(2)}`);
    console.log(`📊 درجة التطابق (ملف مكتمل): ${completeMatch.score.toFixed(2)}`);

    // يجب أن يحصل المستخدم بالملف المكتمل على درجة أعلى
    expect(completeMatch.score).toBeGreaterThan(incompleteMatch.score);
  });

  test('يجب أن تعمل التوصيات مع مستخدمين مختلفين', async () => {
    // إنشاء مستخدمين بمهارات مختلفة
    const frontendDev = await User.create({
      name: 'Frontend Developer',
      email: 'frontend@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['HTML', 'CSS', 'JavaScript', 'React'],
      experience: 2
    });

    const backendDev = await User.create({
      name: 'Backend Developer',
      email: 'backend@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL'],
      experience: 4
    });

    // إنشاء وظائف
    const frontendJob = await JobPosting.create({
      title: 'Frontend Developer',
      description: 'React developer',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['React', 'JavaScript', 'CSS'],
      experienceLevel: 'junior',
      status: 'active'
    });

    const backendJob = await JobPosting.create({
      title: 'Backend Developer',
      description: 'Node.js developer',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['Node.js', 'MongoDB'],
      experienceLevel: 'mid',
      status: 'active'
    });

    // حساب التطابق
    const frontendToFrontend = await contentBasedFiltering.calculateMatchScore(frontendDev, frontendJob);
    const frontendToBackend = await contentBasedFiltering.calculateMatchScore(frontendDev, backendJob);
    const backendToBackend = await contentBasedFiltering.calculateMatchScore(backendDev, backendJob);
    const backendToFrontend = await contentBasedFiltering.calculateMatchScore(backendDev, frontendJob);

    console.log(`\n📊 Frontend Dev → Frontend Job: ${frontendToFrontend.score.toFixed(2)}`);
    console.log(`📊 Frontend Dev → Backend Job: ${frontendToBackend.score.toFixed(2)}`);
    console.log(`📊 Backend Dev → Backend Job: ${backendToBackend.score.toFixed(2)}`);
    console.log(`📊 Backend Dev → Frontend Job: ${backendToFrontend.score.toFixed(2)}`);

    // يجب أن يحصل كل مطور على درجة أعلى في مجاله
    expect(frontendToFrontend.score).toBeGreaterThan(frontendToBackend.score);
    expect(backendToBackend.score).toBeGreaterThan(backendToFrontend.score);
  });
});

// ============================================================================
// CHECKPOINT 4.2: اختبار نسب التطابق
// ============================================================================

describe('Checkpoint 4.2: اختبار نسب التطابق', () => {
  
  test('يجب أن تكون نسب التطابق بين 0 و 100', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript', 'React']
    });

    const job = await JobPosting.create({
      title: 'Test Job',
      description: 'Test description',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['JavaScript'],
      status: 'active'
    });

    const match = await contentBasedFiltering.calculateMatchScore(user, job);

    expect(match.score).toBeGreaterThanOrEqual(0);
    expect(match.score).toBeLessThanOrEqual(100);
    expect(typeof match.score).toBe('number');
    expect(isNaN(match.score)).toBe(false);
  });

  test('يجب أن تعكس نسبة التطابق جودة المطابقة', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      experience: 5,
      education: 'Bachelor',
      location: 'Cairo'
    });

    // وظيفة مطابقة تماماً
    const perfectJob = await JobPosting.create({
      title: 'Perfect Match',
      description: 'Perfect match job',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      experienceLevel: 'senior',
      location: 'Cairo',
      status: 'active'
    });

    // وظيفة مطابقة جزئياً
    const partialJob = await JobPosting.create({
      title: 'Partial Match',
      description: 'Partial match job',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['JavaScript', 'React'],
      experienceLevel: 'mid',
      location: 'Cairo',
      status: 'active'
    });

    // وظيفة غير مطابقة
    const poorJob = await JobPosting.create({
      title: 'Poor Match',
      description: 'Poor match job',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['Python', 'Django'],
      experienceLevel: 'junior',
      location: 'Alexandria',
      status: 'active'
    });

    const perfectMatch = await contentBasedFiltering.calculateMatchScore(user, perfectJob);
    const partialMatch = await contentBasedFiltering.calculateMatchScore(user, partialJob);
    const poorMatch = await contentBasedFiltering.calculateMatchScore(user, poorJob);

    console.log(`\n📊 Perfect Match: ${perfectMatch.score.toFixed(2)}`);
    console.log(`📊 Partial Match: ${partialMatch.score.toFixed(2)}`);
    console.log(`📊 Poor Match: ${poorMatch.score.toFixed(2)}`);

    // يجب أن تكون الدرجات مرتبة
    expect(perfectMatch.score).toBeGreaterThan(partialMatch.score);
    expect(partialMatch.score).toBeGreaterThan(poorMatch.score);

    // يجب أن تكون المطابقة التامة > 80
    expect(perfectMatch.score).toBeGreaterThan(80);

    // يجب أن تكون المطابقة الضعيفة < 50
    expect(poorMatch.score).toBeLessThan(50);
  });

  test('يجب أن تكون نسب التطابق متسقة', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript', 'React']
    });

    const job = await JobPosting.create({
      title: 'Test Job',
      description: 'Test description',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['JavaScript', 'React'],
      status: 'active'
    });

    // حساب التطابق عدة مرات
    const scores = [];
    for (let i = 0; i < 5; i++) {
      const match = await contentBasedFiltering.calculateMatchScore(user, job);
      scores.push(match.score);
    }

    // يجب أن تكون جميع الدرجات متساوية
    const firstScore = scores[0];
    scores.forEach(score => {
      expect(score).toBe(firstScore);
    });

    console.log(`\n✅ الدرجات متسقة: ${firstScore.toFixed(2)}`);
  });
});

// ============================================================================
// CHECKPOINT 4.3: مراجعة شرح التوصيات
// ============================================================================

describe('Checkpoint 4.3: مراجعة شرح التوصيات', () => {
  
  test('يجب أن يحتوي كل توصية على شرح', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript', 'React'],
      experience: 3
    });

    const job = await JobPosting.create({
      title: 'React Developer',
      description: 'React position',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['JavaScript', 'React'],
      experienceLevel: 'mid',
      status: 'active'
    });

    const match = await contentBasedFiltering.calculateMatchScore(user, job);

    // يجب أن يحتوي على reasons
    expect(match).toHaveProperty('reasons');
    expect(Array.isArray(match.reasons)).toBe(true);
    expect(match.reasons.length).toBeGreaterThan(0);

    // يجب أن يكون كل سبب نص غير فارغ
    match.reasons.forEach(reason => {
      expect(typeof reason).toBe('string');
      expect(reason.length).toBeGreaterThan(0);
    });

    console.log(`\n📝 أسباب التوصية:`);
    match.reasons.forEach((reason, index) => {
      console.log(`   ${index + 1}. ${reason}`);
    });
  });

  test('يجب أن يكون الشرح واضحاً ومفيداً', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: 3,
      location: 'Cairo'
    });

    const job = await JobPosting.create({
      title: 'Full Stack Developer',
      description: 'MERN stack position',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['JavaScript', 'React', 'Node.js'],
      experienceLevel: 'mid',
      location: 'Cairo',
      status: 'active'
    });

    const match = await contentBasedFiltering.calculateMatchScore(user, job);

    // يجب أن يحتوي الشرح على معلومات مفيدة
    const reasonsText = match.reasons.join(' ').toLowerCase();

    // يجب أن يذكر المهارات المطابقة
    const hasSkillsInfo = reasonsText.includes('skill') || 
                          reasonsText.includes('مهار') ||
                          reasonsText.includes('javascript') ||
                          reasonsText.includes('react');

    expect(hasSkillsInfo).toBe(true);

    console.log(`\n✅ الشرح يحتوي على معلومات مفيدة`);
  });

  test('يجب أن يختلف الشرح حسب نوع المطابقة', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript', 'React'],
      experience: 3,
      location: 'Cairo'
    });

    // وظيفة مطابقة للمهارات
    const skillMatchJob = await JobPosting.create({
      title: 'React Developer',
      description: 'React position',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['JavaScript', 'React'],
      experienceLevel: 'mid',
      location: 'Alexandria',
      status: 'active'
    });

    // وظيفة مطابقة للموقع
    const locationMatchJob = await JobPosting.create({
      title: 'Python Developer',
      description: 'Python position',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['Python'],
      experienceLevel: 'mid',
      location: 'Cairo',
      status: 'active'
    });

    const skillMatch = await contentBasedFiltering.calculateMatchScore(user, skillMatchJob);
    const locationMatch = await contentBasedFiltering.calculateMatchScore(user, locationMatchJob);

    console.log(`\n📝 شرح المطابقة بالمهارات:`);
    skillMatch.reasons.forEach((reason, index) => {
      console.log(`   ${index + 1}. ${reason}`);
    });

    console.log(`\n📝 شرح المطابقة بالموقع:`);
    locationMatch.reasons.forEach((reason, index) => {
      console.log(`   ${index + 1}. ${reason}`);
    });

    // يجب أن يكون الشرح مختلفاً
    expect(skillMatch.reasons).not.toEqual(locationMatch.reasons);
  });
});

// ============================================================================
// CHECKPOINT 4: ملخص النتائج
// ============================================================================

describe('Checkpoint 4: ملخص النتائج', () => {
  
  test('ملخص شامل لجودة التوصيات الأساسية', async () => {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📊 Checkpoint 4: ملخص التوصيات الأساسية`);
    console.log(`${'='.repeat(70)}`);

    // إنشاء بيانات اختبار
    const users = await User.insertMany([
      {
        name: 'Frontend Developer',
        email: 'frontend@example.com',
        password: 'hashedpassword',
        role: 'job_seeker',
        skills: ['HTML', 'CSS', 'JavaScript', 'React'],
        experience: 2,
        location: 'Cairo'
      },
      {
        name: 'Backend Developer',
        email: 'backend@example.com',
        password: 'hashedpassword',
        role: 'job_seeker',
        skills: ['Node.js', 'Express', 'MongoDB'],
        experience: 4,
        location: 'Cairo'
      },
      {
        name: 'Full Stack Developer',
        email: 'fullstack@example.com',
        password: 'hashedpassword',
        role: 'job_seeker',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        experience: 5,
        location: 'Cairo'
      }
    ]);

    const jobs = await JobPosting.insertMany([
      {
        title: 'Frontend Developer',
        description: 'React developer',
        company: new mongoose.Types.ObjectId(),
        requiredSkills: ['React', 'JavaScript'],
        experienceLevel: 'junior',
        location: 'Cairo',
        status: 'active'
      },
      {
        title: 'Backend Developer',
        description: 'Node.js developer',
        company: new mongoose.Types.ObjectId(),
        requiredSkills: ['Node.js', 'MongoDB'],
        experienceLevel: 'mid',
        location: 'Cairo',
        status: 'active'
      },
      {
        title: 'Full Stack Developer',
        description: 'MERN stack developer',
        company: new mongoose.Types.ObjectId(),
        requiredSkills: ['React', 'Node.js', 'MongoDB'],
        experienceLevel: 'senior',
        location: 'Cairo',
        status: 'active'
      }
    ]);

    // اختبار كل مستخدم
    let totalRecommendations = 0;
    let relevantRecommendations = 0;
    let totalExplanations = 0;

    for (const user of users) {
      const recommendations = await contentBasedFiltering.getJobRecommendations(user._id, 10);
      
      totalRecommendations += recommendations.length;
      relevantRecommendations += recommendations.filter(rec => rec.score >= 50).length;
      totalExplanations += recommendations.reduce((sum, rec) => sum + rec.reasons.length, 0);

      console.log(`\n👤 ${user.name}:`);
      console.log(`   - عدد التوصيات: ${recommendations.length}`);
      console.log(`   - توصيات ذات صلة: ${recommendations.filter(rec => rec.score >= 50).length}`);
      console.log(`   - متوسط الدرجة: ${(recommendations.reduce((sum, rec) => sum + rec.score, 0) / recommendations.length).toFixed(2)}`);
    }

    const relevanceRate = (relevantRecommendations / totalRecommendations) * 100;
    const avgExplanations = totalExplanations / totalRecommendations;

    console.log(`\n${'='.repeat(70)}`);
    console.log(`📈 النتائج الإجمالية:`);
    console.log(`   ✅ نسبة التوصيات ذات الصلة: ${relevanceRate.toFixed(2)}%`);
    console.log(`   ✅ متوسط عدد الأسباب لكل توصية: ${avgExplanations.toFixed(2)}`);
    console.log(`   ✅ إجمالي التوصيات: ${totalRecommendations}`);
    console.log(`${'='.repeat(70)}`);

    // التحقق من المعايير
    expect(relevanceRate).toBeGreaterThanOrEqual(75);
    expect(avgExplanations).toBeGreaterThan(0);
    expect(totalRecommendations).toBeGreaterThan(0);

    console.log(`\n✅ Checkpoint 4 مكتمل بنجاح!`);
  });
});

console.log('✅ Checkpoint 4: Basic Recommendations Test Suite Loaded');
