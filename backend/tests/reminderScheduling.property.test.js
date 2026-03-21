/**
 * Property test: Reminder Scheduling
 * **Validates: Requirements 3.1, 3.2**
 *
 * Property 2: Reminder Scheduling
 * For any appointment, reminders are created at 24h and 1h before the appointment time.
 */

const mongoose = require('mongoose');
const fc = require('fast-check');
const Reminder = require('../src/models/Reminder');
const Appointment = require('../src/models/Appointment');
const {
  createRemindersForAppointment,
  scheduleCustomReminders,
} = require('../src/services/reminderService');

jest.mock('../src/services/notificationService', () => ({
  createNotification: jest.fn().mockResolvedValue({}),
}));
jest.mock('../src/services/pusherService', () => ({
  isEnabled: jest.fn().mockReturnValue(false),
  sendNotificationToUser: jest.fn().mockResolvedValue({}),
}));
jest.mock('../src/services/smsService', () => ({
  isSmsEnabled: jest.fn().mockReturnValue(false),
  sendAppointmentReminderSms: jest.fn().mockResolvedValue({ success: true }),
}));

const ORGANIZER_ID = new mongoose.Types.ObjectId();

// Far-future base time so reminders are never in the past during tests
const FUTURE_BASE_MS = new Date('2040-01-01T12:00:00Z').getTime();

/** Build a minimal in-memory appointment object (no DB save needed) */
function makeAppointment({ scheduledAtMs, organizerId = ORGANIZER_ID } = {}) {
  return {
    _id: new mongoose.Types.ObjectId(),
    title: 'Test Appointment',
    organizerId,
    participants: [],
    scheduledAt: new Date(scheduledAtMs),
    status: 'scheduled',
  };
}

/** Save a real Appointment to the DB (needed for scheduleCustomReminders populate) */
async function saveAppointment({ scheduledAtMs, organizerId = ORGANIZER_ID } = {}) {
  return Appointment.create({
    type: 'video_interview',
    title: 'Test Appointment',
    organizerId,
    participants: [],
    scheduledAt: new Date(scheduledAtMs),
    duration: 60,
    status: 'scheduled',
  });
}

