/**
 * End-to-End Test: Admin Notifications
 * 
 * Test Flow:
 * 1. Admin login
 * 2. View notifications
 * 3. Click notification
 * 4. Verify navigation to correct page
 * 5. Verify notification marked as read
 * 
 * Validates: Requirements 6.1-6.12
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const AdminNotification = require('../../src/models/AdminNotification');
const JobPosting = require('../../src/models/JobPosting');
const Course = require('../../src/models/Course');
const Review = require('../../src/models/Review');
const { generateToken } = require('../../src/utils/auth');

describe('E2E: Admin Notifications', () => {
  let adminUser;
  let adminToken;
  let testNotifications;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/careerak-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear test data
    await User.deleteMany({});
    await AdminNotification.deleteMany({});
    await JobPosting.deleteMany({});
    await Course.deleteMany({});
    await Review.deleteMany({});

    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'Admin123!@#',
      role: 'admin',
      userType: 'admin'
    });

    adminToken = generateToken(adminUser._id);

    // Create test notifications with different types and priorities
    testNotifications = await AdminNotification.insertMany([
      {
        adminId: adminUser._id,
        type: 'user_registered',
        priority: 'low',
        title: 'New User Registration',
        message: 'A new user has registered',
        actionUrl: '/admin/users',
        isRead: false,
        timestamp: new Date('2024-02-01T10:00:00Z')
      },
      {
        adminId: adminUser._id,
        type: 'job_posted',
        priority: 'medium',
        title: 'New Job Posted',
        message: 'A company posted a new job',
        actionUrl: '/admin/jobs',
        isRead: false,
        timestamp: new Date('2024-02-02T11:00:00Z')
      },
      {
        adminId: adminUser._id,
        type: 'review_flagged',
        priority: 'high',
        title: 'Review Flagged',
        message: 'A review has been flagged for moderation',
        actionUrl: '/admin/content/flagged',
        isRead: false,
        timestamp: new Date('2024-02-03T12:00:00Z')
      },
      {
        adminId: adminUser._id,
        type: 'system_error',
        priority: 'urgent',
        title: 'System Error',
        message: 'Critical system error detected',
        actionUrl: '/admin/logs',
        isRead: false,
        timestamp: new Date('2024-02-04T13:00:00Z')
      },
      {
        adminId: adminUser._id,
        type: 'course_published',
        priority: 'medium',
        title: 'Course Published',
        message: 'A new course has been published',
        actionUrl: '/admin/courses',
        isRead: true, // Already read
        timestamp: new Date('2024-02-05T14:00:00Z')
      }
    ]);
  });

  test('Complete flow: login → view notifications → click notification → verify navigation and mark as read', async () => {
    // Step 1: Admin login (token already generated)
    expect(adminToken).toBeDefined();

    // Step 2: View notifications - get all notifications
    const notificationsResponse = await request(app)
      .get('/api/admin/notifications')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(notificationsResponse.body.notifications).toBeDefined();
    expect(notificationsResponse.body.notifications).toHaveLength(5);
    expect(notificationsResponse.body.total).toBe(5);
    expect(notificationsResponse.body.unreadCount).toBe(4); // 4 unread notifications

    // Verify notifications are sorted by timestamp (newest first)
    const notifications = notificationsResponse.body.notifications;
    expect(new Date(notifications[0].timestamp).getTime())
      .toBeGreaterThan(new Date(notifications[1].timestamp).getTime());

    // Step 3: Click on a specific notification (the high priority one)
    const highPriorityNotification = notifications.find(n => n.priority === 'high');
    expect(highPriorityNotification).toBeDefined();
    expect(highPriorityNotification.isRead).toBe(false);

    // Mark notification as read
    const markReadResponse = await request(app)
      .patch(`/api/admin/notifications/${highPriorityNotification._id}/read`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(markReadResponse.body.success).toBe(true);

    // Step 4: Verify navigation URL is correct
    expect(highPriorityNotification.actionUrl).toBe('/admin/content/flagged');

    // Step 5: Verify notification is marked as read
    const updatedNotificationsResponse = await request(app)
      .get('/api/admin/notifications')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const updatedNotification = updatedNotificationsResponse.body.notifications
      .find(n => n._id === highPriorityNotification._id);
    
    expect(updatedNotification.isRead).toBe(true);
    expect(updatedNotificationsResponse.body.unreadCount).toBe(3); // Now 3 unread
  });

  test('Filter notifications by type', async () => {
    // Filter by job_posted type
    const jobNotificationsResponse = await request(app)
      .get('/api/admin/notifications?type=job_posted')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(jobNotificationsResponse.body.notifications).toHaveLength(1);
    expect(jobNotificationsResponse.body.notifications[0].type).toBe('job_posted');
  });

  test('Filter notifications by priority', async () => {
    // Filter by urgent priority
    const urgentNotificationsResponse = await request(app)
      .get('/api/admin/notifications?priority=urgent')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(urgentNotificationsResponse.body.notifications).toHaveLength(1);
    expect(urgentNotificationsResponse.body.notifications[0].priority).toBe('urgent');
    expect(urgentNotificationsResponse.body.notifications[0].type).toBe('system_error');
  });

  test('Filter notifications by read status', async () => {
    // Filter unread notifications
    const unreadResponse = await request(app)
      .get('/api/admin/notifications?isRead=false')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(unreadResponse.body.notifications).toHaveLength(4);
    expect(unreadResponse.body.notifications.every(n => !n.isRead)).toBe(true);

    // Filter read notifications
    const readResponse = await request(app)
      .get('/api/admin/notifications?isRead=true')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(readResponse.body.notifications).toHaveLength(1);
    expect(readResponse.body.notifications[0].isRead).toBe(true);
  });

  test('Mark all notifications as read', async () => {
    // Verify initial unread count
    let notificationsResponse = await request(app)
      .get('/api/admin/notifications')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(notificationsResponse.body.unreadCount).toBe(4);

    // Mark all as read
    const markAllReadResponse = await request(app)
      .patch('/api/admin/notifications/mark-all-read')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(markAllReadResponse.body.success).toBe(true);
    expect(markAllReadResponse.body.count).toBe(4); // 4 notifications were marked as read

    // Verify all notifications are now read
    notificationsResponse = await request(app)
      .get('/api/admin/notifications')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(notificationsResponse.body.unreadCount).toBe(0);
    expect(notificationsResponse.body.notifications.every(n => n.isRead)).toBe(true);
  });

  test('Pagination works correctly', async () => {
    // Get first page (2 items per page)
    const page1Response = await request(app)
      .get('/api/admin/notifications?page=1&limit=2')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(page1Response.body.notifications).toHaveLength(2);
    expect(page1Response.body.total).toBe(5);

    // Get second page
    const page2Response = await request(app)
      .get('/api/admin/notifications?page=2&limit=2')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(page2Response.body.notifications).toHaveLength(2);

    // Verify different notifications on different pages
    const page1Ids = page1Response.body.notifications.map(n => n._id);
    const page2Ids = page2Response.body.notifications.map(n => n._id);
    expect(page1Ids).not.toEqual(page2Ids);
  });

  test('Notification preferences - disable notification type', async () => {
    // Get current preferences
    const preferencesResponse = await request(app)
      .get('/api/admin/notifications/preferences')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    // Update preferences to disable user_registered notifications
    const updateResponse = await request(app)
      .put('/api/admin/notifications/preferences')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        enabledTypes: [
          'job_posted',
          'course_published',
          'review_flagged',
          'content_reported',
          'suspicious_activity',
          'system_error'
        ],
        quietHours: {
          enabled: false
        }
      })
      .expect(200);

    expect(updateResponse.body.success).toBe(true);

    // Verify preferences were updated
    const updatedPreferencesResponse = await request(app)
      .get('/api/admin/notifications/preferences')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(updatedPreferencesResponse.body.enabledTypes).not.toContain('user_registered');
  });

  test('Notification preferences - quiet hours', async () => {
    // Set quiet hours from 22:00 to 08:00
    const updateResponse = await request(app)
      .put('/api/admin/notifications/preferences')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        enabledTypes: [
          'user_registered',
          'job_posted',
          'course_published',
          'review_flagged',
          'content_reported',
          'suspicious_activity',
          'system_error'
        ],
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '08:00'
        }
      })
      .expect(200);

    expect(updateResponse.body.success).toBe(true);

    // Verify quiet hours were set
    const preferencesResponse = await request(app)
      .get('/api/admin/notifications/preferences')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(preferencesResponse.body.quietHours.enabled).toBe(true);
    expect(preferencesResponse.body.quietHours.start).toBe('22:00');
    expect(preferencesResponse.body.quietHours.end).toBe('08:00');
  });

  test('Unread count badge updates correctly', async () => {
    // Initial unread count
    let response = await request(app)
      .get('/api/admin/notifications')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.unreadCount).toBe(4);

    // Mark one as read
    const notification = response.body.notifications.find(n => !n.isRead);
    await request(app)
      .patch(`/api/admin/notifications/${notification._id}/read`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    // Verify count decreased
    response = await request(app)
      .get('/api/admin/notifications')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.unreadCount).toBe(3);

    // Mark another as read
    const notification2 = response.body.notifications.find(n => !n.isRead);
    await request(app)
      .patch(`/api/admin/notifications/${notification2._id}/read`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    // Verify count decreased again
    response = await request(app)
      .get('/api/admin/notifications')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.unreadCount).toBe(2);
  });

  test('Notifications require authentication', async () => {
    await request(app)
      .get('/api/admin/notifications')
      .expect(401);

    await request(app)
      .patch(`/api/admin/notifications/${testNotifications[0]._id}/read`)
      .expect(401);

    await request(app)
      .patch('/api/admin/notifications/mark-all-read')
      .expect(401);
  });

  test('Notifications require admin role', async () => {
    // Create regular user
    const regularUser = await User.create({
      name: 'Regular User',
      email: 'user@test.com',
      password: 'User123!@#',
      role: 'user',
      userType: 'jobSeeker'
    });

    const userToken = generateToken(regularUser._id);

    await request(app)
      .get('/api/admin/notifications')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  test('Admin can only see their own notifications', async () => {
    // Create another admin
    const admin2 = await User.create({
      name: 'Admin 2',
      email: 'admin2@test.com',
      password: 'Admin123!@#',
      role: 'admin',
      userType: 'admin'
    });

    const admin2Token = generateToken(admin2._id);

    // Create notification for admin2
    await AdminNotification.create({
      adminId: admin2._id,
      type: 'user_registered',
      priority: 'low',
      title: 'Test Notification',
      message: 'This is for admin2',
      isRead: false
    });

    // Admin 1 should not see admin2's notifications
    const admin1Response = await request(app)
      .get('/api/admin/notifications')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(admin1Response.body.notifications).toHaveLength(5); // Only original 5

    // Admin 2 should only see their notification
    const admin2Response = await request(app)
      .get('/api/admin/notifications')
      .set('Authorization', `Bearer ${admin2Token}`)
      .expect(200);

    expect(admin2Response.body.notifications).toHaveLength(1);
    expect(admin2Response.body.notifications[0].message).toBe('This is for admin2');
  });
});
