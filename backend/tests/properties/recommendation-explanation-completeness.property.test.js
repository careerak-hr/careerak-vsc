/**
 * 🧪 Property-Based Test: Explanation Completeness
 * اختبار خاصية: اكتمال شرح التوصيات
 * 
 * Property 3: Explanation Completeness
 * For any recommendation, there should be at least one reason explaining why it was recommended.
 * 
 * Validates: Requirements 1.3 (شرح سبب التوصية - explainable AI)
 */

const ContentBasedFiltering = require('../../src/services/contentBasedFiltering');

describe('Property 3: Explanation Completeness', () => {
  let contentBasedFiltering;

  beforeAll(() => {
    contentBasedFiltering = new ContentBasedFiltering();
  });

  /**
   * Property 3.1: Every recommendation should have at least one reason
   * كل توصية يجب أن يكون لها سبب واحد على الأقل
   */
  test('every recommendation should have at least one reason', async () => {
    const user = {
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
      educationList: [{ degree: 'بكالوريوس', level: 'Computer Science', institution: 'University' }],
      city: 'القاهرة',
      country: 'مصر'
    };

    const jobs = [
      {
        title: 'Senior JavaScript Developer',
        description: 'تطوير باستخدام JavaScript و React',
        requirements: 'خبرة 5 سنوات في JavaScript و React',
        location: 'القاهرة، مصر',
        salary: { min: 20000, max: 30000 },
        jobType: 'Full-time'
      },
      {
        title: 'Frontend Developer',
        description: 'تطوير واجهات',
        requirements: 'خبرة في JavaScript',
        location: 'القاهرة، مصر',
        salary: { min: 15000, max: 25000 },
        jobType: 'Full-time'
      },
      {
        title: 'Python Developer',
        description: 'تطوير باستخدام Python',
        requirements: 'خبرة في Python',
        location: 'نيويورك',
        salary: { min: 30000, max: 50000 },
        jobType: 'Full-time'
      }
    ];

    const recommendations = await contentBasedFiltering.rankJobsByMatch(user, jobs);
    
    // التحقق من وجود توصيات
    expect(recommendations.length).toBeGreaterThan(0);
    
    // كل توصية يجب أن يكون لها أسباب
    recommendations.forEach((rec, index) => {
      expect(rec.reasons).toBeDefined();
      expect(Array.isArray(rec.reasons)).toBe(true);
      expect(rec.reasons.length).toBeGreaterThan(0);
      
      console.log(`✅ Recommendation ${index + 1} (${rec.job.title}) has ${rec.reasons.length} reasons:`);
      rec.reasons.forEach((reason, reasonIndex) => {
        console.log(`   ${reasonIndex + 1}. ${reason.message} (${reason.type}, ${reason.strength})`);
      });
    });
  });

  /**
   * Property 3.2: Reasons should be relevant to the match score
   * الأسباب يجب أن تكون ذات صلة بدرجة التطابق
   */
  test('reasons should be relevant to the match score', async () => {
    const user = {
      computerSkills: [{ skill: 'JavaScript', proficiency: 'expert' }],
      experienceList: [{
        company: 'Tech Corp',
        position: 'Developer',
        from: new Date('2020-01-01'),
        to: new Date('2023-12-31')
      }],
      educationList: [{ degree: 'بكالوريوس', level: 'Computer Science', institution: 'University' }],
      city: 'القاهرة',
      country: 'مصر'
    };

    const jobs = [
      {
        title: 'JavaScript Developer',
        description: 'تطوير باستخدام JavaScript',
        requirements: 'خبرة في JavaScript',
        location: 'القاهرة، مصر',
        salary: { min: 10000, max: 20000 },
        jobType: 'Full-time'
      }
    ];

    const recommendations = await contentBasedFiltering.rankJobsByMatch(user, jobs);
    
    expect(recommendations.length).toBe(1);
    const recommendation = recommendations[0];
    
    // يجب أن يكون هناك أسباب للمهارات (JavaScript)
    const skillReasons = recommendation.reasons.filter(r => r.type === 'skills');
    expect(skillReasons.length).toBeGreaterThan(0);
    
    // يجب أن يكون هناك أسباب للخبرة
    const experienceReasons = recommendation.reasons.filter(r => r.type === 'experience');
    expect(experienceReasons.length).toBeGreaterThan(0);
    
    // يجب أن يكون هناك أسباب للموقع
    const locationReasons = recommendation.reasons.filter(r => r.type === 'location');
    expect(locationReasons.length).toBeGreaterThan(0);
    
    // يجب أن يكون هناك أسباب للتعليم
    const educationReasons = recommendation.reasons.filter(r => r.type === 'education');
    expect(educationReasons.length).toBeGreaterThan(0);
  });

  /**
   * Property 3.3: Reasons should have proper structure
   * الأسباب يجب أن يكون لها هيكل صحيح
   */
  test('reasons should have proper structure', async () => {
    const user = {
      computerSkills: [{ skill: 'Python', proficiency: 'intermediate' }],
      experienceList: [],
      educationList: [],
      city: 'الجيزة',
      country: 'مصر'
    };

    const jobs = [{
      title: 'Python Developer',
      description: 'تطوير باستخدام Python',
      requirements: 'خبرة في Python',
      location: 'القاهرة، مصر',
      salary: { min: 15000, max: 25000 },
      jobType: 'Full-time'
    }];

    const recommendations = await contentBasedFiltering.rankJobsByMatch(user, jobs);
    
    expect(recommendations.length).toBe(1);
    const reasons = recommendations[0].reasons;
    
    reasons.forEach(reason => {
      // التحقق من الهيكل الأساسي
      expect(reason).toHaveProperty('type');
      expect(reason).toHaveProperty('message');
      expect(reason).toHaveProperty('strength');
      
      // التحقق من القيم المسموح بها
      expect(['skills', 'experience', 'education', 'location', 'salary', 'jobType', 'general', 'industry']).toContain(reason.type);
      expect(['high', 'medium', 'low']).toContain(reason.strength);
      
      // التحقق من أن الرسالة ليست فارغة
      expect(reason.message).toBeTruthy();
      expect(typeof reason.message).toBe('string');
      expect(reason.message.trim().length).toBeGreaterThan(0);
      
      // قد تحتوي الأسباب على تفاصيل إضافية
      if (reason.details) {
        expect(typeof reason.details).toBe('object');
      }
    });
  });

  /**
   * Property 3.4: Low match scores should still have reasons
   * درجات التطابق المنخفضة يجب أن يكون لها أسباب أيضاً
   */
  test('low match scores should still have reasons', async () => {
    const user = {
      computerSkills: [{ skill: 'Java', proficiency: 'beginner' }],
      experienceList: [],
      educationList: [],
      city: 'الرياض',
      country: 'السعودية'
    };

    const jobs = [{
      title: 'Senior JavaScript Developer',
      description: 'تطوير باستخدام JavaScript',
      requirements: 'خبرة 5 سنوات في JavaScript',
      location: 'القاهرة، مصر',
      salary: { min: 30000, max: 50000 },
      jobType: 'Full-time'
    }];

    const recommendations = await contentBasedFiltering.rankJobsByMatch(user, jobs);
    
    expect(recommendations.length).toBe(1);
    const recommendation = recommendations[0];
    
    // حتى مع درجة تطابق منخفضة، يجب أن يكون هناك أسباب
    expect(recommendation.reasons.length).toBeGreaterThan(0);
    
    // يجب أن يكون هناك سبب عام على الأقل
    const generalReasons = recommendation.reasons.filter(r => r.type === 'general');
    expect(generalReasons.length).toBeGreaterThan(0);
    
    console.log(`✅ Low match score (${recommendation.matchScore.percentage}%) still has ${recommendation.reasons.length} reasons`);
  });

  /**
   * Property 3.5: Reasons should reflect match score components
   * الأسباب يجب أن تعكس مكونات درجة التطابق
   */
  test('reasons should reflect match score components', async () => {
    const user = {
      computerSkills: [
        { skill: 'JavaScript', proficiency: 'expert' },
        { skill: 'React', proficiency: 'advanced' },
        { skill: 'Node.js', proficiency: 'intermediate' }
      ],
      experienceList: [{
        company: 'Tech Company',
        position: 'Senior Developer',
        from: new Date('2018-01-01'),
        to: new Date('2024-01-01')
      }],
      educationList: [{ degree: 'ماجستير', level: 'Computer Science', institution: 'University' }],
      city: 'القاهرة',
      country: 'مصر'
    };

    const jobs = [{
      title: 'Full Stack Developer',
      description: 'تطوير كامل باستخدام JavaScript و React و Node.js',
      requirements: 'خبرة 5 سنوات في JavaScript و React و Node.js، مؤهل ماجستير',
      location: 'القاهرة، مصر',
      salary: { min: 25000, max: 40000 },
      jobType: 'Full-time'
    }];

    const recommendations = await contentBasedFiltering.rankJobsByMatch(user, jobs);
    
    expect(recommendations.length).toBe(1);
    const recommendation = recommendations[0];
    const scores = recommendation.matchScore.scores;
    
    // لكل مكون درجة عالية، يجب أن يكون هناك سبب
    Object.entries(scores).forEach(([component, score]) => {
      if (score > 0.5) {
        const componentReasons = recommendation.reasons.filter(r => 
          r.type === component || 
          (component === 'skills' && r.type === 'skills') ||
          (component === 'experience' && r.type === 'experience') ||
          (component === 'education' && r.type === 'education') ||
          (component === 'location' && r.type === 'location')
        );
        
        expect(componentReasons.length).toBeGreaterThan(0);
        console.log(`✅ Component ${component} (score: ${score}) has ${componentReasons.length} reasons`);
      }
    });
  });

  /**
   * Property 3.6: Multiple jobs should all have explanations
   * الوظائف المتعددة يجب أن يكون لها جميعاً شروحات
   */
  test('multiple jobs should all have explanations', async () => {
    const user = {
      computerSkills: [{ skill: 'JavaScript', proficiency: 'intermediate' }],
      experienceList: [{
        company: 'Startup',
        position: 'Junior Developer',
        from: new Date('2022-01-01'),
        to: new Date('2024-01-01')
      }],
      educationList: [{ degree: 'بكالوريوس', level: 'Software Engineering', institution: 'College' }],
      city: 'الإسكندرية',
      country: 'مصر'
    };

    const jobs = [
      {
        title: 'JavaScript Developer',
        description: 'تطوير باستخدام JavaScript',
        requirements: 'خبرة في JavaScript',
        location: 'الإسكندرية، مصر',
        salary: { min: 8000, max: 15000 },
        jobType: 'Full-time'
      },
      {
        title: 'Frontend Intern',
        description: 'تدريب في تطوير الواجهات',
        requirements: 'معرفة أساسية في JavaScript',
        location: 'الإسكندرية، مصر',
        salary: { min: 3000, max: 5000 },
        jobType: 'Part-time'
      },
      {
        title: 'Python Developer',
        description: 'تطوير باستخدام Python',
        requirements: 'خبرة في Python',
        location: 'القاهرة، مصر',
        salary: { min: 12000, max: 20000 },
        jobType: 'Full-time'
      }
    ];

    const recommendations = await contentBasedFiltering.rankJobsByMatch(user, jobs);
    
    // جميع التوصيات يجب أن يكون لها أسباب
    recommendations.forEach((rec, index) => {
      expect(rec.reasons.length).toBeGreaterThan(0);
      console.log(`✅ Job ${index + 1} (${rec.job.title}, score: ${rec.matchScore.percentage}%) has ${rec.reasons.length} reasons`);
    });
    
    // يجب أن تكون التوصيات مرتبة حسب درجة التطابق
    for (let i = 0; i < recommendations.length - 1; i++) {
      expect(recommendations[i].matchScore.overall)
        .toBeGreaterThanOrEqual(recommendations[i + 1].matchScore.overall);
    }
  });
});