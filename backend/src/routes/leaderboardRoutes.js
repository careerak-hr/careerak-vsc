const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getLeaderboard,
  getMyRank,
  updateVisibility,
  refreshLeaderboard
} = require('../controllers/leaderboardController');

// جميع المسارات تتطلب تسجيل الدخول
router.use(auth);

router.get('/', getLeaderboard);              // GET /leaderboard - لوحة المتصدرين
router.get('/my-rank', getMyRank);            // GET /leaderboard/my-rank - ترتيبي
router.put('/visibility', updateVisibility);  // PUT /leaderboard/visibility - إخفاء/إظهار
router.post('/refresh', refreshLeaderboard);  // POST /leaderboard/refresh - تحديث يدوي

module.exports = router;
