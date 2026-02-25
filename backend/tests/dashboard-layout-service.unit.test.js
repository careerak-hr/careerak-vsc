const {
  getLayout,
  saveLayout,
  resetLayout,
  validateWidget,
  validateLayout,
  DEFAULT_WIDGETS
} = require('../src/services/dashboardLayoutService');
const DashboardLayout = require('../src/models/DashboardLayout');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

/**
 * Unit Tests for Dashboard Layout Service
 * Tests specific examples and edge cases
 * Requirements: 4.1-4.10
 */

describe('Dashboard Layout Service Unit Tests', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    // Clean up all collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe('Layout with Invalid Widget Configuration', () => {
    /**
     * Test: Should reject widget with missing required fields
     * Requirement 4.1: Widget validation
     */
    test('should reject widget without id', () => {
      const widget = {
        type: 'quick_stats',
        position: { x: 0, y: 0, w: 4, h: 2 }
      };

      const validation = validateWidget(widget);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Widget must have an id');
    });

    test('should reject widget without type', () => {
      const widget = {
        id: 'test-widget',
        position: { x: 0, y: 0, w: 4, h: 2 }
      };

      const validation = validateWidget(widget);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Widget must have a type');
    });

    test('should reject widget with invalid type', () => {
      const widget = {
        id: 'test-widget',
        type: 'invalid_type',
        position: { x: 0, y: 0, w: 4, h: 2 }
      };

      const validation = validateWidget(widget);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('Invalid widget type'))).toBe(true);
    });

    test('should reject widget without position', () => {
      const widget = {
        id: 'test-widget',
        type: 'quick_stats'
      };

      const validation = validateWidget(widget);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Widget must have a position');
    });

    test('should reject widget with negative position', () => {
      const widget = {
        id: 'test-widget',
        type: 'quick_stats',
        position: { x: -1, y: 0, w: 4, h: 2 }
      };

      const validation = validateWidget(widget);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('position.x must be a non-negative number'))).toBe(true);
    });

    test('should reject widget with zero or negative width', () => {
      const widget = {
        id: 'test-widget',
        type: 'quick_stats',
        position: { x: 0, y: 0, w: 0, h: 2 }
      };

      const validation = validateWidget(widget);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('position.w must be a positive number'))).toBe(true);
    });

    test('should reject widget exceeding grid width', () => {
      const widget = {
        id: 'test-widget',
        type: 'quick_stats',
        position: { x: 10, y: 0, w: 4, h: 2 } // x(10) + w(4) = 14 > 12
      };

      const validation = validateWidget(widget);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Widget exceeds grid width (max 12 columns)');
    });

    test('should accept valid widget', () => {
      const widget = {
        id: 'test-widget',
        type: 'quick_stats',
        position: { x: 0, y: 0, w: 4, h: 2 },
        config: { limit: 10 }
      };

      const validation = validateWidget(widget);
      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    test('should reject layout with duplicate widget IDs', () => {
      const widgets = [
        { id: 'widget-1', type: 'quick_stats', position: { x: 0, y: 0, w: 4, h: 2 } },
        { id: 'widget-1', type: 'user_chart', position: { x: 4, y: 0, w: 4, h: 2 } }
      ];

      const validation = validateLayout(widgets);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('Duplicate widget IDs'))).toBe(true);
    });

    test('should reject saveLayout with invalid widget configuration', async () => {
      const adminId = new mongoose.Types.ObjectId().toString();
      const invalidWidgets = [
        { id: 'widget-1', type: 'invalid_type', position: { x: 0, y: 0, w: 4, h: 2 } }
      ];

      await expect(saveLayout(adminId, { widgets: invalidWidgets }))
        .rejects
        .toThrow('Invalid layout');
    });
  });

  describe('Layout with Overlapping Widgets', () => {
    /**
     * Test: Should detect overlapping widgets
     * Requirement 4.1: Widget positioning validation
     */
    test('should detect widgets that overlap completely', () => {
      const widgets = [
        { id: 'widget-1', type: 'quick_stats', position: { x: 0, y: 0, w: 4, h: 2 } },
        { id: 'widget-2', type: 'user_chart', position: { x: 0, y: 0, w: 4, h: 2 } }
      ];

      const validation = validateLayout(widgets);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('overlap'))).toBe(true);
    });

    test('should detect widgets that overlap partially', () => {
      const widgets = [
        { id: 'widget-1', type: 'quick_stats', position: { x: 0, y: 0, w: 6, h: 2 } },
        { id: 'widget-2', type: 'user_chart', position: { x: 4, y: 0, w: 6, h: 2 } }
      ];

      const validation = validateLayout(widgets);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('overlap'))).toBe(true);
    });

    test('should accept widgets that do not overlap horizontally', () => {
      const widgets = [
        { id: 'widget-1', type: 'quick_stats', position: { x: 0, y: 0, w: 4, h: 2 } },
        { id: 'widget-2', type: 'user_chart', position: { x: 4, y: 0, w: 4, h: 2 } }
      ];

      const validation = validateLayout(widgets);
      expect(validation.valid).toBe(true);
    });

    test('should accept widgets that do not overlap vertically', () => {
      const widgets = [
        { id: 'widget-1', type: 'quick_stats', position: { x: 0, y: 0, w: 4, h: 2 } },
        { id: 'widget-2', type: 'user_chart', position: { x: 0, y: 2, w: 4, h: 2 } }
      ];

      const validation = validateLayout(widgets);
      expect(validation.valid).toBe(true);
    });

    test('should reject saveLayout with overlapping widgets', async () => {
      const adminId = new mongoose.Types.ObjectId().toString();
      const overlappingWidgets = [
        { id: 'widget-1', type: 'quick_stats', position: { x: 0, y: 0, w: 6, h: 2 } },
        { id: 'widget-2', type: 'user_chart', position: { x: 4, y: 0, w: 6, h: 2 } }
      ];

      await expect(saveLayout(adminId, { widgets: overlappingWidgets }))
        .rejects
        .toThrow('Invalid layout');
    });
  });

  describe('Reset to Default Layout', () => {
    /**
     * Test: Reset should restore default layout
     * Requirement 4.9: Reset to default layout
     */
    test('should reset to default layout with all 8 default widgets', async () => {
      const adminId = new mongoose.Types.ObjectId().toString();

      // Setup: Save custom layout
      await saveLayout(adminId, {
        widgets: [
          { id: 'custom-widget', type: 'quick_stats', position: { x: 0, y: 0, w: 12, h: 2 } }
        ],
        theme: 'dark',
        sidebarCollapsed: true
      });

      // Action: Reset layout
      const resetLayoutResult = await resetLayout(adminId);

      // Assert: Layout is default
      expect(resetLayoutResult.widgets.length).toBe(DEFAULT_WIDGETS.length);
      expect(resetLayoutResult.theme).toBe('light');
      expect(resetLayoutResult.sidebarCollapsed).toBe(false);

      // Verify all default widget types are present
      const widgetTypes = resetLayoutResult.widgets.map(w => w.type);
      expect(widgetTypes).toContain('quick_stats');
      expect(widgetTypes).toContain('user_chart');
      expect(widgetTypes).toContain('job_chart');
      expect(widgetTypes).toContain('recent_users');
      expect(widgetTypes).toContain('recent_jobs');
      expect(widgetTypes).toContain('recent_applications');
      expect(widgetTypes).toContain('activity_log');
      expect(widgetTypes).toContain('notifications');
    });

    test('should reset layout for admin with no previous layout', async () => {
      const adminId = new mongoose.Types.ObjectId().toString();

      // Action: Reset layout (no prior save)
      const resetLayoutResult = await resetLayout(adminId);

      // Assert: Layout is default
      expect(resetLayoutResult.widgets.length).toBe(DEFAULT_WIDGETS.length);
      expect(resetLayoutResult.theme).toBe('light');
      expect(resetLayoutResult.sidebarCollapsed).toBe(false);
    });

    test('should persist reset layout to database', async () => {
      const adminId = new mongoose.Types.ObjectId().toString();

      // Setup: Save custom layout
      await saveLayout(adminId, {
        widgets: [
          { id: 'custom-widget', type: 'quick_stats', position: { x: 0, y: 0, w: 12, h: 2 } }
        ]
      });

      // Action: Reset layout
      await resetLayout(adminId);

      // Verify: Layout is persisted
      const layout = await DashboardLayout.findOne({ adminId });
      expect(layout).toBeDefined();
      expect(layout.widgets.length).toBe(DEFAULT_WIDGETS.length);
      expect(layout.theme).toBe('light');
      expect(layout.sidebarCollapsed).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    /**
     * Test: Edge cases and error handling
     */
    test('should handle empty widgets array', async () => {
      const adminId = new mongoose.Types.ObjectId().toString();

      // Action: Save layout with empty widgets
      const layout = await saveLayout(adminId, { widgets: [] });

      // Assert: Layout saved successfully
      expect(layout.widgets.length).toBe(0);
    });

    test('should handle single widget layout', async () => {
      const adminId = new mongoose.Types.ObjectId().toString();

      const singleWidget = [
        { id: 'only-widget', type: 'quick_stats', position: { x: 0, y: 0, w: 12, h: 2 } }
      ];

      // Action: Save layout with single widget
      const layout = await saveLayout(adminId, { widgets: singleWidget });

      // Assert: Layout saved successfully
      expect(layout.widgets.length).toBe(1);
      expect(layout.widgets[0].id).toBe('only-widget');
    });

    test('should handle maximum grid layout (12 columns)', async () => {
      const adminId = new mongoose.Types.ObjectId().toString();

      const maxWidgets = [
        { id: 'widget-1', type: 'quick_stats', position: { x: 0, y: 0, w: 12, h: 2 } },
        { id: 'widget-2', type: 'user_chart', position: { x: 0, y: 2, w: 6, h: 4 } },
        { id: 'widget-3', type: 'job_chart', position: { x: 6, y: 2, w: 6, h: 4 } }
      ];

      // Action: Save layout
      const layout = await saveLayout(adminId, { widgets: maxWidgets });

      // Assert: Layout saved successfully
      expect(layout.widgets.length).toBe(3);
    });

    test('should handle widget with null config', async () => {
      const adminId = new mongoose.Types.ObjectId().toString();

      const widgets = [
        { id: 'widget-1', type: 'quick_stats', position: { x: 0, y: 0, w: 4, h: 2 }, config: null }
      ];

      // Action: Save layout
      const layout = await saveLayout(adminId, { widgets });

      // Assert: Layout saved successfully
      expect(layout.widgets.length).toBe(1);
      expect(layout.widgets[0].config).toBeNull();
    });

    test('should handle widget with complex config', async () => {
      const adminId = new mongoose.Types.ObjectId().toString();

      const widgets = [
        {
          id: 'widget-1',
          type: 'activity_log',
          position: { x: 0, y: 0, w: 8, h: 4 },
          config: {
            limit: 20,
            filters: ['user_registered', 'job_posted'],
            timeRange: 'weekly',
            showDetails: true,
            customSettings: {
              highlightImportant: true,
              groupByType: false
            }
          }
        }
      ];

      // Action: Save layout
      const layout = await saveLayout(adminId, { widgets });

      // Assert: Layout saved with complex config
      expect(layout.widgets.length).toBe(1);
      expect(layout.widgets[0].config.limit).toBe(20);
      expect(layout.widgets[0].config.filters).toEqual(['user_registered', 'job_posted']);
      expect(layout.widgets[0].config.customSettings.highlightImportant).toBe(true);
    });

    test('should reject invalid theme', async () => {
      const adminId = new mongoose.Types.ObjectId().toString();

      await expect(saveLayout(adminId, { theme: 'invalid_theme' }))
        .rejects
        .toThrow('Invalid theme');
    });

    test('should handle partial update with only theme', async () => {
      const adminId = new mongoose.Types.ObjectId().toString();

      // Setup: Save initial layout
      await saveLayout(adminId, {
        widgets: DEFAULT_WIDGETS,
        theme: 'light',
        sidebarCollapsed: false
      });

      // Action: Update only theme
      const layout = await saveLayout(adminId, { theme: 'dark' });

      // Assert: Theme updated, widgets preserved
      expect(layout.theme).toBe('dark');
      expect(layout.widgets.length).toBe(DEFAULT_WIDGETS.length);
      expect(layout.sidebarCollapsed).toBe(false);
    });

    test('should handle partial update with only sidebarCollapsed', async () => {
      const adminId = new mongoose.Types.ObjectId().toString();

      // Setup: Save initial layout
      await saveLayout(adminId, {
        widgets: DEFAULT_WIDGETS,
        theme: 'light',
        sidebarCollapsed: false
      });

      // Action: Update only sidebarCollapsed
      const layout = await saveLayout(adminId, { sidebarCollapsed: true });

      // Assert: Sidebar updated, widgets and theme preserved
      expect(layout.sidebarCollapsed).toBe(true);
      expect(layout.widgets.length).toBe(DEFAULT_WIDGETS.length);
      expect(layout.theme).toBe('light');
    });
  });

  describe('Default Widgets Configuration', () => {
    /**
     * Test: Default widgets should have correct structure
     * Requirement 4.10: Support at least 8 different widget types
     */
    test('should have at least 8 default widgets', () => {
      expect(DEFAULT_WIDGETS.length).toBeGreaterThanOrEqual(8);
    });

    test('should have all required widget types', () => {
      const widgetTypes = DEFAULT_WIDGETS.map(w => w.type);
      
      expect(widgetTypes).toContain('quick_stats');
      expect(widgetTypes).toContain('user_chart');
      expect(widgetTypes).toContain('job_chart');
      expect(widgetTypes).toContain('recent_users');
      expect(widgetTypes).toContain('recent_jobs');
      expect(widgetTypes).toContain('recent_applications');
      expect(widgetTypes).toContain('activity_log');
      expect(widgetTypes).toContain('notifications');
    });

    test('should have unique widget IDs', () => {
      const ids = DEFAULT_WIDGETS.map(w => w.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    test('should have valid positions for all widgets', () => {
      DEFAULT_WIDGETS.forEach(widget => {
        const validation = validateWidget(widget);
        expect(validation.valid).toBe(true);
      });
    });

    test('should not have overlapping widgets in default layout', () => {
      const validation = validateLayout(DEFAULT_WIDGETS);
      expect(validation.valid).toBe(true);
    });
  });
});
