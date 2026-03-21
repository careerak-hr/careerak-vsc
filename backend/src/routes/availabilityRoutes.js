const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/availabilityController');

// جلب الفترات المتاحة (عام - للباحثين)
router.get('/slots', ctrl.getSlots);

// جلب جدول شركة (عام)
router.get('/company/:id', ctrl.getCompanyAvailability);

// إدارة الجدول (للشركات فقط)
router.post('/', protect, ctrl.setAvailability);
router.put('/:id', protect, ctrl.updateAvailability);
router.patch('/duration', protect, ctrl.updateSlotDuration);

// الاستثناءات
router.post('/exceptions', protect, ctrl.addException);
router.delete('/exceptions', protect, ctrl.removeException);

module.exports = router;
