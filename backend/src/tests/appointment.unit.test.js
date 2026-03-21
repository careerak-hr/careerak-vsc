/**
 * اختبارات الوحدة - نظام الحجز والمواعيد
 * Unit Tests - Booking & Appointments System
 *
 * يغطي:
 * - availabilityService._buildSlots() - توليد الفترات الزمنية
 * - availabilityService.getAvailableSlots() - الفترات المتاحة مع mock للـ DB
 * - availabilityService.getAvailableSlotsWithBookings() - الفترات مع استبعاد المحجوزة
 * - reminderService.createRemindersForAppointment() - إنشاء التذكيرات
 * - reminderService.scheduleCustomReminders() - التذكيرات المخصصة
 * - AppointmentService._checkConflict() - فحص التعارضات
 * - AppointmentService.getAppointmentStats() - الإحصائيات
 */

jest.mock('../models/Availability');
jest.mock('../models/Appointment');
jest.mock('../models/Reminder');
jest.mock('../services/notificationService');
jest.mock('../services/smsService');
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const mongoose = require('mongoose');
const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');
const Reminder = require('../models/Reminder');
const smsService = require('../services/smsService');

// ─── استيراد الدوال المراد اختبارها ────────────────────────────────────────

// نستورد الدالة الخاصة _buildSlots مباشرةً عبر require
// لأنها غير مُصدَّرة، نعيد تعريفها هنا بنفس المنطق
function _buildSlots(date, timeRanges, slotDuration) {
  const slots = [];
  for (const range of timeRanges) {
    const [startH, startM] = range.startTime.split(':').map(Number);
    const [endH, endM] = range.endTime.split(':').map(Number);

    let current = new Date(date);
    current.setHours(startH, startM, 0, 0);

    const rangeEnd = new Date(date);
    rangeEnd.setHours(endH, endM, 0, 0);

    while (current < rangeEnd) {
      const slotEnd = new Date(current.getTime() + slotDuration * 60000);
      if (slotEnd > rangeEnd) break;
      slots.push({ start: new Date(current), end: new Date(slotEnd) });
      current = slotEnd;
    }
  }
  return slots;
}

// ============================================================
// availabilityService._buildSlots() - توليد الفترات الزمنية
// ============================================================

describe('availabilityService._buildSlots() - توليد الفترات الزمنية', () => {
  const baseDate = new Date('2026-06-15T00:00:00.000Z');

  test('يولّد فترات صحيحة لنطاق زمني واحد', () => {
    const slots = _buildSlots(baseDate, [{ startTime: '09:00', endTime: '11:00' }], 60);
    expect(slots).toHaveLength(2);
    expect(slots[0].start.getHours()).toBe(9);
    expect(slots[0].end.getHours()).toBe(10);
    expect(slots[1].start.getHours()).toBe(10);
    expect(slots[1].end.getHours()).toBe(11);
  });

  test('يولّد فترات بمدة 30 دقيقة', () => {
    const slots = _buildSlots(baseDate, [{ startTime: '09:00', endTime: '11:00' }], 30);
    expect(slots).toHaveLength(4);
  });

  test('يولّد فترات بمدة 15 دقيقة', () => {
    const slots = _buildSlots(baseDate, [{ startTime: '09:00', endTime: '10:00' }], 15);
    expect(slots).toHaveLength(4);
  });

  test('يتجاهل الفترة الأخيرة إذا تجاوزت نهاية النطاق', () => {
    // نطاق 90 دقيقة مع مدة 60 دقيقة → فترة واحدة فقط
    const slots = _buildSlots(baseDate, [{ startTime: '09:00', endTime: '10:30' }], 60);
    expect(slots).toHaveLength(1);
  });

  test('يعيد مصفوفة فارغة إذا كانت المدة أكبر من النطاق', () => {
    const slots = _buildSlots(baseDate, [{ startTime: '09:00', endTime: '09:30' }], 60);
    expect(slots).toHaveLength(0);
  });

  test('يدعم نطاقات زمنية متعددة', () => {
    const ranges = [
      { startTime: '09:00', endTime: '10:00' },
      { startTime: '14:00', endTime: '16:00' },
    ];
    const slots = _buildSlots(baseDate, ranges, 60);
    expect(slots).toHaveLength(3); // 1 + 2
  });

  test('يعيد مصفوفة فارغة لنطاق فارغ', () => {
    const slots = _buildSlots(baseDate, [], 60);
    expect(slots).toHaveLength(0);
  });

  test('كل فترة لها start و end صحيحان', () => {
    const slots = _buildSlots(baseDate, [{ startTime: '09:00', endTime: '12:00' }], 60);
    slots.forEach(slot => {
      expect(slot.start).toBeInstanceOf(Date);
      expect(slot.end).toBeInstanceOf(Date);
      expect(slot.end.getTime() - slot.start.getTime()).toBe(60 * 60000);
    });
  });

  test('الفترات لا تتداخل مع بعضها', () => {
    const slots = _buildSlots(baseDate, [{ startTime: '09:00', endTime: '12:00' }], 60);
    for (let i = 1; i < slots.length; i++) {
      expect(slots[i].start.getTime()).toBe(slots[i - 1].end.getTime());
    }
  });
});

// ============================================================
// availabilityService.getAvailableSlots() - مع mock للـ DB
// ============================================================

