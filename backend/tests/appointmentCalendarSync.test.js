/**
 * اختبارات تكامل Google Calendar مع نظام المواعيد
 * 
 * المهمة 6.3: تحديث التقويم تلقائياً
 * - تحديث حدث Google Calendar عند التعديل
 * - حذف حدث Google Calendar عند الإلغاء
 * - إعادة إتاحة الفترة الزمنية عند الإلغاء
 * 
 * Validates: Requirements 5.4, 5.5 (User Story 5 - تكامل Google Calendar)
 */

jest.mock('../src/services/googleCalendarService', () => ({
  updateEventForAppointment: jest.fn().mockResolvedValue({ success: true }),
  deleteEventForAppointment: jest.fn().mockResolvedValue({ success: true }),
  createEventForAppointment: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('../src/services/notificationService', () => ({
  createNotification: jest.fn().mockResolvedValue({ _id: 'notif-id' }),
}));

jest.mock('../src/services/pusherService', () => ({
  isEnabled: jest.fn().mockReturnValue(false),
}));

const mongoose = require('mongoose');
const Appointment = require('../src/models/Appointment');
const AppointmentHistory = require('../src/models/AppointmentHistory');
const appointmentService = require('../src/services/appointmentService');
const googleCalendarService = require('../src/services/googleCalendarService');
const notificationService = require('../src/services/notificationService');

// ─── بيانات الاختبار ──────────────────────────────────────────────────────────

const organizerId = new mongoose.Types.ObjectId();
const participantId = new mongoose.Types.ObjectId();

/**
 * إنشاء موعد اختبار
 */
async function createTestAppointment(overrides = {}) {
  const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // بعد 48 ساعة
  return Appointment.create({
    type: 'video_interview',
    title: 'مقابلة اختبار',
    organizerId,
    participants: [{ userId: participantId, status: 'pending' }],
    scheduledAt: futureDate,
    duration: 60,
    status: 'scheduled',
    ...overrides,
  });
}

// ─── اختبارات إعادة الجدولة مع Google Calendar ───────────────────────────────

describe('إعادة الجدولة مع تحديث Google Calendar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('يجب تحديث حدث Google Calendar عند إعادة الجدولة (إن كان googleEventId موجوداً)', async () => {
    const appointment = await createTestAppointment({
      googleEventId: 'google-event-123',
      googleEventLink: 'https://calendar.google.com/event/123',
    });

    const newDateTime = new Date(Date.now() + 72 * 60 * 60 * 1000); // بعد 72 ساعة

    const result = await appointmentService.rescheduleAppointment(
      appointment._id.toString(),
      organizerId.toString(),
      newDateTime,
      'تغيير في الجدول'
    );

    expect(result.newAppointment).toBeDefined();
    expect(result.appointment.status).toBe('rescheduled');

    // التحقق من استدعاء updateEventForAppointment
    expect(googleCalendarService.updateEventForAppointment).toHaveBeenCalledTimes(1);
    const callArgs = googleCalendarService.updateEventForAppointment.mock.calls[0];
    expect(callArgs[0].googleEventId).toBe('google-event-123');
    expect(callArgs[1]).toBe(organizerId.toString());
  });

  test('يجب إنشاء حدث Google Calendar جديد عند إعادة الجدولة (إن لم يكن googleEventId موجوداً)', async () => {
    const appointment = await createTestAppointment(); // بدون googleEventId

    const newDateTime = new Date(Date.now() + 72 * 60 * 60 * 1000);

    await appointmentService.rescheduleAppointment(
      appointment._id.toString(),
      organizerId.toString(),
      newDateTime
    );

    // يجب استدعاء createEventForAppointment بدلاً من updateEventForAppointment
    expect(googleCalendarService.createEventForAppointment).toHaveBeenCalledTimes(1);
    expect(googleCalendarService.updateEventForAppointment).not.toHaveBeenCalled();
  });

  test('يجب نقل googleEventId إلى الموعد الجديد عند إعادة الجدولة', async () => {
    const appointment = await createTestAppointment({
      googleEventId: 'google-event-456',
    });

    const newDateTime = new Date(Date.now() + 72 * 60 * 60 * 1000);

    const { newAppointment } = await appointmentService.rescheduleAppointment(
      appointment._id.toString(),
      organizerId.toString(),
      newDateTime
    );

    // التحقق من نقل googleEventId للموعد الجديد
    const updatedNew = await Appointment.findById(newAppointment._id);
    expect(updatedNew.googleEventId).toBe('google-event-456');
  });

  test('يجب ألا يفشل reschedule إذا فشل تحديث Google Calendar', async () => {
    googleCalendarService.updateEventForAppointment.mockRejectedValueOnce(
      new Error('Google API error')
    );

    const appointment = await createTestAppointment({
      googleEventId: 'google-event-789',
    });

    const newDateTime = new Date(Date.now() + 72 * 60 * 60 * 1000);

    // يجب أن تنجح العملية حتى لو فشل Google Calendar
    await expect(
      appointmentService.rescheduleAppointment(
        appointment._id.toString(),
        organizerId.toString(),
        newDateTime
      )
    ).resolves.toBeDefined();
  });

  test('يجب إرسال إشعارات للطرفين عند إعادة الجدولة', async () => {
    const appointment = await createTestAppointment();
    const newDateTime = new Date(Date.now() + 72 * 60 * 60 * 1000);

    await appointmentService.rescheduleAppointment(
      appointment._id.toString(),
      organizerId.toString(),
      newDateTime,
      'سبب التعديل'
    );

    // يجب إرسال إشعارات (للمشارك + تأكيد للمنظم)
    expect(notificationService.createNotification).toHaveBeenCalled();
    const calls = notificationService.createNotification.mock.calls;
    const types = calls.map(c => c[0].type);
    expect(types).toContain('appointment_rescheduled');
  });
});

