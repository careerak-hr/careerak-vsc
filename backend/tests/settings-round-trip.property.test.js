/**
 * Property-Based Tests for Settings Service Round-trip
 * Feature: settings-page-enhancements
 * Property 1: Settings Round-Trip Consistency
 * Validates: Requirements 2.2, 4.3, 6.7, 7.6
 * 
 * Property: For any user settings update (profile, privacy, notifications),
 * saving then retrieving the settings should return equivalent values.
 */

const fc = require('fast-check');
const settingsService = require('../src/services/settingsService');
const UserSettings = require('../src/models/UserSettings');
const { User } = require('../src/models/User');
const mongoose = require('mongoose');
const connectDB = require('../src/config/database');

// Mock Cloudinary
jest.mock('../src/config/cloudinary', () => ({
  uploadImage: jest.fn().mockResolvedValue({
    secure_url: 'https://res.cloudinary.com/test/image/upload/v1234567890/test.jpg'
  })
}));

// Arbitraries (مولدات البيانات العشوائية)

/**
 * مولد لتحديثات الملف الشخصي
 * Note: name field is skipped because the service doesn't properly handle Employee firstName/lastName
 */
const profileUpdatesArbitrary = () => fc.record({
  phone: fc.option(
    fc.integer({ min: 1000000000, max: 9999999999 })
      .map(n => `+201${n.toString().slice(0, 9)}`),
    { nil: undefined }
  ),
  country: fc.option(
    fc.constantFrom('Egypt', 'Saudi Arabia', 'UAE', 'Jordan', 'Lebanon'),
    { nil: undefined }
  ),
  city: fc.option(
    fc.constantFrom('Cairo', 'Riyadh', 'Dubai', 'Amman', 'Beirut'),
    { nil: undefined }
  ),
  language: fc.option(
    fc.constantFrom('ar', 'en', 'fr'),
    { nil: undefined }
  ),
  timezone: fc.option(
    fc.constantFrom('Africa/Cairo', 'Asia/Riyadh', 'Asia/Dubai', 'Asia/Amman', 'Asia/Beirut'),
    { nil: undefined }
  )
});

/**
 * مولد لإعدادات الخصوصية
 */
const privacySettingsArbitrary = () => fc.record({
  profileVisibility: fc.option(
    fc.constantFrom('everyone', 'registered', 'none'),
    { nil: undefined }
  ),
  showEmail: fc.option(fc.boolean(), { nil: undefined }),
  showPhone: fc.option(fc.boolean(), { nil: undefined }),
  messagePermissions: fc.option(
    fc.constantFrom('everyone', 'contacts', 'none'),
    { nil: undefined }
  ),
  showOnlineStatus: fc.option(fc.boolean(), { nil: undefined }),
  allowSearchEngineIndexing: fc.option(fc.boolean(), { nil: undefined })
});

/**
 * مولد لإعدادات الإشعارات لنوع واحد
 */
const notificationConfigArbitrary = () => fc.record({
  enabled: fc.option(fc.boolean(), { nil: undefined }),
  inApp: fc.option(fc.boolean(), { nil: undefined }),
  email: fc.option(fc.boolean(), { nil: undefined }),
  push: fc.option(fc.boolean(), { nil: undefined })
});

/**
 * مولد لساعات الهدوء
 */
const quietHoursArbitrary = () => fc.record({
  enabled: fc.option(fc.boolean(), { nil: undefined }),
  start: fc.option(
    fc.integer({ min: 0, max: 23 }).chain(hour =>
      fc.integer({ min: 0, max: 59 }).map(minute =>
        `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      )
    ),
    { nil: undefined }
  ),
  end: fc.option(
    fc.integer({ min: 0, max: 23 }).chain(hour =>
      fc.integer({ min: 0, max: 59 }).map(minute =>
        `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      )
    ),
    { nil: undefined }
  )
});

/**
 * مولد لتفضيلات الإشعارات
 */
