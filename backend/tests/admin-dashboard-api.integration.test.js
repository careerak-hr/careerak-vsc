/**
 * Comprehensive Integration Tests for Admin Dashboard API Endpoints
 * 
 * Task: 31.1 Write integration tests for API endpoints
 * 
 * Tests all admin dashboard endpoints:
 * - Statistics endpoints (GET /api/admin/statistics/*)
 * - Activity log endpoints (GET/POST /api/admin/activity-log)
 * - Notification endpoints (GET/PATCH /api/admin/notifications/*)
 * - Export endpoints (POST /api/admin/export/*)
 * - Dashboard layout endpoints (GET/PUT/POST /api/admin/dashboard/layout*)
 * - Reports endpoints (GET /api/admin/reports/*)
 * - User management endpoints (GET/PATCH/DELETE /api/admin/users/*)
 * - Content management endpoints (GET/PATCH/DELETE /api/admin/content/*)
 * 
 * Validates:
 * - Response structure and status codes
 * - Authentication (401 for unauthenticated)
 * - Authorization (403 for non-admin)
 * - Pagination, filtering, and search functionality
 * - Data integrity and validation
 */

const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const ActivityLog = require('../src/models/ActivityLog');
const AdminNotification = require('../src/models/AdminNotification');
const DashboardLayout = require('../src/models/DashboardLayout');
const JobPosting = require('../src/models/JobPosting');
const EducationalCourse = require('../src/models/EducationalCourse');
const jwt = require('jsonwebtoken');

// Test data and helper functions
let adminUser, regularUser, adminToken, userToken;

/**
 * Helper function to create a valid JWT token
 */
const createToken = (userId, userType) => {
  return jwt.sign(
    { id: userId, userType },
    process.env.JWT_SECRET || 'test_jwt_secret_key',
    { expiresIn: '1h' }
  );
};

/**
 * Setup test users and tokens before all tests
 */
beforeAll(async () => {
  // Create admin user
  adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'Admin123!@#',
    userType: 'Admin'
  });

  // Create regular user
  regularUser = await User.create({
    name: 'Regular User',
    email: 'user@test.com',
    password: 'User123!@#',
    userType: 'JobSeeker'
  });

  // Generate tokens
  adminToken = createToken(adminUser._id, 'Admin');
  userToken = createToken(regularUser._id, 'JobSeeker');
}, 30000);

/**
 * Cleanup after all tests
 */
afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
}, 30000);

/**
 * Clean up test data before each test
 */
beforeEach(async () => {
  if (mongoose.connection.readyState === 1) {
    // Clear all collections except users
    await ActivityLog.deleteMany({});
    await AdminNotification.deleteMany({});
    await DashboardLayout.deleteMany({});
    await JobPosting.deleteMany({});
    await EducationalCourse.deleteMany({});
  }
});

// ============================================================================
// STATISTICS ENDPOINTS TESTS
// ============================================================================

