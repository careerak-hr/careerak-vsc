/**
 * Recording Service Tests
 * اختبارات خدمة تسجيل المقابلات
 * 
 * Requirements: 2.1, 2.4
 */

const recordingService = require('../src/services/recordingService');
const VideoInterview = require('../src/models/VideoInterview');
const InterviewRecording = require('../src/models/InterviewRecording');
const mongoose = require('mongoose');

// Mock Cloudinary
jest.mock('../src/config/cloudinary', () => ({
  uploader: {
    upload_stream: jest.fn((options, callback) => {
      // محاكاة رفع ناجح
      const mockResult = {
        secure_url: 'https://res.cloudinary.com/test/video/upload/v123/interview.mp4',
        public_id: 'careerak/interview-recordings/interview',
        bytes: 52428800, // 50 MB
        duration: 1800, // 30 دقيقة
        format: 'mp4'
      };
      
      // إرجاع stream وهمي
      return {
        end: (buffer) => {
          setTimeout(() => callback(null, mockResult), 100);
        }
      };
    }),
    destroy: jest.fn((publicId, options, callback) => {
      // Handle both callback and promise styles
      if (typeof callback === 'function') {
        callback(null, { result: 'ok' });
      }
      return Promise.resolve({ result: 'ok' });
    })
  },
  url: jest.fn((publicId, options) => {
    return `https://res.cloudinary.com/test/video/upload/${publicId}.jpg`;
  })
}));

