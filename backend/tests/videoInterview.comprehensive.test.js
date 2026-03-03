/**
 * اختبارات شاملة لنظام الفيديو للمقابلات
 * Comprehensive Video Interview System Tests
 * 
 * يغطي هذا الملف:
 * - Unit Tests: اختبارات الوحدات الفردية
 * - Integration Tests: اختبارات التكامل بين المكونات
 * - E2E Tests: اختبارات من البداية للنهاية
 * 
 * Requirements: جميع متطلبات نظام الفيديو (1.1 - 8.6)
 */

const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const VideoInterview = require('../src/models/VideoInterview');
const InterviewRecording = require('../src/models/InterviewRecording');
const WaitingRoom = require('../src/models/WaitingRoom');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');

describe('Video Interview System - Comprehensive Tests', () => {
  let hostToken, participantToken, participant2Token;
  let hostId, participantId, participant2Id;
  let interviewId;

  beforeAll(async () => {
    // الاتصال بقاعدة بيانات الاختبار
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/careerak-test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }

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
      role: 'individual'
    });
    participantId = participant._id;
    participantToken = jwt.sign({ userId: participantId }, process.env.JWT_SECRET || 'test-secret');

    const participant2 = await User.create({
      name: 'Participant 2',
      email: 'participant2@test.com',
      password: 'password123',
      role: 'individual'
    });
    participant2Id = participant2._id;
    participant2Token = jwt.sign({ userId: participant2Id }, process.env.JWT_SECRET || 'test-secret');
  });

  afterAll(async () => {
    // تنظيف
    await User.deleteMany({});
    await VideoInterview.deleteMany({});
    await InterviewRecording.deleteMany({});
    await WaitingRoom.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // تنظيف بعد كل اختبار
    await VideoInterview.deleteMany({});
    await InterviewRecording.deleteMany({});
    await WaitingRoom.deleteMany({});
  });

  /**
   * ========================================
   * UNIT TESTS - اختبارات الوحدات
   * ========================================
   */

  describe('Unit Tests - Video Interview Creation', () => {
    test('should create a video interview successfully', async () => {
      const response = await request(app)
        .post('/api/video-interviews/create')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          settings: {
            recordingEnabled: true,
            waitingRoomEnabled: true,
            screenShareEnabled: true,
            chatEnabled: true,
            maxParticipants: 5
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.interview).toBeDefined();
      expect(response.body.interview.roomId).toBeDefined();
      expect(response.body.interview.hostId).toBe(hostId.toString());
      
      interviewId = response.body.interview._id;
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/video-interviews/create')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    test('should reject invalid settings', async () => {
      const response = await request(app)
        .post('/api/video-interviews/create')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          settings: {
            maxParticipants: 15 // أكثر من الحد الأقصى (10)
          }
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Unit Tests - Waiting Room', () => {
    beforeEach(async () => {
      // إنشاء مقابلة للاختبار
      const interview = await VideoInterview.create({
        hostId,
        roomId: 'test-room-' + Date.now(),
        status: 'scheduled',
        scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
        settings: {
          waitingRoomEnabled: true,
          maxParticipants: 5
        }
      });
      interviewId = interview._id;
    });

    test('should create waiting room', async () => {
      const response = await request(app)
        .post('/api/waiting-room/create')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          interviewId,
          welcomeMessage: 'مرحباً بك في المقابلة'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.waitingRoom).toBeDefined();
    });

    test('should allow participant to join waiting room', async () => {
      await WaitingRoom.create({
        interviewId,
        roomId: 'waiting-' + Date.now(),
        welcomeMessage: 'مرحباً'
      });

      const response = await request(app)
        .post(`/api/waiting-room/${interviewId}/join`)
        .set('Authorization', `Bearer ${participantToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should allow host to admit participant', async () => {
      const waitingRoom = await WaitingRoom.create({
        interviewId,
        roomId: 'waiting-' + Date.now(),
        welcomeMessage: 'مرحباً',
        participants: [{
          userId: participantId,
          joinedAt: new Date(),
          status: 'waiting'
        }]
      });

      const response = await request(app)
        .post(`/api/waiting-room/${interviewId}/admit/${participantId}`)
        .set('Authorization', `Bearer ${hostToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Unit Tests - Recording', () => {
    beforeEach(async () => {
      const interview = await VideoInterview.create({
        hostId,
        roomId: 'test-room-' + Date.now(),
        status: 'active',
        participants: [
          { userId: hostId, role: 'host' },
          { userId: participantId, role: 'participant' }
        ],
        settings: {
          recordingEnabled: true
        },
        recordingConsent: [
          { userId: hostId, consented: true },
          { userId: participantId, consented: true }
        ]
      });
      interviewId = interview._id;
    });

    test('should start recording with consent', async () => {
      const response = await request(app)
        .post(`/api/video-interviews/${interviewId}/recording/start`)
        .set('Authorization', `Bearer ${hostToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.recordingId).toBeDefined();
    });

    test('should fail without consent', async () => {
      const interview = await VideoInterview.findById(interviewId);
      interview.recordingConsent = [
        { userId: hostId, consented: true },
        { userId: participantId, consented: false }
      ];
      await interview.save();

      const response = await request(app)
        .post(`/api/video-interviews/${interviewId}/recording/start`)
        .set('Authorization', `Bearer ${hostToken}`);

      expect(response.status).toBe(403);
    });

    test('should stop recording', async () => {
      // بدء التسجيل أولاً
      await request(app)
        .post(`/api/video-interviews/${interviewId}/recording/start`)
        .set('Authorization', `Bearer ${hostToken}`);

      // إيقاف التسجيل
      const response = await request(app)
        .post(`/api/video-interviews/${interviewId}/recording/stop`)
        .set('Authorization', `Bearer ${hostToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.duration).toBeGreaterThanOrEqual(0);
    });
  });

  /**
   * ========================================
   * INTEGRATION TESTS - اختبارات التكامل
   * ========================================
   */

  describe('Integration Tests - Complete Interview Flow', () => {
    test('should complete full interview lifecycle', async () => {
      // 1. إنشاء مقابلة
      const createResponse = await request(app)
        .post('/api/video-interviews/create')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
          settings: {
            recordingEnabled: true,
            waitingRoomEnabled: true,
            maxParticipants: 5
          }
        });

      expect(createResponse.status).toBe(201);
      const interviewId = createResponse.body.interview._id;

      // 2. إنشاء غرفة انتظار
      const waitingRoomResponse = await request(app)
        .post('/api/waiting-room/create')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          interviewId,
          welcomeMessage: 'مرحباً بك'
        });

      expect(waitingRoomResponse.status).toBe(201);

      // 3. انضمام مشارك لغرفة الانتظار
      const joinResponse = await request(app)
        .post(`/api/waiting-room/${interviewId}/join`)
        .set('Authorization', `Bearer ${participantToken}`);

      expect(joinResponse.status).toBe(200);

      // 4. قبول المشارك
      const admitResponse = await request(app)
        .post(`/api/waiting-room/${interviewId}/admit/${participantId}`)
        .set('Authorization', `Bearer ${hostToken}`);

      expect(admitResponse.status).toBe(200);

      // 5. بدء المقابلة
      const startResponse = await request(app)
        .post(`/api/video-interviews/${interviewId}/start`)
        .set('Authorization', `Bearer ${hostToken}`);

      expect(startResponse.status).toBe(200);

      // 6. بدء التسجيل
      const recordingResponse = await request(app)
        .post(`/api/video-interviews/${interviewId}/recording/start`)
        .set('Authorization', `Bearer ${hostToken}`);

      expect(recordingResponse.status).toBe(200);

      // 7. إيقاف التسجيل
      const stopRecordingResponse = await request(app)
        .post(`/api/video-interviews/${interviewId}/recording/stop`)
        .set('Authorization', `Bearer ${hostToken}`);

      expect(stopRecordingResponse.status).toBe(200);

      // 8. إنهاء المقابلة
      const endResponse = await request(app)
        .post(`/api/video-interviews/${interviewId}/end`)
        .set('Authorization', `Bearer ${hostToken}`);

      expect(endResponse.status).toBe(200);

      // 9. التحقق من الحالة النهائية
      const interview = await VideoInterview.findById(interviewId);
      expect(interview.status).toBe('ended');
      expect(interview.endedAt).toBeDefined();
    });
  });

  describe('Integration Tests - Group Interview', () => {
    test('should handle multiple participants', async () => {
      // إنشاء مقابلة
      const createResponse = await request(app)
        .post('/api/video-interviews/create')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
          settings: {
            maxParticipants: 10
          }
        });

      const interviewId = createResponse.body.interview._id;

      // إضافة مشاركين
      const participants = [participantToken, participant2Token];
      
      for (const token of participants) {
        const response = await request(app)
          .post(`/api/video-interviews/${interviewId}/join`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
      }

      // التحقق من عدد المشاركين
      const interview = await VideoInterview.findById(interviewId);
      expect(interview.participants.length).toBe(3); // host + 2 participants
    });

    test('should reject participant when room is full', async () => {
      // إنشاء مقابلة بحد أقصى 2 مشاركين
      const createResponse = await request(app)
        .post('/api/video-interviews/create')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
          settings: {
            maxParticipants: 2
          }
        });

      const interviewId = createResponse.body.interview._id;

      // إضافة مشارك واحد (الآن 2 مع المضيف)
      await request(app)
        .post(`/api/video-interviews/${interviewId}/join`)
        .set('Authorization', `Bearer ${participantToken}`);

      // محاولة إضافة مشارك ثالث (يجب أن يُرفض)
      const response = await request(app)
        .post(`/api/video-interviews/${interviewId}/join`)
        .set('Authorization', `Bearer ${participant2Token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('full');
    });
  });

  describe('Integration Tests - Recording with Auto-Delete', () => {
    test('should schedule auto-delete after recording', async () => {
      // إنشاء وبدء مقابلة
      const interview = await VideoInterview.create({
        hostId,
        roomId: 'test-room-' + Date.now(),
        status: 'active',
        participants: [
          { userId: hostId, role: 'host' },
          { userId: participantId, role: 'participant' }
        ],
        settings: {
          recordingEnabled: true
        },
        recordingConsent: [
          { userId: hostId, consented: true },
          { userId: participantId, consented: true }
        ]
      });

      // بدء التسجيل
      const startResponse = await request(app)
        .post(`/api/video-interviews/${interview._id}/recording/start`)
        .set('Authorization', `Bearer ${hostToken}`);

      const recordingId = startResponse.body.recordingId;

      // إيقاف التسجيل
      await request(app)
        .post(`/api/video-interviews/${interview._id}/recording/stop`)
        .set('Authorization', `Bearer ${hostToken}`);

      // التحقق من جدولة الحذف
      const recording = await InterviewRecording.findOne({ recordingId });
      expect(recording.expiresAt).toBeDefined();
      expect(recording.retentionDays).toBe(90);

      // حساب الفرق بالأيام
      const daysDiff = Math.ceil((recording.expiresAt - new Date()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBeGreaterThanOrEqual(89);
      expect(daysDiff).toBeLessThanOrEqual(91);
    });
  });

  /**
   * ========================================
   * E2E TESTS - اختبارات من البداية للنهاية
   * ========================================
   */

  describe('E2E Tests - Complete User Journey', () => {
    test('should complete full user journey from scheduling to completion', async () => {
      // السيناريو: شركة تجري مقابلة مع مرشح

      // 1. الشركة تنشئ مقابلة مجدولة
      const createResponse = await request(app)
        .post('/api/video-interviews/create')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          settings: {
            recordingEnabled: true,
            waitingRoomEnabled: true,
            screenShareEnabled: true,
            chatEnabled: true,
            maxParticipants: 5
          }
        });

      expect(createResponse.status).toBe(201);
      const interviewId = createResponse.body.interview._id;
      const roomId = createResponse.body.interview.roomId;

      // 2. إنشاء غرفة انتظار
      await request(app)
        .post('/api/waiting-room/create')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          interviewId,
          welcomeMessage: 'مرحباً بك في مقابلة الفيديو. سيتم قبولك قريباً.'
        });

      // 3. المرشح ينضم لغرفة الانتظار
      await request(app)
        .post(`/api/waiting-room/${interviewId}/join`)
        .set('Authorization', `Bearer ${participantToken}`);

      // 4. المرشح يختبر الكاميرا والميكروفون (محاكاة)
      // في الواقع، هذا يحدث في Frontend

      // 5. الشركة تقبل المرشح
      await request(app)
        .post(`/api/waiting-room/${interviewId}/admit/${participantId}`)
        .set('Authorization', `Bearer ${hostToken}`);

      // 6. بدء المقابلة
      await request(app)
        .post(`/api/video-interviews/${interviewId}/start`)
        .set('Authorization', `Bearer ${hostToken}`);

      // 7. طلب موافقة على التسجيل
      await request(app)
        .post(`/api/video-interviews/${interviewId}/recording/consent`)
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ consented: true });

      // 8. بدء التسجيل
      await request(app)
        .post(`/api/video-interviews/${interviewId}/recording/start`)
        .set('Authorization', `Bearer ${hostToken}`);

      // 9. محاكاة المقابلة (انتظار قصير)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 10. إيقاف التسجيل
      await request(app)
        .post(`/api/video-interviews/${interviewId}/recording/stop`)
        .set('Authorization', `Bearer ${hostToken}`);

      // 11. إنهاء المقابلة
      await request(app)
        .post(`/api/video-interviews/${interviewId}/end`)
        .set('Authorization', `Bearer ${hostToken}`);

      // 12. إضافة ملاحظات
      await request(app)
        .post(`/api/video-interviews/${interviewId}/notes`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          content: 'مرشح ممتاز، مهارات تواصل جيدة',
          rating: 5
        });

      // 13. التحقق من الحالة النهائية
      const finalInterview = await VideoInterview.findById(interviewId);
      expect(finalInterview.status).toBe('ended');
      expect(finalInterview.endedAt).toBeDefined();
      expect(finalInterview.duration).toBeGreaterThan(0);

      // 14. التحقق من التسجيل
      const recording = await InterviewRecording.findOne({ interviewId });
      expect(recording).toBeDefined();
      expect(recording.status).toBe('processing');
      expect(recording.expiresAt).toBeDefined();
    });
  });

  /**
   * ========================================
   * PERFORMANCE TESTS - اختبارات الأداء
   * ========================================
   */

  describe('Performance Tests', () => {
    test('should handle interview creation within acceptable time', async () => {
      const startTime = Date.now();

      await request(app)
        .post('/api/video-interviews/create')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          settings: {
            maxParticipants: 5
          }
        });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // أقل من ثانية
    });

    test('should handle multiple concurrent joins', async () => {
      const interview = await VideoInterview.create({
        hostId,
        roomId: 'test-room-' + Date.now(),
        status: 'active',
        settings: {
          maxParticipants: 10
        }
      });

      // محاكاة 5 انضمامات متزامنة
      const promises = [];
      for (let i = 0; i < 5; i++) {
        const user = await User.create({
          name: `User ${i}`,
          email: `user${i}@test.com`,
          password: 'password123',
          role: 'individual'
        });
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test-secret');

        promises.push(
          request(app)
            .post(`/api/video-interviews/${interview._id}/join`)
            .set('Authorization', `Bearer ${token}`)
        );
      }

      const results = await Promise.all(promises);
      
      // جميع الطلبات يجب أن تنجح
      results.forEach(result => {
        expect(result.status).toBe(200);
      });
    });
  });

  /**
   * ========================================
   * SECURITY TESTS - اختبارات الأمان
   * ========================================
   */

  describe('Security Tests', () => {
    test('should reject unauthorized access', async () => {
      const interview = await VideoInterview.create({
        hostId,
        roomId: 'test-room-' + Date.now(),
        status: 'active'
      });

      const response = await request(app)
        .post(`/api/video-interviews/${interview._id}/recording/start`)
        .set('Authorization', `Bearer ${participantToken}`); // ليس المضيف

      expect(response.status).toBe(403);
    });

    test('should validate JWT token', async () => {
      const response = await request(app)
        .post('/api/video-interviews/create')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });

      expect(response.status).toBe(401);
    });

    test('should prevent access to other users interviews', async () => {
      const interview = await VideoInterview.create({
        hostId,
        roomId: 'test-room-' + Date.now(),
        status: 'active'
      });

      const response = await request(app)
        .get(`/api/video-interviews/${interview._id}`)
        .set('Authorization', `Bearer ${participant2Token}`); // مستخدم غير مشارك

      expect(response.status).toBe(403);
    });
  });
});
