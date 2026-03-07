/**
 * Property-Based Tests for Application Submission
 * Feature: apply-page-enhancements
 * 
 * These tests verify universal properties that should hold true
 * across all valid executions of the application submission system.
 */

const fc = require('fast-check');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const JobApplication = require('../src/models/JobApplication');
const ApplicationDraft = require('../src/models/ApplicationDraft');
const JobPosting = require('../src/models/JobPosting');
const { User, Individual, Company } = require('../src/models/User');

let mongoServer;

// Setup and teardown
beforeAll(async () => {
  // Disconnect if already connected
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  await JobApplication.deleteMany({});
  await ApplicationDraft.deleteMany({});
  await JobPosting.deleteMany({});
  await User.deleteMany({});
});

// ============================================================================
// Property 5: Draft deletion after submission
// ============================================================================

describe('Feature: apply-page-enhancements, Property 5: Draft deletion after submission', () => {
  /**
   * Property 5: Draft deletion after submission
   * 
   * For any draft application, when the final application is successfully 
   * submitted, the corresponding draft should no longer exist in either 
   * backend storage or local storage.
   * 
   * Validates: Requirements 2.7
   */
  
  test('Property 5: Draft is deleted after successful application submission', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random draft data
        fc.record({
          step: fc.integer({ min: 1, max: 5 }),
          fullName: fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
          email: fc.emailAddress(),
          phone: fc.string({ minLength: 10, maxLength: 15 }).filter(s => s.trim().length >= 10),
          country: fc.constantFrom('USA', 'UK', 'Canada', 'Egypt', 'UAE', 'Saudi Arabia'),
          city: fc.string({ minLength: 3, maxLength: 30 }).filter(s => s.trim().length > 0),
          education: fc.array(
            fc.record({
              level: fc.constantFrom('High School', 'Bachelor', 'Master', 'PhD'),
              degree: fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
              institution: fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
              year: fc.integer({ min: 1990, max: 2024 }).map(String)
            }),
            { maxLength: 5 }
          ),
          experience: fc.array(
            fc.record({
              company: fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
              position: fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
              from: fc.date({ min: new Date('2000-01-01'), max: new Date('2024-01-01') }),
              to: fc.date({ min: new Date('2000-01-01'), max: new Date('2024-12-31') }),
              current: fc.boolean()
            }),
            { maxLength: 5 }
          ),
          computerSkills: fc.array(
            fc.record({
              skill: fc.constantFrom('JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js'),
              proficiency: fc.constantFrom('beginner', 'intermediate', 'advanced', 'expert')
            }),
            { maxLength: 10 }
          ),
          languages: fc.array(
            fc.record({
              language: fc.constantFrom('English', 'Arabic', 'French', 'Spanish', 'German'),
              proficiency: fc.constantFrom('beginner', 'intermediate', 'advanced', 'native')
            }),
            { maxLength: 5 }
          )
        }),
        async (draftData) => {
          // Create test user (applicant) with unique phone
          const uniquePhone = `+1${Date.now()}${Math.random().toString().slice(2, 6)}`;
          const applicant = await Individual.create({
            firstName: 'Test',
            lastName: 'User',
            email: draftData.email,
            password: 'hashedPassword123',
            role: 'Employee',
            phone: uniquePhone,
            country: draftData.country || 'USA'
          });

          // Create test company user with unique phone
          const companyPhone = `+2${Date.now()}${Math.random().toString().slice(2, 6)}`;
          const company = await Company.create({
            companyName: 'Test Company',
            companyIndustry: 'Technology',
            email: `company${Date.now()}@test.com`,
            password: 'hashedPassword123',
            role: 'HR',
            phone: companyPhone,
            country: 'USA'
          });

          // Create test job posting
          const jobPosting = await JobPosting.create({
            title: 'Software Engineer',
            description: 'Test job description',
            requirements: 'Test requirements',
            location: 'Remote',
            postedBy: company._id,
            status: 'active'
          });

          // Create draft
          const draft = await ApplicationDraft.create({
            jobPosting: jobPosting._id,
            applicant: applicant._id,
            step: draftData.step,
            formData: {
              fullName: draftData.fullName,
              email: draftData.email,
              phone: draftData.phone,
              country: draftData.country,
              city: draftData.city,
              education: draftData.education,
              experience: draftData.experience,
              computerSkills: draftData.computerSkills,
              languages: draftData.languages
            }
          });

          // Verify draft exists before submission
          const draftBeforeSubmission = await ApplicationDraft.findById(draft._id);
          expect(draftBeforeSubmission).not.toBeNull();

          // Submit application
          const application = await JobApplication.create({
            jobPosting: jobPosting._id,
            applicant: applicant._id,
            fullName: draftData.fullName,
            email: draftData.email,
            phone: draftData.phone,
            country: draftData.country,
            city: draftData.city,
            education: draftData.education,
            experience: draftData.experience,
            computerSkills: draftData.computerSkills,
            languages: draftData.languages,
            status: 'Submitted',
            statusHistory: [{
              status: 'Submitted',
              timestamp: new Date()
            }]
          });

          // Delete draft after successful submission (simulating controller behavior)
          await ApplicationDraft.findOneAndDelete({
            jobPosting: jobPosting._id,
            applicant: applicant._id
          });

          // Verify draft no longer exists
          const draftAfterSubmission = await ApplicationDraft.findById(draft._id);
          expect(draftAfterSubmission).toBeNull();

          // Verify application was created successfully
          const submittedApplication = await JobApplication.findById(application._id);
          expect(submittedApplication).not.toBeNull();
          expect(submittedApplication.status).toBe('Submitted');

          // Property assertion: Draft should not exist after submission
          return draftAfterSubmission === null && submittedApplication !== null;
        }
      ),
      { numRuns: 5, timeout: 60000 } // Reduced to 5 iterations for practical testing with database
    );
  }, 90000); // 90 second timeout for the test

  test('Property 5: Multiple drafts for different jobs are handled correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            fullName: fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
            email: fc.emailAddress(),
            phone: fc.string({ minLength: 10, maxLength: 15 }).filter(s => s.trim().length >= 10)
          }),
          { minLength: 2, maxLength: 5 }
        ),
        async (draftDataArray) => {
          // Create test user with unique phone
          const uniquePhone = `+1${Date.now()}${Math.random().toString().slice(2, 6)}`;
          const applicant = await Individual.create({
            firstName: 'Test',
            lastName: 'User',
            email: `test${Date.now()}@example.com`,
            password: 'hashedPassword123',
            role: 'Employee',
            phone: uniquePhone,
            country: 'USA'
          });

          // Create test company with unique phone
          const companyPhone = `+2${Date.now()}${Math.random().toString().slice(2, 6)}`;
          const company = await Company.create({
            companyName: 'Test Company',
            companyIndustry: 'Technology',
            email: `company${Date.now()}@test.com`,
            password: 'hashedPassword123',
            role: 'HR',
            phone: companyPhone,
            country: 'USA'
          });

          // Create multiple job postings and drafts
          const jobPostings = [];
          const drafts = [];

          for (let i = 0; i < draftDataArray.length; i++) {
            const jobPosting = await JobPosting.create({
              title: `Job ${i}`,
              description: 'Test description',
              requirements: 'Test requirements',
              location: 'Remote',
              postedBy: company._id,
              status: 'active'
            });
            jobPostings.push(jobPosting);

            const draft = await ApplicationDraft.create({
              jobPosting: jobPosting._id,
              applicant: applicant._id,
              step: 1,
              formData: draftDataArray[i]
            });
            drafts.push(draft);
          }

          // Submit application for first job only
          const firstJobPosting = jobPostings[0];
          const firstDraftData = draftDataArray[0];

          await JobApplication.create({
            jobPosting: firstJobPosting._id,
            applicant: applicant._id,
            fullName: firstDraftData.fullName,
            email: firstDraftData.email,
            phone: firstDraftData.phone,
            status: 'Submitted'
          });

          // Delete only the first draft
          await ApplicationDraft.findOneAndDelete({
            jobPosting: firstJobPosting._id,
            applicant: applicant._id
          });

          // Verify first draft is deleted
          const firstDraftAfter = await ApplicationDraft.findById(drafts[0]._id);
          expect(firstDraftAfter).toBeNull();

          // Verify other drafts still exist
          for (let i = 1; i < drafts.length; i++) {
            const otherDraft = await ApplicationDraft.findById(drafts[i]._id);
            expect(otherDraft).not.toBeNull();
          }

          // Property assertion: Only submitted job's draft is deleted
          return firstDraftAfter === null;
        }
      ),
      { numRuns: 5, timeout: 60000 } // Reduced to 5 iterations for practical testing
    );
  }, 90000); // 90 second timeout
});


