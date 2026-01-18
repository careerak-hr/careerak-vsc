const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const baseOptions = {
  discriminatorKey: 'userType',
  collection: 'users',
  timestamps: true
};

const userSchema = new mongoose.Schema({
  email: { type: String, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['HR', 'Employee', 'Admin'], required: true },
  phone: { type: String, required: true, unique: true },

  // الموقع الجغرافي (رؤية م07)
  country: { type: String, required: true, default: 'Egypt' },
  city: { type: String },

  profileImage: String,
  privacyAccepted: { type: Boolean, default: true },
  
  isVerified: { type: Boolean, default: false },
  verificationCode: String,
  verificationExpires: Date,

  bio: String,
  website: String,

  // نظام الشمول الإنساني (رؤية م07)
  isSpecialNeeds: { type: Boolean, default: false },
  specialNeedsType: {
    type: String,
    enum: ['none', 'visual', 'auditory', 'physical', 'ultimate', 'illiterate'],
    default: 'none'
  }
}, baseOptions);

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// --- تطوير نموذج الأفراد (Employees) ---
const Individual = User.discriminator('Employee', new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String },
  dob: { type: String },

  // المستوى التعليمي والتخصص (رؤية م07)
  educationLevel: { type: String, required: true },
  specialization: { type: String },

  // نظام الربط الذكي
  interests: [{ type: String }], // الكلمات المفتاحية للاهتمامات

  skills: String,
  experience: String,
  cvFile: String
}));

// --- تطوير نموذج الشركات (HR) ---
const Company = User.discriminator('HR', new mongoose.Schema({
  companyName: { type: String, required: true },

  // تصنيف الشركات (رؤية م07)
  companyIndustry: { type: String, required: true },
  subIndustry: { type: String },

  // بيانات المسؤول
  authorizedPersonName: String,
  authorizedPersonJob: String,

  // بيانات رسمية
  commercialRegister: String,
  employeesCount: String,

  // نظام الربط الذكي
  companyKeywords: [{ type: String }] // الكلمات المفتاحية للبحث عن موظفين
}));

module.exports = { User, Individual, Company };
