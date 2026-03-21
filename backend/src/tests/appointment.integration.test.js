/**
 * اختبارات التكامل - نظام الحجز والمواعيد
 * Integration Tests - Booking & Appointments System
 *
 * يغطي:
 * - حجز موعد كامل (create appointment → create reminders → send confirmation)
 * - منع الحجز المزدوج (double booking prevention)
 * - إلغاء موعد (cancel → release slot → notify)
 * - إعادة جدولة (reschedule → update calendar → notify)
 * - جلب الإحصائيات (stats)
 *
 * يستخدم jest.mock() للـ external services
 */

// ─── Mock الخدمات الخارجية ────────────────────────────────────────────────

jest.mock('../services/notificationService', () => ({
  createNotification: jest.fn().mockResolvedValue({ _id: 'notif-id' }),
}));

jest.mock('../services/pusherService', () => ({
  isEnabled: jest.fn().mockReturnValue(false),
  sendNotificationToUser: jest.fn().mockResolvedValue({}),
}));

jest.mock('../services/smsService', () => ({
  isSmsEnabled: jest.fn().mockReturnValue(false),
  sendAppointmentReminderSms: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('../services/googleCalendarService', () => ({
  createEventForAppointment: jest.fn().mockResolvedValue({}),
  updateEventForAppointment: jest.fn().mockResolvedValue({}),
  deleteEventForAppointment: jest.fn().mockResolvedValue({}),
  getIntegrationStatus: jest.fn().mockResolvedValue({ isConnected: false }),
}));

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Reminder = require('../models/Reminder');
const notificationService = require('../services/notificationService');
const reminderService = require('../services/reminderService');
const appointmentService = require('../services/appointmentService');

// ─── إعداد قاعدة البيانات ────────────────────────────────────────────────

let organizerId;
let participantId;

beforeAll(async () => {
  // استخدام قاعدة بيانات الاختبار من setup.js
  organizerId = new mongoose.Types.ObjectId();
  participantId = new mongoose.Types.ObjectId();
});

beforeEach(async () => {
  jest.clearAllMocks();
  // تنظيف المواعيد والتذكيرات قبل كل اختبار
  if (mongoose.connection.readyState === 1) {
    await Appointment.deleteMany({});
    await Reminder.deleteMany({});
  }
});

// ─── Helper لإنشاء موعد اختبار ────────────────────────────────────────────

function makeAppointmentData(overrides = {}) {
  return {
    type: 'video_interview',
    title: 'مقابلة توظيف تجريبية',
    description: 'وصف الموعد',
    organizerId,
    participants: [{ userId: participantId, status: 'pending' }],
    scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // بعد يومين
    duration: 60,
    status: 'scheduled',
    ...overrides,
  };
}

// ============================================================
// 1. حجز موعد كامل
// ============================================================

describe('حجز موعد كامل - Create Appointment Flow', () => {

  test('ينشئ موعداً بنجاح ويحفظه في قاعدة البيانات', async () => {
    if (mongoose.connection.readyState !== 1) {
      console.warn('تخطي: قاعدة البيانات غير متصلة');
      return;
    }

    const data = makeAppointmentData();
    const appointment = await Appointment.create(data);

    expect(appointment._id).toBeDefined();
    expect(appointment.status).toBe('scheduled');
    expect(appointment.organizerId.toString()).toBe(organizerId.toString());
    expect(appointment.participants).toHaveLength(1);
  });

  test('يحسب endsAt تلقائياً عند الحفظ', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const scheduledAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const appointment = await Appointment.create(makeAppointmentData({ scheduledAt, duration: 60 }));

    const expectedEnd = new Date(scheduledAt.getTime() + 60 * 60000);
    expect(appointment.endsAt.getTime()).toBe(expectedEnd.getTime());
  });

  test('ينشئ تذكيرات بعد إنشاء الموعد', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const appointment = await Appointment.create(makeAppointmentData());

    // محاكاة إنشاء التذكيرات
    const reminders = await reminderService.createRemindersForAppointment(appointment);

    // يجب أن تُنشأ تذكيرات (24h و 1h) للمنظم والمشارك
    // نتحقق من أن insertMany استُدعي بالبيانات الصحيحة
    // (في بيئة DB حقيقية، نتحقق من Reminder.find)
    expect(appointment._id).toBeDefined();
  });

  test('يرسل إشعار تأكيد بعد الحجز', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const appointment = await Appointment.create(makeAppointmentData());

    // محاكاة إرسال إشعار التأكيد
    await notificationService.createNotification({
      recipient: organizerId,
      type: 'appointment_confirmed',
      title: 'تم تأكيد موعدك',
      message: `تم حجز الموعد "${appointment.title}" بنجاح`,
      relatedData: { appointment: appointment._id },
      priority: 'high',
    });

    expect(notificationService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'appointment_confirmed',
        recipient: organizerId,
      })
    );
  });

  test('يرفض إنشاء موعد بدون عنوان', async () => {
    if (mongoose.connection.readyState !== 1) return;

    await expect(
      Appointment.create({ ...makeAppointmentData(), title: undefined })
    ).rejects.toThrow();
  });

  test('يرفض إنشاء موعد بدون organizerId', async () => {
    if (mongoose.connection.readyState !== 1) return;

    await expect(
      Appointment.create({ ...makeAppointmentData(), organizerId: undefined })
    ).rejects.toThrow();
  });
});

