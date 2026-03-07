/**
 * Property-Based Test: Draft Round-Trip Preservation
 * 
 * Property 2: Draft round-trip preservation
 * For any draft application data including step number, form fields, and file references,
 * saving the draft and then loading it should produce equivalent data with all fields,
 * files, and step position preserved.
 * 
 * Validates: Requirements 2.3, 2.4, 4.10
 * Feature: apply-page-enhancements
 */

const fc = require('fast-check');
const mongoose = require('mongoose');
const connectDB = require('../src/config/database');
const ApplicationDraft = require('../src/models/ApplicationDraft');
const JobPosting = require('../src/models/JobPosting');
const { User } = require('../src/models/User');

describe('Property 2: Draft round-trip preservation', () => {
  let testUser;
  let testJobPosting;

  beforeAll(async () => {
    // Connect to test database
    await connectDB();

    // Create test user
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: `test-${Date.now()}@example.com`,
      phone: '+1234567890',
      password: 'hashedpassword',
      role: 'Employee'
    });

    // Create test job posting
    testJobPosting = await JobPosting.create({
      title: 'Test Job',
      description: 'Test Description',
      requirements: 'Test Requirements',
      company: {
        name: 'Test Company'
      },
      location: {
        type: 'Test Location',
        city: 'Test City',
        country: 'Test Country',
        coordinates: {
          type: 'Point',
          coordinates: [0, 0] // [longitude, latitude]
        }
      },
      postedBy: testUser._id
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (testUser) {
      await User.deleteOne({ _id: testUser._id });
    }
    if (testJobPosting) {
      await JobPosting.deleteOne({ _id: testJobPosting._id });
    }
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // Clean up drafts after each test
    await ApplicationDraft.deleteMany({});
  });

  // Arbitraries (generators) for property-based testing
  const stepArbitrary = fc.integer({ min: 1, max: 5 });

  const formDataArbitrary = fc.record({
    // Personal Information
    fullName: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
    email: fc.option(fc.emailAddress(), { nil: undefined }),
    phone: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
    country: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
    city: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
    
    // Education
    education: fc.option(fc.array(fc.record({
      level: fc.string({ minLength: 1, maxLength: 50 }),
      degree: fc.string({ minLength: 1, maxLength: 100 }),
      institution: fc.string({ minLength: 1, maxLength: 100 }),
      year: fc.string({ minLength: 4, maxLength: 4 })
    }), { maxLength: 5 }), { nil: undefined }),
    
    // Experience
    experience: fc.option(fc.array(fc.record({
      company: fc.string({ minLength: 1, maxLength: 100 }),
      position: fc.string({ minLength: 1, maxLength: 100 }),
      from: fc.date({ min: new Date('2000-01-01'), max: new Date() }),
      to: fc.date({ min: new Date('2000-01-01'), max: new Date() }),
      current: fc.boolean()
    }), { maxLength: 5 }), { nil: undefined }),
    
    // Skills
    computerSkills: fc.option(fc.array(fc.record({
      skill: fc.string({ minLength: 1, maxLength: 50 }),
      proficiency: fc.constantFrom('beginner', 'intermediate', 'advanced', 'expert')
    }), { maxLength: 10 }), { nil: undefined }),
    
    // Languages
    languages: fc.option(fc.array(fc.record({
      language: fc.string({ minLength: 1, maxLength: 50 }),
      proficiency: fc.constantFrom('beginner', 'intermediate', 'advanced', 'native')
    }), { maxLength: 5 }), { nil: undefined }),
    
    // Additional
    coverLetter: fc.option(fc.string({ maxLength: 1000 }), { nil: undefined }),
    expectedSalary: fc.option(fc.integer({ min: 0, max: 1000000 }), { nil: undefined })
  });

  const filesArbitrary = fc.option(fc.array(fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    size: fc.integer({ min: 1, max: 5000000 }),
    type: fc.constantFrom('application/pdf', 'image/jpeg', 'image/png', 'application/msword'),
    url: fc.webUrl(),
    cloudinaryId: fc.uuid(),
    category: fc.constantFrom('resume', 'cover_letter', 'certificate', 'portfolio', 'other'),
    uploadedAt: fc.date({ min: new Date('2024-01-01'), max: new Date() })
  }), { maxLength: 10 }), { nil: undefined });

  const customAnswersArbitrary = fc.option(fc.array(fc.record({
    questionId: fc.uuid(),
    questionText: fc.string({ minLength: 1, maxLength: 200 }),
    questionType: fc.constantFrom('short_text', 'long_text', 'single_choice', 'multiple_choice', 'yes_no'),
    answer: fc.oneof(
      fc.string({ maxLength: 500 }),
      fc.boolean(),
      fc.array(fc.string({ maxLength: 100 }), { maxLength: 5 })
    )
  }), { maxLength: 5 }), { nil: undefined });

  const draftDataArbitrary = fc.record({
    step: stepArbitrary,
    formData: formDataArbitrary,
    files: filesArbitrary,
    customAnswers: customAnswersArbitrary
  });

  /**
   * Property Test: Draft round-trip preservation
   * 
   * For any draft data, saving and then loading should preserve all data
   */
  it('should preserve all draft data through save and load cycle', async () => {
    await fc.assert(
      fc.asyncProperty(draftDataArbitrary, async (draftData) => {
        // Save draft
        const savedDraft = await ApplicationDraft.create({
          jobPosting: testJobPosting._id,
          applicant: testUser._id,
          step: draftData.step,
          formData: draftData.formData,
          files: draftData.files || [],
          customAnswers: draftData.customAnswers || []
        });

        // Load draft
        const loadedDraft = await ApplicationDraft.findOne({
          jobPosting: testJobPosting._id,
          applicant: testUser._id
        });

        // Verify draft exists
        expect(loadedDraft).not.toBeNull();

        // Verify step preserved
        expect(loadedDraft.step).toBe(draftData.step);

        // Verify formData preserved
        if (draftData.formData.fullName !== undefined) {
          expect(loadedDraft.formData.fullName).toBe(draftData.formData.fullName);
        }
        if (draftData.formData.email !== undefined) {
          expect(loadedDraft.formData.email).toBe(draftData.formData.email);
        }
        if (draftData.formData.phone !== undefined) {
          expect(loadedDraft.formData.phone).toBe(draftData.formData.phone);
        }

        // Verify education array preserved
        if (draftData.formData.education) {
          expect(loadedDraft.formData.education).toHaveLength(draftData.formData.education.length);
          draftData.formData.education.forEach((edu, index) => {
            expect(loadedDraft.formData.education[index].level).toBe(edu.level);
            expect(loadedDraft.formData.education[index].degree).toBe(edu.degree);
          });
        }

        // Verify experience array preserved
        if (draftData.formData.experience) {
          expect(loadedDraft.formData.experience).toHaveLength(draftData.formData.experience.length);
          draftData.formData.experience.forEach((exp, index) => {
            expect(loadedDraft.formData.experience[index].company).toBe(exp.company);
            expect(loadedDraft.formData.experience[index].position).toBe(exp.position);
          });
        }

        // Verify skills preserved
        if (draftData.formData.computerSkills) {
          expect(loadedDraft.formData.computerSkills).toHaveLength(draftData.formData.computerSkills.length);
        }

        // Verify languages preserved
        if (draftData.formData.languages) {
          expect(loadedDraft.formData.languages).toHaveLength(draftData.formData.languages.length);
        }

        // Verify files preserved
        if (draftData.files) {
          expect(loadedDraft.files).toHaveLength(draftData.files.length);
          draftData.files.forEach((file, index) => {
            expect(loadedDraft.files[index].id).toBe(file.id);
            expect(loadedDraft.files[index].name).toBe(file.name);
            expect(loadedDraft.files[index].size).toBe(file.size);
            expect(loadedDraft.files[index].type).toBe(file.type);
            expect(loadedDraft.files[index].url).toBe(file.url);
            expect(loadedDraft.files[index].cloudinaryId).toBe(file.cloudinaryId);
            expect(loadedDraft.files[index].category).toBe(file.category);
          });
        }

        // Verify custom answers preserved
        if (draftData.customAnswers) {
          expect(loadedDraft.customAnswers).toHaveLength(draftData.customAnswers.length);
          draftData.customAnswers.forEach((answer, index) => {
            expect(loadedDraft.customAnswers[index].questionId).toBe(answer.questionId);
            expect(loadedDraft.customAnswers[index].questionText).toBe(answer.questionText);
            expect(loadedDraft.customAnswers[index].questionType).toBe(answer.questionType);
          });
        }

        // Clean up
        await ApplicationDraft.deleteOne({ _id: savedDraft._id });
      }),
      { 
        numRuns: 100, // Run 100 iterations as per spec
        verbose: true,
        seed: 42 // For reproducibility
      }
    );
  }, 60000); // 60 second timeout for property test

  /**
   * Property Test: Multiple save/load cycles preserve data
   * 
   * Verifies that data remains consistent through multiple save/load cycles
   */
  it('should preserve data through multiple save/load cycles', async () => {
    await fc.assert(
      fc.asyncProperty(draftDataArbitrary, async (initialData) => {
        // First save
        let draft = await ApplicationDraft.create({
          jobPosting: testJobPosting._id,
          applicant: testUser._id,
          step: initialData.step,
          formData: initialData.formData,
          files: initialData.files || [],
          customAnswers: initialData.customAnswers || []
        });

        // Perform 3 load/save cycles
        for (let i = 0; i < 3; i++) {
          // Load
          const loaded = await ApplicationDraft.findOne({
            jobPosting: testJobPosting._id,
            applicant: testUser._id
          });

          // Verify step still matches
          expect(loaded.step).toBe(initialData.step);

          // Update (simulate auto-save)
          await ApplicationDraft.findOneAndUpdate(
            { _id: loaded._id },
            { lastSaved: new Date() },
            { new: true }
          );
        }

        // Final verification
        const finalDraft = await ApplicationDraft.findOne({
          jobPosting: testJobPosting._id,
          applicant: testUser._id
        });

        expect(finalDraft.step).toBe(initialData.step);
        
        // Verify file count preserved
        if (initialData.files) {
          expect(finalDraft.files).toHaveLength(initialData.files.length);
        }

        // Clean up
        await ApplicationDraft.deleteOne({ _id: draft._id });
      }),
      { 
        numRuns: 50, // Fewer runs for this more intensive test
        verbose: true
      }
    );
  }, 90000); // 90 second timeout

  /**
   * Property Test: Empty/minimal data is preserved
   * 
   * Verifies that even minimal draft data (just step number) is preserved
   */
  it('should preserve minimal draft data (step only)', async () => {
    await fc.assert(
      fc.asyncProperty(stepArbitrary, async (step) => {
        // Save minimal draft
        const draft = await ApplicationDraft.create({
          jobPosting: testJobPosting._id,
          applicant: testUser._id,
          step: step,
          formData: {},
          files: [],
          customAnswers: []
        });

        // Load draft
        const loaded = await ApplicationDraft.findOne({
          jobPosting: testJobPosting._id,
          applicant: testUser._id
        });

        // Verify step preserved
        expect(loaded).not.toBeNull();
        expect(loaded.step).toBe(step);

        // Clean up
        await ApplicationDraft.deleteOne({ _id: draft._id });
      }),
      { numRuns: 100 }
    );
  }, 30000);
});
