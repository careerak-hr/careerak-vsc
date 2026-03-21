/**
 * Property test: Google Calendar Sync
 * **Validates: Requirements 5.3, 5.4, 5.5**
 *
 * Property 4: Google Calendar Sync
 * For any appointment with an active Google Calendar integration:
 * - When a Google event is created, the appointment gets a googleEventId
 * - When cancelled (has googleEventId), deleteEventForAppointment calls axios.delete
 * - When rescheduled (has googleEventId), updateEventForAppointment calls axios.put
 */

const mongoose = require('mongoose');
const fc = require('fast-check');
const Appointment = require('../src/models/Appointment');
const CalendarIntegration = require('../src/models/CalendarIntegration');
const googleCalendarService = require('../src/services/googleCalendarService');

// Mock axios
jest.mock('axios');
const axios = require('axios');

// Mock other services
jest.mock('../src/services/notificationService', () => ({
  createNotification: jest.fn().mockResolvedValue({}),
}));
jest.mock('../src/services/pusherService', () => ({
  isEnabled: jest.fn().mockReturnValue(false),
}));
jest.mock('../src/services/reminderService', () => ({
  createRemindersForAppointment: jest.fn().mockResolvedValue([]),
}));

// Fixed IDs for test isolation
const PARTICIPANT_ID = new mongoose.Types.ObjectId();

// Far-future base time to avoid timing issues
const BASE_TIME = new Date('2035-06-01T10:00:00Z').getTime();

/**
 * Create a test CalendarIntegration with a valid (non-expired) token
 */
async function createTestIntegration(userId) {
  const integration = new CalendarIntegration({
    userId,
    isActive: true,
    calendarId: 'primary',
    googleEmail: 'test@gmail.com',
    googleUserId: 'google-user-123',
    tokenExpiry: new Date(Date.now() + 3600 * 1000), // 1 hour from now
  });
  integration.setAccessToken('fake-access-token');
  await integration.save();
  return integration;
}

/**
 * Create a test appointment in the DB
 */
async function createTestAppointment({ organizerId, title = 'Test Interview', durationMinutes = 60, googleEventId = null }) {
  const scheduledAt = new Date(BASE_TIME);
  const endsAt = new Date(BASE_TIME + durationMinutes * 60 * 1000);

  const appointment = new Appointment({
    type: 'video_interview',
    title,
    organizerId,
    participants: [{ userId: PARTICIPANT_ID, status: 'pending' }],
    scheduledAt,
    duration: durationMinutes,
    endsAt,
    status: 'scheduled',
    googleEventId,
  });

  await appointment.save();
  return appointment;
}

