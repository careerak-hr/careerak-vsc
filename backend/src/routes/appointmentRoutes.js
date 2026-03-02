const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

/**
 * مسارات المواعيد
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

// جميع المسارات تتطلب مصادقة
router.use(protect);

// إنشاء موعد جديد (جدولة)
router.post('/', appointmentController.createAppointment);

// الحصول على قائمة المواعيد
router.get('/', appointmentController.getAppointments);

// الحصول على تفاصيل موعد
router.get('/:id', appointmentController.getAppointment);

// الرد على موعد (قبول/رفض)
router.put('/:id/respond', appointmentController.respondToAppointment);

// إعادة جدولة موعد
router.put('/:id/reschedule', appointmentController.rescheduleAppointment);

// تأكيد موعد
router.put('/:id/confirm', appointmentController.confirmAppointment);

// إلغاء موعد
router.delete('/:id', appointmentController.cancelAppointment);

module.exports = router;
