// 📱 نظام إدارة الإشعارات المتقدم لتطبيق Careerak
import notificationSoundManager from './notificationSounds';

class NotificationManager {
  constructor() {
    this.isEnabled = false;
    this.permission = 'default';
    this.soundsEnabled = true;
    this.init();
  }

  // تهيئة النظام
  async init() {
    // التحقق من دعم الإشعارات
    if (!('Notification' in window)) {
      console.warn('⚠️ This browser does not support notifications');
      return;
    }

    // استرجاع الإعدادات المحفوظة
    this.isEnabled = localStorage.getItem('notificationsEnabled') === 'true';
    this.soundsEnabled = localStorage.getItem('audioConsent') === 'true';
    this.permission = Notification.permission;

    console.log('📱 Notification Manager initialized:', {
      enabled: this.isEnabled,
      permission: this.permission,
      sounds: this.soundsEnabled
    });
  }

  // طلب إذن الإشعارات
  async requestPermission() {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    try {
      this.permission = await Notification.requestPermission();
      console.log('📱 Notification permission:', this.permission);
      return this.permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      throw error;
    }
  }

  // إرسال إشعار
  async sendNotification(options) {
    const {
      title,
      body,
      icon = '/logo.jpg',
      badge = '/logo.jpg',
      tag,
      userType = 'individual',
      eventType = 'general',
      data = {},
      actions = [],
      requireInteraction = false,
      silent = false
    } = options;

    try {
      // التحقق من التفعيل والإذن
      if (!this.isEnabled || this.permission !== 'granted') {
        console.log('📱 Notifications disabled or permission denied');
        return null;
      }

      // تشغيل الصوت إذا كان مفعلاً
      if (this.soundsEnabled && !silent) {
        await notificationSoundManager.playSound(userType, eventType);
      }

      // إنشاء الإشعار
      const notification = new Notification(title, {
        body,
        icon,
        badge,
        tag,
        data: { ...data, userType, eventType },
        actions,
        requireInteraction,
        silent: silent || !this.soundsEnabled
      });

      // إضافة مستمعي الأحداث
      notification.onclick = (event) => {
        console.log('📱 Notification clicked:', event);
        this.handleNotificationClick(event);
      };

      notification.onclose = (event) => {
        console.log('📱 Notification closed:', event);
      };

      notification.onerror = (event) => {
        console.error('📱 Notification error:', event);
      };

      console.log('📱 Notification sent:', title);
      return notification;

    } catch (error) {
      console.error('Failed to send notification:', error);
      return null;
    }
  }

  // معالجة النقر على الإشعار
  handleNotificationClick(event) {
    const notification = event.target;
    const data = notification.data || {};

    // إغلاق الإشعار
    notification.close();

    // التركيز على النافذة
    if (window.focus) {
      window.focus();
    }

    // معالجة حسب نوع الإشعار
    switch (data.eventType) {
      case 'jobAccepted':
      case 'jobRejected':
        // الانتقال لصفحة طلبات العمل
        window.location.href = '/job-applications';
        break;
      case 'courseCompleted':
      case 'courseEnrolled':
        // الانتقال لصفحة الدورات
        window.location.href = '/courses';
        break;
      case 'newJobPosted':
        // الانتقال لصفحة الوظائف
        window.location.href = '/job-postings';
        break;
      case 'messageReceived':
        // الانتقال لصفحة الرسائل
        window.location.href = '/messages';
        break;
      default:
        // الانتقال للصفحة الرئيسية
        window.location.href = '/profile';
    }
  }

  // إشعارات مخصصة للأفراد
  async notifyIndividual(eventType, data = {}) {
    const notifications = {
      jobAccepted: {
        title: '🎉 تهانينا! تم قبول طلبك',
        body: `تم قبولك في وظيفة ${data.jobTitle || 'الوظيفة المطلوبة'}`,
        requireInteraction: true
      },
      jobRejected: {
        title: '📋 تحديث على طلب العمل',
        body: `نأسف، لم يتم قبولك في وظيفة ${data.jobTitle || 'الوظيفة المطلوبة'}. لا تيأس، هناك فرص أخرى!`
      },
      courseCompleted: {
        title: '🎓 تهانينا! أكملت الدورة',
        body: `تم إكمال دورة ${data.courseTitle || 'الدورة التدريبية'} بنجاح`,
        requireInteraction: true
      },
      courseEnrolled: {
        title: '📚 تم التسجيل في الدورة',
        body: `تم تسجيلك بنجاح في دورة ${data.courseTitle || 'الدورة التدريبية'}`
      },
      newJobPosted: {
        title: '💼 فرصة عمل جديدة!',
        body: `وظيفة جديدة متاحة: ${data.jobTitle || 'تحقق من الوظائف المتاحة'}`
      },
      profileViewed: {
        title: '👀 تم عرض ملفك الشخصي',
        body: 'قام صاحب عمل بمشاهدة ملفك الشخصي'
      },
      messageReceived: {
        title: '💬 رسالة جديدة',
        body: data.message || 'لديك رسالة جديدة'
      },
      interviewScheduled: {
        title: '📅 موعد مقابلة جديد',
        body: `تم تحديد موعد مقابلة لوظيفة ${data.jobTitle || 'الوظيفة'}`,
        requireInteraction: true
      },
      certificateEarned: {
        title: '🏆 حصلت على شهادة!',
        body: `تم منحك شهادة في ${data.certificateTitle || 'المجال المحدد'}`,
        requireInteraction: true
      }
    };

    const config = notifications[eventType];
    if (config) {
      return await this.sendNotification({
        ...config,
        userType: 'individual',
        eventType,
        data,
        tag: `individual_${eventType}_${Date.now()}`
      });
    }
  }

