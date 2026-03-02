/**
 * اختبارات إعادة جدولة مقابلات الفيديو
 * 
 * Requirements: 5.4, 5.6
 */

const request = require('supertest');
const app = require('../src/app');
const VideoInterview = require('../src/models/VideoInterview');
const Appointment = require('../src/models/Appointment');
const User = require('../src/models/User');
const { generateToken } = require('../src/utils/jwt');

describe('Video Interview Reschedule', () => {
  let hostToken, participantToken, otherUserToken;
  let hostId, participantId, otherUserId;
  let interviewId, appointmentId;

  beforeAll(async () => {
    // إنشاء مستخدمين للاختبار
    const host = await User.create({
      firstName: 'أحمد',
      lastName: 'محمد',
      email: 'host@test.com',
      password: 'password123',
      role: 'company',
    });
    hostId = host._id;
    hostToken = generateToken(host);

    const participant = await User.create({
      firstName: 'سارة',
      lastName: 'علي',
      email: 'participant@test.com',
      password: 'password123',
      role: 'job_seeker',
    });
    participantId = participant._id;
    participantToken = generateToken(participant);

    const otherUser = await User.create({
      firstName: 'محمد',
      lastName: 'خالد',
      email: 'other@test.com',
      password: 'password123',
      role: 'job_seeker',
    });
    otherUserId = otherUser._id;
    otherUserToken = generateToken(otherUser);

    // إنشاء موعد
    const appointment = await Appointment.create({
      type: 'video_interview',
      title: 'مقابلة توظيف',
      organizerId: hostId,
      participants: [{ userId: participantId }],
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // غداً
      duration: 60,
    });
    appointmentId = appointment._id;

    // إنشاء مقابلة فيديو
    const interview = await VideoInterview.create({
      roomId: 'test-room-123',
      hostId: hostId,
      appointmentId: appointmentId,
      participants: [
        { userId: hostId, role: 'host' },
        { userId: participantId, role: 'participant' },
      ],
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // غداً
      status: 'scheduled',
    });
    interviewId = interview._id;
  });

  afterAll(async () => {
    // تنظيف البيانات
    await VideoInterview.deleteMany({});
    await Appointment.deleteMany({});
    await User.deleteMany({});
  });

  describe('PUT /api/interviews/:id/reschedule', () => {
    test('يجب أن ينجح إعادة الجدولة من المضيف', async () => {
      const newDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // بعد يومين

      const response = await request(app)
        .put(`/api/interviews/${interviewId}/reschedule`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          newScheduledAt: newDate.toISOString(),
          reason: 'ظرف طارئ',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.interview.status).toBe('rescheduled');
      expect(new Date(response.body.interview.newScheduledAt).getTime()).toBe(newDate.getTime());

      // التحقق من تحديث قاعدة البيانات
      const updatedInterview = await VideoInterview.findById(interviewId);
      expect(updatedInterview.status).toBe('rescheduled');
      expect(updatedInterview.scheduledAt.getTime()).toBe(newDate.getTime());
    });

    test('يجب أن ينجح إعادة الجدولة من المشارك', async () => {
      const newDate = new Date(Date.now() + 72 * 60 * 60 * 1000); // بعد 3 أيام

      const response = await request(app)
        .put(`/api/interviews/${interviewId}/reschedule`)
        .set('Authorization', `Bearer ${participantToken}`)
        .send({
          newScheduledAt: newDate.toISOString(),
          reason: 'لدي موعد آخر',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('يجب أن يفشل إعادة الجدولة بدون موعد جديد', async () => {
      const response = await request(app)
        .put(`/api/interviews/${interviewId}/reschedule`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          reason: 'ظرف طارئ',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('يجب تحديد الموعد الجديد');
    });

    test('يجب أن يفشل إعادة الجدولة بموعد في الماضي', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // أمس

      const response = await request(app)
        .put(`/api/interviews/${interviewId}/reschedule`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          newScheduledAt: pastDate.toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('يجب أن يكون الموعد الجديد في المستقبل');
    });

    test('يجب أن يفشل إعادة الجدولة من مستخدم غير مشارك', async () => {
      const newDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

      const response = await request(app)
        .put(`/api/interviews/${interviewId}/reschedule`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          newScheduledAt: newDate.toISOString(),
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('ليس لديك صلاحية');
    });

    test('يجب أن يفشل إعادة جدولة مقابلة بدأت', async () => {
      // تغيير حالة المقابلة إلى active
      await VideoInterview.findByIdAndUpdate(interviewId, { status: 'active' });

      const newDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

      const response = await request(app)
        .put(`/api/interviews/${interviewId}/reschedule`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          newScheduledAt: newDate.toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('لا يمكن إعادة جدولة مقابلة بدأت أو انتهت');

      // إعادة الحالة إلى scheduled
      await VideoInterview.findByIdAndUpdate(interviewId, { status: 'scheduled' });
    });

    test('يجب أن يفشل إعادة جدولة مقابلة انتهت', async () => {
      // تغيير حالة المقابلة إلى ended
      await VideoInterview.findByIdAndUpdate(interviewId, { status: 'ended' });

      const newDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

      const response = await request(app)
        .put(`/api/interviews/${interviewId}/reschedule`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          newScheduledAt: newDate.toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);

      // إعادة الحالة إلى scheduled
      await VideoInterview.findByIdAndUpdate(interviewId, { status: 'scheduled' });
    });

    test('يجب أن يحدث Appointment المرتبط', async () => {
      const newDate = new Date(Date.now() + 96 * 60 * 60 * 1000); // بعد 4 أيام

      await request(app)
        .put(`/api/interviews/${interviewId}/reschedule`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          newScheduledAt: newDate.toISOString(),
        });

      // التحقق من تحديث Appointment
      const updatedAppointment = await Appointment.findById(appointmentId);
      expect(updatedAppointment.scheduledAt.getTime()).toBe(newDate.getTime());
      expect(updatedAppointment.status).toBe('rescheduled');
    });

    test('يجب أن يعمل بدون سبب (اختياري)', async () => {
      const newDate = new Date(Date.now() + 120 * 60 * 60 * 1000); // بعد 5 أيام

      const response = await request(app)
        .put(`/api/interviews/${interviewId}/reschedule`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          newScheduledAt: newDate.toISOString(),
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('يجب أن يفشل مع مقابلة غير موجودة', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const newDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

      const response = await request(app)
        .put(`/api/interviews/${fakeId}/reschedule`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          newScheduledAt: newDate.toISOString(),
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('المقابلة غير موجودة');
    });
  });
});