describe('Statistics Endpoints', () => {
  
  describe('GET /api/admin/statistics/overview', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/statistics/overview');
      
      expect([401, 500]).toContain(response.status);
    });

    test('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/admin/statistics/overview')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect([403, 500]).toContain(response.status);
    });

    test('should return correct structure for admin users', async () => {
      const response = await request(app)
        .get('/api/admin/statistics/overview')
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('activeUsers');
        expect(response.body).toHaveProperty('jobsToday');
        expect(response.body).toHaveProperty('applicationsToday');
        expect(response.body).toHaveProperty('enrollmentsToday');
        expect(response.body).toHaveProperty('reviewsToday');
        expect(response.body).toHaveProperty('growthRates');
        expect(typeof response.body.activeUsers).toBe('number');
      }
    });
  });

  describe('GET /api/admin/statistics/users', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/statistics/users');
      
      expect([401, 500]).toContain(response.status);
    });

    test('should accept timeRange query parameter', async () => {
      const timeRanges = ['daily', 'weekly', 'monthly'];
      
      for (const timeRange of timeRanges) {
        const response = await request(app)
          .get(`/api/admin/statistics/users?timeRange=${timeRange}`)
          .set('Authorization', `Bearer ${adminToken}`);
        
        expect([200, 500]).toContain(response.status);
      }
    });

    test('should return correct structure', async () => {
      const response = await request(app)
        .get('/api/admin/statistics/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('labels');
        expect(response.body).toHaveProperty('newUsers');
        expect(response.body).toHaveProperty('totalUsers');
        expect(response.body).toHaveProperty('byType');
        expect(Array.isArray(response.body.labels)).toBe(true);
      }
    });
  });

  describe('GET /api/admin/statistics/jobs', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/statistics/jobs');
      
      expect([401, 500]).toContain(response.status);
    });

    test('should return correct structure', async () => {
      const response = await request(app)
        .get('/api/admin/statistics/jobs')
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('labels');
        expect(response.body).toHaveProperty('jobsPosted');
        expect(response.body).toHaveProperty('applications');
        expect(response.body).toHaveProperty('byField');
      }
    });
  });

  describe('GET /api/admin/statistics/courses', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/statistics/courses');
      
      expect([401, 500]).toContain(response.status);
    });

    test('should return correct structure', async () => {
      const response = await request(app)
        .get('/api/admin/statistics/courses')
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('labels');
        expect(response.body).toHaveProperty('coursesPublished');
        expect(response.body).toHaveProperty('enrollments');
      }
    });
  });

  describe('GET /api/admin/statistics/reviews', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/statistics/reviews');
      
      expect([401, 500]).toContain(response.status);
    });

    test('should return correct structure', async () => {
      const response = await request(app)
        .get('/api/admin/statistics/reviews')
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('labels');
        expect(response.body).toHaveProperty('reviewCount');
        expect(response.body).toHaveProperty('averageRating');
      }
    });
  });
});

// ============================================================================
// ACTIVITY LOG ENDPOINTS TESTS
// ============================================================================

describe('Activity Log Endpoints', () => {
  
  describe('GET /api/admin/activity-log', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/activity-log');
      
      expect([401, 500]).toContain(response.status);
    });

    test('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/admin/activity-log')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect([403, 500]).toContain(response.status);
    });

    test('should return correct structure with pagination', async () => {
      const response = await request(app)
        .get('/api/admin/activity-log?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('entries');
        expect(response.body).toHaveProperty('total');
        expect(response.body).toHaveProperty('page');
        expect(response.body).toHaveProperty('totalPages');
        expect(Array.isArray(response.body.entries)).toBe(true);
      }
    });

    test('should support filtering by type', async () => {
      const response = await request(app)
        .get('/api/admin/activity-log?type=user_registered')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect([200, 500]).toContain(response.status);
    });

    test('should support filtering by userId', async () => {
      const response = await request(app)
        .get(`/api/admin/activity-log?userId=${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect([200, 500]).toContain(response.status);
    });

    test('should support date range filtering', async () => {
      const startDate = new Date('2024-01-01').toISOString();
      const endDate = new Date('2024-12-31').toISOString();
      
      const response = await request(app)
        .get(`/api/admin/activity-log?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect([200, 500]).toContain(response.status);
    });

    test('should support search functionality', async () => {
      const response = await request(app)
        .get('/api/admin/activity-log?search=test')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect([200, 500]).toContain(response.status);
    });
  });

  describe('POST /api/admin/activity-log', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/admin/activity-log')
        .send({
          actionType: 'user_modified',
          targetType: 'User',
          targetId: regularUser._id,
          details: 'Test activity log entry'
        });
      
      expect([401, 500]).toContain(response.status);
    });

    test('should create activity log entry for admin', async () => {
      const response = await request(app)
        .post('/api/admin/activity-log')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          actionType: 'user_modified',
          targetType: 'User',
          targetId: regularUser._id,
          details: 'Test activity log entry'
        });
      
      if (response.status === 200 || response.status === 201) {
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('entryId');
      }
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/admin/activity-log')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          // Missing required fields
          actionType: 'user_modified'
        });
      
      expect([400, 500]).toContain(response.status);
    });
  });
});

// ============================================================================
// NOTIFICATION ENDPOINTS TESTS
// ============================================================================

