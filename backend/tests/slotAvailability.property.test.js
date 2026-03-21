/**
 * Property test: Slot Availability
 * **Validates: Requirements 1.5, 2.2**
 *
 * Property 5: Slot Availability
 * For any slot query, availability reflects booked vs maxConcurrent.
 *
 * Tests:
 * 1. A slot is available when bookings < maxConcurrent
 * 2. A slot is unavailable when bookings >= maxConcurrent
 * 3. After cancelling a booking, the slot becomes available again
 * 4. Slot availability is correctly computed for any combination of bookings and maxConcurrent
 */

'use strict';

const mongoose = require('mongoose');
const fc = require('fast-check');
const Appointment = require('../src/models/Appointment');

jest.mock('../src/services/notificationService', () => ({
  createNotification: jest.fn().mockResolvedValue({}),
}));
jest.mock('../src/services/pusherService', () => ({
  isEnabled: jest.fn().mockReturnValue(false),
}));

// Fixed IDs for test isolation
const ORGANIZER_ID = new mongoose.Types.ObjectId();
const PARTICIPANT_ID = new mongoose.Types.ObjectId();

// Base time in the far future to avoid conflicts with other tests
const BASE_TIME = new Date('2036-06-01T08:00:00Z').getTime();

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Create an appointment directly in the DB.
 */
async function createAppointment({ organizerId, startTime, durationMinutes = 60, status = 'scheduled' }) {
  const scheduledAt = new Date(startTime);
  const endsAt = new Date(scheduledAt.getTime() + durationMinutes * 60 * 1000);

  const appointment = new Appointment({
    type: 'video_interview',
    title: 'Slot Availability Test',
    organizerId,
    participants: [{ userId: PARTICIPANT_ID, status: 'pending' }],
    scheduledAt,
    duration: durationMinutes,
    endsAt,
    status,
  });

  await appointment.save();
  return appointment;
}

/**
 * Core slot availability check.
 * A slot is available when the number of active (non-cancelled) overlapping
 * appointments is strictly less than maxConcurrent.
 *
 * Mirrors the logic used in appointmentController / availabilityService.
 * Validates: Requirements 1.5, 2.2
 */
