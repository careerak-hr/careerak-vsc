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
  location: { type: String, required: true },
  jobType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Temporary'], default: 'Full-time' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JobApplication' }],
  createdAt: { type: Date, default: Date.now }
});

// Indexes for performance optimization (admin dashboard queries)
jobPostingSchema.index({ createdAt: -1 }); // For time-based queries
jobPostingSchema.index({ status: 1, createdAt: -1 }); // For filtering by status
jobPostingSchema.index({ postedBy: 1, createdAt: -1 }); // For company's jobs
jobPostingSchema.index({ postingType: 1 }); // For filtering by type
jobPostingSchema.index({ title: 'text', description: 'text' }); // For text search

module.exports = mongoose.model('JobPosting', jobPostingSchema);
