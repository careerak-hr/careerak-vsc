/**
 * اختبارات Google Calendar Service
 * 
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 * Property 4: Google Calendar Sync
 */

const googleCalendarService = require('../src/services/googleCalendarService');
const CalendarIntegration = require('../src/models/CalendarIntegration');

// Mock axios
jest.mock('axios');
const axios = require('axios');

// Mock CalendarIntegration model
jest.mock('../src/models/CalendarIntegration');

// Mock Appointment model
jest.mock('../src/models/Appointment', () => ({
  findByIdAndUpdate: jest.fn().mockResolvedValue({}),
  find: jest.fn().mockResolvedValue([]),
}));

describe('GoogleCalendarService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_CLIENT_ID = 'test_client_id';
    process.env.GOOGLE_CLIENT_SECRET = 'test_client_secret';
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost:5000/integrations/google/callback';
  });

  // ─── 1. getAuthorizationUrl ───────────────────────────────────────────────

  describe('getAuthorizationUrl', () => {
    it('يجب أن يولد رابط OAuth صالح مع state', () => {
      const userId = '507f1f77bcf86cd799439011';
      const result = googleCalendarService.getAuthorizationUrl(userId);

      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('state');
      expect(result.url).toContain('accounts.google.com');
      expect(result.url).toContain('client_id=');
      expect(result.url).toContain('calendar');
      expect(result.state).toContain(userId);
    });

    it('يجب أن يطلب offline access للحصول على refresh_token', () => {
      const userId = '507f1f77bcf86cd799439011';
      const result = googleCalendarService.getAuthorizationUrl(userId);

      expect(result.url).toContain('access_type=offline');
      expect(result.url).toContain('prompt=consent');
    });

    it('يجب أن يطلب صلاحيات Calendar و Events', () => {
      const userId = '507f1f77bcf86cd799439011';
      const result = googleCalendarService.getAuthorizationUrl(userId);

      expect(result.url).toContain('calendar');
    });
  });

  // ─── 2. handleCallback ────────────────────────────────────────────────────

  describe('handleCallback', () => {
    it('يجب أن يحفظ tokens بعد OAuth callback ناجح', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const state = 'randomhex_' + userId;

      // Mock token exchange
      axios.post.mockResolvedValueOnce({
        data: {
          access_token: 'test_access_token',
          refresh_token: 'test_refresh_token',
          expires_in: 3600,
        },
      });

      // Mock user info
      axios.get.mockResolvedValueOnce({
        data: {
          id: 'google_user_123',
          email: 'test@gmail.com',
        },
      });

      // Mock CalendarIntegration
      const mockIntegration = {
        setAccessToken: jest.fn(),
        setRefreshToken: jest.fn(),
        save: jest.fn().mockResolvedValue({}),
        tokenExpiry: null,
        googleUserId: null,
        googleEmail: null,
        isActive: false,
      };
      CalendarIntegration.findOne.mockResolvedValue(null);
      CalendarIntegration.mockImplementation(() => mockIntegration);

      const result = await googleCalendarService.handleCallback('auth_code', state);

      expect(result.success).toBe(true);
      expect(result.googleEmail).toBe('test@gmail.com');
      expect(mockIntegration.setAccessToken).toHaveBeenCalledWith('test_access_token');
      expect(mockIntegration.setRefreshToken).toHaveBeenCalledWith('test_refresh_token');
    });

    it('يجب أن يرفع خطأ إذا كان state غير صالح', async () => {
      await expect(
        googleCalendarService.handleCallback('code', 'invalid')
      ).rejects.toThrow('Invalid state parameter');
    });
  });

  // ─── 3. refreshAccessToken ────────────────────────────────────────────────

  describe('refreshAccessToken', () => {
    it('يجب أن يجدد access token منتهي الصلاحية', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const mockIntegration = {
        getRefreshToken: jest.fn().mockReturnValue('valid_refresh_token'),
        setAccessToken: jest.fn(),
        tokenExpiry: null,
        save: jest.fn().mockResolvedValue({}),
      };
      CalendarIntegration.findOne.mockResolvedValue(mockIntegration);

      axios.post.mockResolvedValueOnce({
        data: {
          access_token: 'new_access_token',
          expires_in: 3600,
        },
      });

      const newToken = await googleCalendarService.refreshAccessToken(userId);

      expect(newToken).toBe('new_access_token');
      expect(mockIntegration.setAccessToken).toHaveBeenCalledWith('new_access_token');
      expect(mockIntegration.save).toHaveBeenCalled();
    });

    it('يجب أن يرجع خطأ إذا لم يكن هناك ربط', async () => {
      CalendarIntegration.findOne.mockResolvedValue(null);

      await expect(
        googleCalendarService.refreshAccessToken('nonexistent_user')
      ).rejects.toThrow('لا يوجد ربط مع Google Calendar');
    });
  });

  // ─── 4. createEvent ───────────────────────────────────────────────────────

  describe('createEvent - Property 4: Google Calendar Sync', () => {
    it('يجب أن ينشئ حدث في Google Calendar عند الحجز', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const mockIntegration = {
        getAccessToken: jest.fn().mockReturnValue('valid_token'),
        isTokenExpired: jest.fn().mockReturnValue(false),
        calendarId: 'primary',
      };
      CalendarIntegration.findOne.mockResolvedValue(mockIntegration);

      axios.post.mockResolvedValueOnce({
        data: {
          id: 'google_event_123',
          htmlLink: 'https://calendar.google.com/event/123',
          conferenceData: null,
        },
      });

      const appointmentData = {
        _id: '507f1f77bcf86cd799439012',
        title: 'مقابلة عمل',
        description: 'مقابلة لوظيفة مطور',
        scheduledAt: new Date('2026-03-01T10:00:00Z'),
        duration: 60,
        location: 'مكتب الشركة',
        addMeetLink: false,
      };

      const result = await googleCalendarService.createEvent(userId, appointmentData);

      expect(result.success).toBe(true);
      expect(result.eventId).toBe('google_event_123');
      expect(result.eventLink).toBe('https://calendar.google.com/event/123');
    });

    it('يجب أن يضيف Google Meet link للمقابلات الافتراضية', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const mockIntegration = {
        getAccessToken: jest.fn().mockReturnValue('valid_token'),
        isTokenExpired: jest.fn().mockReturnValue(false),
        calendarId: 'primary',
      };
      CalendarIntegration.findOne.mockResolvedValue(mockIntegration);

      axios.post.mockResolvedValueOnce({
        data: {
          id: 'google_event_456',
          htmlLink: 'https://calendar.google.com/event/456',
          conferenceData: {
            entryPoints: [{ uri: 'https://meet.google.com/abc-def-ghi' }],
          },
        },
      });

      const appointmentData = {
        title: 'مقابلة فيديو',
        scheduledAt: new Date('2026-03-01T10:00:00Z'),
        duration: 45,
        addMeetLink: true,
      };

      const result = await googleCalendarService.createEvent(userId, appointmentData);

      expect(result.meetLink).toBe('https://meet.google.com/abc-def-ghi');
      // التحقق من إرسال conferenceDataVersion=1
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('events'),
        expect.any(Object),
        expect.objectContaining({
          params: expect.objectContaining({ conferenceDataVersion: 1 }),
        })
      );
    });
  });

  // ─── 5. updateEvent ───────────────────────────────────────────────────────

  describe('updateEvent - Property 4: Google Calendar Sync', () => {
    it('يجب أن يحدث الحدث في Google Calendar عند تعديل الموعد', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const mockIntegration = {
        getAccessToken: jest.fn().mockReturnValue('valid_token'),
        isTokenExpired: jest.fn().mockReturnValue(false),
        calendarId: 'primary',
      };
      CalendarIntegration.findOne.mockResolvedValue(mockIntegration);

      axios.put.mockResolvedValueOnce({
        data: {
          id: 'google_event_123',
          htmlLink: 'https://calendar.google.com/event/123',
        },
      });

      const result = await googleCalendarService.updateEvent(
        userId,
        'google_event_123',
        {
          title: 'مقابلة عمل - محدثة',
          scheduledAt: new Date('2026-03-02T11:00:00Z'),
          duration: 90,
        }
      );

      expect(result.success).toBe(true);
      expect(result.eventId).toBe('google_event_123');
      expect(axios.put).toHaveBeenCalled();
    });
  });

  // ─── 6. deleteEvent ───────────────────────────────────────────────────────

  describe('deleteEvent - Property 4: Google Calendar Sync', () => {
    it('يجب أن يحذف الحدث من Google Calendar عند إلغاء الموعد', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const mockIntegration = {
        getAccessToken: jest.fn().mockReturnValue('valid_token'),
        isTokenExpired: jest.fn().mockReturnValue(false),
        calendarId: 'primary',
      };
      CalendarIntegration.findOne.mockResolvedValue(mockIntegration);

      axios.delete.mockResolvedValueOnce({ data: {} });

      const result = await googleCalendarService.deleteEvent(userId, 'google_event_123');

      expect(result.success).toBe(true);
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining('google_event_123'),
        expect.any(Object)
      );
    });
  });

  // ─── 7. disconnectCalendar ────────────────────────────────────────────────

  describe('disconnectCalendar', () => {
    it('يجب أن يلغي الربط ويحذف التكامل من قاعدة البيانات', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const mockIntegration = {
        getAccessToken: jest.fn().mockReturnValue('valid_token'),
      };
      CalendarIntegration.findOne.mockResolvedValue(mockIntegration);
      CalendarIntegration.deleteOne.mockResolvedValue({});

      axios.post.mockResolvedValueOnce({ data: {} }); // revoke token

      const result = await googleCalendarService.disconnectCalendar(userId);

      expect(result.success).toBe(true);
      expect(CalendarIntegration.deleteOne).toHaveBeenCalledWith({ userId });
    });

    it('يجب أن يرجع نجاح إذا لم يكن هناك ربط', async () => {
      CalendarIntegration.findOne.mockResolvedValue(null);

      const result = await googleCalendarService.disconnectCalendar('nonexistent_user');

      expect(result.success).toBe(true);
    });
  });

  // ─── 8. getIntegrationStatus ──────────────────────────────────────────────

  describe('getIntegrationStatus', () => {
    it('يجب أن يرجع حالة الربط الصحيحة', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const mockIntegration = {
        isActive: true,
        googleEmail: 'test@gmail.com',
        calendarId: 'primary',
        lastSyncAt: new Date('2026-02-01'),
        isTokenExpired: jest.fn().mockReturnValue(false),
      };
      CalendarIntegration.findOne.mockResolvedValue(mockIntegration);

      const status = await googleCalendarService.getIntegrationStatus(userId);

      expect(status.isConnected).toBe(true);
      expect(status.googleEmail).toBe('test@gmail.com');
      expect(status.tokenExpired).toBe(false);
    });

    it('يجب أن يرجع isConnected=false إذا لم يكن هناك ربط', async () => {
      CalendarIntegration.findOne.mockResolvedValue(null);

      const status = await googleCalendarService.getIntegrationStatus('nonexistent_user');

      expect(status.isConnected).toBe(false);
    });
  });

  // ─── 9. createEventForAppointment ─────────────────────────────────────────

  describe('createEventForAppointment - Property 4: Google Calendar Sync', () => {
    it('يجب أن ينشئ حدث Google Calendar لموعد مقابلة فيديو', async () => {
      const organizerUserId = '507f1f77bcf86cd799439011';

      const mockIntegration = {
        isActive: true,
        getAccessToken: jest.fn().mockReturnValue('valid_token'),
        isTokenExpired: jest.fn().mockReturnValue(false),
        calendarId: 'primary',
      };
      CalendarIntegration.findOne.mockResolvedValue(mockIntegration);

      axios.post.mockResolvedValueOnce({
        data: {
          id: 'google_event_789',
          htmlLink: 'https://calendar.google.com/event/789',
          conferenceData: {
            entryPoints: [{ uri: 'https://meet.google.com/xyz' }],
          },
        },
      });

      const appointment = {
        _id: '507f1f77bcf86cd799439012',
        type: 'video_interview',
        title: 'مقابلة فيديو',
        description: 'مقابلة للوظيفة',
        scheduledAt: new Date('2026-03-01T10:00:00Z'),
        duration: 60,
        location: null,
      };

      // يجب أن لا يرمي خطأ
      await expect(
        googleCalendarService.createEventForAppointment(appointment, organizerUserId)
      ).resolves.not.toThrow();
    });

    it('يجب أن يتجاهل الخطأ إذا لم يكن هناك ربط (non-blocking)', async () => {
      CalendarIntegration.findOne.mockResolvedValue(null);

      const appointment = {
        _id: '507f1f77bcf86cd799439012',
        type: 'video_interview',
        title: 'مقابلة',
        scheduledAt: new Date(),
        duration: 60,
      };

      // يجب أن لا يرمي خطأ حتى لو لم يكن هناك ربط
      await expect(
        googleCalendarService.createEventForAppointment(appointment, 'user_without_integration')
      ).resolves.not.toThrow();
    });
  });

  // ─── 10. _buildGoogleEvent ────────────────────────────────────────────────

  describe('_buildGoogleEvent', () => {
    it('يجب أن يبني كائن الحدث بصيغة Google Calendar API الصحيحة', () => {
      const appointmentData = {
        title: 'مقابلة عمل',
        description: 'وصف المقابلة',
        scheduledAt: new Date('2026-03-01T10:00:00Z'),
        duration: 60,
        location: 'مكتب الشركة',
        participants: ['candidate@example.com'],
        addMeetLink: false,
      };

      const event = googleCalendarService._buildGoogleEvent(appointmentData);

      expect(event.summary).toBe('مقابلة عمل');
      expect(event.description).toBe('وصف المقابلة');
      expect(event.start.dateTime).toBeDefined();
      expect(event.end.dateTime).toBeDefined();
      expect(event.location).toBe('مكتب الشركة');
      expect(event.attendees).toHaveLength(1);
      expect(event.attendees[0].email).toBe('candidate@example.com');
    });

    it('يجب أن يحسب وقت الانتهاء بشكل صحيح', () => {
      const startTime = new Date('2026-03-01T10:00:00Z');
      const duration = 90; // 90 دقيقة

      const event = googleCalendarService._buildGoogleEvent({
        title: 'اختبار',
        scheduledAt: startTime,
        duration,
      });

      const start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);
      const diffMinutes = (end - start) / (60 * 1000);

      expect(diffMinutes).toBe(90);
    });

    it('يجب أن يضيف conferenceData للمقابلات الافتراضية', () => {
      const event = googleCalendarService._buildGoogleEvent({
        title: 'مقابلة فيديو',
        scheduledAt: new Date(),
        duration: 60,
        addMeetLink: true,
      });

      expect(event.conferenceData).toBeDefined();
      expect(event.conferenceData.createRequest.conferenceSolutionKey.type).toBe('hangoutsMeet');
    });
  });
});
