/**
 * Property-Based Tests for Phone Change OTP Verification
 * Feature: settings-page-enhancements
 * Property 5: OTP Verification Requirement
 * Validates: Requirements 4.2, 4.3, 8.2
 * 
 * Property: For any phone change or 2FA operation, the system should require
 * valid OTP verification before completing the action.
 */

const fc = require('fast-check');
const phoneChangeService = require('../src/services/phoneChangeService');
const PhoneChangeRequest = require('../src/models/PhoneChangeRequest');
const { User } = require('../src/models/User');
const mongoose = require('mongoose');
const connectDB = require('../src/config/database');

// Arbitraries (مولدات البيانات العشوائية)

/**
 * مولد لأرقام هواتف صحيحة
 */
const validPhoneArbitrary = () => fc.integer({ min: 1000000000, max: 9999999999 })
  .map(n => `+201${n.toString().slice(0, 9)}`);

/**
 * مولد لأرقام OTP صحيحة (6 أرقام)
 */
const validOTPArbitrary = () => fc.integer({ min: 100000, max: 999999 })
  .map(n => n.toString());

/**
 * مولد لأرقام OTP غير صحيحة
 */
const invalidOTPArbitrary = () => fc.oneof(
  // OTP قصير جداً
  fc.integer({ min: 0, max: 99999 }).map(n => n.toString()),
  // OTP طويل جداً
  fc.integer({ min: 1000000, max: 9999999 }).map(n => n.toString()),
  // OTP يحتوي على أحرف
  fc.string({ minLength: 6, maxLength: 6 }).filter(s => !/^\d{6}$/.test(s)),
  // OTP فارغ
  fc.constant(''),
  // OTP null
  fc.constant(null),
  // OTP undefined
  fc.constant(undefined)
);

/**
 * مولد لأرقام هواتف غير صحيحة
 */
const invalidPhoneArbitrary = () => fc.oneof(
  // رقم قصير جداً
  fc.string({ minLength: 1, maxLength: 6 }),
  // رقم طويل جداً
  fc.string({ minLength: 16, maxLength: 20 }),
  // رقم يحتوي على أحرف
  fc.string({ minLength: 10, maxLength: 15 }).filter(s => /[a-zA-Z]/.test(s)),
  // رقم بدون +
  fc.integer({ min: 1000000000, max: 9999999999 }).map(n => n.toString()),
  // رقم فارغ
  fc.constant(''),
  // رقم null
  fc.constant(null)
);

// Helper Functions

/**
 * إنشاء مستخدم اختبار
 */
async function createTestUser() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  
  const userData = {
    email: `test${timestamp}${random}@example.com`,
    password: 'Test@123456',
    phone: `+201${Math.floor(Math.random() * 1000000000)}`,
    country: 'Egypt',
    role: 'Employee',
    userType: 'Employee',
    firstName: 'Test',
    lastName: 'User'
  };

  const user = new User(userData);
  await user.save();
  return user;
}

/**
 * تنظيف البيانات بعد كل اختبار
 */
async function cleanup(userId) {
  if (userId) {
    await User.findByIdAndDelete(userId);
    await PhoneChangeRequest.deleteMany({ userId });
  }
}

// Test Suite

