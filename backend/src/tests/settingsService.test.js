const mongoose = require('mongoose');
const settingsService = require('../services/settingsService');
const { User } = require('../models/User');
const UserSettings = require('../models/UserSettings');
const { uploadImage } = require('../config/cloudinary');

// Mock dependencies
jest.mock('../config/cloudinary');
jest.mock('../utils/logger');

describe('SettingsService', () => {
  let testUserId;
  let testUser;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/careerak_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({});
    await UserSettings.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create a test user
    testUser = await User.create({
      email: 'test@example.com',
      password: 'Test123!@#',
      role: 'Employee',
      phone: '+201234567890',
      country: 'Egypt',
      name: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      userType: 'Employee'
    });
    testUserId = testUser._id.toString();

    // Create default settings
    await UserSettings.create({ userId: testUserId });
  });

  afterEach(async () => {
    // Clean up after each test
    await User.deleteMany({});
    await UserSettings.deleteMany({});
    jest.clearAllMocks();
  });

  // ==================== updateProfile Tests ====================

  describe('updateProfile', () => {
    test('should update user name successfully', async () => {
      const updates = { firstName: 'Updated', lastName: 'Name' };
      
      const result = await settingsService.updateProfile(testUserId, updates);
      
      expect(result.user.firstName).toBe('Updated');
      expect(result.user.lastName).toBe('Name');
    });

    test('should reject empty name', async () => {
      const updates = { name: '' };
      
      await expect(settingsService.updateProfile(testUserId, updates))
        .rejects.toThrow('الاسم لا يمكن أن يكون فارغاً');
    });

    test('should reject name longer than 100 characters', async () => {
      const updates = { name: 'a'.repeat(101) };
      
      await expect(settingsService.updateProfile(testUserId, updates))
        .rejects.toThrow('الاسم طويل جداً');
    });

    test('should update phone number successfully', async () => {
      const updates = { phone: '+201987654321' };
      
      const result = await settingsService.updateProfile(testUserId, updates);
      
      expect(result.user.phone).toBe('+201987654321');
    });

    test('should reject duplicate phone number', async () => {
      // Create another user with a phone number
      await User.create({
        email: 'other@example.com',
        password: 'Test123!@#',
        role: 'Employee',
        phone: '+201111111111',
        country: 'Egypt',
        name: 'Other User',
        firstName: 'Other',
        lastName: 'User',
        userType: 'Employee'
      });

      const updates = { phone: '+201111111111' };
      
      await expect(settingsService.updateProfile(testUserId, updates))
        .rejects.toThrow('رقم الهاتف مستخدم بالفعل');
    });

    test('should reject invalid phone format', async () => {
      const updates = { phone: '123' }; // Too short
      
      await expect(settingsService.updateProfile(testUserId, updates))
        .rejects.toThrow('صيغة رقم الهاتف غير صحيحة');
    });

    test('should update country and city successfully', async () => {
      const updates = { 
        country: 'Saudi Arabia',
        city: 'Riyadh'
      };
      
      const result = await settingsService.updateProfile(testUserId, updates);
      
      expect(result.user.country).toBe('Saudi Arabia');
      expect(result.user.city).toBe('Riyadh');
    });

    test('should update language successfully', async () => {
      const updates = { language: 'en' };
      
      const result = await settingsService.updateProfile(testUserId, updates);
      
      expect(result.settings.preferences.language).toBe('en');
    });

    test('should reject invalid language', async () => {
      const updates = { language: 'de' }; // German not supported
      
      await expect(settingsService.updateProfile(testUserId, updates))
        .rejects.toThrow('اللغة غير مدعومة');
    });

    test('should update timezone successfully', async () => {
      const updates = { timezone: 'America/New_York' };
      
      const result = await settingsService.updateProfile(testUserId, updates);
      
      expect(result.settings.preferences.timezone).toBe('America/New_York');
    });

    test('should upload profile photo successfully', async () => {
      const photoBuffer = Buffer.from('fake image data');
      const mockImageUrl = 'https://cloudinary.com/image.jpg';
      
      uploadImage.mockResolvedValue({ secure_url: mockImageUrl });
      
      const updates = { photoBuffer };
      
      const result = await settingsService.updateProfile(testUserId, updates);
      
      expect(uploadImage).toHaveBeenCalledWith(
        photoBuffer,
        expect.objectContaining({
          folder: 'careerak/profiles'
        })
      );
      expect(result.user.profileImage).toBe(mockImageUrl);
    });

    test('should reject photo larger than 5MB', async () => {
      const photoBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
      
      const updates = { photoBuffer };
      
      await expect(settingsService.updateProfile(testUserId, updates))
        .rejects.toThrow('حجم الصورة كبير جداً');
    });

    test('should reject non-buffer photo', async () => {
      const updates = { photoBuffer: 'not a buffer' };
      
      await expect(settingsService.updateProfile(testUserId, updates))
        .rejects.toThrow('الصورة يجب أن تكون من نوع Buffer');
    });

    test('should throw error for non-existent user', async () => {
      const fakeUserId = new mongoose.Types.ObjectId().toString();
      const updates = { name: 'Test' };
      
      await expect(settingsService.updateProfile(fakeUserId, updates))
        .rejects.toThrow('المستخدم غير موجود');
    });

    test('should update multiple fields at once', async () => {
      const updates = {
        firstName: 'New',
        lastName: 'Name',
        country: 'UAE',
        city: 'Dubai',
        language: 'en',
        timezone: 'Asia/Dubai'
      };
      
      const result = await settingsService.updateProfile(testUserId, updates);
      
      expect(result.user.firstName).toBe('New');
      expect(result.user.lastName).toBe('Name');
      expect(result.user.country).toBe('UAE');
      expect(result.user.city).toBe('Dubai');
      expect(result.settings.preferences.language).toBe('en');
      expect(result.settings.preferences.timezone).toBe('Asia/Dubai');
    });
  });

  // ==================== updatePrivacySettings Tests ====================

  describe('updatePrivacySettings', () => {
    test('should update profile visibility successfully', async () => {
      const settings = { profileVisibility: 'registered' };
      
      const result = await settingsService.updatePrivacySettings(testUserId, settings);
      
      expect(result.privacy.profileVisibility).toBe('registered');
    });

    test('should reject invalid profile visibility', async () => {
      const settings = { profileVisibility: 'invalid' };
      
      await expect(settingsService.updatePrivacySettings(testUserId, settings))
        .rejects.toThrow('قيمة رؤية الملف الشخصي غير صحيحة');
    });

    test('should update showEmail successfully', async () => {
      const settings = { showEmail: true };
      
      const result = await settingsService.updatePrivacySettings(testUserId, settings);
      
      expect(result.privacy.showEmail).toBe(true);
    });

    test('should reject non-boolean showEmail', async () => {
      const settings = { showEmail: 'yes' };
      
      await expect(settingsService.updatePrivacySettings(testUserId, settings))
        .rejects.toThrow('showEmail يجب أن يكون قيمة منطقية');
    });

    test('should update showPhone successfully', async () => {
      const settings = { showPhone: true };
      
      const result = await settingsService.updatePrivacySettings(testUserId, settings);
      
      expect(result.privacy.showPhone).toBe(true);
    });

    test('should update message permissions successfully', async () => {
      const settings = { messagePermissions: 'contacts' };
      
      const result = await settingsService.updatePrivacySettings(testUserId, settings);
      
      expect(result.privacy.messagePermissions).toBe('contacts');
    });

    test('should reject invalid message permissions', async () => {
      const settings = { messagePermissions: 'invalid' };
      
      await expect(settingsService.updatePrivacySettings(testUserId, settings))
        .rejects.toThrow('قيمة أذونات الرسائل غير صحيحة');
    });

    test('should update showOnlineStatus successfully', async () => {
      const settings = { showOnlineStatus: false };
      
      const result = await settingsService.updatePrivacySettings(testUserId, settings);
      
      expect(result.privacy.showOnlineStatus).toBe(false);
    });

    test('should update allowSearchEngineIndexing successfully', async () => {
      const settings = { allowSearchEngineIndexing: false };
      
      const result = await settingsService.updatePrivacySettings(testUserId, settings);
      
      expect(result.privacy.allowSearchEngineIndexing).toBe(false);
    });

    test('should update multiple privacy settings at once', async () => {
      const settings = {
        profileVisibility: 'none',
        showEmail: false,
        showPhone: false,
        messagePermissions: 'none',
        showOnlineStatus: false,
        allowSearchEngineIndexing: false
      };
      
      const result = await settingsService.updatePrivacySettings(testUserId, settings);
      
      expect(result.privacy.profileVisibility).toBe('none');
      expect(result.privacy.showEmail).toBe(false);
      expect(result.privacy.showPhone).toBe(false);
      expect(result.privacy.messagePermissions).toBe('none');
      expect(result.privacy.showOnlineStatus).toBe(false);
      expect(result.privacy.allowSearchEngineIndexing).toBe(false);
    });

    test('should throw error for non-existent user', async () => {
      const fakeUserId = new mongoose.Types.ObjectId().toString();
      const settings = { showEmail: true };
      
      await expect(settingsService.updatePrivacySettings(fakeUserId, settings))
        .rejects.toThrow('المستخدم غير موجود');
    });
  });

  // ==================== updateNotificationPreferences Tests ====================

  describe('updateNotificationPreferences', () => {
    test('should update job notification preferences successfully', async () => {
      const preferences = {
        job: {
          enabled: false,
          inApp: false,
          email: true,
          push: false
        }
      };
      
      const result = await settingsService.updateNotificationPreferences(testUserId, preferences);
      
      expect(result.notifications.job.enabled).toBe(false);
      expect(result.notifications.job.inApp).toBe(false);
      expect(result.notifications.job.email).toBe(true);
      expect(result.notifications.job.push).toBe(false);
    });

    test('should reject non-boolean notification config', async () => {
      const preferences = {
        job: {
          enabled: 'yes'
        }
      };
      
      await expect(settingsService.updateNotificationPreferences(testUserId, preferences))
        .rejects.toThrow('job.enabled يجب أن يكون قيمة منطقية');
    });

    test('should update multiple notification types at once', async () => {
      const preferences = {
        job: { enabled: false },
        course: { enabled: false },
        chat: { enabled: true },
        review: { enabled: true },
        system: { enabled: true }
      };
      
      const result = await settingsService.updateNotificationPreferences(testUserId, preferences);
      
      expect(result.notifications.job.enabled).toBe(false);
      expect(result.notifications.course.enabled).toBe(false);
      expect(result.notifications.chat.enabled).toBe(true);
      expect(result.notifications.review.enabled).toBe(true);
      expect(result.notifications.system.enabled).toBe(true);
    });

    test('should update quiet hours successfully', async () => {
      const preferences = {
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '08:00'
        }
      };
      
      const result = await settingsService.updateNotificationPreferences(testUserId, preferences);
      
      expect(result.notifications.quietHours.enabled).toBe(true);
      expect(result.notifications.quietHours.start).toBe('22:00');
      expect(result.notifications.quietHours.end).toBe('08:00');
    });

    test('should reject invalid time format for quiet hours start', async () => {
      const preferences = {
        quietHours: {
          start: '25:00' // Invalid hour
        }
      };
      
      await expect(settingsService.updateNotificationPreferences(testUserId, preferences))
        .rejects.toThrow('صيغة وقت البداية غير صحيحة');
    });

    test('should reject invalid time format for quiet hours end', async () => {
      const preferences = {
        quietHours: {
          end: '12:70' // Invalid minutes
        }
      };
      
      await expect(settingsService.updateNotificationPreferences(testUserId, preferences))
        .rejects.toThrow('صيغة وقت النهاية غير صحيحة');
    });

    test('should update notification frequency successfully', async () => {
      const preferences = { frequency: 'daily' };
      
      const result = await settingsService.updateNotificationPreferences(testUserId, preferences);
      
      expect(result.notifications.frequency).toBe('daily');
    });

    test('should reject invalid notification frequency', async () => {
      const preferences = { frequency: 'hourly' };
      
      await expect(settingsService.updateNotificationPreferences(testUserId, preferences))
        .rejects.toThrow('قيمة تكرار الإشعارات غير صحيحة');
    });

    test('should update all notification preferences at once', async () => {
      const preferences = {
        job: { enabled: false, email: false },
        course: { enabled: true, push: true },
        quietHours: {
          enabled: true,
          start: '23:00',
          end: '07:00'
        },
        frequency: 'weekly'
      };
      
      const result = await settingsService.updateNotificationPreferences(testUserId, preferences);
      
      expect(result.notifications.job.enabled).toBe(false);
      expect(result.notifications.job.email).toBe(false);
      expect(result.notifications.course.enabled).toBe(true);
      expect(result.notifications.course.push).toBe(true);
      expect(result.notifications.quietHours.enabled).toBe(true);
      expect(result.notifications.quietHours.start).toBe('23:00');
      expect(result.notifications.quietHours.end).toBe('07:00');
      expect(result.notifications.frequency).toBe('weekly');
    });

    test('should throw error for non-existent user', async () => {
      const fakeUserId = new mongoose.Types.ObjectId().toString();
      const preferences = { frequency: 'daily' };
      
      await expect(settingsService.updateNotificationPreferences(fakeUserId, preferences))
        .rejects.toThrow('المستخدم غير موجود');
    });
  });

  // ==================== getUserSettings Tests ====================

  describe('getUserSettings', () => {
    test('should get existing user settings', async () => {
      const result = await settingsService.getUserSettings(testUserId);
      
      expect(result).toBeDefined();
      expect(result.userId.toString()).toBe(testUserId);
      expect(result.privacy).toBeDefined();
      expect(result.notifications).toBeDefined();
    });

    test('should create default settings if not exist', async () => {
      // Delete existing settings
      await UserSettings.deleteOne({ userId: testUserId });
      
      const result = await settingsService.getUserSettings(testUserId);
      
      expect(result).toBeDefined();
      expect(result.userId.toString()).toBe(testUserId);
      expect(result.privacy.profileVisibility).toBe('everyone');
      expect(result.notifications.frequency).toBe('immediate');
    });
  });
});
