const mongoose = require('mongoose');

const jobPostingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  requirements: { type: String, required: true },
  
  // نوع الإعلان الجديد والشامل
  postingType: {
    type: String,
    enum: [
      'Permanent Job',       // موظف دائم
      'Temporary/Lecturer',  // محاضر مؤقت / موظف مؤقت
      'Consultancy',         // استشاري
      'Practical Training',  // دورة تدريبية عملية
      'Online Course'        // دورة أونلاين
    ],
    default: 'Permanent Job'
  },
  
  priceType: {
    type: String,
    enum: ['Free', 'Paid', 'Salary Based'],
    default: 'Salary Based'
  },
  
  salary: { min: Number, max: Number },
  location: { 
    type: String, 
    required: true,
    city: String,
    country: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    }
  },
  jobType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Temporary'], default: 'Full-time' },
  
  // حقول إضافية للبحث المتقدم
  skills: [{ type: String, trim: true }],
  company: {
    name: { type: String, trim: true },
    size: { type: String, enum: ['Small', 'Medium', 'Large'] }
  },
  experienceLevel: { 
    type: String, 
    enum: ['Entry', 'Mid', 'Senior', 'Expert'],
    default: 'Entry'
  },
  
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JobApplication' }],
  createdAt: { type: Date, default: Date.now }
});

// Indexes for performance optimization
jobPostingSchema.index({ createdAt: -1 }); // For time-based queries
jobPostingSchema.index({ status: 1, createdAt: -1 }); // For filtering by status
jobPostingSchema.index({ postedBy: 1, createdAt: -1 }); // For company's jobs
jobPostingSchema.index({ postingType: 1 }); // For filtering by type

// Text index للبحث النصي المتقدم (يدعم العربية والإنجليزية)
jobPostingSchema.index({
  title: 'text',
  description: 'text',
  requirements: 'text',
  skills: 'text',
  'company.name': 'text'
}, {
  weights: {
    title: 10,           // أعلى وزن للعنوان
    skills: 5,           // وزن متوسط للمهارات
    'company.name': 3,   // وزن متوسط لاسم الشركة
    description: 2,      // وزن أقل للوصف
    requirements: 1      // أقل وزن للمتطلبات
  },
  default_language: 'none', // دعم جميع اللغات
  name: 'job_text_search'
});

// Compound indexes للفلاتر المتعددة
jobPostingSchema.index({ 'salary.min': 1, 'salary.max': 1 });
jobPostingSchema.index({ jobType: 1, experienceLevel: 1 });
jobPostingSchema.index({ skills: 1 });
jobPostingSchema.index({ 'company.size': 1 });

// Geo index للبحث الجغرافي
jobPostingSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('JobPosting', jobPostingSchema);
