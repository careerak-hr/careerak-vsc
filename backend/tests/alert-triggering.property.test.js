const fc = require('fast-check');
const mongoose = require('mongoose');
const JobPosting = require('../src/models/JobPosting');
const SavedSearch = require('../src/models/SavedSearch');
const SearchAlert = require('../src/models/SearchAlert');
const Notification = require('../src/models/Notification');
const { User } = require('../src/models/User');
const alertService = require('../src/services/alertService');

// لا نستخدم mock - نريد notificationService الحقيقي لإنشاء Notification في قاعدة البيانات

/**
 * Feature: advanced-search-filter
 * Property 11: Alert Triggering on New Match
 * 
 * For any active alert with specific search criteria, when a new job posting
 * is created that matches those criteria, the system should trigger exactly
 * one alert notification.
 * 
 * Validates: Requirements 4.1
 */

describe('Property 11: Alert Triggering on New Match', () => {
  let testUser;

  beforeEach(async () => {
    // تنظيف قاعدة البيانات بشكل كامل
    await SavedSearch.deleteMany({});
    await SearchAlert.deleteMany({});
    await Notification.deleteMany({});
    await JobPosting.deleteMany({});
    await User.deleteMany({});

    // إنشاء مستخدم اختبار
    testUser = await User.create({
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      phone: '+201234567890',
      role: 'Employee', // استخدام القيمة الصحيحة من enum
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
   * Property Test: عند نشر وظيفة جديدة تطابق معايير البحث،
   * يجب إرسال تنبيه واحد فقط
   */
  it('should trigger exactly one alert when a new job matches search criteria', async () => {
    await fc.assert(
      fc.asyncProperty(
        // توليد معايير بحث عشوائية
        fc.record({
          query: fc.string({ minLength: 3, maxLength: 20 }),
          skills: fc.array(fc.constantFrom('JavaScript', 'Python', 'React', 'Node.js'), { minLength: 1, maxLength: 3 }),
          location: fc.constantFrom('Cairo', 'Alexandria', 'Giza'),
          salaryMin: fc.integer({ min: 3000, max: 8000 }),
          experienceLevel: fc.constantFrom('Entry', 'Mid', 'Senior') // استخدام القيم الصحيحة
        }),
        async (searchParams) => {
          // تنظيف SavedSearch و SearchAlert قبل كل iteration
          await SavedSearch.deleteMany({ userId: testUser._id });
          await SearchAlert.deleteMany({ userId: testUser._id });
          
          // إنشاء عملية بحث محفوظة
          const savedSearch = await SavedSearch.create({
            userId: testUser._id,
            name: 'Test Search',
            searchType: 'jobs',
            searchParams,
            alertEnabled: true,
            alertFrequency: 'instant',
            lastChecked: new Date(Date.now() - 1000) // قبل ثانية واحدة
          });

          // إنشاء تنبيه
          await SearchAlert.create({
            userId: testUser._id,
            savedSearchId: savedSearch._id,
            frequency: 'instant',
            notificationMethod: 'push',
            isActive: true
          });

          // عدد الإشعارات قبل نشر الوظيفة
          const notificationsBefore = await Notification.countDocuments({
            recipient: testUser._id,
            type: 'job_match'
          });

          // إنشاء وظيفة تطابق معايير البحث
          const matchingJob = await JobPosting.create({
            title: `${searchParams.query} Developer`,
            description: `Looking for a ${searchParams.query} developer`,
            requirements: 'Test requirements', // إضافة requirements المطلوب
            company: {
              _id: new mongoose.Types.ObjectId(),
              name: 'Test Company',
              logo: 'logo.png'
            },
            location: searchParams.location,
            salary: {
              min: searchParams.salaryMin,
              max: searchParams.salaryMin + 2000,
              currency: 'EGP'
            },
            jobType: 'Full-time', // استخدام القيمة الصحيحة
            experienceLevel: searchParams.experienceLevel,
            skills: searchParams.skills,
            status: 'Open',
            postedBy: new mongoose.Types.ObjectId()
          });

          // معالجة الوظيفة الجديدة
          await alertService.processNewJob(matchingJob);

          // الانتظار لإتمام العملية
          await new Promise(resolve => setTimeout(resolve, 500));

          // عدد الإشعارات بعد نشر الوظيفة
          const notificationsAfter = await Notification.countDocuments({
            recipient: testUser._id,
            type: 'job_match'
          });

          // التحقق: يجب أن يكون هناك تنبيه واحد فقط
          const alertsSent = notificationsAfter - notificationsBefore;
          expect(alertsSent).toBe(1);

          // التحقق من محتوى الإشعار
          const notification = await Notification.findOne({
            recipient: testUser._id,
            type: 'job_match'
          }).sort({ createdAt: -1 });

          expect(notification).toBeTruthy();
          // تحويل ObjectIds إلى strings للمقارنة
          const jobPostingIds = notification.relatedData.jobPostings.map(id => id.toString());
          expect(jobPostingIds).toContain(matchingJob._id.toString());
          expect(notification.relatedData.savedSearchId.toString()).toEqual(savedSearch._id.toString());
        }
      ),
      { numRuns: 5, timeout: 10000 }
    );
  }, 30000);

  /**
   * Property Test: عند نشر وظيفة لا تطابق معايير البحث،
   * لا يجب إرسال أي تنبيه
   */
  it('should NOT trigger alert when job does not match search criteria', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          searchQuery: fc.string({ minLength: 3, maxLength: 20 }),
          searchSkills: fc.array(fc.constantFrom('JavaScript', 'Python'), { minLength: 1, maxLength: 2 }),
          jobTitle: fc.string({ minLength: 3, maxLength: 20 }),
          jobSkills: fc.array(fc.constantFrom('Java', 'C++'), { minLength: 1, maxLength: 2 })
        }),
        async ({ searchQuery, searchSkills, jobTitle, jobSkills }) => {
          // التأكد من عدم التطابق
          const hasCommonSkill = searchSkills.some(skill => jobSkills.includes(skill));
          if (hasCommonSkill || jobTitle.includes(searchQuery)) {
            return; // تخطي هذه الحالة
          }

          // إنشاء عملية بحث محفوظة
          const savedSearch = await SavedSearch.create({
            userId: testUser._id,
            name: 'Test Search',
            searchType: 'jobs',
            searchParams: {
              query: searchQuery,
              skills: searchSkills
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

          const notificationsBefore = await Notification.countDocuments({
            recipient: testUser._id,
            type: 'job_match'
          });

          // إنشاء وظيفة لا تطابق معايير البحث
          const nonMatchingJob = await JobPosting.create({
            title: jobTitle,
            description: 'Job description',
            requirements: 'Test requirements',
            company: {
              _id: new mongoose.Types.ObjectId(),
              name: 'Test Company',
              logo: 'logo.png'
            },
            location: 'Cairo',
            salary: { min: 5000, max: 7000, currency: 'EGP' },
            jobType: 'Full-time',
            experienceLevel: 'Mid',
            skills: jobSkills,
            status: 'Open',
            postedBy: new mongoose.Types.ObjectId()
          });

          await alertService.processNewJob(nonMatchingJob);
          await new Promise(resolve => setTimeout(resolve, 100));

          const notificationsAfter = await Notification.countDocuments({
            recipient: testUser._id,
            type: 'job_match'
          });

          // التحقق: لا يجب إرسال أي تنبيه
          expect(notificationsAfter).toBe(notificationsBefore);
        }
      ),
      { numRuns: 5, timeout: 10000 }
    );
  }, 30000);

  /**
   * Property Test: عند تعطيل التنبيه، لا يجب إرسال أي إشعارات
   */
  it('should NOT trigger alert when alert is disabled', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          query: fc.string({ minLength: 3, maxLength: 20 }),
          skills: fc.array(fc.constantFrom('JavaScript', 'Python', 'React'), { minLength: 1, maxLength: 2 })
        }),
        async (searchParams) => {
          // إنشاء عملية بحث محفوظة مع تنبيه معطل
          const savedSearch = await SavedSearch.create({
            userId: testUser._id,
            name: 'Test Search',
            searchType: 'jobs',
            searchParams,
            alertEnabled: false, // معطل
            alertFrequency: 'instant',
            lastChecked: new Date(Date.now() - 1000)
          });

          await SearchAlert.create({
            userId: testUser._id,
            savedSearchId: savedSearch._id,
            frequency: 'instant',
            notificationMethod: 'push',
            isActive: false // معطل
          });

          const notificationsBefore = await Notification.countDocuments({
            recipient: testUser._id,
            type: 'job_match'
          });

          // إنشاء وظيفة تطابق معايير البحث
          const matchingJob = await JobPosting.create({
            title: `${searchParams.query} Developer`,
            description: `Looking for a ${searchParams.query} developer`,
            requirements: 'Test requirements',
            company: {
              _id: new mongoose.Types.ObjectId(),
              name: 'Test Company',
              logo: 'logo.png'
            },
            location: 'Cairo',
            salary: { min: 5000, max: 7000, currency: 'EGP' },
            jobType: 'Full-time',
            experienceLevel: 'Mid',
            skills: searchParams.skills,
            status: 'Open',
            postedBy: new mongoose.Types.ObjectId()
          });

          await alertService.processNewJob(matchingJob);
          await new Promise(resolve => setTimeout(resolve, 100));

          const notificationsAfter = await Notification.countDocuments({
            recipient: testUser._id,
            type: 'job_match'
          });

          // التحقق: لا يجب إرسال أي تنبيه لأن التنبيه معطل
          expect(notificationsAfter).toBe(notificationsBefore);
        }
      ),
      { numRuns: 5, timeout: 10000 }
    );
  }, 30000);
});