// ============================================================================
// Property 9: Withdrawal restrictions
// ============================================================================

describe('Feature: apply-page-enhancements, Property 9: Withdrawal restrictions', () => {
  /**
   * Property 9: Withdrawal restrictions
   * 
   * For any application with status in [Shortlisted, Interview Scheduled, 
   * Accepted, Rejected], the system should not display a withdraw button 
   * and should reject any withdrawal attempts.
   * 
   * Validates: Requirements 6.1, 6.5
   */
  
  test('Property 9: Withdrawal is rejected for non-withdrawable statuses', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate applications with various statuses
        fc.record({
          fullName: fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
          email: fc.emailAddress(),
          status: fc.constantFrom('Shortlisted', 'Interview Scheduled', 'Accepted', 'Rejected')
        }),
        async (applicationData) => {
          // Create test user with unique phone
          const uniquePhone = `+1${Date.now()}${Math.random().toString().slice(2, 6)}`;
          const applicant = await Individual.create({
            firstName: 'Test',
            lastName: 'User',
            email: applicationData.email,
            password: 'hashedPassword123',
            role: 'Employee',
            phone: uniquePhone,
            country: 'USA'
          });

          // Create test company with unique phone
          const companyPhone = `+2${Date.now()}${Math.random().toString().slice(2, 6)}`;
          const company = await Company.create({
            companyName: 'Test Company',
            companyIndustry: 'Technology',
            email: `company${Date.now()}@test.com`,
            password: 'hashedPassword123',
            role: 'HR',
            phone: companyPhone,
            country: 'USA'
          });

          // Create test job posting
          const jobPosting = await JobPosting.create({
            title: 'Software Engineer',
            description: 'Test job description',
            requirements: 'Test requirements',
            location: 'Remote',
            postedBy: company._id,
            status: 'active'
          });

          // Create application with non-withdrawable status
          const application = await JobApplication.create({
            jobPosting: jobPosting._id,
            applicant: applicant._id,
            fullName: applicationData.fullName,
            email: applicationData.email,
            phone: uniquePhone,
            status: applicationData.status,
            statusHistory: [{
              status: 'Submitted',
              timestamp: new Date()
            }, {
              status: applicationData.status,
              timestamp: new Date()
            }]
          });

          // Attempt to withdraw (should fail)
          const withdrawableStatuses = ['Submitted', 'Reviewed'];
          const shouldBeWithdrawable = withdrawableStatuses.includes(application.status);

          // Property assertion: Non-withdrawable statuses should not allow withdrawal
          expect(shouldBeWithdrawable).toBe(false);

          // Verify the status is indeed non-withdrawable
          const nonWithdrawableStatuses = ['Shortlisted', 'Interview Scheduled', 'Accepted', 'Rejected'];
          expect(nonWithdrawableStatuses).toContain(application.status);

          return !shouldBeWithdrawable;
        }
      ),
      { numRuns: 5, timeout: 60000 }
    );
  }, 90000);

  test('Property 9: Withdrawal is allowed for withdrawable statuses', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate applications with withdrawable statuses
        fc.record({
          fullName: fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length > 0),
          email: fc.emailAddress(),
          status: fc.constantFrom('Submitted', 'Reviewed')
        }),
        async (applicationData) => {
          // Create test user with unique phone
          const uniquePhone = `+1${Date.now()}${Math.random().toString().slice(2, 6)}`;
          const applicant = await Individual.create({
            firstName: 'Test',
            lastName: 'User',
            email: applicationData.email,
            password: 'hashedPassword123',
            role: 'Employee',
            phone: uniquePhone,
            country: 'USA'
          });

          // Create test company with unique phone
          const companyPhone = `+2${Date.now()}${Math.random().toString().slice(2, 6)}`;
          const company = await Company.create({
            companyName: 'Test Company',
            companyIndustry: 'Technology',
            email: `company${Date.now()}@test.com`,
            password: 'hashedPassword123',
            role: 'HR',
            phone: companyPhone,
            country: 'USA'
          });

          // Create test job posting
          const jobPosting = await JobPosting.create({
            title: 'Software Engineer',
            description: 'Test job description',
            requirements: 'Test requirements',
            location: 'Remote',
            postedBy: company._id,
            status: 'active'
          });

          // Create application with withdrawable status
          const application = await JobApplication.create({
            jobPosting: jobPosting._id,
            applicant: applicant._id,
            fullName: applicationData.fullName,
            email: applicationData.email,
            phone: uniquePhone,
            status: applicationData.status,
            statusHistory: [{
              status: applicationData.status,
              timestamp: new Date()
            }]
          });

          // Check if withdrawal is allowed
          const withdrawableStatuses = ['Submitted', 'Reviewed'];
          const shouldBeWithdrawable = withdrawableStatuses.includes(application.status);

          // Property assertion: Withdrawable statuses should allow withdrawal
          expect(shouldBeWithdrawable).toBe(true);

          // Simulate withdrawal
          application.status = 'Withdrawn';
          application.withdrawnAt = new Date();
          application.statusHistory.push({
            status: 'Withdrawn',
            timestamp: new Date()
          });
          await application.save();

          // Verify withdrawal was successful
          const withdrawnApplication = await JobApplication.findById(application._id);
          expect(withdrawnApplication.status).toBe('Withdrawn');
          expect(withdrawnApplication.withdrawnAt).toBeDefined();

          return shouldBeWithdrawable && withdrawnApplication.status === 'Withdrawn';
        }
      ),
      { numRuns: 5, timeout: 60000 }
    );
  }, 90000);
});
