const mongoose = require('mongoose');
const JobPosting = require('../src/models/JobPosting');
const SavedSearch = require('../src/models/SavedSearch');
const SearchAlert = require('../src/models/SearchAlert');
const Notification = require('../src/models/Notification');
const { User } = require('../src/models/User');
const alertService = require('../src/services/alertService');
const alertScheduler = require('../src/jobs/alertScheduler');

// Mock notification service
jest.mock('../src/services/notificationService', () => ({
  createNotification: jest.fn().mockResolvedValue({ success: true }),
  create: jest.fn().mockResolvedValue({ success: true })
}));

/**
 * Unit Tests for Alert Scheduler
 * Tests scheduled alerts (daily and weekly)
 * 
 * Validates: Requirements 4.1
 */

describe('Alert Scheduler Tests', () => {
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

  describe('Daily Alerts', () => {
    it('should send daily alerts for matching jobs', async () => {
      // إنشاء عملية بحث محفوظة مع تنبيه يومي
      const savedSearch = await SavedSearch.create({
        userId: testUser._id,
        name: 'JavaScript Jobs',
        searchType: 'jobs',
        searchParams: {
          query: 'JavaScript',
          skills: ['JavaScript', 'React']
        },
        alertEnabled: true,
        alertFrequency: 'daily',
        lastChecked: new Date(Date.now() - 25 * 60 * 60 * 1000) // قبل 25 ساعة
      });

      await SearchAlert.create({
        userId: testUser._id,
        savedSearchId: savedSearch._id,
        frequency: 'daily',
        notificationMethod: 'push',
        isActive: true
      });

      // إنشاء وظيفة جديدة تطابق معايير البحث
      await JobPosting.create({
        title: 'JavaScript Developer',
        description: 'Looking for a JavaScript developer',
        company: {
          _id: new mongoose.Types.ObjectId(),
          name: 'Test Company',
          logo: 'logo.png'
        },
        location: 'Cairo',
        salary: { min: 5000, max: 7000, currency: 'EGP' },
        jobType: 'Full-Time',
        experienceLevel: 'Mid-Level',
        skills: ['JavaScript', 'React'],
        status: 'Open',
        postedBy: new mongoose.Types.ObjectId(),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // قبل ساعتين
      });

      // تشغيل التنبيهات اليومية
      await alertService.runScheduledAlerts('daily');

      // التحقق من إرسال الإشعار
      const notifications = await Notification.find({
        recipient: testUser._id,
        type: 'job_match'
      });

      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].title).toContain('وظائف جديدة');

      // التحقق من تحديث lastChecked
      const updatedSavedSearch = await SavedSearch.findById(savedSearch._id);
      expect(updatedSavedSearch.lastChecked.getTime()).toBeGreaterThan(savedSearch.lastChecked.getTime());
    });

    it('should NOT send daily alerts if no new jobs', async () => {
      const savedSearch = await SavedSearch.create({
        userId: testUser._id,
        name: 'Python Jobs',
        searchType: 'jobs',
        searchParams: {
          query: 'Python',
          skills: ['Python']
        },
        alertEnabled: true,
        alertFrequency: 'daily',
        lastChecked: new Date() // الآن
      });

      await SearchAlert.create({
        userId: testUser._id,
        savedSearchId: savedSearch._id,
        frequency: 'daily',
        notificationMethod: 'push',
        isActive: true
      });

      // لا توجد وظائف جديدة

      const notificationsBefore = await Notification.countDocuments({
        recipient: testUser._id,
        type: 'job_match'
      });

      await alertService.runScheduledAlerts('daily');

      const notificationsAfter = await Notification.countDocuments({
        recipient: testUser._id,
        type: 'job_match'
      });

      // لا يجب إرسال أي إشعار
      expect(notificationsAfter).toBe(notificationsBefore);
    });

    it('should skip disabled alerts', async () => {
      const savedSearch = await SavedSearch.create({
        userId: testUser._id,
        name: 'Java Jobs',
        searchType: 'jobs',
        searchParams: {
          query: 'Java',
          skills: ['Java']
        },
        alertEnabled: false, // معطل
        alertFrequency: 'daily',
        lastChecked: new Date(Date.now() - 25 * 60 * 60 * 1000)
      });

      await SearchAlert.create({
        userId: testUser._id,
        savedSearchId: savedSearch._id,
        frequency: 'daily',
        notificationMethod: 'push',
        isActive: false // معطل
      });

      await JobPosting.create({
        title: 'Java Developer',
        description: 'Looking for a Java developer',
        company: {
          _id: new mongoose.Types.ObjectId(),
          name: 'Test Company',
          logo: 'logo.png'
        },
        location: 'Cairo',
        salary: { min: 5000, max: 7000, currency: 'EGP' },
        jobType: 'Full-Time',
        experienceLevel: 'Mid-Level',
        skills: ['Java'],
        status: 'Open',
        postedBy: new mongoose.Types.ObjectId(),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      });

      const notificationsBefore = await Notification.countDocuments({
        recipient: testUser._id,
        type: 'job_match'
      });

      await alertService.runScheduledAlerts('daily');

      const notificationsAfter = await Notification.countDocuments({
        recipient: testUser._id,
        type: 'job_match'
      });

      // لا يجب إرسال أي إشعار لأن التنبيه معطل
      expect(notificationsAfter).toBe(notificationsBefore);
    });
  });

  describe('Weekly Alerts', () => {
    it('should send weekly alerts for matching jobs', async () => {
      const savedSearch = await SavedSearch.create({
        userId: testUser._id,
        name: 'React Jobs',
        searchType: 'jobs',
        searchParams: {
          query: 'React',
          skills: ['React']
        },
        alertEnabled: true,
        alertFrequency: 'weekly',
        lastChecked: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // قبل 8 أيام
      });

      await SearchAlert.create({
        userId: testUser._id,
        savedSearchId: savedSearch._id,
        frequency: 'weekly',
        notificationMethod: 'push',
        isActive: true
      });

      await JobPosting.create({
        title: 'React Developer',
        description: 'Looking for a React developer',
        company: {
          _id: new mongoose.Types.ObjectId(),
          name: 'Test Company',
          logo: 'logo.png'
        },
        location: 'Cairo',
        salary: { min: 5000, max: 7000, currency: 'EGP' },
        jobType: 'Full-Time',
        experienceLevel: 'Mid-Level',
        skills: ['React'],
        status: 'Open',
        postedBy: new mongoose.Types.ObjectId(),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // قبل 3 أيام
      });

      await alertService.runScheduledAlerts('weekly');

      const notifications = await Notification.find({
        recipient: testUser._id,
        type: 'job_match'
      });

      expect(notifications.length).toBeGreaterThan(0);
    });
  });

  describe('Scheduler Status', () => {
    it('should return scheduler status', () => {
      const status = alertScheduler.getStatus();

      expect(status).toHaveProperty('dailyJob');
      expect(status).toHaveProperty('weeklyJob');
      expect(status.dailyJob).toHaveProperty('schedule');
      expect(status.weeklyJob).toHaveProperty('schedule');
      expect(status.dailyJob.timezone).toBe('Africa/Cairo');
      expect(status.weeklyJob.timezone).toBe('Africa/Cairo');
    });
  });

  describe('Manual Execution', () => {
    it('should run daily alerts manually', async () => {
      const savedSearch = await SavedSearch.create({
        userId: testUser._id,
        name: 'Node.js Jobs',
        searchType: 'jobs',
        searchParams: {
          query: 'Node.js',
          skills: ['Node.js']
        },
        alertEnabled: true,
        alertFrequency: 'daily',
        lastChecked: new Date(Date.now() - 25 * 60 * 60 * 1000)
      });

      await SearchAlert.create({
        userId: testUser._id,
        savedSearchId: savedSearch._id,
        frequency: 'daily',
        notificationMethod: 'push',
        isActive: true
      });

      await JobPosting.create({
        title: 'Node.js Developer',
        description: 'Looking for a Node.js developer',
        company: {
          _id: new mongoose.Types.ObjectId(),
          name: 'Test Company',
          logo: 'logo.png'
        },
        location: 'Cairo',
        salary: { min: 5000, max: 7000, currency: 'EGP' },
        jobType: 'Full-Time',
        experienceLevel: 'Mid-Level',
        skills: ['Node.js'],
        status: 'Open',
        postedBy: new mongoose.Types.ObjectId(),
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      });

      const result = await alertScheduler.runDailyAlertsNow();

      expect(result.success).toBe(true);
      expect(result.message).toContain('completed');

      const notifications = await Notification.find({
        recipient: testUser._id,
        type: 'job_match'
      });

      expect(notifications.length).toBeGreaterThan(0);
    });

    it('should run weekly alerts manually', async () => {
      const result = await alertScheduler.runWeeklyAlertsNow();

      expect(result.success).toBe(true);
      expect(result.message).toContain('completed');
    });
  });
});