// ─── اختبارات الإلغاء مع Google Calendar ─────────────────────────────────────

describe('الإلغاء مع حذف حدث Google Calendar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('يجب حذف حدث Google Calendar عند إلغاء الموعد (إن كان googleEventId موجوداً)', async () => {
    const appointment = await createTestAppointment({
      googleEventId: 'google-event-to-delete',
    });

    await appointmentService.cancelAppointment(
      appointment._id.toString(),
      organizerId.toString(),
      'لا أستطيع الحضور'
    );

    expect(googleCalendarService.deleteEventForAppointment).toHaveBeenCalledTimes(1);
    const callArgs = googleCalendarService.deleteEventForAppointment.mock.calls[0];
    expect(callArgs[0].googleEventId).toBe('google-event-to-delete');
    expect(callArgs[1]).toBe(organizerId.toString());
  });

  test('يجب ألا يستدعي deleteEventForAppointment إذا لم يكن googleEventId موجوداً', async () => {
    const appointment = await createTestAppointment(); // بدون googleEventId

    await appointmentService.cancelAppointment(
      appointment._id.toString(),
      organizerId.toString()
    );

    expect(googleCalendarService.deleteEventForAppointment).not.toHaveBeenCalled();
  });

  test('يجب ألا يفشل cancel إذا فشل حذف حدث Google Calendar', async () => {
    googleCalendarService.deleteEventForAppointment.mockRejectedValueOnce(
      new Error('Google API error')
    );

    const appointment = await createTestAppointment({
      googleEventId: 'google-event-fail',
    });

    // يجب أن تنجح العملية حتى لو فشل Google Calendar
    const result = await appointmentService.cancelAppointment(
      appointment._id.toString(),
      organizerId.toString(),
      'سبب الإلغاء'
    );

    expect(result.status).toBe('cancelled');
  });

  test('يجب تحديث حالة الموعد إلى cancelled في قاعدة البيانات', async () => {
    const appointment = await createTestAppointment({
      googleEventId: 'google-event-cancel-test',
    });

    await appointmentService.cancelAppointment(
      appointment._id.toString(),
      organizerId.toString(),
      'سبب الإلغاء'
    );

    const updated = await Appointment.findById(appointment._id);
    expect(updated.status).toBe('cancelled');
    expect(updated.cancellationReason).toBe('سبب الإلغاء');
  });

  test('يجب إرسال إشعارات للطرف الآخر عند الإلغاء', async () => {
    const appointment = await createTestAppointment();

    await appointmentService.cancelAppointment(
      appointment._id.toString(),
      organizerId.toString(),
      'سبب الإلغاء'
    );

    expect(notificationService.createNotification).toHaveBeenCalled();
    const calls = notificationService.createNotification.mock.calls;
    const types = calls.map(c => c[0].type);
    expect(types).toContain('appointment_cancelled');
  });

  test('يجب رفض الإلغاء إذا كان الموعد أقل من ساعة', async () => {
    const soonDate = new Date(Date.now() + 30 * 60 * 1000); // بعد 30 دقيقة
    const appointment = await createTestAppointment({ scheduledAt: soonDate });

    await expect(
      appointmentService.cancelAppointment(
        appointment._id.toString(),
        organizerId.toString()
      )
    ).rejects.toMatchObject({ code: 'CANCELLATION_DEADLINE_PASSED' });

    // يجب ألا يُستدعى deleteEventForAppointment
    expect(googleCalendarService.deleteEventForAppointment).not.toHaveBeenCalled();
  });
});

