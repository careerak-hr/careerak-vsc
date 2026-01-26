const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const JobPosting = require('../models/JobPosting');
const JobApplication = require('../models/JobApplication');
const EducationalCourse = require('../models/EducationalCourse');
const TrainingCourse = require('../models/TrainingCourse');
const { auth } = require('../middleware/auth'); // التعديل هنا: إضافة الأقواس {}

// ميدل وير للتأكد أن المستخدم هو Admin فعلاً
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') return next();
  return res.status(403).json({ error: 'غير مسموح لك بالدخول هنا' });
};

// جلب إحصائيات عامة للنظام
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.countDocuments();
    const jobs = await JobPosting.countDocuments();
    const courses = await EducationalCourse.countDocuments() + await TrainingCourse.countDocuments();
    const applications = await JobApplication.countDocuments();
    res.json({ users, jobs, courses, applications });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب الإحصائيات' });
  }
});

// جلب كافة المستخدمين للتحكم بهم
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب المستخدمين' });
  }
});

// حذف أي مستخدم أو منشور
router.delete('/delete-user/:id', auth, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم حذف المستخدم بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'فشل حذف المستخدم' });
  }
});

module.exports = router;
