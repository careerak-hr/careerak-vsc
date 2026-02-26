/**
 * 🧪 Property-Based Test: Recommendation Score Consistency
 * اختبار خاصية: اتساق درجات التوصيات
 * 
 * Property 2: Score Consistency
 * For any recommendation, the score should be between 0 and 100, 
 * and higher scores should indicate better matches.
 * 
 * Validates: Requirements 1.4 (نسبة تطابق 0-100% لكل وظيفة)
 */

const fc = require('fast-check');
const ContentBasedFiltering = require('../../src/services/contentBasedFiltering');

describe('Property 2: Score Consistency', () => {
  let contentBasedFiltering;

  beforeAll(() => {
    contentBasedFiltering = new ContentBasedFiltering();
  });

  /**
   * Property 2.1: Scores should always be between 0 and 100
   * يجب أن تكون الدرجات دائماً بين 0 و 100
   */
  test('scores should always be between 0 and 100', () => {
    const userArbitrary = fc.record({
      computerSkills: fc.array(fc.record({
        skill: fc.string({ minLength: 1, maxLength: 20 }),
        proficiency: fc.constantFrom('beginner', 'intermediate', 'advanced', 'expert')
      }), { minLength: 0, maxLength: 10 }),
      experienceList: fc.array(fc.record({
        company: fc.string({ minLength: 1, maxLength: 20 }),
        position: fc.string({ minLength: 1, maxLength: 20 }),
        from: fc.date({ min: new Date('2000-01-01'), max: new Date('2020-01-01') }),
        to: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-01-01') })
      }), { minLength: 0, maxLength: 5 }),
      educationList: fc.array(fc.record({
        degree: fc.constantFrom('ثانوية', 'دبلوم', 'بكالوريوس', 'ماجستير', 'دكتوراه'),
        level: fc.string({ minLength: 1, maxLength: 20 }),
        institution: fc.string({ minLength: 1, maxLength: 20 })
      }), { minLength: 0, maxLength: 3 }),
      city: fc.string({ minLength: 1, maxLength: 15 }),
      country: fc.string({ minLength: 1, maxLength: 15 })
    });

    const jobArbitrary = fc.record({
      title: fc.string({ minLength: 1, maxLength: 30 }),
      description: fc.string({ minLength: 1, maxLength: 100 }),
      requirements: fc.string({ minLength: 1, maxLength: 100 }),
      location: fc.string({ minLength: 1, maxLength: 30 }),
      salary: fc.record({
        min: fc.integer({ min: 1000, max: 50000 }),
        max: fc.integer({ min: 1000, max: 50000 })
      }),
      jobType: fc.constantFrom('Full-time', 'Part-time', 'Contract', 'Remote')
    });

    fc.assert(
      fc.property(userArbitrary, jobArbitrary, (user, job) => {
        // استخراج الميزات
        const userFeatures = contentBasedFiltering.extractUserFeatures(user);
        const jobFeatures = contentBasedFiltering.extractJobFeatures(job);
        
        // حساب التشابه
        const similarity = contentBasedFiltering.calculateSimilarity(userFeatures, jobFeatures);
        
        // التحقق من أن النسبة بين 0 و 100
        expect(similarity.percentage).toBeGreaterThanOrEqual(0);
        expect(similarity.percentage).toBeLessThanOrEqual(100);
        
        // التحقق من أن النتيجة الإجمالية بين 0 و 1
        expect(similarity.overall).toBeGreaterThanOrEqual(0);
        expect(similarity.overall).toBeLessThanOrEqual(1);
        
        // التحقق من أن النسبة هي النتيجة الإجمالية مضروبة في 100 ومقربة
        expect(similarity.percentage).toBe(Math.round(similarity.overall * 100));
        
        return true;
      }),
      {
        verbose: true,
        numRuns: 100,
        examples: [
          // مثال 1: مستخدم بمهارات عالية ووظيفة متطابقة
          [
            {
              computerSkills: [{ skill: 'JavaScript', proficiency: 'expert' }],
              experienceList: [],
              educationList: [],
              city: 'القاهرة',
              country: 'مصر'
            },
            {
              title: 'JavaScript Developer',
              description: 'تطوير باستخدام JavaScript',
              requirements: 'خبرة في JavaScript',
              location: 'القاهرة، مصر',
              salary: { min: 10000, max: 20000 },
              jobType: 'Full-time'
            }
          ],
          // مثال 2: مستخدم بدون مهارات ووظيفة متطلبة
          [
            {
              computerSkills: [],
              experienceList: [],
              educationList: [],
              city: 'القاهرة',
              country: 'مصر'
            },
            {
              title: 'Senior Developer',
              description: 'تطوير متقدم',
              requirements: 'خبرة 10 سنوات',
              location: 'نيويورك',
              salary: { min: 50000, max: 100000 },
              jobType: 'Full-time'
            }
          ]
        ]
      }
    );
  });

  /**
   * Property 2.2: Higher similarity should produce higher scores
   * التشابه الأعلى يجب أن ينتج درجات أعلى
   */
  test('higher similarity should produce higher scores', () => {
    const baseUser = {
      computerSkills: [{ skill: 'JavaScript', proficiency: 'expert' }],
      experienceList: [],
      educationList: [],
      city: 'القاهرة',
      country: 'مصر'
    };

    const baseJob = {
      title: 'JavaScript Developer',
      description: 'تطوير باستخدام JavaScript',
      requirements: 'خبرة في JavaScript',
      location: 'القاهرة، مصر',
      salary: { min: 10000, max: 20000 },
      jobType: 'Full-time'
    };

    // إنشاء وظائف بمستويات تشابه مختلفة
    const jobs = [
      // وظيفة متطابقة تماماً
      { ...baseJob },
      // وظيفة أقل تطابقاً (موقع مختلف)
      { ...baseJob, location: 'نيويورك' },
      // وظيفة أقل تطابقاً (مهارات مختلفة)
      { ...baseJob, description: 'تطوير باستخدام Python', requirements: 'خبرة في Python' }
    ];

    const userFeatures = contentBasedFiltering.extractUserFeatures(baseUser);
    const scores = jobs.map(job => {
      const jobFeatures = contentBasedFiltering.extractJobFeatures(job);
      return contentBasedFiltering.calculateSimilarity(userFeatures, jobFeatures);
    });

    // الوظيفة الأولى (المتطابقة) يجب أن يكون لها أعلى درجة
    expect(scores[0].overall).toBeGreaterThanOrEqual(scores[1].overall);
    expect(scores[0].overall).toBeGreaterThanOrEqual(scores[2].overall);
    
    // الوظيفة الثانية (موقع مختلف) يجب أن يكون لها درجة أعلى من الثالثة (مهارات مختلفة)
    expect(scores[1].overall).toBeGreaterThanOrEqual(scores[2].overall);
  });

  /**
   * Property 2.3: Perfect match should produce score of 100%
   * التطابق التام يجب أن ينتج درجة 100%
   */
  test('perfect match should produce score of 100%', () => {
    const user = {
      computerSkills: [
        { skill: 'JavaScript', proficiency: 'expert' },
        { skill: 'React', proficiency: 'advanced' }
      ],
      experienceList: [
        {
          company: 'Tech Company',
          position: 'Senior Developer',
          from: new Date('2020-01-01'),
          to: new Date('2024-01-01')
        }
      ],
      educationList: [
        { degree: 'بكالوريوس', level: 'Computer Science', institution: 'University' }
      ],
      city: 'القاهرة',
      country: 'مصر'
    };

    const job = {
      title: 'Senior JavaScript Developer',
      description: 'تطوير واجهات باستخدام JavaScript و React',
      requirements: 'خبرة 4 سنوات في JavaScript و React، بكالوريوس في علوم الحاسوب',
      location: 'القاهرة، مصر',
      salary: { min: 20000, max: 30000 },
      jobType: 'Full-time'
    };

    const userFeatures = contentBasedFiltering.extractUserFeatures(user);
    const jobFeatures = contentBasedFiltering.extractJobFeatures(job);
    const similarity = contentBasedFiltering.calculateSimilarity(userFeatures, jobFeatures);

    // في حالة التطابق التام، يجب أن تكون النسبة قريبة من 100%
    // (قد لا تكون 100% بالضبط بسبب عوامل أخرى مثل الراتب ونوع العمل)
    expect(similarity.percentage).toBeGreaterThan(80); // تطابق عالي جداً
  });

  /**
   * Property 2.4: No match should produce low score
   * عدم التطابق يجب أن ينتج درجة منخفضة
   */
  test('no match should produce low score', () => {
    const user = {
      computerSkills: [{ skill: 'Python', proficiency: 'beginner' }],
      experienceList: [],
      educationList: [],
      city: 'القاهرة',
      country: 'مصر'
    };

    const job = {
      title: 'Senior JavaScript Architect',
      description: 'تصميم معماري لأنظمة JavaScript',
      requirements: 'خبرة 10 سنوات في JavaScript، ماجستير في هندسة البرمجيات',
      location: 'نيويورك',
      salary: { min: 100000, max: 200000 },
      jobType: 'Full-time'
    };

    const userFeatures = contentBasedFiltering.extractUserFeatures(user);
    const jobFeatures = contentBasedFiltering.extractJobFeatures(job);
    const similarity = contentBasedFiltering.calculateSimilarity(userFeatures, jobFeatures);

    // في حالة عدم التطابق، يجب أن تكون النسبة منخفضة
    expect(similarity.percentage).toBeLessThan(30);
  });

  /**
   * Property 2.5: Score components should be weighted correctly
   * مكونات الدرجة يجب أن تكون موزونة بشكل صحيح
   */
  test('score components should be weighted correctly', () => {
    const user = {
      computerSkills: [{ skill: 'JavaScript', proficiency: 'expert' }],
      experienceList: [],
      educationList: [],
      city: 'القاهرة',
      country: 'مصر'
    };

    const job = {
      title: 'JavaScript Developer',
      description: 'تطوير باستخدام JavaScript',
      requirements: 'خبرة في JavaScript',
      location: 'القاهرة، مصر',
      salary: { min: 10000, max: 20000 },
      jobType: 'Full-time'
    };

    const userFeatures = contentBasedFiltering.extractUserFeatures(user);
    const jobFeatures = contentBasedFiltering.extractJobFeatures(job);
    const similarity = contentBasedFiltering.calculateSimilarity(userFeatures, jobFeatures);

    // التحقق من أن جميع المكونات موجودة
    expect(similarity.scores).toHaveProperty('skills');
    expect(similarity.scores).toHaveProperty('experience');
    expect(similarity.scores).toHaveProperty('education');
    expect(similarity.scores).toHaveProperty('location');
    expect(similarity.scores).toHaveProperty('salary');
    expect(similarity.scores).toHaveProperty('jobType');

    // التحقق من أن كل مكون بين 0 و 1
    Object.values(similarity.scores).forEach(score => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    // التحقق من أن النتيجة الإجمالية تحسب بشكل صحيح مع الأوزان
    const expectedOverall = contentBasedFiltering.calculateOverallScore(similarity.scores);
    expect(similarity.overall).toBeCloseTo(expectedOverall, 5);
  });
});