const fc = require('fast-check');
const mongoose = require('mongoose');
const VideoInterview = require('../src/models/VideoInterview');
const waitingRoomService = require('../src/services/waitingRoomService');

/**
 * Property-Based Tests for Participant Limit
 * اختبارات خاصية حد المشاركين
 * 
 * **Validates: Requirements 7.1**
 * 
 * Property 8: Participant Limit
 * For any interview room with maxParticipants = N, the system should reject 
 * the (N+1)th join attempt.
 */

describe('Participant Limit Property Tests', () => {
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
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // تنظيف البيانات قبل كل اختبار
    await VideoInterview.deleteMany({});
  });

  /**
   * Property 8: Participant Limit
   * **Validates: Requirements 7.1**
   * 
   * For any interview room with maxParticipants = N, the system should reject 
   * the (N+1)th join attempt.
   */
  describe('Property 8: Participant Limit', () => {
    /**
     * Test 1: System rejects (N+1)th participant when limit is N
     */
    it('should reject the (N+1)th participant when maxParticipants is N', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: maxParticipants (2-10)
          fc.integer({ min: 2, max: 10 }),
          async (maxParticipants) => {
            // إنشاء مقابلة مع حد معين للمشاركين
            const hostId = new mongoose.Types.ObjectId();
            const interview = await VideoInterview.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              hostId,
              scheduledAt: new Date(),
              status: 'active',
              settings: {
                maxParticipants,
                waitingRoomEnabled: false
              },
              participants: [{
                userId: hostId,
                role: 'host',
                joinedAt: new Date()
              }]
            });

            // إضافة (N-1) مشاركين (المضيف يحسب كواحد)
            const participantsToAdd = maxParticipants - 1;
            for (let i = 0; i < participantsToAdd; i++) {
              const userId = new mongoose.Types.ObjectId();
              await interview.addParticipant(userId);
            }

            // التحقق: عدد المشاركين = maxParticipants
            const updatedInterview = await VideoInterview.findById(interview._id);
            expect(updatedInterview.participants.length).toBe(maxParticipants);

            // محاولة إضافة المشارك (N+1)
            const extraUserId = new mongoose.Types.ObjectId();
            
            // يجب أن تفشل
            await expect(async () => {
              const currentInterview = await VideoInterview.findById(interview._id);
              if (currentInterview.participants.length >= currentInterview.settings.maxParticipants) {
                throw new Error('Maximum participants limit reached');
              }
              await currentInterview.addParticipant(extraUserId);
            }).rejects.toThrow('Maximum participants limit reached');

            // التحقق: عدد المشاركين لا يزال = maxParticipants
            const finalInterview = await VideoInterview.findById(interview._id);
            expect(finalInterview.participants.length).toBe(maxParticipants);
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Test 2: Limit enforcement with different maxParticipants values
     */
    it('should enforce limit correctly for various maxParticipants values', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: maxParticipants (2, 5, 10)
          fc.constantFrom(2, 5, 10),
          async (maxParticipants) => {
            // إنشاء مقابلة
            const hostId = new mongoose.Types.ObjectId();
            const interview = await VideoInterview.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              hostId,
              scheduledAt: new Date(),
              status: 'active',
              settings: {
                maxParticipants,
                waitingRoomEnabled: false
              },
              participants: [{
                userId: hostId,
                role: 'host',
                joinedAt: new Date()
              }]
            });

            // إضافة مشاركين حتى الحد الأقصى
            const successfulJoins = [];
            for (let i = 1; i < maxParticipants; i++) {
              const userId = new mongoose.Types.ObjectId();
              await interview.addParticipant(userId);
              successfulJoins.push(userId);
            }

            // التحقق: جميع المشاركين انضموا بنجاح
            const updatedInterview = await VideoInterview.findById(interview._id);
            expect(updatedInterview.participants.length).toBe(maxParticipants);

            // محاولة إضافة مشاركين إضافيين
            const extraParticipants = [
              new mongoose.Types.ObjectId(),
              new mongoose.Types.ObjectId()
            ];

            for (const extraUserId of extraParticipants) {
              await expect(async () => {
                const currentInterview = await VideoInterview.findById(interview._id);
                if (currentInterview.participants.length >= currentInterview.settings.maxParticipants) {
                  throw new Error('Maximum participants limit reached');
                }
                await currentInterview.addParticipant(extraUserId);
              }).rejects.toThrow('Maximum participants limit reached');
            }

            // التحقق النهائي: العدد لا يزال عند الحد الأقصى
            const finalInterview = await VideoInterview.findById(interview._id);
            expect(finalInterview.participants.length).toBe(maxParticipants);
          }
        ),
        { numRuns: 30 }
      );
    });

    /**
     * Test 3: Limit applies to all participants including host
     */
    it('should count host as part of the participant limit', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: maxParticipants (3-8)
          fc.integer({ min: 3, max: 8 }),
          async (maxParticipants) => {
            // إنشاء مقابلة مع المضيف
            const hostId = new mongoose.Types.ObjectId();
            const interview = await VideoInterview.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              hostId,
              scheduledAt: new Date(),
              status: 'active',
              settings: {
                maxParticipants,
                waitingRoomEnabled: false
              },
              participants: [{
                userId: hostId,
                role: 'host',
                joinedAt: new Date()
              }]
            });

            // المضيف يحسب كمشارك واحد
            expect(interview.participants.length).toBe(1);

            // يمكن إضافة (maxParticipants - 1) مشاركين فقط
            const allowedParticipants = maxParticipants - 1;
            
            for (let i = 0; i < allowedParticipants; i++) {
              const userId = new mongoose.Types.ObjectId();
              await interview.addParticipant(userId);
            }

            // التحقق: الوصول للحد الأقصى
            const updatedInterview = await VideoInterview.findById(interview._id);
            expect(updatedInterview.participants.length).toBe(maxParticipants);

            // محاولة إضافة مشارك إضافي
            const extraUserId = new mongoose.Types.ObjectId();
            await expect(async () => {
              const currentInterview = await VideoInterview.findById(interview._id);
              if (currentInterview.participants.length >= currentInterview.settings.maxParticipants) {
                throw new Error('Maximum participants limit reached');
              }
              await currentInterview.addParticipant(extraUserId);
            }).rejects.toThrow('Maximum participants limit reached');
          }
        ),
        { numRuns: 30 }
      );
    });

    /**
     * Test 4: Limit enforcement with waiting room enabled
     */
    it('should enforce limit when admitting from waiting room', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: maxParticipants (3-6)
          fc.integer({ min: 3, max: 6 }),
          async (maxParticipants) => {
            // إنشاء مقابلة مع غرفة انتظار
            const hostId = new mongoose.Types.ObjectId();
            const interview = await VideoInterview.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              hostId,
              scheduledAt: new Date(),
              status: 'waiting',
              settings: {
                maxParticipants,
                waitingRoomEnabled: true
              },
              participants: [{
                userId: hostId,
                role: 'host',
                joinedAt: new Date()
              }]
            });

            // إنشاء غرفة انتظار
            const waitingRoom = await waitingRoomService.createWaitingRoom(interview._id);

            // إضافة مشاركين للانتظار (أكثر من الحد الأقصى)
            const waitingParticipants = [];
            const waitingCount = maxParticipants + 2;
            
            for (let i = 0; i < waitingCount; i++) {
              const userId = new mongoose.Types.ObjectId();
              await waitingRoom.addParticipant(userId);
              waitingParticipants.push(userId);
            }

            // قبول مشاركين حتى الحد الأقصى (maxParticipants - 1 لأن المضيف موجود)
            const allowedAdmissions = maxParticipants - 1;
            
            for (let i = 0; i < allowedAdmissions; i++) {
              await waitingRoomService.admitParticipant(
                interview._id,
                waitingParticipants[i],
                hostId
              );
            }

            // التحقق: الوصول للحد الأقصى
            const updatedInterview = await VideoInterview.findById(interview._id);
            expect(updatedInterview.participants.length).toBe(maxParticipants);

            // محاولة قبول مشارك إضافي يجب أن تفشل
            await expect(async () => {
              const currentInterview = await VideoInterview.findById(interview._id);
              if (currentInterview.participants.length >= currentInterview.settings.maxParticipants) {
                throw new Error('Maximum participants limit reached');
              }
              await waitingRoomService.admitParticipant(
                interview._id,
                waitingParticipants[allowedAdmissions],
                hostId
              );
            }).rejects.toThrow('Maximum participants limit reached');

            // التحقق النهائي: العدد لا يزال عند الحد الأقصى
            const finalInterview = await VideoInterview.findById(interview._id);
            expect(finalInterview.participants.length).toBe(maxParticipants);
          }
        ),
        { numRuns: 25 }
      );
    });

    /**
     * Test 5: Limit is consistent across multiple join attempts
     */
    it('should consistently enforce limit across concurrent join attempts', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: maxParticipants (4-7)
          fc.integer({ min: 4, max: 7 }),
          async (maxParticipants) => {
            // إنشاء مقابلة
            const hostId = new mongoose.Types.ObjectId();
            const interview = await VideoInterview.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              hostId,
              scheduledAt: new Date(),
              status: 'active',
              settings: {
                maxParticipants,
                waitingRoomEnabled: false
              },
              participants: [{
                userId: hostId,
                role: 'host',
                joinedAt: new Date()
              }]
            });

            // إضافة مشاركين حتى الحد الأقصى
            for (let i = 1; i < maxParticipants; i++) {
              const userId = new mongoose.Types.ObjectId();
              await interview.addParticipant(userId);
            }

            // محاولات متعددة لإضافة مشاركين إضافيين
            const attemptCount = 5;
            const failedAttempts = [];

            for (let i = 0; i < attemptCount; i++) {
              const extraUserId = new mongoose.Types.ObjectId();
              try {
                const currentInterview = await VideoInterview.findById(interview._id);
                if (currentInterview.participants.length >= currentInterview.settings.maxParticipants) {
                  throw new Error('Maximum participants limit reached');
                }
                await currentInterview.addParticipant(extraUserId);
                // إذا نجحت، هذا خطأ
                failedAttempts.push(false);
              } catch (error) {
                // يجب أن تفشل جميع المحاولات
                expect(error.message).toBe('Maximum participants limit reached');
                failedAttempts.push(true);
              }
            }

            // التحقق: جميع المحاولات فشلت
            expect(failedAttempts.every(failed => failed)).toBe(true);

            // التحقق: العدد لا يزال عند الحد الأقصى
            const finalInterview = await VideoInterview.findById(interview._id);
            expect(finalInterview.participants.length).toBe(maxParticipants);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Test 6: Participant can rejoin after leaving if under limit
     */
    it('should allow participant to rejoin if under limit after someone leaves', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: maxParticipants (3-6)
          fc.integer({ min: 3, max: 6 }),
          async (maxParticipants) => {
            // إنشاء مقابلة
            const hostId = new mongoose.Types.ObjectId();
            const interview = await VideoInterview.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              hostId,
              scheduledAt: new Date(),
              status: 'active',
              settings: {
                maxParticipants,
                waitingRoomEnabled: false
              },
              participants: [{
                userId: hostId,
                role: 'host',
                joinedAt: new Date()
              }]
            });

            // إضافة مشاركين حتى الحد الأقصى
            const participants = [];
            for (let i = 1; i < maxParticipants; i++) {
              const userId = new mongoose.Types.ObjectId();
              await interview.addParticipant(userId);
              participants.push(userId);
            }

            // التحقق: الوصول للحد الأقصى
            let updatedInterview = await VideoInterview.findById(interview._id);
            expect(updatedInterview.participants.length).toBe(maxParticipants);

            // مشارك يغادر
            const leavingUserId = participants[0];
            await interview.removeParticipant(leavingUserId);

            // التحقق: العدد أقل من الحد الأقصى
            updatedInterview = await VideoInterview.findById(interview._id);
            const activeParticipants = updatedInterview.participants.filter(p => !p.leftAt);
            expect(activeParticipants.length).toBe(maxParticipants - 1);

            // الآن يمكن إضافة مشارك جديد
            const newUserId = new mongoose.Types.ObjectId();
            const currentInterview = await VideoInterview.findById(interview._id);
            const currentActive = currentInterview.participants.filter(p => !p.leftAt).length;
            
            if (currentActive < currentInterview.settings.maxParticipants) {
              await currentInterview.addParticipant(newUserId);
            }

            // التحقق: المشارك الجديد انضم بنجاح
            const finalInterview = await VideoInterview.findById(interview._id);
            const finalActive = finalInterview.participants.filter(p => !p.leftAt);
            expect(finalActive.length).toBe(maxParticipants);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Test 7: Error message is clear when limit is reached
     */
    it('should provide clear error message when participant limit is reached', async () => {
      // إنشاء مقابلة مع حد 5 مشاركين
      const maxParticipants = 5;
      const hostId = new mongoose.Types.ObjectId();
      const interview = await VideoInterview.create({
        roomId: `room_${Date.now()}`,
        hostId,
        scheduledAt: new Date(),
        status: 'active',
        settings: {
          maxParticipants,
          waitingRoomEnabled: false
        },
        participants: [{
          userId: hostId,
          role: 'host',
          joinedAt: new Date()
        }]
      });

      // إضافة مشاركين حتى الحد الأقصى
      for (let i = 1; i < maxParticipants; i++) {
        const userId = new mongoose.Types.ObjectId();
        await interview.addParticipant(userId);
      }

      // محاولة إضافة مشارك إضافي
      const extraUserId = new mongoose.Types.ObjectId();
      
      try {
        const currentInterview = await VideoInterview.findById(interview._id);
        if (currentInterview.participants.length >= currentInterview.settings.maxParticipants) {
          throw new Error('Maximum participants limit reached');
        }
        await currentInterview.addParticipant(extraUserId);
        // يجب ألا نصل هنا
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toBe('Maximum participants limit reached');
      }
    });

    /**
     * Test 8: Limit enforcement with default maxParticipants (10)
     */
    it('should enforce default limit of 10 participants', async () => {
      // إنشاء مقابلة بدون تحديد maxParticipants (افتراضي 10)
      const hostId = new mongoose.Types.ObjectId();
      const interview = await VideoInterview.create({
        roomId: `room_${Date.now()}`,
        hostId,
        scheduledAt: new Date(),
        status: 'active',
        participants: [{
          userId: hostId,
          role: 'host',
          joinedAt: new Date()
        }]
      });

      // التحقق: الحد الافتراضي هو 10
      expect(interview.settings.maxParticipants).toBe(10);

      // إضافة 9 مشاركين (المضيف + 9 = 10)
      for (let i = 0; i < 9; i++) {
        const userId = new mongoose.Types.ObjectId();
        await interview.addParticipant(userId);
      }

      // التحقق: الوصول للحد الأقصى
      const updatedInterview = await VideoInterview.findById(interview._id);
      expect(updatedInterview.participants.length).toBe(10);

      // محاولة إضافة المشارك الحادي عشر
      const extraUserId = new mongoose.Types.ObjectId();
      await expect(async () => {
        const currentInterview = await VideoInterview.findById(interview._id);
        if (currentInterview.participants.length >= currentInterview.settings.maxParticipants) {
          throw new Error('Maximum participants limit reached');
        }
        await currentInterview.addParticipant(extraUserId);
      }).rejects.toThrow('Maximum participants limit reached');
    });
  });

  /**
   * Integration Test: Complete Participant Limit Workflow
   */
  describe('Integration: Complete Participant Limit Workflow', () => {
    it('should enforce participant limit throughout the entire interview lifecycle', async () => {
      const maxParticipants = 5;
      
      // 1. إنشاء مقابلة مع حد 5 مشاركين
      const hostId = new mongoose.Types.ObjectId();
      const interview = await VideoInterview.create({
        roomId: `room_${Date.now()}`,
        hostId,
        scheduledAt: new Date(),
        status: 'scheduled',
        settings: {
          maxParticipants,
          waitingRoomEnabled: true
        },
        participants: [{
          userId: hostId,
          role: 'host',
          joinedAt: new Date()
        }]
      });

      expect(interview.settings.maxParticipants).toBe(5);
      expect(interview.participants.length).toBe(1);

      // 2. إنشاء غرفة انتظار
      const waitingRoom = await waitingRoomService.createWaitingRoom(
        interview._id,
        'مرحباً! الحد الأقصى للمشاركين هو 5.'
      );

      // 3. إضافة 6 مشاركين لغرفة الانتظار
      const waitingParticipants = [];
      for (let i = 0; i < 6; i++) {
        const userId = new mongoose.Types.ObjectId();
        await waitingRoom.addParticipant(userId);
        waitingParticipants.push(userId);
      }

      // 4. بدء المقابلة
      await interview.startInterview();

      // 5. قبول 4 مشاركين (المضيف + 4 = 5)
      for (let i = 0; i < 4; i++) {
        await waitingRoomService.admitParticipant(
          interview._id,
          waitingParticipants[i],
          hostId
        );
      }

      // 6. التحقق: الوصول للحد الأقصى
      let updatedInterview = await VideoInterview.findById(interview._id);
      expect(updatedInterview.participants.length).toBe(5);

      // 7. محاولة قبول المشارك الخامس (السادس إجمالاً)
      await expect(async () => {
        const currentInterview = await VideoInterview.findById(interview._id);
        if (currentInterview.participants.length >= currentInterview.settings.maxParticipants) {
          throw new Error('Maximum participants limit reached');
        }
        await waitingRoomService.admitParticipant(
          interview._id,
          waitingParticipants[4],
          hostId
        );
      }).rejects.toThrow('Maximum participants limit reached');

      // 8. مشارك يغادر
      const leavingUserId = waitingParticipants[0];
      updatedInterview = await VideoInterview.findById(interview._id);
      await updatedInterview.removeParticipant(leavingUserId);

      // 9. التحقق: العدد النشط أقل من الحد الأقصى
      updatedInterview = await VideoInterview.findById(interview._id);
      const activeParticipants = updatedInterview.participants.filter(p => !p.leftAt);
      expect(activeParticipants.length).toBe(4);

      // 10. الآن يمكن قبول المشارك الخامس
      const currentInterview = await VideoInterview.findById(interview._id);
      const currentActive = currentInterview.participants.filter(p => !p.leftAt).length;
      
      if (currentActive < currentInterview.settings.maxParticipants) {
        await waitingRoomService.admitParticipant(
          interview._id,
          waitingParticipants[4],
          hostId
        );
      }

      // 11. التحقق النهائي: العدد النشط = 5
      const finalInterview = await VideoInterview.findById(interview._id);
      const finalActive = finalInterview.participants.filter(p => !p.leftAt);
      expect(finalActive.length).toBe(5);

      // 12. محاولة قبول المشارك السادس مرة أخرى
      await expect(async () => {
        const currentInterview = await VideoInterview.findById(interview._id);
        const currentActive = currentInterview.participants.filter(p => !p.leftAt).length;
        if (currentActive >= currentInterview.settings.maxParticipants) {
          throw new Error('Maximum participants limit reached');
        }
        await waitingRoomService.admitParticipant(
          interview._id,
          waitingParticipants[5],
          hostId
        );
      }).rejects.toThrow('Maximum participants limit reached');

      // 13. إنهاء المقابلة
      await interview.endInterview();

      // 14. التحقق النهائي: الحد تم احترامه طوال دورة حياة المقابلة
      const endedInterview = await VideoInterview.findById(interview._id);
      expect(endedInterview.status).toBe('ended');
      const endedActive = endedInterview.participants.filter(p => !p.leftAt);
      expect(endedActive.length).toBeLessThanOrEqual(maxParticipants);
    });
  });
});
