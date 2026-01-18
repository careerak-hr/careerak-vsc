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
  selectedCountry: { type: Object }, // جعلته اختيارياً لسهولة التجربة
  profileImage: String,
  privacyAccepted: { type: Boolean, default: true },
  
  isVerified: { type: Boolean, default: false },
  verificationCode: String,
  verificationExpires: Date,

  bio: String,
  website: String,
  isSpecialNeeds: { type: Boolean, default: false },
  specialNeedsType: { type: String, default: 'none' }
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

// تحديث موديل الأفراد ليتطابق مع الحقول المرسلة
const Individual = User.discriminator('Employee', new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String },
  dob: { type: String }, // تم التغيير من birthDate إلى dob
  education: String,
  skills: String,
  experience: String,
  cvFile: String
}));

// تحديث موديل الشركات ليتطابق مع الحقول المرسلة
const Company = User.discriminator('HR', new mongoose.Schema({
  companyName: { type: String, required: true },
  companyIndustry: String, // تم التغيير من companyField
  authorizedPersonName: String, // تم التغيير من authorizedPerson
  authorizedPersonJob: String,  // تم التغيير من authorizedPosition
  commercialRegister: String,
  employeesCount: String
}));

module.exports = { User, Individual, Company };