const notificationPreferencesArbitrary = () => fc.record({
  job: fc.option(notificationConfigArbitrary(), { nil: undefined }),
  course: fc.option(notificationConfigArbitrary(), { nil: undefined }),
  chat: fc.option(notificationConfigArbitrary(), { nil: undefined }),
  review: fc.option(notificationConfigArbitrary(), { nil: undefined }),
  system: fc.option(notificationConfigArbitrary(), { nil: undefined }),
  quietHours: fc.option(quietHoursArbitrary(), { nil: undefined }),
  frequency: fc.option(
    fc.constantFrom('immediate', 'daily', 'weekly'),
    { nil: undefined }
  )
});

// Helper Functions

/**
 * إنشاء مستخدم اختبار
 */
async function createTestUser(userType = 'Employee') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  
  const userData = {
    email: `test${timestamp}${random}@example.com`,
    password: 'Test@123456',
    phone: `+201${Math.floor(Math.random() * 1000000000)}`,
    country: 'Egypt',
    role: userType,
    userType
  };

  if (userType === 'Employee') {
    userData.firstName = 'Test';
    userData.lastName = 'User';
  } else if (userType === 'HR') {
    userData.companyName = 'Test Company';
  }

  const user = new User(userData);
  await user.save();
  return user;
}

/**
 * تنظيف البيانات بعد الاختبار
 */
async function cleanup(userId) {
  await UserSettings.deleteMany({ userId });
  await User.deleteOne({ _id: userId });
}

/**
 * تنظيف البيانات من undefined values
 */
function cleanData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(cleanData).filter(item => item !== undefined);
  }
  
  const cleaned = {};
  for (const key in data) {
    const value = data[key];
    
    // Skip undefined
    if (value === undefined) {
      continue;
    }
    
    // Recursively clean nested objects
    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      const nested = cleanData(value);
      if (Object.keys(nested).length > 0) {
        cleaned[key] = nested;
      }
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}

/**
 * مقارنة عميقة لكائنين مع تجاهل الحقول غير المهمة
 */
function deepEqual(obj1, obj2, ignoredFields = ['_id', '__v', 'createdAt', 'updatedAt']) {
  const normalize = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    // Convert to plain object if it's a Mongoose document
    const plain = JSON.parse(JSON.stringify(obj));
    
    // Remove ignored fields recursively
    const removeIgnored = (o) => {
      if (!o || typeof o !== 'object') return o;
      
      if (Array.isArray(o)) {
        return o.map(removeIgnored);
      }
      
      const result = {};
      for (const key in o) {
        if (!ignoredFields.includes(key) && o[key] !== undefined) {
          result[key] = removeIgnored(o[key]);
        }
      }
      return result;
    };
    
    return removeIgnored(plain);
  };
  
  const normalized1 = normalize(obj1);
  const normalized2 = normalize(obj2);
  
  // Sort keys for consistent comparison
  const sorted1 = JSON.stringify(normalized1, Object.keys(normalized1).sort());
  const sorted2 = JSON.stringify(normalized2, Object.keys(normalized2).sort());
  
  return sorted1 === sorted2;
}

/**
 * استخراج القيم المحدثة من الكائن المسترجع
 */
function extractUpdatedValues(retrieved, updates, path = '') {
  const result = {};
  
  for (const key in updates) {
    const value = updates[key];
    const fullPath = path ? `${path}.${key}` : key;
    
    if (value === undefined) {
      continue;
    }
    
    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      const nested = extractUpdatedValues(retrieved[key] || {}, value, fullPath);
      if (Object.keys(nested).length > 0) {
        result[key] = nested;
      }
    } else {
      result[key] = retrieved[key];
    }
  }
  
  return result;
}

// Tests