describe('Property 4: Google Calendar Sync — Validates: Requirements 5.3, 5.4, 5.5', () => {

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock axios.post for event creation (and token refresh)
    axios.post = jest.fn().mockResolvedValue({
      data: {
        id: 'google-event-id-123',
        htmlLink: 'https://calendar.google.com/event/123',
        conferenceData: null,
      },
    });

    // Mock axios.get for events list
    axios.get = jest.fn().mockResolvedValue({ data: { items: [] } });

    // Mock axios.put for event update
    axios.put = jest.fn().mockResolvedValue({
      data: {
        id: 'google-event-id-123',
        htmlLink: 'https://calendar.google.com/event/123',
      },
    });

    // Mock axios.delete for event deletion
    axios.delete = jest.fn().mockResolvedValue({ data: {} });
  });

  // ─── Unit Tests ───────────────────────────────────────────────────────────

  describe('Unit: createEventForAppointment updates appointment with googleEventId', () => {
    it('يجب أن يُنشئ حدثاً في Google Calendar ويحفظ googleEventId في الموعد', async () => {
      const organizerId = new mongoose.Types.ObjectId();
      await createTestIntegration(organizerId);
      const appointment = await createTestAppointment({ organizerId });

      await googleCalendarService.createEventForAppointment(appointment, organizerId);

      expect(axios.post).toHaveBeenCalled();

      const updated = await Appointment.findById(appointment._id);
      expect(updated.googleEventId).toBe('google-event-id-123');
    });
  });

  describe('Unit: deleteEventForAppointment calls delete when googleEventId exists', () => {
    it('يجب استدعاء axios.delete عند وجود googleEventId', async () => {
      const organizerId = new mongoose.Types.ObjectId();
      await createTestIntegration(organizerId);
      const appointment = await createTestAppointment({ organizerId, googleEventId: 'existing-event-id' });

      await googleCalendarService.deleteEventForAppointment(appointment, organizerId);

      expect(axios.delete).toHaveBeenCalled();
    });

    it('يجب عدم استدعاء axios.delete عند غياب googleEventId', async () => {
      const organizerId = new mongoose.Types.ObjectId();
      await createTestIntegration(organizerId);
      const appointment = await createTestAppointment({ organizerId, googleEventId: null });

      await googleCalendarService.deleteEventForAppointment(appointment, organizerId);

      expect(axios.delete).not.toHaveBeenCalled();
    });
  });

  describe('Unit: updateEventForAppointment calls update when googleEventId exists', () => {
    it('يجب استدعاء axios.put عند وجود googleEventId', async () => {
      const organizerId = new mongoose.Types.ObjectId();
      await createTestIntegration(organizerId);
      const appointment = await createTestAppointment({ organizerId, googleEventId: 'existing-event-id' });

      await googleCalendarService.updateEventForAppointment(appointment, organizerId);

      expect(axios.put).toHaveBeenCalled();
    });
  });

  // ─── Property-Based Tests ─────────────────────────────────────────────────

  describe('Property-based: Google Calendar Sync', () => {

    /**
     * Property A: createEventForAppointment updates appointment with googleEventId
     * For any appointment title and duration, when createEventForAppointment is called
     * with an active integration, the appointment in DB gets a googleEventId.
     *
     * **Validates: Requirements 5.3**
     */
    it('خاصية أ: createEventForAppointment يُحدّث الموعد بـ googleEventId لأي عنوان ومدة', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.integer({ min: 15, max: 120 }),
          async (title, durationMinutes) => {
            const organizerId = new mongoose.Types.ObjectId();
            await CalendarIntegration.deleteMany({ userId: organizerId });
            await createTestIntegration(organizerId);

            const appointment = await createTestAppointment({ organizerId, title, durationMinutes });

            // Reset mock to ensure fresh call tracking
            axios.post = jest.fn().mockResolvedValue({
              data: {
                id: `google-event-${appointment._id}`,
                htmlLink: 'https://calendar.google.com/event/test',
                conferenceData: null,
              },
            });

            await googleCalendarService.createEventForAppointment(appointment, organizerId);

            // axios.post must have been called (Google API was invoked)
            const postCalled = axios.post.mock.calls.length > 0;

            // The appointment in DB must now have a googleEventId
            const updated = await Appointment.findById(appointment._id);
            const hasGoogleEventId = updated.googleEventId !== null && updated.googleEventId !== undefined;

            await Appointment.deleteMany({ organizerId });
            await CalendarIntegration.deleteMany({ userId: organizerId });

            return postCalled && hasGoogleEventId;
          }
        ),
        { numRuns: 10, verbose: false }
      );
    });

    /**
     * Property B: deleteEventForAppointment calls deleteEvent when googleEventId exists
     * For any non-empty googleEventId string, when deleteEventForAppointment is called,
     * axios.delete must be invoked.
     *
     * **Validates: Requirements 5.5**
     */
    it('خاصية ب: deleteEventForAppointment يستدعي axios.delete لأي googleEventId موجود', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }),
          async (googleEventId) => {
            const organizerId = new mongoose.Types.ObjectId();
            await CalendarIntegration.deleteMany({ userId: organizerId });
            await createTestIntegration(organizerId);

            const appointment = await createTestAppointment({ organizerId, googleEventId });

            axios.delete = jest.fn().mockResolvedValue({ data: {} });

            await googleCalendarService.deleteEventForAppointment(appointment, organizerId);

            const deleteCalled = axios.delete.mock.calls.length > 0;

            await Appointment.deleteMany({ organizerId });
            await CalendarIntegration.deleteMany({ userId: organizerId });

            return deleteCalled;
          }
        ),
        { numRuns: 10, verbose: false }
      );
    });

    /**
     * Property C: deleteEventForAppointment does nothing when no googleEventId
     * For any appointment without a googleEventId, axios.delete must NOT be called.
     *
     * **Validates: Requirements 5.5**
     */
    it('خاصية ج: deleteEventForAppointment لا يستدعي axios.delete عند غياب googleEventId', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }),
          async (title) => {
            const organizerId = new mongoose.Types.ObjectId();
            await CalendarIntegration.deleteMany({ userId: organizerId });
            await createTestIntegration(organizerId);

            // Appointment with no googleEventId
            const appointment = await createTestAppointment({ organizerId, title, googleEventId: null });

            axios.delete = jest.fn().mockResolvedValue({ data: {} });

            await googleCalendarService.deleteEventForAppointment(appointment, organizerId);

            const deleteNotCalled = axios.delete.mock.calls.length === 0;

            await Appointment.deleteMany({ organizerId });
            await CalendarIntegration.deleteMany({ userId: organizerId });

            return deleteNotCalled;
          }
        ),
        { numRuns: 10, verbose: false }
      );
    });

    /**
     * Property D: updateEventForAppointment calls updateEvent when googleEventId exists
     * For any non-empty googleEventId string, when updateEventForAppointment is called,
     * axios.put must be invoked.
     *
     * **Validates: Requirements 5.4**
     */
    it('خاصية د: updateEventForAppointment يستدعي axios.put لأي googleEventId موجود', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }),
          async (googleEventId) => {
            const organizerId = new mongoose.Types.ObjectId();
            await CalendarIntegration.deleteMany({ userId: organizerId });
            await createTestIntegration(organizerId);

            const appointment = await createTestAppointment({ organizerId, googleEventId });

            axios.put = jest.fn().mockResolvedValue({
              data: {
                id: googleEventId,
                htmlLink: 'https://calendar.google.com/event/test',
              },
            });

            await googleCalendarService.updateEventForAppointment(appointment, organizerId);

            const putCalled = axios.put.mock.calls.length > 0;

            await Appointment.deleteMany({ organizerId });
            await CalendarIntegration.deleteMany({ userId: organizerId });

            return putCalled;
          }
        ),
        { numRuns: 10, verbose: false }
      );
    });
  });
});
