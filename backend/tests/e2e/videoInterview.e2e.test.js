/**
 * اختبارات E2E لنظام الفيديو للمقابلات
 * End-to-End Tests for Video Interview System
 * 
 * تغطي السيناريوهات الكاملة من البداية للنهاية
 */

const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');
const VideoInterview = require('../../src/models/VideoInterview');
const InterviewRecording = require('../../src/models/InterviewRecording');
const WaitingRoom = require('../../src/models/WaitingRoom');
const User = require('../../src/models/User');
const jwt = require('jsonwebtoken');

describe('E2E: Video Interview Complete Scenarios', () => {
  let tokens = {};
  let users = {};

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/careerak-test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

    // إنشاء مستخدمين
    const roles = ['host', 'participant1', 'participant2', 'participant3'];
    
    for (const role of roles) {
      const user = await User.create({
        name: `${role} User`,
        email: `${role}@test.com`,
        password: 'password123',
        role: role === 'host' ? 'company' : 'individual'
      });
      
      users[role] = user;
      tokens[role] = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test-secret');
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await VideoInterview.deleteMany({});
    await InterviewRecording.deleteMany({});
    await WaitingRoom.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await VideoInterview.deleteMany({});
    await InterviewRecording.deleteMany({});
    await WaitingRoom.deleteMany({});
  });

  /**
   * السيناريو 1: مقابلة ثنائية بسيطة
   */
  describe('Scenario 1: Simple One-on-One Interview', () => {
    test('should complete a basic interview without recording', async () => {
      // 1. إنشاء مقابلة
      const createRes = await request(app)
        .post('/api/video-interviews/create')
        .set('Authorization', `Bearer ${tokens.host}`)
        .send({
          scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
          settings: {
            recordingEnabled: false,
            waitingRoomEnabled: false,
            maxParticipants: 2
          }
        });

      expect(createRes.status).toBe(201);
      const interviewId = createRes.body.interview._id;

      // 2. المشارك ينضم
      const joinRes = await request(app)
        .post(`/api/video-interviews/${interviewId}/join`)
        .set('Authorization', `Bearer ${tokens.participant1}`);

      expect(joinRes.status).toBe(200);

      // 3. بدء المقابلة
      const startRes = await request(app)
        .post(`/api/video-interviews/${interviewId}/start`)
        .set('Authorization', `Bearer ${tokens.host}`);

      expect(startRes.status).toBe(200);

      // 4. إنهاء المقابلة
      const endRes = await request(app)
        .post(`/api/video-interviews/${interviewId}/end`)
        .set('Authorization', `Bearer ${tokens.host}`);

      expect(endRes.status).toBe(200);

      // التحقق
      const interview = await VideoInterview.findById(interviewId);
      expect(interview.status).toBe('ended');
      expect(interview.participants.length).toBe(2);
    });
  });

  /**
   * السيناريو 2: مقابلة مع غرفة انتظار
   */
  describe('Scenario 2: Interview with Waiting Room', () => {
    test('should manage participants through waiting room', async () => {
      // 1. إنشاء مقابلة
      const createRes = await request(app)
        .post('/api/video-interviews/create')
        .set('Authorization', `Bearer ${tokens.host}`)
        .send({
          scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
          settings: {
            waitingRoomEnabled: true,
            maxParticipants: 5
          }
        });

      const interviewId = createRes.body.interview._id;

      // 2. إنشاء غرفة انتظار
      await request(app)
        .post('/api/waiting-room/create')
        .set('Authorization', `Bearer ${tokens.host}`)
        .send({
          interviewId,
          welcomeMessage: 'مرحباً بك! سيتم قبولك قريباً.'
        });

      // 3. مشاركان ينضمان لغرفة الانتظار
      await request(app)
        .post(`/api/waiting-room/${interviewId}/join`)
        .set('Authorization', `Bearer ${tokens.participant1}`);

      await request(app)
        .post(`/api/waiting-room/${interviewId}/join`)
        .set('Authorization', `Bearer ${tokens.participant2}`);

      // 4. المضيف يرى قائمة المنتظرين
      const listRes = await request(app)
        .get(`/api/waiting-room/${interviewId}/list`)
        .set('Authorization', `Bearer ${tokens.host}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.participants.length).toBe(2);

      // 5. قبول المشارك الأول
      await request(app)
        .post(`/api/waiting-room/${interviewId}/admit/${users.participant1._id}`)
        .set('Authorization', `Bearer ${tokens.host}`);

      // 6. رفض المشارك الثاني
      await request(app)
        .post(`/api/waiting-room/${interviewId}/reject/${users.participant2._id}`)
        .set('Authorization', `Bearer ${tokens.host}`);

      // 7. بدء المقابلة
      await request(app)
        .post(`/api/video-interviews/${interviewId}/start`)
        .set('Authorization', `Bearer ${tokens.host}`);

      // التحقق
      const interview = await VideoInterview.findById(interviewId);
      expect(interview.status).toBe('active');
      expect(interview.participants.length).toBe(2); // host + participant1
    });
  });

  /**
   * السيناريو 3: مقابلة مع تسجيل
   */
  describe('Scenario 3: Interview with Recording', () => {
    test('should record interview with consent', async () => {
      // 1. إنشاء مقابلة
      const createRes = await request(app)
        .post('/api/video-interviews/create')
        .set('Authorization', `Bearer ${tokens.host}`)
        .send({
          scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
          settings: {
            recordingEnabled: true,
            maxParticipants: 2
          }
        });

      const interviewId = createRes.body.interview._id;

      // 2. المشارك ينضم
      await request(app)
        .post(`/api/video-interviews/${interviewId}/join`)
        .set('Authorization', `Bearer ${tokens.participant1}`);

      // 3. بدء المقابلة
      await request(app)
        .post(`/api/video-interviews/${interviewId}/start`)
        .set('Authorization', `Bearer ${tokens.host}`);

      // 4. طلب موافقة على التسجيل
      await request(app)
        .post(`/api/video-interviews/${interviewId}/recording/consent`)
        .set('Authorization', `Bearer ${tokens.participant1}`)
        .send({ consented: true });

      // 5. بدء التسجيل
      const startRecRes = await request(app)
        .post(`/api/video-interviews/${interviewId}/recording/start`)
        .set('Authorization', `Bearer ${tokens.host}`);

      expect(startRecRes.status).toBe(200);
      const recordingId = startRecRes.body.recordingId;

      // 6. انتظار قصير (محاكاة المقابلة)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 7. إيقاف التسجيل
      const stopRecRes = await request(app)
        .post(`/api/video-interviews/${interviewId}/recording/stop`)
        .set('Authorization', `Bearer ${tokens.host}`);

      expect(stopRecRes.status).toBe(200);
      expect(stopRecRes.body.duration).toBeGreaterThan(0);

      // 8. إنهاء المقابلة
      await request(app)
        .post(`/api/video-interviews/${interviewId}/end`)
        .set('Authorization', `Bearer ${tokens.host}`);

      // التحقق
      const recording = await InterviewRecording.findOne({ recordingId });
      expect(recording).toBeDefined();
      expect(recording.status).toBe('processing');
      expect(recording.duration).toBeGreaterThan(0);
      expect(recording.expiresAt).toBeDefined();
    });

    test('should fail recording without consent', async () => {
      // 1. إنشاء مقابلة
      const createRes = await request(app)
        .post('/api/video-interviews/create')
        .set('Authorization', `Bearer ${tokens.host}`)
        .send({
          scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
          settings: {
            recordingEnabled: true,
            maxParticipants: 2
          }
        });

      const interviewId = createRes.body.interview._id;

      // 2. المشارك ينضم
      await request(app)
        .post(`/api/video-interviews/${interviewId}/join`)
        .set('Authorization', `Bearer ${tokens.participant1}`);

      // 3. بدء المقابلة
      await request(app)
        .post(`/api/video-interviews/${interviewId}/start`)
        .set('Authorization', `Bearer ${tokens.host}`);

      // 4. المشارك يرفض التسجيل
      await request(app)
        .post(`/api/video-interviews/${interviewId}/recording/consent`)
        .set('Authorization', `Bearer ${tokens.participant1}`)
        .send({ consented: false });

      // 5. محاولة بدء التسجيل (يجب أن تفشل)
      const startRecRes = await request(app)
        .post(`/api/video-interviews/${interviewId}/recording/start`)
        .set('Authorization', `Bearer ${tokens.host}`);

      expect(startRecRes.status).toBe(403);
      expect(startRecRes.body.error).toContain('consent');
    });
  });

  /**
   * السيناريو 4: مقابلة جماعية
   */
  describe('Scenario 4: Group Interview', () => {
    test('should handle multiple participants', async () => {
      // 1. إنشاء مقابلة
      const createRes = await request(app)
        .post('/api/video-interviews/create')
        .set('Authorization', `Bearer ${tokens.host}`)
        .send({
          scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
          settings: {
            maxParticipants: 10
          }
        });

      const interviewId = createRes.body.interview._id;

      // 2. ثلاثة مشاركين ينضمون
      const participants = ['participant1', 'participant2', 'participant3'];
      
      for (const p of participants) {
        const joinRes = await request(app)
          .post(`/api/video-interviews/${interviewId}/join`)
          .set('Authorization', `Bearer ${tokens[p]}`);

        expect(joinRes.status).toBe(200);
      }

      // 3. بدء المقابلة
      await request(app)
        .post(`/api/video-interviews/${interviewId}/start`)
        .set('Authorization', `Bearer ${tokens.host}`);

      // 4. المضيف يكتم الجميع
      const muteAllRes = await request(app)
        .post(`/api/video-interviews/${interviewId}/mute-all`)
        .set('Authorization', `Bearer ${tokens.host}`);

      expect(muteAllRes.status).toBe(200);

      // 5. المضيف يزيل مشارك
      const removeRes = await request(app)
        .post(`/api/video-interviews/${interviewId}/remove-participant`)
        .set('Authorization', `Bearer ${tokens.host}`)
        .send({ participantId: users.participant3._id });

      expect(removeRes.status).toBe(200);

      // 6. إنهاء المقابلة
      await request(app)
        .post(`/api/video-interviews/${interviewId}/end`)
        .set('Authorization', `Bearer ${tokens.host}`);

      // التحقق
      const interview = await VideoInterview.findById(interviewId);
      expect(interview.status).toBe('ended');
      // host + 2 participants (واحد تم إزالته)
      expect(interview.participants.filter(p => p.leftAt).length).toBe(1);
    });

    test('should reject when room is full', async () => {
      // 1. إنشاء مقابلة بحد أقصى 2 مشاركين
      const createRes = await request(app)
        .post('/api/video-interviews/create')
        .set('Authorization', `Bearer ${tokens.host}`)
        .send({
          scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
          settings: {
            maxParticipants: 2
          }
        });

      const interviewId = createRes.body.interview._id;

      // 2. مشارك واحد ينضم (الآن 2 مع المضيف)
      await request(app)
        .post(`/api/video-interviews/${interviewId}/join`)
        .set('Authorization', `Bearer ${tokens.participant1}`);

      // 3. محاولة انضمام مشارك ثاني (يجب أن يُرفض)
      const joinRes = await request(app)
        .post(`/api/video-interviews/${interviewId}/join`)
        .set('Authorization', `Bearer ${tokens.participant2}`);

      expect(joinRes.status).toBe(403);
      expect(joinRes.body.error).toContain('full');
    });
  });

  /**
   * السيناريو 5: إعادة جدولة المقابلة
   */
  describe('Scenario 5: Interview Rescheduling', () => {
    test('should reschedule interview successfully', async () => {
      // 1. إنشاء مقابلة
      const originalDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const createRes = await request(app)
        .post('/api/video-interviews/create')
        .set('Authorization', `Bearer ${tokens.host}`)
        .send({
          scheduledAt: originalDate,
          settings: {
            maxParticipants: 2
          }
        });

      const interviewId = createRes.body.interview._id;

      // 2. المشارك ينضم
      await request(app)
        .post(`/api/video-interviews/${interviewId}/join`)
        .set('Authorization', `Bearer ${tokens.participant1}`);

      // 3. إعادة الجدولة
      const newDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
      const rescheduleRes = await request(app)
        .put(`/api/video-interviews/${interviewId}/reschedule`)
        .set('Authorization', `Bearer ${tokens.host}`)
        .send({
          newScheduledAt: newDate,
          reason: 'تعارض في المواعيد'
        });

      expect(rescheduleRes.status).toBe(200);

      // التحقق
      const interview = await VideoInterview.findById(interviewId);
      expect(interview.scheduledAt.getTime()).toBe(newDate.getTime());
      expect(interview.rescheduled).toBe(true);
    });
  });

  /**
   * السيناريو 6: إضافة ملاحظات وتقييم
   */
  describe('Scenario 6: Notes and Rating', () => {
    test('should add notes and rating after interview', async () => {
      // 1. إنشاء وإنهاء مقابلة
      const createRes = await request(app)
        .post('/api/video-interviews/create')
        .set('Authorization', `Bearer ${tokens.host}`)
        .send({
          scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
          settings: {
            maxParticipants: 2
          }
        });

      const interviewId = createRes.body.interview._id;

      await request(app)
        .post(`/api/video-interviews/${interviewId}/join`)
        .set('Authorization', `Bearer ${tokens.participant1}`);

      await request(app)
        .post(`/api/video-interviews/${interviewId}/start`)
        .set('Authorization', `Bearer ${tokens.host}`);

      await request(app)
        .post(`/api/video-interviews/${interviewId}/end`)
        .set('Authorization', `Bearer ${tokens.host}`);

      // 2. إضافة ملاحظات
      const notesRes = await request(app)
        .post(`/api/video-interviews/${interviewId}/notes`)
        .set('Authorization', `Bearer ${tokens.host}`)
        .send({
          content: 'مرشح ممتاز، مهارات تقنية قوية',
          rating: 5,
          tags: ['excellent', 'technical', 'communication']
        });

      expect(notesRes.status).toBe(201);

      // 3. جلب الملاحظات
      const getNotesRes = await request(app)
        .get(`/api/video-interviews/${interviewId}/notes`)
        .set('Authorization', `Bearer ${tokens.host}`);

      expect(getNotesRes.status).toBe(200);
      expect(getNotesRes.body.notes.length).toBe(1);
      expect(getNotesRes.body.notes[0].rating).toBe(5);
    });
  });

  /**
   * السيناريو 7: البحث والفلترة
   */
  describe('Scenario 7: Search and Filter', () => {
    beforeEach(async () => {
      // إنشاء عدة مقابلات بحالات مختلفة
      const statuses = ['scheduled', 'active', 'ended'];
      
      for (const status of statuses) {
        await VideoInterview.create({
          hostId: users.host._id,
          roomId: `room-${status}-${Date.now()}`,
          status,
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          participants: [{ userId: users.host._id, role: 'host' }]
        });
      }
    });

    test('should filter interviews by status', async () => {
      const response = await request(app)
        .get('/api/video-interviews/search')
        .set('Authorization', `Bearer ${tokens.host}`)
        .query({ status: 'ended' });

      expect(response.status).toBe(200);
      expect(response.body.interviews.length).toBeGreaterThan(0);
      response.body.interviews.forEach(interview => {
        expect(interview.status).toBe('ended');
      });
    });

    test('should filter interviews by date range', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const response = await request(app)
        .get('/api/video-interviews/search')
        .set('Authorization', `Bearer ${tokens.host}`)
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });

      expect(response.status).toBe(200);
      expect(response.body.interviews.length).toBeGreaterThan(0);
    });
  });
});
