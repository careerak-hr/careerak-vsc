const fc = require('fast-check');
const mongoose = require('mongoose');
const VideoInterview = require('../src/models/VideoInterview');
const WaitingRoom = require('../src/models/WaitingRoom');
const waitingRoomService = require('../src/services/waitingRoomService');

/**
 * Property-Based Tests for Waiting Room Admission
 * اختبارات خاصية قبول غرفة الانتظار
 * 
 * **Validates: Requirements 4.3**
 * 
 * Property 6: Waiting Room Admission
 * For any participant in the waiting room, they can only join the interview 
 * after explicit admission by the host.
 */

describe('Waiting Room Admission Property Tests', () => {
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
    await WaitingRoom.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // تنظيف البيانات قبل كل اختبار
    await VideoInterview.deleteMany({});
    await WaitingRoom.deleteMany({});
  });

  /**
   * Property 6: Waiting Room Admission
   * **Validates: Requirements 4.3**
   * 
   * For any participant in the waiting room, they can only join the interview 
   * after explicit admission by the host.
   */
  describe('Property 6: Waiting Room Admission', () => {
    /**
     * Test 1: Participants cannot join interview without explicit admission
     */
    it('should prevent participants from joining without host admission', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: number of waiting participants (1-10)
          fc.integer({ min: 1, max: 10 }),
          async (waitingCount) => {
            // إنشاء مقابلة مع تفعيل غرفة الانتظار
            const hostId = new mongoose.Types.ObjectId();
            const interview = await VideoInterview.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              hostId,
              scheduledAt: new Date(),
              status: 'waiting',
              settings: {
                waitingRoomEnabled: true
              },
              participants: [{
                userId: hostId,
                role: 'host',
                joinedAt: new Date()
              }]
            });

            // إنشاء غرفة انتظار
            const waitingRoom = await waitingRoomService.createWaitingRoom(
              interview._id,
              'مرحباً بك في غرفة الانتظار'
            );

            // إضافة مشاركين للانتظار
            const waitingParticipants = [];
            for (let i = 0; i < waitingCount; i++) {
              const userId = new mongoose.Types.ObjectId();
              await waitingRoom.addParticipant(userId);
              waitingParticipants.push(userId);
            }

            // التحقق: جميع المشاركين في حالة 'waiting'
            const updatedWaitingRoom = await WaitingRoom.findById(waitingRoom._id);
            const allWaiting = updatedWaitingRoom.participants.every(
              p => p.status === 'waiting'
            );
            expect(allWaiting).toBe(true);

            // التحقق: لا أحد في المقابلة (ما عدا المضيف)
            const updatedInterview = await VideoInterview.findById(interview._id);
            expect(updatedInterview.participants.length).toBe(1); // المضيف فقط

            // التحقق: المشاركون المنتظرون ليسوا في المقابلة
            for (const userId of waitingParticipants) {
              const inInterview = updatedInterview.participants.some(
                p => p.userId.toString() === userId.toString()
              );
              expect(inInterview).toBe(false);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Test 2: Only host can admit participants
     */
    it('should only allow host to admit participants', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: number of participants (2-5)
          fc.integer({ min: 2, max: 5 }),
          async (participantCount) => {
            // إنشاء مقابلة
            const hostId = new mongoose.Types.ObjectId();
            const interview = await VideoInterview.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              hostId,
              scheduledAt: new Date(),
              status: 'waiting',
              settings: {
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

            // إضافة مشاركين
            const participants = [];
            for (let i = 0; i < participantCount; i++) {
              const userId = new mongoose.Types.ObjectId();
              await waitingRoom.addParticipant(userId);
              participants.push(userId);
            }

            // محاولة قبول مشارك بواسطة مستخدم ليس المضيف
            const nonHostId = participants[0];
            const participantToAdmit = participants[1];

            // يجب أن تفشل
            await expect(
              waitingRoomService.admitParticipant(
                interview._id,
                participantToAdmit,
                nonHostId
              )
            ).rejects.toThrow('Only host can admit participants');

            // التحقق: المشارك لا يزال في حالة 'waiting'
            const updatedWaitingRoom = await WaitingRoom.findById(waitingRoom._id);
            const participant = updatedWaitingRoom.participants.find(
              p => p.userId.toString() === participantToAdmit.toString()
            );
            expect(participant.status).toBe('waiting');
          }
        ),
        { numRuns: 30 }
      );
    });

    /**
     * Test 3: Admitted participants are added to interview
     */
    it('should add admitted participants to the interview', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: number of participants to admit (1-5)
          fc.integer({ min: 1, max: 5 }),
          async (admitCount) => {
            // إنشاء مقابلة
            const hostId = new mongoose.Types.ObjectId();
            const interview = await VideoInterview.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              hostId,
              scheduledAt: new Date(),
              status: 'waiting',
              settings: {
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

            // إضافة مشاركين
            const participants = [];
            for (let i = 0; i < admitCount + 2; i++) {
              const userId = new mongoose.Types.ObjectId();
              await waitingRoom.addParticipant(userId);
              participants.push(userId);
            }

            // قبول بعض المشاركين
            for (let i = 0; i < admitCount; i++) {
              await waitingRoomService.admitParticipant(
                interview._id,
                participants[i],
                hostId
              );
            }

            // التحقق: المشاركون المقبولون في المقابلة
            const updatedInterview = await VideoInterview.findById(interview._id);
            expect(updatedInterview.participants.length).toBe(1 + admitCount); // المضيف + المقبولون

            for (let i = 0; i < admitCount; i++) {
              const inInterview = updatedInterview.participants.some(
                p => p.userId.toString() === participants[i].toString()
              );
              expect(inInterview).toBe(true);
            }

            // التحقق: المشاركون غير المقبولون ليسوا في المقابلة
            for (let i = admitCount; i < participants.length; i++) {
              const inInterview = updatedInterview.participants.some(
                p => p.userId.toString() === participants[i].toString()
              );
              expect(inInterview).toBe(false);
            }
          }
        ),
        { numRuns: 30 }
      );
    });

    /**
     * Test 4: Admission updates participant status
     */
    it('should update participant status to admitted', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: number of participants (2-8)
          fc.integer({ min: 2, max: 8 }),
          async (participantCount) => {
            // إنشاء مقابلة
            const hostId = new mongoose.Types.ObjectId();
            const interview = await VideoInterview.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              hostId,
              scheduledAt: new Date(),
              status: 'waiting',
              settings: {
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

            // إضافة مشاركين
            const participants = [];
            for (let i = 0; i < participantCount; i++) {
              const userId = new mongoose.Types.ObjectId();
              await waitingRoom.addParticipant(userId);
              participants.push(userId);
            }

            // قبول مشارك واحد
            const admittedUserId = participants[0];
            await waitingRoomService.admitParticipant(
              interview._id,
              admittedUserId,
              hostId
            );

            // التحقق: حالة المشارك المقبول
            const updatedWaitingRoom = await WaitingRoom.findById(waitingRoom._id);
            const admittedParticipant = updatedWaitingRoom.participants.find(
              p => p.userId.toString() === admittedUserId.toString()
            );

            expect(admittedParticipant.status).toBe('admitted');
            expect(admittedParticipant.admittedAt).toBeDefined();
            expect(admittedParticipant.admittedAt).toBeInstanceOf(Date);

            // التحقق: باقي المشاركين لا يزالون في حالة 'waiting'
            for (let i = 1; i < participants.length; i++) {
              const participant = updatedWaitingRoom.participants.find(
                p => p.userId.toString() === participants[i].toString()
              );
              expect(participant.status).toBe('waiting');
            }
          }
        ),
        { numRuns: 30 }
      );
    });

    /**
     * Test 5: Cannot admit participant not in waiting room
     */
    it('should reject admission of participant not in waiting room', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            // إنشاء مقابلة
            const hostId = new mongoose.Types.ObjectId();
            const interview = await VideoInterview.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              hostId,
              scheduledAt: new Date(),
              status: 'waiting',
              settings: {
                waitingRoomEnabled: true
              },
              participants: [{
                userId: hostId,
                role: 'host',
                joinedAt: new Date()
              }]
            });

            // إنشاء غرفة انتظار
            await waitingRoomService.createWaitingRoom(interview._id);

            // محاولة قبول مشارك غير موجود
            const nonExistentUserId = new mongoose.Types.ObjectId();

            await expect(
              waitingRoomService.admitParticipant(
                interview._id,
                nonExistentUserId,
                hostId
              )
            ).rejects.toThrow('Participant not found in waiting room');
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Test 6: Admission is sequential (one at a time)
     */
    it('should admit participants one at a time in order', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: number of participants (3-7)
          fc.integer({ min: 3, max: 7 }),
          async (participantCount) => {
            // إنشاء مقابلة
            const hostId = new mongoose.Types.ObjectId();
            const interview = await VideoInterview.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              hostId,
              scheduledAt: new Date(),
              status: 'waiting',
              settings: {
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

            // إضافة مشاركين
            const participants = [];
            for (let i = 0; i < participantCount; i++) {
              const userId = new mongoose.Types.ObjectId();
              await new Promise(resolve => setTimeout(resolve, 10)); // تأخير صغير
              await waitingRoom.addParticipant(userId);
              participants.push(userId);
            }

            // قبول المشاركين واحداً تلو الآخر
            for (let i = 0; i < participantCount; i++) {
              await waitingRoomService.admitParticipant(
                interview._id,
                participants[i],
                hostId
              );

              // التحقق: المشارك الحالي مقبول
              const updatedWaitingRoom = await WaitingRoom.findById(waitingRoom._id);
              const currentParticipant = updatedWaitingRoom.participants.find(
                p => p.userId.toString() === participants[i].toString()
              );
              expect(currentParticipant.status).toBe('admitted');

              // التحقق: المشاركون التاليون لا يزالون في الانتظار
              for (let j = i + 1; j < participantCount; j++) {
                const nextParticipant = updatedWaitingRoom.participants.find(
                  p => p.userId.toString() === participants[j].toString()
                );
                expect(nextParticipant.status).toBe('waiting');
              }
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Test 7: Rejected participants cannot be admitted
     */
    it('should not admit rejected participants', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: number of participants (2-5)
          fc.integer({ min: 2, max: 5 }),
          async (participantCount) => {
            // إنشاء مقابلة
            const hostId = new mongoose.Types.ObjectId();
            const interview = await VideoInterview.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              hostId,
              scheduledAt: new Date(),
              status: 'waiting',
              settings: {
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

            // إضافة مشاركين
            const participants = [];
            for (let i = 0; i < participantCount; i++) {
              const userId = new mongoose.Types.ObjectId();
              await waitingRoom.addParticipant(userId);
              participants.push(userId);
            }

            // رفض مشارك
            const rejectedUserId = participants[0];
            await waitingRoomService.rejectParticipant(
              interview._id,
              rejectedUserId,
              hostId
            );

            // محاولة قبول المشارك المرفوض
            await expect(
              waitingRoomService.admitParticipant(
                interview._id,
                rejectedUserId,
                hostId
              )
            ).rejects.toThrow('Participant not found in waiting room');

            // التحقق: المشارك لا يزال مرفوضاً
            const updatedWaitingRoom = await WaitingRoom.findById(waitingRoom._id);
            const rejectedParticipant = updatedWaitingRoom.participants.find(
              p => p.userId.toString() === rejectedUserId.toString()
            );
            expect(rejectedParticipant.status).toBe('rejected');
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Test 8: Admission records timestamp
     */
    it('should record admission timestamp for each participant', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: number of participants (1-5)
          fc.integer({ min: 1, max: 5 }),
          async (participantCount) => {
            // إنشاء مقابلة
            const hostId = new mongoose.Types.ObjectId();
            const interview = await VideoInterview.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              hostId,
              scheduledAt: new Date(),
              status: 'waiting',
              settings: {
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

            // إضافة مشاركين
            const participants = [];
            for (let i = 0; i < participantCount; i++) {
              const userId = new mongoose.Types.ObjectId();
              await waitingRoom.addParticipant(userId);
              participants.push(userId);
            }

            const admissionTimes = [];

            // قبول المشاركين مع تأخير بينهم
            for (let i = 0; i < participantCount; i++) {
              await new Promise(resolve => setTimeout(resolve, 50)); // تأخير 50ms
              await waitingRoomService.admitParticipant(
                interview._id,
                participants[i],
                hostId
              );

              const updatedWaitingRoom = await WaitingRoom.findById(waitingRoom._id);
              const participant = updatedWaitingRoom.participants.find(
                p => p.userId.toString() === participants[i].toString()
              );

              expect(participant.admittedAt).toBeDefined();
              expect(participant.admittedAt).toBeInstanceOf(Date);
              admissionTimes.push(participant.admittedAt.getTime());
            }

            // التحقق: أوقات القبول متسلسلة
            for (let i = 1; i < admissionTimes.length; i++) {
              expect(admissionTimes[i]).toBeGreaterThanOrEqual(admissionTimes[i - 1]);
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Test 9: Waiting room statistics are updated on admission
     */
    it('should update waiting room statistics when admitting participants', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator: number of participants (2-6)
          fc.integer({ min: 2, max: 6 }),
          async (participantCount) => {
            // إنشاء مقابلة
            const hostId = new mongoose.Types.ObjectId();
            const interview = await VideoInterview.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              hostId,
              scheduledAt: new Date(),
              status: 'waiting',
              settings: {
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

            // إضافة مشاركين
            const participants = [];
            for (let i = 0; i < participantCount; i++) {
              const userId = new mongoose.Types.ObjectId();
              await waitingRoom.addParticipant(userId);
              participants.push(userId);
            }

            const initialStats = (await WaitingRoom.findById(waitingRoom._id)).stats;

            // قبول نصف المشاركين
            const admitCount = Math.ceil(participantCount / 2);
            for (let i = 0; i < admitCount; i++) {
              await waitingRoomService.admitParticipant(
                interview._id,
                participants[i],
                hostId
              );
            }

            // التحقق: الإحصائيات محدثة
            const updatedWaitingRoom = await WaitingRoom.findById(waitingRoom._id);
            expect(updatedWaitingRoom.stats.totalAdmitted).toBe(admitCount);
            expect(updatedWaitingRoom.stats.totalJoined).toBe(participantCount);
          }
        ),
        { numRuns: 20 }
      );
    });

    /**
     * Test 10: Admission is idempotent (admitting same participant twice)
     */
    it('should handle duplicate admission attempts gracefully', async () => {
      // إنشاء مقابلة
      const hostId = new mongoose.Types.ObjectId();
      const interview = await VideoInterview.create({
        roomId: `room_${Date.now()}`,
        hostId,
        scheduledAt: new Date(),
        status: 'waiting',
        settings: {
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

      // إضافة مشارك
      const participantId = new mongoose.Types.ObjectId();
      await waitingRoom.addParticipant(participantId);

      // قبول المشارك للمرة الأولى
      await waitingRoomService.admitParticipant(
        interview._id,
        participantId,
        hostId
      );

      // محاولة قبول نفس المشارك مرة أخرى يجب أن تفشل
      await expect(
        waitingRoomService.admitParticipant(
          interview._id,
          participantId,
          hostId
        )
      ).rejects.toThrow('Participant not found in waiting room');

      // التحقق: المشارك مقبول مرة واحدة فقط في المقابلة
      const updatedInterview = await VideoInterview.findById(interview._id);
      const participantCount = updatedInterview.participants.filter(
        p => p.userId.toString() === participantId.toString()
      ).length;
      expect(participantCount).toBe(1);

      // التحقق: المشارك في حالة 'admitted' في غرفة الانتظار
      const updatedWaitingRoom = await WaitingRoom.findById(waitingRoom._id);
      const participant = updatedWaitingRoom.participants.find(
        p => p.userId.toString() === participantId.toString()
      );
      expect(participant.status).toBe('admitted');
    });
  });

  /**
   * Integration Test: Complete Waiting Room Admission Workflow
   */
  describe('Integration: Complete Waiting Room Admission Workflow', () => {
    it('should enforce admission control throughout the entire workflow', async () => {
      // إنشاء مقابلة مع تفعيل غرفة الانتظار
      const hostId = new mongoose.Types.ObjectId();
      const interview = await VideoInterview.create({
        roomId: `room_${Date.now()}`,
        hostId,
        scheduledAt: new Date(),
        status: 'waiting',
        settings: {
          waitingRoomEnabled: true
        },
        participants: [{
          userId: hostId,
          role: 'host',
          joinedAt: new Date()
        }]
      });

      // 1. إنشاء غرفة انتظار
      const waitingRoom = await waitingRoomService.createWaitingRoom(
        interview._id,
        'مرحباً! يرجى الانتظار حتى يقبلك المضيف.'
      );
      expect(waitingRoom).toBeDefined();
      expect(waitingRoom.welcomeMessage).toContain('مرحباً');

      // 2. إضافة 3 مشاركين للانتظار
      const participant1 = new mongoose.Types.ObjectId();
      const participant2 = new mongoose.Types.ObjectId();
      const participant3 = new mongoose.Types.ObjectId();

      await waitingRoom.addParticipant(participant1);
      await waitingRoom.addParticipant(participant2);
      await waitingRoom.addParticipant(participant3);

      // 3. التحقق: جميع المشاركين في حالة 'waiting'
      let updatedWaitingRoom = await WaitingRoom.findById(waitingRoom._id);
      expect(updatedWaitingRoom.getWaitingCount()).toBe(3);

      // 4. التحقق: لا أحد في المقابلة (ما عدا المضيف)
      let updatedInterview = await VideoInterview.findById(interview._id);
      expect(updatedInterview.participants.length).toBe(1);

      // 5. المضيف يقبل المشارك الأول
      await waitingRoomService.admitParticipant(
        interview._id,
        participant1,
        hostId
      );

      // 6. التحقق: المشارك الأول في المقابلة
      updatedInterview = await VideoInterview.findById(interview._id);
      expect(updatedInterview.participants.length).toBe(2);
      const p1InInterview = updatedInterview.participants.some(
        p => p.userId.toString() === participant1.toString()
      );
      expect(p1InInterview).toBe(true);

      // 7. التحقق: المشارك الأول في حالة 'admitted'
      updatedWaitingRoom = await WaitingRoom.findById(waitingRoom._id);
      const p1Status = updatedWaitingRoom.participants.find(
        p => p.userId.toString() === participant1.toString()
      );
      expect(p1Status.status).toBe('admitted');
      expect(p1Status.admittedAt).toBeDefined();

      // 8. المضيف يرفض المشارك الثاني
      await waitingRoomService.rejectParticipant(
        interview._id,
        participant2,
        hostId
      );

      // 9. التحقق: المشارك الثاني ليس في المقابلة
      updatedInterview = await VideoInterview.findById(interview._id);
      const p2InInterview = updatedInterview.participants.some(
        p => p.userId.toString() === participant2.toString()
      );
      expect(p2InInterview).toBe(false);

      // 10. التحقق: المشارك الثاني في حالة 'rejected'
      updatedWaitingRoom = await WaitingRoom.findById(waitingRoom._id);
      const p2Status = updatedWaitingRoom.participants.find(
        p => p.userId.toString() === participant2.toString()
      );
      expect(p2Status.status).toBe('rejected');

      // 11. المشارك الثالث لا يزال في الانتظار
      const p3Status = updatedWaitingRoom.participants.find(
        p => p.userId.toString() === participant3.toString()
      );
      expect(p3Status.status).toBe('waiting');

      // 12. المضيف يقبل المشارك الثالث
      await waitingRoomService.admitParticipant(
        interview._id,
        participant3,
        hostId
      );

      // 13. التحقق النهائي: المقابلة تحتوي على المضيف + المشارك 1 + المشارك 3
      updatedInterview = await VideoInterview.findById(interview._id);
      expect(updatedInterview.participants.length).toBe(3);

      // 14. التحقق: الإحصائيات صحيحة
      updatedWaitingRoom = await WaitingRoom.findById(waitingRoom._id);
      expect(updatedWaitingRoom.stats.totalJoined).toBe(3);
      expect(updatedWaitingRoom.stats.totalAdmitted).toBe(2);
      expect(updatedWaitingRoom.stats.totalRejected).toBe(1);
    });
  });
});