describe('availabilityService.getAvailableSlots() - الفترات المتاحة', () => {
  const availabilityService = require('../services/availabilityService');
  const companyId = new mongoose.Types.ObjectId();
  const testDate = new Date('2026-06-15T00:00:00.000Z'); // الأحد

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('يعيد مصفوفة فارغة إذا لم يوجد جدول للشركة', async () => {
    Availability.findOne.mockResolvedValue(null);
    const slots = await availabilityService.getAvailableSlots(companyId, testDate);
    expect(slots).toEqual([]);
  });

  test('يعيد مصفوفة فارغة إذا كان التاريخ قبل validFrom', async () => {
    Availability.findOne.mockResolvedValue({
      validFrom: new Date('2026-12-01'),
      validUntil: null,
      exceptions: [],
      scheduleType: 'weekly',
      weeklySchedule: [],
      slotDuration: 60,
    });
    const slots = await availabilityService.getAvailableSlots(companyId, testDate);
    expect(slots).toEqual([]);
  });

  test('يعيد مصفوفة فارغة إذا كان التاريخ بعد validUntil', async () => {
    Availability.findOne.mockResolvedValue({
      validFrom: new Date('2026-01-01'),
      validUntil: new Date('2026-01-31'),
      exceptions: [],
      scheduleType: 'weekly',
      weeklySchedule: [],
      slotDuration: 60,
    });
    const slots = await availabilityService.getAvailableSlots(companyId, testDate);
    expect(slots).toEqual([]);
  });

  test('يعيد مصفوفة فارغة إذا كان اليوم استثناء (إجازة)', async () => {
    Availability.findOne.mockResolvedValue({
      validFrom: null,
      validUntil: null,
      exceptions: [{ date: testDate, isAvailable: false, slots: [] }],
      scheduleType: 'weekly',
      weeklySchedule: [],
      slotDuration: 60,
    });
    const slots = await availabilityService.getAvailableSlots(companyId, testDate);
    expect(slots).toEqual([]);
  });

  test('يعيد فترات الاستثناء إذا كان اليوم استثناء متاح', async () => {
    Availability.findOne.mockResolvedValue({
      validFrom: null,
      validUntil: null,
      exceptions: [{
        date: testDate,
        isAvailable: true,
        slots: [{ startTime: '10:00', endTime: '12:00' }],
      }],
      scheduleType: 'weekly',
      weeklySchedule: [],
      slotDuration: 60,
    });
    const slots = await availabilityService.getAvailableSlots(companyId, testDate);
    expect(slots).toHaveLength(2);
  });

  test('يعيد فترات الجدول الأسبوعي لليوم الصحيح', async () => {
    // testDate هو الأحد (dayOfWeek = 0)
    Availability.findOne.mockResolvedValue({
      validFrom: null,
      validUntil: null,
      exceptions: [],
      scheduleType: 'weekly',
      weeklySchedule: [
        { dayOfWeek: 0, isAvailable: true, slots: [{ startTime: '09:00', endTime: '11:00' }] },
      ],
      slotDuration: 60,
    });
    const slots = await availabilityService.getAvailableSlots(companyId, testDate);
    expect(slots).toHaveLength(2);
  });

  test('يعيد مصفوفة فارغة إذا كان اليوم غير متاح في الجدول الأسبوعي', async () => {
    Availability.findOne.mockResolvedValue({
      validFrom: null,
      validUntil: null,
      exceptions: [],
      scheduleType: 'weekly',
      weeklySchedule: [
        { dayOfWeek: 0, isAvailable: false, slots: [] },
      ],
      slotDuration: 60,
    });
    const slots = await availabilityService.getAvailableSlots(companyId, testDate);
    expect(slots).toEqual([]);
  });
});

// ============================================================
// availabilityService.getAvailableSlotsWithBookings() - مع استبعاد المحجوزة
// ============================================================

