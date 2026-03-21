// خدمة Pusher للمحادثات الفورية
// بديل Socket.IO للعمل على Vercel

const logger = require('../utils/logger');

class PusherService {
  constructor() {
    this.pusher = null;
    this.isInitialized = false;
  }
  
  // تهيئة Pusher
  initialize() {
    try {
      // التحقق من وجود المفاتيح
      const appId = process.env.PUSHER_APP_ID;
      const key = process.env.PUSHER_KEY;
      const secret = process.env.PUSHER_SECRET;
      const cluster = process.env.PUSHER_CLUSTER || 'eu';
      
      if (!appId || !key || !secret) {
        logger.warn('Pusher credentials not found. Real-time features will be disabled.');
        logger.info('To enable Pusher: Add PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET to .env');
        return false;
      }
      
      // تثبيت pusher
      const Pusher = require('pusher');
      
      this.pusher = new Pusher({
        appId,
        key,
        secret,
        cluster,
        useTLS: true
      });
      
      this.isInitialized = true;
      logger.info('✅ Pusher initialized successfully');
      logger.info(`📡 Pusher cluster: ${cluster}`);
      
      return true;
      
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        logger.warn('Pusher package not installed. Install with: npm install pusher');
        logger.info('Real-time features will be disabled until Pusher is installed.');
      } else {
        logger.error('Error initializing Pusher:', error);
      }
      return false;
    }
  }
  
  // إرسال رسالة جديدة
  async sendNewMessage(conversationId, message) {
    if (!this.isInitialized || !this.pusher) {
      logger.debug('Pusher not initialized, skipping real-time notification');
      return;
    }
    
    try {
      await this.pusher.trigger(
        `conversation-${conversationId}`,
        'new-message',
        {
          message,
          timestamp: new Date().toISOString()
        }
      );
      
      logger.debug(`Message sent via Pusher to conversation ${conversationId}`);
    } catch (error) {
      logger.error('Error sending message via Pusher:', error);
    }
  }
  
  // إرسال مؤشر "يكتب الآن..."
  async sendTypingIndicator(conversationId, userId, userName) {
    if (!this.isInitialized || !this.pusher) return;
    
    try {
      await this.pusher.trigger(
        `conversation-${conversationId}`,
        'user-typing',
        {
          userId,
          userName,
          timestamp: new Date().toISOString()
        }
      );
    } catch (error) {
      logger.error('Error sending typing indicator:', error);
    }
  }
  
  // إرسال "توقف عن الكتابة"
  async sendStopTyping(conversationId, userId) {
    if (!this.isInitialized || !this.pusher) return;
    
    try {
      await this.pusher.trigger(
        `conversation-${conversationId}`,
        'user-stop-typing',
        {
          userId,
          timestamp: new Date().toISOString()
        }
      );
    } catch (error) {
      logger.error('Error sending stop typing:', error);
    }
  }
  
  // إرسال تحديث حالة الرسالة (مقروءة)
  async sendMessageRead(conversationId, messageId, userId) {
    if (!this.isInitialized || !this.pusher) return;
    
    try {
      await this.pusher.trigger(
        `conversation-${conversationId}`,
        'message-read',
        {
          messageId,
          userId,
          timestamp: new Date().toISOString()
        }
      );
    } catch (error) {
      logger.error('Error sending message read status:', error);
    }
  }
  
  // إرسال تحديث حالة المستخدم (متصل/غير متصل)
  async sendUserStatusChange(userId, status, lastSeen = null) {
    if (!this.isInitialized || !this.pusher) return;
    
    try {
      await this.pusher.trigger(
        'presence-users',
        'user-status-changed',
        {
          userId,
          status,
          lastSeen: lastSeen || new Date().toISOString()
        }
      );
    } catch (error) {
      logger.error('Error sending user status:', error);
    }
  }
  
  // إرسال إشعار لمستخدم معين
  async sendNotificationToUser(userId, notification) {
    if (!this.isInitialized || !this.pusher) return;
    
    try {
      await this.pusher.trigger(
        `private-user-${userId}`,
        'notification',
        notification
      );
      
      logger.debug(`Notification sent to user ${userId}`);
    } catch (error) {
      logger.error('Error sending notification via Pusher:', error);
    }
  }
  
  // إرسال تحديث لوحة المتصدرين لجميع المستخدمين
  async broadcastLeaderboardUpdate(period, topRankings) {
    if (!this.isInitialized || !this.pusher) {
      logger.debug('Pusher not initialized, skipping leaderboard broadcast');
      return;
    }

    try {
      await this.pusher.trigger(
        'leaderboard',
        'leaderboard-updated',
        {
          period,
          topRankings,
          timestamp: new Date().toISOString()
        }
      );
      logger.debug(`Leaderboard update broadcasted for period: ${period}`);
    } catch (error) {
      logger.error('Error broadcasting leaderboard update:', error);
    }
  }

  // إرسال تحديث ترتيب مستخدم معين
  async sendRankUpdate(userId, rankData) {
    if (!this.isInitialized || !this.pusher) return;

    try {
      await this.pusher.trigger(
        `private-user-${userId}`,
        'rank-updated',
        {
          ...rankData,
          timestamp: new Date().toISOString()
        }
      );
    } catch (error) {
      logger.error('Error sending rank update:', error);
    }
  }

  // إرسال تحديث عدد الرسائل غير المقروءة
  async sendUnreadCountUpdate(userId, count) {    if (!this.isInitialized || !this.pusher) return;
    
    try {
      await this.pusher.trigger(
        `private-user-${userId}`,
        'unread-count-updated',
        {
          count,
          timestamp: new Date().toISOString()
        }
      );
    } catch (error) {
      logger.error('Error sending unread count:', error);
    }
  }
  
  // مصادقة Pusher للقنوات الخاصة
  authenticateUser(socketId, channelName, userId) {
    if (!this.isInitialized || !this.pusher) {
      throw new Error('Pusher not initialized');
    }
    
    try {
      // التحقق من أن المستخدم يمكنه الوصول للقناة
      if (channelName.startsWith('private-user-')) {
        const channelUserId = channelName.replace('private-user-', '');
        if (channelUserId !== userId.toString()) {
          throw new Error('Unauthorized');
        }
      }
      
      const auth = this.pusher.authenticate(socketId, channelName);
      return auth;
      
    } catch (error) {
      logger.error('Error authenticating Pusher user:', error);
      throw error;
    }
  }
  
  // مصادقة Presence channel
  authenticatePresence(socketId, channelName, userId, userInfo) {
    if (!this.isInitialized || !this.pusher) {
      throw new Error('Pusher not initialized');
    }
    
    try {
      const presenceData = {
        user_id: userId,
        user_info: userInfo
      };
      
      const auth = this.pusher.authenticate(socketId, channelName, presenceData);
      return auth;
      
    } catch (error) {
      logger.error('Error authenticating presence:', error);
      throw error;
    }
  }
  
  // التحقق من حالة Pusher
  isEnabled() {
    return this.isInitialized && this.pusher !== null;
  }
  
  // الحصول على معلومات القنوات
  async getChannelInfo(channelName) {
    if (!this.isInitialized || !this.pusher) return null;
    
    try {
      const response = await this.pusher.get({ path: `/channels/${channelName}` });
      return response;
    } catch (error) {
      logger.error('Error getting channel info:', error);
      return null;
    }
  }
  
  // ==================== Admin Dashboard Methods ====================
  
  // إرسال تحديث الإحصائيات للأدمن
  async broadcastStatisticsUpdate(statistics) {
    if (!this.isInitialized || !this.pusher) {
      logger.debug('Pusher not initialized, skipping statistics broadcast');
      return;
    }
    
    try {
      await this.pusher.trigger(
        'admin-dashboard',
        'statistics-updated',
        {
          statistics,
          timestamp: new Date().toISOString()
        }
      );
      
      logger.debug('Statistics update broadcasted to admin dashboard');
    } catch (error) {
      logger.error('Error broadcasting statistics update:', error);
    }
  }
  
  // إرسال إشعار جديد للأدمن
  async broadcastNotification(notification) {
    if (!this.isInitialized || !this.pusher) {
      logger.debug('Pusher not initialized, skipping notification broadcast');
      return;
    }
    
    try {
      // إرسال للقناة العامة للأدمن
      await this.pusher.trigger(
        'admin-dashboard',
        'new-notification',
        {
          notification,
          timestamp: new Date().toISOString()
        }
      );
      
      // إرسال للأدمن المحدد إذا كان موجود
      if (notification.adminId) {
        await this.pusher.trigger(
          `private-admin-${notification.adminId}`,
          'new-notification',
          {
            notification,
            timestamp: new Date().toISOString()
          }
        );
      }
      
      logger.debug('Notification broadcasted to admin dashboard');
    } catch (error) {
      logger.error('Error broadcasting notification:', error);
    }
  }
  
  // إرسال سجل نشاط جديد للأدمن
  async broadcastActivityLog(activityLog) {
    if (!this.isInitialized || !this.pusher) {
      logger.debug('Pusher not initialized, skipping activity log broadcast');
      return;
    }
    
    try {
      await this.pusher.trigger(
        'admin-dashboard',
        'new-activity-log',
        {
          activityLog,
          timestamp: new Date().toISOString()
        }
      );
      
      logger.debug('Activity log broadcasted to admin dashboard');
    } catch (error) {
      logger.error('Error broadcasting activity log:', error);
    }
  }
  
  // إرسال تحديث عدد الإشعارات غير المقروءة للأدمن
  async broadcastUnreadNotificationCount(adminId, count) {
    if (!this.isInitialized || !this.pusher) return;
    
    try {
      await this.pusher.trigger(
        `private-admin-${adminId}`,
        'unread-notifications-updated',
        {
          count,
          timestamp: new Date().toISOString()
        }
      );
      
      logger.debug(`Unread notification count (${count}) sent to admin ${adminId}`);
    } catch (error) {
      logger.error('Error broadcasting unread notification count:', error);
    }
  }
}

module.exports = new PusherService();
