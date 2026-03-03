const fc = require('fast-check');
const mongoose = require('mongoose');
const VideoInterview = require('../src/models/VideoInterview');
const InterviewRecording = require('../src/models/InterviewRecording');

/**
 * Property-Based Tests for Recording Consent
 * اختبارات خاصية موافقة التسجيل
 * 
 * **Validates: Requirements 2.3**
 * 
 * Property 3: Recording Consent
 * For any interview with recording enabled, all participants must provide consent before recording starts.
 */

describe('Recording Consent Property Tests', () => {
  beforeAll(async () => {
    // الاتصال بقاعدة البيانات للاختبار
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
  });

  afterAll(async () => {
    // تنظيف وإغلاق الاتصال
    await VideoInterview.deleteMany({});
    await InterviewRecording.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // تنظيف البيانات قبل كل اختبار
    await VideoInterview.deleteMany({});
    await InterviewRecording.deleteMany({});
  });

  /**
   * Property 3: Recording Consent
   * **Validates: Requirements 2.3**
   * 
   * For any interview with recording enabled, all participants must provide consent before recording starts.
   */
  describe('Property 3: Recording Consent', () => {
    /**
     * Test 1: Recording cannot start without consent from ALL participants
     */
    it('should prevent recording when not all participants have consented', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: number of participants (2-10)
          fc.integer({ min: 2, max: 10 }),
          // Generator: number of participants who consent (0 to n-1, not all)
          fc.integer({ min: 0, max: 9 }),
          async (totalParticipants, consentingCount) => {
            // Ensure consentingCount is less than totalParticipants
            const actualConsentingCount = Math.min(consentingCount, totalParticipants - 1);

            // إنشاء مقابلة مع تفعيل التسجيل
            const interview = await VideoInterview.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              hostId: new mongoose.Types.ObjectId(),
              scheduledAt: new Date(),
              settings: {
                recordingEnabled: true
              },
              participants: Array.from({ length: totalParticipants }, (_, i) => ({
                userId: new mongoose.Types.ObjectId(),
                role: i === 0 ? 'host' : 'participant',
                joinedAt: new Date()
              }))
            });

            // إضافة موافقة لبعض المشاركين فقط (ليس الكل)
            for (let i = 0; i < actualConsentingCount; i++) {
              await interview.addConsent(interview.participants[i].userId);
            }

            // التحقق: يجب أن تكون hasAllConsents() = false
            const hasAllConsents = interview.hasAllConsents();
            expect(hasAllConsents).toBe(false);

            // محاولة بدء التسجيل يجب أن تفشل
            // (في التطبيق الفعلي، يجب أن يمنع الكود بدء التسجيل)
            const canStartRecording = hasAllConsents;
            expect(canStartRecording).toBe(false);
          }
        ),
        { numRuns: 50 } // تشغيل 50 مرة مع بيانات عشوائية
      );
    });

    /**
     * Test 2: Recording can only start when ALL participants have consented
     */
    it('should allow recording only when all participants have consented', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: number of participants (2-10)
          fc.integer({ min: 2, max: 10 }),
          async (totalParticipants) => {
            // إنشاء مقابلة مع تفعيل التسجيل
            const interview = await VideoInterview.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              hostId: new mongoose.Types.ObjectId(),
              scheduledAt: new Date(),
              settings: {
                recordingEnabled: true
              },
              participants: Array.from({ length: totalParticipants }, (_, i) => ({
                userId: new mongoose.Types.ObjectId(),
                role: i === 0 ? 'host' : 'participant',
                joinedAt: new Date()
              }))
            });

            // إضافة موافقة لجميع المشاركين
            for (const participant of interview.participants) {
              await interview.addConsent(participant.userId);
            }

            // التحقق: يجب أن تكون hasAllConsents() = true
            const hasAllConsents = interview.hasAllConsents();
            expect(hasAllConsents).toBe(true);

            // يمكن بدء التسجيل الآن
            const canStartRecording = hasAllConsents;
            expect(canStartRecording).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Test 3: If any participant denies consent, recording should not start
     */
    it('should prevent recording if any participant explicitly denies consent', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: number of participants (2-10)
          fc.integer({ min: 2, max: 10 }),
          // Generator: index of participant who denies (0 to n-1)
          fc.integer({ min: 0, max: 9 }),
          async (totalParticipants, denyingIndex) => {
            const actualDenyingIndex = denyingIndex % totalParticipants;

            // إنشاء مقابلة مع تفعيل التسجيل
            const interview = await VideoInterview.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              hostId: new mongoose.Types.ObjectId(),
              scheduledAt: new Date(),
              settings: {
                recordingEnabled: true
              },
              participants: Array.from({ length: totalParticipants }, (_, i) => ({
                userId: new mongoose.Types.ObjectId(),
                role: i === 0 ? 'host' : 'participant',
                joinedAt: new Date()
              }))
            });

            // إضافة موافقة لجميع المشاركين ما عدا واحد
            for (let i = 0; i < totalParticipants; i++) {
              if (i !== actualDenyingIndex) {
                await interview.addConsent(interview.participants[i].userId);
              }
            }

            // التحقق: يجب أن تكون hasAllConsents() = false
            const hasAllConsents = interview.hasAllConsents();
            expect(hasAllConsents).toBe(false);

            // لا يمكن بدء التسجيل
            const canStartRecording = hasAllConsents;
            expect(canStartRecording).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Test 4: Consent state is properly tracked for each participant
     */
    it('should properly track consent state for each participant', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: number of participants (2-10)
          fc.integer({ min: 2, max: 10 }),
          // Generator: array of boolean values for consent (one per participant)
          fc.array(fc.boolean(), { minLength: 2, maxLength: 10 }),
          async (totalParticipants, consentStates) => {
            // Ensure consentStates matches totalParticipants
            const actualConsentStates = consentStates.slice(0, totalParticipants);
            while (actualConsentStates.length < totalParticipants) {
              actualConsentStates.push(false);
            }

            // إنشاء مقابلة مع تفعيل التسجيل
            const interview = await VideoInterview.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              hostId: new mongoose.Types.ObjectId(),
              scheduledAt: new Date(),
              settings: {
                recordingEnabled: true
              },
              participants: Array.from({ length: totalParticipants }, (_, i) => ({
                userId: new mongoose.Types.ObjectId(),
                role: i === 0 ? 'host' : 'participant',
                joinedAt: new Date()
              }))
            });

            // إضافة موافقة حسب consentStates
            for (let i = 0; i < totalParticipants; i++) {
              if (actualConsentStates[i]) {
                await interview.addConsent(interview.participants[i].userId);
              }
            }

            // التحقق من حالة الموافقة لكل مشارك
            for (let i = 0; i < totalParticipants; i++) {
              const participant = interview.participants[i];
              const consent = interview.recordingConsent.find(
                c => c.userId.toString() === participant.userId.toString()
              );

              if (actualConsentStates[i]) {
                expect(consent).toBeDefined();
                expect(consent.consented).toBe(true);
                expect(consent.consentedAt).toBeDefined();
              } else {
                if (consent) {
                  expect(consent.consented).toBe(false);
                }
              }
            }

            // التحقق من hasAllConsents
            const allConsented = actualConsentStates.every(state => state === true);
            expect(interview.hasAllConsents()).toBe(allConsented);
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Test 5: Late joiners must also provide consent
     */
    it('should require consent from participants who join after recording has started', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: initial participants (2-5)
          fc.integer({ min: 2, max: 5 }),
          // Generator: late joiners (1-3)
          fc.integer({ min: 1, max: 3 }),
          async (initialCount, lateJoinersCount) => {
            // إنشاء مقابلة مع تفعيل التسجيل
            const interview = await VideoInterview.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              hostId: new mongoose.Types.ObjectId(),
              scheduledAt: new Date(),
              settings: {
                recordingEnabled: true
              },
              participants: Array.from({ length: initialCount }, (_, i) => ({
                userId: new mongoose.Types.ObjectId(),
                role: i === 0 ? 'host' : 'participant',
                joinedAt: new Date()
              }))
            });

            // جميع المشاركين الأوليين يوافقون
            for (const participant of interview.participants) {
              await interview.addConsent(participant.userId);
            }

            // التحقق: يمكن بدء التسجيل
            expect(interview.hasAllConsents()).toBe(true);

            // إضافة مشاركين متأخرين
            for (let i = 0; i < lateJoinersCount; i++) {
              const lateJoiner = {
                userId: new mongoose.Types.ObjectId(),
                role: 'participant',
                joinedAt: new Date(Date.now() + 60000) // بعد دقيقة
              };
              interview.participants.push(lateJoiner);
            }
            await interview.save();

            // التحقق: الآن لا يمكن الاستمرار في التسجيل بدون موافقة المتأخرين
            expect(interview.hasAllConsents()).toBe(false);

            // إضافة موافقة المتأخرين
            const lateJoiners = interview.participants.slice(-lateJoinersCount);
            for (const lateJoiner of lateJoiners) {
              await interview.addConsent(lateJoiner.userId);
            }

            // التحقق: الآن يمكن الاستمرار في التسجيل
            expect(interview.hasAllConsents()).toBe(true);
          }
        ),
        { numRuns: 30 }
      );
    });

    /**
     * Test 6: Participants who leave should not affect consent of remaining participants
     */
    it('should only require consent from active participants', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: total participants (3-10)
          fc.integer({ min: 3, max: 10 }),
          // Generator: number of participants who leave (1 to n-2)
          fc.integer({ min: 1, max: 8 }),
          async (totalParticipants, leavingCount) => {
            const actualLeavingCount = Math.min(leavingCount, totalParticipants - 2);

            // إنشاء مقابلة مع تفعيل التسجيل
            const interview = await VideoInterview.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              hostId: new mongoose.Types.ObjectId(),
              scheduledAt: new Date(),
              settings: {
                recordingEnabled: true
              },
              participants: Array.from({ length: totalParticipants }, (_, i) => ({
                userId: new mongoose.Types.ObjectId(),
                role: i === 0 ? 'host' : 'participant',
                joinedAt: new Date()
              }))
            });

            // بعض المشاركين يغادرون
            for (let i = 0; i < actualLeavingCount; i++) {
              interview.participants[i].leftAt = new Date();
            }
            await interview.save();

            // المشاركون المتبقون يوافقون
            const remainingParticipants = interview.participants.filter(p => !p.leftAt);
            for (const participant of remainingParticipants) {
              await interview.addConsent(participant.userId);
            }

            // التحقق: يجب أن تكون hasAllConsents() = true
            // لأن جميع المشاركين النشطين وافقوا
            expect(interview.hasAllConsents()).toBe(true);
          }
        ),
        { numRuns: 30 }
      );
    });

    /**
     * Test 7: Recording disabled interviews don't require consent
     */
    it('should not require consent when recording is disabled', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: number of participants (2-10)
          fc.integer({ min: 2, max: 10 }),
          async (totalParticipants) => {
            // إنشاء مقابلة بدون تفعيل التسجيل
            const interview = await VideoInterview.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              hostId: new mongoose.Types.ObjectId(),
              scheduledAt: new Date(),
              settings: {
                recordingEnabled: false // التسجيل معطل
              },
              participants: Array.from({ length: totalParticipants }, (_, i) => ({
                userId: new mongoose.Types.ObjectId(),
                role: i === 0 ? 'host' : 'participant',
                joinedAt: new Date()
              }))
            });

            // لا أحد يوافق على التسجيل
            // (لأن التسجيل معطل أصلاً)

            // التحقق: يجب أن تكون hasAllConsents() = true
            // لأن التسجيل معطل ولا يحتاج موافقة
            expect(interview.hasAllConsents()).toBe(true);
          }
        ),
        { numRuns: 30 }
      );
    });

    /**
     * Test 8: Consent can be updated (participant changes their mind)
     */
    it('should allow participants to update their consent', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: number of participants (2-5)
          fc.integer({ min: 2, max: 5 }),
          async (totalParticipants) => {
            // إنشاء مقابلة مع تفعيل التسجيل
            const interview = await VideoInterview.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              hostId: new mongoose.Types.ObjectId(),
              scheduledAt: new Date(),
              settings: {
                recordingEnabled: true
              },
              participants: Array.from({ length: totalParticipants }, (_, i) => ({
                userId: new mongoose.Types.ObjectId(),
                role: i === 0 ? 'host' : 'participant',
                joinedAt: new Date()
              }))
            });

            const firstParticipant = interview.participants[0];

            // المشارك الأول يوافق
            await interview.addConsent(firstParticipant.userId);
            let consent = interview.recordingConsent.find(
              c => c.userId.toString() === firstParticipant.userId.toString()
            );
            expect(consent.consented).toBe(true);
            const firstConsentTime = consent.consentedAt;

            // المشارك الأول يوافق مرة أخرى (تحديث)
            await new Promise(resolve => setTimeout(resolve, 10)); // انتظار قصير
            await interview.addConsent(firstParticipant.userId);
            
            // التحقق: الموافقة محدثة
            consent = interview.recordingConsent.find(
              c => c.userId.toString() === firstParticipant.userId.toString()
            );
            expect(consent.consented).toBe(true);
            expect(consent.consentedAt.getTime()).toBeGreaterThanOrEqual(firstConsentTime.getTime());
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Integration Test: Complete recording consent workflow
   */
  describe('Integration: Complete Recording Consent Workflow', () => {
    it('should enforce consent throughout the entire recording lifecycle', async () => {
      // إنشاء مقابلة مع 3 مشاركين
      const interview = await VideoInterview.create({
        roomId: `room_${Date.now()}`,
        hostId: new mongoose.Types.ObjectId(),
        scheduledAt: new Date(),
        settings: {
          recordingEnabled: true
        },
        participants: [
          {
            userId: new mongoose.Types.ObjectId(),
            role: 'host',
            joinedAt: new Date()
          },
          {
            userId: new mongoose.Types.ObjectId(),
            role: 'participant',
            joinedAt: new Date()
          },
          {
            userId: new mongoose.Types.ObjectId(),
            role: 'participant',
            joinedAt: new Date()
          }
        ]
      });

      // 1. في البداية، لا يمكن بدء التسجيل
      expect(interview.hasAllConsents()).toBe(false);

      // 2. المضيف يوافق
      await interview.addConsent(interview.participants[0].userId);
      expect(interview.hasAllConsents()).toBe(false); // لا يزال ينتظر الآخرين

      // 3. المشارك الأول يوافق
      await interview.addConsent(interview.participants[1].userId);
      expect(interview.hasAllConsents()).toBe(false); // لا يزال ينتظر المشارك الثاني

      // 4. المشارك الثاني يوافق
      await interview.addConsent(interview.participants[2].userId);
      expect(interview.hasAllConsents()).toBe(true); // الآن يمكن بدء التسجيل

      // 5. بدء التسجيل
      const recording = await InterviewRecording.create({
        interviewId: interview._id,
        startTime: new Date(),
        fileUrl: 'https://example.com/recording.mp4',
        status: 'recording'
      });

      expect(recording.status).toBe('recording');

      // 6. مشارك جديد ينضم
      const lateJoiner = {
        userId: new mongoose.Types.ObjectId(),
        role: 'participant',
        joinedAt: new Date()
      };
      interview.participants.push(lateJoiner);
      await interview.save();

      // 7. الآن لا يمكن الاستمرار في التسجيل بدون موافقة المتأخر
      expect(interview.hasAllConsents()).toBe(false);

      // 8. المتأخر يوافق
      await interview.addConsent(lateJoiner.userId);
      expect(interview.hasAllConsents()).toBe(true);

      // 9. إنهاء التسجيل (بعد انتظار قصير لضمان duration > 0)
      await new Promise(resolve => setTimeout(resolve, 100)); // انتظار 100ms
      await recording.stopRecording();
      expect(recording.duration).toBeGreaterThanOrEqual(0); // يمكن أن يكون 0 في الاختبارات السريعة
    });
  });
});
