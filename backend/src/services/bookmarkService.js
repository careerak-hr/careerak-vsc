const JobBookmark = require('../models/JobBookmark');
const JobPosting = require('../models/JobPosting');
const notificationService = require('./notificationService');

class BookmarkService {
  /**
   * تبديل حالة الحفظ (toggle bookmark)
   * @param {String} userId - معرف المستخدم
   * @param {String} jobId - معرف الوظيفة
   * @returns {Object} { bookmarked: Boolean, bookmark: Object }
   */
  async toggleBookmark(userId, jobId) {
    try {
      // التحقق من وجود الوظيفة
      const job = await JobPosting.findById(jobId);
      if (!job) {
        throw new Error('الوظيفة غير موجودة');
      }

      // البحث عن bookmark موجود
      const existing = await JobBookmark.findOne({ userId, jobId });

      if (existing) {
        // إزالة من المفضلة
        await JobBookmark.deleteOne({ _id: existing._id });
        
        // تحديث العداد
        await JobPosting.findByIdAndUpdate(
          jobId,
          { $inc: { bookmarkCount: -1 } },
          { new: true }
        );

        return {
          bookmarked: false,
          message: 'تم إزالة الوظيفة من المفضلة'
        };
      } else {
        // إضافة للمفضلة
        const bookmark = await JobBookmark.create({
          userId,
          jobId,
          bookmarkedAt: new Date()
        });

        // تحديث العداد
        await JobPosting.findByIdAndUpdate(
          jobId,
          { $inc: { bookmarkCount: 1 } },
          { new: true }
        );

        return {
          bookmarked: true,
          bookmark,
          message: 'تم إضافة الوظيفة إلى المفضلة'
        };
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  }

  /**
   * الحصول على جميع الوظائف المحفوظة للمستخدم
   * @param {String} userId - معرف المستخدم
   * @param {Object} filters - فلاتر إضافية
   * @returns {Array} قائمة الوظائف المحفوظة
   */
  async getBookmarkedJobs(userId, filters = {}) {
    try {
      const query = { userId };

      // فلترة حسب التاريخ
      if (filters.startDate || filters.endDate) {
        query.bookmarkedAt = {};
        if (filters.startDate) {
          query.bookmarkedAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.bookmarkedAt.$lte = new Date(filters.endDate);
        }
      }

      // فلترة حسب Tags
      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }

      const bookmarks = await JobBookmark.find(query)
        .sort({ bookmarkedAt: -1 })
        .populate({
          path: 'jobId',
          match: { status: 'Open' }, // فقط الوظائف النشطة
          populate: {
            path: 'postedBy',
            select: 'name email company'
          }
        })
        .lean();

      // إزالة الوظائف المحذوفة أو المغلقة
      const validBookmarks = bookmarks.filter(b => b.jobId);

      return validBookmarks.map(bookmark => ({
        ...bookmark.jobId,
        bookmarkId: bookmark._id,
        bookmarkedAt: bookmark.bookmarkedAt,
        notes: bookmark.notes,
        tags: bookmark.tags,
        notifyOnChange: bookmark.notifyOnChange
      }));
    } catch (error) {
      console.error('Error getting bookmarked jobs:', error);
      throw error;
    }
  }

  /**
   * التحقق من حفظ وظيفة معينة
   * @param {String} userId - معرف المستخدم
   * @param {String} jobId - معرف الوظيفة
   * @returns {Boolean} true إذا كانت محفوظة
   */
  async isBookmarked(userId, jobId) {
    try {
      const bookmark = await JobBookmark.findOne({ userId, jobId });
      return !!bookmark;
    } catch (error) {
      console.error('Error checking bookmark:', error);
      return false;
    }
  }

  /**
   * تحديث ملاحظات أو tags للوظيفة المحفوظة
   * @param {String} userId - معرف المستخدم
   * @param {String} jobId - معرف الوظيفة
   * @param {Object} updates - التحديثات (notes, tags, notifyOnChange)
   * @returns {Object} الـ bookmark المحدث
   */
  async updateBookmark(userId, jobId, updates) {
    try {
      const allowedUpdates = ['notes', 'tags', 'notifyOnChange'];
      const updateData = {};

      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          updateData[key] = updates[key];
        }
      });

      updateData.updatedAt = Date.now();

      const bookmark = await JobBookmark.findOneAndUpdate(
        { userId, jobId },
        updateData,
        { new: true }
      );

      if (!bookmark) {
        throw new Error('الوظيفة غير محفوظة');
      }

      return bookmark;
    } catch (error) {
      console.error('Error updating bookmark:', error);
      throw error;
    }
  }

  /**
   * إشعار المستخدمين عند تغيير حالة الوظيفة
   * @param {String} jobId - معرف الوظيفة
   * @param {String} changeType - نوع التغيير (closed, updated, etc.)
   * @returns {Number} عدد الإشعارات المرسلة
   */
  async notifyBookmarkChanges(jobId, changeType = 'updated') {
    try {
      // الحصول على جميع المستخدمين الذين حفظوا الوظيفة مع تفعيل الإشعارات
      const bookmarks = await JobBookmark.find({
        jobId,
        notifyOnChange: true
      }).select('userId');

      if (bookmarks.length === 0) {
        return 0;
      }

      // الحصول على معلومات الوظيفة
      const job = await JobPosting.findById(jobId).select('title company status');
      if (!job) {
        return 0;
      }

      // تحديد نوع الإشعار والرسالة
      let notificationType, message;
      
      if (changeType === 'closed' || job.status === 'Closed') {
        notificationType = 'job_closed';
        message = `تم إغلاق الوظيفة "${job.title}" التي حفظتها`;
      } else {
        notificationType = 'job_updated';
        message = `تم تحديث الوظيفة "${job.title}" التي حفظتها`;
      }

      // إرسال إشعار لكل مستخدم
      let sentCount = 0;
      for (const bookmark of bookmarks) {
        try {
          await notificationService.createNotification({
            userId: bookmark.userId,
            type: notificationType,
            title: 'تحديث وظيفة محفوظة',
            message,
            relatedId: jobId,
            relatedModel: 'JobPosting',
            priority: changeType === 'closed' ? 'medium' : 'low'
          });
          sentCount++;
        } catch (err) {
          console.error(`Failed to send notification to user ${bookmark.userId}:`, err);
        }
      }

      return sentCount;
    } catch (error) {
      console.error('Error notifying bookmark changes:', error);
      return 0;
    }
  }

  /**
   * الحصول على إحصائيات الحفظ للمستخدم
   * @param {String} userId - معرف المستخدم
   * @returns {Object} إحصائيات
   */
  async getBookmarkStats(userId) {
    try {
      const total = await JobBookmark.countDocuments({ userId });
      
      const byStatus = await JobBookmark.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'jobpostings',
            localField: 'jobId',
            foreignField: '_id',
            as: 'job'
          }
        },
        { $unwind: '$job' },
        {
          $group: {
            _id: '$job.status',
            count: { $sum: 1 }
          }
        }
      ]);

      const recentCount = await JobBookmark.countDocuments({
        userId,
        bookmarkedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });

      return {
        total,
        byStatus: byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentCount
      };
    } catch (error) {
      console.error('Error getting bookmark stats:', error);
      throw error;
    }
  }
}

module.exports = new BookmarkService();
