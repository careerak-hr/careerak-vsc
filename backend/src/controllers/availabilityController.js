const availabilityService = require('../services/availabilityService');

const VALID_DURATIONS = [15, 30, 45, 60, 90, 120];

/**
 * تحديد أو تحديث الأوقات المتاحة
 * POST /availability
 */
async function setAvailability(req, res) {
  try {
    const companyId = req.user._id;

    if (req.body.slotDuration !== undefined && !VALID_DURATIONS.includes(req.body.slotDuration)) {
      return res.status(400).json({
        success: false,
        message: `مدة المقابلة يجب أن تكون إحدى القيم: ${VALID_DURATIONS.join(', ')} دقيقة`,
      });
    }

    const availability = await availabilityService.setAvailability(companyId, req.body);
    res.status(200).json({ success: true, data: availability });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * تحديث مدة المقابلة فقط
 * PATCH /availability/duration
 */
async function updateSlotDuration(req, res) {
  try {
    const companyId = req.user._id;
    const { slotDuration } = req.body;

    if (!slotDuration) {
      return res.status(400).json({ success: false, message: 'slotDuration مطلوب' });
    }

    if (!VALID_DURATIONS.includes(Number(slotDuration))) {
      return res.status(400).json({
        success: false,
        message: `مدة المقابلة يجب أن تكون إحدى القيم: ${VALID_DURATIONS.join(', ')} دقيقة`,
        validDurations: VALID_DURATIONS,
      });
    }

    const availability = await availabilityService.setAvailability(companyId, { slotDuration: Number(slotDuration) });
    res.json({ success: true, data: { slotDuration: availability.slotDuration } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * جلب جدول الأوقات المتاحة لشركة
 * GET /availability/company/:id
 */
async function getCompanyAvailability(req, res) {
  try {
    const availability = await availabilityService.getAvailability(req.params.id);
    if (!availability) return res.status(404).json({ success: false, message: 'لا يوجد جدول متاح' });
    res.json({ success: true, data: availability });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * جلب الفترات المتاحة لتاريخ معين
 * GET /availability/slots?companyId=...&date=...
 */
async function getSlots(req, res) {
  try {
    const { companyId, date } = req.query;
    if (!companyId || !date) {
      return res.status(400).json({ success: false, message: 'companyId و date مطلوبان' });
    }
    const slots = await availabilityService.getAvailableSlotsWithBookings(companyId, new Date(date));
    res.json({ success: true, data: slots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * تعديل الجدول
 * PUT /availability/:id
 */
async function updateAvailability(req, res) {
  try {
    const companyId = req.user._id;
    const availability = await availabilityService.setAvailability(companyId, req.body);
    res.json({ success: true, data: availability });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * إضافة استثناء (إجازة أو وقت غير متاح)
 * POST /availability/exceptions
 */
async function addException(req, res) {
  try {
    const companyId = req.user._id;
    const availability = await availabilityService.addException(companyId, req.body);
    res.json({ success: true, data: availability });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * حذف استثناء
 * DELETE /availability/exceptions?date=...
 */
async function removeException(req, res) {
  try {
    const companyId = req.user._id;
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'date مطلوب' });
    const availability = await availabilityService.removeException(companyId, new Date(date));
    res.json({ success: true, data: availability });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

module.exports = {
  setAvailability,
  getCompanyAvailability,
  getSlots,
  updateAvailability,
  updateSlotDuration,
  addException,
  removeException,
};