  // إشعارات مخصصة للشركات
  async notifyCompany(eventType, data = {}) {
    const notifications = {
      paymentReceived: {
        title: '💰 تم استلام دفعة',
        body: `تم استلام دفعة بقيمة ${data.amount || 'المبلغ المحدد'}`,
        requireInteraction: true
      },
      paymentSent: {
        title: '💸 تم إرسال تحويل مالي',
        body: `تم إرسال ${data.amount || 'المبلغ'} بنجاح`
      },
      newApplication: {
        title: '📋 طلب توظيف جديد',
        body: `طلب جديد لوظيفة ${data.jobTitle || 'الوظيفة المنشورة'}`
      },
      candidateShortlisted: {
        title: '✅ تم اختيار مرشح',
        body: `تم إضافة ${data.candidateName || 'المرشح'} للقائمة المختصرة`
      },
      jobPostExpired: {
        title: '⏰ انتهت صلاحية إعلان الوظيفة',
        body: `انتهت صلاحية إعلان ${data.jobTitle || 'الوظيفة'}`
      },
      subscriptionRenewal: {
        title: '🔄 تجديد الاشتراك',
        body: 'حان وقت تجديد اشتراكك في المنصة',
        requireInteraction: true
      },
      reportGenerated: {
        title: '📊 تقرير جاهز',
        body: `تم إنشاء تقرير ${data.reportType || 'التقرير المطلوب'}`
      },
      teamUpdate: {
        title: '👥 تحديث الفريق',
        body: data.message || 'تحديث جديد من فريق العمل'
      },
      contractSigned: {
        title: '📝 تم توقيع العقد',
        body: `تم توقيع عقد مع ${data.employeeName || 'الموظف الجديد'}`,
        requireInteraction: true
      }
    };

    const config = notifications[eventType];
    if (config) {
      return await this.sendNotification({
        ...config,
        userType: 'company',
        eventType,
        data,
        tag: `company_${eventType}_${Date.now()}`
      });
    }
  }

  // إشعارات عامة
  async notifyGeneral(eventType, data = {}) {
    const notifications = {
      systemUpdate: {
        title: '🔄 تحديث النظام',
        body: 'تم تحديث التطبيق إلى إصدار جديد'
      },
      maintenance: {
        title: '🔧 صيانة مجدولة',
        body: 'سيتم إجراء صيانة للنظام قريباً'
      },
      welcome: {
        title: '🎉 مرحباً بك في Careerak',
        body: 'نتمنى لك تجربة رائعة في منصتنا'
      }
    };

    const config = notifications[eventType];
    if (config) {
      return await this.sendNotification({
        ...config,
        userType: 'general',
        eventType,
        data,
        tag: `general_${eventType}_${Date.now()}`
      });
    }
  }

  // تفعيل/تعطيل الإشعارات
  setEnabled(enabled) {
    this.isEnabled = enabled;
    localStorage.setItem('notificationsEnabled', enabled ? 'true' : 'false');
    console.log(`📱 Notifications ${enabled ? 'enabled' : 'disabled'}`);
  }

  // تفعيل/تعطيل أصوات الإشعارات
  setSoundsEnabled(enabled) {
    this.soundsEnabled = enabled;
    notificationSoundManager.setEnabled(enabled);
    console.log(`🔊 Notification sounds ${enabled ? 'enabled' : 'disabled'}`);
  }

  // اختبار الإشعار
  async testNotification(userType = 'individual') {
    const testData = {
      individual: {
        eventType: 'jobAccepted',
        data: { jobTitle: 'مطور واجهات أمامية' }
      },
      company: {
        eventType: 'paymentReceived',
        data: { amount: '1000 ريال' }
      }
    };

    const test = testData[userType] || testData.individual;
    
    if (userType === 'individual') {
      return await this.notifyIndividual(test.eventType, test.data);
    } else {
      return await this.notifyCompany(test.eventType, test.data);
    }
  }
}

// إنشاء مثيل واحد للاستخدام في التطبيق
const notificationManager = new NotificationManager();

export default notificationManager;

// تصدير دوال مساعدة
export const sendNotification = (options) => notificationManager.sendNotification(options);
export const notifyIndividual = (eventType, data) => notificationManager.notifyIndividual(eventType, data);
export const notifyCompany = (eventType, data) => notificationManager.notifyCompany(eventType, data);
export const setNotificationsEnabled = (enabled) => notificationManager.setEnabled(enabled);
export const testNotification = (userType) => notificationManager.testNotification(userType);