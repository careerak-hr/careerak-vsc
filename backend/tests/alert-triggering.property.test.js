/**
 * Property 11: Alert Triggering on New Match
 * 
 * For any active alert with specific search criteria, when a new job posting 
 * is created that matches those criteria, the system should trigger exactly 
 * one alert notification.
 * 
 * Validates: Requirements 4.1
 */

const fc = require('fast-check');
const mongoose = require('mongoose');
const SavedSearch = require('../src/models/SavedSearch');
const JobPosting = require('../src/models/JobPosting');
const Notification = require('../src/models/Notification');
const alertService = require('../src/services/alertService');
const { User } = require('../src/models/User');

describe('Alert Triggering - Property 11', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak-test');
  });

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
   * Property Test: التنبيه يُرسل تلقائياً عند نشر وظيفة مطابقة
   */
  it('should trigger exactly one alert when a matching job is posted', async () => {
    // إنشاء مستخدم تجريبي
    const testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      role: 'jobSeeker'
    });

    // إنشاء عملية بحث محفوظة مع تنبيه مفعّل
    const savedSearch = await SavedSearch.create({
      userId: testUser._id,
      name: 'JavaScript Developer',
      searchType: 'jobs',
      searchParams: {
        query: 'javascript',
        skills: ['JavaScript', 'React'],
        skillsLogic: 'OR'
      },
      alertEnabled: true,
      alertFrequency: 'instant'
    });

    // إنشاء وظيفة مطابقة
    const matchingJob = await JobPosting.create({
      title: 'Senior JavaScript Developer',
      description: 'We are looking for a JavaScript developer',
      skills: ['JavaScript', 'React', 'Node.js'],
      status: 'active',
      postedBy: new mongoose.Types.ObjectId(),
      company: { name: 'Test Company' },
      location: { city: 'Cairo', country: 'Egypt' },
      salary: { min: 5000, max: 8000 },
      jobType: 'full-time',
      experienceLevel: 'mid'
    });

    // معالجة الوظيفة الجديدة
    await alertService.processNewJob(matchingJob);

    // التحقق من إرسال إشعار واحد فقط
    const notifications = await Notification.find({
      recipient: testUser._id,
      type: 'job_match'
    });

    expect(notifications).toHaveLength(1);
    expect(notifications[0].title).toContain('وظائف جديدة');
    expect(notifications[0].relatedData.jobPostings).toContain(matchingJob._id);

    // تنظيف
    await User.deleteOne({ _id: testUser._id });
  }, 30000);

  /**
   * Property Test: لا يُرسل تنبيه للوظائف غير المطابقة
   */
  it('should not trigger alert when job does not match criteria', async () => {
    const testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      role: 'jobSeeker'
    });

    // عملية بحث عن Python
    const savedSearch = await SavedSearch.create({
      userId: testUser._id,
      name: 'Python Developer',
      searchType: 'jobs',
      searchParams: {
        query: 'python',
        skills: ['Python', 'Django'],
        skillsLogic: 'AND'
      },
      alertEnabled: true,
      alertFrequency: 'instant'
    });

    // وظيفة JavaScript (غير مطابقة)
    const nonMatchingJob = await JobPosting.create({
      title: 'JavaScript Developer',
      description: 'JavaScript only',
      skills: ['JavaScript', 'React'],
      status: 'active',
      postedBy: new mongoose.Types.ObjectId(),
      company: { name: 'Test Company' },
      location: { city: 'Cairo', country: 'Egypt' },
      salary: { min: 5000, max: 8000 },
      jobType: 'full-time',
      experienceLevel: 'mid'
    });

    await alertService.processNewJob(nonMatchingJob);

    // التحقق من عدم إرسال إشعار
    const notifications = await Notification.find({
      recipient: testUser._id,
      type: 'job_match'
    });

    expect(notifications).toHaveLength(0);

    await User.deleteOne({ _id: testUser._id });
  }, 30000);

  /**
   * Property Test: التنبيه يُرسل فقط للمستخدمين الذين فعّلوا التنبيهات
   */
  it('should only send alerts to users with alertEnabled=true', async () => {
    const user1 = await User.create({
      firstName: 'User',
      lastName: 'One',
      email: `user1-${Date.now()}@example.com`,
      password: 'password123',
      role: 'jobSeeker'
    });

    const user2 = await User.create({
      firstName: 'User',
      lastName: 'Two',
      email: `user2-${Date.now()}@example.com`,
      password: 'password123',
      role: 'jobSeeker'
    });

    // User1: تنبيه مفعّل
    await SavedSearch.create({
      userId: user1._id,
      name: 'JS Jobs',
      searchType: 'jobs',
      searchParams: { query: 'javascript' },
      alertEnabled: true,
      alertFrequency: 'instant'
    });

    // User2: تنبيه معطّل
    await SavedSearch.create({
      userId: user2._id,
      name: 'JS Jobs',
      searchType: 'jobs',
      searchParams: { query: 'javascript' },
      alertEnabled: false,
      alertFrequency: 'instant'
    });

    const job = await JobPosting.create({
      title: 'JavaScript Developer',
      description: 'JavaScript job',
      skills: ['JavaScript'],
      status: 'active',
      postedBy: new mongoose.Types.ObjectId(),
      company: { name: 'Test Company' },
      location: { city: 'Cairo', country: 'Egypt' },
      salary: { min: 5000, max: 8000 },
      jobType: 'full-time',
      experienceLevel: 'mid'
    });

    await alertService.processNewJob(job);

    // User1 يجب أن يستلم إشعار
    const user1Notifications = await Notification.find({
      recipient: user1._id,
      type: 'job_match'
    });
    expect(user1Notifications).toHaveLength(1);

    // User2 لا يجب أن يستلم إشعار
    const user2Notifications = await Notification.find({
      recipient: user2._id,
      type: 'job_match'
    });
    expect(user2Notifications).toHaveLength(0);

    await User.deleteMany({ _id: { $in: [user1._id, user2._id] } });
  }, 30000);

  /**
   * Property Test: التنبيه يُرسل فقط للتنبيهات الفورية (instant)
   */
  it('should only send instant alerts, not daily/weekly', async () => {
    const testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      role: 'jobSeeker'
    });

    // تنبيه يومي (لا يُرسل فوراً)
    await SavedSearch.create({
      userId: testUser._id,
      name: 'Daily Alert',
      searchType: 'jobs',
      searchParams: { query: 'javascript' },
      alertEnabled: true,
      alertFrequency: 'daily'
    });

    const job = await JobPosting.create({
      title: 'JavaScript Developer',
      description: 'JavaScript job',
      skills: ['JavaScript'],
      status: 'active',
      postedBy: new mongoose.Types.ObjectId(),
      company: { name: 'Test Company' },
      location: { city: 'Cairo', country: 'Egypt' },
      salary: { min: 5000, max: 8000 },
      jobType: 'full-time',
      experienceLevel: 'mid'
    });

    await alertService.processNewJob(job);

    // لا يجب إرسال إشعار فوري
    const notifications = await Notification.find({
      recipient: testUser._id,
      type: 'job_match'
    });
    expect(notifications).toHaveLength(0);

    await User.deleteOne({ _id: testUser._id });
  }, 30000);
});