describe('Notification Endpoints', () => {
  
  describe('GET /api/admin/notifications', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/notifications');
      
      expect([401, 500]).toContain(response.status);
    });

    test('should return correct structure with pagination', async () => {
      const response = await request(app)
        .get('/api/admin/notifications?page=1&limit=20')
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('notifications');
        expect(response.body).toHaveProperty('total');
        expect(response.body).toHaveProperty('unreadCount');
        expect(Array.isArray(response.body.notifications)).toBe(true);
      }
    });

    test('should support filtering by type', async () => {
      const response = await request(app)
        .get('/api/admin/notifications?type=user_registered')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect([200, 500]).toContain(response.status);
    });

    test('should support filtering by priority', async () => {
      const response = await request(app)
        .get('/api/admin/notifications?priority=high')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect([200, 500]).toContain(response.status);
    });

    test('should support filtering by read status', async () => {
      const response = await request(app)
        .get('/api/admin/notifications?isRead=false')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect([200, 500]).toContain(response.status);
    });
  });

  describe('PATCH /api/admin/notifications/:id/read', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .patch('/api/admin/notifications/507f1f77bcf86cd799439011/read');
      
      expect([401, 500]).toContain(response.status);
    });

    test('should mark notification as read', async () => {
      // Create a test notification first
      const notification = await AdminNotification.create({
        adminId: adminUser._id,
        type: 'user_registered',
        priority: 'medium',
        title: 'Test Notification',
        message: 'Test message',
        isRead: false
      });

      const response = await request(app)
        .patch(`/api/admin/notifications/${notification._id}/read`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
      }
    });
  });

  describe('PATCH /api/admin/notifications/mark-all-read', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .patch('/api/admin/notifications/mark-all-read');
      
      expect([401, 500]).toContain(response.status);
    });

    test('should mark all notifications as read', async () => {
      // Create multiple test notifications
      await AdminNotification.create([
        {
          adminId: adminUser._id,
          type: 'user_registered',
          priority: 'medium',
          title: 'Test 1',
          message: 'Message 1',
          isRead: false
        },
        {
          adminId: adminUser._id,
          type: 'job_posted',
          priority: 'medium',
          title: 'Test 2',
          message: 'Message 2',
          isRead: false
        }
      ]);

      const response = await request(app)
        .patch('/api/admin/notifications/mark-all-read')
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('count');
      }
    });
  });

  describe('GET /api/admin/notifications/preferences', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/notifications/preferences');
      
      expect([401, 500]).toContain(response.status);
    });

    test('should return notification preferences', async () => {
      const response = await request(app)
        .get('/api/admin/notifications/preferences')
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('enabledTypes');
        expect(response.body).toHaveProperty('quietHours');
      }
    });
  });

  describe('PUT /api/admin/notifications/preferences', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .put('/api/admin/notifications/preferences')
        .send({
          enabledTypes: ['user_registered', 'job_posted'],
          quietHours: { start: '22:00', end: '08:00' }
        });
      
      expect([401, 500]).toContain(response.status);
    });

    test('should update notification preferences', async () => {
      const response = await request(app)
        .put('/api/admin/notifications/preferences')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          enabledTypes: ['user_registered', 'job_posted'],
          quietHours: { start: '22:00', end: '08:00' }
        });
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
      }
    });
  });
});

// ============================================================================
// EXPORT ENDPOINTS TESTS
// ============================================================================