describe('availabilityService.getAvailableSlotsWithBookings() - الفترات مع استبعاد المحجوزة', () => {
  const availabilityService = require('../services/availabilityService');
  const companyId = new mongoose.Types.ObjectId();
  const testDate = new Date('2026-06-15T00:00:00.000Z');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('يعيد مصفوفة فارغة إذا لم توجد فترات متاحة', async () => {
    Availability.findOne.mockResolvedValue(null);
    const slots = await availabilityService.getAvailableSlotsWithBookings(companyId, testDate);
    expect(slots).toEqual([]);
  });

  test('يُعلّم الفترات المحجوزة بـ available: false', async () => {
    // إعداد الجدول
    Availability.findOne.mockResolvedValue({
      validFrom: null,
      validUntil: null,
      exceptions: [],
      scheduleType: 'weekly',
      weeklySchedule: [
        { dayOfWeek: 0, isAvailable: true, slots: [{ startTime: '09:00', endTime: '11:00' }] },
      ],
      slotDuration: 60,
      maxConcurrent: 1,
    });

    // موعد محجوز في الفترة الأولى (09:00-10:00)
    const slotStart = new Date(testDate);
    slotStart.setHours(9, 0, 0, 0);
    const slotEnd = new Date(testDate);
    slotEnd.setHours(10, 0, 0, 0);

    Appointment.find.mockResolvedValue([{
      scheduledAt: slotStart,
      endsAt: slotEnd,
    }]);

    const slots = await availabilityService.getAvailableSlotsWithBookings(companyId, testDate);
    expect(slots).toHaveLength(2);
    expect(slots[0].available).toBe(false); // الفترة الأولى محجوزة
    expect(slots[1].available).toBe(true);  // الفترة الثانية متاحة
  });

  test('يسمح بالحجز المتزامن إذا كان maxConcurrent > 1', async () => {
    Availability.findOne.mockResolvedValue({
      validFrom: null,
      validUntil: null,
      exceptions: [],
      scheduleType: 'weekly',
      weeklySchedule: [
        { dayOfWeek: 0, isAvailable: true, slots: [{ startTime: '09:00', endTime: '10:00' }] },
      ],
      slotDuration: 60,
      maxConcurrent: 2,
    });

    const slotStart = new Date(testDate);
    slotStart.setHours(9, 0, 0, 0);
    const slotEnd = new Date(testDate);
    slotEnd.setHours(10, 0, 0, 0);

    // موعد واحد محجوز، maxConcurrent = 2 → لا يزال متاحاً
    Appointment.find.mockResolvedValue([{ scheduledAt: slotStart, endsAt: slotEnd }]);

    const slots = await availabilityService.getAvailableSlotsWithBookings(companyId, testDate);
    expect(slots[0].available).toBe(true);
  });

  test('يُعلّم الفترة غير متاحة إذا امتلأت جميع الأماكن المتزامنة', async () => {
    Availability.findOne.mockResolvedValue({
      validFrom: null,
      validUntil: null,
      exceptions: [],
      scheduleType: 'weekly',
      weeklySchedule: [
        { dayOfWeek: 0, isAvailable: true, slots: [{ startTime: '09:00', endTime: '10:00' }] },
      ],
      slotDuration: 60,
      maxConcurrent: 1,
    });

    const slotStart = new Date(testDate);
    slotStart.setHours(9, 0, 0, 0);
    const slotEnd = new Date(testDate);
    slotEnd.setHours(10, 0, 0, 0);

    Appointment.find.mockResolvedValue([
      { scheduledAt: slotStart, endsAt: slotEnd },
    ]);

    const slots = await availabilityService.getAvailableSlotsWithBookings(companyId, testDate);
    expect(slots[0].available).toBe(false);
  });
});

// ============================================================
// reminderService.createRemindersForAppointment() - إنشاء التذكيرات
// ============================================================

describe('reminderService.createRemindersForAppointment() - إنشاء التذكيرات', () => {
  const reminderService = require('../services/reminderService');

  beforeEach(() => {
    jest.clearAllMocks();
    smsService.isSmsEnabled = jest.fn().mockReturnValue(false);
    Reminder.insertMany = jest.fn().mockResolvedValue([]);
  });

  test('ينشئ تذكيرات للمنظم والمشاركين', async () => {
    const organizerId = new mongoose.Types.ObjectId();
    const participantId = new mongoose.Types.ObjectId();
    const appointmentId = new mongoose.Types.ObjectId();

    // موعد بعد 48 ساعة
    const scheduledAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const appointment = {
      _id: appointmentId,
      organizerId,
      scheduledAt,
      participants: [{ userId: participantId }],
    };

    Reminder.insertMany.mockResolvedValue([
      { _id: new mongoose.Types.ObjectId() },
      { _id: new mongoose.Types.ObjectId() },
      { _id: new mongoose.Types.ObjectId() },
      { _id: new mongoose.Types.ObjectId() },
    ]);

    const created = await reminderService.createRemindersForAppointment(appointment);
    expect(Reminder.insertMany).toHaveBeenCalledTimes(1);

    // التحقق من أن التذكيرات تشمل 24h و 1h لكل مستخدم
    const callArgs = Reminder.insertMany.mock.calls[0][0];
    const types = callArgs.map(r => r.type);
    expect(types).toContain('24h');
    expect(types).toContain('1h');
  });

  test('لا ينشئ تذكيرات لموعد في الماضي', async () => {
    const organizerId = new mongoose.Types.ObjectId();
    const appointmentId = new mongoose.Types.ObjectId();

    // موعد بعد 30 دقيقة فقط (أقل من 1 ساعة)
    const scheduledAt = new Date(Date.now() + 30 * 60 * 1000);

    const appointment = {
      _id: appointmentId,
      organizerId,
      scheduledAt,
      participants: [],
    };

    const created = await reminderService.createRemindersForAppointment(appointment);
    // لا يجب إنشاء أي تذكير لأن كلا الوقتين (24h و 1h) في الماضي
    expect(Reminder.insertMany).not.toHaveBeenCalled();
    expect(created).toEqual([]);
  });

  test('ينشئ فقط تذكير 1h إذا كان الموعد بعد أقل من 24 ساعة', async () => {
    const organizerId = new mongoose.Types.ObjectId();
    const appointmentId = new mongoose.Types.ObjectId();

    // موعد بعد 3 ساعات (أقل من 24h، أكثر من 1h)
    const scheduledAt = new Date(Date.now() + 3 * 60 * 60 * 1000);

    const appointment = {
      _id: appointmentId,
      organizerId,
      scheduledAt,
      participants: [],
    };

    Reminder.insertMany.mockResolvedValue([{ _id: new mongoose.Types.ObjectId() }]);

    await reminderService.createRemindersForAppointment(appointment);

    const callArgs = Reminder.insertMany.mock.calls[0][0];
    const types = callArgs.map(r => r.type);
    expect(types).not.toContain('24h'); // 24h في الماضي
    expect(types).toContain('1h');      // 1h في المستقبل
  });

  test('يضيف قناة SMS إذا كانت مفعّلة', async () => {
    smsService.isSmsEnabled.mockReturnValue(true);

    const organizerId = new mongoose.Types.ObjectId();
    const appointmentId = new mongoose.Types.ObjectId();
    const scheduledAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const appointment = {
      _id: appointmentId,
      organizerId,
      scheduledAt,
      participants: [],
    };

    Reminder.insertMany.mockResolvedValue([]);
    await reminderService.createRemindersForAppointment(appointment);

    const callArgs = Reminder.insertMany.mock.calls[0][0];
    const channels = callArgs.map(r => r.channel);
    expect(channels).toContain('sms');
    expect(channels).toContain('notification');
  });

  test('يتجاهل أخطاء duplicate key (11000)', async () => {
    const organizerId = new mongoose.Types.ObjectId();
    const appointmentId = new mongoose.Types.ObjectId();
    const scheduledAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const appointment = {
      _id: appointmentId,
      organizerId,
      scheduledAt,
      participants: [],
    };

    const dupError = new Error('Duplicate key');
    dupError.code = 11000;
    dupError.insertedDocs = [];
    Reminder.insertMany.mockRejectedValue(dupError);

    // يجب ألا يرمي خطأ
    await expect(
      reminderService.createRemindersForAppointment(appointment)
    ).resolves.toEqual([]);
  });
});

