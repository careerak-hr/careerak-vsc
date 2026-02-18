const Notification = require('../models/Notification');
const NotificationPreference = require('../models/NotificationPreference');
const { User } = require('../models/User');
const JobPosting = require('../models/JobPosting');
const logger = require('../utils/logger');

class NotificationService {
  
  // إنشاء إشعار جديد
  async createNotification({ recipient, type, title, message, relatedData = {}, priority = 'medium' }) {
    try {
      // التحقق من تفضيلات المستخدم
      const preferences = await this.getUserPreferences(recipient);
      
      if (!preferences.preferences[type]?.enabled) {
        logger.info(`Notification type ${type} is disabled for user ${recipient}`);
        return null;
      }
      
      // التحقق من ساعات الهدوء
      if (this.isQuietHours(preferences)) {
        logger.info(`Quiet hours active for user ${recipient}, scheduling notification`);
        // يمكن جدولة الإشعار لاحقاً
      }
      
      const notification = await Notification.create({
        recipient,
        type,
        title,
        message,
        relatedData,
        priority,
        sentAt: new Date()
      });
      
      // إرسال Web Push إذا كان مفعلاً
      if (preferences.preferences[type]?.push) {
        await this.sendPushNotification(notification, preferences);
      }
      
      logger.info(`Notification created: ${notification._id} for user ${recipient}`);
      return notification;
      
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }
  
  // إشعار بوظيفة مناسبة
  async notifyJobMatch(userId, jobPosting) {
    const job = await JobPosting.findById(jobPosting).populate('postedBy', 'companyName');
    
    return await this.createNotification({
      recipient: userId,
      type: 'job_match',
      title: 'وظيفة جديدة مناسبة لك! 🎯',
      message: `وظيفة "${job.title}" في ${job.postedBy?.companyName || job.location} تناسب مهاراتك`,
      relatedData: { jobPosting: job._id },
      priority: 'high'
    });
  }
  
  // إشعار بقبول الطلب
  async notifyApplicationAccepted(userId, applicationId, jobTitle) {
    return await this.createNotification({
      recipient: userId,
      type: 'application_accepted',
      title: 'تهانينا! تم قبول طلبك 🎉',
      message: `تم قبول طلبك للوظيفة "${jobTitle}". سيتم التواصل معك قريباً`,
      relatedData: { jobApplication: applicationId },
      priority: 'urgent'
    });
  }
  
  // إشعار برفض الطلب
  async notifyApplicationRejected(userId, applicationId, jobTitle) {
    return await this.createNotification({
      recipient: userId,
      type: 'application_rejected',
      title: 'تحديث حول طلبك',
      message: `نأسف لإبلاغك أن طلبك للوظيفة "${jobTitle}" لم يتم قبوله هذه المرة`,
      relatedData: { jobApplication: applicationId },
      priority: 'medium'
    });
  }
  
  // إشعار بمراجعة الطلب
  async notifyApplicationReviewed(userId, applicationId, jobTitle) {
    return await this.createNotification({
      recipient: userId,
      type: 'application_reviewed',
      title: 'تم مراجعة طلبك 👀',
      message: `تم مراجعة طلبك للوظيفة "${jobTitle}"`,
      relatedData: { jobApplication: applicationId },
      priority: 'medium'
    });
  }
  
  // إشعار للشركة بطلب جديد
  async notifyNewApplication(companyId, applicationId, applicantName, jobTitle) {
    return await this.createNotification({
      recipient: companyId,
      type: 'new_application',
      title: 'طلب توظيف جديد 📋',
      message: `تقدم ${applicantName} للوظيفة "${jobTitle}"`,
      relatedData: { jobApplication: applicationId },
      priority: 'high'
    });
  }
  
  // البحث عن المستخدمين المناسبين لوظيفة جديدة
  async findMatchingUsersForJob(jobPosting) {
    try {
      const job = await JobPosting.findById(jobPosting);
      if (!job) return [];
      
      // استخراج الكلمات المفتاحية من الوظيفة
      const keywords = this.extractKeywords(job.title + ' ' + job.description + ' ' + job.requirements);
      
      // البحث عن المستخدمين المناسبين
      const { Individual } = require('../models/User');
      const matchingUsers = await Individual.find({
        $or: [
          { specialization: { $in: keywords } },
          { interests: { $in: keywords } },
          { 'otherSkills': { $in: keywords } },
          { 'computerSkills.skill': { $in: keywords } }
        ]
      }).select('_id');
      
      return matchingUsers.map(u => u._id);
      
    } catch (error) {
      logger.error('Error finding matching users:', error);
      return [];
    }
  }
  
  // استخراج كلمات مفتاحية بسيطة
  extractKeywords(text) {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return text
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 20);
  }
  
  // الحصول على تفضيلات المستخدم
  async getUserPreferences(userId) {
    let preferences = await NotificationPreference.findOne({ user: userId });
    
    if (!preferences) {
      // إنشاء تفضيلات افتراضية
      preferences = await NotificationPreference.create({ user: userId });
    }
    
    return preferences;
  }
  
  // التحقق من ساعات الهدوء
  isQuietHours(preferences) {
    if (!preferences.quietHours?.enabled) return false;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const { start, end } = preferences.quietHours;
    
    if (start < end) {
      return currentTime >= start && currentTime <= end;
    } else {
      return currentTime >= start || currentTime <= end;
    }
  }
  
  // إرسال Web Push Notification
  async sendPushNotification(notification, preferences) {
    try {
      // هنا يمكن دمج مكتبة web-push
      // للتبسيط، نحفظ فقط أن Push تم إرساله
      notification.pushSent = true;
      await notification.save();
      
      logger.info(`Push notification sent for ${notification._id}`);
    } catch (error) {
      logger.error('Error sending push notification:', error);
    }
  }
  
  // الحصول على إشعارات المستخدم
  async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    const query = { recipient: userId };
    if (unreadOnly) query.isRead = false;
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('relatedData.jobPosting', 'title location')
      .populate('relatedData.jobApplication', 'status');
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });
    
    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    };
  }
  
  // تحديد إشعار كمقروء
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({ _id: notificationId, recipient: userId });
    if (!notification) throw new Error('Notification not found');
    
    return await notification.markAsRead();
  }
  
  // تحديد جميع الإشعارات كمقروءة
  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }
  
  // حذف إشعار
  async deleteNotification(notificationId, userId) {
    return await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
  }
  
  // تحديث تفضيلات الإشعارات
  async updatePreferences(userId, preferences) {
    return await NotificationPreference.findOneAndUpdate(
      { user: userId },
      { preferences },
      { new: true, upsert: true }
    );
  }
  
  // إضافة Push Subscription
  async addPushSubscription(userId, subscription) {
    const preferences = await this.getUserPreferences(userId);
    
    // التحقق من عدم وجود نفس الـ endpoint
    const exists = preferences.pushSubscriptions.some(
      sub => sub.endpoint === subscription.endpoint
    );
    
    if (!exists) {
      preferences.pushSubscriptions.push({
        ...subscription,
        subscribedAt: new Date()
      });
      await preferences.save();
    }
    
    return preferences;
  }
  
  // إزالة Push Subscription
  async removePushSubscription(userId, endpoint) {
    const preferences = await this.getUserPreferences(userId);
    preferences.pushSubscriptions = preferences.pushSubscriptions.filter(
      sub => sub.endpoint !== endpoint
    );
    await preferences.save();
    return preferences;
  }
}

module.exports = new NotificationService();
