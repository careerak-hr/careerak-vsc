/**
 * 🧪 Integration Test: Recommendation Explanations API
 * اختبار تكامل: واجهات API لشرح التوصيات
 * 
 * يختبر أن واجهات API تعرض أسباب التوصيات بشكل صحيح
 */

const request = require('supertest');
const app = require('../../src/app');
const { Individual } = require('../../src/models/User');
const JobPosting = require('../../src/models/JobPosting');
const jwt = require('jsonwebtoken');

describe('Recommendation Explanations API Integration', () => {
  let testUser;
  let testToken;
  let testJobs = [];

  beforeAll(async () => {
    // إنشاء مستخدم اختبار
    testUser = new Individual({
      firstName: 'Test',
      lastName: 'User',
      email: 'test.recommendations@example.com',
      password: 'password123',
      city: 'القاهرة',
      country: 'مصر',
      computerSkills: [
        { skill: 'JavaScript', proficiency: 'expert' },
        { skill: 'React', proficiency: 'advanced' }
      ],
      experienceList: [{
        company: 'Tech Company',
        position: 'Senior Developer',
        from: new Date('2019-01-01'),
        to: new Date('2024-01-01')
      }],
      educationList: [{
        degree: 'بكالوريوس',
        level: 'Computer Science',
        institution: 'University'
      }]
    });

    await testUser.save();

    // إنشاء توكن للمستخدم
    testToken = jwt.sign(
      { id: testUser._id, email: testUser.email, role: 'individual' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // إنشاء وظائف اختبار
    testJobs = await JobPosting.create([
      {
        title: 'Senior JavaScript Developer',
        description: 'تطوير باستخدام JavaScript و React',
        requirements: 'خبرة 5 سنوات في JavaScript و React',
        location: 'القاهرة، مصر',
        salary: { min: 20000, max: 30000 },
        jobType: 'Full-time',
        status: 'Open',
        postedBy: testUser._id
      },
      {
        title: 'Frontend Developer',
        description: 'تطوير واجهات',
        requirements: 'خبرة في JavaScript',
        location: 'القاهرة، مصر',
        salary: { min: 15000, max: 25000 },
        jobType: 'Full-time',
        status: 'Open',
        postedBy: testUser._id
      },
      {
        title: 'Python Developer',
        description: 'تطوير باستخدام Python',
        requirements: 'خبرة في Python',
        location: 'نيويورك',
        salary: { min: 30000, max: 50000 },
        jobType: 'Full-time',
        status: 'Open',
        postedBy: testUser._id
      }
    ]);
  });

  afterAll(async () => {
    // تنظيف البيانات
    await Individual.deleteMany({ email: 'test.recommendations@example.com' });
    await JobPosting.deleteMany({ _id: { $in: testJobs.map(j => j._id) } });
  });

  /**
   * اختبار: GET /api/recommendations/jobs
   * يجب أن يعرض التوصيات مع أسبابها
   */
  test('GET /api/recommendations/jobs should return recommendations with explanations', async () => {
    const response = await request(app)
      .get('/api/recommendations/jobs')
      .set('Authorization', `Bearer ${testToken}`)
      .query({ limit: 5 })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.recommendations).toBeDefined();
    expect(Array.isArray(response.body.recommendations)).toBe(true);
    expect(response.body.recommendations.length).toBeGreaterThan(0);

    // التحقق من أن كل توصية لها أسباب
    response.body.recommendations.forEach((recommendation, index) => {
      expect(recommendation.reasons).toBeDefined();
      expect(Array.isArray(recommendation.reasons)).toBe(true);
      expect(recommendation.reasons.length).toBeGreaterThan(0);
      
      console.log(`✅ Recommendation ${index + 1} (${recommendation.job.title}) has ${recommendation.reasons.length} reasons`);
      
      // التحقق من هيكل الأسباب
      recommendation.reasons.forEach((reason, reasonIndex) => {
        expect(reason.type).toBeDefined();
        expect(reason.message).toBeDefined();
        expect(reason.strength).toBeDefined();
        
        console.log(`   ${reasonIndex + 1}. ${reason.message} (${reason.type}, ${reason.strength})`);
      });
    });
  });

  /**
   * اختبار: GET /api/recommendations/jobs/:jobId/match
   * يجب أن يحسب درجة التطابق مع أسباب مفصلة
   */
  test('GET /api/recommendations/jobs/:jobId/match should return detailed match analysis with reasons', async () => {
    const jobId = testJobs[0]._id;
    
    const response = await request(app)
      .get(`/api/recommendations/jobs/${jobId}/match`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.matchScore).toBeDefined();
    expect(response.body.reasons).toBeDefined();
    expect(response.body.recommendations).toBeDefined();

    // التحقق من درجة التطابق
    expect(response.body.matchScore.percentage).toBeGreaterThanOrEqual(0);
    expect(response.body.matchScore.percentage).toBeLessThanOrEqual(100);
    expect(response.body.matchScore.overall).toBeGreaterThanOrEqual(0);
    expect(response.body.matchScore.overall).toBeLessThanOrEqual(1);

    // التحقق من الأسباب
    expect(Array.isArray(response.body.reasons)).toBe(true);
    expect(response.body.reasons.length).toBeGreaterThan(0);

    // التحقق من الاقتراحات
    expect(Array.isArray(response.body.recommendations)).toBe(true);
    expect(response.body.recommendations.length).toBeGreaterThan(0);

    console.log(`✅ Job match analysis for "${response.body.job.title}":`);
    console.log(`   Match Score: ${response.body.matchScore.percentage}%`);
    console.log(`   Reasons: ${response.body.reasons.length}`);
    console.log(`   Recommendations: ${response.body.recommendations.length}`);
  });

  /**
   * اختبار: GET /api/recommendations/saved
   * يجب أن يعرض التوصيات المحفوظة مع أسبابها
   */
  test('GET /api/recommendations/saved should return saved recommendations with explanations', async () => {
    const response = await request(app)
      .get('/api/recommendations/saved')
      .set('Authorization', `Bearer ${testToken}`)
      .query({ limit: 3, minScore: 30 })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.recommendations).toBeDefined();
    expect(Array.isArray(response.body.recommendations)).toBe(true);

    if (response.body.recommendations.length > 0) {
      // التحقق من أن التوصيات المحفوظة لها أسباب
      response.body.recommendations.forEach((recommendation, index) => {
        expect(recommendation.reasons).toBeDefined();
        expect(Array.isArray(recommendation.reasons)).toBe(true);
        expect(recommendation.reasons.length).toBeGreaterThan(0);
        
        console.log(`✅ Saved recommendation ${index + 1} (${recommendation.job.title}) has ${recommendation.reasons.length} reasons`);
      });
    } else {
      console.log('⚠️ No saved recommendations found (this is OK for new users)');
    }
  });

  /**
   * اختبار: GET /api/recommendations/profile-analysis
   * يجب أن يعرض تحليل الملف الشخصي مع اقتراحات
   */
  test('GET /api/recommendations/profile-analysis should return profile analysis with suggestions', async () => {
    const response = await request(app)
      .get('/api/recommendations/profile-analysis')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.analysis).toBeDefined();
    
    // التحقق من تحليل الملف الشخصي
    expect(response.body.analysis.profileCompleteness).toBeDefined();
    expect(response.body.analysis.strengths).toBeDefined();
    expect(response.body.analysis.improvementAreas).toBeDefined();
    expect(response.body.analysis.recommendations).toBeDefined();

    // التحقق من أن الاقتراحات لها هيكل صحيح
    expect(Array.isArray(response.body.analysis.recommendations)).toBe(true);
    
    if (response.body.analysis.recommendations.length > 0) {
      response.body.analysis.recommendations.forEach((recommendation, index) => {
        expect(recommendation.category).toBeDefined();
        expect(recommendation.priority).toBeDefined();
        expect(recommendation.suggestion).toBeDefined();
        
        console.log(`✅ Profile recommendation ${index + 1}: ${recommendation.suggestion} (${recommendation.priority} priority)`);
      });
    }

    console.log(`✅ Profile completeness: ${response.body.analysis.profileCompleteness.percentage}%`);
    console.log(`✅ Strengths: ${response.body.analysis.strengths.length}`);
    console.log(`✅ Improvement areas: ${response.body.analysis.improvementAreas.length}`);
  });
});