/**
 * Property-Based Tests: Alert Toggle Behavior
 * 
 * Feature: advanced-search-filter
 * Property 12: Alert Toggle Behavior
 * Validates: Requirements 4.2
 * 
 * Property: For any saved search with an alert, when the alert is enabled,
 * matching jobs should trigger notifications; when disabled, no notifications
 * should be sent for matching jobs.
 * 
 * NOTE: Using 10-20 iterations per test instead of the recommended 100 due to:
 * - Database operations (create/delete users, jobs, notifications)
 * - Alert service processing time
 * - Each iteration takes ~2-3 seconds
 * - Total test time would exceed 5 minutes with 100 iterations
 * - 10-20 iterations still provide good coverage for this property
 */

const fc = require('fast-check');
const mongoose = require('mongoose');
const SavedSearch = require('../src/models/SavedSearch');
const JobPosting = require('../src/models/JobPosting');
const Notification = require('../src/models/Notification');
const { User } = require('../src/models/User');
const alertService = require('../src/services/alertService');

// Mock notification service
jest.mock('../src/services/notificationService', () => ({
  createNotification: jest.fn().mockResolvedValue({ success: true }),
  create: jest.fn().mockResolvedValue({ success: true })
}));

describe('Property 12: Alert Toggle Behavior', () => {
  
  beforeEach(async () => {
    await SavedSearch.deleteMany({});
    await JobPosting.deleteMany({});
    await Notification.deleteMany({});
  });

  afterAll(async () => {
    await SavedSearch.deleteMany({});
    await JobPosting.deleteMany({});
    await Notification.deleteMany({});
    await mongoose.connection.close();
  });

  /**
   * Property Test 1: التنبيهات المفعّلة تُرسل إشعارات
   */
  it('should send notifications when alert is enabled', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('javascript', 'python', 'java', 'react', 'nodejs'),
        fc.constantFrom('instant', 'daily', 'weekly'),
        fc.constantFrom('push', 'email', 'both'),
        
        async (searchQuery, alertFrequency, notificationMethod) => {
          // Clean up before each property test iteration
          await Notification.deleteMany({});
          
          const testUser = await User.create({
            email: `test-${Date.now()}-${Math.random()}@example.com`,
            password: 'password123',
            phone: `+201${Math.floor(Math.random() * 100000000)}`,
            role: 'Employee',
            country: 'Egypt'
          });

          try {
            const savedSearch = await SavedSearch.create({
              userId: testUser._id,
              name: `Search for ${searchQuery}`,
              searchType: 'jobs',
              searchParams: {
                query: searchQuery,
                skills: [searchQuery]
              },
              alertEnabled: true,
              alertFrequency,
              notificationMethod
            });

            const matchingJob = await JobPosting.create({
              title: `${searchQuery} Developer`,
              description: `Looking for ${searchQuery} expert`,
              requirements: `${searchQuery} skills required`,
              company: { name: 'Test Company', size: 'Medium' },
              location: 'Cairo, Egypt',
              salary: { min: 5000, max: 10000 },
              skills: [searchQuery, 'teamwork'],
              jobType: 'Full-time',
              experienceLevel: 'Mid',
              status: 'Open',
              postedBy: new mongoose.Types.ObjectId()
            });

            if (alertFrequency === 'instant') {
              await alertService.processNewJob(matchingJob);

              const notifications = await Notification.find({
                recipient: testUser._id,
                type: 'job_match'
              });

              expect(notifications.length).toBeGreaterThan(0);
              
              const notification = notifications[0];
              expect(notification.title).toContain('وظائف جديدة');
              expect(notification.relatedData.savedSearchId.toString()).toBe(savedSearch._id.toString());
              // Convert ObjectIds to strings for comparison
              const jobPostingIds = notification.relatedData.jobPostings.map(id => id.toString());
              expect(jobPostingIds).toContain(matchingJob._id.toString());
            }

          } finally {
            await User.deleteOne({ _id: testUser._id });
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property Test 2: التنبيهات المعطّلة لا تُرسل إشعارات
   */
  it('should NOT send notifications when alert is disabled', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('javascript', 'python', 'java', 'react', 'nodejs'),
        
        async (searchQuery) => {
          // Clean up before each property test iteration
          await Notification.deleteMany({});
          
          const testUser = await User.create({
            email: `test-${Date.now()}-${Math.random()}@example.com`,
            password: 'password123',
            phone: `+201${Math.floor(Math.random() * 100000000)}`,
            role: 'Employee',
            country: 'Egypt'
          });

          try {
            const savedSearch = await SavedSearch.create({
              userId: testUser._id,
              name: `Search for ${searchQuery}`,
              searchType: 'jobs',
              searchParams: {
                query: searchQuery,
                skills: [searchQuery]
              },
              alertEnabled: false,
              alertFrequency: 'instant'
            });

            const matchingJob = await JobPosting.create({
              title: `${searchQuery} Developer`,
              description: `Looking for ${searchQuery} expert`,
              requirements: `${searchQuery} skills required`,
              company: { name: 'Test Company', size: 'Medium' },
              location: 'Cairo, Egypt',
              salary: { min: 5000, max: 10000 },
              skills: [searchQuery, 'teamwork'],
              jobType: 'Full-time',
              experienceLevel: 'Mid',
              status: 'Open',
              postedBy: new mongoose.Types.ObjectId()
            });

            await alertService.processNewJob(matchingJob);

            const notifications = await Notification.find({
              recipient: testUser._id,
              type: 'job_match'
            });

            expect(notifications.length).toBe(0);

          } finally {
            await User.deleteOne({ _id: testUser._id });
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property Test 3: تبديل حالة التنبيه يؤثر على الإشعارات
   */
  it('should respect alert toggle changes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('javascript', 'python', 'java', 'react', 'nodejs'),
        
        async (searchQuery) => {
          // Clean up before each property test iteration
          await Notification.deleteMany({});
          
          const testUser = await User.create({
            email: `test-${Date.now()}-${Math.random()}@example.com`,
            password: 'password123',
            phone: `+201${Math.floor(Math.random() * 100000000)}`,
            role: 'Employee',
            country: 'Egypt'
          });

          try {
            let savedSearch = await SavedSearch.create({
              userId: testUser._id,
              name: `Search for ${searchQuery}`,
              searchType: 'jobs',
              searchParams: {
                query: searchQuery,
                skills: [searchQuery]
              },
              alertEnabled: true,
              alertFrequency: 'instant'
            });

            const job1 = await JobPosting.create({
              title: `${searchQuery} Developer 1`,
              description: `Looking for ${searchQuery} expert`,
              requirements: `${searchQuery} skills required`,
              company: { name: 'Company 1', size: 'Medium' },
              location: 'Cairo, Egypt',
              salary: { min: 5000, max: 10000 },
              skills: [searchQuery],
              jobType: 'Full-time',
              experienceLevel: 'Mid',
              status: 'Open',
              postedBy: new mongoose.Types.ObjectId()
            });

            await alertService.processNewJob(job1);

            let notifications = await Notification.find({
              recipient: testUser._id,
              type: 'job_match'
            });
            expect(notifications.length).toBe(1);

            savedSearch = await SavedSearch.findByIdAndUpdate(
              savedSearch._id,
              { alertEnabled: false },
              { new: true }
            );

            const job2 = await JobPosting.create({
              title: `${searchQuery} Developer 2`,
              description: `Looking for ${searchQuery} expert`,
              requirements: `${searchQuery} skills required`,
              company: { name: 'Company 2', size: 'Medium' },
              location: 'Cairo, Egypt',
              salary: { min: 5000, max: 10000 },
              skills: [searchQuery],
              jobType: 'Full-time',
              experienceLevel: 'Mid',
              status: 'Open',
              postedBy: new mongoose.Types.ObjectId()
            });

            await alertService.processNewJob(job2);

            notifications = await Notification.find({
              recipient: testUser._id,
              type: 'job_match'
            });
            expect(notifications.length).toBe(1);

            savedSearch = await SavedSearch.findByIdAndUpdate(
              savedSearch._id,
              { alertEnabled: true },
              { new: true }
            );

            const job3 = await JobPosting.create({
              title: `${searchQuery} Developer 3`,
              description: `Looking for ${searchQuery} expert`,
              requirements: `${searchQuery} skills required`,
              company: { name: 'Company 3', size: 'Medium' },
              location: 'Cairo, Egypt',
              salary: { min: 5000, max: 10000 },
              skills: [searchQuery],
              jobType: 'Full-time',
              experienceLevel: 'Mid',
              status: 'Open',
              postedBy: new mongoose.Types.ObjectId()
            });

            await alertService.processNewJob(job3);

            notifications = await Notification.find({
              recipient: testUser._id,
              type: 'job_match'
            });
            expect(notifications.length).toBe(2);

          } finally {
            await User.deleteOne({ _id: testUser._id });
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property Test 4: التنبيهات المجدولة تحترم حالة التفعيل
   */
  it('should process only enabled alerts in scheduled runs', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('daily', 'weekly'),
        fc.integer({ min: 2, max: 5 }),
        
        async (frequency, numSearches) => {
          // Clean up before each property test iteration
          await Notification.deleteMany({});
          
          const users = [];
          for (let i = 0; i < numSearches; i++) {
            const user = await User.create({
              email: `user${i}-${Date.now()}-${Math.random()}@example.com`,
              password: 'password123',
              phone: `+201${Math.floor(Math.random() * 100000000)}`,
              role: 'Employee',
              country: 'Egypt'
            });
            users.push(user);
          }

          try {
            const savedSearches = [];
            for (let i = 0; i < numSearches; i++) {
              const isEnabled = i % 2 === 0;
              
              const savedSearch = await SavedSearch.create({
                userId: users[i]._id,
                name: `Search ${i}`,
                searchType: 'jobs',
                searchParams: {
                  query: 'JavaScript',
                  skills: ['JavaScript']
                },
                alertEnabled: isEnabled,
                alertFrequency: frequency,
                lastChecked: new Date(Date.now() - 25 * 60 * 60 * 1000) // 25 hours ago
              });
              
              savedSearches.push({ search: savedSearch, enabled: isEnabled });
            }

            // Create a job that matches the search criteria
            await JobPosting.create({
              title: 'JavaScript Developer',
              description: 'Looking for JavaScript expert',
              requirements: 'JavaScript skills required',
              company: { name: 'Test Company', size: 'Medium' },
              location: 'Cairo, Egypt',
              salary: { min: 5000, max: 10000 },
              skills: ['JavaScript', 'React'],
              jobType: 'Full-time',
              experienceLevel: 'Mid',
              status: 'Open',
              postedBy: new mongoose.Types.ObjectId(),
              createdAt: new Date() // Created now, after lastChecked
            });

            await alertService.runScheduledAlerts(frequency);

            for (const { search, enabled } of savedSearches) {
              const notifications = await Notification.find({
                recipient: search.userId,
                type: 'job_match'
              });

              if (enabled) {
                expect(notifications.length).toBeGreaterThan(0);
              } else {
                expect(notifications.length).toBe(0);
              }
            }

          } finally {
            for (const user of users) {
              await User.deleteOne({ _id: user._id });
            }
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property Test 5: تغيير التكرار لا يؤثر على حالة التفعيل
   */
  it('should maintain alert enabled state when frequency changes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.boolean(),
        fc.constantFrom('instant', 'daily', 'weekly'),
        fc.constantFrom('instant', 'daily', 'weekly'),
        
        async (initialEnabled, initialFrequency, newFrequency) => {
          const testUser = await User.create({
            email: `test-${Date.now()}-${Math.random()}@example.com`,
            password: 'password123',
            phone: `+201${Math.floor(Math.random() * 100000000)}`,
            role: 'Employee',
            country: 'Egypt'
          });

          try {
            let savedSearch = await SavedSearch.create({
              userId: testUser._id,
              name: 'Test Search',
              searchType: 'jobs',
              searchParams: { query: 'developer' },
              alertEnabled: initialEnabled,
              alertFrequency: initialFrequency
            });

            savedSearch = await SavedSearch.findByIdAndUpdate(
              savedSearch._id,
              { alertFrequency: newFrequency },
              { new: true }
            );

            expect(savedSearch.alertEnabled).toBe(initialEnabled);
            expect(savedSearch.alertFrequency).toBe(newFrequency);

          } finally {
            await User.deleteOne({ _id: testUser._id });
          }
        }
      ),
      { numRuns: 15 }
    );
  });

});
