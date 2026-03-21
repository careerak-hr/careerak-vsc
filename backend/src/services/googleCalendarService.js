const axios = require('axios');
const crypto = require('crypto');
const CalendarIntegration = require('../models/CalendarIntegration');

/**
 * Google Calendar Service
 * يوفر تكامل مع Google Calendar API عبر OAuth 2.0
 * مزامنة ثنائية الاتجاه: التطبيق ↔ Google Calendar
 *
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
class GoogleCalendarService {
  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/integrations/google/callback';
    this.authBaseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    this.tokenUrl = 'https://oauth2.googleapis.com/token';
    this.calendarApiBase = 'https://www.googleapis.com/calendar/v3';
    this.revokeUrl = 'https://oauth2.googleapis.com/revoke';
  }

  /**
   * توليد رابط OAuth 2.0 للمصادقة
   * @param {string} userId - معرف المستخدم
   * @returns {Object} رابط OAuth وstate
   */
  getAuthorizationUrl(userId) {
    const state = crypto.randomBytes(16).toString('hex') + '_' + userId.toString();

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: state,
    });

    return {
      url: `${this.authBaseUrl}?${params.toString()}`,
      state,
    };
  }

  /**
   * معالجة callback من Google - تبديل code بـ tokens وحفظها
   * @param {string} code - Authorization code
   * @param {string} state - State parameter للتحقق
   * @returns {Promise<Object>} نتيجة الربط
   */
  async handleCallback(code, state) {
    // استخراج userId من state
    const parts = state.split('_');
    if (parts.length < 2) {
      throw new Error('Invalid state parameter');
    }
    const userId = parts[parts.length - 1];

    // تبديل code بـ tokens
    const tokenData = await this._exchangeCodeForTokens(code);

    // الحصول على معلومات المستخدم من Google
    const userInfo = await this._getGoogleUserInfo(tokenData.access_token);

    // حفظ أو تحديث التكامل في قاعدة البيانات
    let integration = await CalendarIntegration.findOne({ userId });
    if (!integration) {
      integration = new CalendarIntegration({ userId });
    }

    integration.setAccessToken(tokenData.access_token);
    if (tokenData.refresh_token) {
      integration.setRefreshToken(tokenData.refresh_token);
    }
    integration.tokenExpiry = new Date(Date.now() + tokenData.expires_in * 1000);
    integration.googleUserId = userInfo.id;
    integration.googleEmail = userInfo.email;
    integration.isActive = true;

    await integration.save();

    return {
      success: true,
      message: 'تم ربط Google Calendar بنجاح',
      googleEmail: userInfo.email,
    };
  }

  /**
   * تجديد Access Token منتهي الصلاحية
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<string>} Access Token الجديد
   */
  async refreshAccessToken(userId) {
    const integration = await CalendarIntegration.findOne({ userId, isActive: true });
    if (!integration) {
      throw new Error('لا يوجد ربط مع Google Calendar');
    }

    const refreshToken = integration.getRefreshToken();
    if (!refreshToken) {
      throw new Error('لا يوجد Refresh Token - يرجى إعادة الربط');
    }

    const response = await axios.post(this.tokenUrl, null, {
      params: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      },
    });

    const newAccessToken = response.data.access_token;
    const expiresIn = response.data.expires_in || 3600;

    integration.setAccessToken(newAccessToken);
    integration.tokenExpiry = new Date(Date.now() + expiresIn * 1000);
    await integration.save();

    return newAccessToken;
  }

  /**
   * الحصول على Access Token صالح (يجدد تلقائياً إذا انتهت صلاحيته)
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<string>} Access Token صالح
   */
  async getValidToken(userId) {
    const integration = await CalendarIntegration.findOne({ userId, isActive: true });
    if (!integration) {
      throw new Error('لا يوجد ربط مع Google Calendar');
    }

    if (integration.isTokenExpired()) {
      return await this.refreshAccessToken(userId);
    }

    return integration.getAccessToken();
  }

  /**
   * إنشاء حدث في Google Calendar عند الحجز
   * @param {string} userId - معرف المستخدم
   * @param {Object} appointmentData - بيانات الموعد
   * @returns {Promise<Object>} الحدث المنشأ
   */
  async createEvent(userId, appointmentData) {
    const accessToken = await this.getValidToken(userId);
    const integration = await CalendarIntegration.findOne({ userId, isActive: true });

    const event = this._buildGoogleEvent(appointmentData);

    const response = await axios.post(
      `${this.calendarApiBase}/calendars/${integration.calendarId}/events`,
      event,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          conferenceDataVersion: appointmentData.addMeetLink ? 1 : 0,
        },
      }
    );

    const meetLink = response.data.conferenceData?.entryPoints?.[0]?.uri || null;

    // تحديث الموعد في قاعدة البيانات بمعرف الحدث في Google
    if (appointmentData._id) {
      try {
        const Appointment = require('../models/Appointment');
        await Appointment.findByIdAndUpdate(appointmentData._id, {
          googleEventId: response.data.id,
          googleEventLink: response.data.htmlLink,
          ...(meetLink && {
            googleMeetLink: meetLink,
            meetingLink: meetLink,
            meetLink: meetLink,
          }),
        });
      } catch (dbErr) {
        console.warn('Could not update appointment with Google event ID:', dbErr.message);
      }
    }

    return {
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
      meetLink,
    };
  }

  /**
   * تحديث حدث في Google Calendar عند التعديل
   * @param {string} userId - معرف المستخدم
   * @param {string} eventId - معرف الحدث في Google
   * @param {Object} appointmentData - البيانات المحدثة
   * @returns {Promise<Object>} الحدث المحدث
   */
  async updateEvent(userId, eventId, appointmentData) {
    const accessToken = await this.getValidToken(userId);
    const integration = await CalendarIntegration.findOne({ userId, isActive: true });

    const event = this._buildGoogleEvent(appointmentData);

    const response = await axios.put(
      `${this.calendarApiBase}/calendars/${integration.calendarId}/events/${eventId}`,
      event,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
    };
  }

  /**
   * حذف حدث من Google Calendar عند الإلغاء
   * @param {string} userId - معرف المستخدم
   * @param {string} eventId - معرف الحدث في Google
   * @returns {Promise<Object>} نتيجة الحذف
   */
  async deleteEvent(userId, eventId) {
    const accessToken = await this.getValidToken(userId);
    const integration = await CalendarIntegration.findOne({ userId, isActive: true });

    await axios.delete(
      `${this.calendarApiBase}/calendars/${integration.calendarId}/events/${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return {
      success: true,
      message: 'تم حذف الحدث من Google Calendar',
    };
  }

  /**
   * مزامنة ثنائية الاتجاه مع Google Calendar
   * - من التطبيق إلى Google: إنشاء/تحديث أحداث المواعيد
   * - من Google إلى التطبيق: تحديث المواعيد بناءً على تغييرات Google
   *
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<Object>} نتيجة المزامنة
   */
  async syncAppointments(userId) {
    const accessToken = await this.getValidToken(userId);
    const integration = await CalendarIntegration.findOne({ userId, isActive: true });

    // جلب الأحداث من Google Calendar (آخر 30 يوم وقادمة 90 يوم)
    const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const timeMax = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    const response = await axios.get(
      `${this.calendarApiBase}/calendars/${integration.calendarId}/events`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          timeMin,
          timeMax,
          singleEvents: true,
          orderBy: 'startTime',
          maxResults: 250,
        },
      }
    );

    const googleEvents = response.data.items || [];

    // المزامنة من Google إلى التطبيق (ثنائية الاتجاه)
    const syncResult = await this._syncFromGoogleToApp(userId, googleEvents);

    // تحديث وقت آخر مزامنة
    integration.lastSyncAt = new Date();
    await integration.save();

    return {
      success: true,
      message: 'تمت المزامنة بنجاح',
      syncedAt: integration.lastSyncAt,
      googleEventsCount: googleEvents.length,
      updatedInApp: syncResult.updated,
      cancelledInApp: syncResult.cancelled,
    };
  }

  /**
   * مزامنة من Google إلى التطبيق (الاتجاه الثاني)
   * يتحقق من التغييرات في Google Calendar ويحدث المواعيد في التطبيق
   *
   * @param {string} userId - معرف المستخدم
   * @param {Array} googleEvents - الأحداث من Google Calendar
   * @returns {Promise<Object>} إحصائيات المزامنة
   * @private
   */
  async _syncFromGoogleToApp(userId, googleEvents) {
    const Appointment = require('../models/Appointment');
    let updated = 0;
    let cancelled = 0;

    // بناء خريطة من googleEventId إلى بيانات الحدث
    const googleEventMap = new Map();
    for (const event of googleEvents) {
      googleEventMap.set(event.id, event);
    }

    // جلب المواعيد في التطبيق التي لها googleEventId
    const appAppointments = await Appointment.find({
      $or: [
        { organizerId: userId },
        { 'participants.userId': userId },
      ],
      googleEventId: { $ne: null },
      status: { $in: ['scheduled', 'confirmed'] },
    });

    for (const appointment of appAppointments) {
      const googleEvent = googleEventMap.get(appointment.googleEventId);

      if (!googleEvent) {
        // الحدث محذوف من Google → لا نلغي تلقائياً (قد يكون خارج النطاق الزمني)
        continue;
      }

      // التحقق من حالة الحدث في Google
      if (googleEvent.status === 'cancelled') {
        // الحدث ملغى في Google → تحديث في التطبيق
        await Appointment.findByIdAndUpdate(appointment._id, {
          status: 'cancelled',
          cancellationReason: 'تم الإلغاء من Google Calendar',
        });
        cancelled++;
        continue;
      }

      // التحقق من تغيير الوقت في Google
      const googleStartTime = new Date(
        googleEvent.start?.dateTime || googleEvent.start?.date
      );

      const appStartTime = new Date(appointment.scheduledAt);
      const timeDiffMs = Math.abs(googleStartTime - appStartTime);

      // إذا تغير الوقت بأكثر من دقيقة → تحديث في التطبيق
      if (timeDiffMs > 60 * 1000) {
        const googleEndTime = new Date(
          googleEvent.end?.dateTime || googleEvent.end?.date
        );
        const durationMs = googleEndTime - googleStartTime;
        const durationMinutes = Math.round(durationMs / (60 * 1000));

        await Appointment.findByIdAndUpdate(appointment._id, {
          scheduledAt: googleStartTime,
          endsAt: googleEndTime,
          duration: durationMinutes > 0 ? durationMinutes : appointment.duration,
        });
        updated++;
      }
    }

    return { updated, cancelled };
  }

  /**
   * إلغاء ربط Google Calendar وحذف التكامل
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<Object>} نتيجة الإلغاء
   */
  async disconnectCalendar(userId) {
    const integration = await CalendarIntegration.findOne({ userId });
    if (!integration) {
      return { success: true, message: 'لا يوجد ربط لإلغائه' };
    }

    // محاولة إلغاء التوكن في Google
    try {
      const accessToken = integration.getAccessToken();
      if (accessToken) {
        await axios.post(this.revokeUrl, null, {
          params: { token: accessToken },
        });
      }
    } catch (err) {
      // تجاهل أخطاء الإلغاء - نكمل الحذف من قاعدة البيانات
      console.warn('Could not revoke Google token:', err.message);
    }

    await CalendarIntegration.deleteOne({ userId });

    return {
      success: true,
      message: 'تم إلغاء ربط Google Calendar بنجاح',
    };
  }

  /**
   * الحصول على حالة التكامل للمستخدم
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<Object>} حالة التكامل
   */
  async getIntegrationStatus(userId) {
    const integration = await CalendarIntegration.findOne({ userId });
    if (!integration || !integration.isActive) {
      return { isConnected: false };
    }

    return {
      isConnected: true,
      googleEmail: integration.googleEmail,
      calendarId: integration.calendarId,
      lastSyncAt: integration.lastSyncAt,
      tokenExpired: integration.isTokenExpired(),
    };
  }

  /**
   * إنشاء حدث Google Calendar لموعد موجود (يُستدعى من appointmentService)
   * @param {Object} appointment - كائن الموعد من قاعدة البيانات
   * @param {string} organizerUserId - معرف المنظم
   * @returns {Promise<void>}
   */
  async createEventForAppointment(appointment, organizerUserId) {
    try {
      const integration = await CalendarIntegration.findOne({
        userId: organizerUserId,
        isActive: true,
      });
      if (!integration) return;

      // تفعيل Meet للمقابلات الافتراضية (interviewType === 'virtual' أو type === 'video_interview')
      const isVirtual =
        appointment.interviewType === 'virtual' ||
        appointment.type === 'video_interview';

      const result = await this.createEvent(organizerUserId, {
        _id: appointment._id,
        title: appointment.title,
        description: appointment.description || '',
        scheduledAt: appointment.scheduledAt,
        duration: appointment.duration || 60,
        location: appointment.location,
        participants: [],
        addMeetLink: isVirtual,
      });

      // حفظ meetLink في حقل meetLink المخصص إذا كانت مقابلة افتراضية
      if (isVirtual && result.meetLink) {
        const Appointment = require('../models/Appointment');
        await Appointment.findByIdAndUpdate(appointment._id, {
          meetLink: result.meetLink,
        });
      }
    } catch (err) {
      // لا نوقف عملية الحجز إذا فشل إنشاء الحدث في Google
      console.warn('Google Calendar createEvent failed (non-blocking):', err.message);
    }
  }

  /**
   * تحديث حدث Google Calendar لموعد معدّل (يُستدعى من appointmentService)
   * @param {Object} appointment - كائن الموعد المحدث
   * @param {string} organizerUserId - معرف المنظم
   * @returns {Promise<void>}
   */
  async updateEventForAppointment(appointment, organizerUserId) {
    try {
      if (!appointment.googleEventId) return;

      const integration = await CalendarIntegration.findOne({
        userId: organizerUserId,
        isActive: true,
      });
      if (!integration) return;

      await this.updateEvent(organizerUserId, appointment.googleEventId, {
        title: appointment.title,
        description: appointment.description || '',
        scheduledAt: appointment.scheduledAt,
        duration: appointment.duration || 60,
        location: appointment.location,
      });
    } catch (err) {
      console.warn('Google Calendar updateEvent failed (non-blocking):', err.message);
    }
  }

  /**
   * حذف حدث Google Calendar لموعد ملغى (يُستدعى من appointmentService)
   * @param {Object} appointment - كائن الموعد الملغى
   * @param {string} organizerUserId - معرف المنظم
   * @returns {Promise<void>}
   */
  async deleteEventForAppointment(appointment, organizerUserId) {
    try {
      if (!appointment.googleEventId) return;

      const integration = await CalendarIntegration.findOne({
        userId: organizerUserId,
        isActive: true,
      });
      if (!integration) return;

      await this.deleteEvent(organizerUserId, appointment.googleEventId);
    } catch (err) {
      console.warn('Google Calendar deleteEvent failed (non-blocking):', err.message);
    }
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  /**
   * تبديل authorization code بـ tokens
   * @private
   */
  async _exchangeCodeForTokens(code) {
    const response = await axios.post(this.tokenUrl, null, {
      params: {
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
      },
    });
    return response.data;
  }

  /**
   * الحصول على معلومات المستخدم من Google
   * @private
   */
  async _getGoogleUserInfo(accessToken) {
    const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  }

  /**
   * بناء كائن الحدث بصيغة Google Calendar API
   * @private
   */
  _buildGoogleEvent(appointmentData) {
    const {
      title,
      description,
      scheduledAt,
      duration = 60,
      location,
      participants = [],
      addMeetLink = false,
    } = appointmentData;

    const startTime = new Date(scheduledAt);
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    const event = {
      summary: title,
      description: description || '',
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'UTC',
      },
    };

    if (location) {
      event.location = location;
    }

    // إضافة المشاركين
    if (participants.length > 0) {
      event.attendees = participants.map(email => ({ email }));
    }

    // إضافة Google Meet للمقابلات الافتراضية
    if (addMeetLink) {
      event.conferenceData = {
        createRequest: {
          requestId: crypto.randomBytes(8).toString('hex'),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      };
    }

    return event;
  }
}

module.exports = new GoogleCalendarService();
