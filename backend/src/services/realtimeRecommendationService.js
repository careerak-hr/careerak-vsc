/**
 * 🤖 Real-time Recommendation Service
 * خدمة التوصيات في الوقت الفعلي
 * 
 * تتعقب تحديثات الملف الشخصي وتولد توصيات جديدة تلقائياً
 * مع ضمان تحديث التوصيات خلال دقيقة واحدة من التحديث
 * 
 * المتطلبات: 1.5, 7.2 (تحديث فوري عند تغيير الملف الشخصي)
 * Property 7: Real-time Update - Validates Requirements 1.5, 7.2
 */

const ContentBasedFiltering = require('./contentBasedFiltering');
const JobPosting = require('../models/JobPosting');
const Recommendation = require('../models/Recommendation');

class RealTimeRecommendationService {
  constructor() {
    this.contentBasedFiltering = new ContentBasedFiltering();
    this.updateQueue = new Map(); // تخزين تحديثات قيد المعالجة
    this.processing = false;
    this.maxProcessingTime = 60000; // 1 دقيقة كحد أقصى
  }

  /**
   * تسجيل تحديث الملف الشخصي وبدء معالجة التوصيات
   * @param {string} userId - معرف المستخدم
   * @param {Object} updatedFields - الحقول المحدثة
   * @returns {Promise<Object>} - نتيجة المعالجة
   */
  async handleProfileUpdate(userId, updatedFields) {
    try {
      console.log(`🔄 بدء معالجة تحديث الملف الشخصي للمستخدم ${userId}`);
      
      // تسجيل وقت البدء
      const startTime = Date.now();
      
      // إضافة التحديث إلى قائمة الانتظار
      this.updateQueue.set(userId, {
        userId,
        updatedFields,
        startTime,
        status: 'pending'
      });

      // بدء المعالجة إذا لم تكن جارية
      if (!this.processing) {
        this.processUpdates();
      }

      // إرجاع تأكيد الاستلام مع وقت الاستجابة المتوقع
      return {
        success: true,
        message: 'تم استلام تحديث الملف الشخصي، سيتم تحديث التوصيات خلال دقيقة',
        userId,
        expectedCompletion: new Date(startTime + this.maxProcessingTime),
        queuePosition: this.updateQueue.size
      };

    } catch (error) {
      console.error('❌ خطأ في تسجيل تحديث الملف الشخصي:', error);
      return {
        success: false,
        message: 'فشل في تسجيل تحديث الملف الشخصي',
        error: error.message
      };
    }
  }

  /**
   * معالجة تحديثات الملفات الشخصية في قائمة الانتظار
   */
  async processUpdates() {
    if (this.processing || this.updateQueue.size === 0) {
      return;
    }

    this.processing = true;
    console.log(`⚙️ بدء معالجة ${this.updateQueue.size} تحديث في قائمة الانتظار`);

    try {
      // معالجة كل تحديث في قائمة الانتظار
      for (const [userId, update] of this.updateQueue) {
        if (update.status === 'pending') {
          await this.processSingleUpdate(update);
        }
      }

      // تنظيف التحديثات المكتملة
      this.cleanupCompletedUpdates();

    } catch (error) {
      console.error('❌ خطأ في معالجة تحديثات الملفات الشخصية:', error);
    } finally {
      this.processing = false;
      
      // إذا كانت هناك تحديثات جديدة، معالجتها
      if (this.updateQueue.size > 0) {
        setTimeout(() => this.processUpdates(), 1000);
      }
    }
  }

