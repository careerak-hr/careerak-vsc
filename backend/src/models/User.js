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

// ✅ منع إعادة تسجيل الموديل في بيئة Vercel
const User = mongoose.models.User || mongoose.model('User', userSchema);

// --- تطوير نموذج الأفراد (Employees) ---
const IndividualSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  educationLevel: { type: String, required: true },
  specialization: { type: String },
  interests: [{ type: String }]
});

const Individual = User.discriminators?.Employee || User.discriminator('Employee', IndividualSchema);

// --- تطوير نموذج الشركات (HR) ---
const CompanySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  companyIndustry: { type: String, required: true },
  subIndustry: { type: String },
  companyKeywords: [{ type: String }]
});

const Company = User.discriminators?.HR || User.discriminator('HR', CompanySchema);

module.exports = { User, Individual, Company };
