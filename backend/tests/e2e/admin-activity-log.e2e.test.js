/**
 * End-to-End Test: Admin Activity Log
 * 
 * Test Flow:
 * 1. Admin login
 * 2. View activity log
 * 3. Search and filter activity log
 * 4. Verify results match search/filter criteria
 * 5. Test pagination
 * 
 * Validates: Requirements 5.1-5.14, 11.7, 12.8
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const ActivityLog = require('../../src/models/ActivityLog');
const { generateToken } = require('../../src/utils/auth');

describe('E2E: Admin Activity Log', () => {
  let adminUser;
  let adminToken;
  let testUsers;
  let testActivityLogs;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/careerak-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear test data
    await User.deleteMany({});
    await ActivityLog.deleteMany({});

    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'Admin123!@#',
      role: 'admin',
      userType: 'admin'
    });

    adminToken = generateToken(adminUser._id);

    // Create test users
    testUsers = await User.insertMany([
      {
        name: 'User 1',
        email: 'user1@test.com',
        password: 'Test123!@#',
        role: 'user',
        userType: 'jobSeeker'
      },
      {
        name: 'User 2',
        email: 'user2@test.com',
        password: 'Test123!@#',
        role: 'user',
        userType: 'employer'
      }
    ]);

    // Create test activity logs with different types and actions
    testActivityLogs = await ActivityLog.insertMany([
      {
        adminId: adminUser._id,
        action: 'user_created',
        targetType: 'User',
        targetId: testUsers[0]._id,
        details: { userName: 'User 1', userType: 'jobSeeker' },
        ipAddress: '192.168.1.1',
        timestamp: new Date('2024-02-01T10:00:00Z')
      },
      {
        adminId: adminUser._id,
        action: 'user_disabled',
        targetType: 'User',
        targetId: testUsers[1]._id,
        details: { userName: 'User 2', reason: 'Violation of terms' },
        ipAddress: '192.168.1.1',
        timestamp: new Date('2024-02-02T11:00:00Z')
      },
      {
        adminId: adminUser._id,
        action: 'job_approved',
        targetType: 'JobPosting',
        targetId: new mongoose.Types.ObjectId(),
        details: { jobTitle: 'Software Engineer', company: 'Tech Corp' },
        ipAddress: '192.168.1.2',
        timestamp: new Date('2024-02-03T12:00:00Z')
      },
      {
        adminId: adminUser._id,
        action: 'job_rejected',
        targetType: 'JobPosting',
        targetId: new mongoose.Types.ObjectId(),
        details: { jobTitle: 'Data Analyst', reason: 'Incomplete information' },
        ipAddress: '192.168.1.2',
        timestamp: new Date('2024-02-04T13:00:00Z')
      },
      {
        adminId: adminUser._id,
        action: 'course_approved',
        targetType: 'Course',
        targetId: new mongoose.Types.ObjectId(),
        details: { courseTitle: 'React Basics', instructor: 'John Doe' },
        ipAddress: '192.168.1.3',
        timestamp: new Date('2024-02-05T14:00:00Z')
      },
      {
        adminId: adminUser._id,
        action: 'content_deleted',
        targetType: 'Review',
        targetId: new mongoose.Types.ObjectId(),
        details: { reason: 'Inappropriate content' },
        ipAddress: '192.168.1.3',
        timestamp: new Date('2024-02-06T15:00:00Z')
      },
      {
        adminId: adminUser._id,
        action: 'settings_updated',
        targetType: 'System',
        targetId: null,
        details: { setting: 'notification_preferences', value: 'enabled' },
        ipAddress: '192.168.1.1',
        timestamp: new Date('2024-02-07T16:00:00Z')
      },
      {
        adminId: adminUser._id,
        action: 'export_generated',
        targetType: 'Export',
        targetId: null,
        details: { exportType: 'users', format: 'excel', recordCount: 150 },
        ipAddress: '192.168.1.1',
        timestamp: new Date('2024-02-08T17:00:00Z')
      }
    ]);
  });

  test('Complete flow: login → view activity log → search and filter → verify results', async () => {
    // Step 1: Admin login (token already generated)
    expect(adminToken).toBeDefined();

    // Step 2: View activity log - get all activities
    const activityLogResponse = await request(app)
      .get('/api/admin/activity-log')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(activityLogResponse.body.activities).toBeDefined();
    expect(activityLogResponse.body.activities).toHaveLength(8);
    expect(activityLogResponse.body.total).toBe(8);

    // Verify activities are sorted by timestamp (newest first)
    const activities = activityLogResponse.body.activities;
    expect(new Date(activities[0].timestamp).getTime())
      .toBeGreaterThan(new Date(activities[1].timestamp).getTime());

    // Step 3: Search by keyword "user"
    const searchResponse = await request(app)
      .get('/api/admin/activity-log?search=user')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(searchResponse.body.activities.length).toBeGreaterThan(0);
    // Verify all results contain "user" in action or details
    searchResponse.body.activities.forEach(activity => {
      const searchText = JSON.stringify(activity).toLowerCase();
      expect(searchText).toContain('user');
    });

    // Step 4: Filter by action type "job_approved"
    const filterByActionResponse = await request(app)
      .get('/api/admin/activity-log?action=job_approved')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(filterByActionResponse.body.activities).toHaveLength(1);
    expect(filterByActionResponse.body.activities[0].action).toBe('job_approved');
    expect(filterByActionResponse.body.activities[0].details.jobTitle).toBe('Software Engineer');

    // Step 5: Filter by target type "User"
    const filterByTargetResponse = await request(app)
      .get('/api/admin/activity-log?targetType=User')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(filterByTargetResponse.body.activities).toHaveLength(2);
    filterByTargetResponse.body.activities.forEach(activity => {
      expect(activity.targetType).toBe('User');
    });

    // Step 6: Filter by date range
    const dateFilterResponse = await request(app)
      .get('/api/admin/activity-log?startDate=2024-02-03&endDate=2024-02-05')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(dateFilterResponse.body.activities).toHaveLength(3);
    dateFilterResponse.body.activities.forEach(activity => {
      const activityDate = new Date(activity.timestamp);
      expect(activityDate.getTime()).toBeGreaterThanOrEqual(new Date('2024-02-03').getTime());
      expect(activityDate.getTime()).toBeLessThanOrEqual(new Date('2024-02-06').getTime());
    });
  });

  test('Search with special characters', async () => {
    // Create activity with special characters
    await ActivityLog.create({
      adminId: adminUser._id,
      action: 'user_updated',
      targetType: 'User',
      targetId: testUsers[0]._id,
      details: { 
        userName: 'Test@User#123',
        email: 'test+user@example.com'
      },
      ipAddress: '192.168.1.1',
      timestamp: new Date()
    });

    // Search for special characters
    const searchResponse = await request(app)
      .get('/api/admin/activity-log?search=Test@User')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(searchResponse.body.activities.length).toBeGreaterThan(0);
    const found = searchResponse.body.activities.some(activity => 
      activity.details.userName === 'Test@User#123'
    );
    expect(found).toBe(true);
  });

  test('Pagination works correctly', async () => {
    // Get first page (3 items per page)
    const page1Response = await request(app)
      .get('/api/admin/activity-log?page=1&limit=3')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(page1Response.body.activities).toHaveLength(3);
    expect(page1Response.body.total).toBe(8);
    expect(page1Response.body.page).toBe(1);
    expect(page1Response.body.totalPages).toBe(3);

    // Get second page
    const page2Response = await request(app)
      .get('/api/admin/activity-log?page=2&limit=3')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(page2Response.body.activities).toHaveLength(3);
    expect(page2Response.body.page).toBe(2);

    // Verify different activities on different pages
    const page1Ids = page1Response.body.activities.map(a => a._id);
    const page2Ids = page2Response.body.activities.map(a => a._id);
    expect(page1Ids).not.toEqual(page2Ids);

    // Get last page
    const page3Response = await request(app)
      .get('/api/admin/activity-log?page=3&limit=3')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(page3Response.body.activities).toHaveLength(2); // Only 2 items on last page
  });

  test('Multiple filters combined', async () => {
    // Filter by action AND date range
    const combinedFilterResponse = await request(app)
      .get('/api/admin/activity-log?action=job_approved&startDate=2024-02-01&endDate=2024-02-05')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(combinedFilterResponse.body.activities).toHaveLength(1);
    expect(combinedFilterResponse.body.activities[0].action).toBe('job_approved');

    // Filter by targetType AND search
    const combinedSearchResponse = await request(app)
      .get('/api/admin/activity-log?targetType=JobPosting&search=rejected')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(combinedSearchResponse.body.activities).toHaveLength(1);
    expect(combinedSearchResponse.body.activities[0].action).toBe('job_rejected');
  });

  test('Export activity log', async () => {
    // Export activity log to Excel
    const exportResponse = await request(app)
      .post('/api/admin/export/activity-log')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        format: 'excel',
        filters: {
          startDate: '2024-02-01',
          endDate: '2024-02-28'
        }
      })
      .expect(200);

    expect(exportResponse.body.downloadUrl).toBeDefined();
    expect(exportResponse.body.filename).toMatch(/\.xlsx$/);
    expect(exportResponse.body.expiresAt).toBeDefined();
  });

  test('Activity log automatically captures admin actions', async () => {
    // Perform an admin action (disable user)
    const user = testUsers[0];
    await request(app)
      .patch(`/api/admin/users/${user._id}/disable`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Test disable' })
      .expect(200);

    // Verify activity was logged
    const activityLogResponse = await request(app)
      .get('/api/admin/activity-log?action=user_disabled')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    // Should have at least 2 (1 from beforeEach + 1 from this test)
    expect(activityLogResponse.body.activities.length).toBeGreaterThanOrEqual(2);
    
    // Find the most recent one
    const recentActivity = activityLogResponse.body.activities[0];
    expect(recentActivity.action).toBe('user_disabled');
    expect(recentActivity.targetId.toString()).toBe(user._id.toString());
  });

  test('IP address is captured correctly', async () => {
    const activityLogResponse = await request(app)
      .get('/api/admin/activity-log')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    // Verify all activities have IP addresses
    activityLogResponse.body.activities.forEach(activity => {
      expect(activity.ipAddress).toBeDefined();
      expect(activity.ipAddress).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
    });
  });

  test('Activity log requires authentication', async () => {
    await request(app)
      .get('/api/admin/activity-log')
      .expect(401);

    await request(app)
      .post('/api/admin/activity-log')
      .send({
        action: 'test_action',
        targetType: 'Test',
        details: {}
      })
      .expect(401);
  });

  test('Activity log requires admin role', async () => {
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
      .get('/api/admin/activity-log')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  test('Admin can only see their own activity logs', async () => {
    // Create another admin
    const admin2 = await User.create({
      name: 'Admin 2',
      email: 'admin2@test.com',
      password: 'Admin123!@#',
      role: 'admin',
      userType: 'admin'
    });

    const admin2Token = generateToken(admin2._id);

    // Create activity for admin2
    await ActivityLog.create({
      adminId: admin2._id,
      action: 'user_created',
      targetType: 'User',
      targetId: testUsers[0]._id,
      details: { userName: 'Test User' },
      ipAddress: '192.168.1.100',
      timestamp: new Date()
    });

    // Admin 1 should not see admin2's activities
    const admin1Response = await request(app)
      .get('/api/admin/activity-log')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(admin1Response.body.activities).toHaveLength(8); // Only original 8

    // Admin 2 should only see their activity
    const admin2Response = await request(app)
      .get('/api/admin/activity-log')
      .set('Authorization', `Bearer ${admin2Token}`)
      .expect(200);

    expect(admin2Response.body.activities).toHaveLength(1);
    expect(admin2Response.body.activities[0].adminId.toString()).toBe(admin2._id.toString());
  });

  test('Empty search returns all results', async () => {
    const emptySearchResponse = await request(app)
      .get('/api/admin/activity-log?search=')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(emptySearchResponse.body.activities).toHaveLength(8);
  });

  test('Invalid date range returns error', async () => {
    // End date before start date
    await request(app)
      .get('/api/admin/activity-log?startDate=2024-12-31&endDate=2024-01-01')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(400);
  });

  test('Activity log includes all required fields', async () => {
    const activityLogResponse = await request(app)
      .get('/api/admin/activity-log')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const activity = activityLogResponse.body.activities[0];
    
    // Verify all required fields are present
    expect(activity).toHaveProperty('_id');
    expect(activity).toHaveProperty('adminId');
    expect(activity).toHaveProperty('action');
    expect(activity).toHaveProperty('targetType');
    expect(activity).toHaveProperty('details');
    expect(activity).toHaveProperty('ipAddress');
    expect(activity).toHaveProperty('timestamp');
  });
});
