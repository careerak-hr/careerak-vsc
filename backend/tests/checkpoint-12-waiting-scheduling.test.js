/**
 * Checkpoint 12: التأكد من الانتظار والجدولة
 * 
 * هذا الاختبار يتحقق من:
 * 1. غرفة الانتظار تعمل بشكل صحيح
 * 2. الجدولة والتذكيرات تعمل
 * 3. التكامل بين الانتظار والجدولة
 * 4. إعادة الجدولة تعمل
 */

const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const VideoInterview = require('../src/models/VideoInterview');
const WaitingRoom = require('../src/models/WaitingRoom');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');

describe('Checkpoint 12: Waiting Room & Scheduling Integration', () => {
  let hostToken, participantToken;
  let hostId, participantId;
  let interview;

  beforeAll(async () => {
    // إنشاء مستخدمين للاختبار
    const host = await User.create({
      name: 'Host User',
      email: 'host@test.com',
      password: 'password123',
      role: 'hr'
    });

    const participant = await User.create({
      name: 'Participant User',
      email: 'participant@test.com',
      password: 'password123',
      role: 'employee'
    });

    hostId = host._id;
    participantId = participant._id;

    hostToken = jwt.sign({ userId: hostId }, process.env.JWT_SECRET || 'test-secret');
    participantToken = jwt.sign({ userId: participantId }, process.env.JWT_SECRET || 'test-secret');
  });

  afterAll(async () => {
    await User.deleteMany({});
    await VideoInterview.deleteMany({});
    await WaitingRoom.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await VideoInterview.deleteMany({});
    await WaitingRoom.deleteMany({});
  });

  describe('1. غرفة الانتظار الأساسية', () => {
    it('يجب إنشاء غرفة انتظار عند تفعيلها', async () => {
      // إنشاء مقابلة مع غرفة انتظار
      const response = await request(app)
        .post('/api/video-interviews')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          title: 'Interview with Waiting Room',
          scheduledAt: new Date(Date.now() + 3600000),
          participants: [participantId],
          settings: {
            waitingRoomEnabled: true,
            maxParticipants: 5
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.settings.waitingRoomEnabled).toBe(true);

      interview = response.body;

      // التحقق من إنشاء غرفة الانتظار
      const waitingRoom = await WaitingRoom.findOne({ interviewId: interview._id });
      expect(waitingRoom).toBeTruthy();
      expect(waitingRoom.participants).toEqual([]);
    });

    it('يجب إضافة مشارك لغرفة الانتظار', async () => {
      // إنشاء مقابلة
      interview = await VideoInterview.create({
        hostId,
        roomId: 'test-room-' + Date.now(),
        scheduledAt: new Date(Date.now() + 3600000),
        status: 'scheduled',
        settings: {
          waitingRoomEnabled: true,
          maxParticipants: 5
        }
      });

      // إنشاء غرفة انتظار
      const waitingRoom = await WaitingRoom.create({
        interviewId: interview._id,
        welcomeMessage: 'مرحباً بك في غرفة الانتظار'
      });

      // إضافة مشارك
      const response = await request(app)
        .post(`/api/video-interviews/${interview._id}/waiting-room/join`)
        .set('Authorization', `Bearer ${participantToken}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('انضممت لغرفة الانتظار');

      // التحقق من إضافة المشارك
      const updatedWaitingRoom = await WaitingRoom.findOne({ interviewId: interview._id });
      expect(updatedWaitingRoom.participants).toHaveLength(1);
      expect(updatedWaitingRoom.participants[0].userId.toString()).toBe(participantId.toString());
      expect(updatedWaitingRoom.participants[0].status).toBe('waiting');
    });

    it('يجب قبول مشارك من غرفة الانتظار', async () => {
      // إنشاء مقابلة
      interview = await VideoInterview.create({
        hostId,
        roomId: 'test-room-' + Date.now(),
        scheduledAt: new Date(Date.now() + 3600000),
        status: 'scheduled',
        settings: {
          waitingRoomEnabled: true,
          maxParticipants: 5
        },
        participants: [{
          userId: hostId,
          role: 'host',
          joinedAt: new Date()
        }]
      });

      // إنشاء غرفة انتظار مع مشارك
      const waitingRoom = await WaitingRoom.create({
        interviewId: interview._id,
        participants: [{
          userId: participantId,
          status: 'waiting',
          joinedAt: new Date()
        }]
      });

      // قبول المشارك
      const response = await request(app)
        .post(`/api/video-interviews/${interview._id}/waiting-room/admit`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ userId: participantId });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('تم قبول المشارك');

      // التحقق من تحديث حالة المشارك
      const updatedWaitingRoom = await WaitingRoom.findOne({ interviewId: interview._id });
      expect(updatedWaitingRoom.participants[0].status).toBe('admitted');

      // التحقق من إضافة المشارك للمقابلة
      const updatedInterview = await VideoInterview.findById(interview._id);
      expect(updatedInterview.participants).toHaveLength(2);
      expect(updatedInterview.participants[1].userId.toString()).toBe(participantId.toString());
    });

    it('يجب رفض مشارك من غرفة الانتظار', async () => {
      // إنشاء مقابلة
      interview = await VideoInterview.create({
        hostId,
        roomId: 'test-room-' + Date.now(),
        scheduledAt: new Date(Date.now() + 3600000),
        status: 'scheduled',
        settings: {
          waitingRoomEnabled: true,
          maxParticipants: 5
        }
      });

      // إنشاء غرفة انتظار مع مشارك
      const waitingRoom = await WaitingRoom.create({
        interviewId: interview._id,
        participants: [{
          userId: participantId,
          status: 'waiting',
          joinedAt: new Date()
        }]
      });

      // رفض المشارك
      const response = await request(app)
        .post(`/api/video-interviews/${interview._id}/waiting-room/reject`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ userId: participantId });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('تم رفض المشارك');

      // التحقق من تحديث حالة المشارك
      const updatedWaitingRoom = await WaitingRoom.findOne({ interviewId: interview._id });
      expect(updatedWaitingRoom.participants[0].status).toBe('rejected');
    });
  });

  describe('2. الجدولة والتذكيرات', () => {
    it('يجب جدولة مقابلة في المستقبل', async () => {
      const scheduledTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // غداً

      const response = await request(app)
        .post('/api/video-interviews')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          title: 'Scheduled Interview',
          scheduledAt: scheduledTime,
          participants: [participantId],
          settings: {
            waitingRoomEnabled: true,
            maxParticipants: 5
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('scheduled');
      expect(new Date(response.body.scheduledAt).getTime()).toBe(scheduledTime.getTime());
    });

    it('يجب منع الانضمام قبل 5 دقائق من الموعد', async () => {
      // إنشاء مقابلة بعد ساعة
      interview = await VideoInterview.create({
        hostId,
        roomId: 'test-room-' + Date.now(),
        scheduledAt: new Date(Date.now() + 60 * 60 * 1000), // بعد ساعة
        status: 'scheduled',
        settings: {
          waitingRoomEnabled: false,
          maxParticipants: 5
        }
      });

      // محاولة الانضمام
      const response = await request(app)
        .post(`/api/video-interviews/${interview._id}/join`)
        .set('Authorization', `Bearer ${participantToken}`)
        .send();

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('لا يمكن الانضمام');
    });

    it('يجب السماح بالانضمام قبل 5 دقائق من الموعد', async () => {
      // إنشاء مقابلة بعد 3 دقائق
      interview = await VideoInterview.create({
        hostId,
        roomId: 'test-room-' + Date.now(),
        scheduledAt: new Date(Date.now() + 3 * 60 * 1000), // بعد 3 دقائق
        status: 'scheduled',
        settings: {
          waitingRoomEnabled: false,
          maxParticipants: 5
        },
        participants: [{
          userId: hostId,
          role: 'host',
          joinedAt: new Date()
        }]
      });

      // محاولة الانضمام
      const response = await request(app)
        .post(`/api/video-interviews/${interview._id}/join`)
        .set('Authorization', `Bearer ${participantToken}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('انضممت للمقابلة');
    });

    it('يجب إعادة جدولة مقابلة', async () => {
      // إنشاء مقابلة
      interview = await VideoInterview.create({
        hostId,
        roomId: 'test-room-' + Date.now(),
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'scheduled',
        settings: {
          waitingRoomEnabled: true,
          maxParticipants: 5
        }
      });

      const newScheduledTime = new Date(Date.now() + 48 * 60 * 60 * 1000); // بعد يومين

      // إعادة الجدولة
      const response = await request(app)
        .put(`/api/video-interviews/${interview._id}/reschedule`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ scheduledAt: newScheduledTime });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('تم إعادة جدولة المقابلة');
      expect(new Date(response.body.interview.scheduledAt).getTime()).toBe(newScheduledTime.getTime());
    });
  });

  describe('3. التكامل بين الانتظار والجدولة', () => {
    it('يجب إضافة مشارك لغرفة الانتظار قبل 5 دقائق من الموعد', async () => {
      // إنشاء مقابلة بعد 3 دقائق
      interview = await VideoInterview.create({
        hostId,
        roomId: 'test-room-' + Date.now(),
        scheduledAt: new Date(Date.now() + 3 * 60 * 1000),
        status: 'scheduled',
        settings: {
          waitingRoomEnabled: true,
          maxParticipants: 5
        }
      });

      // إنشاء غرفة انتظار
      await WaitingRoom.create({
        interviewId: interview._id,
        welcomeMessage: 'مرحباً بك'
      });

      // محاولة الانضمام لغرفة الانتظار
      const response = await request(app)
        .post(`/api/video-interviews/${interview._id}/waiting-room/join`)
        .set('Authorization', `Bearer ${participantToken}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('انضممت لغرفة الانتظار');
    });

    it('يجب منع الانضمام لغرفة الانتظار قبل الموعد بأكثر من 5 دقائق', async () => {
      // إنشاء مقابلة بعد ساعة
      interview = await VideoInterview.create({
        hostId,
        roomId: 'test-room-' + Date.now(),
        scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
        status: 'scheduled',
        settings: {
          waitingRoomEnabled: true,
          maxParticipants: 5
        }
      });

      // إنشاء غرفة انتظار
      await WaitingRoom.create({
        interviewId: interview._id,
        welcomeMessage: 'مرحباً بك'
      });

      // محاولة الانضمام لغرفة الانتظار
      const response = await request(app)
        .post(`/api/video-interviews/${interview._id}/waiting-room/join`)
        .set('Authorization', `Bearer ${participantToken}`)
        .send();

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('لا يمكن الانضمام');
    });

    it('يجب قبول مشارك من غرفة الانتظار وإضافته للمقابلة المجدولة', async () => {
      // إنشاء مقابلة بعد 3 دقائق
      interview = await VideoInterview.create({
        hostId,
        roomId: 'test-room-' + Date.now(),
        scheduledAt: new Date(Date.now() + 3 * 60 * 1000),
        status: 'scheduled',
        settings: {
          waitingRoomEnabled: true,
          maxParticipants: 5
        },
        participants: [{
          userId: hostId,
          role: 'host',
          joinedAt: new Date()
        }]
      });

      // إنشاء غرفة انتظار مع مشارك
      await WaitingRoom.create({
        interviewId: interview._id,
        participants: [{
          userId: participantId,
          status: 'waiting',
          joinedAt: new Date()
        }]
      });

      // قبول المشارك
      const response = await request(app)
        .post(`/api/video-interviews/${interview._id}/waiting-room/admit`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ userId: participantId });

      expect(response.status).toBe(200);

      // التحقق من إضافة المشارك للمقابلة
      const updatedInterview = await VideoInterview.findById(interview._id);
      expect(updatedInterview.participants).toHaveLength(2);
      expect(updatedInterview.participants[1].userId.toString()).toBe(participantId.toString());
    });
  });

  describe('4. سيناريوهات متقدمة', () => {
    it('يجب التعامل مع عدة مشاركين في غرفة الانتظار', async () => {
      // إنشاء مقابلة
      interview = await VideoInterview.create({
        hostId,
        roomId: 'test-room-' + Date.now(),
        scheduledAt: new Date(Date.now() + 3 * 60 * 1000),
        status: 'scheduled',
        settings: {
          waitingRoomEnabled: true,
          maxParticipants: 10
        },
        participants: [{
          userId: hostId,
          role: 'host',
          joinedAt: new Date()
        }]
      });

      // إنشاء مشاركين إضافيين
      const participant2 = await User.create({
        name: 'Participant 2',
        email: 'participant2@test.com',
        password: 'password123',
        role: 'employee'
      });

      const participant3 = await User.create({
        name: 'Participant 3',
        email: 'participant3@test.com',
        password: 'password123',
        role: 'employee'
      });

      // إنشاء غرفة انتظار مع 3 مشاركين
      await WaitingRoom.create({
        interviewId: interview._id,
        participants: [
          { userId: participantId, status: 'waiting', joinedAt: new Date() },
          { userId: participant2._id, status: 'waiting', joinedAt: new Date() },
          { userId: participant3._id, status: 'waiting', joinedAt: new Date() }
        ]
      });

      // قبول المشارك الأول
      await request(app)
        .post(`/api/video-interviews/${interview._id}/waiting-room/admit`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ userId: participantId });

      // قبول المشارك الثاني
      await request(app)
        .post(`/api/video-interviews/${interview._id}/waiting-room/admit`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ userId: participant2._id });

      // رفض المشارك الثالث
      await request(app)
        .post(`/api/video-interviews/${interview._id}/waiting-room/reject`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ userId: participant3._id });

      // التحقق من النتائج
      const updatedInterview = await VideoInterview.findById(interview._id);
      expect(updatedInterview.participants).toHaveLength(3); // host + 2 admitted

      const waitingRoom = await WaitingRoom.findOne({ interviewId: interview._id });
      expect(waitingRoom.participants[0].status).toBe('admitted');
      expect(waitingRoom.participants[1].status).toBe('admitted');
      expect(waitingRoom.participants[2].status).toBe('rejected');
    });

    it('يجب إعادة جدولة مقابلة مع غرفة انتظار', async () => {
      // إنشاء مقابلة
      interview = await VideoInterview.create({
        hostId,
        roomId: 'test-room-' + Date.now(),
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'scheduled',
        settings: {
          waitingRoomEnabled: true,
          maxParticipants: 5
        }
      });

      // إنشاء غرفة انتظار
      await WaitingRoom.create({
        interviewId: interview._id,
        welcomeMessage: 'مرحباً بك'
      });

      const newScheduledTime = new Date(Date.now() + 48 * 60 * 60 * 1000);

      // إعادة الجدولة
      const response = await request(app)
        .put(`/api/video-interviews/${interview._id}/reschedule`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ scheduledAt: newScheduledTime });

      expect(response.status).toBe(200);

      // التحقق من أن غرفة الانتظار لا تزال موجودة
      const waitingRoom = await WaitingRoom.findOne({ interviewId: interview._id });
      expect(waitingRoom).toBeTruthy();
    });
  });

  describe('5. اختبارات الأداء', () => {
    it('يجب التعامل مع قائمة انتظار كبيرة بكفاءة', async () => {
      // إنشاء مقابلة
      interview = await VideoInterview.create({
        hostId,
        roomId: 'test-room-' + Date.now(),
        scheduledAt: new Date(Date.now() + 3 * 60 * 1000),
        status: 'scheduled',
        settings: {
          waitingRoomEnabled: true,
          maxParticipants: 50
        }
      });

      // إنشاء 20 مشارك
      const participants = [];
      for (let i = 0; i < 20; i++) {
        participants.push({
          userId: new mongoose.Types.ObjectId(),
          status: 'waiting',
          joinedAt: new Date()
        });
      }

      // إنشاء غرفة انتظار
      await WaitingRoom.create({
        interviewId: interview._id,
        participants
      });

      const startTime = Date.now();

      // جلب قائمة المنتظرين
      const response = await request(app)
        .get(`/api/video-interviews/${interview._id}/waiting-room`)
        .set('Authorization', `Bearer ${hostToken}`);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(response.body.participants).toHaveLength(20);
      expect(responseTime).toBeLessThan(1000); // يجب أن يكون أقل من ثانية
    });
  });
});
