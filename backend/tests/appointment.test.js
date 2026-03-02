const request = require('supertest');
const app = require('../src/app');
const Appointment = require('../src/models/Appointment');
const VideoInterview = require('../src/models/VideoInterview');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');

/**
 * اختبارات نظام جدولة المواعيد
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

describe('Appointment Scheduling System', () => {
  let token;
  let userId;
  let participantId;

  beforeAll(async () => {
    // إنشاء مستخدم للاختبار
    const user = await User.create({
      name: 'Test Organizer',
      email: 'organizer@test.com',
      password: 'password123',
      role: 'company',
    });
    userId = user._id;

    // إنشاء مشارك
    const participant = await User.create({
      name: 'Test Participant',
      email: 'participant@test.com',
      password: 'password123',
      role: 'jobseeker',
    });
    participantId = participant._id;

    // توليد token
    token = jwt.sign({ _id: userId }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    // تنظيف البيانات
    await Appointment.deleteMany({});
    await VideoInterview.deleteMany({});
    await User.deleteMany({});
  });

  describe('POST /api/appointments', () => {
    it('يجب أن ينشئ موعد جديد بنجاح', async () => {
      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // غداً

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'video_interview',
          title: 'مقابلة توظيف',
          description: 'مقابلة لوظيفة مطور',
          participants: [participantId],
          scheduledAt,
          duration: 60,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.appointment).toHaveProperty('id');
      expect(response.body.appointment).toHaveProperty('meetingLink');
      expect(response.body.appointment.status).toBe('scheduled');
    });

    it('يجب أن يرفض جدولة موعد في الماضي', async () => {
      const scheduledAt = new Date(Date.now() - 24 * 60 * 60 * 1000); // أمس

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'video_interview',
          title: 'مقابلة توظيف',
          participants: [participantId],
          scheduledAt,
          duration: 60,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('الماضي');
    });

    it('يجب أن ينشئ VideoInterview تلقائياً للمقابلات الفيديو', async () => {
      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'video_interview',
          title: 'مقابلة فيديو',
          participants: [participantId],
          scheduledAt,
          duration: 60,
        });

      expect(response.status).toBe(201);
      expect(response.body.appointment.meetingLink).toBeTruthy();

      // التحقق من إنشاء VideoInterview
      const appointment = await Appointment.findById(response.body.appointment.id);
      expect(appointment.videoInterviewId).toBeTruthy();

      const videoInterview = await VideoInterview.findById(appointment.videoInterviewId);
      expect(videoInterview).toBeTruthy();
      expect(videoInterview.scheduledAt).toEqual(appointment.scheduledAt);
    });
  });

  describe('GET /api/appointments', () => {
    it('يجب أن يجلب قائمة المواعيد للمستخدم', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.appointments)).toBe(true);
      expect(response.body.pagination).toBeTruthy();
    });

    it('يجب أن يفلتر المواعيد القادمة', async () => {
      const response = await request(app)
        .get('/api/appointments?upcoming=true')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // جميع المواعيد يجب أن تكون في المستقبل
      response.body.appointments.forEach(appointment => {
        expect(new Date(appointment.scheduledAt) >= new Date()).toBe(true);
      });
    });
  });

  describe('GET /api/appointments/:id', () => {
    let appointmentId;

    beforeAll(async () => {
      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      const appointment = await Appointment.create({
        type: 'video_interview',
        title: 'Test Appointment',
        organizerId: userId,
        participants: [{ userId: participantId, status: 'pending' }],
        scheduledAt,
        duration: 60,
      });
      
      appointmentId = appointment._id;
    });

    it('يجب أن يجلب تفاصيل موعد محدد', async () => {
      const response = await request(app)
        .get(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.appointment._id).toBe(appointmentId.toString());
      expect(response.body).toHaveProperty('canJoin');
    });

    it('يجب أن يرفض الوصول لموعد غير مصرح به', async () => {
      // إنشاء مستخدم آخر
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@test.com',
        password: 'password123',
      });
      
      const otherToken = jwt.sign({ _id: otherUser._id }, process.env.JWT_SECRET);

      const response = await request(app)
        .get(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);

      await User.findByIdAndDelete(otherUser._id);
    });
  });

  describe('PUT /api/appointments/:id/reschedule', () => {
    let appointmentId;

    beforeEach(async () => {
      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      const appointment = await Appointment.create({
        type: 'video_interview',
        title: 'Test Appointment',
        organizerId: userId,
        participants: [{ userId: participantId, status: 'accepted' }],
        scheduledAt,
        duration: 60,
      });
      
      appointmentId = appointment._id;
    });

    it('يجب أن يعيد جدولة موعد بنجاح', async () => {
      const newScheduledAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // بعد يومين

      const response = await request(app)
        .put(`/api/appointments/${appointmentId}/reschedule`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          scheduledAt: newScheduledAt,
          duration: 90,
          reason: 'تغيير في الجدول',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.appointment.id).not.toBe(appointmentId.toString());

      // التحقق من تحديث الموعد القديم
      const oldAppointment = await Appointment.findById(appointmentId);
      expect(oldAppointment.status).toBe('rescheduled');
      expect(oldAppointment.rescheduledToId).toBeTruthy();
    });

    it('يجب أن يرفض إعادة الجدولة من غير المنظم', async () => {
      const participantToken = jwt.sign({ _id: participantId }, process.env.JWT_SECRET);
      const newScheduledAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

      const response = await request(app)
        .put(`/api/appointments/${appointmentId}/reschedule`)
        .set('Authorization', `Bearer ${participantToken}`)
        .send({
          scheduledAt: newScheduledAt,
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/appointments/:id', () => {
    let appointmentId;

    beforeEach(async () => {
      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      const appointment = await Appointment.create({
        type: 'video_interview',
        title: 'Test Appointment',
        organizerId: userId,
        participants: [{ userId: participantId, status: 'accepted' }],
        scheduledAt,
        duration: 60,
      });
      
      appointmentId = appointment._id;
    });

    it('يجب أن يلغي موعد بنجاح', async () => {
      const response = await request(app)
        .delete(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          reason: 'ظروف طارئة',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // التحقق من تحديث الحالة
      const appointment = await Appointment.findById(appointmentId);
      expect(appointment.status).toBe('cancelled');
      expect(appointment.cancellationReason).toBe('ظروف طارئة');
    });
  });

  describe('Appointment.canJoin()', () => {
    it('يجب أن يسمح بالانضمام قبل 5 دقائق من الموعد', async () => {
      const scheduledAt = new Date(Date.now() + 4 * 60 * 1000); // بعد 4 دقائق
      
      const appointment = await Appointment.create({
        type: 'video_interview',
        title: 'Test Appointment',
        organizerId: userId,
        participants: [{ userId: participantId }],
        scheduledAt,
        duration: 60,
      });

      expect(appointment.canJoin()).toBe(true);
    });

    it('يجب أن يمنع الانضمام قبل أكثر من 5 دقائق', async () => {
      const scheduledAt = new Date(Date.now() + 10 * 60 * 1000); // بعد 10 دقائق
      
      const appointment = await Appointment.create({
        type: 'video_interview',
        title: 'Test Appointment',
        organizerId: userId,
        participants: [{ userId: participantId }],
        scheduledAt,
        duration: 60,
      });

      expect(appointment.canJoin()).toBe(false);
    });

    it('يجب أن يمنع الانضمام بعد انتهاء الموعد', async () => {
      const scheduledAt = new Date(Date.now() - 70 * 60 * 1000); // قبل 70 دقيقة
      
      const appointment = await Appointment.create({
        type: 'video_interview',
        title: 'Test Appointment',
        organizerId: userId,
        participants: [{ userId: participantId }],
        scheduledAt,
        duration: 60,
      });

      expect(appointment.canJoin()).toBe(false);
    });
  });
});