describe('Property 2: Reminder Scheduling - Validates: Requirements 3.1, 3.2', () => {

  // ─── Unit Tests ───────────────────────────────────────────────────────────

  describe('Unit: 24h reminder scheduled at (scheduledAt - 24h)', () => {
    it('يجب إنشاء تذكير 24h في الوقت الصحيح', async () => {
      const scheduledAtMs = FUTURE_BASE_MS + 48 * 60 * 60 * 1000;
      const appointment = makeAppointment({ scheduledAtMs });

      const reminders = await createRemindersForAppointment(appointment);

      const reminder24h = reminders.find(r => r.type === '24h');
      expect(reminder24h).toBeDefined();

      const expected = scheduledAtMs - 24 * 60 * 60 * 1000;
      expect(reminder24h.scheduledAt.getTime()).toBe(expected);
    });
  });

  describe('Unit: 1h reminder scheduled at (scheduledAt - 1h)', () => {
    it('يجب إنشاء تذكير 1h في الوقت الصحيح', async () => {
      const scheduledAtMs = FUTURE_BASE_MS + 48 * 60 * 60 * 1000;
      const appointment = makeAppointment({ scheduledAtMs });

      const reminders = await createRemindersForAppointment(appointment);

      const reminder1h = reminders.find(r => r.type === '1h');
      expect(reminder1h).toBeDefined();

      const expected = scheduledAtMs - 1 * 60 * 60 * 1000;
      expect(reminder1h.scheduledAt.getTime()).toBe(expected);
    });
  });

  describe('Unit: no reminders for past appointments', () => {
    it('يجب عدم إنشاء تذكيرات للمواعيد الماضية', async () => {
      const scheduledAtMs = Date.now() - 2 * 60 * 60 * 1000; // 2h ago
      const appointment = makeAppointment({ scheduledAtMs });

      const reminders = await createRemindersForAppointment(appointment);

      expect(reminders).toHaveLength(0);
    });

    it('يجب عدم إنشاء تذكير 24h إذا كان وقته في الماضي (الموعد بعد أقل من 24h)', async () => {
      const scheduledAtMs = Date.now() + 2 * 60 * 60 * 1000; // 2h from now
      const appointment = makeAppointment({ scheduledAtMs });

      const reminders = await createRemindersForAppointment(appointment);

      const types = reminders.map(r => r.type);
      expect(types).not.toContain('24h');
      expect(types).toContain('1h');
    });
  });

  describe('Unit: reminder times are always before the appointment time', () => {
    it('يجب أن يكون وقت التذكير دائماً قبل وقت الموعد', async () => {
      const scheduledAtMs = FUTURE_BASE_MS + 72 * 60 * 60 * 1000;
      const appointment = makeAppointment({ scheduledAtMs });

      const reminders = await createRemindersForAppointment(appointment);

      for (const reminder of reminders) {
        expect(reminder.scheduledAt.getTime()).toBeLessThan(scheduledAtMs);
      }
    });
  });

  describe('Unit: custom reminder times are scheduled correctly', () => {
    it('يجب جدولة التذكير المخصص في الوقت الصحيح', async () => {
      const scheduledAtMs = FUTURE_BASE_MS + 96 * 60 * 60 * 1000;

      const savedAppointment = await saveAppointment({ scheduledAtMs });

      // Use a unique userId per test to avoid unique-index conflicts
      const customUserId = new mongoose.Types.ObjectId();

      const baseReminder = await Reminder.create({
        appointmentId: savedAppointment._id,
        userId: customUserId,
        type: '24h', // use 24h so custom '1h' reminder doesn't conflict
        channel: 'notification',
        status: 'pending',
        scheduledAt: new Date(scheduledAtMs - 24 * 60 * 60 * 1000),
        customReminders: [120], // 120 min before
      });

      const customReminders = await scheduleCustomReminders(baseReminder._id);

      // Should create 1 custom reminder at (scheduledAt - 120min)
      expect(customReminders.length).toBe(1);
      expect(customReminders[0].scheduledAt.getTime()).toBe(scheduledAtMs - 120 * 60 * 1000);
      expect(customReminders[0].scheduledAt.getTime()).toBeLessThan(scheduledAtMs);
    });
  });

  // ─── Property-Based Tests ─────────────────────────────────────────────────

  describe('Property-based: reminders always at 24h and 1h before appointment', () => {
    /**
     * Property: For any appointment scheduled > 24h in the future,
     * a 24h reminder is at (scheduledAt - 24h) and a 1h reminder is at (scheduledAt - 1h).
     *
     * **Validates: Requirements 3.1, 3.2**
     */
    it('خاصية: لأي موعد مستقبلي (> 24h)، يُنشأ تذكير 24h و1h في الأوقات الصحيحة', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 25, max: 200 }),
          async (hoursFromNow) => {
            const scheduledAtMs = Date.now() + hoursFromNow * 60 * 60 * 1000;
            const appointment = makeAppointment({ scheduledAtMs });

            const reminders = await createRemindersForAppointment(appointment);

            const reminder24h = reminders.find(r => r.type === '24h');
            const reminder1h = reminders.find(r => r.type === '1h');

            if (!reminder24h || !reminder1h) return false;

            const expected24h = scheduledAtMs - 24 * 60 * 60 * 1000;
            const expected1h = scheduledAtMs - 1 * 60 * 60 * 1000;

            return (
              reminder24h.scheduledAt.getTime() === expected24h &&
              reminder1h.scheduledAt.getTime() === expected1h
            );
          }
        ),
        { numRuns: 30, verbose: false }
      );
    });

    /**
     * Property: For any appointment scheduled < 1h in the future,
     * no reminders are created (both reminder times are in the past).
     *
     * **Validates: Requirements 3.1, 3.2**
     */
    it('خاصية: لأي موعد بعد أقل من ساعة، لا تُنشأ تذكيرات', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 59 }),
          async (minutesFromNow) => {
            const scheduledAtMs = Date.now() + minutesFromNow * 60 * 1000;
            const appointment = makeAppointment({ scheduledAtMs });

            const reminders = await createRemindersForAppointment(appointment);

            return reminders.length === 0;
          }
        ),
        { numRuns: 20, verbose: false }
      );
    });

    /**
     * Property: For any appointment, all reminder scheduledAt times are strictly
     * before the appointment scheduledAt time.
     *
     * **Validates: Requirements 3.1, 3.2**
     */
    it('خاصية: جميع أوقات التذكير دائماً قبل وقت الموعد', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 25, max: 500 }),
          async (hoursFromNow) => {
            const scheduledAtMs = Date.now() + hoursFromNow * 60 * 60 * 1000;
            const appointment = makeAppointment({ scheduledAtMs });

            const reminders = await createRemindersForAppointment(appointment);

            return reminders.every(r => r.scheduledAt.getTime() < scheduledAtMs);
          }
        ),
        { numRuns: 30, verbose: false }
      );
    });

    /**
     * Property: For any custom reminder offset (minutes), the scheduled time equals
     * (appointmentTime - offset * 60 * 1000) and is always before the appointment.
     *
     * **Validates: Requirements 3.1, 3.2**
     */
    it('خاصية: التذكيرات المخصصة دائماً قبل وقت الموعد بالمدة المحددة', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 30, max: 1440 }),
          async (offsetMinutes) => {
            const scheduledAtMs = FUTURE_BASE_MS + (offsetMinutes + 120) * 60 * 1000;

            const savedAppointment = await saveAppointment({ scheduledAtMs });

            // Use a unique userId per iteration to avoid unique-index conflicts
            const iterUserId = new mongoose.Types.ObjectId();

            const baseReminder = await Reminder.create({
              appointmentId: savedAppointment._id,
              userId: iterUserId,
              type: '24h', // use 24h so custom '1h' reminders don't conflict
              channel: 'notification',
              status: 'pending',
              scheduledAt: new Date(scheduledAtMs - 24 * 60 * 60 * 1000),
              customReminders: [offsetMinutes],
            });

            const customReminders = await scheduleCustomReminders(baseReminder._id);

            if (customReminders.length === 0) return false;

            const expectedTime = scheduledAtMs - offsetMinutes * 60 * 1000;
            const actualTime = customReminders[0].scheduledAt.getTime();

            return actualTime === expectedTime && actualTime < scheduledAtMs;
          }
        ),
        { numRuns: 20, verbose: false }
      );
    });
  });
});
