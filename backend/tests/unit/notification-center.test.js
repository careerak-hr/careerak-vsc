const { expect } = require('chai');
const sinon = require('sinon');
const AdminNotification = require('../../src/models/AdminNotification');
const {
  createAdminNotification,
  getAdminNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} = require('../../src/services/adminNotificationService');

/**
 * Unit Tests for Notification Center
 * 
 * Tests badge count updates, mark as read functionality, and navigation.
 * Requirements: 6.8-6.12
 */

describe('Unit Tests: Notification Center', () => {
  
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  /**
   * Test badge count updates
   * Requirements: 6.8
   */
  describe('Badge Count Updates', () => {
    
    it('should return correct unread count for admin', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      
      sandbox.stub(AdminNotification, 'countDocuments').resolves(5);

      const count = await getUnreadCount(adminId);

      expect(count).to.equal(5);
      expect(AdminNotification.countDocuments.calledOnce).to.be.true;
      expect(AdminNotification.countDocuments.calledWith({
        adminId,
        isRead: false
      })).to.be.true;
    });

    it('should return 0 when no unread notifications', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      
      sandbox.stub(AdminNotification, 'countDocuments').resolves(0);

      const count = await getUnreadCount(adminId);

      expect(count).to.equal(0);
    });

    it('should update count after marking notification as read', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      const notificationId = '507f1f77bcf86cd799439012';
      
      const countStub = sandbox.stub(AdminNotification, 'countDocuments');
      countStub.onFirstCall().resolves(5);
      countStub.onSecondCall().resolves(4);

      const findByIdAndUpdateStub = sandbox.stub(AdminNotification, 'findByIdAndUpdate').resolves({
        _id: notificationId,
        adminId,
        isRead: true
      });

      const initialCount = await getUnreadCount(adminId);
      expect(initialCount).to.equal(5);

      await markAsRead(notificationId);

      const finalCount = await getUnreadCount(adminId);
      expect(finalCount).to.equal(4);
    });

    it('should update count to 0 after marking all as read', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      
      const countStub = sandbox.stub(AdminNotification, 'countDocuments');
      countStub.onFirstCall().resolves(10);
      countStub.onSecondCall().resolves(0);

      const updateManyStub = sandbox.stub(AdminNotification, 'updateMany').resolves({
        modifiedCount: 10
      });

      const initialCount = await getUnreadCount(adminId);
      expect(initialCount).to.equal(10);

      await markAllAsRead(adminId);

      const finalCount = await getUnreadCount(adminId);
      expect(finalCount).to.equal(0);
    });
  });

  /**
   * Test mark as read functionality
   * Requirements: 6.10
   */
  describe('Mark as Read Functionality', () => {
    
    it('should mark single notification as read', async () => {
      const notificationId = '507f1f77bcf86cd799439012';
      
      const findByIdAndUpdateStub = sandbox.stub(AdminNotification, 'findByIdAndUpdate').resolves({
        _id: notificationId,
        isRead: true
      });

      const result = await markAsRead(notificationId);

      expect(result.isRead).to.be.true;
      expect(findByIdAndUpdateStub.calledOnce).to.be.true;
      expect(findByIdAndUpdateStub.calledWith(
        notificationId,
        { isRead: true },
        { new: true }
      )).to.be.true;
    });

    it('should mark all notifications as read for admin', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      
      const updateManyStub = sandbox.stub(AdminNotification, 'updateMany').resolves({
        modifiedCount: 15
      });

      const result = await markAllAsRead(adminId);

      expect(result.modifiedCount).to.equal(15);
      expect(updateManyStub.calledOnce).to.be.true;
      expect(updateManyStub.calledWith(
        { adminId, isRead: false },
        { isRead: true }
      )).to.be.true;
    });

    it('should handle marking already read notification', async () => {
      const notificationId = '507f1f77bcf86cd799439012';
      
      const findByIdAndUpdateStub = sandbox.stub(AdminNotification, 'findByIdAndUpdate').resolves({
        _id: notificationId,
        isRead: true
      });

      const result = await markAsRead(notificationId);

      expect(result.isRead).to.be.true;
      // Should still work (idempotent)
    });

    it('should handle marking non-existent notification', async () => {
      const notificationId = '507f1f77bcf86cd799439012';
      
      sandbox.stub(AdminNotification, 'findByIdAndUpdate').resolves(null);

      const result = await markAsRead(notificationId);

      expect(result).to.be.null;
    });
  });

  /**
   * Test navigation on click
   * Requirements: 6.10
   */
  describe('Navigation on Click', () => {
    
    it('should return notification with action URL', async () => {
      const notificationId = '507f1f77bcf86cd799439012';
      const actionUrl = '/admin/users/507f1f77bcf86cd799439013';
      
      sandbox.stub(AdminNotification, 'findByIdAndUpdate').resolves({
        _id: notificationId,
        actionUrl,
        isRead: true
      });

      const result = await markAsRead(notificationId);

      expect(result.actionUrl).to.equal(actionUrl);
    });

    it('should handle notification without action URL', async () => {
      const notificationId = '507f1f77bcf86cd799439012';
      
      sandbox.stub(AdminNotification, 'findByIdAndUpdate').resolves({
        _id: notificationId,
        actionUrl: undefined,
        isRead: true
      });

      const result = await markAsRead(notificationId);

      expect(result.actionUrl).to.be.undefined;
    });

    it('should preserve action URL when marking as read', async () => {
      const notificationId = '507f1f77bcf86cd799439012';
      const actionUrl = '/admin/content/flagged/507f1f77bcf86cd799439014';
      
      sandbox.stub(AdminNotification, 'findByIdAndUpdate').resolves({
        _id: notificationId,
        type: 'review_flagged',
        priority: 'high',
        title: 'Review Flagged',
        message: 'A review has been flagged',
        actionUrl,
        isRead: true
      });

      const result = await markAsRead(notificationId);

      expect(result.actionUrl).to.equal(actionUrl);
      expect(result.type).to.equal('review_flagged');
      expect(result.priority).to.equal('high');
    });
  });

  /**
   * Test notification filtering
   * Requirements: 6.11
   */
  describe('Notification Filtering', () => {
    
    it('should filter notifications by type', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      const type = 'review_flagged';
      
      sandbox.stub(AdminNotification, 'find').returns({
        sort: sinon.stub().returns({
          skip: sinon.stub().returns({
            limit: sinon.stub().resolves([
              { type: 'review_flagged', priority: 'high' },
              { type: 'review_flagged', priority: 'medium' }
            ])
          })
        })
      });

      const result = await getAdminNotifications(adminId, { type });

      expect(result).to.have.lengthOf(2);
      expect(result.every(n => n.type === type)).to.be.true;
    });

    it('should filter notifications by priority', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      const priority = 'urgent';
      
      sandbox.stub(AdminNotification, 'find').returns({
        sort: sinon.stub().returns({
          skip: sinon.stub().returns({
            limit: sinon.stub().resolves([
              { type: 'system_error', priority: 'urgent' },
              { type: 'suspicious_activity', priority: 'urgent' }
            ])
          })
        })
      });

      const result = await getAdminNotifications(adminId, { priority });

      expect(result).to.have.lengthOf(2);
      expect(result.every(n => n.priority === priority)).to.be.true;
    });

    it('should filter notifications by read status', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      const isRead = false;
      
      sandbox.stub(AdminNotification, 'find').returns({
        sort: sinon.stub().returns({
          skip: sinon.stub().returns({
            limit: sinon.stub().resolves([
              { type: 'job_posted', isRead: false },
              { type: 'user_registered', isRead: false }
            ])
          })
        })
      });

      const result = await getAdminNotifications(adminId, { isRead });

      expect(result).to.have.lengthOf(2);
      expect(result.every(n => n.isRead === isRead)).to.be.true;
    });

    it('should apply multiple filters simultaneously', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      const filters = {
        type: 'review_flagged',
        priority: 'high',
        isRead: false
      };
      
      sandbox.stub(AdminNotification, 'find').returns({
        sort: sinon.stub().returns({
          skip: sinon.stub().returns({
            limit: sinon.stub().resolves([
              { type: 'review_flagged', priority: 'high', isRead: false }
            ])
          })
        })
      });

      const result = await getAdminNotifications(adminId, filters);

      expect(result).to.have.lengthOf(1);
      expect(result[0].type).to.equal(filters.type);
      expect(result[0].priority).to.equal(filters.priority);
      expect(result[0].isRead).to.equal(filters.isRead);
    });
  });

  /**
   * Test pagination
   * Requirements: 6.11
   */
  describe('Pagination', () => {
    
    it('should paginate notifications correctly', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      const page = 2;
      const limit = 10;
      
      const skipStub = sinon.stub().returns({
        limit: sinon.stub().resolves(new Array(10).fill({ adminId }))
      });

      sandbox.stub(AdminNotification, 'find').returns({
        sort: sinon.stub().returns({
          skip: skipStub
        })
      });

      await getAdminNotifications(adminId, {}, page, limit);

      expect(skipStub.calledWith((page - 1) * limit)).to.be.true;
    });

    it('should limit results per page', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      const limit = 20;
      
      const limitStub = sinon.stub().resolves(new Array(20).fill({ adminId }));

      sandbox.stub(AdminNotification, 'find').returns({
        sort: sinon.stub().returns({
          skip: sinon.stub().returns({
            limit: limitStub
          })
        })
      });

      const result = await getAdminNotifications(adminId, {}, 1, limit);

      expect(limitStub.calledWith(limit)).to.be.true;
      expect(result).to.have.lengthOf(20);
    });
  });
});
