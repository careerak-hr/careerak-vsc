const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/reminderController');

router.use(protect);

router.post('/', ctrl.createReminder);
router.get('/', ctrl.getReminders);
router.put('/:id', ctrl.updateReminder);
router.delete('/:id', ctrl.deleteReminder);

module.exports = router;
