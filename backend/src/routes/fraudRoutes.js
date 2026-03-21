const express = require('express');
const router = express.Router();
const fraudController = require('../controllers/fraudController');
const { auth, checkRole } = require('../middleware/auth');

// فحص الاحتيال (للنظام الداخلي)
router.post('/check', auth, fraudController.checkFraud);

// جلب الإحالات المشبوهة مع pagination وفلترة (للأدمن فقط)
// GET /fraud/suspicious?page=1&limit=20&status=suspicious|blocked|clean|all&minScore=40&maxScore=100
router.get('/suspicious', auth, checkRole('admin', 'Admin'), fraudController.getSuspiciousReferrals);

// تفاصيل فحص احتيال واحد (للأدمن فقط)
// GET /fraud/suspicious/:id
router.get('/suspicious/:id', auth, checkRole('admin', 'Admin'), fraudController.getSuspiciousById);

// مراجعة إحالة (قبول/رفض) - Requirements: 6.4, 6.5
router.post('/review/:referralId', auth, checkRole('admin', 'Admin'), fraudController.reviewReferral);

// وضع علامة مشبوهة (للأدمن فقط)
router.post('/flag', auth, checkRole('admin', 'Admin'), fraudController.flagUser);

// حظر مستخدم (للأدمن فقط) - Requirements: 6.5
router.post('/block', auth, checkRole('admin', 'Admin'), fraudController.blockUser);
router.post('/block/:userId', auth, checkRole('admin', 'Admin'), fraudController.blockUser);

// رفع الحظر عن مستخدم (للأدمن فقط) - Requirements: 6.5
router.post('/unblock/:userId', auth, checkRole('admin', 'Admin'), fraudController.unblockUser);

// إلغاء مكافآت إحالة (للأدمن فقط) - Requirements: 6.5
router.post('/revoke-rewards/user/:userId', auth, checkRole('admin', 'Admin'), fraudController.revokeAllUserRewards);
router.post('/revoke-rewards/:referralId', auth, checkRole('admin', 'Admin'), fraudController.revokeRewards);

// إحصائيات الاحتيال (للأدمن فقط) - Requirements: 6.4
router.get('/stats', auth, checkRole('admin', 'Admin'), fraudController.getFraudStats);

module.exports = router;
