const express = require('express');
const router = express.Router();
const interviewNoteController = require('../controllers/interviewNoteController');
const { protect } = require('../middleware/auth');

/**
 * Interview Note Routes
 * مسارات ملاحظات وتقييم المقابلات
 * 
 * Requirements: 8.4, 8.5
 */

// جميع المسارات تحتاج authentication
router.use(protect);

// إنشاء ملاحظة جديدة
router.post('/', interviewNoteController.createNote);

// الحصول على ملاحظات المُقيّم
router.get('/my-notes', interviewNoteController.getMyNotes);

// الحصول على إحصائيات التقييمات
router.get('/stats/overview', interviewNoteController.getStats);

// الحصول على جميع ملاحظات مقابلة
router.get('/interview/:interviewId', interviewNoteController.getInterviewNotes);

// الحصول على جميع ملاحظات مرشح
router.get('/candidate/:candidateId', interviewNoteController.getCandidateNotes);

// الحصول على ملاحظة واحدة
router.get('/:id', interviewNoteController.getNote);

// تحديث ملاحظة
router.put('/:id', interviewNoteController.updateNote);

// حذف ملاحظة
router.delete('/:id', interviewNoteController.deleteNote);

module.exports = router;
