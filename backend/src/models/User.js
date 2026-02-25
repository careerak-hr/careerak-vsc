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
  country: { type: String, required: true, default: 'Egypt' },
  city: { type: String },
  profileImage: String,
  privacyAccepted: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  otp: {
    code: String,
    expiresAt: Date,
    method: { type: String, enum: ['whatsapp', 'email'] }
  },
  isSpecialNeeds: { type: Boolean, default: false },
  specialNeedsType: {
    type: String,
    enum: ['none', 'visual', 'auditory', 'physical', 'ultimate', 'illiterate'],
    default: 'none'
  },
  // إحصائيات التقييمات
  reviewStats: {
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0, min: 0 },
    ratingDistribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 }
    }
  },
  // حسابات OAuth المرتبطة
  oauthAccounts: [{
    provider: { type: String, enum: ['google', 'facebook', 'linkedin'] },
    providerId: String,
    email: String,
    connectedAt: { type: Date, default: Date.now }
  }],
  // قوة كلمة المرور
  passwordStrength: {
    score: { type: Number, min: 0, max: 4, default: 0 },
    label: { type: String, enum: ['none', 'weak', 'fair', 'good', 'strong'], default: 'none' }
  },
  // تأكيد البريد الإلكتروني
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  // المصادقة الثنائية
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,
  backupCodes: [String], // رموز احتياطية مشفرة
  // تقدم التسجيل
  registrationProgress: {
    step: { type: Number, min: 1, max: 4, default: 1 },
    completed: { type: Boolean, default: false },
    lastSaved: Date,
    data: mongoose.Schema.Types.Mixed
  },
  // تفضيلات المستخدم (User Preferences)
  preferences: {
    theme: { 
      type: String, 
      enum: ['light', 'dark', 'system'], 
      default: 'system' 
    },
    language: { 
      type: String, 
      enum: ['ar', 'en', 'fr'], 
      default: 'ar' 
    },
    notifications: {
      enabled: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    accessibility: {
      reducedMotion: { type: Boolean, default: false },
      highContrast: { type: Boolean, default: false },
      fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' }
    }
  },
  // حالة الحساب (Account Status)
  accountDisabled: { type: Boolean, default: false },
  accountDisabledAt: Date,
  accountDisabledReason: String,
  accountDisabledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
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

const User = mongoose.models.User || mongoose.model('User', userSchema);

// --- تطوير نموذج الأفراد المتطور (Comprehensive Employee Schema) ---
const IndividualSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  birthDate: { type: Date },

  // بيانات السكن والحياة الاجتماعية
  permanentAddress: String,
  temporaryAddress: String,
  socialStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed'] },
  hasChildren: { type: Boolean, default: false },

  // الحالة الصحية
  healthStatus: {
    hasChronicDiseases: { type: Boolean, default: false },
    chronicDetails: String,
    hasSkinDiseases: { type: Boolean, default: false },
    skinDetails: String,
    hasInfectiousDiseases: { type: Boolean, default: false },
    infectiousDetails: String,
    otherHealthNotes: String
  },

  // حالة الجيش (للذكور)
  militaryStatus: { type: String, enum: ['exempt', 'performed', 'paid', 'postponed', 'in_service', 'none'] },

  // المسيرة التعليمية (Unlimited)
  educationList: [{
    level: String, // مرحلة
    degree: String, // درجة
    institution: String, // جهة
    city: String,
    country: String,
    year: String,
    grade: String
  }],

  // المسيرة المهنية (Unlimited)
  experienceList: [{
    company: String,
    position: String,
    from: Date,
    to: Date,
    tasks: String,
    workType: { type: String, enum: ['field', 'admin', 'technical'] },
    jobLevel: String,
    reasonForLeaving: String,
    country: String,
    city: String
  }],

  // المسيرة التدريبية (Unlimited)
  trainingList: [{
    courseName: String,
    provider: String,
    content: String,
    country: String,
    city: String,
    hasCertificate: { type: Boolean, default: true }
  }],

  // اللغات
  languages: [{
    language: String,
    proficiency: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'native'] }
  }],

  // مهارات الحاسوب والبرامج
  computerSkills: [{
    skill: String,
    proficiency: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] }
  }],
  softwareSkills: [{
    software: String,
    proficiency: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] }
  }],

  // مهارات أخرى
  otherSkills: [String],

  specialization: { type: String },
  interests: [{ type: String }],
  bio: String,
  cvFile: String // Base64 or URL
});

const Individual = mongoose.models.Employee || User.discriminator('Employee', IndividualSchema);

// --- تطوير نموذج الشركات (HR) ---
const CompanySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  companyIndustry: { type: String, required: true },
  subIndustry: { type: String },
  companyKeywords: [{ type: String }]
});

const Company = mongoose.models.HR || User.discriminator('HR', CompanySchema);

module.exports = { User, Individual, Company };