describe('RecordingService', () => {
  let testInterview;
  let testRecording;
  let hostId;
  let participantId;

  beforeAll(async () => {
    // الاتصال بقاعدة البيانات للاختبار
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test');
    }
  });

  beforeEach(async () => {
    // تنظيف قاعدة البيانات
    await VideoInterview.deleteMany({});
    await InterviewRecording.deleteMany({});

    // إنشاء معرفات وهمية
    hostId = new mongoose.Types.ObjectId();
    participantId = new mongoose.Types.ObjectId();

    // إنشاء مقابلة اختبارية
    testInterview = await VideoInterview.create({
      roomId: 'test-room-123',
      hostId: hostId,
      participants: [
        { userId: hostId, role: 'host' },
        { userId: participantId, role: 'participant' }
      ],
      status: 'active',
      settings: {
        recordingEnabled: true,
        waitingRoomEnabled: false,
        screenShareEnabled: true,
        chatEnabled: true,
        maxParticipants: 10
      },
      recordingConsent: [
        { userId: hostId, consented: true, consentedAt: new Date() },
        { userId: participantId, consented: true, consentedAt: new Date() }
      ]
    });
  });

  afterAll(async () => {
    // تنظيف وإغلاق الاتصال
    await VideoInterview.deleteMany({});
    await InterviewRecording.deleteMany({});
    await mongoose.connection.close();
  });

  describe('startRecording', () => {
    test('يجب أن يبدأ التسجيل بنجاح عندما تكون جميع الشروط مستوفاة', async () => {
      const result = await recordingService.startRecording(
        testInterview._id.toString(),
        hostId.toString()
      );

      expect(result.success).toBe(true);
      expect(result.recordingId).toBeDefined();
      expect(result.message).toContain('بدأ التسجيل بنجاح');

      // التحقق من إنشاء سجل التسجيل
      const recording = await InterviewRecording.findById(result.recordingId);
      expect(recording).toBeDefined();
      expect(recording.status).toBe('recording');
      expect(recording.interviewId.toString()).toBe(testInterview._id.toString());
    });

    test('يجب أن يفشل إذا كانت المقابلة غير موجودة', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await expect(
        recordingService.startRecording(fakeId.toString(), hostId.toString())
      ).rejects.toThrow('المقابلة غير موجودة');
    });

    test('يجب أن يفشل إذا لم يكن المستخدم هو المضيف', async () => {
      await expect(
        recordingService.startRecording(
          testInterview._id.toString(),
          participantId.toString()
        )
      ).rejects.toThrow('فقط المضيف يمكنه بدء التسجيل');
    });

    test('يجب أن يفشل إذا كان التسجيل غير مفعّل', async () => {
      testInterview.settings.recordingEnabled = false;
      await testInterview.save();

      await expect(
        recordingService.startRecording(
          testInterview._id.toString(),
          hostId.toString()
        )
      ).rejects.toThrow('التسجيل غير مفعّل لهذه المقابلة');
    });

    test('يجب أن يفشل إذا لم يوافق جميع المشاركين', async () => {
      testInterview.recordingConsent[1].consented = false;
      await testInterview.save();

      await expect(
        recordingService.startRecording(
          testInterview._id.toString(),
          hostId.toString()
        )
      ).rejects.toThrow('يجب موافقة جميع المشاركين قبل بدء التسجيل');
    });
  });

  describe('stopRecording', () => {
    beforeEach(async () => {
      // بدء تسجيل
      const result = await recordingService.startRecording(
        testInterview._id.toString(),
        hostId.toString()
      );
      testRecording = await InterviewRecording.findById(result.recordingId);
    });

    test('يجب أن يوقف التسجيل بنجاح', async () => {
      // Wait a bit to ensure duration > 0
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = await recordingService.stopRecording(
        testRecording._id.toString(),
        hostId.toString()
      );

      expect(result.success).toBe(true);
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.message).toContain('تم إيقاف التسجيل');

      // التحقق من تحديث السجل
      const recording = await InterviewRecording.findById(testRecording._id);
      expect(recording.status).toBe('processing');
      expect(recording.endTime).toBeDefined();
      expect(recording.duration).toBeGreaterThanOrEqual(0);
    });

    test('يجب أن يفشل إذا كان التسجيل غير موجود', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await expect(
        recordingService.stopRecording(fakeId.toString(), hostId.toString())
      ).rejects.toThrow('التسجيل غير موجود');
    });

    test('يجب أن يفشل إذا لم يكن التسجيل قيد التشغيل', async () => {
      testRecording.status = 'ready';
      await testRecording.save();

      await expect(
        recordingService.stopRecording(
          testRecording._id.toString(),
          hostId.toString()
        )
      ).rejects.toThrow('التسجيل ليس قيد التشغيل');
    });

    test('يجب أن يفشل إذا لم يكن المستخدم هو المضيف', async () => {
      await expect(
        recordingService.stopRecording(
          testRecording._id.toString(),
          participantId.toString()
        )
      ).rejects.toThrow('فقط المضيف يمكنه إيقاف التسجيل');
    });
  });

  describe('uploadRecording', () => {
    beforeEach(async () => {
      // بدء وإيقاف تسجيل
      const startResult = await recordingService.startRecording(
        testInterview._id.toString(),
        hostId.toString()
      );
      testRecording = await InterviewRecording.findById(startResult.recordingId);
      
      await recordingService.stopRecording(
        testRecording._id.toString(),
        hostId.toString()
      );
    });

    test('يجب أن يرفع التسجيل بنجاح', async () => {
      const mockBuffer = Buffer.from('fake video data');
      
      const result = await recordingService.uploadRecording(
        testRecording._id.toString(),
        mockBuffer,
        'video/webm'
      );

      expect(result.success).toBe(true);
      expect(result.fileUrl).toBeDefined();
      expect(result.fileSize).toBeGreaterThan(0);
      expect(result.message).toContain('تم رفع التسجيل بنجاح');

      // التحقق من تحديث السجل
      const recording = await InterviewRecording.findById(testRecording._id);
      expect(recording.status).toBe('ready');
      expect(recording.fileUrl).toBeDefined();
      expect(recording.expiresAt).toBeDefined();
    });

    test('يجب أن يفشل إذا كان التسجيل غير موجود', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const mockBuffer = Buffer.from('fake video data');
      
      await expect(
        recordingService.uploadRecording(fakeId.toString(), mockBuffer)
      ).rejects.toThrow('التسجيل غير موجود');
    });

    test('يجب أن يحدث حالة التسجيل إلى failed عند فشل الرفع', async () => {
      // محاكاة فشل الرفع
      const cloudinary = require('../src/config/cloudinary');
      cloudinary.uploader.upload_stream.mockImplementationOnce((options, callback) => {
        return {
          end: (buffer) => {
            setTimeout(() => callback(new Error('Upload failed'), null), 100);
          }
        };
      });

      const mockBuffer = Buffer.from('fake video data');
      
      await expect(
        recordingService.uploadRecording(testRecording._id.toString(), mockBuffer)
      ).rejects.toThrow();

      // التحقق من تحديث الحالة
      const recording = await InterviewRecording.findById(testRecording._id);
      expect(recording.status).toBe('failed');
    });
  });

  describe('generateThumbnail', () => {
    test('يجب أن يولد صورة مصغرة بنجاح', async () => {
      const recording = await InterviewRecording.create({
        interviewId: testInterview._id,
        startTime: new Date(),
        status: 'ready'
      });

      const result = await recordingService.generateThumbnail(
        recording._id.toString(),
        'careerak/interview-recordings/test-video'
      );

      expect(result.success).toBe(true);
      expect(result.thumbnailUrl).toBeDefined();

      // التحقق من تحديث السجل
      const updatedRecording = await InterviewRecording.findById(recording._id);
      expect(updatedRecording.thumbnailUrl).toBeDefined();
    });
  });

  describe('getRecording', () => {
    test('يجب أن يحصل على معلومات التسجيل بنجاح', async () => {
      const recording = await InterviewRecording.create({
        interviewId: testInterview._id,
        startTime: new Date(),
        endTime: new Date(),
        duration: 1800,
        status: 'ready',
        fileUrl: 'https://example.com/video.mp4'
      });

      const result = await recordingService.getRecording(recording._id.toString());

      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(recording._id.toString());
      expect(result.interviewId).toBeDefined();
    });

    test('يجب أن يفشل إذا كان التسجيل غير موجود', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await expect(
        recordingService.getRecording(fakeId.toString())
      ).rejects.toThrow('التسجيل غير موجود');
    });
  });

  describe('deleteRecording', () => {
    test('يجب أن يحذف التسجيل بنجاح', async () => {
      const recording = await InterviewRecording.create({
        interviewId: testInterview._id,
        startTime: new Date(),
        status: 'ready',
        fileUrl: 'https://res.cloudinary.com/test/video/upload/v123/interview.mp4'
      });

      const result = await recordingService.deleteRecording(
        recording._id.toString(),
        hostId.toString()
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('تم حذف التسجيل بنجاح');

      // التحقق من تحديث السجل
      const deletedRecording = await InterviewRecording.findById(recording._id);
      expect(deletedRecording.status).toBe('deleted');
      expect(deletedRecording.fileUrl).toBeNull();
    });

    test('يجب أن يفشل إذا لم يكن المستخدم هو المضيف', async () => {
      const recording = await InterviewRecording.create({
        interviewId: testInterview._id,
        startTime: new Date(),
        status: 'ready'
      });

      await expect(
        recordingService.deleteRecording(
          recording._id.toString(),
          participantId.toString()
        )
      ).rejects.toThrow('فقط المضيف يمكنه حذف التسجيل');
    });
  });

  describe('deleteExpiredRecordings', () => {
    test('يجب أن يحذف التسجيلات المنتهية', async () => {
      // إنشاء تسجيل منتهي
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1); // أمس

      await InterviewRecording.create({
        interviewId: testInterview._id,
        startTime: new Date(),
        status: 'ready',
        fileUrl: 'https://res.cloudinary.com/test/video/upload/v123/expired.mp4',
        expiresAt: expiredDate
      });

      // إنشاء تسجيل غير منتهي
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      await InterviewRecording.create({
        interviewId: testInterview._id,
        startTime: new Date(),
        status: 'ready',
        fileUrl: 'https://res.cloudinary.com/test/video/upload/v123/active.mp4',
        expiresAt: futureDate
      });

      const result = await recordingService.deleteExpiredRecordings();

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(1);

      // التحقق من حذف التسجيل المنتهي فقط
      const recordings = await InterviewRecording.find({ status: 'ready' });
      expect(recordings.length).toBe(1);
    });
  });

  describe('incrementDownloadCount', () => {
    test('يجب أن يزيد عداد التحميلات', async () => {
      const recording = await InterviewRecording.create({
        interviewId: testInterview._id,
        startTime: new Date(),
        status: 'ready',
        downloadCount: 0
      });

      await recordingService.incrementDownloadCount(recording._id.toString());

      const updatedRecording = await InterviewRecording.findById(recording._id);
      expect(updatedRecording.downloadCount).toBe(1);

      await recordingService.incrementDownloadCount(recording._id.toString());
      
      const finalRecording = await InterviewRecording.findById(recording._id);
      expect(finalRecording.downloadCount).toBe(2);
    });
  });

  describe('extractPublicId', () => {
    test('يجب أن يستخرج public_id من رابط Cloudinary', () => {
      const url = 'https://res.cloudinary.com/test/video/upload/v123/careerak/interview-recordings/interview.mp4';
      const publicId = recordingService.extractPublicId(url);
      
      expect(publicId).toBe('careerak/interview-recordings/interview');
    });
  });
});
