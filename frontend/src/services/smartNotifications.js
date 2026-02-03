/**
 * 🔔 نظام الإشعارات الذكي المتقدم
 * يدعم الإشعارات المحلية، Push Notifications، والإشعارات الصوتية
 */

import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';

class SmartNotificationManager {
  constructor() {
    this.isInitialized = false;
    this.notificationQueue = [];
    this.userPreferences = this.loadPreferences();
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // طلب الأذونات
      await this.requestPermissions();
      
      // تسجيل المستمعين
      this.registerListeners();
      
      // تهيئة Push Notifications
      await this.initializePushNotifications();
      
      this.isInitialized = true;
      console.log('✅ Smart Notification Manager initialized');
    } catch (error) {
      console.error('❌ Failed to initialize notifications:', error);
    }
  }

  async requestPermissions() {
    // أذونات الإشعارات المحلية
    const localPermission = await LocalNotifications.requestPermissions();
    
    // أذونات Push Notifications
    const pushPermission = await PushNotifications.requestPermissions();
    
    return {
      local: localPermission.display === 'granted',
      push: pushPermission.receive === 'granted'
    };
  }

  registerListeners() {
    // عند النقر على الإشعار
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      this.handleNotificationClick(notification);
    });

    // عند استلام Push Notification
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      this.handlePushNotification(notification);
    });
  }

  async initializePushNotifications() {
    try {
      await PushNotifications.register();
      
      PushNotifications.addListener('registration', (token) => {
        console.log('📱 Push registration token:', token.value);
        this.sendTokenToServer(token.value);
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('❌ Push registration error:', error);
      });
    } catch (error) {
      console.error('❌ Push notifications not supported:', error);
    }
  }

  /**
   * إرسال إشعار ذكي مع تخصيص حسب نوع المستخدم
   */
  async sendSmartNotification(type, data, userRole = 'employee') {
    const notification = this.createNotificationByType(type, data, userRole);
    
    if (!notification) return;

    // فحص تفضيلات المستخدم
    if (!this.shouldSendNotification(type)) return;

    try {
      await LocalNotifications.schedule({
        notifications: [notification]
      });

      // حفظ في السجل
      this.logNotification(notification);
      
      console.log(`📨 Smart notification sent: ${type}`);
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
    }
  }

  createNotificationByType(type, data, userRole) {
    const templates = {
      'job_match': {
        employee: {
          title: '🎯 وظيفة مناسبة لك!',
          body: `تم العثور على وظيفة ${data.jobTitle} في ${data.company}`,
          largeIcon: 'job_icon',
          sound: 'job_match.wav'
        },
        hr: {
          title: '👥 مرشح جديد مناسب',
          body: `${data.candidateName} تقدم لوظيفة ${data.jobTitle}`,
          largeIcon: 'candidate_icon',
          sound: 'new_application.wav'
        }
      },
      'course_recommendation': {
        employee: {
          title: '📚 دورة تدريبية موصى بها',
          body: `دورة ${data.courseTitle} ستطور مهاراتك في ${data.field}`,
          largeIcon: 'course_icon',
          sound: 'course_notification.wav'
        }
      },
      'interview_reminder': {
        employee: {
          title: '⏰ تذكير: مقابلة عمل',
          body: `مقابلتك مع ${data.company} خلال ${data.timeRemaining}`,
          largeIcon: 'interview_icon',
          sound: 'urgent_reminder.wav'
        },
        hr: {
          title: '⏰ تذكير: مقابلة مرشح',
          body: `مقابلة ${data.candidateName} خلال ${data.timeRemaining}`,
          largeIcon: 'interview_icon',
          sound: 'urgent_reminder.wav'
        }
      },
      'application_status': {
        employee: {
          title: data.status === 'accepted' ? '🎉 تم قبول طلبك!' : '📋 تحديث على طلبك',
          body: data.status === 'accepted' 
            ? `تهانينا! تم قبولك في وظيفة ${data.jobTitle}`
            : `تم تحديث حالة طلبك لوظيفة ${data.jobTitle}`,
          largeIcon: data.status === 'accepted' ? 'success_icon' : 'update_icon',
          sound: data.status === 'accepted' ? 'success.wav' : 'update.wav'
        }
      }
    };

    const template = templates[type]?.[userRole];
    if (!template) return null;

    return {
      id: Date.now(),
      title: template.title,
      body: template.body,
      largeIcon: template.largeIcon,
      sound: template.sound,
      extra: {
        type,
        data,
        timestamp: new Date().toISOString()
      },
      schedule: { at: new Date(Date.now() + 1000) } // إرسال فوري
    };
  }

  /**
   * إشعارات مجدولة ذكية
   */
  async scheduleSmartReminders(userProfile) {
    const reminders = [];

    // تذكير يومي للبحث عن وظائف (للموظفين)
    if (userProfile.role === 'employee' && userProfile.isJobSeeking) {
      reminders.push({
        id: 1001,
        title: '🔍 وقت البحث عن وظائف',
        body: 'تحقق من الوظائف الجديدة المناسبة لك',
        schedule: { 
          on: { 
            hour: 9, 
            minute: 0 
          },
          repeats: true
        }
      });
    }

    // تذكير أسبوعي لتحديث الملف الشخصي
    reminders.push({
      id: 1002,
      title: '📝 تحديث الملف الشخصي',
      body: 'حدث ملفك الشخصي لزيادة فرص الحصول على وظيفة',
      schedule: {
        on: {
          weekday: 1, // الاثنين
          hour: 10,
          minute: 0
        },
        repeats: true
      }
    });

    // جدولة الإشعارات
    if (reminders.length > 0) {
      await LocalNotifications.schedule({ notifications: reminders });
    }
  }

  /**
   * إشعارات تفاعلية مع أزرار
   */
  async sendInteractiveNotification(type, data) {
    const notification = {
      id: Date.now(),
      title: '🎯 وظيفة جديدة مناسبة لك',
      body: `${data.jobTitle} في ${data.company}`,
      actionTypeId: 'job_actions',
      actions: [
        {
          id: 'view',
          title: 'عرض التفاصيل',
          icon: 'eye'
        },
        {
          id: 'apply',
          title: 'تقديم طلب',
          icon: 'send'
        },
        {
          id: 'save',
          title: 'حفظ للاحقاً',
          icon: 'bookmark'
        }
      ],
      extra: { jobId: data.jobId, type: 'job_match' }
    };

    await LocalNotifications.schedule({ notifications: [notification] });
  }

  handleNotificationClick(notification) {
    const { type, data } = notification.notification.extra || {};
    
    switch (type) {
      case 'job_match':
        this.navigateToJob(data.jobId);
        break;
      case 'course_recommendation':
        this.navigateToCourse(data.courseId);
        break;
      case 'interview_reminder':
        this.navigateToInterview(data.interviewId);
        break;
      default:
        this.navigateToNotifications();
    }
  }

  /**
   * إحصائيات الإشعارات
   */
  getNotificationStats() {
    const logs = this.getNotificationLogs();
    
    return {
      totalSent: logs.length,
      clickRate: this.calculateClickRate(logs),
      mostEffectiveType: this.getMostEffectiveType(logs),
      userEngagement: this.calculateEngagement(logs)
    };
  }

  /**
   * تخصيص الإشعارات حسب سلوك المستخدم
   */
  async personalizeNotifications(userId) {
    const userBehavior = await this.getUserBehavior(userId);
    const preferences = {
      bestTime: userBehavior.mostActiveHour,
      preferredTypes: userBehavior.mostEngagedTypes,
      frequency: userBehavior.optimalFrequency
    };
    
    this.updateUserPreferences(userId, preferences);
    return preferences;
  }

  // Helper methods
  shouldSendNotification(type) {
    return this.userPreferences.enabledTypes.includes(type);
  }

  loadPreferences() {
    const saved = localStorage.getItem('notification_preferences');
    return saved ? JSON.parse(saved) : {
      enabledTypes: ['job_match', 'interview_reminder', 'application_status'],
      quietHours: { start: 22, end: 8 },
      maxPerDay: 5
    };
  }

  logNotification(notification) {
    const logs = this.getNotificationLogs();
    logs.push({
      ...notification,
      sentAt: new Date().toISOString(),
      clicked: false
    });
    localStorage.setItem('notification_logs', JSON.stringify(logs.slice(-100))); // آخر 100 إشعار
  }

  getNotificationLogs() {
    const logs = localStorage.getItem('notification_logs');
    return logs ? JSON.parse(logs) : [];
  }

  async sendTokenToServer(token) {
    try {
      // إرسال التوكن للخادم لحفظه
      await fetch('/api/users/push-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
    } catch (error) {
      console.error('Failed to send token to server:', error);
    }
  }

  // Navigation helpers
  navigateToJob(jobId) {
    window.location.href = `/jobs/${jobId}`;
  }

  navigateToCourse(courseId) {
    window.location.href = `/courses/${courseId}`;
  }

  navigateToInterview(interviewId) {
    window.location.href = `/interviews/${interviewId}`;
  }

  navigateToNotifications() {
    window.location.href = '/notifications';
  }
}

// إنشاء مثيل واحد للاستخدام العام
export const smartNotificationManager = new SmartNotificationManager();

// تصدير الكلاس للاستخدام المتقدم
export default SmartNotificationManager;