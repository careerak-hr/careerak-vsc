/**
 * Property test: No Double Booking
 * **Validates: Requirements 1.4, 6.1**
 *
 * Property 1: No Double Booking
 * For any time slot, no overlapping appointments unless maxConcurrent allows.
 *
 * Tests:
 * 1. Booking the same slot twice fails (maxConcurrent=1)
 * 2. Booking different non-overlapping slots succeeds
 * 3. maxConcurrent=2 allows 2 bookings but rejects the 3rd
 * 4. Property-based: overlapping intervals are always rejected when at capacity
 */

const mongoose = require('mongoose');
const fc = require('fast-check');
const Appointment = require('../src/models/Appointment');

// Mock services that are not needed for this unit-level test
jest.mock('../src/services/notificationService', () => ({
  createNotification: jest.fn().mockResolvedValue({}),
}));
jest.mock('../src/services/pusherService', () => ({
  isEnabled: jest.fn().mockReturnValue(false),
}));

// Fixed ObjectIds for test isolation
const ORGANIZER_ID = new mongoose.Types.ObjectId();
const PARTICIPANT_ID = new mongoose.Types.ObjectId();

// Base time in the far future to avoid conflicts with other tests
const BASE_TIME = new Date('2035-01-01T10:00:00Z').getTime();

/**
 * Create an appointment directly in the DB (bypasses HTTP layer)
 */
async function createAppointmentDirect({ organizerId, startTime, durationMinutes = 60 }) {
  const scheduledAt = new Date(startTime);
  const endsAt = new Date(scheduledAt.getTime() + durationMinutes * 60 * 1000);

  const appointment = new Appointment({
    type: 'video_interview',
    title: 'Test Appointment',
    organizerId,
    participants: [{ userId: PARTICIPANT_ID, status: 'pending' }],
    scheduledAt,
    duration: durationMinutes,
    endsAt,
    status: 'scheduled',
  });

  await appointment.save();
  return appointment;
}

/**
 * Core double-booking check logic
 * Mirrors the logic in appointmentController.createAppointment
 * Validates: Requirements 1.4, 6.1
 */
async function checkDoubleBooking({ organizerId, startTime, durationMinutes = 60, maxConcurrent = 1 }) {
  const scheduledDate = new Date(startTime);
  const endTime = new Date(scheduledDate.getTime() + durationMinutes * 60 * 1000);

  const overlappingCount = await Appointment.countDocuments({
    organizerId,
    status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
    scheduledAt: { $lt: endTime },
    endsAt: { $gt: scheduledDate },
  });

  return { overlappingCount, allowed: overlappingCount < maxConcurrent };
}

