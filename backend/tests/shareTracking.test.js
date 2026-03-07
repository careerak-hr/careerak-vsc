const mongoose = require('mongoose');
const JobShare = require('../src/models/JobShare');
const JobPosting = require('../src/models/JobPosting');
const User = require('../src/models/User');
const shareTrackingService = require('../src/services/shareTrackingService');

describe('Share Tracking System', () => {
  let testUser;
  let testJob;

  beforeAll(async () => {
    // الاتصال بقاعدة البيانات للاختبار
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }

    // إنشاء مستخدم تجريبي
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'testshare@example.com',
      password: 'password123',
      role: 'job_seeker'
    });

    // إنشاء وظيفة تجريبية
    testJob = await JobPosting.create({
      title: 'Test Job for Sharing',
      description: 'Test description',
      requirements: 'Test requirements',
      postedBy: testUser._id,
      company: { name: 'Test Company' }
    });
  });

  afterAll(async () => {
    // تنظيف البيانات
    await JobShare.deleteMany({});
    await JobPosting.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // تنظيف سجلات المشاركة قبل كل اختبار
    await JobShare.deleteMany({});
    await JobPosting.findByIdAndUpdate(testJob._id, { shareCount: 0 });
  });

  describe('trackShare', () => {
    test('يجب تسجيل مشاركة بنجاح', async () => {
      const result = await shareTrackingService.trackShare({
        jobId: testJob._id,
        userId: testUser._id,
        platform: 'linkedin',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent'
      });

      expect(result.success).toBe(true);
      expect(result.share).toBeDefined();
      expect(result.share.platform).toBe('linkedin');
      expect(result.newShareCount).toBe(1);
    });

    test('يجب رفض المشاركة لوظيفة غير موجودة', async () => {
      const fakeJobId = new mongoose.Types.ObjectId();
      
      const result = await shareTrackingService.trackShare({
        jobId: fakeJobId,
        userId: testUser._id,
        platform: 'twitter'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Job not found');
    });

    test('يجب منع spam (أكثر من 10 مشاركات في اليوم)', async () => {
      // إنشاء 10 مشاركات
      for (let i = 0; i < 10; i++) {
        await shareTrackingService.trackShare({
          jobId: testJob._id,
          userId: testUser._id,
          platform: 'whatsapp'
        });
      }

      // المحاولة الحادية عشرة يجب أن تفشل
      const result = await shareTrackingService.trackShare({
        jobId: testJob._id,
        userId: testUser._id,
        platform: 'whatsapp'
      });

      expect(result.success).toBe(false);
      expect(result.spam).toBe(true);
      expect(result.error).toContain('Share limit exceeded');
    });

    test('يجب تحديث shareCount في الوظيفة', async () => {
      await shareTrackingService.trackShare({
        jobId: testJob._id,
        userId: testUser._id,
        platform: 'facebook'
      });

      const updatedJob = await JobPosting.findById(testJob._id);
      expect(updatedJob.shareCount).toBe(1);
    });
  });

  describe('getJobShareStats', () => {
    beforeEach(async () => {
      // إنشاء بعض المشاركات للاختبار
      await JobShare.create([
        { jobId: testJob._id, userId: testUser._id, platform: 'linkedin' },
        { jobId: testJob._id, userId: testUser._id, platform: 'twitter' },
        { jobId: testJob._id, userId: testUser._id, platform: 'linkedin' }
      ]);
    });

    test('يجب إرجاع إحصائيات صحيحة', async () => {
      const result = await shareTrackingService.getJobShareStats(testJob._id);

      expect(result.success).toBe(true);
      expect(result.stats.totalShares).toBe(3);
      expect(result.stats.uniqueSharers).toBe(1);
      expect(result.stats.sharesByPlatform).toHaveProperty('linkedin');
      expect(result.stats.sharesByPlatform.linkedin).toBe(2);
      expect(result.stats.sharesByPlatform.twitter).toBe(1);
    });

    test('يجب رفض معرف وظيفة غير صالح', async () => {
      const result = await shareTrackingService.getJobShareStats('invalid-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid job ID');
    });

    test('يجب رفض وظيفة غير موجودة', async () => {
      const fakeJobId = new mongoose.Types.ObjectId();
      const result = await shareTrackingService.getJobShareStats(fakeJobId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Job not found');
    });
  });

  describe('getUserShareStats', () => {
    beforeEach(async () => {
      // إنشاء مشاركات متعددة
      await JobShare.create([
        { jobId: testJob._id, userId: testUser._id, platform: 'linkedin' },
        { jobId: testJob._id, userId: testUser._id, platform: 'twitter' },
        { jobId: testJob._id, userId: testUser._id, platform: 'facebook' }
      ]);
    });

    test('يجب إرجاع إحصائيات المستخدم بشكل صحيح', async () => {
      const result = await shareTrackingService.getUserShareStats(testUser._id, 30);

      expect(result.success).toBe(true);
      expect(result.stats.totalShares).toBe(3);
      expect(result.stats.platformCount).toBe(3);
      expect(result.stats.jobCount).toBe(1);
    });

    test('يجب إرجاع إحصائيات فارغة لمستخدم بدون مشاركات', async () => {
      const newUser = await User.create({
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.com',
        password: 'password123'
      });

      const result = await shareTrackingService.getUserShareStats(newUser._id, 30);

      expect(result.success).toBe(true);
      expect(result.stats.totalShares).toBe(0);

      await User.findByIdAndDelete(newUser._id);
    });
  });

  describe('getMostSharedJobs', () => {
    beforeEach(async () => {
      // إنشاء وظيفة ثانية
      const job2 = await JobPosting.create({
        title: 'Another Test Job',
        description: 'Test description 2',
        requirements: 'Test requirements 2',
        postedBy: testUser._id,
        company: { name: 'Test Company 2' }
      });

      // إنشاء مشاركات
      await JobShare.create([
        { jobId: testJob._id, userId: testUser._id, platform: 'linkedin' },
        { jobId: testJob._id, userId: testUser._id, platform: 'twitter' },
        { jobId: testJob._id, userId: testUser._id, platform: 'facebook' },
        { jobId: job2._id, userId: testUser._id, platform: 'linkedin' }
      ]);
    });

    test('يجب إرجاع الوظائف الأكثر مشاركة', async () => {
      const result = await shareTrackingService.getMostSharedJobs(10, 30);

      expect(result.success).toBe(true);
      expect(result.jobs.length).toBeGreaterThan(0);
      expect(result.jobs[0].shareCount).toBeGreaterThanOrEqual(result.jobs[result.jobs.length - 1].shareCount);
    });
  });

  describe('getShareTrends', () => {
    beforeEach(async () => {
      // إنشاء مشاركات في أيام مختلفة
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      await JobShare.create([
        { jobId: testJob._id, userId: testUser._id, platform: 'linkedin', timestamp: today },
        { jobId: testJob._id, userId: testUser._id, platform: 'twitter', timestamp: today },
        { jobId: testJob._id, userId: testUser._id, platform: 'linkedin', timestamp: yesterday }
      ]);
    });

    test('يجب إرجاع اتجاهات المشاركة', async () => {
      const result = await shareTrackingService.getShareTrends(testJob._id, 7);

      expect(result.success).toBe(true);
      expect(result.trends).toBeDefined();
      expect(Array.isArray(result.trends)).toBe(true);
    });

    test('يجب إرجاع اتجاهات لجميع الوظائف', async () => {
      const result = await shareTrackingService.getShareTrends(null, 7);

      expect(result.success).toBe(true);
      expect(result.jobId).toBe('all');
      expect(result.trends).toBeDefined();
    });
  });

  describe('cleanupOldShares', () => {
    test('يجب حذف السجلات القديمة', async () => {
      // إنشاء سجل قديم
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 2);

      await JobShare.create({
        jobId: testJob._id,
        userId: testUser._id,
        platform: 'linkedin',
        timestamp: oldDate
      });

      const result = await shareTrackingService.cleanupOldShares(365);

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBeGreaterThan(0);
    });
  });

  describe('JobShare Model Methods', () => {
    test('getShareCount يجب أن يعيد العدد الصحيح', async () => {
      await JobShare.create([
        { jobId: testJob._id, userId: testUser._id, platform: 'linkedin' },
        { jobId: testJob._id, userId: testUser._id, platform: 'twitter' }
      ]);

      const count = await JobShare.getShareCount(testJob._id);
      expect(count).toBe(2);
    });

    test('getSharesByPlatform يجب أن يعيد التوزيع الصحيح', async () => {
      await JobShare.create([
        { jobId: testJob._id, userId: testUser._id, platform: 'linkedin' },
        { jobId: testJob._id, userId: testUser._id, platform: 'linkedin' },
        { jobId: testJob._id, userId: testUser._id, platform: 'twitter' }
      ]);

      const result = await JobShare.getSharesByPlatform(testJob._id);
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      
      const linkedinShares = result.find(r => r._id === 'linkedin');
      expect(linkedinShares.count).toBe(2);
    });
  });
});