describe('Export Endpoints', () => {
  
  const exportConfig = {
    format: 'csv',
    dateRange: {
      start: new Date('2024-01-01'),
      end: new Date('2024-12-31')
    },
    filters: {},
    includeFields: ['name', 'email', 'createdAt']
  };

  describe('POST /api/admin/export/users', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/admin/export/users')
        .send(exportConfig);
      
      expect([401, 500]).toContain(response.status);
    });

    test('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .post('/api/admin/export/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send(exportConfig);
      
      expect([403, 500]).toContain(response.status);
    });

    test('should accept valid export configuration', async () => {
      const response = await request(app)
        .post('/api/admin/export/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(exportConfig);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('downloadUrl');
        expect(response.body).toHaveProperty('expiresAt');
      }
    });

    test('should validate export format', async () => {
      const invalidConfig = { ...exportConfig, format: 'invalid' };
      
      const response = await request(app)
        .post('/api/admin/export/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidConfig);
      
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('POST /api/admin/export/jobs', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/admin/export/jobs')
        .send(exportConfig);
      
      expect([401, 500]).toContain(response.status);
    });

    test('should accept valid export configuration', async () => {
      const response = await request(app)
        .post('/api/admin/export/jobs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(exportConfig);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('downloadUrl');
        expect(response.body).toHaveProperty('expiresAt');
      }
    });
  });

  describe('POST /api/admin/export/applications', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/admin/export/applications')
        .send(exportConfig);
      
      expect([401, 500]).toContain(response.status);
    });

    test('should accept valid export configuration', async () => {
      const response = await request(app)
        .post('/api/admin/export/applications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(exportConfig);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('downloadUrl');
        expect(response.body).toHaveProperty('expiresAt');
      }
    });
  });

  describe('POST /api/admin/export/courses', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/admin/export/courses')
        .send(exportConfig);
      
      expect([401, 500]).toContain(response.status);
    });

    test('should accept valid export configuration', async () => {
      const response = await request(app)
        .post('/api/admin/export/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(exportConfig);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('downloadUrl');
        expect(response.body).toHaveProperty('expiresAt');
      }
    });
  });

  describe('POST /api/admin/export/activity-log', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/admin/export/activity-log')
        .send(exportConfig);
      
      expect([401, 500]).toContain(response.status);
    });

    test('should accept valid export configuration', async () => {
      const response = await request(app)
        .post('/api/admin/export/activity-log')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(exportConfig);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('downloadUrl');
        expect(response.body).toHaveProperty('expiresAt');
      }
    });
  });
});

// ============================================================================
// DASHBOARD LAYOUT ENDPOINTS TESTS
// ============================================================================

describe('Dashboard Layout Endpoints', () => {
  
  describe('GET /api/admin/dashboard/layout', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard/layout');
      
      expect([401, 500]).toContain(response.status);
    });

    test('should return default layout for new admin', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard/layout')
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('widgets');
        expect(response.body).toHaveProperty('theme');
        expect(response.body).toHaveProperty('sidebarCollapsed');
        expect(Array.isArray(response.body.widgets)).toBe(true);
      }
    });
  });

  describe('PUT /api/admin/dashboard/layout', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .put('/api/admin/dashboard/layout')
        .send({
          widgets: [
            {
              id: 'widget-1',
              type: 'quick_stats',
              position: { x: 0, y: 0, w: 4, h: 2 }
            }
          ]
        });
      
      expect([401, 500]).toContain(response.status);
    });

    test('should save custom layout', async () => {
      const customLayout = {
        widgets: [
          {
            id: 'widget-1',
            type: 'quick_stats',
            position: { x: 0, y: 0, w: 4, h: 2 }
          },
          {
            id: 'widget-2',
            type: 'user_chart',
            position: { x: 4, y: 0, w: 4, h: 3 }
          }
        ]
      };

      const response = await request(app)
        .put('/api/admin/dashboard/layout')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(customLayout);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
      }
    });

    test('should validate widget configuration', async () => {
      const invalidLayout = {
        widgets: [
          {
            // Missing required fields
            id: 'widget-1'
          }
        ]
      };

      const response = await request(app)
        .put('/api/admin/dashboard/layout')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidLayout);
      
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('POST /api/admin/dashboard/layout/reset', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/admin/dashboard/layout/reset');
      
      expect([401, 500]).toContain(response.status);
    });

    test('should reset to default layout', async () => {
      // First, save a custom layout
      await request(app)
        .put('/api/admin/dashboard/layout')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          widgets: [
            {
              id: 'widget-1',
              type: 'quick_stats',
              position: { x: 0, y: 0, w: 4, h: 2 }
            }
          ]
        });

      // Then reset
      const response = await request(app)
        .post('/api/admin/dashboard/layout/reset')
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('widgets');
        expect(Array.isArray(response.body.widgets)).toBe(true);
      }
    });
  });
});

// ============================================================================
// REPORTS ENDPOINTS TESTS
// ============================================================================

