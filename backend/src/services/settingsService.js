const { User, Individual } = require('../models/User');
const UserSettings = require('../models/UserSettings');
const logger = require('../utils/logger');
const { uploadImage } = require('../config/cloudinary');

/**
 * SettingsService - خدمة إدارة إعدادات المستخدم
 * 
 * تتعامل مع:
 * - تحديث معلومات الملف الشخصي
 * - إدارة إعدادات الخصوصية
 * - إدارة تفضيلات الإشعارات
 * 
 * Requirements: 2.1, 2.2, 6.7, 7.6
 */
class SettingsService {
  
  /**
   * تحديث معلومات الملف الشخصي
   * 
   * @param {string} userId - معرف المستخدم
   * @param {Object} updates - التحديثات المطلوبة
   * @param {string} [updates.name] - الاسم الجديد
   * @param {string} [updates.phone] - رقم الهاتف الجديد
   * @param {string} [updates.country] - البلد
   * @param {string} [updates.city] - المدينة
   * @param {Buffer} [updates.photoBuffer] - صورة الملف الشخصي (buffer)
   * @param {string} [updates.language] - اللغة المفضلة
   * @param {string} [updates.timezone] - المنطقة الزمنية
   * @returns {Promise<Object>} المستخدم المحدث
   * @throws {Error} إذا فشل التحقق من الصحة أو الحفظ
   * 
   * Requirements: 2.1, 2.2
   */
  async updateProfile(userId, updates) {
    try {
      // التحقق من وجود المستخدم
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('المستخدم غير موجود');
      }

      // التحقق من صحة المدخلات
      this._validateProfileUpdates(updates);

      // تحديث الحقول الأساسية في User model
      const userUpdates = {};
      
      if (updates.name !== undefined) {
        // تحديث الاسم حسب نوع المستخدم
        if (user.userType === 'Employee') {
          userUpdates.name = updates.name;
        } else if (user.userType === 'HR') {
          userUpdates.companyName = updates.name;
        }
      }

      // دعم firstName و lastName للموظفين
      if (updates.firstName !== undefined && user.userType === 'Employee') {
        userUpdates.firstName = updates.firstName;
      }

      if (updates.lastName !== undefined && user.userType === 'Employee') {
        userUpdates.lastName = updates.lastName;
      }

      if (updates.phone !== undefined) {
        // التحقق من عدم تكرار رقم الهاتف
        const existingUser = await User.findOne({ 
          phone: updates.phone, 
          _id: { $ne: userId } 
        });
        if (existingUser) {
          throw new Error('رقم الهاتف مستخدم بالفعل');
        }
        userUpdates.phone = updates.phone;
      }

      if (updates.country !== undefined) {
        userUpdates.country = updates.country;
      }

      if (updates.city !== undefined) {
        userUpdates.city = updates.city;
      }

      // معالجة رفع الصورة
      if (updates.photoBuffer) {
        const imageUrl = await this._uploadProfilePhoto(updates.photoBuffer, userId);
        userUpdates.profileImage = imageUrl;
      }

      // تحديث User model
      if (Object.keys(userUpdates).length > 0) {
        // استخدام النموذج الصحيح حسب نوع المستخدم
        const Model = user.userType === 'Employee' ? Individual : User;
        await Model.findByIdAndUpdate(userId, userUpdates, { new: true });
      }

      // تحديث UserSettings للغة والمنطقة الزمنية
      const settingsUpdates = {};
      
      if (updates.language !== undefined) {
        settingsUpdates['preferences.language'] = updates.language;
      }

      if (updates.timezone !== undefined) {
        settingsUpdates['preferences.timezone'] = updates.timezone;
      }

      if (Object.keys(settingsUpdates).length > 0) {
        await UserSettings.findOneAndUpdate(
          { userId },
          { $set: settingsUpdates },
          { new: true, upsert: true }
        );
      }

      // إرجاع المستخدم المحدث مع الإعدادات
      const updatedUser = await User.findById(userId).select('-password');
      const updatedSettings = await UserSettings.findOne({ userId });

      logger.info(`Profile updated successfully for user ${userId}`);

      return {
        user: updatedUser,
        settings: updatedSettings
      };

    } catch (error) {
      logger.error(`Error updating profile for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * تحديث إعدادات الخصوصية
   * 
   * @param {string} userId - معرف المستخدم
   * @param {Object} settings - إعدادات الخصوصية
   * @param {string} [settings.profileVisibility] - رؤية الملف الشخصي (everyone, registered, none)
   * @param {boolean} [settings.showEmail] - إظهار البريد الإلكتروني
   * @param {boolean} [settings.showPhone] - إظهار رقم الهاتف
   * @param {string} [settings.messagePermissions] - أذونات الرسائل (everyone, contacts, none)
   * @param {boolean} [settings.showOnlineStatus] - إظهار حالة النشاط
   * @param {boolean} [settings.allowSearchEngineIndexing] - السماح بفهرسة محركات البحث
   * @returns {Promise<Object>} الإعدادات المحدثة
   * @throws {Error} إذا فشل التحقق من الصحة أو الحفظ
   * 
   * Requirements: 6.7
   */
  async updatePrivacySettings(userId, settings) {
    try {
      // التحقق من وجود المستخدم
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('المستخدم غير موجود');
      }

      // التحقق من صحة المدخلات
      this._validatePrivacySettings(settings);

      // بناء كائن التحديثات
      const updates = {};

      if (settings.profileVisibility !== undefined) {
        updates['privacy.profileVisibility'] = settings.profileVisibility;
      }

      if (settings.showEmail !== undefined) {
        updates['privacy.showEmail'] = settings.showEmail;
      }

      if (settings.showPhone !== undefined) {
        updates['privacy.showPhone'] = settings.showPhone;
      }

      if (settings.messagePermissions !== undefined) {
        updates['privacy.messagePermissions'] = settings.messagePermissions;
      }

      if (settings.showOnlineStatus !== undefined) {
        updates['privacy.showOnlineStatus'] = settings.showOnlineStatus;
      }

      if (settings.allowSearchEngineIndexing !== undefined) {
        updates['privacy.allowSearchEngineIndexing'] = settings.allowSearchEngineIndexing;
      }

      // تحديث الإعدادات
      const updatedSettings = await UserSettings.findOneAndUpdate(
        { userId },
        { $set: updates },
        { new: true, upsert: true }
      );

      logger.info(`Privacy settings updated successfully for user ${userId}`);

      return updatedSettings;

    } catch (error) {
      logger.error(`Error updating privacy settings for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * تحديث تفضيلات الإشعارات
   * 
   * @param {string} userId - معرف المستخدم
   * @param {Object} preferences - تفضيلات الإشعارات
   * @param {Object} [preferences.job] - إشعارات الوظائف
   * @param {Object} [preferences.course] - إشعارات الدورات
   * @param {Object} [preferences.chat] - إشعارات المحادثات
   * @param {Object} [preferences.review] - إشعارات التقييمات
   * @param {Object} [preferences.system] - إشعارات النظام
   * @param {Object} [preferences.quietHours] - ساعات الهدوء
   * @param {string} [preferences.frequency] - تكرار الإشعارات (immediate, daily, weekly)
   * @returns {Promise<Object>} الإعدادات المحدثة
   * @throws {Error} إذا فشل التحقق من الصحة أو الحفظ
   * 
   * Requirements: 7.6
   */
  async updateNotificationPreferences(userId, preferences) {
    try {
      // التحقق من وجود المستخدم
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('المستخدم غير موجود');
      }

      // التحقق من صحة المدخلات
      this._validateNotificationPreferences(preferences);

      // بناء كائن التحديثات
      const updates = {};

      // تحديث إعدادات أنواع الإشعارات
      const notificationTypes = ['job', 'course', 'chat', 'review', 'system'];
      
      notificationTypes.forEach(type => {
        if (preferences[type] !== undefined) {
          if (preferences[type].enabled !== undefined) {
            updates[`notifications.${type}.enabled`] = preferences[type].enabled;
          }
          if (preferences[type].inApp !== undefined) {
            updates[`notifications.${type}.inApp`] = preferences[type].inApp;
          }
          if (preferences[type].email !== undefined) {
            updates[`notifications.${type}.email`] = preferences[type].email;
          }
          if (preferences[type].push !== undefined) {
            updates[`notifications.${type}.push`] = preferences[type].push;
          }
        }
      });

      // تحديث ساعات الهدوء
      if (preferences.quietHours !== undefined) {
        if (preferences.quietHours.enabled !== undefined) {
          updates['notifications.quietHours.enabled'] = preferences.quietHours.enabled;
        }
        if (preferences.quietHours.start !== undefined) {
          // التحقق من صيغة الوقت (HH:mm)
          if (!this._isValidTimeFormat(preferences.quietHours.start)) {
            throw new Error('صيغة وقت البداية غير صحيحة. يجب أن تكون بصيغة HH:mm');
          }
          updates['notifications.quietHours.start'] = preferences.quietHours.start;
        }
        if (preferences.quietHours.end !== undefined) {
          // التحقق من صيغة الوقت (HH:mm)
          if (!this._isValidTimeFormat(preferences.quietHours.end)) {
            throw new Error('صيغة وقت النهاية غير صحيحة. يجب أن تكون بصيغة HH:mm');
          }
          updates['notifications.quietHours.end'] = preferences.quietHours.end;
        }
      }

      // تحديث تكرار الإشعارات
      if (preferences.frequency !== undefined) {
        updates['notifications.frequency'] = preferences.frequency;
      }

      // تحديث الإعدادات
      const updatedSettings = await UserSettings.findOneAndUpdate(
        { userId },
        { $set: updates },
        { new: true, upsert: true }
      );

      logger.info(`Notification preferences updated successfully for user ${userId}`);

      return updatedSettings;

    } catch (error) {
      logger.error(`Error updating notification preferences for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * الحصول على جميع إعدادات المستخدم
   * 
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<Object>} إعدادات المستخدم
   */
  async getUserSettings(userId) {
    try {
      let settings = await UserSettings.findOne({ userId });
      
      // إنشاء إعدادات افتراضية إذا لم تكن موجودة
      if (!settings) {
        settings = await UserSettings.create({ userId });
      }

      return settings;

    } catch (error) {
      logger.error(`Error getting user settings for user ${userId}:`, error);
      throw error;
    }
  }

  // ==================== Private Helper Methods ====================

  /**
   * التحقق من صحة تحديثات الملف الشخصي
   * @private
   */
  _validateProfileUpdates(updates) {
    // التحقق من الاسم
    if (updates.name !== undefined) {
      if (typeof updates.name !== 'string') {
        throw new Error('الاسم يجب أن يكون نصاً');
      }
      if (updates.name.trim().length === 0) {
        throw new Error('الاسم لا يمكن أن يكون فارغاً');
      }
      if (updates.name.length > 100) {
        throw new Error('الاسم طويل جداً (الحد الأقصى 100 حرف)');
      }
    }

    // التحقق من رقم الهاتف
    if (updates.phone !== undefined) {
      if (typeof updates.phone !== 'string') {
        throw new Error('رقم الهاتف يجب أن يكون نصاً');
      }
      // التحقق من صيغة رقم الهاتف (أرقام فقط، 10-15 رقم)
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(updates.phone)) {
        throw new Error('صيغة رقم الهاتف غير صحيحة');
      }
    }

    // التحقق من اللغة
    if (updates.language !== undefined) {
      const validLanguages = ['ar', 'en', 'fr'];
      if (!validLanguages.includes(updates.language)) {
        throw new Error('اللغة غير مدعومة. اللغات المدعومة: ar, en, fr');
      }
    }

    // التحقق من صورة الملف الشخصي
    if (updates.photoBuffer !== undefined) {
      if (!Buffer.isBuffer(updates.photoBuffer)) {
        throw new Error('الصورة يجب أن تكون من نوع Buffer');
      }
      
      // التحقق من حجم الصورة (الحد الأقصى 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (updates.photoBuffer.length > maxSize) {
        throw new Error('حجم الصورة كبير جداً (الحد الأقصى 5MB)');
      }
    }
  }

  /**
   * التحقق من صحة إعدادات الخصوصية
   * @private
   */
  _validatePrivacySettings(settings) {
    // التحقق من رؤية الملف الشخصي
    if (settings.profileVisibility !== undefined) {
      const validVisibilities = ['everyone', 'registered', 'none'];
      if (!validVisibilities.includes(settings.profileVisibility)) {
        throw new Error('قيمة رؤية الملف الشخصي غير صحيحة');
      }
    }

    // التحقق من أذونات الرسائل
    if (settings.messagePermissions !== undefined) {
      const validPermissions = ['everyone', 'contacts', 'none'];
      if (!validPermissions.includes(settings.messagePermissions)) {
        throw new Error('قيمة أذونات الرسائل غير صحيحة');
      }
    }

    // التحقق من القيم المنطقية
    const booleanFields = ['showEmail', 'showPhone', 'showOnlineStatus', 'allowSearchEngineIndexing'];
    booleanFields.forEach(field => {
      if (settings[field] !== undefined && typeof settings[field] !== 'boolean') {
        throw new Error(`${field} يجب أن يكون قيمة منطقية (true/false)`);
      }
    });
  }

  /**
   * التحقق من صحة تفضيلات الإشعارات
   * @private
   */
  _validateNotificationPreferences(preferences) {
    // التحقق من تكرار الإشعارات
    if (preferences.frequency !== undefined) {
      const validFrequencies = ['immediate', 'daily', 'weekly'];
      if (!validFrequencies.includes(preferences.frequency)) {
        throw new Error('قيمة تكرار الإشعارات غير صحيحة');
      }
    }

    // التحقق من إعدادات أنواع الإشعارات
    const notificationTypes = ['job', 'course', 'chat', 'review', 'system'];
    notificationTypes.forEach(type => {
      if (preferences[type] !== undefined) {
        const config = preferences[type];
        
        // التحقق من القيم المنطقية
        ['enabled', 'inApp', 'email', 'push'].forEach(field => {
          if (config[field] !== undefined && typeof config[field] !== 'boolean') {
            throw new Error(`${type}.${field} يجب أن يكون قيمة منطقية (true/false)`);
          }
        });
      }
    });

    // التحقق من ساعات الهدوء
    if (preferences.quietHours !== undefined) {
      if (preferences.quietHours.enabled !== undefined && typeof preferences.quietHours.enabled !== 'boolean') {
        throw new Error('quietHours.enabled يجب أن يكون قيمة منطقية (true/false)');
      }
    }
  }

  /**
   * التحقق من صيغة الوقت (HH:mm)
   * @private
   */
  _isValidTimeFormat(time) {
    const timeRegex = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;
    return timeRegex.test(time);
  }

  /**
   * رفع صورة الملف الشخصي إلى Cloudinary
   * @private
   */
  async _uploadProfilePhoto(photoBuffer, userId) {
    try {
      const result = await uploadImage(photoBuffer, {
        folder: 'careerak/profiles',
        public_id: `profile_${userId}_${Date.now()}`,
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });

      return result.secure_url;

    } catch (error) {
      logger.error('Error uploading profile photo:', error);
      throw new Error('فشل رفع الصورة. يرجى المحاولة مرة أخرى');
    }
  }
}

module.exports = new SettingsService();
