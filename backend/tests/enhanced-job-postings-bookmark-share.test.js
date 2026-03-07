/**
 * اختبارات شاملة لنظام الحفظ والمشاركة
 * Enhanced Job Postings - Bookmark & Share System Tests
 * 
 * يختبر:
 * - نظام حفظ الوظائف (Bookmarks)
 * - نظام مشاركة الوظائف (Share)
 * - التكامل بين الأنظمة
 */

const mongoose = require('mongoose');
const JobBookmark = require('../src/models/JobBookmark');
const JobShare = require('../src/models/JobShare');
const JobPosting = require('../src/models/JobPosting');
const bookmarkService = require('../src/services/bookmarkService');
const shareTrackingService = require('../src/services/shareTrackingService');

// Mock data
const testUserId = new mongoose.Types.ObjectId();
const testJobId = new mongoose.Types.ObjectId();
const testJob = {
  _id: testJobId,
  title: 'مطور Full Stack',
  company: { name: 'شركة تقنية' },
  description: 'وصف الوظيفة التفصيلي',
  requirements: 'خبرة في React وNode.js',
  postedBy: testUserId,
  status: 'Open',
  bookmarkCount: 0,
  shareCount: 0
};

describe('Enhanced Job Postings - Bookmark & Share System', () => {
  
  beforeAll(async () => {
    // الاتصال بقاعدة البيانات للاختبار
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test');
    }
  });

  afterAll(async () => {
    // تنظيف وإغلاق الاتصال
    await JobBookmark.deleteMany({});
    await JobShare.deleteMany({});
    await JobPosting.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // تنظيف البيانات قبل كل اختبار
    await JobBookmark.deleteMany({});
    await JobShare.deleteMany({});
    await JobPosting.deleteMany({});
    
    // إنشاء وظيفة تجريبية
    await JobPosting.create(testJob);
  });

  // ==================== Bookmark System Tests ====================
  
  describe('Bookmark System', () => {
    
    test('1. يجب إضافة وظيفة للمفضلة بنجاح', async () => {
      const result = await bookmarkService.toggleBookmark(testUserId, testJobId);
      
      expect(result.bookmarked).toBe(true);
      expect(result.bookmark).toBeDefined();
      expect(result.message).toContain('إضافة');
      
      // التحقق من قاعدة البيانات
      const bookmark = await JobBookmark.findOne({ userId: testUserId, jobId: testJobId });
      expect(bookmark).toBeDefined();
      expect(bookmark.userId.toString()).toBe(testUserId.toString());
      expect(bookmark.jobId.toString()).toBe(testJobId.toString());
    });

    test('2. يجب إزالة وظيفة من المفضلة بنجاح', async () => {
      // إضافة أولاً
      await bookmarkService.toggleBookmark(testUserId, testJobId);
      
      // ثم إزالة
      const result = await bookmarkService.toggleBookmark(testUserId, testJobId);
      
      expect(result.bookmarked).toBe(false);
      expect(result.message).toContain('إزالة');
      
      // التحقق من قاعدة البيانات
      const bookmark = await JobBookmark.findOne({ userId: testUserId, jobId: testJobId });
      expect(bookmark).toBeNull();
    });

    test('3. يجب تحديث bookmarkCount في الوظيفة', async () => {
      // إضافة للمفضلة
      await bookmarkService.toggleBookmark(testUserId, testJobId);
      
      let job = await JobPosting.findById(testJobId);
      expect(job.bookmarkCount).toBe(1);
      
      // إزالة من المفضلة
      await bookmarkService.toggleBookmark(testUserId, testJobId);
      
      job = await JobPosting.findById(testJobId);
      expect(job.bookmarkCount).toBe(0);
    });

    test('4. يجب منع تكرار الحفظ لنفس المستخدم والوظيفة', async () => {
      // إضافة للمفضلة
      await bookmarkService.toggleBookmark(testUserId, testJobId);
      
      // محاولة إضافة مرة أخرى (يجب أن تزيل)
      const result = await bookmarkService.toggleBookmark(testUserId, testJobId);
      
      expect(result.bookmarked).toBe(false);
      
      // التحقق من عدم وجود تكرار
      const count = await JobBookmark.countDocuments({ userId: testUserId, jobId: testJobId });
      expect(count).toBe(0);
    });

    test('5. يجب جلب الوظائف المحفوظة بنجاح', async () => {
      // إضافة وظيفة للمفضلة
      await bookmarkService.toggleBookmark(testUserId, testJobId);
      
      const jobs = await bookmarkService.getBookmarkedJobs(testUserId);
      
      expect(jobs).toBeDefined();
      expect(jobs.length).toBe(1);
      expect(jobs[0]._id.toString()).toBe(testJobId.toString());
    });

    test('6. يجب التحقق من حالة الحفظ بشكل صحيح', async () => {
      // قبل الحفظ
      let isBookmarked = await bookmarkService.isBookmarked(testUserId, testJobId);
      expect(isBookmarked).toBe(false);
      
      // بعد الحفظ
      await bookmarkService.toggleBookmark(testUserId, testJobId);
      isBookmarked = await bookmarkService.isBookmarked(testUserId, testJobId);
      expect(isBookmarked).toBe(true);
    });

    test('7. يجب تحديث ملاحظات الوظيفة المحفوظة', async () => {
      // إضافة للمفضلة
      await bookmarkService.toggleBookmark(testUserId, testJobId);
      
      // تحديث الملاحظات
      const updates = {
        notes: 'وظيفة مهمة جداً',
        tags: ['urgent', 'high-priority']
      };
      
      const bookmark = await bookmarkService.updateBookmark(testUserId, testJobId, updates);
      
      expect(bookmark.notes).toBe(updates.notes);
      expect(bookmark.tags).toEqual(updates.tags);
    });

    test('8. يجب رفض تحديث وظيفة غير محفوظة', async () => {
      await expect(
        bookmarkService.updateBookmark(testUserId, testJobId, { notes: 'test' })
      ).rejects.toThrow('غير محفوظة');
    });
  });

  // ==================== Share System Tests ====================
  
  describe('Share System', () => {
    
    test('9. يجب تسجيل مشاركة وظيفة بنجاح', async () => {
      const shareData = {
        jobId: testJobId,
        userId: testUserId,
        platform: 'linkedin',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent'
      };
      
      const result = await shareTrackingService.trackShare(shareData);
      
      expect(result.success).toBe(true);
      expect(result.share).toBeDefined();
      expect(result.share.platform).toBe('linkedin');
      expect(result.newShareCount).toBe(1);
      
      // التحقق من قاعدة البيانات
      const share = await JobShare.findOne({ userId: testUserId, jobId: testJobId });
      expect(share).toBeDefined();
      expect(share.platform).toBe('linkedin');
    });

    test('10. يجب تحديث shareCount في الوظيفة', async () => {
      const shareData = {
        jobId: testJobId,
        userId: testUserId,
        platform: 'twitter',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent'
      };
      
      await shareTrackingService.trackShare(shareData);
      
      const job = await JobPosting.findById(testJobId);
      expect(job.shareCount).toBe(1);
    });

    test('11. يجب دعم جميع منصات المشاركة', async () => {
      const platforms = ['whatsapp', 'linkedin', 'twitter', 'facebook', 'copy'];
      
      for (const platform of platforms) {
        const shareData = {
          jobId: testJobId,
          userId: testUserId,
          platform,
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent'
        };
        
        const result = await shareTrackingService.trackShare(shareData);
        expect(result.success).toBe(true);
      }
      
      // التحقق من عدد المشاركات
      const count = await JobShare.countDocuments({ jobId: testJobId });
      expect(count).toBe(platforms.length);
    });

    test('12. يجب منع spam (أكثر من 10 مشاركات في اليوم)', async () => {
      // إنشاء 10 مشاركات
      for (let i = 0; i < 10; i++) {
        await shareTrackingService.trackShare({
          jobId: testJobId,
          userId: testUserId,
          platform: 'linkedin',
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent'
        });
      }
      
      // المحاولة الـ 11
      const result = await shareTrackingService.trackShare({
        jobId: testJobId,
        userId: testUserId,
        platform: 'linkedin',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent'
      });
      
      expect(result.success).toBe(false);
      expect(result.spam).toBe(true);
      expect(result.error).toContain('limit exceeded');
    });

    test('13. يجب جلب إحصائيات المشاركة للوظيفة', async () => {
      // إنشاء بعض المشاركات
      await shareTrackingService.trackShare({
        jobId: testJobId,
        userId: testUserId,
        platform: 'linkedin',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent'
      });
      
      await shareTrackingService.trackShare({
        jobId: testJobId,
        userId: testUserId,
        platform: 'twitter',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent'
      });
      
      const result = await shareTrackingService.getJobShareStats(testJobId);
      
      expect(result.success).toBe(true);
      expect(result.stats.totalShares).toBe(2);
      expect(result.stats.sharesByPlatform).toBeDefined();
    });

    test('14. يجب رفض مشاركة لوظيفة غير موجودة', async () => {
      const fakeJobId = new mongoose.Types.ObjectId();
      
      const result = await shareTrackingService.trackShare({
        jobId: fakeJobId,
        userId: testUserId,
        platform: 'linkedin',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  // ==================== Integration Tests ====================
  
  describe('Bookmark & Share Integration', () => {
    
    test('15. يجب أن يعمل الحفظ والمشاركة معاً بدون تعارض', async () => {
      // حفظ الوظيفة
      const bookmarkResult = await bookmarkService.toggleBookmark(testUserId, testJobId);
      expect(bookmarkResult.bookmarked).toBe(true);
      
      // مشاركة الوظيفة
      const shareResult = await shareTrackingService.trackShare({
        jobId: testJobId,
        userId: testUserId,
        platform: 'linkedin',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent'
      });
      expect(shareResult.success).toBe(true);
      
      // التحقق من الوظيفة
      const job = await JobPosting.findById(testJobId);
      expect(job.bookmarkCount).toBe(1);
      expect(job.shareCount).toBe(1);
    });

    test('16. يجب أن تكون العدادات دقيقة', async () => {
      const user2Id = new mongoose.Types.ObjectId();
      const user3Id = new mongoose.Types.ObjectId();
      
      // 3 مستخدمين يحفظون الوظيفة
      await bookmarkService.toggleBookmark(testUserId, testJobId);
      await bookmarkService.toggleBookmark(user2Id, testJobId);
      await bookmarkService.toggleBookmark(user3Id, testJobId);
      
      // 2 مستخدمين يشاركون الوظيفة
      await shareTrackingService.trackShare({
        jobId: testJobId,
        userId: testUserId,
        platform: 'linkedin',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent'
      });
      
      await shareTrackingService.trackShare({
        jobId: testJobId,
        userId: user2Id,
        platform: 'twitter',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent'
      });
      
      // التحقق من العدادات
      const job = await JobPosting.findById(testJobId);
      expect(job.bookmarkCount).toBe(3);
      expect(job.shareCount).toBe(2);
      
      // التحقق من قاعدة البيانات
      const bookmarkCount = await JobBookmark.countDocuments({ jobId: testJobId });
      const shareCount = await JobShare.countDocuments({ jobId: testJobId });
      
      expect(bookmarkCount).toBe(3);
      expect(shareCount).toBe(2);
    });

    test('17. يجب أن تعمل جميع العمليات بدون أخطاء', async () => {
      // سيناريو كامل
      
      // 1. حفظ الوظيفة
      await bookmarkService.toggleBookmark(testUserId, testJobId);
      
      // 2. تحديث الملاحظات
      await bookmarkService.updateBookmark(testUserId, testJobId, {
        notes: 'وظيفة ممتازة',
        tags: ['important']
      });
      
      // 3. مشاركة الوظيفة
      await shareTrackingService.trackShare({
        jobId: testJobId,
        userId: testUserId,
        platform: 'linkedin',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent'
      });
      
      // 4. التحقق من الحالة
      const isBookmarked = await bookmarkService.isBookmarked(testUserId, testJobId);
      expect(isBookmarked).toBe(true);
      
      // 5. جلب الإحصائيات
      const shareStats = await shareTrackingService.getJobShareStats(testJobId);
      expect(shareStats.success).toBe(true);
      
      // 6. إزالة من المفضلة
      await bookmarkService.toggleBookmark(testUserId, testJobId);
      
      // 7. التحقق النهائي
      const job = await JobPosting.findById(testJobId);
      expect(job.bookmarkCount).toBe(0);
      expect(job.shareCount).toBe(1);
    });
  });

  // ==================== Error Handling Tests ====================
  
  describe('Error Handling', () => {
    
    test('18. يجب معالجة وظيفة غير موجودة في الحفظ', async () => {
      const fakeJobId = new mongoose.Types.ObjectId();
      
      await expect(
        bookmarkService.toggleBookmark(testUserId, fakeJobId)
      ).rejects.toThrow('غير موجودة');
    });

    test('19. يجب معالجة معرف غير صالح في المشاركة', async () => {
      const result = await shareTrackingService.getJobShareStats('invalid-id');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid');
    });

    test('20. يجب معالجة منصة غير مدعومة', async () => {
      const result = await shareTrackingService.trackShare({
        jobId: testJobId,
        userId: testUserId,
        platform: 'invalid-platform',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent'
      });
      
      // يجب أن يفشل في التحقق من الصحة
      expect(result.success).toBe(false);
    });
  });
});