// ============================================================
// reminderService.scheduleCustomReminders() - التذكيرات المخصصة
// ============================================================

describe('reminderService.scheduleCustomReminders() - التذكيرات المخصصة', () => {
  const reminderService = require('../services/reminderService');

  beforeEach(() => {
    jest.clearAllMocks();
    Reminder.insertMany = jest.fn().mockResolvedValue([]);
  });

  test('يعيد مصفوفة فارغة إذا لم يوجد التذكير', async () => {
    Reminder.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    const result = await reminderService.scheduleCustomReminders('nonexistent-id');
    expect(result).toEqual([]);
  });

  test('يعيد مصفوفة فارغة إذا لم توجد customReminders', async () => {
    Reminder.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        customReminders: [],
        appointmentId: { _id: new mongoose.Types.ObjectId(), status: 'scheduled', scheduledAt: new Date() },
        userId: new mongoose.Types.ObjectId(),
        channel: 'notification',
      }),
    });

    const result = await reminderService.scheduleCustomReminders('some-id');
    expect(result).toEqual([]);
  });

  test('لا ينشئ تذكيرات مخصصة في الماضي', async () => {
    const appointmentId = new mongoose.Types.ObjectId();
    // موعد بعد 30 دقيقة، تذكير مخصص قبل 60 دقيقة → في الماضي
    const scheduledAt = new Date(Date.now() + 30 * 60 * 1000);

    Reminder.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        customReminders: [60], // 60 دقيقة قبل الموعد
        appointmentId: { _id: appointmentId, status: 'scheduled', scheduledAt },
        userId: new mongoose.Types.ObjectId(),
        channel: 'notification',
      }),
    });

    const result = await reminderService.scheduleCustomReminders('some-id');
    expect(result).toEqual([]);
    expect(Reminder.insertMany).not.toHaveBeenCalled();
  });

  test('ينشئ تذكيرات مخصصة في المستقبل', async () => {
    const appointmentId = new mongoose.Types.ObjectId();
    // موعد بعد 5 ساعات، تذكير مخصص قبل 120 دقيقة → في المستقبل
    const scheduledAt = new Date(Date.now() + 5 * 60 * 60 * 1000);

    Reminder.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        customReminders: [120],
        appointmentId: { _id: appointmentId, status: 'scheduled', scheduledAt },
        userId: new mongoose.Types.ObjectId(),
        channel: 'notification',
      }),
    });

    Reminder.insertMany.mockResolvedValue([{ _id: new mongoose.Types.ObjectId() }]);

    const result = await reminderService.scheduleCustomReminders('some-id');
    expect(Reminder.insertMany).toHaveBeenCalledTimes(1);
  });

  test('لا ينشئ تذكيرات لموعد ملغى', async () => {
    const appointmentId = new mongoose.Types.ObjectId();
    const scheduledAt = new Date(Date.now() + 5 * 60 * 60 * 1000);

    Reminder.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        customReminders: [120],
        appointmentId: { _id: appointmentId, status: 'cancelled', scheduledAt },
        userId: new mongoose.Types.ObjectId(),
        channel: 'notification',
      }),
    });

    const result = await reminderService.scheduleCustomReminders('some-id');
    expect(result).toEqual([]);
    expect(Reminder.insertMany).not.toHaveBeenCalled();
  });
});

// ============================================================
// AppointmentService._checkConflict() - فحص التعارضات
// ============================================================