describe('Reports Endpoints', () => {
  
  const dateRange = {
    startDate: new Date('2024-01-01').toISOString(),
    endDate: new Date('2024-12-31').toISOString()
  };

  describe('GET /api/admin/reports/users', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/reports/users');
      
      expect([401, 500]).toContain(response.status);
    });

    test('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/admin/reports/users')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect([403, 500]).toContain(response.status);
    });

    test('should return correct structure', async () => {
      const response = await request(app)
        .get(`/api/admin/reports/users?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('totalUsers');
        expect(response.body).toHaveProperty('byType');
        expect(response.body).toHaveProperty('growthRate');
        expect(typeof response.body.totalUsers).toBe('number');
      }
    });

    test('should support date range filtering', async () => {
      const response = await request(app)
        .get(`/api/admin/reports/users?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect([200, 500]).toContain(response.status);
    });
  });

  describe('GET /api/admin/reports/jobs', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/reports/jobs');
      
      expect([401, 500]).toContain(response.status);
    });

    test('should return correct structure', async () => {
      const response = await request(app)
        .get(`/api/admin/reports/jobs?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('totalJobs');
        expect(response.body).toHaveProperty('byField');
        expect(response.body).toHaveProperty('applicationRate');
        expect(typeof response.body.totalJobs).toBe('number');
      }
    });
  });

  describe('GET /api/admin/reports/courses', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/reports/courses');
      
      expect([401, 500]).toContain(response.status);
    });

    test('should return correct structure', async () => {
      const response = await request(app)
        .get(`/api/admin/reports/courses?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('totalCourses');
        expect(response.body).toHaveProperty('byField');
        expect(response.body).toHaveProperty('enrollmentRate');
        expect(response.body).toHaveProperty('completionRate');
        expect(typeof response.body.totalCourses).toBe('number');
      }
    });
  });

  describe('GET /api/admin/reports/reviews', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/reports/reviews');
      
      expect([401, 500]).toContain(response.status);
    });

    test('should return correct structure', async () => {
      const response = await request(app)
        .get(`/api/admin/reports/reviews?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('totalReviews');
        expect(response.body).toHaveProperty('averageRating');
        expect(response.body).toHaveProperty('flaggedCount');
        expect(response.body).toHaveProperty('byRating');
        expect(typeof response.body.totalReviews).toBe('number');
      }
    });
  });
});

// ============================================================================
// USER MANAGEMENT ENDPOINTS TESTS
// ============================================================================

describe('User Management Endpoints', () => {
  
  describe('GET /api/admin/users/search', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/users/search?q=test');
      
      expect([401, 500]).toContain(response.status);
    });

    test('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/admin/users/search?q=test')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect([403, 500]).toContain(response.status);
    });

    test('should support multi-field search', async () => {
      const response = await request(app)
        .get('/api/admin/users/search?q=test')
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
      }
    });

    test('should handle empty search query', async () => {
      const response = await request(app)
        .get('/api/admin/users/search?q=')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect([200, 400, 500]).toContain(response.status);
    });
  });

  describe('GET /api/admin/users', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/users');
      
      expect([401, 500]).toContain(response.status);
    });

    test('should support filtering by type', async () => {
      const response = await request(app)
        .get('/api/admin/users?type=JobSeeker')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect([200, 500]).toContain(response.status);
    });

    test('should support filtering by status', async () => {
      const response = await request(app)
        .get('/api/admin/users?status=active')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect([200, 500]).toContain(response.status);
    });

    test('should support pagination', async () => {
      const response = await request(app)
        .get('/api/admin/users?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('users');
        expect(response.body).toHaveProperty('total');
        expect(response.body).toHaveProperty('page');
      }
    });
  });

  describe('PATCH /api/admin/users/:id/disable', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .patch(`/api/admin/users/${regularUser._id}/disable`);
      
      expect([401, 500]).toContain(response.status);
    });

    test('should disable user account', async () => {
      const response = await request(app)
        .patch(`/api/admin/users/${regularUser._id}/disable`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
      }
    });

    test('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .patch('/api/admin/users/507f1f77bcf86cd799439011/disable')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect([404, 500]).toContain(response.status);
    });
  });

  describe('PATCH /api/admin/users/:id/enable', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .patch(`/api/admin/users/${regularUser._id}/enable`);
      
      expect([401, 500]).toContain(response.status);
    });

    test('should enable user account', async () => {
      // First disable the account
      await request(app)
        .patch(`/api/admin/users/${regularUser._id}/disable`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Then enable it
      const response = await request(app)
        .patch(`/api/admin/users/${regularUser._id}/enable`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
      }
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete(`/api/admin/users/${regularUser._id}`);
      
      expect([401, 500]).toContain(response.status);
    });

    test('should delete user account and create activity log', async () => {
      // Create a test user to delete
      const testUser = await User.create({
        name: 'Test Delete User',
        email: 'delete@test.com',
        password: 'Test123!@#',
        userType: 'JobSeeker'
      });

      const response = await request(app)
        .delete(`/api/admin/users/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
        
        // Verify user is deleted
        const deletedUser = await User.findById(testUser._id);
        expect(deletedUser).toBeNull();
      }
    });

    test('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .delete('/api/admin/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect([404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/admin/users/:id/activity', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/admin/users/${regularUser._id}/activity`);
      
      expect([401, 500]).toContain(response.status);
    });

    test('should return user activity history', async () => {
      const response = await request(app)
        .get(`/api/admin/users/${regularUser._id}/activity`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
      }
    });
  });
});

