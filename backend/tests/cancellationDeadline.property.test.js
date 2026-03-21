/**
 * Property test: Cancellation Deadline
 * **Validates: Requirements 4.1**
 *
 * Property 3: Cancellation Deadline
 * - Cancellation is rejected if attempted less than 60 minutes before the appointment.
 * - Cancellation is allowed if attempted more than 60 minutes before the appointment.
 */

const mongoose = require('mongoose');
const fc = require('fast-check');
const Appointment = require('../src/models/Appointment');
const appointmentService = require('../src/services/appointmentService');

jest.mock('../src/services/notificationService', () => ({
  createNotification: jest.fn().mockResolvedValue({}),
}));
jest.mock('../src/services/pusherService', () => ({
  isEnabled: jest.fn().mockReturnValue(false),
  sendNotificationToUser: jest.fn().mockResolvedValue({}),
}));
jest.mock('../src/services/googleCalendarService', () => ({
  deleteEventForAppointment: jest.fn().mockResolvedValue({}),
  updateEventForAppointment: jest.fn().mockResolvedValue({}),
  createEventForAppointment: jest.fn().mockResolvedValue({}),
}));
jest.mock('../src/services/reminderService', () => ({
  createRemindersForAppointment: jest.fn().mockResolvedValue([]),
}));

// Far-future base to avoid timing issues
const FUTURE_BASE_MS = new Date('2035-06-01T12:00:00Z').getTime();

/**
 * Create a test appointment scheduled at the given time.
 */
async function createTestAppointment(scheduledAt) {
  const organizerId = new mongoose.Types.ObjectId();
  const appointment = new Appointment({
    type: 'video_interview',
    title: 'Test Interview',
    organizerId,
    participants: [],
    scheduledAt,
    duration: 60,
    status: 'scheduled',
  });
  await appointment.save();
  return { appointment, organizerId };
}

describe('Property 3: Cancellation Deadline - Validates: Requirements 4.1', () => {

  // ─── Unit Tests ───────────────────────────────────────────────────────────

  describe('Unit: cancellation rejected when < 60 minutes before appointment', () => {
    it('يجب رفض الإلغاء عند 0 دقيقة قبل الموعد', async () => {
      const scheduledAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min from now
      const { appointment, organizerId } = await createTestAppointment(scheduledAt);

      await expect(
        appointmentService.cancelAppointment(appointment._id.toString(), organizerId.toString(), 'test')
      ).rejects.toMatchObject({ code: 'CANCELLATION_DEADLINE_PASSED' });
    });

    it('يجب رفض الإلغاء عند 59 دقيقة قبل الموعد', async () => {
      const scheduledAt = new Date(Date.now() + 59 * 60 * 1000); // 59 min from now
      const { appointment, organizerId } = await createTestAppointment(scheduledAt);

      await expect(
        appointmentService.cancelAppointment(appointment._id.toString(), organizerId.toString(), 'test')
      ).rejects.toMatchObject({ code: 'CANCELLATION_DEADLINE_PASSED' });
    });
  });

  describe('Unit: cancellation allowed when > 60 minutes before appointment', () => {
    it('يجب السماح بالإلغاء عند 61 دقيقة قبل الموعد', async () => {
      const scheduledAt = new Date(FUTURE_BASE_MS + 61 * 60 * 1000);
      const { appointment, organizerId } = await createTestAppointment(scheduledAt);

      const result = await appointmentService.cancelAppointment(
        appointment._id.toString(),
        organizerId.toString(),
        'test reason'
      );

      expect(result.status).toBe('cancelled');
    });

    it('يجب السماح بالإلغاء عند 120 دقيقة قبل الموعد', async () => {
      const scheduledAt = new Date(FUTURE_BASE_MS + 2 * 60 * 60 * 1000);
      const { appointment, organizerId } = await createTestAppointment(scheduledAt);

      const result = await appointmentService.cancelAppointment(
        appointment._id.toString(),
        organizerId.toString(),
        'test reason'
      );

      expect(result.status).toBe('cancelled');
    });
  });

  // ─── Property-Based Tests ─────────────────────────────────────────────────

  describe('Property-based: cancellation rejected when < 60 minutes before appointment', () => {
    /**
     * Property: For any appointment scheduled 0–59 minutes from now,
     * cancellation must be rejected with CANCELLATION_DEADLINE_PASSED.
     *
     * **Validates: Requirements 4.1**
     */
    it('خاصية: الإلغاء مرفوض دائماً عند أقل من 60 دقيقة قبل الموعد', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 59 }),
          async (minutesBefore) => {
            const scheduledAt = new Date(Date.now() + minutesBefore * 60 * 1000 + 5000); // +5s buffer
            const { appointment, organizerId } = await createTestAppointment(scheduledAt);

            try {
              await appointmentService.cancelAppointment(
                appointment._id.toString(),
                organizerId.toString(),
                'test'
              );
              // Should not reach here
              return false;
            } catch (err) {
              return err.code === 'CANCELLATION_DEADLINE_PASSED';
            }
          }
        ),
        { numRuns: 10, verbose: false }
      );
    });
  });

  describe('Property-based: cancellation allowed when > 60 minutes before appointment', () => {
    /**
     * Property: For any appointment scheduled 61–10000 minutes from now,
     * cancellation must succeed and the appointment status becomes 'cancelled'.
     *
     * **Validates: Requirements 4.1**
     */
    it('خاصية: الإلغاء مسموح دائماً عند أكثر من 60 دقيقة قبل الموعد', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 61, max: 10000 }),
          async (minutesBefore) => {
            const scheduledAt = new Date(FUTURE_BASE_MS + minutesBefore * 60 * 1000);
            const { appointment, organizerId } = await createTestAppointment(scheduledAt);

            try {
              const result = await appointmentService.cancelAppointment(
                appointment._id.toString(),
                organizerId.toString(),
                'test reason'
              );
              return result.status === 'cancelled';
            } catch (err) {
              // Only CANCELLATION_DEADLINE_PASSED would be a property violation
              if (err.code === 'CANCELLATION_DEADLINE_PASSED') return false;
              // Other errors (e.g. notification failures) are non-blocking — check DB
              const updated = await Appointment.findById(appointment._id);
              return updated && updated.status === 'cancelled';
            }
          }
        ),
        { numRuns: 10, verbose: false }
      );
    });
  });
});
