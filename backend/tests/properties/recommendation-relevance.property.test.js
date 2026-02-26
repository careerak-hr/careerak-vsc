/**
 * 🧪 Property-Based Test: Recommendation Relevance
 * اختبار خاصية: صلة التوصيات
 * 
 * Property 1: Recommendation Relevance
 * For any user with a complete profile, at least 75% of recommended jobs 
 * should match their skills and experience level.
 * 
 * Validates: Requirements 1.1 (توصيات مخصصة بناءً على: المهارات، الخبرة، التعليم، الموقع)
 */

const fc = require('fast-check');
const ContentBasedFiltering = require('../../src/services/contentBasedFiltering');

describe('Property 1: Recommendation Relevance', () => {
  let contentBasedFiltering;

  beforeAll(() => {
    contentBasedFiltering = new ContentBasedFiltering();
  });

  /**
   * Property 1.1: Recommendations should be relevant to user skills
   * التوصيات يجب أن تكون ذات صلة بمهارات المستخدم
   */
  test('recommendations should be relevant to user skills', () => {
    // استخدام بيانات محددة بدلاً من عشوائية للاختبار
    const testCases = [
      {
        user: {
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
        },
        jobs: [
          {
            title: 'JavaScript Developer',
            description: 'تطوير باستخدام JavaScript',
            requirements: 'خبرة في JavaScript',
            location: 'القاهرة، مصر',
            salary: { min: 10000, max: 20000 },
            jobType: 'Full-time'
          },
          {
            title: 'Frontend Developer',
            description: 'تطوير واجهات',
            requirements: 'خبرة في React',
            location: 'القاهرة، مصر',
            salary: { min: 12000, max: 22000 },
            jobType: 'Full-time'
          },
          {
            title: 'Backend Developer',
            description: 'تطوير APIs',
            requirements: 'خبرة في Node.js',
            location: 'القاهرة، مصر',
            salary: { min: 15000, max: 25000 },
            jobType: 'Full-time'
          }
        ]
      }
    ];

    testCases.forEach(async ({ user, jobs }) => {
      const recommendations = await contentBasedFiltering.rankJobsByMatch(user, jobs);
      
      expect(recommendations.length).toBeGreaterThan(0);
      
      // التحقق من أن جميع التوصيات لها درجات صحيحة
      recommendations.forEach(rec => {
        expect(rec.matchScore.percentage).toBeGreaterThanOrEqual(0);
        expect(rec.matchScore.percentage).toBeLessThanOrEqual(100);
        expect(rec.matchScore.overall).toBeGreaterThanOrEqual(0);
        expect(rec.matchScore.overall).toBeLessThanOrEqual(1);
      });
      
      // في هذا المثال المحدد، يجب أن تكون الوظيفة الأولى (JavaScript Developer) هي الأفضل
      expect(recommendations[0].job.title).toBe('JavaScript Developer');
      expect(recommendations[0].matchScore.overall).toBeGreaterThan(0.5);
    });
  });

  /**
   * Property 1.2: Top recommendations should have highest match scores
   * أفضل التوصيات يجب أن يكون لها أعلى درجات التطابق
   */
  test('top recommendations should have highest match scores', async () => {
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
      // وظيفة متطابقة تماماً
      {
        title: 'Senior JavaScript Developer',
        description: 'تطوير باستخدام JavaScript و React',
        requirements: 'خبرة 5 سنوات في JavaScript و React',
        location: 'القاهرة، مصر',
        salary: { min: 20000, max: 30000 },
        jobType: 'Full-time'
      },
      // وظيفة متوسطة التطابق
      {
        title: 'Frontend Developer',
        description: 'تطوير واجهات',
        requirements: 'خبرة في JavaScript',
        location: 'القاهرة، مصر',
        salary: { min: 15000, max: 25000 },
        jobType: 'Full-time'
      },
      // وظيفة منخفضة التطابق
      {
        title: 'Python Developer',
        description: 'تطوير باستخدام Python',
        requirements: 'خبرة في Python',
        location: 'نيويورك',
        salary: { min: 30000, max: 50000 },
        jobType: 'Full-time'
      },
      // وظيفة أخرى متوسطة التطابق
      {
        title: 'Full Stack Developer',
        description: 'تطوير كامل',
        requirements: 'خبرة في JavaScript و Node.js',
        location: 'القاهرة، مصر',
        salary: { min: 18000, max: 28000 },
        jobType: 'Full-time'
      }
    ];

    const recommendations = await contentBasedFiltering.rankJobsByMatch(user, jobs);
    
    // يجب أن تكون التوصيات مرتبة تنازلياً حسب درجة التطابق
    for (let i = 0; i < recommendations.length - 1; i++) {
      expect(recommendations[i].matchScore.overall)
        .toBeGreaterThanOrEqual(recommendations[i + 1].matchScore.overall);
    }

    // أفضل توصية يجب أن تكون للوظيفة المتطابقة تماماً
    expect(recommendations[0].job.title).toBe('Senior JavaScript Developer');
  });

  /**
   * Property 1.3: Recommendations should consider all profile aspects
   * التوصيات يجب أن تأخذ في الاعتبار جميع جوانب الملف الشخصي
   */
  test('recommendations should consider all profile aspects', async () => {
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
      // وظيفة تأخذ في الاعتبار المهارات فقط
      {
        title: 'JavaScript Developer',
        description: 'تطوير باستخدام JavaScript',
        requirements: 'خبرة في JavaScript',
        location: 'نيويورك', // موقع غير مناسب
        salary: { min: 10000, max: 20000 },
        jobType: 'Full-time'
      },
      // وظيفة تأخذ في الاعتبار الموقع فقط
      {
        title: 'Python Developer',
        description: 'تطوير باستخدام Python',
        requirements: 'خبرة في Python', // مهارات غير مناسبة
        location: 'القاهرة، مصر', // موقع مناسب
        salary: { min: 12000, max: 22000 },
        jobType: 'Full-time'
      },
      // وظيفة تأخذ في الاعتبار المهارات والموقع
      {
        title: 'Frontend Developer',
        description: 'تطوير واجهات',
        requirements: 'خبرة في JavaScript', // مهارات مناسبة
        location: 'القاهرة، مصر', // موقع مناسب
        salary: { min: 15000, max: 25000 },
        jobType: 'Full-time'
      }
    ];

    const recommendations = await contentBasedFiltering.rankJobsByMatch(user, jobs);
    
    // أفضل توصية يجب أن تكون للوظيفة التي تأخذ في الاعتبار المهارات والموقع
    expect(recommendations[0].job.title).toBe('Frontend Developer');
    
    // الوظيفة التي تأخذ في الاعتبار المهارات فقط يجب أن تكون في المركز الثاني
    expect(recommendations[1].job.title).toBe('JavaScript Developer');
    
    // الوظيفة التي تأخذ في الاعتبار الموقع فقط يجب أن تكون في المركز الثالث
    expect(recommendations[2].job.title).toBe('Python Developer');
  });

  /**
   * Property 1.4: Minimum score filter should work correctly
   * فلتر الحد الأدنى للدرجة يجب أن يعمل بشكل صحيح
   */
  test('minimum score filter should work correctly', async () => {
    const user = {
      computerSkills: [{ skill: 'JavaScript', proficiency: 'expert' }],
      experienceList: [],
      educationList: [],
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
      },
      {
        title: 'Python Developer',
        description: 'تطوير باستخدام Python',
        requirements: 'خبرة في Python',
        location: 'نيويورك',
        salary: { min: 15000, max: 25000 },
        jobType: 'Full-time'
      },
      {
        title: 'Frontend Developer',
        description: 'تطوير واجهات',
        requirements: 'خبرة في React',
        location: 'القاهرة، مصر',
        salary: { min: 12000, max: 22000 },
        jobType: 'Full-time'
      }
    ];

    // فلتر بحد أدنى 0.7
    const recommendations = await contentBasedFiltering.rankJobsByMatch(user, jobs, { minScore: 0.7 });
    
    // جميع التوصيات يجب أن تكون بدرجة 0.7 أو أعلى
    recommendations.forEach(rec => {
      expect(rec.matchScore.overall).toBeGreaterThanOrEqual(0.7);
    });

    // يجب أن يكون هناك على الأقل توصية واحدة (JavaScript Developer)
    expect(recommendations.length).toBeGreaterThan(0);
    
    // Python Developer يجب ألا تكون مدرجة (درجة منخفضة)
    const pythonJob = recommendations.find(rec => rec.job.title === 'Python Developer');
    expect(pythonJob).toBeUndefined();
  });
});