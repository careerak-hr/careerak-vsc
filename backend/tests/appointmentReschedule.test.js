/**
 * اختبارات إعادة جدولة المواعيد
 * 
 * يختبر:
 * - رفض إعادة الجدولة إذا كان الوقت المتبقي < 24 ساعة
 * - قبول إعادة الجدولة إذا كان الوقت المتبقي >= 24 ساعة
 * - حفظ سجل التعديل (rescheduleHistory)
 * - رفض التواريخ في الماضي
 * - رفض المستخدمين غير المصرح لهم
 */

const mongoose = require('mongoose');
const Appointment = require('../src/models/Appointment');
const appointmentService = require('../src/services/appointmentService');

// Mock notificationService
jest.mock('../src/services/notificationService', () => ({
  createNotification: jest.fn().mockResolvedValue({ _id: 'notif-id' }),
}));

// Mock pusherService
jest.mock('../src/services/pusherService', () => ({
  isEnabled: jest.fn().mockReturnValue(false),
}));

const ORGANIZER_ID = new mongoose.Types.ObjectId();
const PARTICIPANT_ID = new mongoose.Types.ObjectId();
const OTHER_USER_ID = new mongoose.Types.ObjectId();

/**
 * إنشاء موعد وهمي للاختبار
 */
function createMockAppointment(overrides = {}) {
  const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // بعد 48 ساعة
  return {
    _id: new mongoose.Types.ObjectId(),
    title: 'مقابلة اختبار',
    type: 'video_interview',
    status: 'scheduled',
    organizerId: ORGANIZER_ID,
    participants: [{ userId: PARTICIPANT_ID, status: 'pending' }],
    scheduledAt: futureDate,
    duration: 60,
    location: null,
    jobApplicationId: null,
    notes: '',
    rescheduleHistory: [],
    save: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
}

describe('AppointmentService - rescheduleAppointment', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('التحقق من حد 24 ساعة', () => {

    test('يجب رفض إعادة الجدولة إذا كان الموعد بعد أقل من 24 ساعة', async () => {
      const appointment = createMockAppointment({
        scheduledAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // بعد 12 ساعة فقط
      });

      jest.spyOn(Appointment, 'findById').mockResolvedValue(appointment);

      const newDateTime = new Date(Date.now() + 72 * 60 * 60 * 1000);

      await expect(
        appointmentService.rescheduleAppointment(
          appointment._id.toString(),
          ORGANIZER_ID.toString(),
          newDateTime
        )
      ).rejects.toMatchObject({
        code: 'RESCHEDULE_DEADLINE_PASSED',
        statusCode: 400,
      });
    });

    test('يجب رفض إعادة الجدولة إذا كان الموعد بعد 23 ساعة و59 دقيقة', async () => {
      const appointment = createMockAppointment({
        scheduledAt: new Date(Date.now() + (24 * 60 - 1) * 60 * 1000), // 23h 59m
      });

      jest.spyOn(Appointment, 'findById').mockResolvedValue(appointment);

      const newDateTime = new Date(Date.now() + 72 * 60 * 60 * 1000);

      await expect(
        appointmentService.rescheduleAppointment(
          appointment._id.toString(),
          ORGANIZER_ID.toString(),
          newDateTime
        )
      ).rejects.toMatchObject({
        code: 'RESCHEDULE_DEADLINE_PASSED',
      });
    });

    test('يجب قبول إعادة الجدولة إذا كان الموعد بعد أكثر من 24 ساعة', async () => {
      const appointment = createMockAppointment({
        scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // بعد 48 ساعة
      });

      jest.spyOn(Appointment, 'findById').mockResolvedValue(appointment);
      jest.spyOn(Appointment, 'findOne').mockResolvedValue(null); // لا تعارض

      const newAppointmentMock = {
        _id: new mongoose.Types.ObjectId(),
        scheduledAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
        duration: 60,
        meetingLink: null,
        status: 'scheduled',
        rescheduleHistory: [],
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Appointment.prototype, 'save').mockResolvedValue(newAppointmentMock);

      // Mock Appointment constructor
      const AppointmentConstructorSpy = jest.spyOn(Appointment.prototype, 'save')
        .mockImplementation(function() {
          Object.assign(this, newAppointmentMock);
          return Promise.resolve(this);
        });

      const newDateTime = new Date(Date.now() + 72 * 60 * 60 * 1000);

      // لن يرمي خطأ
      await expect(
        appointmentService.rescheduleAppointment(
          appointment._id.toString(),
          ORGANIZER_ID.toString(),
          newDateTime
        )
      ).resolves.toBeDefined();
    });

  });

  describe('التحقق من الصلاحيات', () => {

    test('يجب رفض المستخدم غير المصرح له', async () => {
      const appointment = createMockAppointment();
      jest.spyOn(Appointment, 'findById').mockResolvedValue(appointment);

      const newDateTime = new Date(Date.now() + 72 * 60 * 60 * 1000);

      await expect(
        appointmentService.rescheduleAppointment(
          appointment._id.toString(),
          OTHER_USER_ID.toString(), // مستخدم غير مصرح
          newDateTime
        )
      ).rejects.toMatchObject({
        code: 'FORBIDDEN',
        statusCode: 403,
      });
    });

    test('يجب السماح للمنظم بإعادة الجدولة', async () => {
      const appointment = createMockAppointment();
      jest.spyOn(Appointment, 'findById').mockResolvedValue(appointment);
      jest.spyOn(Appointment, 'findOne').mockResolvedValue(null);
      jest.spyOn(Appointment.prototype, 'save').mockResolvedValue(true);

      const newDateTime = new Date(Date.now() + 72 * 60 * 60 * 1000);

      await expect(
        appointmentService.rescheduleAppointment(
          appointment._id.toString(),
          ORGANIZER_ID.toString(),
          newDateTime
        )
      ).resolves.toBeDefined();
    });

    test('يجب السماح للمشارك بإعادة الجدولة', async () => {
      const appointment = createMockAppointment();
      jest.spyOn(Appointment, 'findById').mockResolvedValue(appointment);
      jest.spyOn(Appointment, 'findOne').mockResolvedValue(null);
      jest.spyOn(Appointment.prototype, 'save').mockResolvedValue(true);

      const newDateTime = new Date(Date.now() + 72 * 60 * 60 * 1000);

      await expect(
        appointmentService.rescheduleAppointment(
          appointment._id.toString(),
          PARTICIPANT_ID.toString(),
          newDateTime
        )
      ).resolves.toBeDefined();
    });

  });

  describe('التحقق من الموعد غير الموجود', () => {

    test('يجب رمي خطأ 404 إذا لم يوجد الموعد', async () => {
      jest.spyOn(Appointment, 'findById').mockResolvedValue(null);

      await expect(
        appointmentService.rescheduleAppointment(
          new mongoose.Types.ObjectId().toString(),
          ORGANIZER_ID.toString(),
          new Date(Date.now() + 72 * 60 * 60 * 1000)
        )
      ).rejects.toMatchObject({
        code: 'APPOINTMENT_NOT_FOUND',
        statusCode: 404,
      });
    });

  });

  describe('التحقق من حالة الموعد', () => {

    test('يجب رفض إعادة جدولة موعد ملغى', async () => {
      const appointment = createMockAppointment({ status: 'cancelled' });
      jest.spyOn(Appointment, 'findById').mockResolvedValue(appointment);

      await expect(
        appointmentService.rescheduleAppointment(
          appointment._id.toString(),
          ORGANIZER_ID.toString(),
          new Date(Date.now() + 72 * 60 * 60 * 1000)
        )
      ).rejects.toMatchObject({
        code: 'INVALID_STATUS',
        statusCode: 400,
      });
    });

    test('يجب رفض إعادة جدولة موعد مكتمل', async () => {
      const appointment = createMockAppointment({ status: 'completed' });
      jest.spyOn(Appointment, 'findById').mockResolvedValue(appointment);

      await expect(
        appointmentService.rescheduleAppointment(
          appointment._id.toString(),
          ORGANIZER_ID.toString(),
          new Date(Date.now() + 72 * 60 * 60 * 1000)
        )
      ).rejects.toMatchObject({
        code: 'INVALID_STATUS',
      });
    });

  });

  describe('التحقق من التاريخ الجديد', () => {

    test('يجب رفض التاريخ في الماضي', async () => {
      const appointment = createMockAppointment();
      jest.spyOn(Appointment, 'findById').mockResolvedValue(appointment);

      const pastDate = new Date(Date.now() - 60 * 60 * 1000); // قبل ساعة

      await expect(
        appointmentService.rescheduleAppointment(
          appointment._id.toString(),
          ORGANIZER_ID.toString(),
          pastDate
        )
      ).rejects.toMatchObject({
        code: 'PAST_DATE',
        statusCode: 400,
      });
    });

    test('يجب رفض التاريخ غير الصحيح', async () => {
      const appointment = createMockAppointment();
      jest.spyOn(Appointment, 'findById').mockResolvedValue(appointment);

      await expect(
        appointmentService.rescheduleAppointment(
          appointment._id.toString(),
          ORGANIZER_ID.toString(),
          'invalid-date'
        )
      ).rejects.toMatchObject({
        code: 'INVALID_DATE',
        statusCode: 400,
      });
    });

  });

  describe('التحقق من التعارض', () => {

    test('يجب رفض الوقت المتعارض مع موعد آخر', async () => {
      const appointment = createMockAppointment();
      jest.spyOn(Appointment, 'findById').mockResolvedValue(appointment);

      // محاكاة وجود موعد متعارض
      const conflictingAppointment = createMockAppointment({
        _id: new mongoose.Types.ObjectId(),
      });
      jest.spyOn(Appointment, 'findOne').mockResolvedValue(conflictingAppointment);

      const newDateTime = new Date(Date.now() + 72 * 60 * 60 * 1000);

      await expect(
        appointmentService.rescheduleAppointment(
          appointment._id.toString(),
          ORGANIZER_ID.toString(),
          newDateTime
        )
      ).rejects.toMatchObject({
        code: 'TIME_CONFLICT',
        statusCode: 409,
      });
    });

  });

});

