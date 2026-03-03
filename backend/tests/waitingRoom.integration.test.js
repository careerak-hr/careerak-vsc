/**
 * اختبارات تكامل شاملة لغرفة الانتظار
 * التحقق من أن جميع وظائف غرفة الانتظار تعمل بشكل صحيح
 */

const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const WaitingRoom = require('../src/models/WaitingRoom');
const VideoInterview = require('../src/models/VideoInterview');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');

describe('Waiting Room Integration Tests', () => {
  let hostToken, participantToken;
  let hostId, participantId;
  let interviewId;

  beforeAll(async () => {
    // إنشاء مستخدمين للاختبار
    const host = await User.create({
      name: 'Host User',
      email: 'host@test.com',
      password: 'password123',
      role: 'company'
    });
    hostId = host._id;
    hostToken = jwt.sign({ userId: hostId }, process.env.JWT_SECRET || 'test-secret');

    const participant = await User.create({
      name: 'Participant User',
      email: 'participant@test.com',
      password: 'password123',
      role: 'jobseeker'
    });
    participantId = participant._id;
    participantToken = jwt.sign({ userId: participantId }, process.env.JWT_SECRET || 'test-secret');

    // إنشاء مقابلة للاختبار
    const interview = await VideoInterview.create({
      hostId,
      roomId: 'test-room-123',
      scheduledAt: new Date(Date.now() + 3600000),
      status: 'scheduled',
      settings: {
        waitingRoomEnabled: true,
        maxParticipants: 5
      }
    });
    interviewId = interview._id;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await VideoInterview.deleteMany({});
    await WaitingRoom.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await WaitingRoom.deleteMany({});
  });

  describe('1. إنشاء غرفة الانتظار', () => {
    test('يجب أن ينشئ غرفة انتظار بنجاح', async () => {
      const response = await request(app)
        .post('/api/waiting-room/create')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          interviewId: interviewId.toString(),
          welcomeMessage: 'مرحباً بك في غرفة الانتظار'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('roomId');
      expect(response.body.data.welcomeMessage).toBe('مرحباً بك في غرفة الانتظار');
    });

    test('يجب أن يرفض إنشاء غرفة انتظار بدون مقابلة', async () => {
      const response = await request(app)
        .post('/api/waiting-room/create')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          interviewId: new mongoose.Types.ObjectId().toString(),
          welcomeMessage: 'مرحباً'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('2. الانضمام لغرفة الانتظار', () => {
    let waitingRoomId;

    beforeEach(async () => {
      const waitingRoom = await WaitingRoom.create({
        roomId: 'waiting-test-123',
        interviewId,
        welcomeMessage: 'مرحباً بك'
      });
      waitingRoomId = waitingRoom._id;
    });

    test('يجب أن يسمح للمشارك بالانضمام', async () => {
      const response = await request(app)
        .post(`/api/waiting-room/${interviewId}/join`)
        .set('Authorization', `Bearer ${participantToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.participants).toHaveLength(1);
      expect(response.body.data.participants[0].userId.toString()).toBe(participantId.toString());
      expect(response.body.data.participants[0].status).toBe('waiting');
    });

    test('يجب أن يمنع الانضمام المكرر', async () => {
      // الانضمام الأول
      await request(app)
        .post(`/api/waiting-room/${interviewId}/join`)
        .set('Authorization', `Bearer ${participantToken}`);

      // محاولة الانضمام مرة أخرى
      const response = await request(app)
        .post(`/api/waiting-room/${interviewId}/join`)
        .set('Authorization', `Bearer ${participantToken}`);

      expect(response.status).toBe(200);
      expect(response.body.alreadyInRoom).toBe(true);
    });
  });

  describe('3. قبول المشاركين', () => {
    beforeEach(async () => {
      await WaitingRoom.create({
        roomId: 'waiting-test-123',
        interviewId,
        participants: [{
          userId: participantId,
          joinedAt: new Date(),
          status: 'waiting'
        }]
      });
    });

    test('يجب أن يسمح للمضيف بقبول مشارك', async () => {
      const response = await request(app)
        .post(`/api/waiting-room/${interviewId}/admit/${participantId}`)
        .set('Authorization', `Bearer ${hostToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.participant.status).toBe('admitted');
    });

    test('يجب أن يمنع غير المضيف من قبول مشاركين', async () => {
      const response = await request(app)
        .post(`/api/waiting-room/${interviewId}/admit/${participantId}`)
        .set('Authorization', `Bearer ${participantToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('4. رفض المشاركين', () => {
    beforeEach(async () => {
      await WaitingRoom.create({
        roomId: 'waiting-test-123',
        interviewId,
        participants: [{
          userId: participantId,
          joinedAt: new Date(),
          status: 'waiting'
        }]
      });
    });

    test('يجب أن يسمح للمضيف برفض مشارك', async () => {
      const response = await request(app)
        .post(`/api/waiting-room/${interviewId}/reject/${participantId}`)
        .set('Authorization', `Bearer ${hostToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.participant.status).toBe('rejected');
    });
  });

  describe('5. قائمة المنتظرين', () => {
    beforeEach(async () => {
      await WaitingRoom.create({
        roomId: 'waiting-test-123',
        interviewId,
        participants: [
          {
            userId: participantId,
            joinedAt: new Date(),
            status: 'waiting'
          }
        ]
      });
    });

    test('يجب أن يعرض قائمة المنتظرين للمضيف', async () => {
      const response = await request(app)
        .get(`/api/waiting-room/${interviewId}/list`)
        .set('Authorization', `Bearer ${hostToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.participants).toHaveLength(1);
      expect(response.body.data.participants[0].status).toBe('waiting');
    });

    test('يجب أن يمنع غير المضيف من رؤية القائمة', async () => {
      const response = await request(app)
        .get(`/api/waiting-room/${interviewId}/list`)
        .set('Authorization', `Bearer ${participantToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('6. معلومات غرفة الانتظار', () => {
    beforeEach(async () => {
      await WaitingRoom.create({
        roomId: 'waiting-test-123',
        interviewId,
        welcomeMessage: 'مرحباً بك في الانتظار',
        participants: [{
          userId: participantId,
          joinedAt: new Date(),
          status: 'waiting'
        }]
      });
    });

    test('يجب أن يعرض معلومات الانتظار للمشارك', async () => {
      const response = await request(app)
        .get(`/api/waiting-room/${interviewId}/info`)
        .set('Authorization', `Bearer ${participantToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('welcomeMessage');
      expect(response.body.data).toHaveProperty('position');
      expect(response.body.data).toHaveProperty('estimatedWaitTime');
    });
  });

  describe('7. تحديث رسالة الترحيب', () => {
    beforeEach(async () => {
      await WaitingRoom.create({
        roomId: 'waiting-test-123',
        interviewId,
        welcomeMessage: 'رسالة قديمة'
      });
    });

    test('يجب أن يسمح للمضيف بتحديث الرسالة', async () => {
      const response = await request(app)
        .put(`/api/waiting-room/${interviewId}/welcome-message`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          welcomeMessage: 'رسالة جديدة'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.welcomeMessage).toBe('رسالة جديدة');
    });
  });

  describe('8. مغادرة غرفة الانتظار', () => {
    beforeEach(async () => {
      await WaitingRoom.create({
        roomId: 'waiting-test-123',
        interviewId,
        participants: [{
          userId: participantId,
          joinedAt: new Date(),
          status: 'waiting'
        }]
      });
    });

    test('يجب أن يسمح للمشارك بالمغادرة', async () => {
      const response = await request(app)
        .delete(`/api/waiting-room/${interviewId}/leave`)
        .set('Authorization', `Bearer ${participantToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('9. حذف غرفة الانتظار', () => {
    beforeEach(async () => {
      await WaitingRoom.create({
        roomId: 'waiting-test-123',
        interviewId
      });
    });

    test('يجب أن يحذف غرفة الانتظار بنجاح', async () => {
      const response = await request(app)
        .delete(`/api/waiting-room/${interviewId}`)
        .set('Authorization', `Bearer ${hostToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // التحقق من الحذف
      const waitingRoom = await WaitingRoom.findOne({ interviewId });
      expect(waitingRoom).toBeNull();
    });
  });

  describe('10. سيناريوهات متقدمة', () => {
    test('يجب أن يدير عدة مشاركين في نفس الوقت', async () => {
      await WaitingRoom.create({
        roomId: 'waiting-test-123',
        interviewId
      });

      // إنشاء 3 مشاركين
      const participants = [];
      for (let i = 0; i < 3; i++) {
        const user = await User.create({
          name: `Participant ${i}`,
          email: `participant${i}@test.com`,
          password: 'password123'
        });
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test-secret');
        participants.push({ id: user._id, token });
      }

      // جميع المشاركين ينضمون
      for (const p of participants) {
        await request(app)
          .post(`/api/waiting-room/${interviewId}/join`)
          .set('Authorization', `Bearer ${p.token}`);
      }

      // التحقق من القائمة
      const response = await request(app)
        .get(`/api/waiting-room/${interviewId}/list`)
        .set('Authorization', `Bearer ${hostToken}`);

      expect(response.body.data.participants).toHaveLength(3);
    });

    test('يجب أن يحترم ترتيب الانضمام (FIFO)', async () => {
      await WaitingRoom.create({
        roomId: 'waiting-test-123',
        interviewId
      });

      // إنشاء مشاركين
      const p1 = await User.create({
        name: 'First',
        email: 'first@test.com',
        password: 'password123'
      });
      const p2 = await User.create({
        name: 'Second',
        email: 'second@test.com',
        password: 'password123'
      });

      const token1 = jwt.sign({ userId: p1._id }, process.env.JWT_SECRET || 'test-secret');
      const token2 = jwt.sign({ userId: p2._id }, process.env.JWT_SECRET || 'test-secret');

      // الانضمام بالترتيب
      await request(app)
        .post(`/api/waiting-room/${interviewId}/join`)
        .set('Authorization', `Bearer ${token1}`);

      await new Promise(resolve => setTimeout(resolve, 100)); // تأخير صغير

      await request(app)
        .post(`/api/waiting-room/${interviewId}/join`)
        .set('Authorization', `Bearer ${token2}`);

      // التحقق من الترتيب
      const response = await request(app)
        .get(`/api/waiting-room/${interviewId}/list`)
        .set('Authorization', `Bearer ${hostToken}`);

      const participants = response.body.data.participants;
      expect(participants[0].userId.toString()).toBe(p1._id.toString());
      expect(participants[1].userId.toString()).toBe(p2._id.toString());
    });
  });
});