  /**
   * معالجة تحديث واحد
   * @param {Object} update - بيانات التحديث
   */
  async processSingleUpdate(update) {
    const { userId, updatedFields, startTime } = update;
    
    try {
      // تحديث حالة التحديث
      update.status = 'processing';
      this.updateQueue.set(userId, update);

      console.log(`🔄 معالجة تحديثات المستخدم ${userId}...`);

      // 1. جلب بيانات المستخدم المحدثة
      const User = require('../models/User');
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error(`المستخدم ${userId} غير موجود`);
      }

      // 2. جلب الوظائف المتاحة
      const jobs = await JobPosting.find({ 
        status: 'active',
        expiresAt: { $gt: new Date() }
      }).limit(100); // الحد الأقصى 100 وظيفة للمعالجة

      if (jobs.length === 0) {
        console.log(`⚠️ لا توجد وظائف نشطة للمستخدم ${userId}`);
        update.status = 'completed';
        update.result = { success: true, message: 'لا توجد وظائف نشطة' };
        this.updateQueue.set(userId, update);
        return;
      }

      // 3. توليد توصيات جديدة
      const recommendations = await this.contentBasedFiltering.rankJobsByMatch(
        user,
        jobs,
        {
          saveToDB: true,
          limit: 20,
          minScore: 0.3
        }
      );

      // 4. حساب وقت المعالجة
      const processingTime = Date.now() - startTime;
      
      // 5. تسجيل النتيجة
      update.status = 'completed';
      update.processingTime = processingTime;
      update.result = {
        success: true,
        recommendationsCount: recommendations.length,
        processingTime: `${processingTime}ms`,
        withinOneMinute: processingTime <= this.maxProcessingTime,
        message: processingTime <= this.maxProcessingTime 
          ? '✅ تم تحديث التوصيات خلال الوقت المطلوب (دقيقة واحدة)'
          : `⚠️ تم تحديث التوصيات في ${processingTime}ms (تجاوز الدقيقة)`
      };

      this.updateQueue.set(userId, update);

      console.log(`✅ تم تحديث ${recommendations.length} توصية للمستخدم ${userId} في ${processingTime}ms`);

      // 6. إرسال إشعار (اختياري)
      await this.sendUpdateNotification(userId, recommendations.length, processingTime);

    } catch (error) {
      console.error(`❌ خطأ في معالجة تحديث المستخدم ${userId}:`, error);
      
      update.status = 'failed';
      update.error = error.message;
      update.result = {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime
      };
      
      this.updateQueue.set(userId, update);
    }
  }

  /**
   * تنظيف التحديثات المكتملة
   */
  cleanupCompletedUpdates() {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 دقائق كحد أقصى للتخزين

    for (const [userId, update] of this.updateQueue) {
      if (update.status === 'completed' || update.status === 'failed') {
        const age = now - update.startTime;
        if (age > maxAge) {
          this.updateQueue.delete(userId);
        }
      }
    }
  }

  /**
   * إرسال إشعار بتحديث التوصيات
   * @param {string} userId - معرف المستخدم
   * @param {number} count - عدد التوصيات
   * @param {number} processingTime - وقت المعالجة
   */
  async sendUpdateNotification(userId, count, processingTime) {
    try {
      const Notification = require('../models/Notification');
      
      await Notification.create({
        userId,
        type: 'recommendations_updated',
        title: 'تم تحديث توصيات الوظائف',
        message: `تم تحديث ${count} توصية وظيفة بناءً على تحديثات ��لفك الشخصي`,
        data: {
          recommendationsCount: count,
          processingTime,
          updatedAt: new Date()
        },
        priority: 'medium',
        read: false
      });

      console.log(`📨 تم إرسال إشعار تحديث التوصيات للمستخدم ${userId}`);

    } catch (error) {
      console.warn(`⚠️ فشل إرسال إشعار تحديث التوصيات: ${error.message}`);
      // لا نرمي الخطأ حتى لا نؤثر على العملية الرئيسية
    }
  }

  /**
   * الحصول على حالة تحديث معين
   * @param {string} userId - معرف المستخدم
   * @returns {Object} - حالة التحديث
   */
  getUpdateStatus(userId) {
    const update = this.updateQueue.get(userId);
    
    if (!update) {
      return {
        found: false,
        message: 'لا يوجد تحديث قيد المعالجة لهذا المستخدم'
      };
    }

    const processingTime = update.startTime ? Date.now() - update.startTime : 0;
    const withinTimeLimit = processingTime <= this.maxProcessingTime;

    return {
      found: true,
      userId,
      status: update.status,
      processingTime: `${processingTime}ms`,
      withinOneMinute: withinTimeLimit,
      startTime: new Date(update.startTime),
      updatedFields: update.updatedFields || {},
      result: update.result || null,
      error: update.error || null
    };
  }

  /**
   * الحصول على إحصائيات المعالجة
   * @returns {Object} - إحصائيات
   */
  getProcessingStats() {
    const stats = {
      totalUpdates: this.updateQueue.size,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      averageProcessingTime: 0
    };

    let totalTime = 0;
    let completedCount = 0;

    for (const update of this.updateQueue.values()) {
      stats[update.status] = (stats[update.status] || 0) + 1;
      
      if (update.processingTime) {
        totalTime += update.processingTime;
        completedCount++;
      }
    }

    if (completedCount > 0) {
      stats.averageProcessingTime = Math.round(totalTime / completedCount);
    }

    return stats;
  }

  /**
   * التحقق من تحديثات الملف الشخصي التي تؤثر على التوصيات
   * @param {Object} updatedFields - الحقول المحدثة
   * @returns {boolean} - هل التحديث يؤثر على التوصيات؟
   */
  isRecommendationRelevantUpdate(updatedFields) {
    // الحقول التي تؤثر على التوصيات
    const relevantFields = [
      'skills', 'computerSkills', 'softwareSkills', 'otherSkills',
      'experienceList', 'educationList', 'trainingList',
      'languages', 'specialization', 'interests',
      'city', 'country', 'location'
    ];

    // التحقق من وجود أي حقل ذي صلة في التحديثات
    return Object.keys(updatedFields).some(field => 
      relevantFields.some(relevant => 
        field.includes(relevant) || relevant.includes(field)
      )
    );
  }

  /**
   * معالجة تحديث الملف الشخصي مع التحقق من الأهمية
   * @param {string} userId - معرف المستخدم
   * @param {Object} updatedFields - الحقول المحدثة
   * @returns {Promise<Object>} - نتيجة المعالجة
   */
  async processProfileUpdateIfRelevant(userId, updatedFields) {
    // التحقق مما إذا كان التحديث يؤثر على التوصيات
    if (!this.isRecommendationRelevantUpdate(updatedFields)) {
      console.log(`ℹ️ تحديث الملف الشخصي للمستخدم ${userId} لا يؤثر على التوصيات، تخطي المعالجة`);
      return {
        success: true,
        message: 'التحديث لا يؤثر على التوصيات، تم تخطي المعالجة',
        relevant: false
      };
    }

    console.log(`🎯 تحديث الملف الشخصي للمستخدم ${userId} يؤثر على التوصيات، بدء المعالجة`);
    return this.handleProfileUpdate(userId, updatedFields);
  }
}

// إنشاء نسخة واحدة من الخدمة (Singleton)
const realTimeRecommendationService = new RealTimeRecommendationService();

module.exports = realTimeRecommendationService;