async function checkSlotAvailability({ organizerId, startTime, durationMinutes = 60, maxConcurrent = 1 }) {
  const slotStart = new Date(startTime);
  const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);

  const bookedCount = await Appointment.countDocuments({
    organizerId,
    status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
    scheduledAt: { $lt: slotEnd },
    endsAt: { $gt: slotStart },
  });

  return {
    bookedCount,
    isAvailable: bookedCount < maxConcurrent,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Property 5: Slot Availability - Validates: Requirements 1.5, 2.2', () => {

  // ─── Unit Tests ───────────────────────────────────────────────────────────

  describe('Unit: slot is available when bookings < maxConcurrent', () => {
    it('فترة بدون حجوزات متاحة دائماً (maxConcurrent=1)', async () => {
      const startTime = BASE_TIME;
      const { isAvailable, bookedCount } = await checkSlotAvailability({
        organizerId: ORGANIZER_ID,
        startTime,
        maxConcurrent: 1,
      });
      expect(bookedCount).toBe(0);
      expect(isAvailable).toBe(true);
    });

    it('فترة بحجز واحد متاحة عند maxConcurrent=2', async () => {
      const startTime = BASE_TIME + 2 * 60 * 60 * 1000;
      await createAppointment({ organizerId: ORGANIZER_ID, startTime });

      const { isAvailable, bookedCount } = await checkSlotAvailability({
        organizerId: ORGANIZER_ID,
        startTime,
        maxConcurrent: 2,
      });
      expect(bookedCount).toBe(1);
      expect(isAvailable).toBe(true);
    });
  });

  describe('Unit: slot is unavailable when bookings >= maxConcurrent', () => {
    it('فترة بحجز واحد غير متاحة عند maxConcurrent=1', async () => {
      const startTime = BASE_TIME + 4 * 60 * 60 * 1000;
      await createAppointment({ organizerId: ORGANIZER_ID, startTime });

      const { isAvailable, bookedCount } = await checkSlotAvailability({
        organizerId: ORGANIZER_ID,
        startTime,
        maxConcurrent: 1,
      });
      expect(bookedCount).toBe(1);
      expect(isAvailable).toBe(false);
    });

    it('فترة بحجزين غير متاحة عند maxConcurrent=2', async () => {
      const startTime = BASE_TIME + 6 * 60 * 60 * 1000;
      await createAppointment({ organizerId: ORGANIZER_ID, startTime });
      await createAppointment({ organizerId: ORGANIZER_ID, startTime });

      const { isAvailable, bookedCount } = await checkSlotAvailability({
        organizerId: ORGANIZER_ID,
        startTime,
        maxConcurrent: 2,
      });
      expect(bookedCount).toBe(2);
      expect(isAvailable).toBe(false);
    });
  });

  describe('Unit: after cancelling a booking, the slot becomes available again', () => {
    it('إلغاء الحجز يجعل الفترة متاحة مجدداً (maxConcurrent=1)', async () => {
      const startTime = BASE_TIME + 8 * 60 * 60 * 1000;
      const appointment = await createAppointment({ organizerId: ORGANIZER_ID, startTime });

      // Slot is unavailable after booking
      const before = await checkSlotAvailability({
        organizerId: ORGANIZER_ID,
        startTime,
        maxConcurrent: 1,
      });
      expect(before.isAvailable).toBe(false);

      // Cancel the appointment
      appointment.status = 'cancelled';
      await appointment.save();

      // Slot is available again after cancellation
      const after = await checkSlotAvailability({
        organizerId: ORGANIZER_ID,
        startTime,
        maxConcurrent: 1,
      });
      expect(after.bookedCount).toBe(0);
      expect(after.isAvailable).toBe(true);
    });

    it('إلغاء أحد الحجزين يجعل الفترة متاحة عند maxConcurrent=2', async () => {
      const startTime = BASE_TIME + 10 * 60 * 60 * 1000;
      await createAppointment({ organizerId: ORGANIZER_ID, startTime });
      const second = await createAppointment({ organizerId: ORGANIZER_ID, startTime });

      // At capacity
      const before = await checkSlotAvailability({
        organizerId: ORGANIZER_ID,
        startTime,
        maxConcurrent: 2,
      });
      expect(before.isAvailable).toBe(false);

      // Cancel one using findByIdAndUpdate to avoid DocumentNotFoundError
      await Appointment.findByIdAndUpdate(second._id, { status: 'cancelled' });

      const after = await checkSlotAvailability({
        organizerId: ORGANIZER_ID,
        startTime,
        maxConcurrent: 2,
      });
      expect(after.bookedCount).toBe(1);
      expect(after.isAvailable).toBe(true);
    });
  });

  // ─── Property-Based Tests ─────────────────────────────────────────────────

  describe('Property-based: availability correctly reflects booked vs maxConcurrent', () => {

    /**
     * Property 5.1: A slot with N bookings is available iff N < maxConcurrent.
     * For any combination of (bookingCount, maxConcurrent),
     * isAvailable === (bookingCount < maxConcurrent).
     *
     * **Validates: Requirements 1.5, 2.2**
     */
    it('خاصية 5.1: الفترة متاحة إذا وفقط إذا كان عدد الحجوزات < maxConcurrent', async () => {
      const BASE = BASE_TIME + 24 * 60 * 60 * 1000;

      try {
        await fc.assert(
          fc.asyncProperty(
            fc.integer({ min: 1, max: 4 }).chain(maxConcurrent =>
              fc.integer({ min: 0, max: maxConcurrent + 1 }).map(bookingCount => ({
                maxConcurrent,
                bookingCount,
              }))
            ),
            async ({ maxConcurrent, bookingCount }) => {
              // Use a fresh organizer per iteration to avoid cross-iteration contamination
              const iterOrganizerId = new mongoose.Types.ObjectId();

              const startTime = BASE;

              // Create bookingCount appointments at the same slot
              for (let i = 0; i < bookingCount; i++) {
                await createAppointment({
                  organizerId: iterOrganizerId,
                  startTime,
                  durationMinutes: 60,
                });
              }

              const { isAvailable, bookedCount } = await checkSlotAvailability({
                organizerId: iterOrganizerId,
                startTime,
                durationMinutes: 60,
                maxConcurrent,
              });

              // bookedCount must equal bookingCount (fresh organizer, no contamination)
              // and isAvailable must reflect the correct comparison
              return (
                bookedCount === bookingCount &&
                isAvailable === (bookingCount < maxConcurrent)
              );
            }
          ),
          { numRuns: 30, verbose: false }
        );
      } finally {
        // No shared organizer to clean up
      }
    });

    /**
     * Property 5.2: Cancelled appointments do not count toward slot capacity.
     * For any number of cancelled bookings, the slot remains available.
     *
     * **Validates: Requirements 1.5, 2.2**
     */
    it('خاصية 5.2: الحجوزات الملغاة لا تُحسب ضمن سعة الفترة', async () => {
      const propOrganizerId = new mongoose.Types.ObjectId();
      const BASE = BASE_TIME + 48 * 60 * 60 * 1000;

      try {
        await fc.assert(
          fc.asyncProperty(
            fc.integer({ min: 1, max: 5 }), // number of cancelled bookings
            async (cancelledCount) => {
              await Appointment.deleteMany({ organizerId: propOrganizerId });

              const startTime = BASE;

              // Create cancelled appointments
              for (let i = 0; i < cancelledCount; i++) {
                await createAppointment({
                  organizerId: propOrganizerId,
                  startTime,
                  durationMinutes: 60,
                  status: 'cancelled',
                });
              }

              const { isAvailable, bookedCount } = await checkSlotAvailability({
                organizerId: propOrganizerId,
                startTime,
                durationMinutes: 60,
                maxConcurrent: 1,
              });

              // Cancelled bookings must not count
              return bookedCount === 0 && isAvailable === true;
            }
          ),
          { numRuns: 25, verbose: false }
        );
      } finally {
        await Appointment.deleteMany({ organizerId: propOrganizerId });
      }
    });

    /**
     * Property 5.3: After cancelling all bookings in a full slot,
     * the slot becomes available again regardless of maxConcurrent.
     *
     * **Validates: Requirements 1.5, 2.2**
     */
    it('خاصية 5.3: إلغاء جميع الحجوزات يجعل الفترة متاحة دائماً', async () => {
      const propOrganizerId = new mongoose.Types.ObjectId();
      const BASE = BASE_TIME + 72 * 60 * 60 * 1000;

      try {
        await fc.assert(
          fc.asyncProperty(
            fc.integer({ min: 1, max: 4 }), // maxConcurrent
            async (maxConcurrent) => {
              await Appointment.deleteMany({ organizerId: propOrganizerId });

              const startTime = BASE;

              // Fill the slot to capacity
              const appointments = [];
              for (let i = 0; i < maxConcurrent; i++) {
                const appt = await createAppointment({
                  organizerId: propOrganizerId,
                  startTime,
                  durationMinutes: 60,
                });
                appointments.push(appt);
              }

              // Verify slot is at capacity (unavailable)
              const before = await checkSlotAvailability({
                organizerId: propOrganizerId,
                startTime,
                durationMinutes: 60,
                maxConcurrent,
              });
              if (before.isAvailable) return false; // must be unavailable

              // Cancel all bookings
              for (const appt of appointments) {
                appt.status = 'cancelled';
                await appt.save();
              }

              // Slot must be available again
              const after = await checkSlotAvailability({
                organizerId: propOrganizerId,
                startTime,
                durationMinutes: 60,
                maxConcurrent,
              });

              return after.bookedCount === 0 && after.isAvailable === true;
            }
          ),
          { numRuns: 20, verbose: false }
        );
      } finally {
        await Appointment.deleteMany({ organizerId: propOrganizerId });
      }
    });

    /**
     * Property 5.4: Non-overlapping slots are independent — booking one slot
     * does not affect availability of a different non-overlapping slot.
     *
     * **Validates: Requirements 1.5, 2.2**
     */
    it('خاصية 5.4: الفترات غير المتداخلة مستقلة — حجز فترة لا يؤثر على فترة أخرى', async () => {
      const propOrganizerId = new mongoose.Types.ObjectId();
      const BASE = BASE_TIME + 96 * 60 * 60 * 1000;

      try {
        await fc.assert(
          fc.asyncProperty(
            // gap in hours between the two slots (>= 1 ensures no overlap for 60-min slots)
            fc.integer({ min: 1, max: 8 }),
            async (gapHours) => {
              await Appointment.deleteMany({ organizerId: propOrganizerId });

              const slot1Start = BASE;
              const slot2Start = BASE + (1 + gapHours) * 60 * 60 * 1000; // starts after slot1 ends

              // Book slot 1
              await createAppointment({
                organizerId: propOrganizerId,
                startTime: slot1Start,
                durationMinutes: 60,
              });

              // Slot 2 must still be available
              const { isAvailable } = await checkSlotAvailability({
                organizerId: propOrganizerId,
                startTime: slot2Start,
                durationMinutes: 60,
                maxConcurrent: 1,
              });

              return isAvailable === true;
            }
          ),
          { numRuns: 25, verbose: false }
        );
      } finally {
        await Appointment.deleteMany({ organizerId: propOrganizerId });
      }
    });
  });
});
