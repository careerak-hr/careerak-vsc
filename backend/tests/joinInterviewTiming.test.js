const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const VideoInterview = require('../src/models/VideoInterview');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');

/**
 * اختبارات توقيت الانضمام للمقابلة
 * 
 * Requirements: 5.5
 * Property: 7 (Scheduled Interview Access)
 * 
 * يختبر أن المستخدمين يمكنهم الانضمام فقط خلال 5 دقائق قبل الموعد
 */

describe('Join Interview Timing Tests', () => {
  let token;
  let userId;
  let hostId;

  beforeAll(async () => {
    // الاتصال بقاعدة البيانات للاختبار
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test');

    // إنشاء مستخدم للاختبار
    const user = await User.create({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'jobseeker',
    });
    userId = user._id;

    // إنشاء مضيف للاختبار
    const host = await User.create({
      name: 'Test Host',
      email: 'testhost@example.com',
      password: 'password123',
      role: 'company',
    });
    hostId = host._id;

    // توليد token
    token = jwt.sign({ userId: userId }, process.env.JWT_SECRET || 'test_secret');
  });

  afterAll(async () => {
    // تنظيف قاعدة البيانات
    await VideoInterview.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // تنظيف المقابلات بعد كل اختبار
    await VideoInterview.deleteMany({});
  });

  /**
   * اختبار 1: لا يمكن الانضمام قبل 5 دقائق من الموعد
   */
  test('Cannot join more than 5 minutes before scheduled time', async () => {
    // إنشاء مقابلة مجدولة بعد ساعة
    const scheduledAt = new Date(Date.now() + 60 * 60 * 1000); // بعد ساعة

    const interview = await VideoInterview.create({
      roomId: 'test-room-1',
      hostId,
      participants: [
        { userId: hostId, role: 'host' },
        { userId, role: 'participant' },
      ],
      scheduledAt,
      status: 'scheduled',
    });

    const response = await request(app)
      .get(`/api/interviews/${interview._id}/can-join`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.canJoin).toBe(false);
    expect(response.body.status).toBe('waiting');
    expect(response.body.timeUntilStart).toBeGreaterThan(5);
  });

  /**
   * اختبار 2: يمكن الانضمام خلال 5 دقائق قبل الموعد
   */
  test('Can join within 5 minutes before scheduled time', async () => {
    // إنشاء مقابلة مجدولة بعد 3 دقائق
    const scheduledAt = new Date(Date.now() + 3 * 60 * 1000); // بعد 3 دقائق

    const interview = await VideoInterview.create({
      roomId: 'test-room-2',
      hostId,
      participants: [
        { userId: hostId, role: 'host' },
        { userId, role: 'participant' },
      ],
      scheduledAt,
      status: 'scheduled',
    });

    const response = await request(app)
      .get(`/api/interviews/${interview._id}/can-join`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.canJoin).toBe(true);
    expect(response.body.status).toBe('ready');
    expect(response.body.timeUntilStart).toBeLessThanOrEqual(5);
    expect(response.body.timeUntilStart).toBeGreaterThan(0);
  });

  /**
   * اختبار 3: يمكن الانضمام بعد بدء المقابلة (حتى ساعة)
   */
  test('Can join after interview started (within 1 hour)', async () => {
    // إنشاء مقابلة بدأت قبل 10 دقائق
    const scheduledAt = new Date(Date.now() - 10 * 60 * 1000); // قبل 10 دقائق

    const interview = await VideoInterview.create({
      roomId: 'test-room-3',
      hostId,
      participants: [
        { userId: hostId, role: 'host' },
        { userId, role: 'participant' },
      ],
      scheduledAt,
      status: 'active',
    });

    const response = await request(app)
      .get(`/api/interviews/${interview._id}/can-join`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.canJoin).toBe(true);
    expect(response.body.status).toBe('active');
    expect(response.body.timeUntilStart).toBeLessThan(0);
    expect(response.body.timeUntilStart).toBeGreaterThanOrEqual(-60);
  });

  /**
   * اختبار 4: لا يمكن الانضمام بعد انتهاء المقابلة (أكثر من ساعة)
   */
  test('Cannot join after interview ended (more than 1 hour)', async () => {
    // إنشاء مقابلة بدأت قبل ساعتين
    const scheduledAt = new Date(Date.now() - 2 * 60 * 60 * 1000); // قبل ساعتين

    const interview = await VideoInterview.create({
      roomId: 'test-room-4',
      hostId,
      participants: [
        { userId: hostId, role: 'host' },
        { userId, role: 'participant' },
      ],
      scheduledAt,
      status: 'ended',
    });

    const response = await request(app)
      .get(`/api/interviews/${interview._id}/can-join`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.canJoin).toBe(false);
    expect(response.body.status).toBe('ended');
    expect(response.body.timeUntilStart).toBeLessThan(-60);
  });

  /**
   * اختبار 5: يمكن الانضمام مباشرة إذا لم تكن مجدولة
   */
  test('Can join immediately if not scheduled', async () => {
    // إنشاء مقابلة غير مجدولة
    const interview = await VideoInterview.create({
      roomId: 'test-room-5',
      hostId,
      participants: [
        { userId: hostId, role: 'host' },
        { userId, role: 'participant' },
      ],
      scheduledAt: null,
      status: 'waiting',
    });

    const response = await request(app)
      .get(`/api/interviews/${interview._id}/can-join`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.canJoin).toBe(true);
    expect(response.body.status).toBe('ready');
    expect(response.body.timeUntilStart).toBe(0);
  });

  /**
   * اختبار 6: رفض الوصول لمستخدم غير مشارك
   */
  test('Deny access to non-participant', async () => {
    // إنشاء مستخدم آخر
    const otherUser = await User.create({
      name: 'Other User',
      email: 'otheruser@example.com',
      password: 'password123',
      role: 'jobseeker',
    });

    const otherToken = jwt.sign({ userId: otherUser._id }, process.env.JWT_SECRET || 'test_secret');

    // إنشاء مقابلة
    const interview = await VideoInterview.create({
      roomId: 'test-room-6',
      hostId,
      participants: [
        { userId: hostId, role: 'host' },
        { userId, role: 'participant' },
      ],
      scheduledAt: new Date(Date.now() + 10 * 60 * 1000),
      status: 'scheduled',
    });

    const response = await request(app)
      .get(`/api/interviews/${interview._id}/can-join`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('صلاحية');

    // تنظيف
    await User.findByIdAndDelete(otherUser._id);
  });

  /**
   * اختبار 7: رسائل متعددة اللغات
   */
  test('Returns messages in multiple languages', async () => {
    // إنشاء مقابلة مجدولة بعد ساعة
    const scheduledAt = new Date(Date.now() + 60 * 60 * 1000);

    const interview = await VideoInterview.create({
      roomId: 'test-room-7',
      hostId,
      participants: [
        { userId: hostId, role: 'host' },
        { userId, role: 'participant' },
      ],
      scheduledAt,
      status: 'scheduled',
    });

    const response = await request(app)
      .get(`/api/interviews/${interview._id}/can-join`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toHaveProperty('ar');
    expect(response.body.message).toHaveProperty('en');
    expect(response.body.message).toHaveProperty('fr');
    expect(response.body.message.ar).toBeTruthy();
    expect(response.body.message.en).toBeTruthy();
    expect(response.body.message.fr).toBeTruthy();
  });

  /**
   * اختبار 8: الحد الفاصل الدقيق (5 دقائق بالضبط)
   */
  test('Exact 5-minute boundary', async () => {
    // إنشاء مقابلة مجدولة بعد 5 دقائق بالضبط
    const scheduledAt = new Date(Date.now() + 5 * 60 * 1000);

    const interview = await VideoInterview.create({
      roomId: 'test-room-8',
      hostId,
      participants: [
        { userId: hostId, role: 'host' },
        { userId, role: 'participant' },
      ],
      scheduledAt,
      status: 'scheduled',
    });

    const response = await request(app)
      .get(`/api/interviews/${interview._id}/can-join`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.canJoin).toBe(true);
    expect(response.body.timeUntilStart).toBeLessThanOrEqual(5);
  });
});
