const NotificationPreference = require('../models/NotificationPreference');
const logger = require('../utils/logger');

class NotificationPreferenceService {
  
  /**
   * Get user notification preferences
   * @param {String} userId - User ID
   * @returns {Promise<Object>} User preferences
   */
  async getPreferences(userId) {
    try {
      let preferences = await NotificationPreference.findOne({ user: userId });
      
      // Create default preferences if not exists
      if (!preferences) {
        preferences = await this.createDefaultPreferences(userId);
      }
      
      return preferences;
      
    } catch (error) {
      logger.error('Error getting notification preferences:', error);
      throw error;
    }
  }
  
  /**
   * Update user notification preferences
   * @param {String} userId - User ID
   * @param {Object} updates - Preference updates
   * @returns {Promise<Object>} Updated preferences
   */
  async updatePreferences(userId, updates) {
    try {
      const preferences = await NotificationPreference.findOneAndUpdate(
        { user: userId },
        { 
          ...updates,
          updatedAt: new Date()
        },
        { 
          new: true, 
          upsert: true,
          runValidators: true
        }
      );
      
      logger.info(`Notification preferences updated for user ${userId}`);
      return preferences;
      
    } catch (error) {
      logger.error('Error updating notification preferences:', error);
      throw error;
    }
  }
  
  /**
   * Update specific notification type preference
   * @param {String} userId - User ID
   * @param {String} notificationType - Notification type
   * @param {Object} settings - Type settings (enabled, push, email)
   * @param {Boolean} isAdmin - Is admin notification type
   * @returns {Promise<Object>} Updated preferences
   */
  async updateNotificationType(userId, notificationType, settings, isAdmin = false) {
    try {
      const preferences = await this.getPreferences(userId);
      
      const prefKey = isAdmin ? 'adminPreferences' : 'preferences';
      
      if (!preferences[prefKey]) {
        preferences[prefKey] = {};
      }
      
      if (!preferences[prefKey][notificationType]) {
        preferences[prefKey][notificationType] = {};
      }
      
      // Update settings
      Object.assign(preferences[prefKey][notificationType], settings);
      preferences.updatedAt = new Date();
      
      await preferences.save();
      
      logger.info(`Notification type ${notificationType} updated for user ${userId}`);
      return preferences;
      
    } catch (error) {
      logger.error('Error updating notification type:', error);
      throw error;
    }
  }
  
  /**
   * Check if notification type is enabled
   * @param {String} userId - User ID
   * @param {String} notificationType - Notification type
   * @param {Boolean} isAdmin - Is admin notification type
   * @returns {Promise<Boolean>} Is enabled
   */
  async isNotificationEnabled(userId, notificationType, isAdmin = false) {
    try {
      const preferences = await this.getPreferences(userId);
      
      const prefKey = isAdmin ? 'adminPreferences' : 'preferences';
      
      if (!preferences[prefKey] || !preferences[prefKey][notificationType]) {
        return true; // Default: enabled
      }
      
      return preferences[prefKey][notificationType].enabled !== false;
      
    } catch (error) {
      logger.error('Error checking if notification is enabled:', error);
      return true; // Default: enabled on error
    }
  }
  
  /**
   * Check if current time is within quiet hours
   * @param {String} userId - User ID
   * @returns {Promise<Boolean>} Is quiet hours
   */
  async isQuietHours(userId) {
    try {
      const preferences = await this.getPreferences(userId);
      
      if (!preferences.quietHours?.enabled) {
        return false;
      }
      
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const { start, end } = preferences.quietHours;
      
      // Handle quiet hours that span midnight
      if (start < end) {
        // Normal case: e.g., 22:00 to 08:00 next day
        return currentTime >= start && currentTime <= end;
      } else {
        // Spans midnight: e.g., 22:00 to 08:00
        return currentTime >= start || currentTime <= end;
      }
      
    } catch (error) {
      logger.error('Error checking quiet hours:', error);
      return false;
    }
  }
  
  /**
   * Update quiet hours settings
   * @param {String} userId - User ID
   * @param {Object} quietHours - Quiet hours settings
   * @returns {Promise<Object>} Updated preferences
   */
  async updateQuietHours(userId, quietHours) {
    try {
      // Validate time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      
      if (quietHours.start && !timeRegex.test(quietHours.start)) {
        throw new Error('Invalid start time format. Use HH:MM');
      }
      
      if (quietHours.end && !timeRegex.test(quietHours.end)) {
        throw new Error('Invalid end time format. Use HH:MM');
      }
      
      const preferences = await NotificationPreference.findOneAndUpdate(
        { user: userId },
        { 
          quietHours,
          updatedAt: new Date()
        },
        { 
          new: true, 
          upsert: true,
          runValidators: true
        }
      );
      
      logger.info(`Quiet hours updated for user ${userId}`);
      return preferences;
      
    } catch (error) {
      logger.error('Error updating quiet hours:', error);
      throw error;
    }
  }
  
  /**
   * Enable all notifications
   * @param {String} userId - User ID
   * @param {Boolean} isAdmin - Enable admin notifications
   * @returns {Promise<Object>} Updated preferences
   */
  async enableAllNotifications(userId, isAdmin = false) {
    try {
      const preferences = await this.getPreferences(userId);
      
      const prefKey = isAdmin ? 'adminPreferences' : 'preferences';
      
      if (preferences[prefKey]) {
        Object.keys(preferences[prefKey]).forEach(type => {
          if (preferences[prefKey][type]) {
            preferences[prefKey][type].enabled = true;
          }
        });
      }
      
      preferences.updatedAt = new Date();
      await preferences.save();
      
      logger.info(`All notifications enabled for user ${userId}`);
      return preferences;
      
    } catch (error) {
      logger.error('Error enabling all notifications:', error);
      throw error;
    }
  }
  
