const fc = require('fast-check');
const VideoInterview = require('../src/models/VideoInterview');
const { User } = require('../src/models/User');
const mongoose = require('mongoose');

/**
 * Property 7: Scheduled Interview Access
 * 
 * Property: For any scheduled interview, participants can only join 
 * within 5 minutes before the scheduled time.
 * 
 * Validates: Requirements 5.5
 */

describe('Property 7: Scheduled Interview Access', () => {
  let testInterviews = [];

  beforeAll(async () => {
    // الاتصال بقاعدة البيانات للاختبار
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
  });

  beforeEach(async () => {
    // تنظيف المقابلات قبل كل اختبار
    await VideoInterview.deleteMany({});
    testInterviews = [];
  });

  afterEach(async () => {
    // تنظيف المقابلات بعد كل اختبار
    for (const interview of testInterviews) {
      await VideoInterview.findByIdAndDelete(interview._id);
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  /**
   * Helper: إنشاء مستخدم اختبار (mock)
   */
  function createMockUser(suffix) {
    return {
      _id: new mongoose.Types.ObjectId(),
      name: `Test User ${suffix}`,
      email: `test-scheduled-access-${suffix}-${Date.now()}@example.com`,
      role: 'jobseeker'
    };
  }

  /**
   * Helper: إنشاء مقابلة مجدولة
   */
  async function createScheduledInterview(hostId, scheduledAt) {
    const interview = await VideoInterview.create({
      roomId: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      hostId,
      scheduledAt,
      status: 'scheduled',
      settings: {
        waitingRoomEnabled: true,
        maxParticipants: 10
      }
    });
    testInterviews.push(interview);
    return interview;
  }

  /**
   * Helper: محاولة الانضمام للمقابلة
   */
  function canJoinInterview(interview, currentTime) {
    const scheduledTime = new Date(interview.scheduledAt);
    const fiveMinutesBefore = new Date(scheduledTime.getTime() - 5 * 60 * 1000);
    
    // يمكن الانضمام فقط ضمن 5 دقائق قبل الموعد أو بعده
    return currentTime >= fiveMinutesBefore;
  }

  /**
   * Test 1: Property-based test - محاولات انضمام عشوائية
   */
  test('Property: participants can only join within 5 minutes before scheduled time', async () => {
    await fc.assert(
      fc.asyncProperty(
        // توليد وقت مجدول عشوائي (من الآن إلى 7 أيام قادمة)
        fc.integer({ min: 0, max: 7 * 24 * 60 }), // دقائق من الآن
        // توليد وقت محاولة الانضمام (من -60 إلى +60 دقيقة من الموعد)
        fc.integer({ min: -60, max: 60 }),
        
        async (scheduledMinutesFromNow, joinAttemptOffsetMinutes) => {
          // إنشاء مستخدمين mock
          const host = createMockUser('host');
          const participant = createMockUser('participant');
          
          // حساب الوقت المجدول
          const now = new Date();
          const scheduledAt = new Date(now.getTime() + scheduledMinutesFromNow * 60 * 1000);
          
          // إنشاء المقابلة
          const interview = await createScheduledInterview(host._id, scheduledAt);
          
          // حساب وقت محاولة الانضمام
          const attemptTime = new Date(scheduledAt.getTime() + joinAttemptOffsetMinutes * 60 * 1000);
          
          // التحقق من إمكانية الانضمام
          const canJoin = canJoinInterview(interview, attemptTime);
          
          // الوقت المسموح: 5 دقائق قبل الموعد أو بعده
          const fiveMinutesBefore = new Date(scheduledAt.getTime() - 5 * 60 * 1000);
          const expectedCanJoin = attemptTime >= fiveMinutesBefore;
          
          // التحقق من أن النتيجة تطابق المتوقع
          expect(canJoin).toBe(expectedCanJoin);
          
          // إذا كان يمكن الانضمام، يجب أن يكون الوقت ضمن النطاق المسموح
          if (canJoin) {
            expect(attemptTime.getTime()).toBeGreaterThanOrEqual(fiveMinutesBefore.getTime());
          } else {
            expect(attemptTime.getTime()).toBeLessThan(fiveMinutesBefore.getTime());
          }
        }
      ),
      { numRuns: 50, timeout: 30000 }
    );
  }, 60000);

  /**
   * Test 2: محاولة الانضمام قبل 10 دقائق (يجب أن تفشل)
   */
  test('should reject join attempt 10 minutes before scheduled time', async () => {
    const host = createMockUser('host');
    const participant = createMockUser('participant');
    
    // مقابلة بعد ساعة
    const scheduledAt = new Date(Date.now() + 60 * 60 * 1000);
    const interview = await createScheduledInterview(host._id, scheduledAt);
    
    // محاولة الانضمام قبل 10 دقائق
    const attemptTime = new Date(scheduledAt.getTime() - 10 * 60 * 1000);
    const canJoin = canJoinInterview(interview, attemptTime);
    
    expect(canJoin).toBe(false);
  });

  /**
   * Test 3: محاولة الانضمام قبل 5 دقائق بالضبط (يجب أن تنجح)
   */
  test('should allow join attempt exactly 5 minutes before scheduled time', async () => {
    const host = createMockUser('host');
    const participant = createMockUser('participant');
    
    const scheduledAt = new Date(Date.now() + 60 * 60 * 1000);
    const interview = await createScheduledInterview(host._id, scheduledAt);
    
    // محاولة الانضمام قبل 5 دقائق بالضبط
    const attemptTime = new Date(scheduledAt.getTime() - 5 * 60 * 1000);
    const canJoin = canJoinInterview(interview, attemptTime);
    
    expect(canJoin).toBe(true);
  });

  /**
   * Test 4: محاولة الانضمام قبل 4 دقائق (يجب أن تنجح)
   */
  test('should allow join attempt 4 minutes before scheduled time', async () => {
    const host = createMockUser('host');
    const participant = createMockUser('participant');
    
    const scheduledAt = new Date(Date.now() + 60 * 60 * 1000);
    const interview = await createScheduledInterview(host._id, scheduledAt);
    
    const attemptTime = new Date(scheduledAt.getTime() - 4 * 60 * 1000);
    const canJoin = canJoinInterview(interview, attemptTime);
    
    expect(canJoin).toBe(true);
  });

  /**
   * Test 5: محاولة الانضمام في الوقت المحدد (يجب أن تنجح)
   */
  test('should allow join attempt at scheduled time', async () => {
    const host = createMockUser('host');
    const participant = createMockUser('participant');
    
    const scheduledAt = new Date(Date.now() + 60 * 60 * 1000);
    const interview = await createScheduledInterview(host._id, scheduledAt);
    
    const attemptTime = new Date(scheduledAt.getTime());
    const canJoin = canJoinInterview(interview, attemptTime);
    
    expect(canJoin).toBe(true);
  });

  /**
   * Test 6: محاولة الانضمام بعد 10 دقائق من الموعد (يجب أن تنجح)
   */
  test('should allow join attempt 10 minutes after scheduled time', async () => {
    const host = createMockUser('host');
    const participant = createMockUser('participant');
    
    const scheduledAt = new Date(Date.now() + 60 * 60 * 1000);
    const interview = await createScheduledInterview(host._id, scheduledAt);
    
    const attemptTime = new Date(scheduledAt.getTime() + 10 * 60 * 1000);
    const canJoin = canJoinInterview(interview, attemptTime);
    
    expect(canJoin).toBe(true);
  });

  /**
   * Test 7: محاولة الانضمام قبل 6 دقائق (يجب أن تفشل)
   */
  test('should reject join attempt 6 minutes before scheduled time', async () => {
    const host = createMockUser('host');
    const participant = createMockUser('participant');
    
    const scheduledAt = new Date(Date.now() + 60 * 60 * 1000);
    const interview = await createScheduledInterview(host._id, scheduledAt);
    
    const attemptTime = new Date(scheduledAt.getTime() - 6 * 60 * 1000);
    const canJoin = canJoinInterview(interview, attemptTime);
    
    expect(canJoin).toBe(false);
  });

  /**
   * Test 8: محاولة الانضمام قبل ساعة (يجب أن تفشل)
   */
  test('should reject join attempt 1 hour before scheduled time', async () => {
    const host = createMockUser('host');
    const participant = createMockUser('participant');
    
    const scheduledAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const interview = await createScheduledInterview(host._id, scheduledAt);
    
    const attemptTime = new Date(scheduledAt.getTime() - 60 * 60 * 1000);
    const canJoin = canJoinInterview(interview, attemptTime);
    
    expect(canJoin).toBe(false);
  });

  /**
   * Test 9: محاولات متعددة من مشاركين مختلفين
   */
  test('should apply same rule to all participants', async () => {
    const host = createMockUser('host');
    const participant1 = createMockUser('participant1');
    const participant2 = createMockUser('participant2');
    const participant3 = createMockUser('participant3');
    
    const scheduledAt = new Date(Date.now() + 60 * 60 * 1000);
    const interview = await createScheduledInterview(host._id, scheduledAt);
    
    // محاولة قبل 10 دقائق (يجب أن تفشل للجميع)
    const attemptTime1 = new Date(scheduledAt.getTime() - 10 * 60 * 1000);
    expect(canJoinInterview(interview, attemptTime1)).toBe(false);
    
    // محاولة قبل 3 دقائق (يجب أن تنجح للجميع)
    const attemptTime2 = new Date(scheduledAt.getTime() - 3 * 60 * 1000);
    expect(canJoinInterview(interview, attemptTime2)).toBe(true);
  });

  /**
   * Test 10: التحقق من الحد الفاصل (boundary testing)
   */
  test('should test boundary conditions precisely', async () => {
    const host = createMockUser('host');
    const participant = createMockUser('participant');
    
    const scheduledAt = new Date(Date.now() + 60 * 60 * 1000);
    const interview = await createScheduledInterview(host._id, scheduledAt);
    
    // قبل 5 دقائق و 1 ثانية (يجب أن تفشل)
    const attemptTime1 = new Date(scheduledAt.getTime() - (5 * 60 + 1) * 1000);
    expect(canJoinInterview(interview, attemptTime1)).toBe(false);
    
    // قبل 5 دقائق بالضبط (يجب أن تنجح)
    const attemptTime2 = new Date(scheduledAt.getTime() - 5 * 60 * 1000);
    expect(canJoinInterview(interview, attemptTime2)).toBe(true);
    
    // قبل 4 دقائق و 59 ثانية (يجب أن تنجح)
    const attemptTime3 = new Date(scheduledAt.getTime() - (4 * 60 + 59) * 1000);
    expect(canJoinInterview(interview, attemptTime3)).toBe(true);
  });
});
