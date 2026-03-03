/**
 * اختبارات إشعارات عمليات البحث المحفوظة
 * Feature: advanced-search-filter
 * Property 10: Save Operation Notifications
 * Validates: Requirements 3.4
 */

const mongoose = require('mongoose');
const SavedSearch = require('../src/models/SavedSearch');
const Notification = require('../src/models/Notification');
const savedSearchService = require('../src/services/savedSearchService');

describe('Saved Search Notifications - Property 10', () => {
  let testUser;

  beforeAll(async () => {
    // الاتصال بقاعدة البيانات للاختبار
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test');
    }
  });

  beforeEach(async () => {
    // تنظيف البيانات
    await SavedSearch.deleteMany({});
    await Notification.deleteMany({});

    // إنشاء مستخدم اختبار
    testUser = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test User',
      email: 'test@example.com',
      role: 'user'
    };
  });

  afterAll(async () => {
    // تنظيف وإغلاق الاتصال
    await SavedSearch.deleteMany({});
    await Notification.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Create Operation Notifications', () => {
    it('should send exactly one notification when saving a search', async () => {
      // إنشاء عملية بحث محفوظة
      const searchData = {
        name: 'Developer Jobs',
        searchType: 'jobs',
        searchParams: {
          query: 'developer',
          location: 'Cairo'
        }
      };

      await savedSearchService.create(testUser._id, searchData);

      // التحقق من الإشعار
      const notifications = await Notification.find({
        recipient: testUser._id,
        type: 'system'
      });

      expect(notifications).toHaveLength(1);
      expect(notifications[0].title).toBe('تم حفظ البحث');
      expect(notifications[0].message).toContain('Developer Jobs');
      expect(notifications[0].message).toContain('تم حفظ عملية البحث');
    });

    it('should include search name in notification message', async () => {
      const searchData = {
        name: 'Senior React Developer',
        searchType: 'jobs',
        searchParams: { query: 'react' }
      };

      await savedSearchService.create(testUser._id, searchData);

      const notification = await Notification.findOne({
        recipient: testUser._id
      });

      expect(notification.message).toContain('Senior React Developer');
    });

    it('should set correct notification priority', async () => {
      const searchData = {
        name: 'Test Search',
        searchType: 'jobs',
        searchParams: {}
      };

      await savedSearchService.create(testUser._id, searchData);

      const notification = await Notification.findOne({
        recipient: testUser._id
      });

      expect(notification.priority).toBe('medium');
    });
  });

  describe('Update Operation Notifications', () => {
    it('should send exactly one notification when updating a search', async () => {
      // إنشاء عملية بحث
      const savedSearch = await savedSearchService.create(testUser._id, {
        name: 'Original Name',
        searchType: 'jobs',
        searchParams: {}
      });

      // حذف الإشعار الأول
      await Notification.deleteMany({});

      // تحديث عملية البحث
      await savedSearchService.update(testUser._id, savedSearch._id, {
        name: 'Updated Name'
      });

      // التحقق من الإشعار
      const notifications = await Notification.find({
        recipient: testUser._id
      });

      expect(notifications).toHaveLength(1);
      expect(notifications[0].title).toBe('تم تحديث البحث');
      expect(notifications[0].message).toContain('Updated Name');
    });

    it('should include updated search name in notification', async () => {
      const savedSearch = await savedSearchService.create(testUser._id, {
        name: 'Old Name',
        searchType: 'jobs',
        searchParams: {}
      });

      await Notification.deleteMany({});

      await savedSearchService.update(testUser._id, savedSearch._id, {
        name: 'New Name'
      });

      const notification = await Notification.findOne({
        recipient: testUser._id
      });

      expect(notification.message).toContain('New Name');
      expect(notification.message).not.toContain('Old Name');
    });
  });

  describe('Delete Operation Notifications', () => {
    it('should send exactly one notification when deleting a search', async () => {
      // إنشاء عملية بحث
      const savedSearch = await savedSearchService.create(testUser._id, {
        name: 'To Be Deleted',
        searchType: 'jobs',
        searchParams: {}
      });

      // حذف الإشعار الأول
      await Notification.deleteMany({});

      // حذف عملية البحث
      await savedSearchService.delete(testUser._id, savedSearch._id);

      // التحقق من الإشعار
      const notifications = await Notification.find({
        recipient: testUser._id
      });

      expect(notifications).toHaveLength(1);
      expect(notifications[0].title).toBe('تم حذف البحث');
      expect(notifications[0].message).toContain('To Be Deleted');
    });

    it('should include deleted search name in notification', async () => {
      const savedSearch = await savedSearchService.create(testUser._id, {
        name: 'Deleted Search',
        searchType: 'jobs',
        searchParams: {}
      });

      await Notification.deleteMany({});

      await savedSearchService.delete(testUser._id, savedSearch._id);

      const notification = await Notification.findOne({
        recipient: testUser._id
      });

      expect(notification.message).toContain('Deleted Search');
      expect(notification.message).toContain('تم حذف عملية البحث');
    });
  });

  describe('Multiple Operations', () => {
    it('should send separate notifications for each operation', async () => {
      // إنشاء
      const savedSearch = await savedSearchService.create(testUser._id, {
        name: 'Test Search',
        searchType: 'jobs',
        searchParams: {}
      });

      // تحديث
      await savedSearchService.update(testUser._id, savedSearch._id, {
        name: 'Updated Search'
      });

      // حذف
      await savedSearchService.delete(testUser._id, savedSearch._id);

      // التحقق من الإشعارات
      const notifications = await Notification.find({
        recipient: testUser._id
      }).sort({ createdAt: 1 });

      expect(notifications).toHaveLength(3);
      expect(notifications[0].title).toBe('تم حفظ البحث');
      expect(notifications[1].title).toBe('تم تحديث البحث');
      expect(notifications[2].title).toBe('تم حذف البحث');
    });

    it('should not send duplicate notifications for same operation', async () => {
      const searchData = {
        name: 'Test Search',
        searchType: 'jobs',
        searchParams: {}
      };

      await savedSearchService.create(testUser._id, searchData);

      const notifications = await Notification.find({
        recipient: testUser._id
      });

      // يجب أن يكون هناك إشعار واحد فقط
      expect(notifications).toHaveLength(1);
    });
  });

  describe('Notification Content Validation', () => {
    it('should have correct notification structure for create', async () => {
      await savedSearchService.create(testUser._id, {
        name: 'Test',
        searchType: 'jobs',
        searchParams: {}
      });

      const notification = await Notification.findOne({
        recipient: testUser._id
      });

      expect(notification).toHaveProperty('recipient');
      expect(notification).toHaveProperty('type');
      expect(notification).toHaveProperty('title');
      expect(notification).toHaveProperty('message');
      expect(notification).toHaveProperty('priority');
      expect(notification).toHaveProperty('isRead');
      expect(notification.isRead).toBe(false);
    });

    it('should have correct notification structure for update', async () => {
      const savedSearch = await savedSearchService.create(testUser._id, {
        name: 'Test',
        searchType: 'jobs',
        searchParams: {}
      });

      await Notification.deleteMany({});

      await savedSearchService.update(testUser._id, savedSearch._id, {
        name: 'Updated'
      });

      const notification = await Notification.findOne({
        recipient: testUser._id
      });

      expect(notification.type).toBe('system');
      expect(notification.priority).toBe('medium');
      expect(notification.isRead).toBe(false);
    });

    it('should have correct notification structure for delete', async () => {
      const savedSearch = await savedSearchService.create(testUser._id, {
        name: 'Test',
        searchType: 'jobs',
        searchParams: {}
      });

      await Notification.deleteMany({});

      await savedSearchService.delete(testUser._id, savedSearch._id);

      const notification = await Notification.findOne({
        recipient: testUser._id
      });

      expect(notification.type).toBe('system');
      expect(notification.priority).toBe('medium');
      expect(notification.isRead).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should not send notification if create fails', async () => {
      // محاولة إنشاء عملية بحث بدون بيانات مطلوبة
      try {
        await savedSearchService.create(testUser._id, {
          // بدون name و searchType
          searchParams: {}
        });
      } catch (error) {
        // متوقع أن يفشل
      }

      const notifications = await Notification.find({
        recipient: testUser._id
      });

      expect(notifications).toHaveLength(0);
    });

    it('should not send notification if update fails (not found)', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      try {
        await savedSearchService.update(testUser._id, fakeId, {
          name: 'Updated'
        });
      } catch (error) {
        // متوقع أن يفشل
      }

      const notifications = await Notification.find({
        recipient: testUser._id
      });

      expect(notifications).toHaveLength(0);
    });

    it('should not send notification if delete fails (not found)', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      try {
        await savedSearchService.delete(testUser._id, fakeId);
      } catch (error) {
        // متوقع أن يفشل
      }

      const notifications = await Notification.find({
        recipient: testUser._id
      });

      expect(notifications).toHaveLength(0);
    });
  });

  describe('User-specific Notifications', () => {
    it('should send notification only to the correct user', async () => {
      // إنشاء مستخدم ثاني
      const user2 = {
        _id: new mongoose.Types.ObjectId(),
        name: 'User 2',
        email: 'user2@example.com',
        role: 'user'
      };

      // إنشاء عملية بحث للمستخدم الأول
      await savedSearchService.create(testUser._id, {
        name: 'User 1 Search',
        searchType: 'jobs',
        searchParams: {}
      });

      // التحقق من الإشعارات
      const user1Notifications = await Notification.find({
        recipient: testUser._id
      });

      const user2Notifications = await Notification.find({
        recipient: user2._id
      });

      expect(user1Notifications).toHaveLength(1);
      expect(user2Notifications).toHaveLength(0);
    });
  });
});
