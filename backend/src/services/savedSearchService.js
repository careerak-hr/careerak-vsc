const SavedSearch = require('../models/SavedSearch');
const notificationService = require('./notificationService');

class SavedSearchService {
  /**
   * إنشاء عملية بحث محفوظة جديدة
   * @param {String} userId - معرف المستخدم
   * @param {Object} searchData - بيانات البحث
   * @returns {Promise<Object>} - عملية البحث المحفوظة
   */
  async create(userId, searchData) {
    try {
      const savedSearch = new SavedSearch({
        userId,
        ...searchData
      });

      await savedSearch.save();

      // إرسال إشعار
      await notificationService.createNotification({
        recipient: userId,
        type: 'system',
        title: 'تم حفظ البحث',
        message: `تم حفظ عملية البحث "${savedSearch.name}" بنجاح`,
        priority: 'medium'
      });

      return savedSearch;
    } catch (error) {
      if (error.name === 'ValidationError' && error.message.includes('Maximum 10')) {
        throw error;
      }
      throw new Error(`Failed to create saved search: ${error.message}`);
    }
  }

  /**
   * جلب جميع عمليات البحث المحفوظة للمستخدم
   * @param {String} userId - معرف المستخدم
   * @returns {Promise<Array>} - قائمة عمليات البحث المحفوظة
   */
  async getAll(userId) {
    try {
      const savedSearches = await SavedSearch
        .find({ userId })
        .sort({ createdAt: -1 })
        .lean();

      return savedSearches;
    } catch (error) {
      throw new Error(`Failed to fetch saved searches: ${error.message}`);
    }
  }

  /**
   * جلب عملية بحث محفوظة واحدة
   * @param {String} userId - معرف المستخدم
   * @param {String} searchId - معرف عملية البحث
   * @returns {Promise<Object>} - عملية البحث المحفوظة
   */
  async getById(userId, searchId) {
    try {
      const savedSearch = await SavedSearch.findOne({
        _id: searchId,
        userId
      }).lean();

      if (!savedSearch) {
        const error = new Error('Saved search not found');
        error.statusCode = 404;
        throw error;
      }

      return savedSearch;
    } catch (error) {
      throw error;
    }
  }

  /**
   * تحديث عملية بحث محفوظة
   * @param {String} userId - معرف المستخدم
   * @param {String} searchId - معرف عملية البحث
   * @param {Object} updateData - البيانات المحدثة
   * @returns {Promise<Object>} - عملية البحث المحدثة
   */
  async update(userId, searchId, updateData) {
    try {
      const savedSearch = await SavedSearch.findOne({
        _id: searchId,
        userId
      });

      if (!savedSearch) {
        const error = new Error('Saved search not found');
        error.statusCode = 404;
        throw error;
      }

      // تحديث الحقول المسموح بها
      const allowedFields = [
        'name',
        'searchParams',
        'alertEnabled',
        'alertFrequency',
        'notificationMethod'
      ];

      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          savedSearch[field] = updateData[field];
        }
      });

      await savedSearch.save();

      // إرسال إشعار
      await notificationService.createNotification({
        recipient: userId,
        type: 'system',
        title: 'تم تحديث البحث',
        message: `تم تحديث عملية البحث "${savedSearch.name}" بنجاح`,
        priority: 'medium'
      });

      return savedSearch;
    } catch (error) {
      throw error;
    }
  }

  /**
   * حذف عملية بحث محفوظة
   * @param {String} userId - معرف المستخدم
   * @param {String} searchId - معرف عملية البحث
   * @returns {Promise<Object>} - رسالة النجاح
   */
  async delete(userId, searchId) {
    try {
      const savedSearch = await SavedSearch.findOne({
        _id: searchId,
        userId
      });

      if (!savedSearch) {
        const error = new Error('Saved search not found');
        error.statusCode = 404;
        throw error;
      }

      const searchName = savedSearch.name;
      await SavedSearch.deleteOne({ _id: searchId });

      // إرسال إشعار
      await notificationService.createNotification({
        recipient: userId,
        type: 'system',
        title: 'تم حذف البحث',
        message: `تم حذف عملية البحث "${searchName}" بنجاح`,
        priority: 'medium'
      });

      return { message: 'Saved search deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * عد عمليات البحث المحفوظة للمستخدم
   * @param {String} userId - معرف المستخدم
   * @returns {Promise<Number>} - عدد عمليات البحث
   */
  async count(userId) {
    try {
      const count = await SavedSearch.countDocuments({ userId });
      return count;
    } catch (error) {
      throw new Error(`Failed to count saved searches: ${error.message}`);
    }
  }

  /**
   * التحقق من إمكانية إضافة عملية بحث جديدة
   * @param {String} userId - معرف المستخدم
   * @returns {Promise<Boolean>} - true إذا كان يمكن الإضافة
   */
  async canAddMore(userId) {
    try {
      const count = await this.count(userId);
      return count < 10;
    } catch (error) {
      throw new Error(`Failed to check saved search limit: ${error.message}`);
    }
  }
}

module.exports = new SavedSearchService();