describe('Appointment Model - rescheduleHistory', () => {

  test('يجب أن يحتوي النموذج على حقل rescheduleHistory', () => {
    const schemaPaths = Appointment.schema.paths;
    expect(schemaPaths['rescheduleHistory']).toBeDefined();
  });

  test('يجب أن يحتوي rescheduleHistory على الحقول المطلوبة', () => {
    const schemaPaths = Appointment.schema.paths;
    // Mongoose uses $ for array subdocument paths
    expect(schemaPaths['rescheduleHistory.$.oldDateTime'] || schemaPaths['rescheduleHistory.0.oldDateTime'] || schemaPaths['rescheduleHistory']).toBeDefined();
    
    // التحقق من خلال schema tree
    const rescheduleHistorySchema = Appointment.schema.obj.rescheduleHistory;
    expect(rescheduleHistorySchema).toBeDefined();
    expect(Array.isArray(rescheduleHistorySchema)).toBe(true);
    const historyItem = rescheduleHistorySchema[0];
    expect(historyItem.oldDateTime).toBeDefined();
    expect(historyItem.newDateTime).toBeDefined();
    expect(historyItem.rescheduledBy).toBeDefined();
    expect(historyItem.reason).toBeDefined();
    expect(historyItem.rescheduledAt).toBeDefined();
  });

});