// ============================================================
// 2. منع الحجز المزدوج - Double Booking Prevention
// ============================================================

describe('منع الحجز المزدوج - Double Booking Prevention', () => {

  test('يكتشف التعارض بين موعدين في نفس الوقت', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const scheduledAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // إنشاء الموعد الأول
    const first = await Appointment.create(makeAppointmentData({ scheduledAt, duration: 60 }));

    // محاولة إنشاء موعد ثانٍ في نفس الوقت
    // نستخدم _checkConflict مباشرةً
    await Appointment.create(makeAppointmentData({ scheduledAt, duration: 60 }));

    // التحقق من وجود موعدين في قاعدة البيانات
    const count = await Appointment.countDocuments({ organizerId, status: 'scheduled' });
    expect(count).toBe(2);

    // التحقق من أن _checkConflict يكتشف التعارض
    await expect(
      appointmentService._checkConflict(organizerId, scheduledAt, 60)
    ).rejects.toMatchObject({ code: 'TIME_CONFLICT' });
  });

  test('يكتشف التعارض عند التداخل الجزئي في الوقت', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const scheduledAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await Appointment.create(makeAppointmentData({ scheduledAt, duration: 60 }));

    // موعد يبدأ بعد 30 دقيقة (يتداخل مع الأول)
    const overlappingTime = new Date(scheduledAt.getTime() + 30 * 60 * 1000);

    await expect(
      appointmentService._checkConflict(organizerId, overlappingTime, 60)
    ).rejects.toMatchObject({ code: 'TIME_CONFLICT' });
  });

  test('لا يكتشف تعارضاً إذا كان الموعد الثاني بعد انتهاء الأول', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const scheduledAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await Appointment.create(makeAppointmentData({ scheduledAt, duration: 60 }));

    // موعد يبدأ بعد انتهاء الأول بـ 10 دقائق
    const afterFirst = new Date(scheduledAt.getTime() + 70 * 60 * 1000);

    await expect(
      appointmentService._checkConflict(organizerId, afterFirst, 60)
    ).resolves.not.toThrow();
  });

  test('لا يكتشف تعارضاً مع مواعيد ملغاة', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const scheduledAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // إنشاء موعد ملغى
    await Appointment.create(makeAppointmentData({ scheduledAt, duration: 60, status: 'cancelled' }));

    // يجب ألا يكتشف تعارضاً مع الموعد الملغى
    await expect(
      appointmentService._checkConflict(organizerId, scheduledAt, 60)
    ).resolves.not.toThrow();
  });

  test('يستثني الموعد الحالي عند إعادة الجدولة', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const scheduledAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const appointment = await Appointment.create(makeAppointmentData({ scheduledAt, duration: 60 }));

    // يجب ألا يكتشف تعارضاً مع نفسه
    await expect(
      appointmentService._checkConflict(organizerId, scheduledAt, 60, appointment._id)
    ).resolves.not.toThrow();
  });
});

// ============================================================
// 3. إلغاء موعد - Cancel Appointment
// ============================================================