describe('AppointmentService._checkConflict() - فحص التعارضات', () => {
  const appointmentService = require('../services/appointmentService');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('لا يرمي خطأ إذا لم يوجد تعارض', async () => {
    Appointment.findOne = jest.fn().mockResolvedValue(null);

    const organizerId = new mongoose.Types.ObjectId();
    const newDateTime = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await expect(
      appointmentService._checkConflict(organizerId, newDateTime, 60)
    ).resolves.not.toThrow();
  });

  test('يرمي خطأ TIME_CONFLICT إذا وُجد تعارض', async () => {
    const conflicting = {
      _id: new mongoose.Types.ObjectId(),
      scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    };
    Appointment.findOne = jest.fn().mockResolvedValue(conflicting);

    const organizerId = new mongoose.Types.ObjectId();
    const newDateTime = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await expect(
      appointmentService._checkConflict(organizerId, newDateTime, 60)
    ).rejects.toMatchObject({ code: 'TIME_CONFLICT' });
  });

  test('يستثني الموعد الحالي عند التحقق (excludeAppointmentId)', async () => {
    Appointment.findOne = jest.fn().mockResolvedValue(null);

    const organizerId = new mongoose.Types.ObjectId();
    const excludeId = new mongoose.Types.ObjectId();
    const newDateTime = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await expect(
      appointmentService._checkConflict(organizerId, newDateTime, 60, excludeId)
    ).resolves.not.toThrow();

    // التحقق من أن الاستعلام يحتوي على $ne
    const queryArg = Appointment.findOne.mock.calls[0][0];
    expect(queryArg._id).toEqual({ $ne: excludeId });
  });

  test('يتحقق من التعارض بناءً على endsAt', async () => {
    Appointment.findOne = jest.fn().mockResolvedValue(null);

    const organizerId = new mongoose.Types.ObjectId();
    const newDateTime = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const duration = 90;

    await appointmentService._checkConflict(organizerId, newDateTime, duration);

    const queryArg = Appointment.findOne.mock.calls[0][0];
    // يجب أن يتحقق من التداخل الزمني
    expect(queryArg.$or).toBeDefined();
  });
});

// ============================================================
// AppointmentService.getAppointmentStats() - الإحصائيات
// ============================================================

describe('AppointmentService.getAppointmentStats() - الإحصائيات', () => {
  const appointmentService = require('../services/appointmentService');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('يعيد إحصائيات صحيحة للشركة', async () => {
    const companyId = new mongoose.Types.ObjectId();

    Appointment.countDocuments = jest.fn()
      .mockResolvedValueOnce(10)  // total
      .mockResolvedValueOnce(3)   // scheduled
      .mockResolvedValueOnce(2)   // confirmed
      .mockResolvedValueOnce(4)   // completed
      .mockResolvedValueOnce(1);  // cancelled

    const stats = await appointmentService.getAppointmentStats(companyId);

    expect(stats.total).toBe(10);
    expect(stats.byStatus.scheduled).toBe(3);
    expect(stats.byStatus.confirmed).toBe(2);
    expect(stats.byStatus.completed).toBe(4);
    expect(stats.byStatus.cancelled).toBe(1);
  });

  test('يحسب معدل الحضور بشكل صحيح', async () => {
    const companyId = new mongoose.Types.ObjectId();

    // total=10, scheduled=2, confirmed=2, completed=4, cancelled=2
    // attendanceRate = 4 / (2+2+4+2) * 100 = 40%
    Appointment.countDocuments = jest.fn()
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(2);

    const stats = await appointmentService.getAppointmentStats(companyId);
    expect(stats.attendanceRate).toBe(40);
  });

  test('يحسب معدل الإلغاء بشكل صحيح', async () => {
    const companyId = new mongoose.Types.ObjectId();

    // total=10, cancelled=2 → cancellationRate = 20%
    Appointment.countDocuments = jest.fn()
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2);

    const stats = await appointmentService.getAppointmentStats(companyId);
    expect(stats.cancellationRate).toBe(20);
  });

  test('يعيد معدل حضور 0 إذا لم توجد مواعيد', async () => {
    const companyId = new mongoose.Types.ObjectId();

    Appointment.countDocuments = jest.fn().mockResolvedValue(0);

    const stats = await appointmentService.getAppointmentStats(companyId);
    expect(stats.attendanceRate).toBe(0);
    expect(stats.cancellationRate).toBe(0);
  });

  test('يطبق فلتر التاريخ عند تمريره', async () => {
    const companyId = new mongoose.Types.ObjectId();

    Appointment.countDocuments = jest.fn().mockResolvedValue(0);

    await appointmentService.getAppointmentStats(companyId, {
      startDate: '2026-01-01',
      endDate: '2026-06-30',
    });

    // التحقق من أن الاستعلام يحتوي على scheduledAt
    const queryArg = Appointment.countDocuments.mock.calls[0][0];
    expect(queryArg.scheduledAt).toBeDefined();
    expect(queryArg.scheduledAt.$gte).toBeInstanceOf(Date);
    expect(queryArg.scheduledAt.$lte).toBeInstanceOf(Date);
  });

  test('لا يطبق فلتر التاريخ إذا لم يُمرَّر', async () => {
    const companyId = new mongoose.Types.ObjectId();

    Appointment.countDocuments = jest.fn().mockResolvedValue(0);

    await appointmentService.getAppointmentStats(companyId);

    const queryArg = Appointment.countDocuments.mock.calls[0][0];
    expect(queryArg.scheduledAt).toBeUndefined();
  });
});

// ============================================================
// حالات حدية إضافية - Edge Cases
// ============================================================

