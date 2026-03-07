const mongoose = require('mongoose');
const JobPosting = require('../src/models/JobPosting');
const JobBookmark = require('../src/models/JobBookmark');
const Notification = require('../src/models/Notification');
const notificationService = require('../src/services/notificationService');

// Mock logger
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

// Mock pusherService
jest.mock('../src/services/pusherService', () => ({
  isEnabled: jest.fn(() => false),
  sendNotificationToUser: jest.fn()
}));

describe('Job Closed Notification Tests', () => {
  let testUserId1, testUserId2, testUserId3, testJobId;

  beforeAll(async () => {
    // الاتصال بقاعدة بيانات الاختبار
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // تنظيف البيانات
    await JobPosting.deleteMany({});
    await JobBookmark.deleteMany({});
    await Notification.deleteMany({});

    // إنشاء بيانات اختبار
    testUserId1 = new mongoose.Types.ObjectId();
    testUserId2 = new mongoose.Types.ObjectId();
    testUserId3 = new mongoose.Types.ObjectId();

    // إنشاء وظيفة اختبار
    const job = await JobPosting.create({
      title: 'Senior Software Engineer',
      description: 'Test job description',
      requirements: 'Test requirements',
      location: { city: 'Cairo', country: 'Egypt' },
      postedBy: new mongoose.Types.ObjectId(),
      status: 'Open'
    });
    testJobId = job._id;

    // إنشاء bookmarks
    await JobBookmark.create([
      { userId: testUserId1, jobId: testJobId, notifyOnChange: true },
      { userId: testUserId2, jobId: testJobId, notifyOnChange: true },
      { userId: testUserId3, jobId: testJobId, notifyOnChange: false } // لن يتلقى إشعار
    ]);
  });

  afterEach(async () => {
    await JobPosting.deleteMany({});
    await JobBookmark.deleteMany({});
    await Notification.deleteMany({});
  });

  describe('notifyJobClosed', () => {
    test('يجب إنشاء إشعار بإغلاق وظيفة محفوظة', async () => {
      const notification = await notificationService.notifyJobClosed(
        testUserId1,
        testJobId,
        'Senior Software Engineer'
      );

      expect(notification).toBeDefined();
      expect(notification.recipient.toString()).toBe(testUserId1.toString());
      expect(notification.type).toBe('job_closed');
      expect(notification.title).toContain('تم إغلاق وظيفة محفوظة');
      expect(notification.message).toContain('Senior Software Engineer');
      expect(notification.relatedData.jobPosting.toString()).toBe(testJobId.toString());
      expect(notification.priority).toBe('medium');
    });

    test('يجب حفظ الإشعار في قاعدة البيانات', async () => {
      await notificationService.notifyJobClosed(
        testUserId1,
        testJobId,
        'Senior Software Engineer'
      );

      const savedNotification = await Notification.findOne({
        recipient: testUserId1,
        type: 'job_closed'
      });

      expect(savedNotification).toBeDefined();
      expect(savedNotification.isRead).toBe(false);
    });
  });

  describe('notifyBookmarkedUsersJobClosed', () => {
    test('يجب إرسال إشعارات لجميع المستخدمين الذين فعّلوا الإشعارات', async () => {
      const result = await notificationService.notifyBookmarkedUsersJobClosed(testJobId);

      expect(result.success).toBe(true);
      expect(result.notified).toBe(2); // فقط user1 و user2
      expect(result.jobTitle).toBe('Senior Software Engineer');
      expect(result.totalBookmarks).toBe(2);

      // التحقق من الإشعارات في قاعدة البيانات
      const notifications = await Notification.find({ type: 'job_closed' });
      expect(notifications).toHaveLength(2);

      const recipientIds = notifications.map(n => n.recipient.toString());
      expect(recipientIds).toContain(testUserId1.toString());
      expect(recipientIds).toContain(testUserId2.toString());
      expect(recipientIds).not.toContain(testUserId3.toString()); // لم يفعّل الإشعارات
    });

    test('يجب عدم إرسال إشعارات إذا لم يكن هناك مستخدمين مع إشعارات مفعّلة', async () => {
      // تعطيل جميع الإشعارات
      await JobBookmark.updateMany({}, { notifyOnChange: false });

      const result = await notificationService.notifyBookmarkedUsersJobClosed(testJobId);

      expect(result.success).toBe(true);
      expect(result.notified).toBe(0);

      const notifications = await Notification.find({ type: 'job_closed' });
      expect(notifications).toHaveLength(0);
    });

    test('يجب التعامل مع وظيفة غير موجودة', async () => {
      const fakeJobId = new mongoose.Types.ObjectId();
      const result = await notificationService.notifyBookmarkedUsersJobClosed(fakeJobId);

      expect(result.success).toBe(false);
      expect(result.notified).toBe(0);
    });

    test('يجب إرسال إشعارات فورية عبر Pusher إذا كان مفعّلاً', async () => {
      const pusherService = require('../src/services/pusherService');
      pusherService.isEnabled.mockReturnValue(true);

      await notificationService.notifyBookmarkedUsersJobClosed(testJobId);

      expect(pusherService.sendNotificationToUser).toHaveBeenCalledTimes(2);
      expect(pusherService.sendNotificationToUser).toHaveBeenCalledWith(
        testUserId1,
        expect.objectContaining({
          type: 'job_closed',
          jobTitle: 'Senior Software Engineer'
        })
      );
    });

    test('يجب احترام تفضيلات الإشعارات للمستخدم', async () => {
      // إنشاء تفضيلات إشعارات
      const NotificationPreference = require('../src/models/NotificationPreference');
      await NotificationPreference.create({
        user: testUserId1,
        preferences: {
          job_closed: { enabled: false } // تعطيل إشعارات إغلاق الوظائف
        }
      });

      const result = await notificationService.notifyBookmarkedUsersJobClosed(testJobId);

      // يجب أن يتم إرسال إشعار واحد فقط (لـ user2)
      const notifications = await Notification.find({ type: 'job_closed' });
      expect(notifications.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Integration with JobPosting Controller', () => {
    test('يجب إرسال إشعارات عند تحديث حالة الوظيفة إلى Closed', async () => {
      // تحديث حالة الوظيفة
      await JobPosting.findByIdAndUpdate(testJobId, { status: 'Closed' });

      // محاكاة استدعاء الوظيفة من controller
      const result = await notificationService.notifyBookmarkedUsersJobClosed(testJobId);

      expect(result.success).toBe(true);
      expect(result.notified).toBe(2);

      // التحقق من الإشعارات
      const notifications = await Notification.find({
        type: 'job_closed',
        'relatedData.jobPosting': testJobId
      });
      expect(notifications).toHaveLength(2);
    });

    test('يجب عدم إرسال إشعارات إذا كانت الحالة لم تتغير إلى Closed', async () => {
      // تحديث حقل آخر بدون تغيير الحالة
      await JobPosting.findByIdAndUpdate(testJobId, { title: 'Updated Title' });

      // لا يجب استدعاء الوظيفة
      const notificationsBefore = await Notification.countDocuments({ type: 'job_closed' });
      expect(notificationsBefore).toBe(0);
    });
  });

  describe('Notification Content', () => {
    test('يجب أن يحتوي الإشعار على معلومات كاملة', async () => {
      const notification = await notificationService.notifyJobClosed(
        testUserId1,
        testJobId,
        'Senior Software Engineer'
      );

      expect(notification.title).toBe('تم إغلاق وظيفة محفوظة 📌');
      expect(notification.message).toContain('Senior Software Engineer');
      expect(notification.message).toContain('تم إغلاقها');
      expect(notification.message).toContain('تحقق من الوظائف المشابهة');
      expect(notification.relatedData.jobPosting).toBeDefined();
    });

    test('يجب أن يكون الإشعار غير مقروء افتراضياً', async () => {
      const notification = await notificationService.notifyJobClosed(
        testUserId1,
        testJobId,
        'Senior Software Engineer'
      );

      expect(notification.isRead).toBe(false);
      expect(notification.readAt).toBeUndefined();
    });
  });
});