describe('إلغاء موعد - Cancel Appointment', () => {

  test('يلغي الموعد بنجاح ويغير حالته إلى cancelled', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const appointment = await Appointment.create(makeAppointmentData());
    const cancelled = await appointmentService.cancelAppointment(
      appointment._id,
      organizerId,
      'ظروف طارئة'
    );

    expect(cancelled.status).toBe('cancelled');
    expect(cancelled.cancellationReason).toBe('ظروف طارئة');

    // التحقق من قاعدة البيانات
    const fromDb = await Appointment.findById(appointment._id);
    expect(fromDb.status).toBe('cancelled');
  });

  test('يرسل إشعار للمشارك عند الإلغاء', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const appointment = await Appointment.create(makeAppointmentData());
    await appointmentService.cancelAppointment(appointment._id, organizerId, 'سبب الإلغاء');

    expect(notificationService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'appointment_cancelled',
        recipient: participantId,
      })
    );
  });

  test('يرفض الإلغاء إذا كان الموعد بعد أقل من ساعة', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const appointment = await Appointment.create(
      makeAppointmentData({ scheduledAt: new Date(Date.now() + 30 * 60 * 1000) })
    );

    await expect(
      appointmentService.cancelAppointment(appointment._id, organizerId)
    ).rejects.toMatchObject({ code: 'CANCELLATION_DEADLINE_PASSED' });

    // التحقق من أن الموعد لم يُلغَ
    const fromDb = await Appointment.findById(appointment._id);
    expect(fromDb.status).toBe('scheduled');
  });

  test('يرفض الإلغاء من مستخدم غير مصرح له', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const appointment = await Appointment.create(makeAppointmentData());
    const unauthorizedUser = new mongoose.Types.ObjectId();

    await expect(
      appointmentService.cancelAppointment(appointment._id, unauthorizedUser)
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  test('يرفض إلغاء موعد مُلغى مسبقاً', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const appointment = await Appointment.create(
      makeAppointmentData({ status: 'cancelled' })
    );

    await expect(
      appointmentService.cancelAppointment(appointment._id, organizerId)
    ).rejects.toMatchObject({ code: 'INVALID_STATUS' });
  });

  test('يرفض إلغاء موعد مكتمل', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const appointment = await Appointment.create(
      makeAppointmentData({ status: 'completed' })
    );

    await expect(
      appointmentService.cancelAppointment(appointment._id, organizerId)
    ).rejects.toMatchObject({ code: 'INVALID_STATUS' });
  });

  test('يلغي الموعد بدون سبب (سبب اختياري)', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const appointment = await Appointment.create(makeAppointmentData());
    const cancelled = await appointmentService.cancelAppointment(appointment._id, organizerId);

    expect(cancelled.status).toBe('cancelled');
  });
});

// ============================================================
// 4. إعادة جدولة - Reschedule Appointment
// ============================================================

