const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

/**
 * مسارات المواعيد
 * 
 * Requirements: 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 5.5
 */

// جميع المسارات تتطلب مصادقة
router.use(protect);

// تصدير بيانات المقابلات (يجب أن يكون قبل /:id لتجنب التعارض)
router.post('/export', appointmentController.exportAppointments);

// إحصائيات المواعيد (يجب أن يكون قبل /:id لتجنب التعارض)
router.get('/stats', appointmentController.getStats);

// إنشاء موعد جديد (جدولة)
router.post('/', appointmentController.createAppointment);

// الحصول على قائمة المواعيد
router.get('/', appointmentController.getAppointments);

// الحصول على تفاصيل موعد
router.get('/:id', appointmentController.getAppointment);

// سجل تاريخ الموعد (الإلغاءات والتعديلات) - للقراءة فقط
router.get('/:id/history', appointmentController.getAppointmentHistory);

// الرد على موعد (قبول/رفض)
router.put('/:id/respond', appointmentController.respondToAppointment);

// إعادة جدولة موعد (PUT و POST كلاهما مدعومان)
router.put('/:id/reschedule', appointmentController.rescheduleAppointment);
router.post('/:id/reschedule', appointmentController.rescheduleAppointment);

// تأكيد موعد
router.put('/:id/confirm', appointmentController.confirmAppointment);

// إلغاء موعد (DELETE /appointments/:id)
router.delete('/:id', appointmentController.cancelAppointment);

// ==================== ملاحظات المواعيد ====================
// إضافة ملاحظة على موعد
router.post('/:id/notes', appointmentController.addNote);
// جلب ملاحظات موعد معين
router.get('/:id/notes', appointmentController.getNotes);

// ==================== تقييمات المواعيد ====================
// إضافة تقييم لموعد (بعد اكتماله فقط)
router.post('/:id/rating', appointmentController.addRating);
// جلب تقييم موعد معين
router.get('/:id/rating', appointmentController.getRating);

// ==================== الملاحظات الشخصية (User Story 7) ====================
// الملاحظات خاصة بالباحث فقط - لا تظهر للشركة
router.post('/:id/personal-notes', appointmentController.addPersonalNote);
router.get('/:id/personal-notes', appointmentController.getPersonalNotes);
router.put('/:id/personal-notes/:noteId', appointmentController.updatePersonalNote);
router.delete('/:id/personal-notes/:noteId', appointmentController.deletePersonalNote);

// ==================== معلومات الشركة (User Story 7) ====================
// روابط سريعة لمعلومات الشركة المرتبطة بالموعد
router.get('/:id/company-info', appointmentController.getCompanyInfo);

// ==================== حالة الحضور (KPI: معدل الحضور > 85%) ====================
// تحديث حالة الحضور بعد انتهاء الموعد (للشركة فقط)
router.patch('/:id/attendance', appointmentController.updateAttendance);

// ==================== مستندات الموعد (User Story 7) ====================
// رفع مستندات (CV محدث، Portfolio) - للمشاركين في الموعد فقط
const upload = require('../config/multer');
router.post('/:id/documents', upload.single('file'), appointmentController.uploadDocument);
router.get('/:id/documents', appointmentController.getDocuments);
router.delete('/:id/documents/:docId', appointmentController.deleteDocument);

module.exports = router;
