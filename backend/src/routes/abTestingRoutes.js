/**
 * A/B Testing Routes
 */

const express = require('express');
const router = express.Router();
const abTestingController = require('../controllers/abTestingController');
const { protect } = require('../middleware/auth');

// جميع المسارات محمية
router.use(protect);

// إدارة التجارب (admin only)
router.post('/experiments', abTestingController.createExperiment);
router.get('/experiments', abTestingController.getAllExperiments);
router.get('/experiments/:id', abTestingController.getExperiment);
router.get('/experiments/:id/analysis', abTestingController.analyzeExperiment);
router.post('/experiments/:id/stop', abTestingController.stopExperiment);
router.delete('/experiments/:id', abTestingController.deleteExperiment);

// تتبع الأحداث (جميع المستخدمين)
router.post('/track/impression', abTestingController.trackImpression);
router.post('/track/click', abTestingController.trackClick);
router.post('/track/conversion', abTestingController.trackConversion);
router.post('/track/engagement', abTestingController.trackEngagement);

module.exports = router;