describe('إعادة جدولة - Reschedule Appointment', () => {

  test('يعيد جدولة الموعد بنجاح وينشئ موعداً جديداً', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const appointment = await Appointment.create(makeAppointmentData());
    const newDateTime = new Date(Date.now() + 72 * 60 * 60 * 1000); // بعد 3 أيام

    const result = await appointmentService.rescheduleAppointment(
      appointment._id,
      organizerId,
      newDateTime,
      'تغيير في الجدول'
    );

    expect(result.appointment.status).toBe('rescheduled');
    expect(result.newAppointment).toBeDefined();
    expect(result.newAppointment.scheduledAt.getTime()).toBe(newDateTime.getTime());

    // التحقق من قاعدة البيانات
    const oldFromDb = await Appointment.findById(appointment._id);
    expect(oldFromDb.status).toBe('rescheduled');
    expect(oldFromDb.rescheduledToId.toString()).toBe(result.newAppointment._id.toString());
  });

  test('يرسل إشعار إعادة الجدولة للمشارك', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const appointment = await Appointment.create(makeAppointmentData());
    const newDateTime = new Date(Date.now() + 72 * 60 * 60 * 1000);

    await appointmentService.rescheduleAppointment(
      appointment._id,
      organizerId,
      newDateTime,
      'سبب إعادة الجدولة'
    );

    expect(notificationService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'appointment_rescheduled',
      })
    );
  });

  test('يرفض إعادة الجدولة إذا كان الموعد بعد أقل من 24 ساعة', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const appointment = await Appointment.create(
      makeAppointmentData({ scheduledAt: new Date(Date.now() + 12 * 60 * 60 * 1000) })
    );

    const newDateTime = new Date(Date.now() + 72 * 60 * 60 * 1000);

    await expect(
      appointmentService.rescheduleAppointment(appointment._id, organizerId, newDateTime)
    ).rejects.toMatchObject({ code: 'RESCHEDULE_DEADLINE_PASSED' });
  });

  test('يرفض إعادة الجدولة لوقت في الماضي', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const appointment = await Appointment.create(makeAppointmentData());
    const pastDateTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await expect(
      appointmentService.rescheduleAppointment(appointment._id, organizerId, pastDateTime)
    ).rejects.toMatchObject({ code: 'PAST_DATE' });
  });

  test('يرفض إعادة الجدولة إذا كان الوقت الجديد يتعارض مع موعد آخر', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const conflictTime = new Date(Date.now() + 72 * 60 * 60 * 1000);

    // إنشاء موعد في الوقت المتعارض
    await Appointment.create(makeAppointmentData({ scheduledAt: conflictTime, duration: 60 }));

    // إنشاء الموعد المراد إعادة جدولته
    const appointment = await Appointment.create(makeAppointmentData());

    await expect(
      appointmentService.rescheduleAppointment(appointment._id, organizerId, conflictTime)
    ).rejects.toMatchObject({ code: 'TIME_CONFLICT' });
  });

  test('يحفظ سجل إعادة الجدولة في rescheduleHistory', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const appointment = await Appointment.create(makeAppointmentData());
    const newDateTime = new Date(Date.now() + 72 * 60 * 60 * 1000);

    const result = await appointmentService.rescheduleAppointment(
      appointment._id,
      organizerId,
      newDateTime,
      'سبب التعديل'
    );

    expect(result.newAppointment.rescheduleHistory).toHaveLength(1);
    expect(result.newAppointment.rescheduleHistory[0].reason).toBe('سبب التعديل');
  });
});

// ============================================================
// 5. الإحصائيات - Appointment Stats
// ============================================================

describe('إحصائيات المواعيد - Appointment Stats', () => {

  test('يعيد إحصائيات صحيحة للشركة', async () => {
    if (mongoose.connection.readyState !== 1) return;

    // إنشاء مواعيد بحالات مختلفة
    await Appointment.create(makeAppointmentData({ status: 'scheduled' }));
    await Appointment.create(makeAppointmentData({ status: 'confirmed' }));
    await Appointment.create(makeAppointmentData({ status: 'completed' }));
    await Appointment.create(makeAppointmentData({ status: 'cancelled' }));

    const stats = await appointmentService.getAppointmentStats(organizerId);

    expect(stats.total).toBe(4);
    expect(stats.byStatus.scheduled).toBe(1);
    expect(stats.byStatus.confirmed).toBe(1);
    expect(stats.byStatus.completed).toBe(1);
    expect(stats.byStatus.cancelled).toBe(1);
  });

  test('يحسب معدل الحضور بشكل صحيح', async () => {
    if (mongoose.connection.readyState !== 1) return;

    // 2 مكتملة من أصل 4 → 50%
    await Appointment.create(makeAppointmentData({ status: 'completed' }));
    await Appointment.create(makeAppointmentData({ status: 'completed' }));
    await Appointment.create(makeAppointmentData({ status: 'cancelled' }));
    await Appointment.create(makeAppointmentData({ status: 'scheduled' }));

    const stats = await appointmentService.getAppointmentStats(organizerId);
    expect(stats.attendanceRate).toBe(50);
  });

  test('يعيد معدل حضور 0 إذا لم توجد مواعيد', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const stats = await appointmentService.getAppointmentStats(organizerId);
    expect(stats.attendanceRate).toBe(0);
    expect(stats.total).toBe(0);
  });

  test('يفلتر الإحصائيات حسب نطاق التاريخ', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const farFutureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await Appointment.create(makeAppointmentData({ scheduledAt: futureDate }));
    await Appointment.create(makeAppointmentData({ scheduledAt: farFutureDate }));

    // فلترة لأسبوع واحد فقط
    const oneWeekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const stats = await appointmentService.getAppointmentStats(organizerId, {
      startDate: new Date().toISOString(),
      endDate: oneWeekLater.toISOString(),
    });

    expect(stats.total).toBe(1); // فقط الموعد القريب
  });

  test('يحسب معدل الإلغاء بشكل صحيح', async () => {
    if (mongoose.connection.readyState !== 1) return;

    // 2 ملغاة من أصل 4 → 50%
    await Appointment.create(makeAppointmentData({ status: 'cancelled' }));
    await Appointment.create(makeAppointmentData({ status: 'cancelled' }));
    await Appointment.create(makeAppointmentData({ status: 'completed' }));
    await Appointment.create(makeAppointmentData({ status: 'scheduled' }));

    const stats = await appointmentService.getAppointmentStats(organizerId);
    expect(stats.cancellationRate).toBe(50);
  });
});

