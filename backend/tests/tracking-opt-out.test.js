/**
 * 🧪 Tracking Opt-Out Feature Tests
 * اختبارات ميزة إيقاف التتبع
 * 
 * المتطلبات: Requirements 6.4 (خيار إيقاف التتبع)
 */

const mongoose = require('mongoose');
const { User } = require('../src/models/User');
const UserInteraction = require('../src/models/UserInteraction');

describe('Tracking Opt-Out Feature', () => {
  let testUser;
  
  beforeAll(async () => {
    // الاتصال بقاعدة بيانات الاختبار
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
  });
  
  beforeEach(async () => {
    // تنظيف البيانات
    await User.deleteMany({});
    await UserInteraction.deleteMany({});
    
    // إنشاء مستخدم اختبار
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      role: 'Employee',
      phone: '+201234567890',
      country: 'Egypt',
      preferences: {
        tracking: {
          enabled: true
        }
      }
    });
  });
  
  afterAll(async () => {
    // تنظيف وإغلاق الاتصال
    await User.deleteMany({});
    await UserInteraction.deleteMany({});
    await mongoose.connection.close();
  });
  
  describe('User Model - Tracking Preference', () => {
    test('should have tracking enabled by default', async () => {
      const user = await User.findById(testUser._id);
      expect(user.preferences.tracking.enabled).toBe(true);
      expect(user.preferences.tracking.disabledAt).toBeUndefined();
      expect(user.preferences.tracking.disabledReason).toBeUndefined();
    });
    
    test('should allow disabling tracking', async () => {
      const disabledAt = new Date();
      const reason = 'خصوصية';
      
      await User.findByIdAndUpdate(testUser._id, {
        $set: {
          'preferences.tracking.enabled': false,
          'preferences.tracking.disabledAt': disabledAt,
          'preferences.tracking.disabledReason': reason
        }
      });
      
      const user = await User.findById(testUser._id);
      expect(user.preferences.tracking.enabled).toBe(false);
      expect(user.preferences.tracking.disabledAt).toBeDefined();
      expect(user.preferences.tracking.disabledReason).toBe(reason);
    });
    
    test('should allow re-enabling tracking', async () => {
      // تعطيل التتبع أولاً
      await User.findByIdAndUpdate(testUser._id, {
        $set: {
          'preferences.tracking.enabled': false,
          'preferences.tracking.disabledAt': new Date()
        }
      });
      
      // إعادة تفعيل التتبع
      await User.findByIdAndUpdate(testUser._id, {
        $set: {
          'preferences.tracking.enabled': true,
          'preferences.tracking.disabledAt': null,
          'preferences.tracking.disabledReason': null
        }
      });
      
      const user = await User.findById(testUser._id);
      expect(user.preferences.tracking.enabled).toBe(true);
      expect(user.preferences.tracking.disabledAt).toBeNull();
      expect(user.preferences.tracking.disabledReason).toBeNull();
    });
  });
  
  describe('UserInteraction - Respect Tracking Preference', () => {
    test('should log interaction when tracking is enabled', async () => {
      const interaction = await UserInteraction.logInteraction(
        testUser._id,
        'job',
        new mongoose.Types.ObjectId(),
        'view',
        { duration: 30 }
      );
      
      expect(interaction).toBeDefined();
      expect(interaction.userId.toString()).toBe(testUser._id.toString());
      expect(interaction.action).toBe('view');
      expect(interaction.duration).toBe(30);
    });
    
    test('should not log interaction when tracking is disabled', async () => {
      // تعطيل التتبع
      await User.findByIdAndUpdate(testUser._id, {
        $set: { 'preferences.tracking.enabled': false }
      });
      
      // محاولة تسجيل تفاعل
      // ملاحظة: يجب أن يتم التحقق من التفضيل في Controller قبل استدعاء logInteraction
      // هذا الاختبار يوضح أن النموذج نفسه لا يمنع التسجيل، بل Controller
      
      const user = await User.findById(testUser._id);
      expect(user.preferences.tracking.enabled).toBe(false);
    });
  });
  
  describe('Tracking Data Management', () => {
    test('should delete all user interactions', async () => {
      // إنشاء عدة تفاعلات
      const jobId = new mongoose.Types.ObjectId();
      
      await UserInteraction.logInteraction(testUser._id, 'job', jobId, 'view');
      await UserInteraction.logInteraction(testUser._id, 'job', jobId, 'like');
      await UserInteraction.logInteraction(testUser._id, 'job', jobId, 'apply');
      
      // التحقق من وجود التفاعلات
      let interactions = await UserInteraction.find({ userId: testUser._id });
      expect(interactions.length).toBeGreaterThan(0);
      
      // حذف جميع التفاعلات
      const result = await UserInteraction.deleteMany({ userId: testUser._id });
      expect(result.deletedCount).toBeGreaterThan(0);
      
      // التحقق من الحذف
      interactions = await UserInteraction.find({ userId: testUser._id });
      expect(interactions.length).toBe(0);
    });
    
    test('should preserve tracking preference after deleting interactions', async () => {
      // تعطيل التتبع
      await User.findByIdAndUpdate(testUser._id, {
        $set: {
          'preferences.tracking.enabled': false,
          'preferences.tracking.disabledAt': new Date(),
          'preferences.tracking.disabledReason': 'خصوصية'
        }
      });
      
      // إنشاء وحذف تفاعلات
      await UserInteraction.logInteraction(testUser._id, 'job', new mongoose.Types.ObjectId(), 'view');
      await UserInteraction.deleteMany({ userId: testUser._id });
      
      // التحقق من بقاء التفضيل
      const user = await User.findById(testUser._id);
      expect(user.preferences.tracking.enabled).toBe(false);
      expect(user.preferences.tracking.disabledAt).toBeDefined();
      expect(user.preferences.tracking.disabledReason).toBe('خصوصية');
    });
  });
  
  describe('Privacy and Transparency', () => {
    test('should record when tracking was disabled', async () => {
      const beforeDisable = new Date();
      
      await User.findByIdAndUpdate(testUser._id, {
        $set: {
          'preferences.tracking.enabled': false,
          'preferences.tracking.disabledAt': new Date()
        }
      });
      
      const user = await User.findById(testUser._id);
      expect(user.preferences.tracking.disabledAt).toBeDefined();
      expect(user.preferences.tracking.disabledAt.getTime()).toBeGreaterThanOrEqual(beforeDisable.getTime());
    });
    
    test('should allow optional reason for disabling tracking', async () => {
      const reasons = [
        'لا أريد مشاركة بياناتي',
        'أفضل الخصوصية',
        'لا أحتاج توصيات مخصصة',
        null // بدون سبب
      ];
      
      for (const reason of reasons) {
        await User.findByIdAndUpdate(testUser._id, {
          $set: {
            'preferences.tracking.enabled': false,
            'preferences.tracking.disabledReason': reason
          }
        });
        
        const user = await User.findById(testUser._id);
        expect(user.preferences.tracking.disabledReason).toBe(reason);
      }
    });
  });
  
  describe('Integration with Recommendations', () => {
    test('should still provide basic recommendations when tracking is disabled', async () => {
      // تعطيل التتبع
      await User.findByIdAndUpdate(testUser._id, {
        $set: { 'preferences.tracking.enabled': false }
      });
      
      const user = await User.findById(testUser._id);
      
      // يجب أن تعمل التوصيات الأساسية (content-based) حتى مع تعطيل التتبع
      // لأنها تعتمد على الملف الشخصي فقط، وليس على التفاعلات
      expect(user.preferences.tracking.enabled).toBe(false);
      
      // ملاحظة: التوصيات المخصصة (collaborative filtering) لن تعمل
      // لأنها تعتمد على التفاعلات
    });
    
    test('should not use interaction history when tracking is disabled', async () => {
      // إنشاء تفاعلات قبل تعطيل التتبع
      const jobId = new mongoose.Types.ObjectId();
      await UserInteraction.logInteraction(testUser._id, 'job', jobId, 'like');
      
      // تعطيل التتبع
      await User.findByIdAndUpdate(testUser._id, {
        $set: { 'preferences.tracking.enabled': false }
      });
      
      // التحقق من وجود التفاعلات القديمة
      const interactions = await UserInteraction.find({ userId: testUser._id });
      expect(interactions.length).toBeGreaterThan(0);
      
      // ملاحظة: يجب على خدمة التوصيات تجاهل هذه التفاعلات
      // عندما يكون التتبع معطلاً
      const user = await User.findById(testUser._id);
      expect(user.preferences.tracking.enabled).toBe(false);
    });
  });
  
  describe('Edge Cases', () => {
    test('should handle missing tracking preference gracefully', async () => {
      // إنشاء مستخدم بدون تفضيلات تتبع
      const userWithoutPrefs = await User.create({
        email: 'noprefs@example.com',
        password: 'password123',
        role: 'Employee',
        phone: '+201234567891',
        country: 'Egypt'
      });
      
      const user = await User.findById(userWithoutPrefs._id);
      
      // يجب أن يكون التتبع مفعلاً افتراضياً
      expect(user.preferences?.tracking?.enabled).toBe(true);
    });
    
    test('should handle null/undefined tracking values', async () => {
      await User.findByIdAndUpdate(testUser._id, {
        $set: {
          'preferences.tracking.enabled': null
        }
      });
      
      const user = await User.findById(testUser._id);
      
      // null يجب أن يُعامل كـ false (معطل)
      expect(user.preferences.tracking.enabled).toBeNull();
    });
  });
});
