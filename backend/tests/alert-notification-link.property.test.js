const fc = require('fast-check');
const mongoose = require('mongoose');
const JobPosting = require('../src/models/JobPosting');
const SavedSearch = require('../src/models/SavedSearch');
const SearchAlert = require('../src/models/SearchAlert');
const Notification = require('../src/models/Notification');
const { User } = require('../src/models/User');
const alertService = require('../src/services/alertService');

// Mock notification service
jest.mock('../src/services/notificationService', () => ({
  createNotification: jest.fn().mockResolvedValue({ success: true }),
  create: jest.fn().mockResolvedValue({ success: true })
}));

/**
 * Feature: advanced-search-filter
 * Property 13: Alert Notification Link Validity
 * 
 * For any alert notification generated, the notification should contain
 * a valid direct link to the job posting that triggered the alert.
 * 
 * Validates: Requirements 4.3
 */

describe('Property 13: Alert Notification Link Validity', () => {
  let testUser;

  beforeEach(async () => {
    // تنظيف قاعدة البيانات
    await User.deleteMany({});
    await JobPosting.deleteMany({});
    await SavedSearch.deleteMany({});
    await SearchAlert.deleteMany({});
    await Notification.deleteMany({});

    // إنشاء مستخدم اختبار
    testUser = await User.create({
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      phone: '+201234567890',
      role: 'Employee',
      skills: ['JavaScript', 'React'],
      interests: ['Web Development']
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await JobPosting.deleteMany({});
    await SavedSearch.deleteMany({});
    await SearchAlert.deleteMany({});
    await Notification.deleteMany({});
    await mongoose.connection.close();
  });

  /**
   * Property Test: كل إشعار تنبيه يجب أن يحتوي على رابط صحيح للوظيفة
   */
  it('should include valid job link in every alert notification', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          jobTitle: fc.string({ minLength: 5, maxLength: 30 }),
          companyName: fc.string({ minLength: 3, maxLength: 20 }),
          location: fc.constantFrom('Cairo', 'Alexandria', 'Giza', 'Mansoura'),
          skills: fc.array(fc.constantFrom('JavaScript', 'Python', 'React', 'Node.js'), { minLength: 1, maxLength: 3 })
        }),
        async ({ jobTitle, companyName, location, skills }) => {
          // إنشاء عملية بحث محفوظة
          const savedSearch = await SavedSearch.create({
            userId: testUser._id,
            name: 'Test Search',
            searchType: 'jobs',
            searchParams: {
              query: jobTitle.split(' ')[0],
              skills,
              location
            },
            alertEnabled: true,
            alertFrequency: 'instant',
            lastChecked: new Date(Date.now() - 1000)
          });

          await SearchAlert.create({
            userId: testUser._id,
            savedSearchId: savedSearch._id,
            frequency: 'instant',
            notificationMethod: 'push',
            isActive: true
          });

          // إنشاء وظيفة
          const job = await JobPosting.create({
            title: jobTitle,
            description: 'Job description',
            company: {
              _id: new mongoose.Types.ObjectId(),
              name: companyName,
              logo: 'logo.png'
            },
            location,
            salary: { min: 5000, max: 7000, currency: 'EGP' },
            jobType: 'Full-Time',
            experienceLevel: 'Mid-Level',
            skills,
            status: 'Open',
            postedBy: new mongoose.Types.ObjectId()
          });

          // معالجة الوظيفة الجديدة
          await alertService.processNewJob(job);
          await new Promise(resolve => setTimeout(resolve, 100));

          // جلب الإشعار
          const notification = await Notification.findOne({
            recipient: testUser._id,
            type: 'job_match'
          }).sort({ createdAt: -1 });

          // التحقق من وجود الإشعار
          expect(notification).toBeTruthy();

          // التحقق من وجود jobLinks
          expect(notification.relatedData).toHaveProperty('jobLinks');
          expect(notification.relatedData.jobLinks).toBeInstanceOf(Array);
          expect(notification.relatedData.jobLinks.length).toBeGreaterThan(0);

          // التحقق من صحة الرابط
          const jobLink = notification.relatedData.jobLinks[0];
          expect(jobLink).toHaveProperty('jobId');
          expect(jobLink).toHaveProperty('jobUrl');
          expect(jobLink).toHaveProperty('jobTitle');
          expect(jobLink).toHaveProperty('company');
          expect(jobLink).toHaveProperty('location');

          // التحقق من أن jobId يطابق الوظيفة
          expect(jobLink.jobId.toString()).toBe(job._id.toString());

          // التحقق من صحة تنسيق الرابط
          expect(jobLink.jobUrl).toMatch(/^\/job-postings\//);
          expect(jobLink.jobUrl).toContain(job._id.toString());

          // التحقق من صحة البيانات
          expect(jobLink.jobTitle).toBe(jobTitle);
          expect(jobLink.company).toBe(companyName);
          expect(jobLink.location).toBe(location);
        }
      ),
      { numRuns: 20, timeout: 10000 }
    );
  }, 30000);

  /**
   * Property Test: عند وجود عدة وظائف، يجب أن يحتوي الإشعار على روابط لجميع الوظائف
   */
  it('should include links for all matching jobs in notification', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          searchQuery: fc.string({ minLength: 3, maxLength: 15 }),
          skills: fc.array(fc.constantFrom('JavaScript', 'Python', 'React'), { minLength: 1, maxLength: 2 }),
          jobCount: fc.integer({ min: 2, max: 5 })
        }),
        async ({ searchQuery, skills, jobCount }) => {
          // إنشاء عملية بحث محفوظة
          const savedSearch = await SavedSearch.create({
            userId: testUser._id,
            name: 'Test Search',
            searchType: 'jobs',
            searchParams: {
              query: searchQuery,
              skills
            },
            alertEnabled: true,
            alertFrequency: 'instant',
            lastChecked: new Date(Date.now() - 1000)
          });

          await SearchAlert.create({
            userId: testUser._id,
            savedSearchId: savedSearch._id,
            frequency: 'instant',
            notificationMethod: 'push',
            isActive: true
          });

          // إنشاء عدة وظائف
          const jobs = [];
          for (let i = 0; i < jobCount; i++) {
            const job = await JobPosting.create({
              title: `${searchQuery} Developer ${i + 1}`,
              description: 'Job description',
              company: {
                _id: new mongoose.Types.ObjectId(),
                name: `Company ${i + 1}`,
                logo: 'logo.png'
              },
              location: 'Cairo',
              salary: { min: 5000, max: 7000, currency: 'EGP' },
              jobType: 'Full-Time',
              experienceLevel: 'Mid-Level',
              skills,
              status: 'Open',
              postedBy: new mongoose.Types.ObjectId()
            });
            jobs.push(job);
          }

          // معالجة كل وظيفة
          for (const job of jobs) {
            await alertService.processNewJob(job);
          }
          await new Promise(resolve => setTimeout(resolve, 200));

          // جلب جميع الإشعارات
          const notifications = await Notification.find({
            recipient: testUser._id,
            type: 'job_match'
          }).sort({ createdAt: -1 });

          // التحقق من وجود إشعارات
          expect(notifications.length).toBeGreaterThan(0);

          // التحقق من أن كل إشعار يحتوي على روابط صحيحة
          for (const notification of notifications) {
            expect(notification.relatedData).toHaveProperty('jobLinks');
            expect(notification.relatedData.jobLinks).toBeInstanceOf(Array);
            expect(notification.relatedData.jobLinks.length).toBeGreaterThan(0);

            // التحقق من كل رابط
            for (const jobLink of notification.relatedData.jobLinks) {
              expect(jobLink).toHaveProperty('jobId');
              expect(jobLink).toHaveProperty('jobUrl');
              expect(jobLink.jobUrl).toMatch(/^\/job-postings\//);
              
              // التحقق من أن الوظيفة موجودة
              const jobExists = jobs.some(j => j._id.toString() === jobLink.jobId.toString());
              expect(jobExists).toBe(true);
            }
          }
        }
      ),
      { numRuns: 15, timeout: 15000 }
    );
  }, 45000);

  /**
   * Property Test: الرابط يجب أن يكون قابل للاستخدام (يحتوي على معرف صحيح)
   */
  it('should generate usable links with valid job IDs', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          jobTitle: fc.string({ minLength: 5, maxLength: 25 }),
          skills: fc.array(fc.constantFrom('JavaScript', 'Python', 'Java'), { minLength: 1, maxLength: 2 })
        }),
        async ({ jobTitle, skills }) => {
          const savedSearch = await SavedSearch.create({
            userId: testUser._id,
            name: 'Test Search',
            searchType: 'jobs',
            searchParams: {
              query: jobTitle.split(' ')[0],
              skills
            },
            alertEnabled: true,
            alertFrequency: 'instant',
            lastChecked: new Date(Date.now() - 1000)
          });

          await SearchAlert.create({
            userId: testUser._id,
            savedSearchId: savedSearch._id,
            frequency: 'instant',
            notificationMethod: 'push',
            isActive: true
          });

          const job = await JobPosting.create({
            title: jobTitle,
            description: 'Job description',
            company: {
              _id: new mongoose.Types.ObjectId(),
              name: 'Test Company',
              logo: 'logo.png'
            },
            location: 'Cairo',
            salary: { min: 5000, max: 7000, currency: 'EGP' },
            jobType: 'Full-Time',
            experienceLevel: 'Mid-Level',
            skills,
            status: 'Open',
            postedBy: new mongoose.Types.ObjectId()
          });

          await alertService.processNewJob(job);
          await new Promise(resolve => setTimeout(resolve, 100));

          const notification = await Notification.findOne({
            recipient: testUser._id,
            type: 'job_match'
          }).sort({ createdAt: -1 });

          expect(notification).toBeTruthy();
          const jobLink = notification.relatedData.jobLinks[0];

          // استخراج معرف الوظيفة من الرابط
          const urlParts = jobLink.jobUrl.split('/');
          const jobIdFromUrl = urlParts[urlParts.length - 1];

          // التحقق من أن المعرف صحيح
          expect(mongoose.Types.ObjectId.isValid(jobIdFromUrl)).toBe(true);
          expect(jobIdFromUrl).toBe(job._id.toString());

          // التحقق من أن الوظيفة موجودة في قاعدة البيانات
          const jobFromDb = await JobPosting.findById(jobIdFromUrl);
          expect(jobFromDb).toBeTruthy();
          expect(jobFromDb.title).toBe(jobTitle);
        }
      ),
      { numRuns: 20, timeout: 10000 }
    );
  }, 30000);
});