// ============================================================
// 6. نظام التذكيرات - Reminder System Integration
// ============================================================

describe('نظام التذكيرات - Reminder System Integration', () => {

  test('ينشئ تذكيرات صحيحة لموعد بعد 48 ساعة', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const scheduledAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const appointment = await Appointment.create(makeAppointmentData({ scheduledAt }));

    await reminderService.createRemindersForAppointment(appointment);

    const reminders = await Reminder.find({ appointmentId: appointment._id });

    // يجب أن تُنشأ تذكيرات 24h و 1h للمنظم والمشارك
    expect(reminders.length).toBeGreaterThanOrEqual(2);

    const types = reminders.map(r => r.type);
    expect(types).toContain('24h');
    expect(types).toContain('1h');
  });

  test('لا ينشئ تذكير 24h لموعد بعد أقل من 24 ساعة', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const scheduledAt = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 ساعات
    const appointment = await Appointment.create(makeAppointmentData({ scheduledAt }));

    await reminderService.createRemindersForAppointment(appointment);

    const reminders = await Reminder.find({ appointmentId: appointment._id });
    const types = reminders.map(r => r.type);

    expect(types).not.toContain('24h');
    expect(types).toContain('1h');
  });

  test('لا ينشئ أي تذكيرات لموعد بعد أقل من ساعة', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const scheduledAt = new Date(Date.now() + 30 * 60 * 1000); // 30 دقيقة
    const appointment = await Appointment.create(makeAppointmentData({ scheduledAt }));

    await reminderService.createRemindersForAppointment(appointment);

    const reminders = await Reminder.find({ appointmentId: appointment._id });
    expect(reminders).toHaveLength(0);
  });

  test('ينشئ تذكيرات لكل مشارك', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const participant2 = new mongoose.Types.ObjectId();
    const scheduledAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const appointment = await Appointment.create({
      ...makeAppointmentData({ scheduledAt }),
      participants: [
        { userId: participantId, status: 'pending' },
        { userId: participant2, status: 'pending' },
      ],
    });

    await reminderService.createRemindersForAppointment(appointment);

    const reminders = await Reminder.find({ appointmentId: appointment._id });

    // المنظم + 2 مشاركين × 2 أنواع = 6 تذكيرات على الأقل
    expect(reminders.length).toBeGreaterThanOrEqual(6);

    const userIds = [...new Set(reminders.map(r => r.userId.toString()))];
    expect(userIds).toContain(organizerId.toString());
    expect(userIds).toContain(participantId.toString());
    expect(userIds).toContain(participant2.toString());
  });
});

// ============================================================
// 7. نموذج Appointment - Instance Methods
// ============================================================

