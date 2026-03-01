const request = require('supertest');
const app = require('../src/app');
const { User } = require('../src/models/User');
const NotificationPreference = require('../src/models/NotificationPreference');
const QueuedNotification = require('../src/models/QueuedNotification');
const notificationService = require('../src/services/notificationService');
const jwt = require('jsonwebtoken');

describe('Notification Frequency Tests', () => {
  let token;
  let userId;

  beforeAll(async () => {
    // إنشاء مستخدم للاختبار
    const user = await User.create({
      username: 'testuser_freq',
      email: 'testfreq@example.com',
      password: 'Test123!@#',
      role: 'individual'
    });
    userId = user._id;
    token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    // تنظيف البيانات
    await User.deleteOne({ _id: userId });
    await NotificationPreference.deleteOne({ user: userId });
    await QueuedNotification.deleteMany({ recipient: userId });
  });

  describe('GET /api/notifications/frequency', () => {
    it('should get default notification frequency settings', async () => {
      const response = await request(app)
        .get('/api/notifications/frequency')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('recommendations');
      expect(response.body.data).toHaveProperty('applications');
      expect(response.body.data).toHaveProperty('system');
      expect(response.body.data.recommendations).toBe('daily');
      expect(response.body.data.applications).toBe('instant');
      expect(response.body.data.system).toBe('instant');
    });
  });

  describe('PUT /api/notifications/frequency', () => {
    it('should update notification frequency settings', async () => {
      const response = await request(app)
        .put('/api/notifications/frequency')
        .set('Authorization', `Bearer ${token}`)
        .send({
          recommendations: 'weekly',
          applications: 'daily',
          system: 'weekly'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.recommendations).toBe('weekly');
      expect(response.body.data.applications).toBe('daily');
      expect(response.body.data.system).toBe('weekly');
    });

    it('should reject invalid frequency values', async () => {
      const response = await request(app)
        .put('/api/notifications/frequency')
        .set('Authorization', `Bearer ${token}`)
        .send({
          recommendations: 'invalid_value'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject weekly for applications', async () => {
      const response = await request(app)
        .put('/api/notifications/frequency')
        .set('Authorization', `Bearer ${token}`)
        .send({
          applications: 'weekly'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Notification Service - Frequency Logic', () => {
    beforeEach(async () => {
      // إعادة تعيين التفضيلات
      await NotificationPreference.findOneAndUpdate(
        { user: userId },
        {
          'notificationFrequency.recommendations': 'instant',
          'notificationFrequency.applications': 'instant',
          'notificationFrequency.system': 'instant',
          'notificationFrequency.lastBatchSent': {
            recommendations: null,
            applications: null,
            system: null
          }
        },
        { upsert: true }
      );
      await QueuedNotification.deleteMany({ recipient: userId });
    });

    it('should send notification instantly when frequency is instant', async () => {
      const canSend = await notificationService.canSendNotification(userId, 'job_match');
      expect(canSend).toBe(true);
    });

    it('should queue notification when frequency is not instant', async () => {
      // تغيير التكرار إلى daily
      await notificationService.updateNotificationFrequency(userId, {
        recommendations: 'daily'
      });

      const notification = await notificationService.createNotificationWithFrequency({
        recipient: userId,
        type: 'job_match',
        title: 'Test Job',
        message: 'Test message'
      });

      expect(notification).toBeNull(); // لم يُرسل فوراً

      // التحقق من وجود الإشعار في قائمة الانتظار
      const queued = await QueuedNotification.findOne({
        recipient: userId,
        type: 'job_match'
      });
      expect(queued).toBeTruthy();
    });

    it('should send batch notifications correctly', async () => {
      // إضافة إشعارات مؤجلة
      await QueuedNotification.create([
        {
          recipient: userId,
          type: 'job_match',
          title: 'Job 1',
          message: 'Message 1'
        },
        {
          recipient: userId,
          type: 'job_match',
          title: 'Job 2',
          message: 'Message 2'
        },
        {
          recipient: userId,
          type: 'course_match',
          title: 'Course 1',
          message: 'Message 3'
        }
      ]);

      const result = await notificationService.sendBatchNotifications(userId, 'recommendations');
      expect(result.sent).toBe(3);

      // التحقق من حذف الإشعارات المؤجلة
      const remaining = await QueuedNotification.countDocuments({
        recipient: userId,
        type: { $in: ['job_match', 'course_match'] }
      });
      expect(remaining).toBe(0);
    });

    it('should respect hourly frequency', async () => {
      // تعيين التكرار إلى hourly
      await notificationService.updateNotificationFrequency(userId, {
        recommendations: 'hourly'
      });

      // أول إشعار يجب أن يُرسل
      let canSend = await notificationService.canSendNotification(userId, 'job_match');
      expect(canSend).toBe(true);

      // تحديث وقت آخر إرسال
      await notificationService.updateLastBatchSent(userId, 'recommendations');

      // الإشعار التالي يجب ألا يُرسل (لم تمر ساعة)
      canSend = await notificationService.canSendNotification(userId, 'job_match');
      expect(canSend).toBe(false);
    });

    it('should disable notifications when frequency is disabled', async () => {
      // تعطيل التوصيات
      await notificationService.updateNotificationFrequency(userId, {
        recommendations: 'disabled'
      });

      const canSend = await notificationService.canSendNotification(userId, 'job_match');
      expect(canSend).toBe(false);
    });
  });

  describe('POST /api/notifications/batch/send', () => {
    beforeEach(async () => {
      await QueuedNotification.deleteMany({ recipient: userId });
    });

    it('should send batch notifications manually', async () => {
      // إضافة إشعارات مؤجلة
      await QueuedNotification.create([
        {
          recipient: userId,
          type: 'job_match',
          title: 'Job 1',
          message: 'Message 1'
        }
      ]);

      const response = await request(app)
        .post('/api/notifications/batch/send')
        .set('Authorization', `Bearer ${token}`)
        .send({ category: 'recommendations' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.sent).toBe(1);
    });

    it('should return 0 when no queued notifications', async () => {
      const response = await request(app)
        .post('/api/notifications/batch/send')
        .set('Authorization', `Bearer ${token}`)
        .send({ category: 'recommendations' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.sent).toBe(0);
    });

    it('should reject invalid category', async () => {
      const response = await request(app)
        .post('/api/notifications/batch/send')
        .set('Authorization', `Bearer ${token}`)
        .send({ category: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
