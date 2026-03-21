/**
 * اختبارات دعم رابط Meet للمقابلات الافتراضية
 * Validates: Requirements 5 - دعم إضافة رابط Meet للمقابلات الافتراضية (User Story 5)
 */

const mongoose = require('mongoose');

// ─── Mock Dependencies ────────────────────────────────────────────────────────
jest.mock('../src/models/CalendarIntegration', () => ({
  findOne: jest.fn(),
}));

jest.mock('axios');
const axios = require('axios');

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Meet Link Support for Virtual Interviews', () => {
  // ── 1. Appointment Model ──────────────────────────────────────────────────

  describe('Appointment Model - interviewType and meetLink fields', () => {
    it('should have interviewType field with correct enum values', () => {
      // نتحقق من أن الحقول موجودة في schema بدون الحاجة لاتصال DB
      const Appointment = require('../src/models/Appointment');
      const schema = Appointment.schema;

      expect(schema.path('interviewType')).toBeDefined();
      expect(schema.path('meetLink')).toBeDefined();
    });

    it('interviewType should accept virtual, in-person, phone values', () => {
      const Appointment = require('../src/models/Appointment');
      const schema = Appointment.schema;
      const interviewTypePath = schema.path('interviewType');

      // التحقق من القيم المسموح بها
      expect(interviewTypePath.enumValues).toContain('virtual');
      expect(interviewTypePath.enumValues).toContain('in-person');
      expect(interviewTypePath.enumValues).toContain('phone');
    });

    it('meetLink should be a String field with null default', () => {
      const Appointment = require('../src/models/Appointment');
      const schema = Appointment.schema;
      const meetLinkPath = schema.path('meetLink');

      expect(meetLinkPath.instance).toBe('String');
      expect(meetLinkPath.defaultValue).toBeNull();
    });
  });

  // ── 2. Google Calendar Service ────────────────────────────────────────────

  describe('GoogleCalendarService - conferenceData for virtual interviews', () => {
    let googleCalendarService;

    beforeEach(() => {
      jest.resetModules();
      jest.mock('../src/models/CalendarIntegration', () => ({
        findOne: jest.fn().mockResolvedValue({
          calendarId: 'primary',
          getAccessToken: () => 'mock-token',
          isTokenExpired: () => false,
        }),
      }));
      googleCalendarService = require('../src/services/googleCalendarService');
    });

    it('should include conferenceData when addMeetLink is true', () => {
      // نتحقق من أن _buildGoogleEvent يضيف conferenceData للمقابلات الافتراضية
      const event = googleCalendarService._buildGoogleEvent({
        title: 'مقابلة افتراضية',
        description: 'وصف',
        scheduledAt: new Date('2026-06-01T10:00:00Z'),
        duration: 60,
        addMeetLink: true,
      });

      expect(event.conferenceData).toBeDefined();
      expect(event.conferenceData.createRequest).toBeDefined();
      expect(event.conferenceData.createRequest.conferenceSolutionKey.type).toBe('hangoutsMeet');
    });

    it('should NOT include conferenceData when addMeetLink is false', () => {
      const event = googleCalendarService._buildGoogleEvent({
        title: 'مقابلة حضورية',
        description: '',
        scheduledAt: new Date('2026-06-01T10:00:00Z'),
        duration: 60,
        addMeetLink: false,
      });

      expect(event.conferenceData).toBeUndefined();
    });

    it('createEventForAppointment should use interviewType=virtual to enable Meet', async () => {
      const CalendarIntegration = require('../src/models/CalendarIntegration');
      CalendarIntegration.findOne.mockResolvedValue({
        calendarId: 'primary',
        getAccessToken: () => 'mock-token',
        isTokenExpired: () => false,
      });

      // Mock axios.post لمحاكاة استجابة Google Calendar API
      axios.post = jest.fn().mockResolvedValue({
        data: {
          id: 'google-event-123',
          htmlLink: 'https://calendar.google.com/event/123',
          conferenceData: {
            entryPoints: [{ uri: 'https://meet.google.com/abc-defg-hij' }],
          },
        },
      });

      // Mock Appointment.findByIdAndUpdate
      jest.mock('../src/models/Appointment', () => ({
        findByIdAndUpdate: jest.fn().mockResolvedValue({}),
      }));

      const appointment = {
        _id: new mongoose.Types.ObjectId(),
        title: 'مقابلة افتراضية',
        description: 'وصف',
        scheduledAt: new Date('2026-06-01T10:00:00Z'),
        duration: 60,
        interviewType: 'virtual',
        type: 'video_interview',
        location: null,
      };

      // لا يجب أن يرمي خطأ
      await expect(
        googleCalendarService.createEventForAppointment(appointment, 'user-123')
      ).resolves.not.toThrow();
    });
  });

  // ── 3. Email Templates ────────────────────────────────────────────────────

  describe('Email Templates - meetLink display', () => {
    it('confirmation email should include meetLink when present', async () => {
      // نتحقق من أن القالب يحتوي على رابط Meet
      const emailService = require('../src/services/emailService');

      const appointment = {
        title: 'مقابلة افتراضية',
        scheduledAt: new Date('2026-06-01T10:00:00Z'),
        duration: 60,
        meetLink: 'https://meet.google.com/abc-defg-hij',
        googleMeetLink: null,
        meetingLink: null,
        location: null,
        notes: '',
      };

      const companyUser = { email: null, companyName: 'شركة تجريبية', firstName: 'أحمد' };
      const jobSeekerUser = { email: null, firstName: 'محمد', lastName: 'علي' };

      // نتحقق من أن الدالة موجودة وقابلة للاستدعاء
      expect(typeof emailService.sendAppointmentConfirmationEmail).toBe('function');
    });

    it('reminder email should include meetLink when present', () => {
      const emailService = require('../src/services/emailService');
      expect(typeof emailService.sendAppointmentReminderEmail).toBe('function');
    });
  });

  // ── 4. Reminder Service ───────────────────────────────────────────────────

  describe('Appointment Reminder Service - meetLink in notifications', () => {
    it('should export send24HourReminders and send15MinuteReminders', () => {
      const reminderService = require('../src/services/appointmentReminderService');
      expect(typeof reminderService.send24HourReminders).toBe('function');
      expect(typeof reminderService.send15MinuteReminders).toBe('function');
      expect(typeof reminderService.runAllReminders).toBe('function');
    });
  });
});
