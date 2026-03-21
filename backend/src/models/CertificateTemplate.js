const mongoose = require('mongoose');

const certificateTemplateSchema = new mongoose.Schema({
  // المدرب/مقدم الدورة المالك للقالب
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // اسم القالب
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'Default Template'
  },

  // الألوان
  colors: {
    primary: { type: String, default: '#304B60' },
    secondary: { type: String, default: '#E3DAD1' },
    accent: { type: String, default: '#D48161' },
    text: { type: String, default: '#304B60' },
    background: { type: String, default: '#FFFFFF' }
  },

  // التخطيط
  layout: {
    type: String,
    enum: ['classic', 'modern', 'minimal'],
    default: 'classic'
  },

  // موضع الشعار
  logoPosition: {
    type: String,
    enum: ['top-left', 'top-center', 'top-right', 'none'],
    default: 'top-center'
  },

  // عناصر مرئية (إظهار/إخفاء)
  elements: {
    showLogo: { type: Boolean, default: true },
    showSignature: { type: Boolean, default: true },
    showQRCode: { type: Boolean, default: true },
    showBorder: { type: Boolean, default: true },
    showDate: { type: Boolean, default: true },
    showCourseCategory: { type: Boolean, default: false }
  },

  // التوقيع الرقمي
  signature: {
    imageUrl: { type: String, default: null },
    name: { type: String, default: '' },
    title: { type: String, default: '' }
  },

  // هل هذا القالب الافتراضي للمدرب
  isDefault: {
    type: Boolean,
    default: false
  },

  // الدورة المرتبطة (اختياري - null يعني لجميع الدورات)
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EducationalCourse',
    default: null
  }
}, {
  timestamps: true
});

certificateTemplateSchema.index({ instructorId: 1, isDefault: 1 });
certificateTemplateSchema.index({ instructorId: 1, courseId: 1 });

module.exports = mongoose.model('CertificateTemplate', certificateTemplateSchema);
