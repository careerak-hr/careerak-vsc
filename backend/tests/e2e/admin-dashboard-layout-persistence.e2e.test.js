/**
 * End-to-End Test: Admin Dashboard Layout Persistence
 * 
 * Test Flow:
 * 1. Admin login
 * 2. View dashboard
 * 3. Customize layout (add, remove, resize, rearrange widgets)
 * 4. Logout
 * 5. Login again
 * 6. Verify layout persisted correctly
 * 
 * Validates: Requirements 4.1-4.10, 11.5, 11.6
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const DashboardLayout = require('../../src/models/DashboardLayout');
const { generateToken } = require('../../src/utils/auth');

describe('E2E: Admin Dashboard Layout Persistence', () => {
  let adminUser;
  let adminToken;
  let customLayout;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/careerak-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear test data
    await User.deleteMany({});
    await DashboardLayout.deleteMany({});

    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'Admin123!@#',
      role: 'admin',
      userType: 'admin'
    });

    // Generate admin token
    adminToken = generateToken(adminUser._id);

    // Define custom layout for testing
    customLayout = {
      widgets: [
        {
          id: 'quick_stats_1',
          type: 'quick_stats',
          position: { x: 0, y: 0, w: 12, h: 2 },
          config: { showGrowthRate: true }
        },
        {
          id: 'user_chart_1',
          type: 'user_chart',
          position: { x: 0, y: 2, w: 6, h: 4 },
          config: { timeRange: 'weekly' }
        },
        {
          id: 'job_chart_1',
          type: 'job_chart',
          position: { x: 6, y: 2, w: 6, h: 4 },
          config: { timeRange: 'monthly' }
        },
        {
          id: 'activity_log_1',
          type: 'activity_log',
          position: { x: 0, y: 6, w: 12, h: 3 },
          config: { maxEntries: 20 }
        }
      ],
      theme: 'dark',
      sidebarCollapsed: true
    };
  });

  test('Complete flow: login → customize layout → logout → login → verify persistence', async () => {
    // Step 1: Admin login (simulated - token already generated)
    expect(adminToken).toBeDefined();
    expect(adminUser.role).toBe('admin');

    // Step 2: View dashboard - get default layout
    const defaultLayoutResponse = await request(app)
      .get('/api/admin/dashboard/layout')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(defaultLayoutResponse.body).toHaveProperty('widgets');
    expect(Array.isArray(defaultLayoutResponse.body.widgets)).toBe(true);
    const defaultWidgetCount = defaultLayoutResponse.body.widgets.length;

    // Step 3: Customize layout - save custom layout
    const saveLayoutResponse = await request(app)
      .put('/api/admin/dashboard/layout')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(customLayout)
      .expect(200);

    expect(saveLayoutResponse.body.success).toBe(true);

    // Verify layout was saved in database
    const savedLayout = await DashboardLayout.findOne({ adminId: adminUser._id });
    expect(savedLayout).toBeDefined();
    expect(savedLayout.widgets).toHaveLength(4);
    expect(savedLayout.theme).toBe('dark');
    expect(savedLayout.sidebarCollapsed).toBe(true);

    // Step 4: Logout (simulated - clear token)
    adminToken = null;

    // Step 5: Login again (simulated - regenerate token)
    adminToken = generateToken(adminUser._id);

    // Step 6: Verify layout persisted - fetch layout again
    const persistedLayoutResponse = await request(app)
      .get('/api/admin/dashboard/layout')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    // Verify all layout properties persisted correctly
    expect(persistedLayoutResponse.body.widgets).toHaveLength(4);
    expect(persistedLayoutResponse.body.theme).toBe('dark');
    expect(persistedLayoutResponse.body.sidebarCollapsed).toBe(true);

    // Verify widget details
    const quickStatsWidget = persistedLayoutResponse.body.widgets.find(w => w.id === 'quick_stats_1');
    expect(quickStatsWidget).toBeDefined();
    expect(quickStatsWidget.type).toBe('quick_stats');
    expect(quickStatsWidget.position).toEqual({ x: 0, y: 0, w: 12, h: 2 });
    expect(quickStatsWidget.config.showGrowthRate).toBe(true);

    const userChartWidget = persistedLayoutResponse.body.widgets.find(w => w.id === 'user_chart_1');
    expect(userChartWidget).toBeDefined();
    expect(userChartWidget.type).toBe('user_chart');
    expect(userChartWidget.position).toEqual({ x: 0, y: 2, w: 6, h: 4 });
    expect(userChartWidget.config.timeRange).toBe('weekly');

    const jobChartWidget = persistedLayoutResponse.body.widgets.find(w => w.id === 'job_chart_1');
    expect(jobChartWidget).toBeDefined();
    expect(jobChartWidget.type).toBe('job_chart');
    expect(jobChartWidget.position).toEqual({ x: 6, y: 2, w: 6, h: 4 });

    const activityLogWidget = persistedLayoutResponse.body.widgets.find(w => w.id === 'activity_log_1');
    expect(activityLogWidget).toBeDefined();
    expect(activityLogWidget.type).toBe('activity_log');
    expect(activityLogWidget.config.maxEntries).toBe(20);
  });

  test('Widget operations: add, remove, resize, rearrange', async () => {
    // Start with default layout
    const defaultResponse = await request(app)
      .get('/api/admin/dashboard/layout')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const initialWidgets = defaultResponse.body.widgets;

    // Add a new widget
    const layoutWithNewWidget = {
      widgets: [
        ...initialWidgets,
        {
          id: 'notifications_1',
          type: 'notifications',
          position: { x: 0, y: 10, w: 6, h: 3 },
          config: { showUnreadOnly: true }
        }
      ]
    };

    await request(app)
      .put('/api/admin/dashboard/layout')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(layoutWithNewWidget)
      .expect(200);

    // Verify widget was added
    let currentLayout = await request(app)
      .get('/api/admin/dashboard/layout')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(currentLayout.body.widgets).toHaveLength(initialWidgets.length + 1);
    const addedWidget = currentLayout.body.widgets.find(w => w.id === 'notifications_1');
    expect(addedWidget).toBeDefined();

    // Remove a widget
    const layoutWithRemovedWidget = {
      widgets: currentLayout.body.widgets.filter(w => w.id !== 'notifications_1')
    };

    await request(app)
      .put('/api/admin/dashboard/layout')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(layoutWithRemovedWidget)
      .expect(200);

    // Verify widget was removed
    currentLayout = await request(app)
      .get('/api/admin/dashboard/layout')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(currentLayout.body.widgets).toHaveLength(initialWidgets.length);
    const removedWidget = currentLayout.body.widgets.find(w => w.id === 'notifications_1');
    expect(removedWidget).toBeUndefined();

    // Resize a widget
    const firstWidget = currentLayout.body.widgets[0];
    const layoutWithResizedWidget = {
      widgets: currentLayout.body.widgets.map(w => 
        w.id === firstWidget.id
          ? { ...w, position: { ...w.position, w: 8, h: 3 } }
          : w
      )
    };

    await request(app)
      .put('/api/admin/dashboard/layout')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(layoutWithResizedWidget)
      .expect(200);

    // Verify widget was resized
    currentLayout = await request(app)
      .get('/api/admin/dashboard/layout')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const resizedWidget = currentLayout.body.widgets.find(w => w.id === firstWidget.id);
    expect(resizedWidget.position.w).toBe(8);
    expect(resizedWidget.position.h).toBe(3);

    // Rearrange widgets (swap positions)
    const widget1 = currentLayout.body.widgets[0];
    const widget2 = currentLayout.body.widgets[1];
    const layoutWithRearrangedWidgets = {
      widgets: currentLayout.body.widgets.map(w => {
        if (w.id === widget1.id) {
          return { ...w, position: widget2.position };
        } else if (w.id === widget2.id) {
          return { ...w, position: widget1.position };
        }
        return w;
      })
    };

    await request(app)
      .put('/api/admin/dashboard/layout')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(layoutWithRearrangedWidgets)
      .expect(200);

    // Verify widgets were rearranged
    currentLayout = await request(app)
      .get('/api/admin/dashboard/layout')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const rearrangedWidget1 = currentLayout.body.widgets.find(w => w.id === widget1.id);
    const rearrangedWidget2 = currentLayout.body.widgets.find(w => w.id === widget2.id);
    expect(rearrangedWidget1.position).toEqual(widget2.position);
    expect(rearrangedWidget2.position).toEqual(widget1.position);
  });

  test('Layout reset functionality', async () => {
    // Save custom layout
    await request(app)
      .put('/api/admin/dashboard/layout')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(customLayout)
      .expect(200);

    // Verify custom layout is saved
    let currentLayout = await request(app)
      .get('/api/admin/dashboard/layout')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(currentLayout.body.theme).toBe('dark');
    expect(currentLayout.body.widgets).toHaveLength(4);

    // Reset layout to default
    const resetResponse = await request(app)
      .post('/api/admin/dashboard/layout/reset')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(resetResponse.body.widgets).toBeDefined();
    expect(Array.isArray(resetResponse.body.widgets)).toBe(true);

    // Verify layout was reset
    currentLayout = await request(app)
      .get('/api/admin/dashboard/layout')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    // Default layout should be restored
    expect(currentLayout.body.theme).toBe('light'); // Default theme
    expect(currentLayout.body.sidebarCollapsed).toBe(false); // Default sidebar state
  });

  test('Authentication required for all layout operations', async () => {
    // Try to get layout without authentication
    await request(app)
      .get('/api/admin/dashboard/layout')
      .expect(401);

    // Try to save layout without authentication
    await request(app)
      .put('/api/admin/dashboard/layout')
      .send(customLayout)
      .expect(401);

    // Try to reset layout without authentication
    await request(app)
      .post('/api/admin/dashboard/layout/reset')
      .expect(401);
  });

  test('Non-admin users cannot access dashboard layout', async () => {
    // Create regular user
    const regularUser = await User.create({
      name: 'Regular User',
      email: 'user@test.com',
      password: 'User123!@#',
      role: 'user',
      userType: 'jobSeeker'
    });

    const userToken = generateToken(regularUser._id);

    // Try to access dashboard layout as regular user
    await request(app)
      .get('/api/admin/dashboard/layout')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    // Try to save layout as regular user
    await request(app)
      .put('/api/admin/dashboard/layout')
      .set('Authorization', `Bearer ${userToken}`)
      .send(customLayout)
      .expect(403);
  });
});
