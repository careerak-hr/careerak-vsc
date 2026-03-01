/**
 * Property-Based Tests for Profile Completeness Calculation
 * اختبارات قائمة على الخصائص لحساب اكتمال الملف الشخصي
 * 
 * Property 5: Profile Completeness Calculation
 * For any user profile, the completeness score should equal (filled fields / total fields) × 100
 * Validates: Requirements 5.2
 */

const fc = require('fast-check');
const { calculateCompletenessScore } = require('../src/services/profileAnalysisService');

describe('Property 5: Profile Completeness Calculation', () => {
  
  /**
   * Property 5.1: Score Range
   * For any user profile, completeness score must be between 0 and 100
   */
  test('Property 5.1: Completeness score is always between 0 and 100', () => {
    fc.assert(
      fc.property(
        fc.record({
          // Basic info (8 fields)
          firstName: fc.option(fc.string(), { nil: '' }),
          lastName: fc.option(fc.string(), { nil: '' }),
          email: fc.option(fc.emailAddress(), { nil: '' }),
          phone: fc.option(fc.string(), { nil: '' }),
          country: fc.option(fc.string(), { nil: '' }),
          city: fc.option(fc.string(), { nil: '' }),
          gender: fc.option(fc.constantFrom('male', 'female', 'other'), { nil: '' }),
          birthDate: fc.option(fc.date(), { nil: null }),
          
          // Education (1 field - array)
          educationList: fc.array(
            fc.record({
              degree: fc.string(),
              institution: fc.string()
            }),
            { maxLength: 5 }
          ),
          
          // Experience (1 field - array)
          experienceList: fc.array(
            fc.record({
              company: fc.string(),
              position: fc.string()
            }),
            { maxLength: 5 }
          ),
          
          // Skills (4 fields - arrays)
          computerSkills: fc.array(
            fc.record({ skill: fc.string() }),
            { maxLength: 10 }
          ),
          softwareSkills: fc.array(
            fc.record({ software: fc.string() }),
            { maxLength: 10 }
          ),
          languages: fc.array(
            fc.record({ language: fc.string() }),
            { maxLength: 5 }
          ),
          otherSkills: fc.array(fc.string(), { maxLength: 10 }),
          
          // Training (1 field - array)
          trainingList: fc.array(
            fc.record({
              courseName: fc.string(),
              provider: fc.string()
            }),
            { maxLength: 10 }
          ),
          
          // Additional (5 fields)
          specialization: fc.option(fc.string(), { nil: '' }),
          interests: fc.array(fc.string(), { maxLength: 10 }),
          bio: fc.option(fc.string(), { nil: '' }),
          cvFile: fc.option(fc.string(), { nil: null }),
          profileImage: fc.option(fc.string(), { nil: null })
        }),
        (user) => {
          const result = calculateCompletenessScore(user);
          
          // Score must be between 0 and 100
          expect(result.score).toBeGreaterThanOrEqual(0);
          expect(result.score).toBeLessThanOrEqual(100);
          
          // Score must be an integer
          expect(Number.isInteger(result.score)).toBe(true);
        }
      ),
      { numRuns: 100 } // Run 100 random test cases
    );
  });

  /**
   * Property 5.2: Empty Profile
   * For any completely empty profile, score should be close to 0
   */
  test('Property 5.2: Empty profile has score close to 0', () => {
    const emptyUser = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
      city: '',
      gender: '',
      birthDate: null,
      educationList: [],
      experienceList: [],
      computerSkills: [],
      softwareSkills: [],
      languages: [],
      otherSkills: [],
      trainingList: [],
      specialization: '',
      interests: [],
      bio: '',
      cvFile: null,
      profileImage: null
    };

    const result = calculateCompletenessScore(emptyUser);
    
    // Empty profile should have very low score (< 10%)
    expect(result.score).toBeLessThan(10);
    expect(result.level).toBe('very_poor');
  });

  /**
   * Property 5.3: Complete Profile
   * For any completely filled profile, score should be close to 100
   */
  test('Property 5.3: Complete profile has score close to 100', () => {
    const completeUser = {
      firstName: 'أحمد',
      lastName: 'محمد',
      email: 'ahmad@example.com',
      phone: '+201234567890',
      country: 'مصر',
      city: 'القاهرة',
      gender: 'male',
      birthDate: new Date('1990-01-01'),
      educationList: [
        { degree: 'بكالوريوس', institution: 'جامعة القاهرة', field: 'علوم الحاسوب' }
      ],
      experienceList: [
        { company: 'شركة ABC', position: 'مطور ويب', duration: '2 سنوات' }
      ],
      computerSkills: [
        { skill: 'JavaScript', proficiency: 'advanced' },
        { skill: 'Python', proficiency: 'intermediate' }
      ],
      softwareSkills: [
        { software: 'VS Code', proficiency: 'expert' },
        { software: 'Git', proficiency: 'advanced' }
      ],
      languages: [
        { language: 'العربية', proficiency: 'native' },
        { language: 'English', proficiency: 'advanced' }
      ],
      otherSkills: ['التواصل', 'العمل الجماعي'],
      trainingList: [
        { courseName: 'React Advanced', provider: 'Udemy', year: 2023 }
      ],
      specialization: 'تطوير الويب',
      interests: ['البرمجة', 'التصميم', 'الذكاء الاصطناعي'],
      bio: 'مطور ويب متخصص في React و Node.js مع خبرة 5 سنوات في تطوير تطبيقات الويب الحديثة',
      cvFile: 'cv.pdf',
      profileImage: 'profile.jpg'
    };

    const result = calculateCompletenessScore(completeUser);
    
    // Complete profile should have very high score (> 90%)
    expect(result.score).toBeGreaterThan(90);
    expect(result.level).toBe('excellent');
  });

  /**
   * Property 5.4: Monotonicity
   * Adding more fields should never decrease the score
   */
  test('Property 5.4: Adding fields never decreases score (monotonicity)', () => {
    fc.assert(
      fc.property(
        fc.record({
          firstName: fc.option(fc.string(), { nil: '' }),
          lastName: fc.option(fc.string(), { nil: '' }),
          email: fc.option(fc.emailAddress(), { nil: '' }),
          educationList: fc.array(
            fc.record({ degree: fc.string() }),
            { maxLength: 3 }
          ),
          experienceList: fc.array(
            fc.record({ company: fc.string() }),
            { maxLength: 3 }
          )
        }),
        (baseUser) => {
          const baseScore = calculateCompletenessScore(baseUser).score;
          
          // Add more fields
          const enhancedUser = {
            ...baseUser,
            phone: '+201234567890',
            country: 'مصر',
            computerSkills: [{ skill: 'JavaScript' }]
          };
          
          const enhancedScore = calculateCompletenessScore(enhancedUser).score;
          
          // Enhanced profile should have equal or higher score
          expect(enhancedScore).toBeGreaterThanOrEqual(baseScore);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 5.5: Category Weights
   * The sum of all category weights should equal 100%
   */
  test('Property 5.5: Category weights sum to 100%', () => {
    const user = {
      firstName: 'أحمد',
      lastName: 'محمد',
      email: 'ahmad@example.com',
      phone: '+201234567890',
      country: 'مصر',
      city: 'القاهرة',
      gender: 'male',
      birthDate: new Date('1990-01-01'),
      educationList: [{ degree: 'بكالوريوس' }],
      experienceList: [{ company: 'ABC' }],
      computerSkills: [{ skill: 'JS' }],
      softwareSkills: [{ software: 'VS Code' }],
      languages: [{ language: 'العربية' }],
      otherSkills: ['التواصل'],
      trainingList: [{ courseName: 'React' }],
      specialization: 'تطوير الويب',
      interests: ['البرمجة'],
      bio: 'مطور ويب',
      cvFile: 'cv.pdf',
      profileImage: 'profile.jpg'
    };

    const result = calculateCompletenessScore(user);
    
    // All categories should be present
    expect(result.details).toHaveProperty('basic');
    expect(result.details).toHaveProperty('education');
    expect(result.details).toHaveProperty('experience');
    expect(result.details).toHaveProperty('skills');
    expect(result.details).toHaveProperty('training');
    expect(result.details).toHaveProperty('additional');
    
    // Sum of all category scores should equal total score (approximately)
    const categorySum = 
      result.details.basic.score +
      result.details.education.score +
      result.details.experience.score +
      result.details.skills.score +
      result.details.training.score +
      result.details.additional.score;
    
    // Allow small rounding difference (±2)
    expect(Math.abs(categorySum - result.score)).toBeLessThanOrEqual(2);
  });

  /**
   * Property 5.6: Determinism
   * Same input should always produce same output
   */
  test('Property 5.6: Calculation is deterministic', () => {
    fc.assert(
      fc.property(
        fc.record({
          firstName: fc.string(),
          lastName: fc.string(),
          email: fc.emailAddress(),
          educationList: fc.array(
            fc.record({ degree: fc.string() }),
            { maxLength: 3 }
          )
        }),
        (user) => {
          const result1 = calculateCompletenessScore(user);
          const result2 = calculateCompletenessScore(user);
          
          // Same input should produce same output
          expect(result1.score).toBe(result2.score);
          expect(result1.level).toBe(result2.level);
          expect(result1.details.basic.score).toBe(result2.details.basic.score);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 5.7: Level Consistency
   * Score and level should be consistent
   */
  test('Property 5.7: Score and level are consistent', () => {
    fc.assert(
      fc.property(
        fc.record({
          firstName: fc.option(fc.string(), { nil: '' }),
          lastName: fc.option(fc.string(), { nil: '' }),
          email: fc.option(fc.emailAddress(), { nil: '' }),
          educationList: fc.array(
            fc.record({ degree: fc.string() }),
            { maxLength: 5 }
          ),
          experienceList: fc.array(
            fc.record({ company: fc.string() }),
            { maxLength: 5 }
          ),
          computerSkills: fc.array(
            fc.record({ skill: fc.string() }),
            { maxLength: 10 }
          )
        }),
        (user) => {
          const result = calculateCompletenessScore(user);
          
          // Verify level matches score
          if (result.score >= 90) {
            expect(result.level).toBe('excellent');
          } else if (result.score >= 75) {
            expect(result.level).toBe('good');
          } else if (result.score >= 50) {
            expect(result.level).toBe('fair');
          } else if (result.score >= 25) {
            expect(result.level).toBe('poor');
          } else {
            expect(result.level).toBe('very_poor');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5.8: Array Fields
   * Empty arrays should count as unfilled, non-empty arrays as filled
   */
  test('Property 5.8: Array fields are counted correctly', () => {
    const userWithEmptyArrays = {
      firstName: 'أحمد',
      lastName: 'محمد',
      educationList: [],
      experienceList: [],
      computerSkills: [],
      softwareSkills: [],
      languages: [],
      otherSkills: [],
      trainingList: [],
      interests: []
    };

    const userWithFilledArrays = {
      firstName: 'أحمد',
      lastName: 'محمد',
      educationList: [{ degree: 'بكالوريوس' }],
      experienceList: [{ company: 'ABC' }],
      computerSkills: [{ skill: 'JS' }],
      softwareSkills: [{ software: 'VS Code' }],
      languages: [{ language: 'العربية' }],
      otherSkills: ['التواصل'],
      trainingList: [{ courseName: 'React' }],
      interests: ['البرمجة']
    };

    const emptyScore = calculateCompletenessScore(userWithEmptyArrays).score;
    const filledScore = calculateCompletenessScore(userWithFilledArrays).score;
    
    // Filled arrays should result in higher score
    expect(filledScore).toBeGreaterThan(emptyScore);
  });

  /**
   * Property 5.9: Partial Completion
   * Filling 50% of fields should result in approximately 50% score
   */
  test('Property 5.9: Partial completion reflects in score', () => {
    // Fill approximately 50% of basic fields
    const halfFilledUser = {
      firstName: 'أحمد',
      lastName: 'محمد',
      email: 'ahmad@example.com',
      phone: '+201234567890',
      country: '', // Empty
      city: '', // Empty
      gender: '', // Empty
      birthDate: null, // Empty
      educationList: [{ degree: 'بكالوريوس' }], // Filled
      experienceList: [], // Empty
      computerSkills: [{ skill: 'JS' }], // Filled
      softwareSkills: [], // Empty
      languages: [], // Empty
      otherSkills: [], // Empty
      trainingList: [], // Empty
      specialization: 'تطوير الويب', // Filled
      interests: [], // Empty
      bio: '', // Empty
      cvFile: null, // Empty
      profileImage: null // Empty
    };

    const result = calculateCompletenessScore(halfFilledUser);
    
    // Score should be in the middle range (30-70%)
    expect(result.score).toBeGreaterThan(30);
    expect(result.score).toBeLessThan(70);
  });

  /**
   * Property 5.10: Category Independence
   * Filling one category should not affect other category percentages
   */
  test('Property 5.10: Categories are calculated independently', () => {
    const user = {
      // Fill basic completely
      firstName: 'أحمد',
      lastName: 'محمد',
      email: 'ahmad@example.com',
      phone: '+201234567890',
      country: 'مصر',
      city: 'القاهرة',
      gender: 'male',
      birthDate: new Date('1990-01-01'),
      // Leave education empty
      educationList: [],
      // Fill experience
      experienceList: [{ company: 'ABC' }],
      // Leave skills empty
      computerSkills: [],
      softwareSkills: [],
      languages: [],
      otherSkills: [],
      // Leave training empty
      trainingList: [],
      // Leave additional empty
      specialization: '',
      interests: [],
      bio: '',
      cvFile: null,
      profileImage: null
    };

    const result = calculateCompletenessScore(user);
    
    // Basic should be high (most fields filled - 7 out of 8 = 87.5%)
    expect(result.details.basic.percentage).toBeGreaterThan(75);
    expect(result.details.basic.percentage).toBeLessThanOrEqual(100);
    
    // Education should be 0% (empty array)
    expect(result.details.education.percentage).toBe(0);
    
    // Experience should be 100% (has items)
    expect(result.details.experience.percentage).toBe(100);
    
    // Skills should be 0% (all empty)
    expect(result.details.skills.percentage).toBe(0);
    
    // Training should be 0% (empty)
    expect(result.details.training.percentage).toBe(0);
    
    // Additional should be 0% (all empty)
    expect(result.details.additional.percentage).toBe(0);
  });
});