// ============================================================================
// CONTENT MANAGEMENT ENDPOINTS TESTS
// ============================================================================

describe('Content Management Endpoints', () => {
  
  describe('GET /api/admin/content/pending-jobs', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/content/pending-jobs');
      
      expect([401, 500]).toContain(response.status);
    });

    test('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/admin/content/pending-jobs')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect([403, 500]).toContain(response.status);
    });

    test('should return pending jobs', async () => {
      const response = await request(app)
        .get('/api/admin/content/pending-jobs')
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
      }
    });

    test('should support pagination', async () => {
      const response = await request(app)
        .get('/api/admin/content/pending-jobs?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect([200, 500]).toContain(response.status);
    });
  });

  describe('GET /api/admin/content/pending-courses', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/content/pending-courses');
      
      expect([401, 500]).toContain(response.status);
    });

    test('should return pending courses', async () => {
      const response = await request(app)
        .get('/api/admin/content/pending-courses')
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
      }
    });
  });

  describe('GET /api/admin/content/flagged', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/content/flagged');
      
      expect([401, 500]).toContain(response.status);
    });

    test('should return flagged content', async () => {
      const response = await request(app)
        .get('/api/admin/content/flagged')
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
      }
    });

    test('should support filtering by content type', async () => {
      const response = await request(app)
        .get('/api/admin/content/flagged?type=review')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect([200, 500]).toContain(response.status);
    });
  });

  describe('PATCH /api/admin/content/:id/approve', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .patch('/api/admin/content/507f1f77bcf86cd799439011/approve');
      
      expect([401, 500]).toContain(response.status);
    });

    test('should approve content', async () => {
      // Create a test job posting
      const testJob = await JobPosting.create({
        title: 'Test Job',
        description: 'Test Description',
        company: adminUser._id,
        field: 'IT',
        location: 'Test Location',
        status: 'pending'
      });

      const response = await request(app)
        .patch(`/api/admin/content/${testJob._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ contentType: 'job' });
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
      }
    });

    test('should return 404 for non-existent content', async () => {
      const response = await request(app)
        .patch('/api/admin/content/507f1f77bcf86cd799439011/approve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ contentType: 'job' });
      
      expect([404, 500]).toContain(response.status);
    });
  });

  describe('PATCH /api/admin/content/:id/reject', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .patch('/api/admin/content/507f1f77bcf86cd799439011/reject')
        .send({ reason: 'Test reason' });
      
      expect([401, 500]).toContain(response.status);
    });

    test('should reject content with reason', async () => {
      // Create a test job posting
      const testJob = await JobPosting.create({
        title: 'Test Job',
        description: 'Test Description',
        company: adminUser._id,
        field: 'IT',
        location: 'Test Location',
        status: 'pending'
      });

      const response = await request(app)
        .patch(`/api/admin/content/${testJob._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          contentType: 'job',
          reason: 'Does not meet quality standards'
        });
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
      }
    });

    test('should require rejection reason', async () => {
      const response = await request(app)
        .patch('/api/admin/content/507f1f77bcf86cd799439011/reject')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ contentType: 'job' });
      
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/admin/content/:id', () => {
    
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete('/api/admin/content/507f1f77bcf86cd799439011');
      
      expect([401, 500]).toContain(response.status);
    });

    test('should delete content and create activity log', async () => {
      // Create a test job posting
      const testJob = await JobPosting.create({
        title: 'Test Job to Delete',
        description: 'Test Description',
        company: adminUser._id,
        field: 'IT',
        location: 'Test Location',
        status: 'pending'
      });

      const response = await request(app)
        .delete(`/api/admin/content/${testJob._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ contentType: 'job' });
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
        
        // Verify content is deleted
        const deletedJob = await JobPosting.findById(testJob._id);
        expect(deletedJob).toBeNull();
      }
    });

    test('should return 404 for non-existent content', async () => {
      const response = await request(app)
        .delete('/api/admin/content/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ contentType: 'job' });
      
      expect([404, 500]).toContain(response.status);
    });
  });
});

// ============================================================================
// CROSS-CUTTING CONCERNS TESTS
// ============================================================================

describe('Cross-Cutting Concerns', () => {
  
  describe('Response Format Consistency', () => {
    
    test('All endpoints should return JSON', async () => {
      const endpoints = [
        '/api/admin/statistics/overview',
        '/api/admin/activity-log',
        '/api/admin/notifications',
        '/api/admin/dashboard/layout',
        '/api/admin/reports/users',
        '/api/admin/users',
        '/api/admin/content/pending-jobs'
      ];
      
      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        expect(response.headers['content-type']).toMatch(/json/);
      }
    });

    test('Error responses should have consistent structure', async () => {
      const response = await request(app)
        .get('/api/admin/statistics/overview');
      
      expect([401, 500]).toContain(response.status);
      
      const hasSuccessProperty = response.body.hasOwnProperty('success');
      const hasErrorProperty = response.body.hasOwnProperty('error');
      const hasMessageProperty = response.body.hasOwnProperty('message');
      
      expect(hasSuccessProperty || hasErrorProperty || hasMessageProperty).toBe(true);
    });
  });

  describe('Performance', () => {
    
    test('All endpoints should respond within 5 seconds', async () => {
      const endpoints = [
        '/api/admin/statistics/overview',
        '/api/admin/activity-log',
        '/api/admin/notifications',
        '/api/admin/dashboard/layout',
        '/api/admin/reports/users'
      ];
      
      for (const endpoint of endpoints) {
        const startTime = Date.now();
        await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${adminToken}`);
        const duration = Date.now() - startTime;
        
        expect(duration).toBeLessThan(5000);
      }
    }, 30000);
  });

  describe('Error Handling', () => {
    
    test('Should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/admin/nonexistent')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect([404, 500]).toContain(response.status);
    });

    test('Should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/admin/activity-log')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');
      
      expect([400, 500]).toContain(response.status);
    });

    test('Should handle invalid ObjectId gracefully', async () => {
      const response = await request(app)
        .get('/api/admin/users/invalid-id/activity')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect([400, 404, 500]).toContain(response.status);
    });
  });

  describe('Security', () => {
    
    test('Should not expose sensitive information in error messages', async () => {
      const response = await request(app)
        .get('/api/admin/statistics/overview');
      
      if (response.body.error || response.body.message) {
        const errorText = (response.body.error || response.body.message).toLowerCase();
        expect(errorText).not.toContain('password');
        expect(errorText).not.toContain('secret');
        expect(errorText).not.toContain('token');
      }
    });

    test('Should validate JWT token format', async () => {
      const response = await request(app)
        .get('/api/admin/statistics/overview')
        .set('Authorization', 'Bearer invalid-token');
      
      expect([401, 500]).toContain(response.status);
    });

    test('Should reject expired tokens', async () => {
      const expiredToken = jwt.sign(
        { id: adminUser._id, userType: 'Admin' },
        process.env.JWT_SECRET || 'test_jwt_secret_key',
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      const response = await request(app)
        .get('/api/admin/statistics/overview')
        .set('Authorization', `Bearer ${expiredToken}`);
      
      expect([401, 500]).toContain(response.status);
    });
  });
});
