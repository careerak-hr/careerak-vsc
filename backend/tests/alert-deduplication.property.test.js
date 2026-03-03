/**
 * Property-Based Tests: Alert Deduplication
 * 
 * Feature: advanced-search-filter
 * Property 14: Alert Deduplication
 * Validates: Requirements 4.4
 * 
 * For any job posting, when it matches multiple times with the same alert criteria
 * (e.g., re-indexed or updated), the system should send at most one alert notification
 * for that job.
 */

const fc = require('fast-check');
const alertService = require('../src/services/alertService');

// Mock dependencies
jest.mock('../src/models/SavedSearch');
jest.mock('../src/models/JobPosting');
jest.mock('../src/models/Notification');
jest.mock('../src/services/notificationService');

const SavedSearch = require('../src/models/SavedSearch');
const JobPosting = require('../src/models/JobPosting');
const Notification = require('../src/models/Notification');
const notificationService = require('../src/services/notificationService');

describe('Property 14: Alert Deduplication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property: لا يتم إرسال تنبيهات مكررة لنفس الوظيفة
   */
  it('should not send duplicate alerts for the same job', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.string({ minLength: 24, maxLength: 24 }),
          jobId: fc.string({ minLength: 24, maxLength: 24 }),
          jobTitle: fc.string({ minLength: 5, maxLength: 50 }),
          searchQuery: fc.string({ minLength: 3, maxLength: 20 })
        }),
        async ({ userId, jobId, jobTitle, searchQuery }) => {
          // Setup: عملية بحث محفوظة واحدة
          SavedSearch.find.mockReturnValue({
            lean: jest.fn().mockResolvedValue([
              {
                _id: 'search123',
                userId: userId,
                name: 'Test Search',
                searchType: 'jobs',
                searchParams: { query: searchQuery },
                alertEnabled: true,
                alertFrequency: 'instant'
              }
            ])
          });

          // Setup: الوظيفة تطابق البحث
          const job = {
            _id: jobId,
            title: `${jobTitle} ${searchQuery}`,
            description: `Description ${searchQuery}`,
            skills: ['JavaScript'],
            company: { name: 'Test Company' },
            location: { city: 'Cairo' },
            status: 'Open'
          };

          // المرة الأولى: لا يوجد إشعار سابق
          Notification.findOne.mockReturnValueOnce({
            lean: jest.fn().mockResolvedValueOnce(null)
          });
          notificationService.createNotification.mockResolvedValueOnce({ _id: 'notif1' });

          // معالجة الوظيفة الجديدة (المرة الأولى)
          await alertService.processNewJob(job);

          // التحقق من إرسال تنبيه واحد
          expect(notificationService.createNotification).toHaveBeenCalledTimes(1);

          // المرة الثانية: يوجد إشعار سابق (مكرر)
          Notification.findOne.mockReturnValueOnce({
            lean: jest.fn().mockResolvedValueOnce({
              _id: 'notif1',
              recipient: userId,
              type: 'job_match',
              relatedData: { jobPostings: [jobId] }
            })
          });

          // محاولة معالجة نفس الوظيفة مرة أخرى
          await alertService.processNewJob(job);

          // التحقق من عدم إرسال تنبيه مكرر
          expect(notificationService.createNotification).toHaveBeenCalledTimes(1); // لا يزال مرة واحدة فقط
        }
      ),
      { numRuns: 10 } // 10 تشغيلات
    );
  }, 30000);

  /**
   * Property: يمكن إرسال تنبيهات لوظائف مختلفة
   */
  it('should send alerts for different jobs', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.string({ minLength: 24, maxLength: 24 }),
          job1Id: fc.string({ minLength: 24, maxLength: 24 }),
          job2Id: fc.string({ minLength: 24, maxLength: 24 }),
          searchQuery: fc.string({ minLength: 3, maxLength: 20 })
        }),
        async ({ userId, job1Id, job2Id, searchQuery }) => {
          // تأكد من أن الوظائف مختلفة
          fc.pre(job1Id !== job2Id);

          // Setup
          SavedSearch.find.mockReturnValue({
            lean: jest.fn().mockResolvedValue([
              {
                _id: 'search123',
                userId: userId,
                name: 'Test Search',
                searchType: 'jobs',
                searchParams: { query: searchQuery },
                alertEnabled: true,
                alertFrequency: 'instant'
              }
            ])
          });

          const job1 = {
            _id: job1Id,
            title: `Job 1 ${searchQuery}`,
            description: `Description ${searchQuery}`,
            skills: ['JavaScript'],
            company: { name: 'Company 1' },
            location: { city: 'Cairo' },
            status: 'Open'
          };

          const job2 = {
            _id: job2Id,
            title: `Job 2 ${searchQuery}`,
            description: `Description ${searchQuery}`,
            skills: ['JavaScript'],
            company: { name: 'Company 2' },
            location: { city: 'Alexandria' },
            status: 'Open'
          };

          // لا يوجد إشعار سابق لأي من الوظيفتين
          Notification.findOne.mockReturnValue({
            lean: jest.fn().mockResolvedValue(null)
          });
          notificationService.createNotification.mockResolvedValue({ _id: 'notif' });

          // معالجة الوظيفة الأولى
          await alertService.processNewJob(job1);

          // معالجة الوظيفة الثانية
          await alertService.processNewJob(job2);

          // التحقق من إرسال تنبيهين (واحد لكل وظيفة)
          expect(notificationService.createNotification).toHaveBeenCalledTimes(2);
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);

  /**
   * Property: isDuplicateAlert تعمل بشكل صحيح
   */
  it('should correctly identify duplicate alerts', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.string({ minLength: 24, maxLength: 24 }),
          jobId: fc.string({ minLength: 24, maxLength: 24 })
        }),
        async ({ userId, jobId }) => {
          // في البداية، لا يوجد تنبيه مكرر
          Notification.findOne.mockReturnValueOnce({
            lean: jest.fn().mockResolvedValueOnce(null)
          });
          let isDuplicate = await alertService.isDuplicateAlert(userId, jobId);
          expect(isDuplicate).toBe(false);

          // الآن يوجد إشعار سابق
          Notification.findOne.mockReturnValueOnce({
            lean: jest.fn().mockResolvedValueOnce({
              _id: 'notif1',
              recipient: userId,
              type: 'job_match',
              relatedData: { jobPostings: [jobId] }
            })
          });
          isDuplicate = await alertService.isDuplicateAlert(userId, jobId);
          expect(isDuplicate).toBe(true);
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);

  /**
   * Property: التنبيهات المجدولة تصفي الوظائف المكررة
   */
  it('should filter duplicate jobs in scheduled alerts', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.string({ minLength: 24, maxLength: 24 }),
          job1Id: fc.string({ minLength: 24, maxLength: 24 }),
          job2Id: fc.string({ minLength: 24, maxLength: 24 }),
          searchQuery: fc.string({ minLength: 3, maxLength: 20 })
        }),
        async ({ userId, job1Id, job2Id, searchQuery }) => {
          // تأكد من أن الوظائف مختلفة
          fc.pre(job1Id !== job2Id);

          // Setup: عملية بحث محفوظة مع تنبيه يومي
          SavedSearch.find.mockReturnValue({
            lean: jest.fn().mockResolvedValue([
              {
                _id: 'search123',
                userId: userId,
                name: 'Test Search',
                searchType: 'jobs',
                searchParams: { query: searchQuery },
                alertEnabled: true,
                alertFrequency: 'daily',
                lastChecked: new Date(Date.now() - 24 * 60 * 60 * 1000)
              }
            ])
          });

          SavedSearch.updateOne.mockResolvedValue({ modifiedCount: 1 });

          // Setup: وظيفتان جديدتان، واحدة مكررة
          JobPosting.find.mockReturnValue({
            sort: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([
                  {
                    _id: job1Id,
                    title: `Job 1 ${searchQuery}`,
                    description: `Description ${searchQuery}`,
                    skills: ['JavaScript'],
                    company: { name: 'Company 1' },
                    location: { city: 'Cairo' },
                    status: 'Open',
                    createdAt: new Date()
                  },
                  {
                    _id: job2Id,
                    title: `Job 2 ${searchQuery}`,
                    description: `Description ${searchQuery}`,
                    skills: ['JavaScript'],
                    company: { name: 'Company 2' },
                    location: { city: 'Alexandria' },
                    status: 'Open',
                    createdAt: new Date()
                  }
                ])
              })
            })
          });

          // job1 مكرر، job2 جديد
          Notification.findOne
            .mockReturnValueOnce({
              lean: jest.fn().mockResolvedValueOnce({ _id: 'notif1', relatedData: { jobPostings: [job1Id] } })
            })
            .mockReturnValueOnce({
              lean: jest.fn().mockResolvedValueOnce(null)
            });

          notificationService.createNotification.mockResolvedValue({ _id: 'notif' });

          // تشغيل التنبيهات المجدولة
          await alertService.runScheduledAlerts('daily');

          // التحقق من إرسال تنبيه واحد فقط (للوظيفة غير المكررة)
          expect(notificationService.createNotification).toHaveBeenCalledTimes(1);
          
          // التحقق من أن التنبيه يحتوي على job2 فقط
          const callArgs = notificationService.createNotification.mock.calls[0][0];
          expect(callArgs.relatedData.jobPostings).toHaveLength(1);
          expect(callArgs.relatedData.jobPostings[0]).toBe(job2Id);
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);
});