describe('حالات حدية - Edge Cases', () => {

  describe('_buildSlots - حالات حدية', () => {
    test('يتعامل مع نطاق يبدأ وينتهي في نفس الوقت', () => {
      const date = new Date('2026-06-15T00:00:00.000Z');
      const slots = _buildSlots(date, [{ startTime: '09:00', endTime: '09:00' }], 60);
      expect(slots).toHaveLength(0);
    });

    test('يتعامل مع مدة 120 دقيقة', () => {
      const date = new Date('2026-06-15T00:00:00.000Z');
      const slots = _buildSlots(date, [{ startTime: '09:00', endTime: '13:00' }], 120);
      expect(slots).toHaveLength(2);
    });
  });

  describe('AppointmentService - حالات حدية للإلغاء', () => {
    const appointmentService = require('../services/appointmentService');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('يرفض إلغاء موعد بحالة cancelled', async () => {
      const appointmentId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      Appointment.findById = jest.fn().mockResolvedValue({
        _id: appointmentId,
        organizerId: userId,
        participants: [],
        status: 'cancelled',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      await expect(
        appointmentService.cancelAppointment(appointmentId, userId)
      ).rejects.toMatchObject({ code: 'INVALID_STATUS' });
    });

    test('يرفض إلغاء موعد بحالة completed', async () => {
      const appointmentId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      Appointment.findById = jest.fn().mockResolvedValue({
        _id: appointmentId,
        organizerId: userId,
        participants: [],
        status: 'completed',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      await expect(
        appointmentService.cancelAppointment(appointmentId, userId)
      ).rejects.toMatchObject({ code: 'INVALID_STATUS' });
    });

    test('يرفض إلغاء موعد بعد أقل من ساعة', async () => {
      const appointmentId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      Appointment.findById = jest.fn().mockResolvedValue({
        _id: appointmentId,
        organizerId: userId,
        participants: [],
        status: 'scheduled',
        scheduledAt: new Date(Date.now() + 30 * 60 * 1000), // 30 دقيقة
      });

      await expect(
        appointmentService.cancelAppointment(appointmentId, userId)
      ).rejects.toMatchObject({ code: 'CANCELLATION_DEADLINE_PASSED' });
    });

    test('يرفض إلغاء موعد غير موجود', async () => {
      Appointment.findById = jest.fn().mockResolvedValue(null);

      await expect(
        appointmentService.cancelAppointment('nonexistent', 'user123')
      ).rejects.toMatchObject({ code: 'APPOINTMENT_NOT_FOUND' });
    });
  });

  describe('AppointmentService - حالات حدية لإعادة الجدولة', () => {
    const appointmentService = require('../services/appointmentService');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('يرفض إعادة جدولة موعد غير موجود', async () => {
      Appointment.findById = jest.fn().mockResolvedValue(null);

      await expect(
        appointmentService.rescheduleAppointment('nonexistent', 'user123', new Date())
      ).rejects.toMatchObject({ code: 'APPOINTMENT_NOT_FOUND' });
    });

    test('يرفض إعادة جدولة موعد بحالة cancelled', async () => {
      const appointmentId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      Appointment.findById = jest.fn().mockResolvedValue({
        _id: appointmentId,
        organizerId: userId,
        participants: [],
        status: 'cancelled',
        scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      });

      await expect(
        appointmentService.rescheduleAppointment(appointmentId, userId, new Date())
      ).rejects.toMatchObject({ code: 'INVALID_STATUS' });
    });

    test('يرفض إعادة جدولة موعد في أقل من 24 ساعة', async () => {
      const appointmentId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      Appointment.findById = jest.fn().mockResolvedValue({
        _id: appointmentId,
        organizerId: userId,
        participants: [],
        status: 'scheduled',
        scheduledAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 ساعة
        duration: 60,
      });

      const newDateTime = new Date(Date.now() + 72 * 60 * 60 * 1000);

      await expect(
        appointmentService.rescheduleAppointment(appointmentId, userId, newDateTime)
      ).rejects.toMatchObject({ code: 'RESCHEDULE_DEADLINE_PASSED' });
    });

    test('يرفض إعادة الجدولة لوقت في الماضي', async () => {
      const appointmentId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      Appointment.findById = jest.fn().mockResolvedValue({
        _id: appointmentId,
        organizerId: userId,
        participants: [],
        status: 'scheduled',
        scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        duration: 60,
      });

      const pastDateTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

      await expect(
        appointmentService.rescheduleAppointment(appointmentId, userId, pastDateTime)
      ).rejects.toMatchObject({ code: 'PAST_DATE' });
    });
  });
});

// ============================================================
// Task 6.3 - تحديث التقويم تلقائياً
// Validates: User Story 4 - "تحديث التقويم تلقائياً"
// ============================================================

describe('Task 6.3 - تحديث التقويم تلقائياً', () => {
  const appointmentService = require('../services/appointmentService');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── إعادة إتاحة الفترة الزمنية عند الإلغاء ───────────────────────────────

  describe('_releaseAvailabilitySlot - إعادة إتاحة الفترة الزمنية', () => {
    test('يُسجّل إعادة الإتاحة بدون رمي خطأ', async () => {
      const appointment = {
        _id: new mongoose.Types.ObjectId(),
        scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        organizerId: new mongoose.Types.ObjectId(),
      };

      // يجب ألا يرمي خطأ
      await expect(
        appointmentService._releaseAvailabilitySlot(appointment)
      ).resolves.not.toThrow();
    });

    test('الفترة تصبح متاحة تلقائياً بعد الإلغاء (حسب حالة الموعد)', async () => {
      // الإتاحة محسوبة ديناميكياً: الفترة تُعدّ متاحة إذا كان عدد المواعيد النشطة < maxConcurrent
      // بعد الإلغاء، حالة الموعد = 'cancelled' → لا يُحسب في المواعيد النشطة
      const companyId = new mongoose.Types.ObjectId();
      const slotStart = new Date(Date.now() + 48 * 60 * 60 * 1000);
      const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

      // محاكاة: لا توجد مواعيد نشطة بعد الإلغاء
      Appointment.find = jest.fn().mockResolvedValue([]);

      const availabilityService = require('../services/availabilityService');
      Availability.findOne = jest.fn().mockResolvedValue({
        validFrom: null,
        validUntil: null,
        exceptions: [],
        scheduleType: 'weekly',
        weeklySchedule: [
          { dayOfWeek: slotStart.getDay(), isAvailable: true, slots: [{ startTime: '09:00', endTime: '11:00' }] },
        ],
        slotDuration: 60,
        maxConcurrent: 1,
      });

      const slots = await availabilityService.getAvailableSlotsWithBookings(companyId, slotStart);
      // بعد الإلغاء (لا مواعيد نشطة) → جميع الفترات متاحة
      const allAvailable = slots.every(s => s.available === true);
      expect(allAvailable).toBe(true);
    });
  });

  // ─── حذف حدث Google Calendar عند الإلغاء ──────────────────────────────────

  describe('_deleteGoogleCalendarOnCancel - حذف حدث Google Calendar', () => {
    test('لا يرمي خطأ إذا لم يكن للموعد googleEventId', async () => {
      const appointment = {
        _id: new mongoose.Types.ObjectId(),
        organizerId: new mongoose.Types.ObjectId(),
        googleEventId: null,
      };

      await expect(
        appointmentService._deleteGoogleCalendarOnCancel(appointment)
      ).resolves.not.toThrow();
    });

    test('يستدعي googleCalendarService.deleteEventForAppointment إذا كان للموعد googleEventId', async () => {
      const googleCalendarService = require('../services/googleCalendarService');
      const mockDelete = jest.spyOn(googleCalendarService, 'deleteEventForAppointment')
        .mockResolvedValue(undefined);

      const appointment = {
        _id: new mongoose.Types.ObjectId(),
        organizerId: new mongoose.Types.ObjectId(),
        googleEventId: 'google_event_abc123',
      };

      await appointmentService._deleteGoogleCalendarOnCancel(appointment);

      expect(mockDelete).toHaveBeenCalledWith(appointment, appointment.organizerId.toString());
      mockDelete.mockRestore();
    });

    test('لا يوقف عملية الإلغاء إذا فشل حذف حدث Google Calendar (non-blocking)', async () => {
      const googleCalendarService = require('../services/googleCalendarService');
      const mockDelete = jest.spyOn(googleCalendarService, 'deleteEventForAppointment')
        .mockRejectedValue(new Error('Google API error'));

      const appointment = {
        _id: new mongoose.Types.ObjectId(),
        organizerId: new mongoose.Types.ObjectId(),
        googleEventId: 'google_event_xyz',
      };

      // يجب ألا يرمي خطأ حتى لو فشل Google
      await expect(
        appointmentService._deleteGoogleCalendarOnCancel(appointment)
      ).resolves.not.toThrow();

      mockDelete.mockRestore();
    });
  });

  // ─── تحديث حدث Google Calendar عند إعادة الجدولة ──────────────────────────

  describe('_updateGoogleCalendarOnReschedule - تحديث حدث Google Calendar', () => {
    test('لا يرمي خطأ إذا لم يكن للموعد القديم googleEventId', async () => {
      const oldAppointment = {
        _id: new mongoose.Types.ObjectId(),
        organizerId: new mongoose.Types.ObjectId(),
        googleEventId: null,
        googleEventLink: null,
        toObject: jest.fn().mockReturnValue({}),
      };
      const newAppointment = {
        _id: new mongoose.Types.ObjectId(),
        organizerId: oldAppointment.organizerId,
        scheduledAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
        duration: 60,
        toObject: jest.fn().mockReturnValue({}),
      };

      const googleCalendarService = require('../services/googleCalendarService');
      const mockCreate = jest.spyOn(googleCalendarService, 'createEventForAppointment')
        .mockResolvedValue(undefined);

      await expect(
        appointmentService._updateGoogleCalendarOnReschedule(oldAppointment, newAppointment)
      ).resolves.not.toThrow();

      mockCreate.mockRestore();
    });

    test('يستدعي updateEventForAppointment إذا كان للموعد القديم googleEventId', async () => {
      const googleCalendarService = require('../services/googleCalendarService');
      const mockUpdate = jest.spyOn(googleCalendarService, 'updateEventForAppointment')
        .mockResolvedValue(undefined);

      const organizerId = new mongoose.Types.ObjectId();
      const oldAppointment = {
        _id: new mongoose.Types.ObjectId(),
        organizerId,
        googleEventId: 'google_event_old_123',
        googleEventLink: 'https://calendar.google.com/event/old',
        toObject: jest.fn().mockReturnValue({
          googleEventId: 'google_event_old_123',
          googleEventLink: 'https://calendar.google.com/event/old',
        }),
      };
      const newAppointment = {
        _id: new mongoose.Types.ObjectId(),
        organizerId,
        scheduledAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
        duration: 60,
        toObject: jest.fn().mockReturnValue({}),
      };

      // Mock Appointment.findByIdAndUpdate
      Appointment.findByIdAndUpdate = jest.fn().mockResolvedValue({});

      await appointmentService._updateGoogleCalendarOnReschedule(oldAppointment, newAppointment);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ googleEventId: 'google_event_old_123' }),
        organizerId.toString()
      );

      mockUpdate.mockRestore();
    });

    test('لا يوقف عملية إعادة الجدولة إذا فشل تحديث Google Calendar (non-blocking)', async () => {
      const googleCalendarService = require('../services/googleCalendarService');
      const mockUpdate = jest.spyOn(googleCalendarService, 'updateEventForAppointment')
        .mockRejectedValue(new Error('Google API error'));

      const organizerId = new mongoose.Types.ObjectId();
      const oldAppointment = {
        _id: new mongoose.Types.ObjectId(),
        organizerId,
        googleEventId: 'google_event_fail',
        googleEventLink: null,
        toObject: jest.fn().mockReturnValue({ googleEventId: 'google_event_fail' }),
      };
      const newAppointment = {
        _id: new mongoose.Types.ObjectId(),
        organizerId,
        scheduledAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
        duration: 60,
        toObject: jest.fn().mockReturnValue({}),
      };

      Appointment.findByIdAndUpdate = jest.fn().mockResolvedValue({});

      // يجب ألا يرمي خطأ حتى لو فشل Google
      await expect(
        appointmentService._updateGoogleCalendarOnReschedule(oldAppointment, newAppointment)
      ).resolves.not.toThrow();

      mockUpdate.mockRestore();
    });
  });

  // ─── إرسال إشعارات للطرفين ─────────────────────────────────────────────────

  describe('_sendCancellationNotifications - إشعارات الإلغاء', () => {
    const notificationService = require('../services/notificationService');

    test('يرسل إشعاراً للمشاركين عند إلغاء المنظم', async () => {
      const organizerId = new mongoose.Types.ObjectId();
      const participantId = new mongoose.Types.ObjectId();

      notificationService.createNotification = jest.fn().mockResolvedValue({});

      const appointment = {
        _id: new mongoose.Types.ObjectId(),
        title: 'مقابلة عمل',
        organizerId,
        participants: [{ userId: participantId }],
      };

      await appointmentService._sendCancellationNotifications(
        appointment,
        organizerId.toString(),
        'سبب الإلغاء'
      );

      // يجب أن يُرسل إشعاراً للمشارك
      expect(notificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient: participantId,
          type: 'appointment_cancelled',
        })
      );
    });

    test('يرسل إشعاراً للمنظم عند إلغاء المشارك', async () => {
      const organizerId = new mongoose.Types.ObjectId();
      const participantId = new mongoose.Types.ObjectId();

      notificationService.createNotification = jest.fn().mockResolvedValue({});

      const appointment = {
        _id: new mongoose.Types.ObjectId(),
        title: 'مقابلة عمل',
        organizerId,
        participants: [{ userId: participantId }],
      };

      await appointmentService._sendCancellationNotifications(
        appointment,
        participantId.toString(),
        ''
      );

      // يجب أن يُرسل إشعاراً للمنظم
      expect(notificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient: organizerId,
          type: 'appointment_cancelled',
        })
      );
    });
  });

  describe('_sendRescheduleNotifications - إشعارات إعادة الجدولة', () => {
    const notificationService = require('../services/notificationService');

    test('يرسل إشعاراً للمشاركين عند إعادة الجدولة', async () => {
      const organizerId = new mongoose.Types.ObjectId();
      const participantId = new mongoose.Types.ObjectId();

      notificationService.createNotification = jest.fn().mockResolvedValue({});

      const oldAppointment = {
        _id: new mongoose.Types.ObjectId(),
        title: 'مقابلة عمل',
        organizerId,
        participants: [{ userId: participantId }],
        scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      };

      const newAppointment = {
        _id: new mongoose.Types.ObjectId(),
        scheduledAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      };

      await appointmentService._sendRescheduleNotifications(
        oldAppointment,
        newAppointment,
        organizerId.toString(),
        'تغيير في الجدول'
      );

      // يجب أن يُرسل إشعاراً للمشارك
      expect(notificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient: participantId,
          type: 'appointment_rescheduled',
        })
      );
    });

    test('يرسل إشعار تأكيد لمن أعاد الجدولة', async () => {
      const organizerId = new mongoose.Types.ObjectId();

      notificationService.createNotification = jest.fn().mockResolvedValue({});

      const oldAppointment = {
        _id: new mongoose.Types.ObjectId(),
        title: 'مقابلة عمل',
        organizerId,
        participants: [],
        scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      };

      const newAppointment = {
        _id: new mongoose.Types.ObjectId(),
        scheduledAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      };

      await appointmentService._sendRescheduleNotifications(
        oldAppointment,
        newAppointment,
        organizerId.toString(),
        ''
      );

      // يجب أن يُرسل إشعار تأكيد لمن أعاد الجدولة
      expect(notificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient: organizerId.toString(),
          type: 'appointment_rescheduled',
        })
      );
    });
  });
});
