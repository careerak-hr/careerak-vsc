/**
 * اختبارات سجل تاريخ المواعيد (AppointmentHistory)
 * 
 * Validates: User Story 4 - حفظ سجل الإلغاءات والتعديلات
 */

const mongoose = require('mongoose');
const AppointmentHistory = require('../src/models/AppointmentHistory');

// Mock mongoose connection
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
});

afterAll(async () => {
  await AppointmentHistory.deleteMany({ reason: '__test__' }).catch(() => {});
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

describe('AppointmentHistory Model', () => {
  const fakeAppointmentId = new mongoose.Types.ObjectId();
  const fakeUserId = new mongoose.Types.ObjectId();
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  describe('إنشاء سجل إلغاء', () => {
    it('يجب إنشاء سجل إلغاء بالحقول المطلوبة', async () => {
      const history = new AppointmentHistory({
        appointmentId: fakeAppointmentId,
        action: 'cancelled',
        performedBy: fakeUserId,
        previousStartTime: now,
        previousEndTime: oneHourLater,
        reason: '__test__',
      });

      const saved = await history.save();

      expect(saved._id).toBeDefined();
      expect(saved.appointmentId.toString()).toBe(fakeAppointmentId.toString());
      expect(saved.action).toBe('cancelled');
      expect(saved.performedBy.toString()).toBe(fakeUserId.toString());
      expect(saved.previousStartTime).toEqual(now);
      expect(saved.previousEndTime).toEqual(oneHourLater);
      expect(saved.newStartTime).toBeNull();
      expect(saved.newEndTime).toBeNull();
      expect(saved.createdAt).toBeDefined();
    });
  });

  describe('إنشاء سجل إعادة جدولة', () => {
    it('يجب إنشاء سجل إعادة جدولة مع الوقت الجديد', async () => {
      const newStart = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      const newEnd = new Date(newStart.getTime() + 60 * 60 * 1000);

      const history = new AppointmentHistory({
        appointmentId: fakeAppointmentId,
        action: 'rescheduled',
        performedBy: fakeUserId,
        previousStartTime: now,
        previousEndTime: oneHourLater,
        newStartTime: newStart,
        newEndTime: newEnd,
        reason: '__test__',
      });

      const saved = await history.save();

      expect(saved.action).toBe('rescheduled');
      expect(saved.newStartTime).toEqual(newStart);
      expect(saved.newEndTime).toEqual(newEnd);
    });
  });

  describe('التحقق من الحقول المطلوبة', () => {
    it('يجب رفض السجل بدون appointmentId', async () => {
      const history = new AppointmentHistory({
        action: 'cancelled',
        performedBy: fakeUserId,
        previousStartTime: now,
        previousEndTime: oneHourLater,
      });

      await expect(history.save()).rejects.toThrow();
    });

    it('يجب رفض السجل بدون action', async () => {
      const history = new AppointmentHistory({
        appointmentId: fakeAppointmentId,
        performedBy: fakeUserId,
        previousStartTime: now,
        previousEndTime: oneHourLater,
      });

      await expect(history.save()).rejects.toThrow();
    });

    it('يجب رفض action غير صحيح', async () => {
      const history = new AppointmentHistory({
        appointmentId: fakeAppointmentId,
        action: 'deleted', // غير مسموح
        performedBy: fakeUserId,
        previousStartTime: now,
        previousEndTime: oneHourLater,
      });

      await expect(history.save()).rejects.toThrow();
    });

    it('يجب قبول سجل بدون reason (اختياري)', async () => {
      const history = new AppointmentHistory({
        appointmentId: fakeAppointmentId,
        action: 'cancelled',
        performedBy: fakeUserId,
        previousStartTime: now,
        previousEndTime: oneHourLater,
      });

      const saved = await history.save();
      expect(saved.reason).toBe('');

      // تنظيف مباشر عبر collection (لتجاوز حماية الحذف في الاختبار)
      await AppointmentHistory.collection.deleteOne({ _id: saved._id });
    });
  });

  describe('حماية السجل من الحذف', () => {
    it('يجب منع حذف سجل التاريخ عبر deleteOne', async () => {
      const history = await AppointmentHistory.create({
        appointmentId: fakeAppointmentId,
        action: 'cancelled',
        performedBy: fakeUserId,
        previousStartTime: now,
        previousEndTime: oneHourLater,
        reason: '__test__',
      });

      await expect(
        AppointmentHistory.deleteOne({ _id: history._id })
      ).rejects.toThrow();
    });

    it('يجب منع حذف سجلات التاريخ عبر deleteMany', async () => {
      await expect(
        AppointmentHistory.deleteMany({ reason: '__test__' })
      ).rejects.toThrow();
    });
  });

  describe('الاستعلام عن السجلات', () => {
    it('يجب إمكانية جلب سجلات موعد معين', async () => {
      const specificAppointmentId = new mongoose.Types.ObjectId();

      await AppointmentHistory.collection.insertMany([
        {
          appointmentId: specificAppointmentId,
          action: 'cancelled',
          performedBy: fakeUserId,
          previousStartTime: now,
          previousEndTime: oneHourLater,
          reason: '__test__',
          createdAt: new Date(),
        },
      ]);

      const records = await AppointmentHistory.find({ appointmentId: specificAppointmentId });
      expect(records.length).toBeGreaterThanOrEqual(1);
      expect(records[0].action).toBe('cancelled');

      // تنظيف مباشر عبر collection
      await AppointmentHistory.collection.deleteMany({ appointmentId: specificAppointmentId });
    });
  });
});