  /**
   * Disable all notifications
   * @param {String} userId - User ID
   * @param {Boolean} isAdmin - Disable admin notifications
   * @returns {Promise<Object>} Updated preferences
   */
  async disableAllNotifications(userId, isAdmin = false) {
    try {
      const preferences = await this.getPreferences(userId);
      
      const prefKey = isAdmin ? 'adminPreferences' : 'preferences';
      
      if (preferences[prefKey]) {
        Object.keys(preferences[prefKey]).forEach(type => {
          if (preferences[prefKey][type]) {
            preferences[prefKey][type].enabled = false;
          }
        });
      }
      
      preferences.updatedAt = new Date();
      await preferences.save();
      
      logger.info(`All notifications disabled for user ${userId}`);
      return preferences;
      
    } catch (error) {
      logger.error('Error disabling all notifications:', error);
      throw error;
    }
  }
  
  /**
   * Add push subscription
   * @param {String} userId - User ID
   * @param {Object} subscription - Push subscription object
   * @returns {Promise<Object>} Updated preferences
   */
  async addPushSubscription(userId, subscription) {
    try {
      const preferences = await this.getPreferences(userId);
      
      // Check if subscription already exists
      const exists = preferences.pushSubscriptions.some(
        sub => sub.endpoint === subscription.endpoint
      );
      
      if (!exists) {
        preferences.pushSubscriptions.push({
          ...subscription,
          subscribedAt: new Date()
        });
        
        preferences.updatedAt = new Date();
        await preferences.save();
        
        logger.info(`Push subscription added for user ${userId}`);
      }
      
      return preferences;
      
    } catch (error) {
      logger.error('Error adding push subscription:', error);
      throw error;
    }
  }
  
  /**
   * Remove push subscription
   * @param {String} userId - User ID
   * @param {String} endpoint - Subscription endpoint
   * @returns {Promise<Object>} Updated preferences
   */
  async removePushSubscription(userId, endpoint) {
    try {
      const preferences = await this.getPreferences(userId);
      
      preferences.pushSubscriptions = preferences.pushSubscriptions.filter(
        sub => sub.endpoint !== endpoint
      );
      
      preferences.updatedAt = new Date();
      await preferences.save();
      
      logger.info(`Push subscription removed for user ${userId}`);
      return preferences;
      
    } catch (error) {
      logger.error('Error removing push subscription:', error);
      throw error;
    }
  }
  
  /**
   * Get push subscriptions
   * @param {String} userId - User ID
   * @returns {Promise<Array>} Push subscriptions
   */
  async getPushSubscriptions(userId) {
    try {
      const preferences = await this.getPreferences(userId);
      return preferences.pushSubscriptions || [];
      
    } catch (error) {
      logger.error('Error getting push subscriptions:', error);
      return [];
    }
  }
  
  /**
   * Create default preferences for new user
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Created preferences
   */
  async createDefaultPreferences(userId) {
    try {
      const preferences = await NotificationPreference.create({
        user: userId
      });
      
      logger.info(`Default preferences created for user ${userId}`);
      return preferences;
      
    } catch (error) {
      logger.error('Error creating default preferences:', error);
      throw error;
    }
  }
  
  /**
   * Delete user preferences
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Deleted preferences
   */
  async deletePreferences(userId) {
    try {
      const preferences = await NotificationPreference.findOneAndDelete({ user: userId });
      
      if (preferences) {
        logger.info(`Preferences deleted for user ${userId}`);
      }
      
      return preferences;
      
    } catch (error) {
      logger.error('Error deleting preferences:', error);
      throw error;
    }
  }
  
  /**
   * Get notification summary for user
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Notification summary
   */
  async getNotificationSummary(userId) {
    try {
      const preferences = await this.getPreferences(userId);
      
      // Count enabled notification types
      let enabledCount = 0;
      let totalCount = 0;
      
      if (preferences.preferences) {
        Object.values(preferences.preferences).forEach(pref => {
          totalCount++;
          if (pref.enabled !== false) enabledCount++;
        });
      }
      
      let adminEnabledCount = 0;
      let adminTotalCount = 0;
      
      if (preferences.adminPreferences) {
        Object.values(preferences.adminPreferences).forEach(pref => {
          adminTotalCount++;
          if (pref.enabled !== false) adminEnabledCount++;
        });
      }
      
      return {
        user: {
          enabled: enabledCount,
          total: totalCount,
          percentage: totalCount > 0 ? Math.round((enabledCount / totalCount) * 100) : 0
        },
        admin: {
          enabled: adminEnabledCount,
          total: adminTotalCount,
          percentage: adminTotalCount > 0 ? Math.round((adminEnabledCount / adminTotalCount) * 100) : 0
        },
        quietHours: preferences.quietHours?.enabled || false,
        pushSubscriptions: preferences.pushSubscriptions?.length || 0
      };
      
    } catch (error) {
      logger.error('Error getting notification summary:', error);
      throw error;
    }
  }
}

module.exports = new NotificationPreferenceService();
