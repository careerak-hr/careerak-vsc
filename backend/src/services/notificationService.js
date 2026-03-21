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
        // إذا كان النوع غير موجود في التفضيلات، نعتبره مفعلاً افتراضياً
        if (preferences.preferences[type] !== undefined) {
          logger.info(`Notification type ${type} is disabled for user ${recipient}`);
          return null;
        }
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
  
  // إشعار بتأكيد الموعد (للطرفين: الشركة والباحث)
  async notifyAppointmentConfirmed(appointment, companyId, jobSeekerId) {
    const scheduledTime = new Date(appointment.scheduledAt).toLocaleString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const relatedData = {
      appointment: appointment._id,
      scheduledAt: appointment.scheduledAt,
      duration: appointment.duration,
      meetingLink: appointment.meetingLink || null,
      location: appointment.location || null,
    };

    // إشعار للباحث عن عمل
    const seekerNotification = await this.createNotification({
      recipient: jobSeekerId,
      type: 'appointment_confirmed',
      title: 'تم تأكيد موعد مقابلتك ✅',
      message: `تم تأكيد موعد مقابلتك "${appointment.title}" في ${scheduledTime}`,
      relatedData,
      priority: 'urgent',
    });

    // إشعار للشركة
    const companyNotification = await this.createNotification({
      recipient: companyId,
      type: 'appointment_confirmed',
      title: 'تم تأكيد الموعد ✅',
      message: `تم تأكيد موعد المقابلة "${appointment.title}" في ${scheduledTime}`,
      relatedData,
      priority: 'high',
    });

    // إرسال إشعارات فورية عبر Pusher
    try {
      const pusherService = require('./pusherService');
      if (pusherService.isEnabled()) {
        const pusherPayload = {
          type: 'appointment_confirmed',
          appointmentId: appointment._id,
          appointmentTitle: appointment.title,
          scheduledAt: appointment.scheduledAt,
          duration: appointment.duration,
          meetingLink: appointment.meetingLink || null,
          location: appointment.location || null,
          timestamp: new Date().toISOString(),
        };

        await Promise.all([
          pusherService.sendNotificationToUser(jobSeekerId, {
            ...pusherPayload,
            title: 'تم تأكيد موعد مقابلتك ✅',
            message: `مقابلة "${appointment.title}" في ${scheduledTime}`,
          }),
          pusherService.sendNotificationToUser(companyId, {
            ...pusherPayload,
            title: 'تم تأكيد الموعد ✅',
            message: `مقابلة "${appointment.title}" في ${scheduledTime}`,
          }),
        ]);
      }
    } catch (pusherError) {
      logger.warn('Pusher notification failed for appointment confirmation:', pusherError.message);
    }

    return { seekerNotification, companyNotification };
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

  // إشعار بإغلاق وظيفة محفوظة
  async notifyJobClosed(userId, jobId, jobTitle) {
    try {
      return await this.createNotification({
        recipient: userId,
        type: 'job_closed',
        title: 'تم إغلاق وظيفة محفوظة 📌',
        message: `الوظيفة "${jobTitle}" التي حفظتها تم إغلاقها. تحقق من الوظائف المشابهة`,
        relatedData: { jobPosting: jobId },
        priority: 'medium'
      });
    } catch (error) {
      logger.error('Error notifying job closed:', error);
      throw error;
    }
  }

  // إشعار جميع المستخدمين الذين حفظوا وظيفة عند إغلاقها
  async notifyBookmarkedUsersJobClosed(jobId) {
    try {
      const JobBookmark = require('../models/JobBookmark');
      const JobPosting = require('../models/JobPosting');

      // جلب الوظيفة
      const job = await JobPosting.findById(jobId);
      if (!job) {
        logger.warn(`Job ${jobId} not found for closed notification`);
        return { success: false, notified: 0 };
      }

      // جلب جميع المستخدمين الذين حفظوا هذه الوظيفة وفعّلوا الإشعارات
      const bookmarks = await JobBookmark.find({
        jobId,
        notifyOnChange: true
      }).select('userId');

      if (!bookmarks.length) {
        logger.info(`No users with notifications enabled for job ${job.title}`);
        return { success: true, notified: 0 };
      }

      logger.info(`Found ${bookmarks.length} users to notify about job closure: ${job.title}`);

      // إرسال إشعارات لجميع المستخدمين
      const notifications = await Promise.all(
        bookmarks.map(bookmark =>
          this.notifyJobClosed(bookmark.userId, jobId, job.title)
        )
      );

      // إرسال إشعارات فورية عبر Pusher
      const pusherService = require('./pusherService');
      if (pusherService.isEnabled()) {
        await Promise.all(
          bookmarks.map(bookmark =>
            pusherService.sendNotificationToUser(bookmark.userId, {
              type: 'job_closed',
              title: 'تم إغلاق وظيفة محفوظة 📌',
              message: `الوظيفة "${job.title}" التي حفظتها تم إغلاقها`,
              jobId: job._id,
              jobTitle: job.title,
              timestamp: new Date().toISOString()
            })
          )
        );
        logger.info(`Real-time job closed notifications sent via Pusher to ${bookmarks.length} users`);
      }

      const successCount = notifications.filter(n => n !== null).length;
      logger.info(`Successfully sent ${successCount} job closed notifications for: ${job.title}`);

      return {
        success: true,
        notified: successCount,
        jobTitle: job.title,
        totalBookmarks: bookmarks.length
      };

    } catch (error) {
      logger.error('Error notifying bookmarked users about job closure:', error);
      return { success: false, notified: 0, error: error.message };
    }
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
  
  // إشعار بتسجيل دخول من جهاز جديد
  async notifyNewDeviceLogin(userId, device) {
    const deviceDescription = device.getDeviceDescription();
    const loginTime = new Date().toLocaleString('ar-EG', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    
    return await this.createNotification({
      recipient: userId,
      type: 'new_device_login',
      title: 'تسجيل دخول من جهاز جديد 🔐',
      message: `تم تسجيل الدخول إلى حسابك من ${deviceDescription} في ${loginTime}. إذا لم تكن أنت، يرجى تغيير كلمة المرور فوراً.`,
      relatedData: { 
        deviceId: device._id,
        deviceInfo: device.deviceInfo,
        location: device.location
      },
      priority: 'urgent'
    });
  }
  
  // ==================== Course Notifications ====================
  
  // إشعار بإصدار شهادة جديدة
  async notifyCertificateIssued(userId, certificateId, courseName, certificateUrl) {
    try {
      return await this.createNotification({
        recipient: userId,
        type: 'certificate_issued',
        title: 'تهانينا! شهادتك جاهزة 🎉',
        message: `تم إصدار شهادتك لدورة "${courseName}" بنجاح. يمكنك تحميلها الآن!`,
        relatedData: { 
          certificate: certificateId,
          certificateUrl
        },
        priority: 'high'
      });
    } catch (error) {
      logger.error('Error notifying certificate issued:', error);
      throw error;
    }
  }
  
  // إشعار بالحصول على badge جديد
  async notifyBadgeEarned(userId, badgeId, badgeName, badgeDescription) {
    try {
      return await this.createNotification({
        recipient: userId,
        type: 'badge_earned',
        title: `إنجاز جديد! حصلت على ${badgeName} 🏆`,
        message: badgeDescription || `تهانينا! لقد حصلت على إنجاز "${badgeName}"`,
        relatedData: { 
          badge: badgeId
        },
        priority: 'medium'
      });
    } catch (error) {
      logger.error('Error notifying badge earned:', error);
      throw error;
    }
  }
  
  // ==================== Course Notifications ====================
  
  // إشعار بمراجعة جديدة على الدورة (للمدرب)
  async notifyCourseReview(instructorId, courseId, courseTitle, reviewerName, rating) {
    try {
      const stars = '⭐'.repeat(Math.round(rating));
      
      return await this.createNotification({
        recipient: instructorId,
        type: 'course_review',
        title: 'مراجعة جديدة على دورتك! 📝',
        message: `قام ${reviewerName} بتقييم دورة "${courseTitle}" بـ ${stars} (${rating}/5)`,
        relatedData: { 
          course: courseId,
          rating
        },
        priority: 'medium'
      });
    } catch (error) {
      logger.error('Error notifying course review:', error);
      throw error;
    }
  }
  
  // إشعار باكتمال الدورة (للطالب)
  async notifyCourseCompletion(studentId, courseId, courseTitle, certificateUrl) {
    try {
      return await this.createNotification({
        recipient: studentId,
        type: 'course_completion',
        title: 'تهانينا! أكملت الدورة 🎉',
        message: `أكملت دورة "${courseTitle}" بنجاح. شهادتك جاهزة للتحميل!`,
        relatedData: { 
          course: courseId,
          certificateUrl
        },
        priority: 'high'
      });
    } catch (error) {
      logger.error('Error notifying course completion:', error);
      throw error;
    }
  }
  
  // إشعار بالتسجيل في الدورة (للطالب)
  async notifyCourseEnrollment(studentId, courseId, courseTitle, instructorName) {
    try {
      return await this.createNotification({
        recipient: studentId,
        type: 'course_enrollment',
        title: 'تم التسجيل في الدورة بنجاح! 📚',
        message: `تم تسجيلك في دورة "${courseTitle}" مع المدرب ${instructorName}. ابدأ التعلم الآن!`,
        relatedData: { 
          course: courseId
        },
        priority: 'medium'
      });
    } catch (error) {
      logger.error('Error notifying course enrollment:', error);
      throw error;
    }
  }
  
  // إشعار بدورة مناسبة (للطالب)
  async notifyCourseMatch(studentId, courseId, courseTitle, matchScore) {
    try {
      return await this.createNotification({
        recipient: studentId,
        type: 'course_match',
        title: 'دورة جديدة مناسبة لك! 🎯',
        message: `دورة "${courseTitle}" تناسب اهتماماتك بنسبة ${matchScore}%`,
        relatedData: { 
          course: courseId,
          matchScore
        },
        priority: 'medium'
      });
    } catch (error) {
      logger.error('Error notifying course match:', error);
      throw error;
    }
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
  
  // إرسال إشعارات فورية للمستخدمين المطابقين لوظيفة جديدة
  async notifyMatchingUsersForNewJob(jobPosting) {
    try {
      const job = await JobPosting.findById(jobPosting).populate('postedBy', 'companyName');
      if (!job) {
        logger.warn(`Job ${jobPosting} not found for notifications`);
        return { success: false, notified: 0 };
      }
      
      // البحث عن المستخدمين المطابقين
      const matchingUserIds = await this.findMatchingUsersForJob(jobPosting);
      
      if (!matchingUserIds.length) {
        logger.info(`No matching users found for job ${job.title}`);
        return { success: true, notified: 0 };
      }
      
      logger.info(`Found ${matchingUserIds.length} matching users for job ${job.title}`);
      
      // إرسال إشعارات لجميع المستخدمين المطابقين
      const notifications = await Promise.all(
        matchingUserIds.map(userId => this.notifyJobMatch(userId, jobPosting))
      );
      
      // إرسال إشعارات فورية عبر Pusher
      const pusherService = require('./pusherService');
      if (pusherService.isEnabled()) {
        await Promise.all(
          matchingUserIds.map(userId => 
            pusherService.sendNotificationToUser(userId, {
              type: 'job_match',
              title: 'وظيفة جديدة مناسبة لك! 🎯',
              message: `وظيفة "${job.title}" في ${job.postedBy?.companyName || job.location} تناسب مهاراتك`,
              jobId: job._id,
              jobTitle: job.title,
              company: job.postedBy?.companyName,
              location: job.location,
              timestamp: new Date().toISOString()
            })
          )
        );
        logger.info(`Real-time notifications sent via Pusher to ${matchingUserIds.length} users`);
      }
      
      const successCount = notifications.filter(n => n !== null).length;
      logger.info(`Successfully sent ${successCount} notifications for job ${job.title}`);
      
      return { 
        success: true, 
        notified: successCount,
        jobTitle: job.title,
        matchingUsers: matchingUserIds.length
      };
      
    } catch (error) {
      logger.error('Error notifying matching users for new job:', error);
      return { success: false, notified: 0, error: error.message };
    }
  }
  
  // إشعار الشركة بمرشح مناسب جديد
  async notifyCompanyOfMatchingCandidate(companyId, candidateId, jobId, matchScore) {
    try {
      const { Individual } = require('../models/User');
      const candidate = await Individual.findById(candidateId).select('firstName lastName specialization');
      const job = await JobPosting.findById(jobId).select('title');
      
      if (!candidate || !job) {
        logger.warn('Candidate or job not found for notification');
        return null;
      }
      
      const notification = await this.createNotification({
        recipient: companyId,
        type: 'candidate_match',
        title: 'مرشح مناسب لوظيفتك! 👤',
        message: `${candidate.firstName} ${candidate.lastName} (${candidate.specialization}) مناسب لوظيفة "${job.title}" بنسبة ${matchScore}%`,
        relatedData: { 
          candidate: candidateId,
          jobPosting: jobId,
          matchScore
        },
        priority: 'high'
      });
      
      // إرسال إشعار فوري عبر Pusher
      const pusherService = require('./pusherService');
      if (pusherService.isEnabled()) {
        await pusherService.sendNotificationToUser(companyId, {
          type: 'candidate_match',
          title: 'مرشح مناسب لوظيفتك! 👤',
          message: `${candidate.firstName} ${candidate.lastName} مناسب لوظيفة "${job.title}"`,
          candidateId,
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          candidateSpecialization: candidate.specialization,
          jobId,
          jobTitle: job.title,
          matchScore,
          timestamp: new Date().toISOString()
        });
        logger.info(`Real-time candidate match notification sent to company ${companyId}`);
      }
      
      return notification;
      
    } catch (error) {
      logger.error('Error notifying company of matching candidate:', error);
      throw error;
    }
  }
  
  // إرسال إشعارات فورية لتحديثات التوصيات
  async notifyRecommendationUpdate(userId, updateType, data) {
    try {
      let title, message, notificationType;
      
      switch (updateType) {
        case 'new_recommendations':
          title = 'توصيات جديدة متاحة! ✨';
          message = `لديك ${data.count} توصيات وظائف جديدة بناءً على ملفك الشخصي`;
          notificationType = 'recommendation_update';
          break;
          
        case 'profile_updated':
          title = 'تم تحديث توصياتك 🔄';
          message = 'تم تحديث توصيات الوظائف بناءً على التغييرات في ملفك الشخصي';
          notificationType = 'recommendation_update';
          break;
          
        case 'high_match_found':
          title = 'تطابق عالي! 🎯';
          message = `وجدنا وظيفة بتطابق ${data.matchScore}% مع مهاراتك`;
          notificationType = 'job_match';
          break;
          
        default:
          logger.warn(`Unknown update type: ${updateType}`);
          return null;
      }
      
      const notification = await this.createNotification({
        recipient: userId,
        type: notificationType,
        title,
        message,
        relatedData: data,
        priority: updateType === 'high_match_found' ? 'high' : 'medium'
      });
      
      // إرسال إشعار فوري عبر Pusher
      const pusherService = require('./pusherService');
      if (pusherService.isEnabled()) {
        await pusherService.sendNotificationToUser(userId, {
          type: notificationType,
          title,
          message,
          data,
          timestamp: new Date().toISOString()
        });
        logger.info(`Real-time recommendation update sent to user ${userId}`);
      }
      
      return notification;
      
    } catch (error) {
      logger.error('Error notifying recommendation update:', error);
      throw error;
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
  
  // تحديث تكرار الإشعارات
  async updateNotificationFrequency(userId, frequencySettings) {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      // تحديث إعدادات التكرار
      if (frequencySettings.recommendations !== undefined) {
        preferences.notificationFrequency.recommendations = frequencySettings.recommendations;
      }
      if (frequencySettings.applications !== undefined) {
        preferences.notificationFrequency.applications = frequencySettings.applications;
      }
      if (frequencySettings.system !== undefined) {
        preferences.notificationFrequency.system = frequencySettings.system;
      }
      
      await preferences.save();
      logger.info(`Notification frequency updated for user ${userId}`);
      
      return preferences;
    } catch (error) {
      logger.error('Error updating notification frequency:', error);
      throw error;
    }
  }
  
  // الحصول على تكرار الإشعارات
  async getNotificationFrequency(userId) {
    const preferences = await this.getUserPreferences(userId);
    return preferences.notificationFrequency;
  }
  
  // التحقق من إمكانية إرسال إشعار بناءً على التكرار
  async canSendNotification(userId, notificationType) {
    try {
      const preferences = await this.getUserPreferences(userId);
      const frequency = preferences.notificationFrequency;
      
      // تحديد فئة الإشعار
      let category;
      if (['job_match', 'course_match'].includes(notificationType)) {
        category = 'recommendations';
      } else if (['application_accepted', 'application_rejected', 'application_reviewed', 'new_application'].includes(notificationType)) {
        category = 'applications';
      } else if (notificationType === 'system') {
        category = 'system';
      } else {
        // أنواع أخرى تُرسل فوراً
        return true;
      }
      
      const frequencySetting = frequency[category];
      
      // إذا كان معطلاً
      if (frequencySetting === 'disabled') {
        return false;
      }
      
      // إذا كان فورياً
      if (frequencySetting === 'instant') {
        return true;
      }
      
      // التحقق من آخر مرة تم إرسال إشعارات مجمعة
      const lastBatchSent = frequency.lastBatchSent[category];
      if (!lastBatchSent) {
        return true; // أول مرة
      }
      
      const now = new Date();
      const timeDiff = now - lastBatchSent;
      
      // التحقق بناءً على التكرار
      switch (frequencySetting) {
        case 'hourly':
          return timeDiff >= 60 * 60 * 1000; // ساعة واحدة
        case 'daily':
          return timeDiff >= 24 * 60 * 60 * 1000; // يوم واحد
        case 'weekly':
          return timeDiff >= 7 * 24 * 60 * 60 * 1000; // أسبوع واحد
        default:
          return true;
      }
    } catch (error) {
      logger.error('Error checking notification frequency:', error);
      return true; // في حالة الخطأ، نسمح بالإرسال
    }
  }
  
  // تحديث وقت آخر إرسال مجمع
  async updateLastBatchSent(userId, category) {
    try {
      const preferences = await this.getUserPreferences(userId);
      preferences.notificationFrequency.lastBatchSent[category] = new Date();
      await preferences.save();
    } catch (error) {
      logger.error('Error updating last batch sent:', error);
    }
  }
  
  // إنشاء إشعار مع احترام التكرار المخصص
  async createNotificationWithFrequency({ recipient, type, title, message, relatedData = {}, priority = 'medium' }) {
    try {
      // التحقق من إمكانية الإرسال بناءً على التكرار
      const canSend = await this.canSendNotification(recipient, type);
      
      if (!canSend) {
        logger.info(`Notification ${type} skipped for user ${recipient} due to frequency settings`);
        // حفظ الإشعار في قائمة الانتظار للإرسال المجمع
        await this.queueNotificationForBatch(recipient, type, { title, message, relatedData, priority });
        return null;
      }
      
      // إرسال الإشعار فوراً
      return await this.createNotification({ recipient, type, title, message, relatedData, priority });
      
    } catch (error) {
      logger.error('Error creating notification with frequency:', error);
      throw error;
    }
  }
  
  // إضافة إشعار لقائمة الانتظار للإرسال المجمع
  async queueNotificationForBatch(userId, type, notificationData) {
    try {
      // يمكن استخدام Redis أو MongoDB لتخزين الإشعارات المؤجلة
      // للتبسيط، نحفظها في collection منفصلة
      const QueuedNotification = require('../models/QueuedNotification');
      
      await QueuedNotification.create({
        recipient: userId,
        type,
        ...notificationData,
        queuedAt: new Date()
      });
      
      logger.info(`Notification ${type} queued for batch sending to user ${userId}`);
    } catch (error) {
      logger.error('Error queuing notification:', error);
    }
  }
  
  // إرسال الإشعارات المجمعة
  async sendBatchNotifications(userId, category) {
    try {
      const QueuedNotification = require('../models/QueuedNotification');
      
      // تحديد أنواع الإشعارات حسب الفئة
      let types;
      if (category === 'recommendations') {
        types = ['job_match', 'course_match'];
      } else if (category === 'applications') {
        types = ['application_accepted', 'application_rejected', 'application_reviewed', 'new_application'];
      } else if (category === 'system') {
        types = ['system'];
      }
      
      // جلب الإشعارات المؤجلة
      const queuedNotifications = await QueuedNotification.find({
        recipient: userId,
        type: { $in: types }
      }).sort({ queuedAt: 1 });
      
      if (queuedNotifications.length === 0) {
        logger.info(`No queued notifications for user ${userId} in category ${category}`);
        return { sent: 0 };
      }
      
      // إنشاء إشعار مجمع واحد
      const count = queuedNotifications.length;
      let title, message;
      
      if (category === 'recommendations') {
        title = `لديك ${count} توصيات جديدة! 🎯`;
        message = `تحقق من ${count} وظائف ودورات جديدة مناسبة لك`;
      } else if (category === 'applications') {
        title = `${count} تحديثات على طلباتك 📋`;
        message = `لديك ${count} تحديثات جديدة على طلبات التوظيف`;
      } else if (category === 'system') {
        title = `${count} إشعارات نظام جديدة 🔔`;
        message = `لديك ${count} إشعارات نظام جديدة`;
      }
      
      // إرسال الإشعار المجمع
      await this.createNotification({
        recipient: userId,
        type: 'batch_notification',
        title,
        message,
        relatedData: {
          category,
          count,
          notifications: queuedNotifications.map(n => n._id)
        },
        priority: 'medium'
      });
      
      // حذف الإشعارات المؤجلة
      await QueuedNotification.deleteMany({
        recipient: userId,
        type: { $in: types }
      });
      
      // تحديث وقت آخر إرسال مجمع
      await this.updateLastBatchSent(userId, category);
      
      logger.info(`Sent batch notification with ${count} items to user ${userId}`);
      
      return { sent: count };
      
    } catch (error) {
      logger.error('Error sending batch notifications:', error);
      throw error;
    }
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
  
  // ==================== Settings Notifications ====================
  
  /**
   * إرسال إشعار أمني للمستخدم
   * @param {String} userId - معرف المستخدم
   * @param {String} action - نوع الإجراء الأمني (email_change, phone_change, password_change, session_terminated, 2fa_enabled, 2fa_disabled, account_deletion)
   * @param {Object} details - تفاصيل الإجراء
   * @returns {Promise<Notification>}
   */
  async sendSecurityNotification(userId, action, details = {}) {
    try {
      let title, message, priority = 'urgent';
      
      switch (action) {
        case 'email_change':
          title = 'تم تغيير البريد الإلكتروني 📧';
          message = `تم تغيير بريدك الإلكتروني من ${details.oldEmail} إلى ${details.newEmail}. إذا لم تقم بهذا التغيير، يرجى التواصل معنا فوراً.`;
          break;
          
        case 'phone_change':
          title = 'تم تغيير رقم الهاتف 📱';
          message = `تم تغيير رقم هاتفك إلى ${details.newPhone}. إذا لم تقم بهذا التغيير، يرجى التواصل معنا فوراً.`;
          break;
          
        case 'password_change':
          title = 'تم تغيير كلمة المرور 🔐';
          message = 'تم تغيير كلمة مرور حسابك بنجاح. إذا لم تقم بهذا التغيير، يرجى تغيير كلمة المرور فوراً والتواصل معنا.';
          break;
          
        case 'session_terminated':
          title = 'تم إنهاء جلسة 🚪';
          message = details.allSessions 
            ? 'تم إنهاء جميع الجلسات الأخرى بنجاح.'
            : `تم إنهاء جلسة من ${details.device || 'جهاز غير معروف'}.`;
          priority = 'high';
          break;
          
        case '2fa_enabled':
          title = 'تم تفعيل المصادقة الثنائية ✅';
          message = 'تم تفعيل المصادقة الثنائية (2FA) لحسابك. حسابك الآن أكثر أماناً.';
          priority = 'high';
          break;
          
        case '2fa_disabled':
          title = 'تم تعطيل المصادقة الثنائية ⚠️';
          message = 'تم تعطيل المصادقة الثنائية (2FA) لحسابك. ننصح بإعادة تفعيلها لحماية أفضل.';
          priority = 'urgent';
          break;
          
        case 'account_deletion':
          title = 'طلب حذف الحساب 🗑️';
          message = details.scheduled 
            ? `تم جدولة حذف حسابك في ${details.deletionDate}. يمكنك إلغاء الحذف خلال فترة السماح.`
            : 'تم استلام طلب حذف حسابك. سيتم معالجته قريباً.';
          break;
          
        default:
          title = 'إشعار أمني 🔒';
          message = details.message || 'تم تنفيذ إجراء أمني على حسابك.';
      }
      
      const notification = await this.createNotification({
        recipient: userId,
        type: 'security',
        title,
        message,
        relatedData: {
          action,
          ...details,
          timestamp: new Date()
        },
        priority
      });
      
      // إرسال إشعار فوري عبر Pusher
      const pusherService = require('./pusherService');
      if (pusherService.isEnabled()) {
        await pusherService.sendNotificationToUser(userId, {
          type: 'security',
          action,
          title,
          message,
          timestamp: new Date().toISOString()
        });
        logger.info(`Real-time security notification sent to user ${userId} for action: ${action}`);
      }
      
      logger.info(`Security notification sent to user ${userId} for action: ${action}`);
      return notification;
      
    } catch (error) {
      logger.error('Error sending security notification:', error);
      throw error;
    }
  }
  
  /**
   * تأجيل إشعار خلال ساعات الهدوء
   * @param {String} userId - معرف المستخدم
   * @param {Object} notificationData - بيانات الإشعار
   * @returns {Promise<Object>}
   */
  async queueNotificationDuringQuietHours(userId, notificationData) {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      // التحقق من تفعيل ساعات الهدوء
      if (!preferences.quietHours?.enabled) {
        logger.info(`Quiet hours not enabled for user ${userId}, sending notification immediately`);
        return await this.createNotification(notificationData);
      }
      
      // التحقق من الوقت الحالي
      if (!this.isQuietHours(preferences)) {
        logger.info(`Not in quiet hours for user ${userId}, sending notification immediately`);
        return await this.createNotification(notificationData);
      }
      
      // حساب وقت نهاية ساعات الهدوء
      const now = new Date();
      const endTime = this.calculateQuietHoursEnd(preferences.quietHours);
      
      // إضافة الإشعار لقائمة الانتظار
      const QueuedNotification = require('../models/QueuedNotification');
      const queuedNotification = await QueuedNotification.create({
        recipient: userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        relatedData: notificationData.relatedData || {},
        priority: notificationData.priority || 'medium',
        queuedAt: now,
        scheduledFor: endTime,
        reason: 'quiet_hours'
      });
      
      logger.info(`Notification queued for user ${userId} until ${endTime} (quiet hours)`);
      
      return {
        queued: true,
        notificationId: queuedNotification._id,
        scheduledFor: endTime,
        reason: 'quiet_hours'
      };
      
    } catch (error) {
      logger.error('Error queuing notification during quiet hours:', error);
      throw error;
    }
  }
  
  /**
   * حساب وقت نهاية ساعات الهدوء
   * @param {Object} quietHours - إعدادات ساعات الهدوء
   * @returns {Date}
   */
  calculateQuietHoursEnd(quietHours) {
    const now = new Date();
    const [endHour, endMinute] = quietHours.end.split(':').map(Number);
    
    const endTime = new Date(now);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    // إذا كان وقت النهاية قد مضى اليوم، اجعله غداً
    if (endTime <= now) {
      endTime.setDate(endTime.getDate() + 1);
    }
    
    return endTime;
  }
  
  /**
   * إرسال الإشعارات المؤجلة (cron job)
   * يتم تشغيله كل ساعة للتحقق من الإشعارات المجدولة
   * @returns {Promise<Object>}
   */
  async sendQueuedNotifications() {
    try {
      const QueuedNotification = require('../models/QueuedNotification');
      const now = new Date();
      
      // جلب الإشعارات المجدولة التي حان وقت إرسالها
      const queuedNotifications = await QueuedNotification.find({
        scheduledFor: { $lte: now }
      }).sort({ scheduledFor: 1 });
      
      if (queuedNotifications.length === 0) {
        logger.info('No queued notifications to send');
        return { sent: 0, failed: 0 };
      }
      
      logger.info(`Found ${queuedNotifications.length} queued notifications to send`);
      
      let sent = 0;
      let failed = 0;
      
      // إرسال كل إشعار
      for (const queuedNotif of queuedNotifications) {
        try {
          // إنشاء الإشعار
          await this.createNotification({
            recipient: queuedNotif.recipient,
            type: queuedNotif.type,
            title: queuedNotif.title,
            message: queuedNotif.message,
            relatedData: queuedNotif.relatedData,
            priority: queuedNotif.priority
          });
          
          // حذف الإشعار من قائمة الانتظار
          await QueuedNotification.findByIdAndDelete(queuedNotif._id);
          
          sent++;
          logger.info(`Sent queued notification ${queuedNotif._id} to user ${queuedNotif.recipient}`);
          
        } catch (error) {
          failed++;
          logger.error(`Failed to send queued notification ${queuedNotif._id}:`, error);
          
          // تحديث عدد المحاولات
          queuedNotif.retryCount = (queuedNotif.retryCount || 0) + 1;
          
          // إذا فشل 3 مرات، احذفه
          if (queuedNotif.retryCount >= 3) {
            await QueuedNotification.findByIdAndDelete(queuedNotif._id);
            logger.warn(`Deleted queued notification ${queuedNotif._id} after 3 failed attempts`);
          } else {
            // جدوله للمحاولة مرة أخرى بعد ساعة
            queuedNotif.scheduledFor = new Date(now.getTime() + 60 * 60 * 1000);
            await queuedNotif.save();
          }
        }
      }
      
      logger.info(`Queued notifications processing complete: ${sent} sent, ${failed} failed`);
      
      return { sent, failed, total: queuedNotifications.length };
      
    } catch (error) {
      logger.error('Error sending queued notifications:', error);
      throw error;
    }
  }

  // إشعار بمشاركة محتوى داخلياً عبر المحادثة
  async notifyContentShared(recipientId, senderId, contentType, contentTitle) {
    try {
      const { User } = require('../models/User');
      const sender = await User.findById(senderId).select('firstName lastName companyName').lean();
      const senderName = sender
        ? (sender.firstName ? `${sender.firstName} ${sender.lastName || ''}`.trim() : sender.companyName || 'مستخدم')
        : 'مستخدم';

      const typeLabels = { job: 'وظيفة', course: 'دورة', profile: 'ملف شخصي', company: 'شركة' };
      const typeLabel = typeLabels[contentType] || 'محتوى';

      return await this.createNotification({
        recipient: recipientId,
        type: 'system',
        title: `شارك معك ${typeLabel} 📤`,
        message: `قام ${senderName} بمشاركة ${typeLabel} "${contentTitle}" معك`,
        relatedData: { contentType, contentTitle, senderId },
        priority: 'medium'
      });
    } catch (error) {
      logger.error('Error notifying content shared:', error);
      // Non-blocking - don't throw
    }
  }

  // ==================== Referral Reward Notifications ====================

  /**
   * إرسال إشعار مكافأة الإحالة
   * @param {string} referrerId - معرف المحيل
   * @param {string} referredUserId - معرف المُحال
   * @param {string} rewardType - نوع المكافأة: 'signup' | 'first_course' | 'job' | 'paid_subscription'
   * @param {number} points - عدد النقاط الممنوحة
   * @param {string} referralId - معرف الإحالة (اختياري)
   */
  async sendReferralRewardNotification(referrerId, referredUserId, rewardType, points, referralId = null) {
    try {
      const rewardMessages = {
        signup: {
          referrerTitle: 'كسبت نقاطاً جديدة! 🎉',
          referrerMsg: `صديقك سجّل باستخدام رابط إحالتك وكسبت ${points} نقطة`,
          referredTitle: 'مرحباً بك! هدية ترحيبية 🎁',
          referredMsg: `حصلت على ${points} نقطة كمكافأة ترحيبية بعد تسجيلك`
        },
        first_course: {
          referrerTitle: 'مكافأة جديدة! 📚',
          referrerMsg: `أكمل صديقك المُحال أول دورة وكسبت ${points} نقطة`
        },
        job: {
          referrerTitle: 'مكافأة الوظيفة! 💼',
          referrerMsg: `حصل صديقك المُحال على وظيفة وكسبت ${points} نقطة`
        },
        paid_subscription: {
          referrerTitle: 'مكافأة الاشتراك! 💎',
          referrerMsg: `اشترك صديقك المُحال في باقة مدفوعة وكسبت ${points} نقطة`
        }
      };

      const config = rewardMessages[rewardType];
      if (!config) {
        logger.warn(`Unknown referral reward type: ${rewardType}`);
        return null;
      }

      const relatedData = { rewardType, points };
      if (referralId) relatedData.referral = referralId;

      const results = {};

      // إشعار المحيل
      if (referrerId) {
        results.referrerNotification = await this.createNotification({
          recipient: referrerId,
          type: 'referral_reward',
          title: config.referrerTitle,
          message: config.referrerMsg,
          relatedData,
          priority: 'high'
        });

        // إشعار فوري عبر Pusher
        try {
          const pusherService = require('./pusherService');
          if (pusherService.isEnabled()) {
            await pusherService.sendNotificationToUser(referrerId, {
              type: 'referral_reward',
              title: config.referrerTitle,
              message: config.referrerMsg,
              rewardType,
              points,
              timestamp: new Date().toISOString()
            });
          }
        } catch (pusherError) {
          logger.warn('Pusher notification failed (non-blocking):', pusherError.message);
        }
      }

      // إشعار المُحال (فقط عند التسجيل)
      if (rewardType === 'signup' && referredUserId && config.referredTitle) {
        results.referredNotification = await this.createNotification({
          recipient: referredUserId,
          type: 'referral_reward',
          title: config.referredTitle,
          message: config.referredMsg,
          relatedData: { rewardType: 'welcome_bonus', points: 25, referral: referralId },
          priority: 'high'
        });

        try {
          const pusherService = require('./pusherService');
          if (pusherService.isEnabled()) {
            await pusherService.sendNotificationToUser(referredUserId, {
              type: 'referral_reward',
              title: config.referredTitle,
              message: config.referredMsg,
              rewardType: 'welcome_bonus',
              points: 25,
              timestamp: new Date().toISOString()
            });
          }
        } catch (pusherError) {
          logger.warn('Pusher notification failed (non-blocking):', pusherError.message);
        }
      }

      logger.info(`Referral reward notifications sent - type: ${rewardType}, referrer: ${referrerId}`);
      return results;

    } catch (error) {
      logger.error('Error sending referral reward notification:', error);
      // Non-blocking - لا نفشل عملية المكافأة بسبب فشل الإشعار
    }
  }

  // إشعار باكتمال الدورة
  async sendCourseCompletionNotification(enrollment) {
    try {
      const CourseEnrollment = require('../models/CourseEnrollment');
      const populated = await CourseEnrollment.findById(enrollment._id)
        .populate('course', 'title')
        .lean();
      
      const courseName = populated?.course?.title || 'الدورة';
      
      return await this.createNotification({
        recipient: enrollment.student,
        type: 'system',
        title: 'تهانينا! أكملت الدورة 🎓',
        message: `لقد أكملت دورة "${courseName}" بنجاح. سيتم إصدار شهادتك قريباً!`,
        relatedData: { courseId: enrollment.course },
        priority: 'high'
      });
    } catch (error) {
      logger.error('Error sending course completion notification:', error);
      // لا نفشل العملية إذا فشل الإشعار
    }
  }
}

module.exports = new NotificationService();
