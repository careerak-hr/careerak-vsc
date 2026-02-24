const mongoose = require('mongoose');

/**
 * نموذج تتبع أجهزة تسجيل الدخول
 * يحفظ معلومات الأجهزة التي تم تسجيل الدخول منها
 */
const loginDeviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // معلومات الجهاز
  deviceInfo: {
    // معرف فريد للجهاز (fingerprint)
    deviceId: {
      type: String,
      required: true,
      index: true
    },
    
    // نوع الجهاز
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    },
    
    // نظام التشغيل
    os: {
      name: String,
      version: String
    },
    
    // المتصفح
    browser: {
      name: String,
      version: String
    },
    
    // User Agent الكامل
    userAgent: String
  },
  
  // معلومات الموقع
  location: {
    // عنوان IP
    ipAddress: {
      type: String,
      required: true
    },
    
    // الدولة
    country: String,
    
    // المدينة
    city: String,
    
    // الإحداثيات (اختياري)
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // حالة الجهاز
  status: {
    // هل الجهاز موثوق؟
    isTrusted: {
      type: Boolean,
      default: false
    },
    
    // هل تم إرسال تنبيه؟
    alertSent: {
      type: Boolean,
      default: false
    },
    
    // تاريخ إرسال التنبيه
    alertSentAt: Date
  },
  
  // تواريخ
  firstLoginAt: {
    type: Date,
    default: Date.now
  },
  
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  
  // عدد مرات تسجيل الدخول من هذا الجهاز
  loginCount: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Index مركب للبحث السريع
loginDeviceSchema.index({ userId: 1, 'deviceInfo.deviceId': 1 });
loginDeviceSchema.index({ userId: 1, 'location.ipAddress': 1 });

/**
 * تحديث آخر تسجيل دخول
 */
loginDeviceSchema.methods.updateLastLogin = async function() {
  this.lastLoginAt = new Date();
  this.loginCount += 1;
  await this.save();
};

/**
 * تحديد الجهاز كموثوق
 */
loginDeviceSchema.methods.markAsTrusted = async function() {
  this.status.isTrusted = true;
  await this.save();
};

/**
 * تحديد أن التنبيه تم إرساله
 */
loginDeviceSchema.methods.markAlertSent = async function() {
  this.status.alertSent = true;
  this.status.alertSentAt = new Date();
  await this.save();
};

/**
 * التحقق من أن الجهاز جديد (أول تسجيل دخول)
 */
loginDeviceSchema.methods.isNewDevice = function() {
  return this.loginCount === 1 && !this.status.isTrusted;
};

/**
 * الحصول على وصف مختصر للجهاز
 */
loginDeviceSchema.methods.getDeviceDescription = function() {
  const { browser, os, deviceType } = this.deviceInfo;
  const { city, country } = this.location;
  
  let description = '';
  
  // نوع الجهاز
  if (deviceType && deviceType !== 'unknown') {
    description += deviceType === 'mobile' ? 'هاتف محمول' : 
                   deviceType === 'tablet' ? 'جهاز لوحي' : 
                   'حاسوب';
  }
  
  // المتصفح
  if (browser && browser.name) {
    description += ` - ${browser.name}`;
    if (browser.version) {
      description += ` ${browser.version}`;
    }
  }
  
  // نظام التشغيل
  if (os && os.name) {
    description += ` على ${os.name}`;
    if (os.version) {
      description += ` ${os.version}`;
    }
  }
  
  // الموقع
  if (city || country) {
    description += ' من ';
    if (city) description += city;
    if (city && country) description += ', ';
    if (country) description += country;
  }
  
  return description || 'جهاز غير معروف';
};

const LoginDevice = mongoose.model('LoginDevice', loginDeviceSchema);

module.exports = LoginDevice;
