const fc = require('fast-check');
const {
  getLayout,
  saveLayout,
  resetLayout,
  DEFAULT_WIDGETS
} = require('../src/services/dashboardLayoutService');
const DashboardLayout = require('../src/models/DashboardLayout');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

/**
 * Property-Based Tests for Dashboard Layout Persistence
 * Feature: admin-dashboard-enhancements
 * Property 10: Dashboard Layout Persistence
 * Validates: Requirements 4.3, 4.8
 * 
 * Property Statement:
 * For any admin user, when they modify their dashboard layout (add, remove, resize, or rearrange widgets)
 * and the layout is saved, then when they log out and log back in, the loaded layout should match
 * the saved layout exactly.
 */

describe('Property 10: Dashboard Layout Persistence', () => {
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

  /**
   * Arbitraries for generating test data
   */

  // Helper function to strip _id fields from widgets for comparison
  const stripIds = (widgets) => {
    return JSON.parse(JSON.stringify(widgets)).map(w => {
      const { _id, ...rest } = w;
      return rest;
    });
  };

  // Generate valid widget types
  const widgetTypeArbitrary = fc.constantFrom(
    'quick_stats',
    'user_chart',
    'job_chart',
    'course_chart',
    'review_chart',
    'recent_users',
    'recent_jobs',
    'recent_applications',
    'activity_log',
    'flagged_reviews',
    'notifications'
  );

  // Generate valid widget position (12-column grid)
  const widgetPositionArbitrary = fc.record({
    x: fc.nat({ max: 11 }), // 0-11 for 12-column grid
    y: fc.nat({ max: 20 }), // Reasonable vertical range
    w: fc.integer({ min: 1, max: 12 }), // Width 1-12
    h: fc.integer({ min: 1, max: 6 }) // Height 1-6
  }).filter(pos => pos.x + pos.w <= 12); // Ensure widget fits in grid

  // Generate valid widget configuration
  const widgetConfigArbitrary = fc.record({
    limit: fc.option(fc.nat({ max: 100 })),
    timeRange: fc.option(fc.constantFrom('daily', 'weekly', 'monthly')),
    chartType: fc.option(fc.constantFrom('line', 'bar', 'pie', 'doughnut')),
    filters: fc.option(fc.array(fc.string(), { maxLength: 5 })),
    showUnreadOnly: fc.option(fc.boolean())
  });

  // Generate valid widget
  const widgetArbitrary = fc.record({
    id: fc.string({ minLength: 5, maxLength: 20 }).map(s => s.replace(/[^a-zA-Z0-9-]/g, '-')),
    type: widgetTypeArbitrary,
    position: widgetPositionArbitrary,
    config: widgetConfigArbitrary
  });

  // Generate array of non-overlapping widgets
  const widgetsArrayArbitrary = fc.array(widgetArbitrary, { minLength: 1, maxLength: 8 })
    .map(widgets => {
      // Ensure unique IDs
      return widgets.map((widget, index) => ({
        ...widget,
        id: `${widget.type}-${index}`
      }));
    })
    .filter(widgets => {
      // Check for overlaps (simplified check)
      for (let i = 0; i < widgets.length; i++) {
        for (let j = i + 1; j < widgets.length; j++) {
          const w1 = widgets[i];
          const w2 = widgets[j];
          
          // Check if widgets overlap
          const overlap = !(
            w1.position.x + w1.position.w <= w2.position.x ||
            w2.position.x + w2.position.w <= w1.position.x ||
            w1.position.y + w1.position.h <= w2.position.y ||
            w2.position.y + w2.position.h <= w1.position.y
          );

          if (overlap) {
            return false; // Reject this combination
          }
        }
      }
      return true;
    });

  // Generate valid theme
  const themeArbitrary = fc.constantFrom('light', 'dark');

  // Generate admin ID
  const adminIdArbitrary = fc.integer({ min: 0, max: 999999 })
    .map(() => new mongoose.Types.ObjectId());

  /**
   * Test: Layout persistence round-trip
   * For any admin and any valid layout, saving and then loading should return the same layout
   */
  test('saved layout should persist exactly after save-load cycle', async () => {
    await fc.assert(
      fc.asyncProperty(
        adminIdArbitrary,
        widgetsArrayArbitrary,
        themeArbitrary,
        fc.boolean(),
        async (adminId, widgets, theme, sidebarCollapsed) => {
          // Action 1: Save layout
          const savedLayout = await saveLayout(adminId.toString(), {
            widgets,
            theme,
            sidebarCollapsed
          });

          // Action 2: Load layout
          const loadedLayout = await getLayout(adminId.toString());

          // Assert: Loaded layout matches saved layout
          expect(stripIds(loadedLayout.widgets)).toEqual(stripIds(savedLayout.widgets));
          expect(loadedLayout.theme).toBe(savedLayout.theme);
          expect(loadedLayout.sidebarCollapsed).toBe(savedLayout.sidebarCollapsed);

          // Assert: Widgets array has same length
          expect(loadedLayout.widgets.length).toBe(widgets.length);

          // Assert: Each widget is preserved exactly
          for (let i = 0; i < widgets.length; i++) {
            const original = widgets[i];
            const loaded = loadedLayout.widgets.find(w => w.id === original.id);
            
            expect(loaded).toBeDefined();
            expect(loaded.type).toBe(original.type);
            expect(loaded.position.x).toBe(original.position.x);
            expect(loaded.position.y).toBe(original.position.y);
            expect(loaded.position.w).toBe(original.position.w);
            expect(loaded.position.h).toBe(original.position.h);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test: Multiple save-load cycles preserve layout
   * For any admin and any sequence of layout changes, each save-load cycle should preserve the layout
   */
  test('layout should persist through multiple save-load cycles', async () => {
    await fc.assert(
      fc.asyncProperty(
        adminIdArbitrary,
        fc.array(
          fc.record({
            widgets: widgetsArrayArbitrary,
            theme: themeArbitrary,
            sidebarCollapsed: fc.boolean()
          }),
          { minLength: 2, maxLength: 5 }
        ),
        async (adminId, layoutSequence) => {
          for (const layoutData of layoutSequence) {
            // Save layout
            const saved = await saveLayout(adminId.toString(), layoutData);

            // Load layout
            const loaded = await getLayout(adminId.toString());

            // Assert: Loaded matches saved
            expect(stripIds(loaded.widgets)).toEqual(stripIds(saved.widgets));
            expect(loaded.theme).toBe(saved.theme);
            expect(loaded.sidebarCollapsed).toBe(saved.sidebarCollapsed);
          }
        }
      ),
      { numRuns: 50 } // Reduced runs for performance
    );
  });

  /**
   * Test: Partial updates preserve other fields
   * For any admin with an existing layout, updating only widgets should preserve theme and sidebar state
   */
  test('partial layout update should preserve non-updated fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        adminIdArbitrary,
        widgetsArrayArbitrary,
        themeArbitrary,
        fc.boolean(),
        widgetsArrayArbitrary,
        async (adminId, initialWidgets, initialTheme, initialSidebar, newWidgets) => {
          // Setup: Save initial layout
          await saveLayout(adminId.toString(), {
            widgets: initialWidgets,
            theme: initialTheme,
            sidebarCollapsed: initialSidebar
          });

          // Action: Update only widgets
          await saveLayout(adminId.toString(), {
            widgets: newWidgets
          });

          // Load layout
          const loaded = await getLayout(adminId.toString());

          // Assert: Widgets updated
          expect(stripIds(loaded.widgets)).toEqual(stripIds(newWidgets));

          // Assert: Theme and sidebar preserved
          expect(loaded.theme).toBe(initialTheme);
          expect(loaded.sidebarCollapsed).toBe(initialSidebar);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test: Reset restores default layout
   * For any admin with any custom layout, reset should restore the default layout
   */
  test('reset should restore default layout regardless of current layout', async () => {
    await fc.assert(
      fc.asyncProperty(
        adminIdArbitrary,
        widgetsArrayArbitrary,
        themeArbitrary,
        fc.boolean(),
        async (adminId, customWidgets, customTheme, customSidebar) => {
          // Setup: Save custom layout
          await saveLayout(adminId.toString(), {
            widgets: customWidgets,
            theme: customTheme,
            sidebarCollapsed: customSidebar
          });

          // Action: Reset layout
          const resetLayoutResult = await resetLayout(adminId.toString());

          // Assert: Layout is default
          expect(stripIds(resetLayoutResult.widgets)).toEqual(stripIds(DEFAULT_WIDGETS));
          expect(resetLayoutResult.theme).toBe('light');
          expect(resetLayoutResult.sidebarCollapsed).toBe(false);

          // Load and verify
          const loaded = await getLayout(adminId.toString());
          expect(stripIds(loaded.widgets)).toEqual(stripIds(DEFAULT_WIDGETS));
          expect(loaded.theme).toBe('light');
          expect(loaded.sidebarCollapsed).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test: Different admins have independent layouts
   * For any two different admins, their layouts should be independent
   */
  test('different admins should have independent layouts', async () => {
    await fc.assert(
      fc.asyncProperty(
        adminIdArbitrary,
        adminIdArbitrary,
        widgetsArrayArbitrary,
        widgetsArrayArbitrary,
        themeArbitrary,
        themeArbitrary,
        async (adminId1, adminId2, widgets1, widgets2, theme1, theme2) => {
          // Skip if same admin ID
          if (adminId1.toString() === adminId2.toString()) {
            return;
          }

          // Setup: Save different layouts for each admin
          await saveLayout(adminId1.toString(), {
            widgets: widgets1,
            theme: theme1,
            sidebarCollapsed: true
          });

          await saveLayout(adminId2.toString(), {
            widgets: widgets2,
            theme: theme2,
            sidebarCollapsed: false
          });

          // Load both layouts
          const layout1 = await getLayout(adminId1.toString());
          const layout2 = await getLayout(adminId2.toString());

          // Assert: Layouts are different
          expect(stripIds(layout1.widgets)).toEqual(stripIds(widgets1));
          expect(layout1.theme).toBe(theme1);
          expect(layout1.sidebarCollapsed).toBe(true);

          expect(stripIds(layout2.widgets)).toEqual(stripIds(widgets2));
          expect(layout2.theme).toBe(theme2);
          expect(layout2.sidebarCollapsed).toBe(false);

          // Assert: Layouts are independent
          expect(stripIds(layout1.widgets)).not.toEqual(stripIds(layout2.widgets));
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test: First load returns default layout
   * For any admin who has never saved a layout, getLayout should return default layout
   */
  test('first load should return default layout for new admin', async () => {
    await fc.assert(
      fc.asyncProperty(
        adminIdArbitrary,
        async (adminId) => {
          // Action: Load layout (no prior save)
          const layout = await getLayout(adminId.toString());

          // Assert: Layout is default
          expect(stripIds(layout.widgets)).toEqual(stripIds(DEFAULT_WIDGETS));
          expect(layout.theme).toBe('light');
          expect(layout.sidebarCollapsed).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test: Widget configuration is preserved
   * For any widget with custom configuration, the config should be preserved exactly
   */
  test('widget configuration should be preserved exactly', async () => {
    await fc.assert(
      fc.asyncProperty(
        adminIdArbitrary,
        widgetArbitrary,
        async (adminId, widget) => {
          // Setup: Save layout with single widget
          await saveLayout(adminId.toString(), {
            widgets: [widget]
          });

          // Load layout
          const loaded = await getLayout(adminId.toString());

          // Assert: Widget config preserved
          const loadedWidget = loaded.widgets[0];
          expect(loadedWidget.config).toEqual(widget.config);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test: Layout timestamp is updated on save
   * For any layout save, the updatedAt timestamp should be updated
   */
  test('layout timestamp should be updated on each save', async () => {
    await fc.assert(
      fc.asyncProperty(
        adminIdArbitrary,
        widgetsArrayArbitrary,
        widgetsArrayArbitrary,
        async (adminId, widgets1, widgets2) => {
          // Save first layout
          const saved1 = await saveLayout(adminId.toString(), { widgets: widgets1 });
          const timestamp1 = saved1.updatedAt;

          // Wait a bit to ensure different timestamp
          await new Promise(resolve => setTimeout(resolve, 10));

          // Save second layout
          const saved2 = await saveLayout(adminId.toString(), { widgets: widgets2 });
          const timestamp2 = saved2.updatedAt;

          // Assert: Timestamps are different
          expect(new Date(timestamp2).getTime()).toBeGreaterThan(new Date(timestamp1).getTime());
        }
      ),
      { numRuns: 50 } // Reduced runs due to setTimeout
    );
  });
});
