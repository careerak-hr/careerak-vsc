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
const mongoose = require('mongoose');
const SavedSearch = require('../src/models/SavedSearch');
const SearchAlert = require('../src/models/SearchAlert');
const JobPosting = require('../src/models/JobPosting');
const Notification = require('../src/models/Notification');
const { User } = require('../src/models/User');
const alertService = require('../src/services/alertService');
const connectDB = require('../src/config/database');

// DON'T mock notification service - we want real notifications to be created

describe('Property 14: Alert Deduplication', () => {
  
  beforeAll(async () => {
    await connectDB();
  });
  
  beforeEach(async () => {
    await SavedSearch.deleteMany({});
    await SearchAlert.deleteMany({});
    await JobPosting.deleteMany({});
    await Notification.deleteMany({});
  });

  afterAll(async () => {
    await SavedSearch.deleteMany({});
    await SearchAlert.deleteMany({});
    await JobPosting.deleteMany({});
    await Notification.deleteMany({});
    await mongoose.connection.close();
  });

  /**
   * Property: لا يتم إرسال تنبيهات مكررة لنفس الوظيفة
   */
  it('should not send duplicate alerts for the same job', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('javascript', 'python', 'java', 'react', 'nodejs'),
        
        async (searchQuery) => {
          // Clean up before each iteration
          await Notification.deleteMany({});
          await JobPosting.deleteMany({});
          await SavedSearch.deleteMany({});
          
          const testUser = await User.create({
            email: `test-${Date.now()}-${Math.random()}@example.com`,
            password: 'password123',
            phone: `+201${Math.floor(Math.random() * 100000000)}`,
            role: 'Employee',
            country: 'Egypt'
          });

          try {
            // Create saved search with instant alert
            const savedSearch = await SavedSearch.create({
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

            // Create SearchAlert document
            await SearchAlert.create({
              userId: testUser._id,
              savedSearchId: savedSearch._id,
              frequency: 'instant',
              notificationMethod: 'push',
              isActive: true
            });

            // Create matching job
            const job = await JobPosting.create({
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

            // Process job first time
            await alertService.processNewJob(job);
            await new Promise(resolve => setTimeout(resolve, 300));

            let notifications = await Notification.find({
              recipient: testUser._id,
              type: 'job_match'
            });
            expect(notifications.length).toBe(1);

            // Process same job again (should not create duplicate)
            await alertService.processNewJob(job);
            await new Promise(resolve => setTimeout(resolve, 300));

            notifications = await Notification.find({
              recipient: testUser._id,
              type: 'job_match'
            });
            expect(notifications.length).toBe(1); // Still 1, no duplicate

          } finally {
            await JobPosting.deleteMany({});
            await SavedSearch.deleteMany({ userId: testUser._id });
            await Notification.deleteMany({ recipient: testUser._id });
            await User.deleteOne({ _id: testUser._id });
          }
        }
      ),
      { numRuns: 5, timeout: 30000 }
    );
  }, 60000);

  /**
   * Property: يمكن إرسال تنبيهات لوظائف مختلفة
   */
  it('should send alerts for different jobs', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('javascript', 'python', 'java', 'react', 'nodejs'),
        
        async (searchQuery) => {
          // Clean up before each iteration
          await Notification.deleteMany({});
          await JobPosting.deleteMany({});
          await SavedSearch.deleteMany({});
          
          const testUser = await User.create({
            email: `test-${Date.now()}-${Math.random()}@example.com`,
            password: 'password123',
            phone: `+201${Math.floor(Math.random() * 100000000)}`,
            role: 'Employee',
            country: 'Egypt'
          });

          try {
            // Create saved search
            const savedSearch = await SavedSearch.create({
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

            // Create SearchAlert document
            await SearchAlert.create({
              userId: testUser._id,
              savedSearchId: savedSearch._id,
              frequency: 'instant',
              notificationMethod: 'push',
              isActive: true
            });

            // Create first job
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
            await new Promise(resolve => setTimeout(resolve, 300));

            // Create second job
            const job2 = await JobPosting.create({
              title: `${searchQuery} Developer 2`,
              description: `Looking for ${searchQuery} expert`,
              requirements: `${searchQuery} skills required`,
              company: { name: 'Company 2', size: 'Medium' },
              location: 'Alexandria, Egypt',
              salary: { min: 6000, max: 12000 },
              skills: [searchQuery],
              jobType: 'Full-time',
              experienceLevel: 'Mid',
              status: 'Open',
              postedBy: new mongoose.Types.ObjectId()
            });

            await alertService.processNewJob(job2);
            await new Promise(resolve => setTimeout(resolve, 300));

            const notifications = await Notification.find({
              recipient: testUser._id,
              type: 'job_match'
            });
            
            // Should have 2 notifications (one for each job)
            expect(notifications.length).toBe(2);

          } finally {
            await JobPosting.deleteMany({});
            await SavedSearch.deleteMany({ userId: testUser._id });
            await SearchAlert.deleteMany({ userId: testUser._id });
            await Notification.deleteMany({ recipient: testUser._id });
            await User.deleteOne({ _id: testUser._id });
          }
        }
      ),
      { numRuns: 5, timeout: 30000 }
    );
  }, 60000);

  /**
   * Property: isDuplicateAlert تعمل بشكل صحيح
   */
  it('should correctly identify duplicate alerts', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('javascript', 'python', 'java'),
        
        async (searchQuery) => {
          // Clean up before each iteration
          await Notification.deleteMany({});
          await JobPosting.deleteMany({});
          
          const testUser = await User.create({
            email: `test-${Date.now()}-${Math.random()}@example.com`,
            password: 'password123',
            phone: `+201${Math.floor(Math.random() * 100000000)}`,
            role: 'Employee',
            country: 'Egypt'
          });

          try {
            const job = await JobPosting.create({
              title: `${searchQuery} Developer`,
              description: `Looking for ${searchQuery} expert`,
              requirements: `${searchQuery} skills required`,
              company: { name: 'Test Company', size: 'Medium' },
              location: 'Cairo, Egypt',
              salary: { min: 5000, max: 10000 },
              skills: [searchQuery],
              jobType: 'Full-time',
              experienceLevel: 'Mid',
              status: 'Open',
              postedBy: new mongoose.Types.ObjectId()
            });

            // Initially, no duplicate
            let isDuplicate = await alertService.isDuplicateAlert(testUser._id, job._id);
            expect(isDuplicate).toBe(false);

            // Create a notification
            await Notification.create({
              recipient: testUser._id,
              type: 'job_match',
              title: 'New Job Match',
              message: 'A new job matches your search',
              relatedData: {
                jobPostings: [job._id]
              }
            });

            // Now it should be a duplicate
            isDuplicate = await alertService.isDuplicateAlert(testUser._id, job._id);
            expect(isDuplicate).toBe(true);

          } finally {
            await JobPosting.deleteMany({});
            await Notification.deleteMany({ recipient: testUser._id });
            await User.deleteOne({ _id: testUser._id });
          }
        }
      ),
      { numRuns: 5, timeout: 30000 }
    );
  }, 60000);

  /**
   * Unit Test: التنبيهات المجدولة تصفي الوظائف المكررة
   */
  it('should filter duplicate jobs in scheduled alerts', async () => {
    const testUser = await User.create({
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      phone: `+201${Math.floor(Math.random() * 100000000)}`,
      role: 'Employee',
      country: 'Egypt'
    });

    try {
      // Create saved search with daily alert
      const savedSearch = await SavedSearch.create({
        userId: testUser._id,
        name: 'JavaScript Search',
        searchType: 'jobs',
        searchParams: {
          query: 'JavaScript',
          skills: ['JavaScript']
        },
        alertEnabled: true,
        alertFrequency: 'daily',
        lastChecked: new Date(Date.now() - 25 * 60 * 60 * 1000) // 25 hours ago
      });

      // Create SearchAlert document
      await SearchAlert.create({
        userId: testUser._id,
        savedSearchId: savedSearch._id,
        frequency: 'daily',
        notificationMethod: 'push',
        isActive: true
      });

      // Create two jobs
      const job1 = await JobPosting.create({
        title: 'JavaScript Developer 1',
        description: 'Looking for JavaScript expert',
        requirements: 'JavaScript skills required',
        company: { name: 'Company 1', size: 'Medium' },
        location: 'Cairo, Egypt',
        salary: { min: 5000, max: 10000 },
        skills: ['JavaScript', 'React'],
        jobType: 'Full-time',
        experienceLevel: 'Mid',
        status: 'Open',
        postedBy: new mongoose.Types.ObjectId(),
        createdAt: new Date()
      });

      const job2 = await JobPosting.create({
        title: 'JavaScript Developer 2',
        description: 'Looking for JavaScript expert',
        requirements: 'JavaScript skills required',
        company: { name: 'Company 2', size: 'Medium' },
        location: 'Alexandria, Egypt',
        salary: { min: 6000, max: 12000 },
        skills: ['JavaScript', 'Node.js'],
        jobType: 'Full-time',
        experienceLevel: 'Mid',
        status: 'Open',
        postedBy: new mongoose.Types.ObjectId(),
        createdAt: new Date()
      });

      // Create notification for job1 (marking it as already notified)
      await Notification.create({
        recipient: testUser._id,
        type: 'job_match',
        title: 'New Job Match',
        message: 'A new job matches your search',
        relatedData: {
          jobPostings: [job1._id]
        }
      });

      // Run scheduled alerts
      await alertService.runScheduledAlerts('daily');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Should have 2 notifications total (1 existing + 1 new for job2)
      const notifications = await Notification.find({
        recipient: testUser._id,
        type: 'job_match'
      });
      
      expect(notifications.length).toBe(2);
      
      // The new notification should only contain job2
      const newNotification = notifications.find(n => 
        n.relatedData.jobPostings.length === 1 && 
        n.relatedData.jobPostings[0].toString() === job2._id.toString()
      );
      expect(newNotification).toBeDefined();

    } finally {
      await JobPosting.deleteMany({});
      await SavedSearch.deleteMany({ userId: testUser._id });
      await SearchAlert.deleteMany({ userId: testUser._id });
      await Notification.deleteMany({ recipient: testUser._id });
      await User.deleteOne({ _id: testUser._id });
    }
  }, 60000);
});

