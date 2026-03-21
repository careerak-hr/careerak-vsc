const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/certificateManagementController');

// multer - memory storage for Cloudinary upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Templates
router.get('/templates', protect, ctrl.getTemplates);
router.post('/templates', protect, ctrl.createTemplate);
router.put('/templates/:id', protect, ctrl.updateTemplate);
router.post('/templates/:id/signature', protect, upload.single('signature'), ctrl.uploadSignature);

// Issued certificates
router.get('/issued', protect, ctrl.getIssuedCertificates);
router.get('/stats', protect, ctrl.getIssuedStats);

module.exports = router;