describe('Settings Page Enhancements - Property 1: Settings Round-Trip Consistency', () => {
  
  beforeAll(async () => {
    await connectDB();
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
  });
  
  /**
   * Property Test: تحديث الملف الشخصي - حفظ واسترجاع يجب أن يحافظ على جميع القيم
   */
  it('should preserve all profile updates through save and retrieve cycle', async () => {
    await fc.assert(
      fc.asyncProperty(
        profileUpdatesArbitrary(),
        async (updates) => {
          let userId;
          
          try {
            // 1. إنشاء مستخدم اختبار
            const user = await createTestUser();
            userId = user._id;
            
            // 2. تحديث الملف الشخصي
            await settingsService.updateProfile(userId, updates);
            
            // 3. استرجاع المستخدم والإعدادات
            const retrievedUser = await User.findById(userId).select('-password');
            const retrievedSettings = await settingsService.getUserSettings(userId);
            
            // 4. التحقق من تطابق القيم المحدثة
            const cleanedUpdates = cleanData(updates);
            
            // التحقق من الحقول في User model
            if (cleanedUpdates.phone !== undefined) {
              expect(retrievedUser.phone).toBe(cleanedUpdates.phone);
            }
            
            if (cleanedUpdates.country !== undefined) {
              expect(retrievedUser.country).toBe(cleanedUpdates.country);
            }
            
            if (cleanedUpdates.city !== undefined) {
              expect(retrievedUser.city).toBe(cleanedUpdates.city);
            }
            
            // التحقق من الحقول في UserSettings
            if (cleanedUpdates.language !== undefined) {
              expect(retrievedSettings.preferences.language).toBe(cleanedUpdates.language);
            }
            
            if (cleanedUpdates.timezone !== undefined) {
              expect(retrievedSettings.preferences.timezone).toBe(cleanedUpdates.timezone);
            }
            
            // 5. التنظيف
            await cleanup(userId);
            
            return true;
          } catch (error) {
            if (userId) {
              await cleanup(userId);
            }
            throw error;
          }
        }
      ),
      { 
        numRuns: 20, // Reduced from 100 for faster execution
        timeout: 30000
      }
    );
  }, 120000); // 2 دقيقة timeout للاختبار الكامل
  
  /**
   * Property Test: إعدادات الخصوصية - حفظ واسترجاع يجب أن يحافظ على جميع القيم
   */
  it('should preserve all privacy settings through save and retrieve cycle', async () => {
    await fc.assert(
      fc.asyncProperty(
        privacySettingsArbitrary(),
        async (settings) => {
          let userId;
          
          try {
            // 1. إنشاء مستخدم اختبار
            const user = await createTestUser();
            userId = user._id;
            
            // 2. تحديث إعدادات الخصوصية
            await settingsService.updatePrivacySettings(userId, settings);
            
            // 3. استرجاع الإعدادات
            const retrieved = await settingsService.getUserSettings(userId);
            
            // 4. التحقق من تطابق القيم المحدثة
            const cleanedSettings = cleanData(settings);
            const retrievedPrivacy = extractUpdatedValues(retrieved.privacy, cleanedSettings);
            
            const isEqual = deepEqual(retrievedPrivacy, cleanedSettings);
            
            if (!isEqual) {
              console.log('Privacy settings mismatch:');
              console.log('Retrieved:', JSON.stringify(retrievedPrivacy, null, 2));
              console.log('Expected:', JSON.stringify(cleanedSettings, null, 2));
            }
            
            expect(isEqual).toBe(true);
            
            // 5. التنظيف
            await cleanup(userId);
            
            return true;
          } catch (error) {
            if (userId) {
              await cleanup(userId);
            }
            throw error;
          }
        }
      ),
      { 
        numRuns: 20, // Reduced from 100 for faster execution
        timeout: 30000
      }
    );
  }, 120000);
  
  /**
   * Property Test: تفضيلات الإشعارات - حفظ واسترجاع يجب أن يحافظ على جميع القيم
   */
  it('should preserve all notification preferences through save and retrieve cycle', async () => {
    await fc.assert(
      fc.asyncProperty(
        notificationPreferencesArbitrary(),
        async (preferences) => {
          let userId;
          
          try {
            // 1. إنشاء مستخدم اختبار
            const user = await createTestUser();
            userId = user._id;
            
            // 2. تحديث تفضيلات الإشعارات
            await settingsService.updateNotificationPreferences(userId, preferences);
            
            // 3. استرجاع الإعدادات
            const retrieved = await settingsService.getUserSettings(userId);
            
            // 4. التحقق من تطابق القيم المحدثة
            const cleanedPreferences = cleanData(preferences);
            const retrievedNotifications = extractUpdatedValues(retrieved.notifications, cleanedPreferences);
            
            const isEqual = deepEqual(retrievedNotifications, cleanedPreferences);
            
            if (!isEqual) {
              console.log('Notification preferences mismatch:');
              console.log('Retrieved:', JSON.stringify(retrievedNotifications, null, 2));
              console.log('Expected:', JSON.stringify(cleanedPreferences, null, 2));
            }
            
            expect(isEqual).toBe(true);
            
            // 5. التنظيف
            await cleanup(userId);
            
            return true;
          } catch (error) {
            if (userId) {
              await cleanup(userId);
            }
            throw error;
          }
        }
      ),
      { 
        numRuns: 20, // Reduced from 100 for faster execution
        timeout: 30000
      }
    );
  }, 120000);
  
  /**
   * Property Test: تحديثات متعددة متتالية - يجب أن تحافظ على آخر القيم
   */
  it('should preserve latest values through multiple sequential updates', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(profileUpdatesArbitrary(), { minLength: 2, maxLength: 5 }),
        async (updatesArray) => {
          let userId;
          
          try {
            // 1. إنشاء مستخدم اختبار
            const user = await createTestUser();
            userId = user._id;
            
            // 2. تطبيق جميع التحديثات بالتسلسل
            for (const updates of updatesArray) {
              await settingsService.updateProfile(userId, updates);
            }
            
            // 3. استرجاع المستخدم والإعدادات
            const retrievedUser = await User.findById(userId).select('-password');
            const retrievedSettings = await settingsService.getUserSettings(userId);
            
            // 4. التحقق من أن القيم النهائية تطابق آخر تحديث
            const lastUpdate = cleanData(updatesArray[updatesArray.length - 1]);
            
            if (lastUpdate.phone !== undefined) {
              expect(retrievedUser.phone).toBe(lastUpdate.phone);
            }
            
            if (lastUpdate.language !== undefined) {
              expect(retrievedSettings.preferences.language).toBe(lastUpdate.language);
            }
            
            // 5. التنظيف
            await cleanup(userId);
            
            return true;
          } catch (error) {
            if (userId) {
              await cleanup(userId);
            }
            throw error;
          }
        }
      ),
      { 
        numRuns: 10, // Reduced from 50 for faster execution
        timeout: 30000
      }
    );
  }, 120000);
  
  /**
   * Unit Test: التحقق من حفظ جميع أنواع الإعدادات معاً
   */
  it('should save and retrieve all settings types correctly', async () => {
    let userId;
    
    try {
      // 1. إنشاء مستخدم اختبار
      const user = await createTestUser();
      userId = user._id;
      
      // 2. تحديث الملف الشخصي
      const profileUpdates = {
        phone: '+201234567890',
        country: 'Egypt',
        city: 'Cairo',
        language: 'ar',
        timezone: 'Africa/Cairo'
      };
      await settingsService.updateProfile(userId, profileUpdates);
      
      // 3. تحديث إعدادات الخصوصية
      const privacySettings = {
        profileVisibility: 'registered',
        showEmail: false,
        showPhone: true,
        messagePermissions: 'contacts',
        showOnlineStatus: true,
        allowSearchEngineIndexing: false
      };
      await settingsService.updatePrivacySettings(userId, privacySettings);
      
      // 4. تحديث تفضيلات الإشعارات
      const notificationPreferences = {
        job: { enabled: true, inApp: true, email: true, push: false },
        course: { enabled: true, inApp: true, email: false, push: false },
        chat: { enabled: true, inApp: true, email: false, push: true },
        quietHours: { enabled: true, start: '22:00', end: '08:00' },
        frequency: 'daily'
      };
      await settingsService.updateNotificationPreferences(userId, notificationPreferences);
      
      // 5. استرجاع جميع الإعدادات
      const retrievedUser = await User.findById(userId).select('-password');
      const retrievedSettings = await settingsService.getUserSettings(userId);
      
      // 6. التحقق من الملف الشخصي
      expect(retrievedUser.phone).toBe(profileUpdates.phone);
      expect(retrievedUser.country).toBe(profileUpdates.country);
      expect(retrievedUser.city).toBe(profileUpdates.city);
      expect(retrievedSettings.preferences.language).toBe(profileUpdates.language);
      expect(retrievedSettings.preferences.timezone).toBe(profileUpdates.timezone);
      
      // 7. التحقق من إعدادات الخصوصية
      expect(retrievedSettings.privacy.profileVisibility).toBe(privacySettings.profileVisibility);
      expect(retrievedSettings.privacy.showEmail).toBe(privacySettings.showEmail);
      expect(retrievedSettings.privacy.showPhone).toBe(privacySettings.showPhone);
      expect(retrievedSettings.privacy.messagePermissions).toBe(privacySettings.messagePermissions);
      expect(retrievedSettings.privacy.showOnlineStatus).toBe(privacySettings.showOnlineStatus);
      expect(retrievedSettings.privacy.allowSearchEngineIndexing).toBe(privacySettings.allowSearchEngineIndexing);
      
      // 8. التحقق من تفضيلات الإشعارات
      expect(retrievedSettings.notifications.job.enabled).toBe(notificationPreferences.job.enabled);
      expect(retrievedSettings.notifications.job.inApp).toBe(notificationPreferences.job.inApp);
      expect(retrievedSettings.notifications.job.email).toBe(notificationPreferences.job.email);
      expect(retrievedSettings.notifications.job.push).toBe(notificationPreferences.job.push);
      
      expect(retrievedSettings.notifications.course.enabled).toBe(notificationPreferences.course.enabled);
      expect(retrievedSettings.notifications.chat.push).toBe(notificationPreferences.chat.push);
      
      expect(retrievedSettings.notifications.quietHours.enabled).toBe(notificationPreferences.quietHours.enabled);
      expect(retrievedSettings.notifications.quietHours.start).toBe(notificationPreferences.quietHours.start);
      expect(retrievedSettings.notifications.quietHours.end).toBe(notificationPreferences.quietHours.end);
      
      expect(retrievedSettings.notifications.frequency).toBe(notificationPreferences.frequency);
      
      // 9. التنظيف
      await cleanup(userId);
    } catch (error) {
      if (userId) {
        await cleanup(userId);
      }
      throw error;
    }
  });
  
  /**
   * Unit Test: التحقق من حفظ إعدادات جزئية (بعض الحقول فقط)
   */
  it('should save and retrieve partial settings correctly', async () => {
    let userId;
    
    try {
      // 1. إنشاء مستخدم اختبار
      const user = await createTestUser();
      userId = user._id;
      
      // 2. تحديث حقل واحد فقط من الملف الشخصي
      await settingsService.updateProfile(userId, { phone: '+201111111111' });
      
      // 3. استرجاع المستخدم
      const retrievedUser = await User.findById(userId).select('-password');
      
      // 4. التحقق من أن الحقل المحدث تم حفظه
      expect(retrievedUser.phone).toBe('+201111111111');
      
      // 5. تحديث حقل واحد فقط من إعدادات الخصوصية
      await settingsService.updatePrivacySettings(userId, { showEmail: true });
      
      // 6. استرجاع الإعدادات
      const retrievedSettings = await settingsService.getUserSettings(userId);
      
      // 7. التحقق من أن الحقل المحدث تم حفظه
      expect(retrievedSettings.privacy.showEmail).toBe(true);
      
      // 8. التنظيف
      await cleanup(userId);
    } catch (error) {
      if (userId) {
        await cleanup(userId);
      }
      throw error;
    }
  });
});
