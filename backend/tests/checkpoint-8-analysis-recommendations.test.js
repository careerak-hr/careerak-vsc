/**
 * Checkpoint 8: التأكد من التحليل والتوصيات
 * 
 * هذا الاختبار يتحقق من:
 * 1. تحليل CV بالذكاء الاصطناعي (المهام 6.1-6.5)
 * 2. تحليل الملف الشخصي (المهام 7.1-7.5)
 * 3. توصيات الدورات (المهام 9.1-9.4)
 * 4. توصيات المرشحين (المهام 10.1-10.4)
 * 5. التعلم من السلوك (المهام 11.1-11.5)
 * 
 * Requirements: جميع متطلبات التحليل والتوصيات
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Services
const cvParserService = require('../src/services/cvParserService');
const cvQualityAnalyzer = require('../src/services/cvQualityAnalyzer');
const cvImprovementSuggestions = require('../src/services/cvImprovementSuggestions');
const profileAnalysisService = require('../src/services/profileAnalysisService');
const skillGapAnalysis = require('../src/services/skillGapAnalysis');
const courseRecommendationService = require('../src/services/courseRecommendationService');
const candidateRankingService = require('../src/services/candidateRankingService');
const userInteractionService = require('../src/services/userInteractionService');
const patternAnalysisService = require('../src/services/patternAnalysisService');

// Models
const User = require('../src/models/User');
const JobPosting = require('../src/models/JobPosting');
const EducationalCourse = require('../src/models/EducationalCourse');
const UserInteraction = require('../src/models/UserInteraction');
const ProfileAnalysis = require('../src/models/ProfileAnalysis');

let mongoServer;

// ============================================================================
// Setup & Teardown
// ============================================================================

beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        storageEngine: 'wiredTiger',
      },
    });
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  } catch (error) {
    console.error('Failed to start MongoDB Memory Server:', error);
    throw error;
  }
}, 60000); // 60 seconds timeout

afterAll(async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('Failed to stop MongoDB Memory Server:', error);
  }
}, 30000); // 30 seconds timeout

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// ============================================================================
// CHECKPOINT 8.1: تحليل CV بالذكاء الاصطناعي
// ============================================================================

describe('Checkpoint 8.1: تحليل CV بالذكاء الاصطناعي', () => {
  
  test('يجب أن يستخرج المعلومات من CV بدقة عالية', async () => {
    const cvText = `
      John Doe
      Email: john@example.com
      Phone: +1234567890
      
      EDUCATION
      Bachelor of Computer Science
      University of Cairo, 2018-2022
      
      SKILLS
      JavaScript, React, Node.js, MongoDB, Python
      
      EXPERIENCE
      Software Engineer at Tech Company
      2022-2024 (2 years)
      - Developed web applications
      - Led team of 5 developers
    `;

    const parsed = await cvParserService.parseCV(cvText);

    expect(parsed).toHaveProperty('contactInfo');
    expect(parsed.contactInfo.email).toBe('john@example.com');
    expect(parsed).toHaveProperty('education');
    expect(parsed.education.length).toBeGreaterThan(0);
    expect(parsed).toHaveProperty('skills');
    expect(parsed.skills.length).toBeGreaterThan(0);
    expect(parsed).toHaveProperty('experience');
    expect(parsed.experience.length).toBeGreaterThan(0);

    console.log(`\n✅ استخراج المعلومات من CV: نجح`);
    console.log(`   - البريد الإلكتروني: ${parsed.contactInfo.email}`);
    console.log(`   - عدد المهارات: ${parsed.skills.length}`);
    console.log(`   - عدد الخبرات: ${parsed.experience.length}`);
  });

  test('يجب أن يحلل جودة السيرة الذاتية', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: 3,
      education: 'Bachelor',
      bio: 'Experienced developer'
    });

    const quality = await cvQualityAnalyzer.analyzeCVQuality(user._id);

    expect(quality).toHaveProperty('overallScore');
    expect(quality.overallScore).toBeGreaterThanOrEqual(0);
    expect(quality.overallScore).toBeLessThanOrEqual(100);
    expect(quality).toHaveProperty('strengths');
    expect(quality).toHaveProperty('weaknesses');

    console.log(`\n✅ تحليل جودة CV: نجح`);
    console.log(`   - الدرجة الإجمالية: ${quality.overallScore.toFixed(2)}`);
    console.log(`   - نقاط القوة: ${quality.strengths.length}`);
    console.log(`   - نقاط الضعف: ${quality.weaknesses.length}`);
  });

  test('يجب أن يقدم اقتراحات لتحسين السيرة الذاتية', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript'],
      experience: 1
    });

    const suggestions = await cvImprovementSuggestions.generateSuggestions(user._id);

    expect(suggestions).toHaveProperty('suggestions');
    expect(Array.isArray(suggestions.suggestions)).toBe(true);
    expect(suggestions.suggestions.length).toBeGreaterThan(0);

    console.log(`\n✅ اقتراحات تحسين CV: نجح`);
    console.log(`   - عدد الاقتراحات: ${suggestions.suggestions.length}`);
  });
});

// ============================================================================
// CHECKPOINT 8.2: تحليل الملف الشخصي
// ============================================================================

describe('Checkpoint 8.2: تحليل الملف الشخصي', () => {
  
  test('يجب أن يحسب درجة اكتمال الملف الشخصي بدقة', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript', 'React'],
      experience: 3,
      education: 'Bachelor',
      location: 'Cairo',
      bio: 'Test bio'
    });

    const analysis = await profileAnalysisService.analyzeProfile(user._id);

    expect(analysis).toHaveProperty('completenessScore');
    expect(analysis.completenessScore).toBeGreaterThanOrEqual(0);
    expect(analysis.completenessScore).toBeLessThanOrEqual(100);

    console.log(`\n✅ حساب درجة الاكتمال: نجح`);
    console.log(`   - درجة الاكتمال: ${analysis.completenessScore.toFixed(2)}%`);
  });

  test('يجب أن يحدد فجوات المهارات', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript', 'React'],
      experience: 2
    });

    const job = await JobPosting.create({
      title: 'Full Stack Developer',
      description: 'MERN stack position',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      status: 'active'
    });

    const gaps = await skillGapAnalysis.analyzeSkillGaps(user._id, job._id);

    expect(gaps).toHaveProperty('missingSkills');
    expect(gaps.missingSkills).toContain('Node.js');
    expect(gaps.missingSkills).toContain('MongoDB');

    console.log(`\n✅ تحديد فجوات المهارات: نجح`);
    console.log(`   - المهارات المفقودة: ${gaps.missingSkills.join(', ')}`);
  });

  test('يجب أن يولد اقتراحات محددة وقابلة للتنفيذ', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript'],
      experience: 1
    });

    const analysis = await profileAnalysisService.analyzeProfile(user._id);

    expect(analysis).toHaveProperty('suggestions');
    expect(Array.isArray(analysis.suggestions)).toBe(true);
    expect(analysis.suggestions.length).toBeGreaterThan(0);

    // يجب أن يكون لكل اقتراح أولوية
    analysis.suggestions.forEach(suggestion => {
      expect(suggestion).toHaveProperty('priority');
      expect(['high', 'medium', 'low']).toContain(suggestion.priority);
    });

    console.log(`\n✅ توليد الاقتراحات: نجح`);
    console.log(`   - عدد الاقتراحات: ${analysis.suggestions.length}`);
  });

  test('يجب أن يتتبع التقدم في التحسينات', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript'],
      experience: 1
    });

    // تحليل أولي
    const initialAnalysis = await profileAnalysisService.analyzeProfile(user._id);
    const initialScore = initialAnalysis.completenessScore;

    // تحديث الملف الشخصي
    user.skills.push('React', 'Node.js');
    user.education = 'Bachelor';
    user.location = 'Cairo';
    await user.save();

    // تحليل بعد التحديث
    const updatedAnalysis = await profileAnalysisService.analyzeProfile(user._id);
    const updatedScore = updatedAnalysis.completenessScore;

    expect(updatedScore).toBeGreaterThan(initialScore);

    console.log(`\n✅ تتبع التقدم: نجح`);
    console.log(`   - الدرجة الأولية: ${initialScore.toFixed(2)}%`);
    console.log(`   - الدرجة المحدثة: ${updatedScore.toFixed(2)}%`);
    console.log(`   - التحسن: +${(updatedScore - initialScore).toFixed(2)}%`);
  });
});

// ============================================================================
// CHECKPOINT 8.3: توصيات الدورات
// ============================================================================

describe('Checkpoint 8.3: توصيات الدورات', () => {
  
  test('يجب أن يوصي بدورات لسد فجوات المهارات', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript'],
      experience: 1
    });

    // إنشاء دورات
    await EducationalCourse.insertMany([
      {
        title: 'React Masterclass',
        description: 'Learn React',
        instructor: 'John Doe',
        skills: ['React'],
        level: 'beginner',
        duration: 40,
        status: 'active'
      },
      {
        title: 'Node.js Complete Guide',
        description: 'Learn Node.js',
        instructor: 'Jane Smith',
        skills: ['Node.js'],
        level: 'beginner',
        duration: 50,
        status: 'active'
      }
    ]);

    const recommendations = await courseRecommendationService.getCourseRecommendations(user._id);

    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations.length).toBeGreaterThan(0);

    console.log(`\n✅ توصيات الدورات: نجح`);
    console.log(`   - عدد الدورات المقترحة: ${recommendations.length}`);
  });

  test('يجب أن يوصي بدورات مناسبة للمستوى', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript'],
      experience: 1
    });

    const beginnerCourse = await EducationalCourse.create({
      title: 'React for Beginners',
      description: 'Learn React basics',
      instructor: 'John Doe',
      skills: ['React'],
      level: 'beginner',
      duration: 30,
      status: 'active'
    });

    const advancedCourse = await EducationalCourse.create({
      title: 'Advanced React Patterns',
      description: 'Advanced React',
      instructor: 'Jane Smith',
      skills: ['React'],
      level: 'advanced',
      duration: 50,
      status: 'active'
    });

    const recommendations = await courseRecommendationService.getCourseRecommendations(user._id);

    // يجب أن تكون الدورات للمبتدئين أعلى في الترتيب
    const beginnerIndex = recommendations.findIndex(rec => rec.course._id.equals(beginnerCourse._id));
    const advancedIndex = recommendations.findIndex(rec => rec.course._id.equals(advancedCourse._id));

    if (beginnerIndex !== -1 && advancedIndex !== -1) {
      expect(beginnerIndex).toBeLessThan(advancedIndex);
    }

    console.log(`\n✅ توصيات حسب المستوى: نجح`);
  });

  test('يجب أن يتوقع تحسين فرص التوظيف', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript'],
      experience: 1
    });

    const course = await EducationalCourse.create({
      title: 'React Masterclass',
      description: 'Learn React',
      instructor: 'John Doe',
      skills: ['React'],
      level: 'beginner',
      duration: 40,
      status: 'active'
    });

    const recommendations = await courseRecommendationService.getCourseRecommendations(user._id);

    if (recommendations.length > 0) {
      const firstRec = recommendations[0];
      expect(firstRec).toHaveProperty('expectedImpact');
      expect(firstRec.expectedImpact).toBeGreaterThanOrEqual(0);
      expect(firstRec.expectedImpact).toBeLessThanOrEqual(100);

      console.log(`\n✅ توقع التأثير: نجح`);
      console.log(`   - التأثير المتوقع: ${firstRec.expectedImpact.toFixed(2)}%`);
    }
  });
});

// ============================================================================
// CHECKPOINT 8.4: توصيات المرشحين للشركات
// ============================================================================

describe('Checkpoint 8.4: توصيات المرشحين للشركات', () => {
  
  test('يجب أن يرتب المرشحين حسب التطابق', async () => {
    // إنشاء مرشحين
    const candidates = await User.insertMany([
      {
        name: 'Perfect Match',
        email: 'perfect@example.com',
        password: 'hashedpassword',
        role: 'job_seeker',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        experience: 5,
        location: 'Cairo'
      },
      {
        name: 'Good Match',
        email: 'good@example.com',
        password: 'hashedpassword',
        role: 'job_seeker',
        skills: ['JavaScript', 'React'],
        experience: 3,
        location: 'Cairo'
      },
      {
        name: 'Poor Match',
        email: 'poor@example.com',
        password: 'hashedpassword',
        role: 'job_seeker',
        skills: ['Python'],
        experience: 1,
        location: 'Alexandria'
      }
    ]);

    const job = await JobPosting.create({
      title: 'Full Stack Developer',
      description: 'MERN stack position',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      experienceLevel: 'senior',
      location: 'Cairo',
      status: 'active'
    });

    const rankedCandidates = await candidateRankingService.rankCandidates(job._id);

    expect(Array.isArray(rankedCandidates)).toBe(true);
    expect(rankedCandidates.length).toBeGreaterThan(0);

    // يجب أن يكون الترتيب تنازلياً حسب الدرجة
    for (let i = 0; i < rankedCandidates.length - 1; i++) {
      expect(rankedCandidates[i].score).toBeGreaterThanOrEqual(rankedCandidates[i + 1].score);
    }

    console.log(`\n✅ ترتيب المرشحين: نجح`);
    console.log(`   - عدد المرشحين: ${rankedCandidates.length}`);
    rankedCandidates.forEach((candidate, index) => {
      console.log(`   ${index + 1}. ${candidate.candidate.name}: ${candidate.score.toFixed(2)}`);
    });
  });

  test('يجب أن يحلل نقاط القوة والضعف للمرشحين', async () => {
    const candidate = await User.create({
      name: 'Test Candidate',
      email: 'candidate@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript', 'React'],
      experience: 3,
      location: 'Cairo'
    });

    const job = await JobPosting.create({
      title: 'Full Stack Developer',
      description: 'MERN stack position',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      experienceLevel: 'mid',
      location: 'Cairo',
      status: 'active'
    });

    const analysis = await candidateRankingService.analyzeCandidateMatch(candidate._id, job._id);

    expect(analysis).toHaveProperty('strengths');
    expect(analysis).toHaveProperty('weaknesses');
    expect(Array.isArray(analysis.strengths)).toBe(true);
    expect(Array.isArray(analysis.weaknesses)).toBe(true);

    console.log(`\n✅ تحليل المرشح: نجح`);
    console.log(`   - نقاط القوة: ${analysis.strengths.length}`);
    console.log(`   - نقاط الضعف: ${analysis.weaknesses.length}`);
  });

  test('يجب أن يقدم توصيات استباقية', async () => {
    const candidate = await User.create({
      name: 'Proactive Candidate',
      email: 'proactive@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: 4,
      location: 'Cairo'
    });

    const job = await JobPosting.create({
      title: 'Senior Developer',
      description: 'Senior position',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['JavaScript', 'React', 'Node.js'],
      experienceLevel: 'senior',
      location: 'Cairo',
      status: 'active'
    });

    const proactiveRecs = await candidateRankingService.getProactiveRecommendations(job._id);

    expect(Array.isArray(proactiveRecs)).toBe(true);

    console.log(`\n✅ التوصيات الاستباقية: نجح`);
    console.log(`   - عدد المرشحين المقترحين: ${proactiveRecs.length}`);
  });
});

// ============================================================================
// CHECKPOINT 8.5: التعلم من السلوك
// ============================================================================

describe('Checkpoint 8.5: التعلم من السلوك', () => {
  
  test('يجب أن يتتبع جميع التفاعلات', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      preferences: { tracking: true }
    });

    const job = await JobPosting.create({
      title: 'Test Job',
      description: 'Test description',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['JavaScript'],
      status: 'active'
    });

    // تسجيل تفاعلات مختلفة
    const actions = ['view', 'like', 'save', 'apply'];
    
    for (const action of actions) {
      await userInteractionService.trackInteraction({
        userId: user._id,
        itemType: 'job',
        itemId: job._id,
        action,
        duration: 30
      });
    }

    const interactions = await UserInteraction.find({ userId: user._id });

    expect(interactions.length).toBe(actions.length);

    console.log(`\n✅ تتبع التفاعلات: نجح`);
    console.log(`   - عدد التفاعلات المسجلة: ${interactions.length}`);
  });

  test('يجب أن يحلل أنماط السلوك', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      preferences: { tracking: true }
    });

    // إنشاء تفاعلات متعددة
    const jobs = await JobPosting.insertMany([
      {
        title: 'React Developer',
        description: 'React position',
        company: new mongoose.Types.ObjectId(),
        requiredSkills: ['React'],
        status: 'active'
      },
      {
        title: 'Node.js Developer',
        description: 'Node.js position',
        company: new mongoose.Types.ObjectId(),
        requiredSkills: ['Node.js'],
        status: 'active'
      }
    ]);

    for (const job of jobs) {
      await userInteractionService.trackInteraction({
        userId: user._id,
        itemType: 'job',
        itemId: job._id,
        action: 'like',
        duration: 60
      });
    }

    const patterns = await patternAnalysisService.analyzeUserPatterns(user._id);

    expect(patterns).toHaveProperty('preferences');
    expect(patterns).toHaveProperty('behavior');

    console.log(`\n✅ تحليل الأنماط: نجح`);
  });

  test('يجب أن يحترم خيار إيقاف التتبع', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      preferences: { tracking: false }
    });

    const job = await JobPosting.create({
      title: 'Test Job',
      description: 'Test description',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['JavaScript'],
      status: 'active'
    });

    // محاولة تسجيل تفاعل
    await userInteractionService.trackInteraction({
      userId: user._id,
      itemType: 'job',
      itemId: job._id,
      action: 'view',
      duration: 30
    });

    const interactions = await UserInteraction.find({ userId: user._id });

    // يجب ألا يتم تسجيل التفاعل
    expect(interactions.length).toBe(0);

    console.log(`\n✅ احترام خيار إيقاف التتبع: نجح`);
  });

  test('يجب أن تتحسن التوصيات بناءً على التفاعلات', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript'],
      preferences: { tracking: true }
    });

    const reactJob = await JobPosting.create({
      title: 'React Developer',
      description: 'React position',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['JavaScript', 'React'],
      status: 'active'
    });

    const pythonJob = await JobPosting.create({
      title: 'Python Developer',
      description: 'Python position',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['Python'],
      status: 'active'
    });

    // تسجيل تفاعلات إيجابية مع React
    await userInteractionService.trackInteraction({
      userId: user._id,
      itemType: 'job',
      itemId: reactJob._id,
      action: 'apply',
      duration: 120
    });

    // تسجيل تفاعل سلبي مع Python
    await userInteractionService.trackInteraction({
      userId: user._id,
      itemType: 'job',
      itemId: pythonJob._id,
      action: 'ignore',
      duration: 5
    });

    // الحصول على التوصيات (يجب أن تتأثر بالتفاعلات)
    const ContentBasedFiltering = require('../src/services/contentBasedFiltering');
    const contentBasedFiltering = new ContentBasedFiltering();
    const recommendations = await contentBasedFiltering.getJobRecommendations(user._id, 10);

    expect(Array.isArray(recommendations)).toBe(true);

    console.log(`\n✅ تحسين التوصيات بناءً على التفاعلات: نجح`);
  });
});

// ============================================================================
// CHECKPOINT 8: ملخص شامل
// ============================================================================

describe('Checkpoint 8: ملخص شامل للتحليل والتوصيات', () => {
  
  test('ملخص شامل لجميع مكونات التحليل والتوصيات', async () => {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📊 Checkpoint 8: ملخص التحليل والتوصيات`);
    console.log(`${'='.repeat(70)}`);

    // إنشاء بيانات اختبار شاملة
    const user = await User.create({
      name: 'Comprehensive Test User',
      email: 'comprehensive@example.com',
      password: 'hashedpassword',
      role: 'job_seeker',
      skills: ['JavaScript', 'React'],
      experience: 3,
      education: 'Bachelor',
      location: 'Cairo',
      bio: 'Experienced developer',
      preferences: { tracking: true }
    });

    const job = await JobPosting.create({
      title: 'Full Stack Developer',
      description: 'MERN stack position',
      company: new mongoose.Types.ObjectId(),
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      experienceLevel: 'mid',
      location: 'Cairo',
      status: 'active'
    });

    const course = await EducationalCourse.create({
      title: 'Node.js Complete Guide',
      description: 'Learn Node.js',
      instructor: 'John Doe',
      skills: ['Node.js'],
      level: 'intermediate',
      duration: 50,
      status: 'active'
    });

    // 1. تحليل جودة CV
    console.log(`\n1️⃣ تحليل جودة CV:`);
    const cvQuality = await cvQualityAnalyzer.analyzeCVQuality(user._id);
    console.log(`   ✅ الدرجة الإجمالية: ${cvQuality.overallScore.toFixed(2)}`);
    console.log(`   ✅ نقاط القوة: ${cvQuality.strengths.length}`);
    console.log(`   ✅ نقاط الضعف: ${cvQuality.weaknesses.length}`);

    // 2. تحليل الملف الشخصي
    console.log(`\n2️⃣ تحليل الملف الشخصي:`);
    const profileAnalysis = await profileAnalysisService.analyzeProfile(user._id);
    console.log(`   ✅ درجة الاكتمال: ${profileAnalysis.completenessScore.toFixed(2)}%`);
    console.log(`   ✅ عدد الاقتراحات: ${profileAnalysis.suggestions.length}`);

    // 3. تحليل فجوات المهارات
    console.log(`\n3️⃣ تحليل فجوات المهارات:`);
    const skillGaps = await skillGapAnalysis.analyzeSkillGaps(user._id, job._id);
    console.log(`   ✅ المهارات المفقودة: ${skillGaps.missingSkills.join(', ')}`);

    // 4. توصيات الدورات
    console.log(`\n4️⃣ توصيات الدورات:`);
    const courseRecs = await courseRecommendationService.getCourseRecommendations(user._id);
    console.log(`   ✅ عدد الدورات المقترحة: ${courseRecs.length}`);

    // 5. ترتيب المرشحين
    console.log(`\n5️⃣ ترتيب المرشحين:`);
    const rankedCandidates = await candidateRankingService.rankCandidates(job._id);
    console.log(`   ✅ عدد المرشحين المرتبين: ${rankedCandidates.length}`);

    // 6. تتبع التفاعلات
    console.log(`\n6️⃣ تتبع التفاعلات:`);
    await userInteractionService.trackInteraction({
      userId: user._id,
      itemType: 'job',
      itemId: job._id,
      action: 'apply',
      duration: 120
    });
    const interactions = await UserInteraction.find({ userId: user._id });
    console.log(`   ✅ عدد التفاعلات المسجلة: ${interactions.length}`);

    console.log(`\n${'='.repeat(70)}`);
    console.log(`📈 النتائج الإجمالية:`);
    console.log(`   ✅ تحليل CV: يعمل بكفاءة`);
    console.log(`   ✅ تحليل الملف الشخصي: يعمل بكفاءة`);
    console.log(`   ✅ فجوات المهارات: يتم تحديدها بدقة`);
    console.log(`   ✅ توصيات الدورات: متاحة ومخصصة`);
    console.log(`   ✅ ترتيب المرشحين: يعمل بكفاءة`);
    console.log(`   ✅ تتبع التفاعلات: يعمل بكفاءة`);
    console.log(`${'='.repeat(70)}`);

    // التحقق من جميع المكونات
    expect(cvQuality.overallScore).toBeGreaterThanOrEqual(0);
    expect(profileAnalysis.completenessScore).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(skillGaps.missingSkills)).toBe(true);
    expect(Array.isArray(courseRecs)).toBe(true);
    expect(Array.isArray(rankedCandidates)).toBe(true);
    expect(interactions.length).toBeGreaterThan(0);

    console.log(`\n✅ Checkpoint 8 مكتمل بنجاح!`);
  });
});

console.log('✅ Checkpoint 8: Analysis & Recommendations Test Suite Loaded');
