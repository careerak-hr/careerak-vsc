const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');

/**
 * خدمة الأوقات المتاحة
 * تدعم تحديد الأوقات بشكل يومي أو أسبوعي مع الاستثناءات
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

/**
 * إنشاء أو تحديث جدول الأوقات المتاحة لشركة
 */
async function setAvailability(companyId, data) {
  const existing = await Availability.findOne({ companyId, isActive: true });

  if (existing) {
    Object.assign(existing, data);
    return existing.save();
  }

  return Availability.create({ companyId, ...data });
}

/**
 * جلب جدول الأوقات المتاحة لشركة
 */
async function getAvailability(companyId) {
  return Availability.findOne({ companyId, isActive: true });
}

/**
 * توليد الفترات الزمنية المتاحة لتاريخ معين
 *
 * @param {string} companyId
 * @param {Date}   date
 * @returns {Array<{start: Date, end: Date}>}
 */
async function getAvailableSlots(companyId, date) {
  const availability = await Availability.findOne({ companyId, isActive: true });
  if (!availability) return [];

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  // التحقق من صلاحية الجدول
  if (availability.validFrom && targetDate < availability.validFrom) return [];
  if (availability.validUntil && targetDate > availability.validUntil) return [];

  // فحص الاستثناءات أولاً
  const exception = availability.exceptions.find(ex => {
    const exDate = new Date(ex.date);
    exDate.setHours(0, 0, 0, 0);
    return exDate.getTime() === targetDate.getTime();
  });

  if (exception) {
    if (!exception.isAvailable) return []; // إجازة
    return _buildSlots(targetDate, exception.slots, availability.slotDuration);
  }

  // الجدول اليومي
  if (availability.scheduleType === 'daily') {
    const dayEntry = availability.dailySchedule.find(d => {
      const dDate = new Date(d.date);
      dDate.setHours(0, 0, 0, 0);
      return dDate.getTime() === targetDate.getTime();
    });
    if (!dayEntry || !dayEntry.isAvailable) return [];
    return _buildSlots(targetDate, dayEntry.slots, availability.slotDuration);
  }

  // الجدول الأسبوعي
  const dayOfWeek = targetDate.getDay(); // 0=الأحد
  const weekDay = availability.weeklySchedule.find(d => d.dayOfWeek === dayOfWeek);
  if (!weekDay || !weekDay.isAvailable) return [];

  return _buildSlots(targetDate, weekDay.slots, availability.slotDuration);
}

/**
 * جلب الفترات المتاحة مع استبعاد المحجوزة
 *
 * @param {string} companyId
 * @param {Date}   date
 * @returns {Array<{start: Date, end: Date, available: boolean}>}
 */
async function getAvailableSlotsWithBookings(companyId, date) {
  const slots = await getAvailableSlots(companyId, date);
  if (!slots.length) return [];

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);

  // جلب المواعيد المحجوزة في هذا اليوم
  const booked = await Appointment.find({
    organizerId: companyId,
    scheduledAt: { $gte: targetDate, $lt: nextDay },
    status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
  });

  const availability = await Availability.findOne({ companyId, isActive: true });
  const maxConcurrent = availability ? availability.maxConcurrent : 1;

  return slots.map(slot => {
    const overlapping = booked.filter(appt => {
      const apptStart = new Date(appt.scheduledAt);
      const apptEnd   = new Date(appt.endsAt || apptStart.getTime() + 60 * 60000);
      return apptStart < slot.end && apptEnd > slot.start;
    });
    return { ...slot, available: overlapping.length < maxConcurrent };
  });
}

/**
 * إضافة استثناء (إجازة أو وقت غير متاح)
 */
async function addException(companyId, exception) {
  const availability = await Availability.findOne({ companyId, isActive: true });
  if (!availability) throw new Error('لا يوجد جدول متاح لهذه الشركة');

  // إزالة استثناء موجود لنفس التاريخ إن وُجد
  const exDate = new Date(exception.date);
  exDate.setHours(0, 0, 0, 0);
  availability.exceptions = availability.exceptions.filter(ex => {
    const d = new Date(ex.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() !== exDate.getTime();
  });

  availability.exceptions.push(exception);
  return availability.save();
}

/**
 * حذف استثناء
 */
async function removeException(companyId, date) {
  const availability = await Availability.findOne({ companyId, isActive: true });
  if (!availability) throw new Error('لا يوجد جدول متاح لهذه الشركة');

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  availability.exceptions = availability.exceptions.filter(ex => {
    const d = new Date(ex.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() !== targetDate.getTime();
  });

  return availability.save();
}

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * بناء قائمة الفترات الزمنية من نطاقات الوقت
 *
 * @param {Date}   date          - التاريخ المستهدف
 * @param {Array}  timeRanges    - [{startTime, endTime}]
 * @param {number} slotDuration  - مدة كل فترة بالدقائق
 */
function _buildSlots(date, timeRanges, slotDuration) {
  const slots = [];

  for (const range of timeRanges) {
    const [startH, startM] = range.startTime.split(':').map(Number);
    const [endH,   endM]   = range.endTime.split(':').map(Number);

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

module.exports = {
  setAvailability,
  getAvailability,
  getAvailableSlots,
  getAvailableSlotsWithBookings,
  addException,
  removeException,
};