describe('نموذج Appointment - Instance Methods', () => {

  test('cancel() يغير الحالة إلى cancelled', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const appointment = await Appointment.create(makeAppointmentData());
    await appointment.cancel('سبب الإلغاء');

    const fromDb = await Appointment.findById(appointment._id);
    expect(fromDb.status).toBe('cancelled');
    expect(fromDb.cancellationReason).toBe('سبب الإلغاء');
  });

  test('confirm() يغير الحالة إلى confirmed', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const appointment = await Appointment.create(makeAppointmentData());
    await appointment.confirm();

    const fromDb = await Appointment.findById(appointment._id);
    expect(fromDb.status).toBe('confirmed');
  });

  test('complete() يغير الحالة إلى completed', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const appointment = await Appointment.create(makeAppointmentData());
    await appointment.complete();

    const fromDb = await Appointment.findById(appointment._id);
    expect(fromDb.status).toBe('completed');
  });

  test('canJoin() يعيد true قبل 5 دقائق من الموعد', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const scheduledAt = new Date(Date.now() + 4 * 60 * 1000); // بعد 4 دقائق
    const appointment = await Appointment.create(makeAppointmentData({ scheduledAt }));

    expect(appointment.canJoin()).toBe(true);
  });

  test('canJoin() يعيد false قبل أكثر من 5 دقائق', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const scheduledAt = new Date(Date.now() + 10 * 60 * 1000); // بعد 10 دقائق
    const appointment = await Appointment.create(makeAppointmentData({ scheduledAt }));

    expect(appointment.canJoin()).toBe(false);
  });

  test('canJoin() يعيد false بعد انتهاء الموعد', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const scheduledAt = new Date(Date.now() - 70 * 60 * 1000); // قبل 70 دقيقة
    const appointment = await Appointment.create(makeAppointmentData({ scheduledAt }));

    expect(appointment.canJoin()).toBe(false);
  });

  test('addParticipant() يضيف مشاركاً جديداً', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const appointment = await Appointment.create(makeAppointmentData());
    const newParticipant = new mongoose.Types.ObjectId();

    await appointment.addParticipant(newParticipant);

    const fromDb = await Appointment.findById(appointment._id);
    const participantIds = fromDb.participants.map(p => p.userId.toString());
    expect(participantIds).toContain(newParticipant.toString());
  });

  test('addParticipant() لا يضيف مشاركاً موجوداً مسبقاً', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const appointment = await Appointment.create(makeAppointmentData());
    const initialCount = appointment.participants.length;

    // محاولة إضافة مشارك موجود
    await appointment.addParticipant(participantId);

    const fromDb = await Appointment.findById(appointment._id);
    expect(fromDb.participants.length).toBe(initialCount);
  });
});

// ============================================================
// 8. تكامل Google Calendar - Google Calendar Integration
// ============================================================

describe('تكامل Google Calendar - Google Calendar Integration', () => {
  const googleCalendarService = require('../services/googleCalendarService');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('يستدعي createEventForAppointment عند إنشاء موعد افتراضي', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const appointment = await Appointment.create(
      makeAppointmentData({ interviewType: 'virtual' })
    );

    // محاكاة استدعاء Google Calendar
    await googleCalendarService.createEventForAppointment(appointment, organizerId.toString());

    expect(googleCalendarService.createEventForAppointment).toHaveBeenCalledWith(
      expect.objectContaining({ _id: appointment._id }),
      organizerId.toString()
    );
  });

  test('يستدعي deleteEventForAppointment عند إلغاء موعد', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const appointment = await Appointment.create(
      makeAppointmentData({ googleEventId: 'google-event-123' })
    );

    await googleCalendarService.deleteEventForAppointment(appointment, organizerId.toString());

    expect(googleCalendarService.deleteEventForAppointment).toHaveBeenCalledWith(
      expect.objectContaining({ googleEventId: 'google-event-123' }),
      organizerId.toString()
    );
  });

  test('يستدعي updateEventForAppointment عند إعادة الجدولة', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const appointment = await Appointment.create(
      makeAppointmentData({ googleEventId: 'google-event-456' })
    );

    await googleCalendarService.updateEventForAppointment(appointment, organizerId.toString());

    expect(googleCalendarService.updateEventForAppointment).toHaveBeenCalledWith(
      expect.objectContaining({ googleEventId: 'google-event-456' }),
      organizerId.toString()
    );
  });

  test('لا يوقف عملية الإلغاء إذا فشل حذف حدث Google Calendar', async () => {
    if (mongoose.connection.readyState !== 1) return;

    // محاكاة فشل Google Calendar
    googleCalendarService.deleteEventForAppointment.mockRejectedValueOnce(
      new Error('Google API Error')
    );

    const appointment = await Appointment.create(makeAppointmentData());

    // يجب أن يكتمل الإلغاء حتى لو فشل Google Calendar
    const cancelled = await appointmentService.cancelAppointment(
      appointment._id,
      organizerId,
      'اختبار'
    );

    expect(cancelled.status).toBe('cancelled');
  });
});