describe('Property 1: No Double Booking - Validates: Requirements 1.4, 6.1', () => {

  // ─── Unit Tests ───────────────────────────────────────────────────────────

  describe('Unit: booking the same slot twice fails', () => {
    it('يجب رفض الحجز المزدوج في نفس الوقت (maxConcurrent=1)', async () => {
      const startTime = BASE_TIME + 1 * 60 * 60 * 1000;

      await createAppointmentDirect({ organizerId: ORGANIZER_ID, startTime });

      const { allowed } = await checkDoubleBooking({ organizerId: ORGANIZER_ID, startTime, maxConcurrent: 1 });
      expect(allowed).toBe(false);
    });

    it('يجب رفض الحجز المتداخل جزئياً', async () => {
      const startTime1 = BASE_TIME + 3 * 60 * 60 * 1000;       // +3h, 60 min → ends at +4h
      const startTime2 = BASE_TIME + 3 * 60 * 60 * 1000 + 30 * 60 * 1000; // +3h30m (overlaps)

      await createAppointmentDirect({ organizerId: ORGANIZER_ID, startTime: startTime1, durationMinutes: 60 });

      const { allowed } = await checkDoubleBooking({ organizerId: ORGANIZER_ID, startTime: startTime2, durationMinutes: 60, maxConcurrent: 1 });
      expect(allowed).toBe(false);
    });
  });

  describe('Unit: booking different non-overlapping slots succeeds', () => {
    it('يجب السماح بحجز فترة تبدأ بعد انتهاء الفترة السابقة مباشرة', async () => {
      const startTime1 = BASE_TIME + 5 * 60 * 60 * 1000; // +5h, 60 min → ends at +6h
      const startTime2 = BASE_TIME + 6 * 60 * 60 * 1000; // +6h (starts exactly when first ends)

      await createAppointmentDirect({ organizerId: ORGANIZER_ID, startTime: startTime1, durationMinutes: 60 });

      const { allowed } = await checkDoubleBooking({ organizerId: ORGANIZER_ID, startTime: startTime2, durationMinutes: 60, maxConcurrent: 1 });
      expect(allowed).toBe(true);
    });

    it('يجب السماح بحجز فترة بعد انتهاء الفترة السابقة بفارق زمني', async () => {
      const startTime1 = BASE_TIME + 8 * 60 * 60 * 1000;  // +8h, 60 min
      const startTime2 = BASE_TIME + 10 * 60 * 60 * 1000; // +10h (2h gap)

      await createAppointmentDirect({ organizerId: ORGANIZER_ID, startTime: startTime1, durationMinutes: 60 });

      const { allowed } = await checkDoubleBooking({ organizerId: ORGANIZER_ID, startTime: startTime2, durationMinutes: 60, maxConcurrent: 1 });
      expect(allowed).toBe(true);
    });
  });

  describe('Unit: maxConcurrent=2 allows 2 bookings but rejects the 3rd', () => {
    it('يجب السماح بحجزين متزامنين عند maxConcurrent=2 ورفض الثالث', async () => {
      const startTime = BASE_TIME + 12 * 60 * 60 * 1000;

      // First booking → 1 overlap → 1 < 2 → allowed
      await createAppointmentDirect({ organizerId: ORGANIZER_ID, startTime });
      const check1 = await checkDoubleBooking({ organizerId: ORGANIZER_ID, startTime, maxConcurrent: 2 });
      expect(check1.allowed).toBe(true);

      // Second booking → 2 overlaps → 2 >= 2 → rejected
      await createAppointmentDirect({ organizerId: ORGANIZER_ID, startTime });
      const check2 = await checkDoubleBooking({ organizerId: ORGANIZER_ID, startTime, maxConcurrent: 2 });
      expect(check2.allowed).toBe(false);
      expect(check2.overlappingCount).toBe(2);
    });

    it('يجب السماح بحجز واحد عند maxConcurrent=1 ورفض الثاني', async () => {
      const startTime = BASE_TIME + 14 * 60 * 60 * 1000;

      await createAppointmentDirect({ organizerId: ORGANIZER_ID, startTime });
      const check = await checkDoubleBooking({ organizerId: ORGANIZER_ID, startTime, maxConcurrent: 1 });
      expect(check.allowed).toBe(false);
      expect(check.overlappingCount).toBe(1);
    });
  });

  // ─── Property-Based Tests ─────────────────────────────────────────────────

  describe('Property-based: overlapping intervals always rejected when at capacity', () => {
    /**
     * Property: For any two overlapping time intervals [s1, e1) and [s2, e2),
     * if maxConcurrent=1 and the first is booked, the second must be rejected.
     * Two intervals overlap iff s1 < e2 AND s2 < e1.
     *
     * **Validates: Requirements 1.4, 6.1**
     */
    it('خاصية: أي فترتان متداخلتان يجب رفض الثانية عند maxConcurrent=1', async () => {
      // Use a unique organizer per property run to avoid cross-run contamination
      const propOrganizerId = new mongoose.Types.ObjectId();
      const BASE = BASE_TIME + 24 * 60 * 60 * 1000; // day 2

      try {
        await fc.assert(
          fc.asyncProperty(
            // Generate two overlapping intervals:
            // s1 at some offset, dur1 hours long
            // s2 starts within [s1, s1+dur1) → guaranteed overlap
            fc.integer({ min: 0, max: 20 }).chain(startOffsetHours =>
              fc.integer({ min: 1, max: 4 }).chain(dur1 =>
                fc.integer({ min: 0, max: dur1 - 1 }).map(overlapOffset => ({
                  startOffsetHours,
                  dur1,
                  overlapOffset,
                }))
              )
            ),
            async ({ startOffsetHours, dur1, overlapOffset }) => {
              await Appointment.deleteMany({ organizerId: propOrganizerId });

              const s1 = BASE + startOffsetHours * 60 * 60 * 1000;
              const s2 = s1 + overlapOffset * 60 * 60 * 1000; // s2 < s1+dur1 → overlap

              await createAppointmentDirect({
                organizerId: propOrganizerId,
                startTime: s1,
                durationMinutes: dur1 * 60,
              });

              const { allowed } = await checkDoubleBooking({
                organizerId: propOrganizerId,
                startTime: s2,
                durationMinutes: 60,
                maxConcurrent: 1,
              });

              return allowed === false;
            }
          ),
          { numRuns: 30, verbose: false }
        );
      } finally {
        await Appointment.deleteMany({ organizerId: propOrganizerId });
      }
    });

    /**
     * Property: For any two non-overlapping intervals (s2 >= e1),
     * the second must be allowed when maxConcurrent=1.
     *
     * **Validates: Requirements 1.4, 6.1**
     */
    it('خاصية: أي فترتان غير متداخلتان يجب السماح بالثانية عند maxConcurrent=1', async () => {
      const propOrganizerId = new mongoose.Types.ObjectId();
      const BASE = BASE_TIME + 48 * 60 * 60 * 1000; // day 3

      try {
        await fc.assert(
          fc.asyncProperty(
            // s2 = e1 + gap (gap >= 0 → no overlap)
            fc.integer({ min: 0, max: 10 }).chain(startOffsetHours =>
              fc.integer({ min: 1, max: 3 }).chain(dur1 =>
                fc.integer({ min: 0, max: 5 }).map(gapHours => ({
                  startOffsetHours,
                  dur1,
                  gapHours,
                }))
              )
            ),
            async ({ startOffsetHours, dur1, gapHours }) => {
              await Appointment.deleteMany({ organizerId: propOrganizerId });

              const s1 = BASE + startOffsetHours * 60 * 60 * 1000;
              const e1 = s1 + dur1 * 60 * 60 * 1000;
              const s2 = e1 + gapHours * 60 * 60 * 1000; // s2 >= e1 → no overlap

              await createAppointmentDirect({
                organizerId: propOrganizerId,
                startTime: s1,
                durationMinutes: dur1 * 60,
              });

              const { allowed } = await checkDoubleBooking({
                organizerId: propOrganizerId,
                startTime: s2,
                durationMinutes: 60,
                maxConcurrent: 1,
              });

              return allowed === true;
            }
          ),
          { numRuns: 30, verbose: false }
        );
      } finally {
        await Appointment.deleteMany({ organizerId: propOrganizerId });
      }
    });

    /**
     * Property: With maxConcurrent=N, exactly N overlapping bookings are allowed,
     * and the (N+1)th is rejected.
     *
     * **Validates: Requirements 1.4, 6.1**
     */
    it('خاصية: maxConcurrent=N يسمح بـ N حجوزات متزامنة ويرفض الـ N+1', async () => {
      const BASE = BASE_TIME + 72 * 60 * 60 * 1000; // day 4

      try {
        await fc.assert(
          fc.asyncProperty(
            fc.integer({ min: 1, max: 4 }), // maxConcurrent between 1 and 4
            async (maxConcurrent) => {
              // Use a fresh organizer per iteration to avoid cross-iteration contamination
              const iterOrganizerId = new mongoose.Types.ObjectId();

              const startTime = BASE;

              // Book exactly maxConcurrent appointments at the same slot
              for (let i = 0; i < maxConcurrent; i++) {
                await createAppointmentDirect({
                  organizerId: iterOrganizerId,
                  startTime,
                  durationMinutes: 60,
                });
              }

              // The (N+1)th booking must be rejected
              const { allowed, overlappingCount } = await checkDoubleBooking({
                organizerId: iterOrganizerId,
                startTime,
                durationMinutes: 60,
                maxConcurrent,
              });

              // overlappingCount must be >= maxConcurrent and booking must be rejected
              return allowed === false && overlappingCount >= maxConcurrent;
            }
          ),
          { numRuns: 20, verbose: false }
        );
      } finally {
        // No shared organizer to clean up — each iteration used its own
      }
    });
  });
});
