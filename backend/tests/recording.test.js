const RecordingService = require('../src/services/recordingService');
const VideoInterview = require('../src/models/VideoInterview');
const InterviewRecording = require('../src/models/InterviewRecording');
const mongoose = require('mongoose');

/**
 * Recording Service Tests
 * اختبارات خدمة التسجيل
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */

describe('RecordingService', () => {
  let recordingService;
  let testInterview;
  let hostId;
  let participantId;

  beforeAll(async () => {
    // الاتصال بقاعدة بيانات الاختبار
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/careerak-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    recordingService = new RecordingService();
  });

  afterAll(async () => {
    // تنظيف وإغلاق الاتصال
    await VideoInterview.deleteMany({});
    await InterviewRecording.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // إنشاء بيانات اختبار
    hostId = new mongoose.Types.ObjectId();
    participantId = new mongoose.Types.ObjectId();

    testInterview = await VideoInterview.create({
      roomId: 'test-room-' + Date.now(),
      hostId,
      participants: [
        { userId: hostId, role: 'host' },
        { userId: participantId, role: 'participant' },
      ],
      status: 'active',
      settings: {
        recordingEnabled: true,
      },
      recordingConsent: [
        { userId: hostId, consented: true },
        { userId: participantId, consented: true },
      ],
    });
  });

  afterEach(async () => {
    // تنظيف بعد كل اختبار
    await VideoInterview.deleteMany({});
    await InterviewRecording.deleteMany({});
  });

  describe('startRecording', () => {
    test('should start recording successfully', async () => {
      const result = await recordingService.startRecording(testInterview._id, hostId);

      expect(result.success).toBe(true);
      expect(result.recordingId).toBeDefined();

      // التحقق من تحديث المقابلة
      const updatedInterview = await VideoInterview.findById(testInterview._id);
      expect(updatedInterview.recording.status).toBe('recording');
      expect(updatedInterview.recording.startedAt).toBeDefined();

      // التحقق من إنشاء سجل التسجيل
      const recording = await InterviewRecording.findOne({ recordingId: result.recordingId });
      expect(recording).toBeDefined();
      expect(recording.status).toBe('recording');
    });

    test('should fail if user is not host', async () => {
      await expect(
        recordingService.startRecording(testInterview._id, participantId)
      ).rejects.toThrow('Only the host can start recording');
    });

    test('should fail if recording is not enabled', async () => {
      testInterview.settings.recordingEnabled = false;
      await testInterview.save();

      await expect(
        recordingService.startRecording(testInterview._id, hostId)
      ).rejects.toThrow('Recording is not enabled for this interview');
    });

    test('should fail if not all participants consented', async () => {
      testInterview.recordingConsent = [
        { userId: hostId, consented: true },
        { userId: participantId, consented: false },
      ];
      await testInterview.save();

      await expect(
        recordingService.startRecording(testInterview._id, hostId)
      ).rejects.toThrow('Not all participants have consented to recording');
    });

    test('should fail if recording is already in progress', async () => {
      await recordingService.startRecording(testInterview._id, hostId);

      await expect(
        recordingService.startRecording(testInterview._id, hostId)
      ).rejects.toThrow('Recording is already in progress');
    });
  });

  describe('stopRecording', () => {
    test('should stop recording successfully', async () => {
      // بدء التسجيل أولاً
      const startResult = await recordingService.startRecording(testInterview._id, hostId);

      // إيقاف التسجيل
      const stopResult = await recordingService.stopRecording(testInterview._id, hostId);

      expect(stopResult.success).toBe(true);
      expect(stopResult.recordingId).toBe(startResult.recordingId);
      expect(stopResult.duration).toBeGreaterThanOrEqual(0);

      // التحقق من تحديث المقابلة
      const updatedInterview = await VideoInterview.findById(testInterview._id);
      expect(updatedInterview.recording.status).toBe('stopped');
      expect(updatedInterview.recording.stoppedAt).toBeDefined();

      // التحقق من تحديث سجل التسجيل
      const recording = await InterviewRecording.findOne({ recordingId: startResult.recordingId });
      expect(recording.status).toBe('processing');
      expect(recording.endTime).toBeDefined();
    });

    test('should fail if user is not host', async () => {
      await recordingService.startRecording(testInterview._id, hostId);

      await expect(
        recordingService.stopRecording(testInterview._id, participantId)
      ).rejects.toThrow('Only the host can stop recording');
    });

    test('should fail if no active recording', async () => {
      await expect(
        recordingService.stopRecording(testInterview._id, hostId)
      ).rejects.toThrow('No active recording found');
    });
  });

  describe('scheduleDelete', () => {
    test('should schedule deletion with default retention days', async () => {
      const startResult = await recordingService.startRecording(testInterview._id, hostId);
      await recordingService.stopRecording(testInterview._id, hostId);

      const result = await recordingService.scheduleDelete(startResult.recordingId);

      expect(result.success).toBe(true);
      expect(result.retentionDays).toBe(90);
      expect(result.expiresAt).toBeDefined();

      // التحقق من تحديث التسجيل
      const recording = await InterviewRecording.findOne({ recordingId: startResult.recordingId });
      expect(recording.expiresAt).toBeDefined();
      expect(recording.retentionDays).toBe(90);
    });

    test('should schedule deletion with custom retention days', async () => {
      const startResult = await recordingService.startRecording(testInterview._id, hostId);
      await recordingService.stopRecording(testInterview._id, hostId);

      const result = await recordingService.scheduleDelete(startResult.recordingId, 30);

      expect(result.success).toBe(true);
      expect(result.retentionDays).toBe(30);

      const recording = await InterviewRecording.findOne({ recordingId: startResult.recordingId });
      expect(recording.retentionDays).toBe(30);
    });
  });

  describe('deleteRecording', () => {
    test('should delete recording successfully', async () => {
      const startResult = await recordingService.startRecording(testInterview._id, hostId);
      await recordingService.stopRecording(testInterview._id, hostId);

      const result = await recordingService.deleteRecording(startResult.recordingId, hostId, 'manual');

      expect(result.success).toBe(true);

      // التحقق من تحديث التسجيل
      const recording = await InterviewRecording.findOne({ recordingId: startResult.recordingId });
      expect(recording.status).toBe('deleted');
      expect(recording.deletedAt).toBeDefined();
      expect(recording.deletionReason).toBe('manual');
    });
  });

  describe('canAccessRecording', () => {
    test('host should have access', async () => {
      const startResult = await recordingService.startRecording(testInterview._id, hostId);

      const canAccess = await recordingService.canAccessRecording(startResult.recordingId, hostId);
      expect(canAccess).toBe(true);
    });

    test('participant should have access', async () => {
      const startResult = await recordingService.startRecording(testInterview._id, hostId);

      const canAccess = await recordingService.canAccessRecording(startResult.recordingId, participantId);
      expect(canAccess).toBe(true);
    });

    test('non-participant should not have access', async () => {
      const startResult = await recordingService.startRecording(testInterview._id, hostId);
      const otherId = new mongoose.Types.ObjectId();

      const canAccess = await recordingService.canAccessRecording(startResult.recordingId, otherId);
      expect(canAccess).toBe(false);
    });
  });

  describe('deleteExpiredRecordings', () => {
    test('should delete expired recordings', async () => {
      // إنشاء تسجيل منتهي
      const startResult = await recordingService.startRecording(testInterview._id, hostId);
      await recordingService.stopRecording(testInterview._id, hostId);

      const recording = await InterviewRecording.findOne({ recordingId: startResult.recordingId });
      recording.expiresAt = new Date(Date.now() - 1000); // منتهي منذ ثانية
      await recording.save();

      // حذف التسجيلات المنتهية
      const results = await recordingService.deleteExpiredRecordings();

      expect(results.total).toBe(1);
      expect(results.deleted).toBe(1);
      expect(results.failed).toBe(0);

      // التحقق من الحذف
      const deletedRecording = await InterviewRecording.findOne({ recordingId: startResult.recordingId });
      expect(deletedRecording.status).toBe('deleted');
    });

    test('should not delete non-expired recordings', async () => {
      const startResult = await recordingService.startRecording(testInterview._id, hostId);
      await recordingService.stopRecording(testInterview._id, hostId);
      await recordingService.scheduleDelete(startResult.recordingId, 90);

      const results = await recordingService.deleteExpiredRecordings();

      expect(results.total).toBe(0);
      expect(results.deleted).toBe(0);
    });
  });

  describe('getExpiringSoonRecordings', () => {
    test('should get recordings expiring soon', async () => {
      const startResult = await recordingService.startRecording(testInterview._id, hostId);
      await recordingService.stopRecording(testInterview._id, hostId);

      const recording = await InterviewRecording.findOne({ recordingId: startResult.recordingId });
      recording.expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // بعد 3 أيام
      await recording.save();

      const recordings = await recordingService.getExpiringSoonRecordings(7);

      expect(recordings.length).toBe(1);
      expect(recordings[0].recordingId).toBe(startResult.recordingId);
    });
  });
});