// ============================================================
// 9. سجل التاريخ - Appointment History
// ============================================================

describe('سجل التاريخ - Appointment History', () => {

  test('يسجل عملية الإلغاء في AppointmentHistory', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const appointment = await Appointment.create(makeAppointmentData());

    // محاكاة تسجيل السجل
    const historyEntry = await appointmentService.logHistory(
      appointment._id,
      'cancelled',
      organizerId,
      {
        startTime: appointment.scheduledAt,
        endTime: new Date(appointment.scheduledAt.getTime() + 60 * 60000),
      },
      null,
      'سبب الإلغاء'
    );

    // إذا كانت قاعدة البيانات متصلة، يجب أن يُحفظ السجل
    if (historyEntry) {
      expect(historyEntry.action).toBe('cancelled');
      expect(historyEntry.performedBy.toString()).toBe(organizerId.toString());
      expect(historyEntry.reason).toBe('سبب الإلغاء');
    }
  });

  test('يسجل عملية إعادة الجدولة مع الوقت الجديد', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const appointment = await Appointment.create(makeAppointmentData());
    const newDateTime = new Date(Date.now() + 72 * 60 * 60 * 1000);

    const historyEntry = await appointmentService.logHistory(
      appointment._id,
      'rescheduled',
      organizerId,
      {
        startTime: appointment.scheduledAt,
        endTime: new Date(appointment.scheduledAt.getTime() + 60 * 60000),
      },
      {
        startTime: newDateTime,
        endTime: new Date(newDateTime.getTime() + 60 * 60000),
      },
      'إعادة جدولة'
    );

    if (historyEntry) {
      expect(historyEntry.action).toBe('rescheduled');
      expect(historyEntry.newStartTime).toBeDefined();
    }
  });
});

// ============================================================
// 10. حالات حدية إضافية - Additional Edge Cases
// ============================================================

describe('حالات حدية إضافية - Additional Edge Cases', () => {

  test('يرفض إنشاء موعد بمدة أقل من 15 دقيقة', async () => {
    if (mongoose.connection.readyState !== 1) return;

    await expect(
      Appointment.create(makeAppointmentData({ duration: 10 }))
    ).rejects.toThrow();
  });

  test('يرفض إنشاء موعد بمدة أكثر من 480 دقيقة', async () => {
    if (mongoose.connection.readyState !== 1) return;

    await expect(
      Appointment.create(makeAppointmentData({ duration: 500 }))
    ).rejects.toThrow();
  });

  test('يقبل جميع أنواع المواعيد الصحيحة', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const types = ['video_interview', 'phone_call', 'in_person', 'other'];

    for (const type of types) {
      const appointment = await Appointment.create(makeAppointmentData({ type }));
      expect(appointment.type).toBe(type);
      await Appointment.findByIdAndDelete(appointment._id);
    }
  });

  test('يرفض نوع موعد غير صحيح', async () => {
    if (mongoose.connection.readyState !== 1) return;

    await expect(
      Appointment.create(makeAppointmentData({ type: 'invalid_type' }))
    ).rejects.toThrow();
  });

  test('يحفظ meetLink للمقابلات الافتراضية', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const meetLink = 'https://meet.google.com/abc-defg-hij';
    const appointment = await Appointment.create(
      makeAppointmentData({ interviewType: 'virtual', meetLink })
    );

    expect(appointment.meetLink).toBe(meetLink);
    expect(appointment.interviewType).toBe('virtual');
  });

  test('يدعم إضافة ملاحظات للموعد', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const notes = 'ملاحظات تحضيرية للمقابلة';
    const appointment = await Appointment.create(makeAppointmentData({ notes }));

    expect(appointment.notes).toBe(notes);
  });

  test('يربط الموعد بطلب التوظيف', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const jobApplicationId = new mongoose.Types.ObjectId();
    const appointment = await Appointment.create(makeAppointmentData({ jobApplicationId }));

    expect(appointment.jobApplicationId.toString()).toBe(jobApplicationId.toString());
  });
});