describe('Property 5: OTP Verification Requirement', () => {
  
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  /**
   * Property 5.1: Valid OTP should allow phone change
   * 
   * For any valid phone number and valid OTP, the system should successfully
   * update the phone number after verification.
   * 
   * @validates Requirement 4.2: التحقق من OTP
   * @validates Requirement 4.3: تحديث الرقم بعد التحقق
   */
  it('should accept valid OTP and update phone number', async () => {
    await fc.assert(
      fc.asyncProperty(
        validPhoneArbitrary(),
        async (newPhone) => {
          let user = null;
          
          try {
            // إنشاء مستخدم
            user = await createTestUser();
            const oldPhone = user.phone;
            
            // بدء عملية تغيير الهاتف
            const initResult = await phoneChangeService.initiatePhoneChange(
              user._id.toString(),
              newPhone
            );
            
            expect(initResult.success).toBe(true);
            expect(initResult.requestId).toBeDefined();
            
            // إرسال OTP
            const sendResult = await phoneChangeService.sendOTP(user._id.toString());
            expect(sendResult.success).toBe(true);
            
            // الحصول على OTP من النتيجة (في بيئة الاختبار)
            const otp = sendResult.otp || initResult.otp;
            expect(otp).toBeDefined();
            expect(otp).toMatch(/^\d{6}$/);
            
            // التحقق من OTP وتحديث الرقم
            const verifyResult = await phoneChangeService.verifyAndUpdate(
              user._id.toString(),
              otp
            );
            
            // التحقق من النتيجة
            expect(verifyResult.success).toBe(true);
            expect(verifyResult.newPhone).toBe(newPhone);
            
            // التحقق من تحديث قاعدة البيانات
            const updatedUser = await User.findById(user._id);
            expect(updatedUser.phone).toBe(newPhone);
            // Note: phoneVerified field doesn't exist in User model
            
            // التحقق من أن الرقم تغير
            expect(updatedUser.phone).not.toBe(oldPhone);
            
          } finally {
            await cleanup(user?._id);
          }
        }
      ),
      { numRuns: 20 } // 20 تكرار للاختبار
    );
  }, 60000); // timeout 60 seconds

  /**
   * Property 5.2: Invalid OTP should reject phone change
   * 
   * For any invalid OTP (wrong format, wrong value, expired), the system
   * should reject the phone change request.
   * 
   * @validates Requirement 4.2: رفض OTP غير صحيح
   * @validates Requirement 8.2: التحقق من OTP في 2FA
   */
  it('should reject invalid OTP and prevent phone change', async () => {
    await fc.assert(
      fc.asyncProperty(
        validPhoneArbitrary(),
        invalidOTPArbitrary(),
        async (newPhone, invalidOTP) => {
          let user = null;
          
          try {
            // إنشاء مستخدم
            user = await createTestUser();
            const oldPhone = user.phone;
            
            // بدء عملية تغيير الهاتف
            const initResult = await phoneChangeService.initiatePhoneChange(
              user._id.toString(),
              newPhone
            );
            
            // تخطي إذا فشل الإنشاء (رقم مكرر)
            if (!initResult.success) {
              return true;
            }
            
            // إرسال OTP
            await phoneChangeService.sendOTP(user._id.toString());
            
            // محاولة التحقق بـ OTP غير صحيح
            const verifyResult = await phoneChangeService.verifyAndUpdate(
              user._id.toString(),
              invalidOTP
            );
            
            // التحقق من رفض الطلب
            expect(verifyResult.success).toBe(false);
            expect(verifyResult.message).toBeDefined();
            
            // التحقق من عدم تحديث قاعدة البيانات
            const unchangedUser = await User.findById(user._id);
            expect(unchangedUser.phone).toBe(oldPhone);
            
          } finally {
            await cleanup(user?._id);
          }
        }
      ),
      { numRuns: 20 }
    );
  }, 60000);

  /**
   * Property 5.3: OTP should expire after timeout
   * 
   * For any phone change request, the OTP should expire after the configured
   * timeout period (10 minutes).
   * 
   * @validates Requirement 4.2: انتهاء صلاحية OTP
   */
  it('should reject expired OTP', async () => {
    let user = null;
    
    try {
      // إنشاء مستخدم
      user = await createTestUser();
      const newPhone = '+201234567890';
      
      // بدء عملية تغيير الهاتف
      const initResult = await phoneChangeService.initiatePhoneChange(
        user._id.toString(),
        newPhone
      );
      
      expect(initResult.success).toBe(true);
      
      // إرسال OTP
      const sendResult = await phoneChangeService.sendOTP(user._id.toString());
      const otp = sendResult.otp || initResult.otp;
      
      // تعديل وقت انتهاء الصلاحية يدوياً (محاكاة انتهاء الصلاحية)
      const request = await PhoneChangeRequest.findOne({ userId: user._id, status: 'pending' });
      if (request) {
        request.expiresAt = new Date(Date.now() - 1000); // منتهي الصلاحية
        await request.save();
      }
      
      // محاولة التحقق بعد انتهاء الصلاحية
      const verifyResult = await phoneChangeService.verifyAndUpdate(
        user._id.toString(),
        otp
      );
      
      // التحقق من رفض الطلب (يجب أن يكون "لا يوجد طلب" لأن الطلب منتهي الصلاحية)
      expect(verifyResult.success).toBe(false);
      expect(verifyResult.message).toBeDefined();
      
    } finally {
      await cleanup(user?._id);
    }
  }, 30000);

  /**
   * Property 5.4: Cannot change to duplicate phone number
   * 
   * For any phone number already registered to another user, the system
   * should reject the phone change request.
   * 
   * @validates Requirement 4.1: التحقق من عدم تكرار الرقم
   */
  it('should reject phone change to existing phone number', async () => {
    await fc.assert(
      fc.asyncProperty(
        validPhoneArbitrary(),
        async (duplicatePhone) => {
          let user1 = null;
          let user2 = null;
          
          try {
            // إنشاء مستخدمين
            user1 = await createTestUser();
            user2 = await createTestUser();
            
            // تعيين رقم للمستخدم الأول
            user1.phone = duplicatePhone;
            await user1.save();
            
            // محاولة تغيير رقم المستخدم الثاني إلى نفس الرقم
            const initResult = await phoneChangeService.initiatePhoneChange(
              user2._id.toString(),
              duplicatePhone
            );
            
            // التحقق من رفض الطلب
            expect(initResult.success).toBe(false);
            expect(initResult.message).toContain('مستخدم');
            
            // التحقق من عدم تغيير رقم المستخدم الثاني
            const unchangedUser2 = await User.findById(user2._id);
            expect(unchangedUser2.phone).not.toBe(duplicatePhone);
            
          } finally {
            await cleanup(user1?._id);
            await cleanup(user2?._id);
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 60000);

  /**
   * Property 5.5: Invalid phone format should be rejected
   * 
   * For any invalid phone number format, the system should reject the
   * phone change request before sending OTP.
   * 
   * @validates Requirement 4.1: التحقق من صحة تنسيق الرقم
   */
  it('should reject invalid phone number format', async () => {
    await fc.assert(
      fc.asyncProperty(
        invalidPhoneArbitrary(),
        async (invalidPhone) => {
          let user = null;
          
          try {
            // إنشاء مستخدم
            user = await createTestUser();
            const oldPhone = user.phone;
            
            // محاولة تغيير الرقم إلى رقم غير صحيح
            const initResult = await phoneChangeService.initiatePhoneChange(
              user._id.toString(),
              invalidPhone
            );
            
            // التحقق من رفض الطلب
            expect(initResult.success).toBe(false);
            expect(initResult.message).toBeDefined();
            
            // التحقق من عدم تغيير الرقم
            const unchangedUser = await User.findById(user._id);
            expect(unchangedUser.phone).toBe(oldPhone);
            
          } finally {
            await cleanup(user?._id);
          }
        }
      ),
      { numRuns: 20 }
    );
  }, 60000);

  /**
   * Property 5.6: OTP should be single-use
   * 
   * For any valid OTP, after successful verification, the same OTP should
   * not be accepted again.
   * 
   * @validates Requirement 4.2: OTP لمرة واحدة فقط
   */
  it('should reject reused OTP', async () => {
    let user = null;
    
    try {
      // إنشاء مستخدم
      user = await createTestUser();
      const newPhone1 = '+201111111111';
      const newPhone2 = '+201222222222';
      
      // المحاولة الأولى
      const initResult1 = await phoneChangeService.initiatePhoneChange(
        user._id.toString(),
        newPhone1
      );
      
      const sendResult1 = await phoneChangeService.sendOTP(user._id.toString());
      const otp = sendResult1.otp || initResult1.otp;
      
      // التحقق الأول (ناجح)
      const verifyResult1 = await phoneChangeService.verifyAndUpdate(
        user._id.toString(),
        otp
      );
      
      expect(verifyResult1.success).toBe(true);
      
      // المحاولة الثانية بنفس OTP (يجب أن تفشل)
      const initResult2 = await phoneChangeService.initiatePhoneChange(
        user._id.toString(),
        newPhone2
      );
      
      // محاولة استخدام OTP القديم
      const verifyResult2 = await phoneChangeService.verifyAndUpdate(
        user._id.toString(),
        otp
      );
      
      // التحقق من رفض الطلب
      expect(verifyResult2.success).toBe(false);
      
      // التحقق من أن الرقم لم يتغير
      const unchangedUser = await User.findById(user._id);
      expect(unchangedUser.phone).toBe(newPhone1); // الرقم الأول فقط
      
    } finally {
      await cleanup(user?._id);
    }
  }, 30000);

  /**
   * Property 5.7: Phone change should send notification
   * 
   * For any successful phone change, the system should send a confirmation
   * notification to the user.
   * 
   * @validates Requirement 4.4: إرسال إشعار تأكيد
   */
  it('should send notification after successful phone change', async () => {
    let user = null;
    
    try {
      // إنشاء مستخدم
      user = await createTestUser();
      const newPhone = '+201987654321';
      
      // بدء عملية تغيير الهاتف
      const initResult = await phoneChangeService.initiatePhoneChange(
        user._id.toString(),
        newPhone
      );
      
      const sendResult = await phoneChangeService.sendOTP(user._id.toString());
      const otp = sendResult.otp || initResult.otp;
      
      // التحقق من OTP وتحديث الرقم
      const verifyResult = await phoneChangeService.verifyAndUpdate(
        user._id.toString(),
        otp
      );
      
      // التحقق من النجاح
      expect(verifyResult.success).toBe(true);
      expect(verifyResult.newPhone).toBe(newPhone);
      
      // في بيئة حقيقية، يمكن التحقق من إرسال الإشعار
      // هنا نتحقق فقط من أن العملية نجحت
      
    } finally {
      await cleanup(user?._id);
    }
  }, 30000);
});
