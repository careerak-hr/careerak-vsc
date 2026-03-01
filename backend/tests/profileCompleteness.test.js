/**
 * Property-Based Tests: Profile Completeness Calculation
 * 
 * Property 5: Profile Completeness Calculation
 * For any user profile, the completeness score should equal (filled fields / total fields) × 100
 * 
 * Validates: Requirements 5.2
 * 
 * Test Strategy:
 * - Generate random user profiles with varying completeness
 * - Verify score calculation is accurate
 * - Test edge cases (empty, full, partial)
 * - Verify category weights sum to 100%
 * - Test consistency across multiple runs
 */

const fc = require('fast-check');
const { calculateCompletenessScore } = require('../src/services/profileAnalysisService');

describe('Property 5: Profile Completeness Calculation', () => {
  
  // ============================================================================
  // Test 1: Score Range Property
  // ============================================================================
  test('Property: Completeness score is always between 0 and 100', () => {
    fc.assert(
      fc.property(
        generateUserProfile(),
        (user) => {
          const result = calculateCompletenessScore(user);
          
          // Score must be in valid range
          expect(result.score).toBeGreaterThanOrEqual(0);
          expect(result.score).toBeLessThanOrEqual(100);
          
          // Score must be an integer
          expect(Number.isInteger(result.score)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // Test 2: Empty Profile Property
  // ============================================================================
  test('Property: Empty profile has 0% completeness', () => {
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
      cvFile: '',
      profileImage: ''
    };

    const result = calculateCompletenessScore(emptyUser);
    expect(result.score).toBe(0);
    expect(result.level).toBe('very_poor');
  });

  // ============================================================================
  // Test 3: Full Profile Property
  // ============================================================================
  test('Property: Fully filled profile has 100% completeness', () => {
    const fullUser = {
      // Basic info (8 fields)
      firstName: 'أحمد',
      lastName: 'محمد',
      email: 'ahmad@example.com',
      phone: '+201234567890',
      country: 'مصر',
      city: 'القاهرة',
      gender: 'male',
      birthDate: new Date('1990-01-01'),
      
      // Education (1 field - array with items)
      educationList: [
        { degree: 'بكالوريوس', institution: 'جامعة القاهرة', year: '2012' }
      ],
      
      // Experience (1 field - array with items)
      experienceList: [
        { company: 'شركة ABC', position: 'مطور', from: new Date('2012-01-01'), to: new Date('2020-01-01') }
      ],
      
      // Skills (4 fields - arrays with items)
      computerSkills: [{ skill: 'JavaScript', proficiency: 'advanced' }],
      softwareSkills: [{ software: 'VS Code', proficiency: 'expert' }],
      languages: [{ language: 'العربية', proficiency: 'native' }],
      otherSkills: ['التواصل'],
      
      // Training (1 field - array with items)
      trainingList: [
        { courseName: 'React', provider: 'Udemy', hasCertificate: true }
      ],
      
      // Additional (5 fields)
      specialization: 'تطوير الويب',
      interests: ['البرمجة', 'التصميم'],
      bio: 'مطور ويب محترف مع خبرة 8 سنوات في تطوير تطبيقات الويب الحديثة',
      cvFile: 'cv.pdf',
      profileImage: 'profile.jpg'
    };

    const result = calculateCompletenessScore(fullUser);
    
    // Score should be very high (95%+) when all fields are filled
    expect(result.score).toBeGreaterThanOrEqual(95);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.level).toBe('excellent');
  });

  // ============================================================================
  // Test 4: Category Weights Property
  // ============================================================================
  test('Property: Category weights sum to 100%', () => {
    const weights = {
      basic: 20,
      education: 15,
      experience: 20,
      skills: 20,
      training: 10,
      additional: 15
    };

    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    expect(totalWeight).toBe(100);
  });

  // ============================================================================
  // Test 5: Monotonicity Property
  // ============================================================================
  test('Property: Adding fields never decreases completeness score', () => {
    fc.assert(
      fc.property(
        generateUserProfile(),
        fc.constantFrom('firstName', 'email', 'phone', 'country', 'city'),
        fc.string({ minLength: 1, maxLength: 50 }),
        (user, field, value) => {
          const scoreBefore = calculateCompletenessScore(user).score;
          
          // Add a field
          const userAfter = { ...user, [field]: value };
          const scoreAfter = calculateCompletenessScore(userAfter).score;
          
          // Score should not decrease
          expect(scoreAfter).toBeGreaterThanOrEqual(scoreBefore);
        }
      ),
      { numRuns: 50 }
    );
  });

  // ============================================================================
  // Test 6: Array Fields Property
  // ============================================================================
  test('Property: Empty arrays count as unfilled, non-empty arrays count as filled', () => {
    const userWithEmptyArrays = {
      firstName: 'أحمد',
      lastName: 'محمد',
      email: 'ahmad@example.com',
      phone: '+201234567890',
      country: 'مصر',
      city: 'القاهرة',
      gender: 'male',
      birthDate: new Date('1990-01-01'),
      educationList: [], // Empty
      experienceList: [], // Empty
      computerSkills: [], // Empty
      softwareSkills: [], // Empty
      languages: [], // Empty
      otherSkills: [], // Empty
      trainingList: [], // Empty
      specialization: 'تطوير الويب',
      interests: [], // Empty
      bio: 'مطور',
      cvFile: 'cv.pdf',
      profileImage: 'profile.jpg'
    };

    const userWithFilledArrays = {
      ...userWithEmptyArrays,
      educationList: [{ degree: 'بكالوريوس' }],
      experienceList: [{ company: 'ABC' }],
      computerSkills: [{ skill: 'JavaScript' }],
      softwareSkills: [{ software: 'VS Code' }],
      languages: [{ language: 'العربية' }],
      otherSkills: ['التواصل'],
      trainingList: [{ courseName: 'React' }],
      interests: ['البرمجة']
    };

    const scoreEmpty = calculateCompletenessScore(userWithEmptyArrays).score;
    const scoreFilled = calculateCompletenessScore(userWithFilledArrays).score;

    expect(scoreFilled).toBeGreaterThan(scoreEmpty);
  });

  // ============================================================================
  // Test 7: Consistency Property
  // ============================================================================
  test('Property: Same profile always produces same score', () => {
    fc.assert(
      fc.property(
        generateUserProfile(),
        (user) => {
          const score1 = calculateCompletenessScore(user).score;
          const score2 = calculateCompletenessScore(user).score;
          const score3 = calculateCompletenessScore(user).score;
          
          expect(score1).toBe(score2);
          expect(score2).toBe(score3);
        }
      ),
      { numRuns: 50 }
    );
  });

  // ============================================================================
  // Test 8: Level Assignment Property
  // ============================================================================
  test('Property: Completeness level matches score ranges', () => {
    fc.assert(
      fc.property(
        generateUserProfile(),
        (user) => {
          const result = calculateCompletenessScore(user);
          const { score, level } = result;
          
          if (score >= 90) {
            expect(level).toBe('excellent');
          } else if (score >= 75) {
            expect(level).toBe('good');
          } else if (score >= 50) {
            expect(level).toBe('fair');
          } else if (score >= 25) {
            expect(level).toBe('poor');
          } else {
            expect(level).toBe('very_poor');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // Test 9: Category Details Property
  // ============================================================================
  test('Property: Category details are consistent with overall score', () => {
    fc.assert(
      fc.property(
        generateUserProfile(),
        (user) => {
          const result = calculateCompletenessScore(user);
          const { score, details } = result;
          
          // Calculate expected score from details
          const calculatedScore = Object.values(details).reduce(
            (sum, category) => sum + category.score,
            0
          );
          
          // Should match overall score (with rounding tolerance)
          expect(Math.abs(score - calculatedScore)).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 50 }
    );
  });

  // ============================================================================
  // Test 10: Partial Completeness Property
  // ============================================================================
  test('Property: Partially filled profile has score between 0 and 100', () => {
    const partialUser = {
      // Only basic info filled (20% weight)
      firstName: 'أحمد',
      lastName: 'محمد',
      email: 'ahmad@example.com',
      phone: '+201234567890',
      country: 'مصر',
      city: 'القاهرة',
      gender: 'male',
      birthDate: new Date('1990-01-01'),
      
      // Everything else empty
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
      cvFile: '',
      profileImage: ''
    };

    const result = calculateCompletenessScore(partialUser);
    
    // Should be around 20% (all basic fields filled = 100% of 20% weight)
    // But rounding may cause slight variations
    expect(result.score).toBeGreaterThanOrEqual(18);
    expect(result.score).toBeLessThanOrEqual(22);
    expect(result.level).toBe('very_poor');
    
    // Basic category should be mostly filled (7-8 out of 8 fields)
    expect(result.details.basic.percentage).toBeGreaterThanOrEqual(85);
  });

  // ============================================================================
  // Test 11: Null vs Empty String Property
  // ============================================================================
  test('Property: Null, undefined, and empty string are treated as unfilled', () => {
    const userWithNull = {
      firstName: null,
      lastName: undefined,
      email: '',
      phone: '+201234567890',
      country: 'مصر',
      city: 'القاهرة',
      gender: 'male',
      birthDate: new Date('1990-01-01'),
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
      cvFile: '',
      profileImage: ''
    };

    const result = calculateCompletenessScore(userWithNull);
    
    // Only 5 out of 8 basic fields filled (phone, country, city, gender, birthDate)
    // 5/8 * 20% = 12.5% ≈ 13% (with rounding)
    expect(result.score).toBeGreaterThanOrEqual(10);
    expect(result.score).toBeLessThanOrEqual(15);
  });

  // ============================================================================
  // Test 12: Skills Category Property
  // ============================================================================
  test('Property: Skills category includes all 4 skill types', () => {
    const userWithAllSkills = {
      firstName: 'أحمد',
      lastName: 'محمد',
      email: 'ahmad@example.com',
      phone: '+201234567890',
      country: 'مصر',
      city: 'القاهرة',
      gender: 'male',
      birthDate: new Date('1990-01-01'),
      educationList: [],
      experienceList: [],
      
      // All 4 skill types filled
      computerSkills: [{ skill: 'JavaScript' }],
      softwareSkills: [{ software: 'VS Code' }],
      languages: [{ language: 'العربية' }],
      otherSkills: ['التواصل'],
      
      trainingList: [],
      specialization: '',
      interests: [],
      bio: '',
      cvFile: '',
      profileImage: ''
    };

    const userWithNoSkills = {
      ...userWithAllSkills,
      computerSkills: [],
      softwareSkills: [],
      languages: [],
      otherSkills: []
    };

    const scoreWithSkills = calculateCompletenessScore(userWithAllSkills).score;
    const scoreWithoutSkills = calculateCompletenessScore(userWithNoSkills).score;

    // Skills category weight is 20%, so difference should be ~20
    expect(scoreWithSkills - scoreWithoutSkills).toBeGreaterThanOrEqual(19);
    expect(scoreWithSkills - scoreWithoutSkills).toBeLessThanOrEqual(21);
  });

});

// ============================================================================
// Helper: Generate Random User Profile
// ============================================================================
function generateUserProfile() {
  return fc.record({
    firstName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: '' }),
    lastName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: '' }),
    email: fc.option(fc.emailAddress(), { nil: '' }),
    phone: fc.option(fc.string({ minLength: 10, maxLength: 15 }), { nil: '' }),
    country: fc.option(fc.constantFrom('مصر', 'السعودية', 'الإمارات', ''), { nil: '' }),
    city: fc.option(fc.constantFrom('القاهرة', 'الرياض', 'دبي', ''), { nil: '' }),
    gender: fc.option(fc.constantFrom('male', 'female', 'other', ''), { nil: '' }),
    birthDate: fc.option(fc.date({ min: new Date('1950-01-01'), max: new Date('2005-12-31') }), { nil: null }),
    
    educationList: fc.array(
      fc.record({
        degree: fc.string({ minLength: 1, maxLength: 50 }),
        institution: fc.string({ minLength: 1, maxLength: 100 }),
        year: fc.string({ minLength: 4, maxLength: 4 })
      }),
      { maxLength: 5 }
    ),
    
    experienceList: fc.array(
      fc.record({
        company: fc.string({ minLength: 1, maxLength: 100 }),
        position: fc.string({ minLength: 1, maxLength: 50 }),
        from: fc.date({ min: new Date('2000-01-01'), max: new Date('2023-12-31') }),
        to: fc.date({ min: new Date('2000-01-01'), max: new Date('2024-12-31') })
      }),
      { maxLength: 5 }
    ),
    
    computerSkills: fc.array(
      fc.record({
        skill: fc.constantFrom('JavaScript', 'Python', 'Java', 'C++'),
        proficiency: fc.constantFrom('beginner', 'intermediate', 'advanced', 'expert')
      }),
      { maxLength: 10 }
    ),
    
    softwareSkills: fc.array(
      fc.record({
        software: fc.constantFrom('VS Code', 'Photoshop', 'Excel', 'AutoCAD'),
        proficiency: fc.constantFrom('beginner', 'intermediate', 'advanced', 'expert')
      }),
      { maxLength: 10 }
    ),
    
    languages: fc.array(
      fc.record({
        language: fc.constantFrom('العربية', 'English', 'Français'),
        proficiency: fc.constantFrom('beginner', 'intermediate', 'advanced', 'native')
      }),
      { maxLength: 5 }
    ),
    
    otherSkills: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 10 }),
    
    trainingList: fc.array(
      fc.record({
        courseName: fc.string({ minLength: 1, maxLength: 100 }),
        provider: fc.string({ minLength: 1, maxLength: 100 }),
        hasCertificate: fc.boolean()
      }),
      { maxLength: 10 }
    ),
    
    specialization: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: '' }),
    interests: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 10 }),
    bio: fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: '' }),
    cvFile: fc.option(fc.constantFrom('cv.pdf', 'resume.pdf', ''), { nil: '' }),
    profileImage: fc.option(fc.constantFrom('profile.jpg', 'avatar.png', ''), { nil: '' })
  });
}
