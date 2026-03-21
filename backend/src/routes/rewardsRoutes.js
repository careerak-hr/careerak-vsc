const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getBalance, getHistory, getEarnedRewards, getOptions, previewRedemption, redeemPoints, getRedemptions, getActiveRedemptions, applyRedemption } = require('../controllers/rewardsController');

router.use(auth);

router.get('/balance', getBalance);
router.get('/history', getHistory);
router.get('/earned', getEarnedRewards);
router.get('/options', getOptions);
router.post('/redeem/preview', previewRedemption); // معاينة الاستبدال قبل التأكيد
router.post('/redeem', redeemPoints);
router.get('/redemptions', getRedemptions);
router.get('/active-redemptions', getActiveRedemptions); // الاستبدالات النشطة
router.post('/apply-redemption', applyRedemption); // تطبيق استبدال على عملية شراء

module.exports = router;