// ─── اختبارات إعادة إتاحة الفترة الزمنية ─────────────────────────────────────

describe('إعادة إتاحة الفترة الزمنية عند الإلغاء', () => {
  test('يجب أن تختفي الفترة الملغاة من المواعيد النشطة', async () => {
    const appointment = await createTestAppointment();

    // قبل الإلغاء: الموعد نشط
    const activeBefore = await Appointment.countDocuments({
      organizerId,
      status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
    });
    expect(activeBefore).toBe(1);

    await appointmentService.cancelAppointment(
      appointment._id.toString(),
      organizerId.toString()
    );

    // بعد الإلغاء: لا مواعيد نشطة
    const activeAfter = await Appointment.countDocuments({
      organizerId,
      status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
    });
    expect(activeAfter).toBe(0);
  });
});

// ─── اختبارات تسجيل السجل ─────────────────────────────────────────────────────

describe('تسجيل سجل الإلغاء وإعادة الجدولة', () => {
  test('يجب تسجيل عملية الإلغاء في AppointmentHistory', async () => {
    const appointment = await createTestAppointment();

    await appointmentService.cancelAppointment(
      appointment._id.toString(),
      organizerId.toString(),
      'سبب الاختبار'
    );

    const history = await AppointmentHistory.findOne({
      appointmentId: appointment._id,
      action: 'cancelled',
    });

    expect(history).toBeDefined();
    expect(history.performedBy.toString()).toBe(organizerId.toString());
    expect(history.reason).toBe('سبب الاختبار');
  });

  test('يجب تسجيل عملية إعادة الجدولة في AppointmentHistory', async () => {
    const appointment = await createTestAppointment();
    const newDateTime = new Date(Date.now() + 72 * 60 * 60 * 1000);

    await appointmentService.rescheduleAppointment(
      appointment._id.toString(),
      organizerId.toString(),
      newDateTime,
      'سبب إعادة الجدولة'
    );

    const history = await AppointmentHistory.findOne({
      appointmentId: appointment._id,
      action: 'rescheduled',
    });

    expect(history).toBeDefined();
    expect(history.performedBy.toString()).toBe(organizerId.toString());
    expect(history.reason).toBe('سبب إعادة الجدولة');
  });
});
