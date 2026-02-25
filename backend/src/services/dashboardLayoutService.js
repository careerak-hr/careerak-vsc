const DashboardLayout = require('../models/DashboardLayout');

/**
 * Dashboard Layout Service
 * 
 * Manages admin dashboard layouts with customizable widgets.
 * Implements Requirements 4.1-4.10
 */

/**
 * Default widget configurations for new dashboards
 * Provides a sensible starting layout with 8 different widget types
 */
const DEFAULT_WIDGETS = [
  {
    id: 'quick-stats-1',
    type: 'quick_stats',
    position: { x: 0, y: 0, w: 12, h: 2 },
    config: {
      metrics: ['activeUsers', 'jobsToday', 'applicationsToday', 'enrollmentsToday']
    }
  },
  {
    id: 'user-chart-1',
    type: 'user_chart',
    position: { x: 0, y: 2, w: 6, h: 4 },
    config: {
      timeRange: 'weekly',
      chartType: 'line'
    }
  },
  {
    id: 'job-chart-1',
    type: 'job_chart',
    position: { x: 6, y: 2, w: 6, h: 4 },
    config: {
      timeRange: 'weekly',
      chartType: 'bar'
    }
  },
  {
    id: 'recent-users-1',
    type: 'recent_users',
    position: { x: 0, y: 6, w: 4, h: 3 },
    config: {
      limit: 10
    }
  },
  {
    id: 'recent-jobs-1',
    type: 'recent_jobs',
    position: { x: 4, y: 6, w: 4, h: 3 },
    config: {
      limit: 10
    }
  },
  {
    id: 'recent-applications-1',
    type: 'recent_applications',
    position: { x: 8, y: 6, w: 4, h: 3 },
    config: {
      limit: 10
    }
  },
  {
    id: 'activity-log-1',
    type: 'activity_log',
    position: { x: 0, y: 9, w: 8, h: 4 },
    config: {
      limit: 20,
      filters: []
    }
  },
  {
    id: 'notifications-1',
    type: 'notifications',
    position: { x: 8, y: 9, w: 4, h: 4 },
    config: {
      limit: 10,
      showUnreadOnly: false
    }
  }
];

/**
 * Validate widget configuration
 * @param {Object} widget - Widget to validate
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 */
const validateWidget = (widget) => {
  const errors = [];

  // Check required fields
  if (!widget.id) {
    errors.push('Widget must have an id');
  }

  if (!widget.type) {
    errors.push('Widget must have a type');
  }

  // Validate widget type
  const validTypes = [
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
  ];

  if (widget.type && !validTypes.includes(widget.type)) {
    errors.push(`Invalid widget type: ${widget.type}`);
  }

  // Validate position
  if (!widget.position) {
    errors.push('Widget must have a position');
  } else {
    if (typeof widget.position.x !== 'number' || widget.position.x < 0) {
      errors.push('Widget position.x must be a non-negative number');
    }
    if (typeof widget.position.y !== 'number' || widget.position.y < 0) {
      errors.push('Widget position.y must be a non-negative number');
    }
    if (typeof widget.position.w !== 'number' || widget.position.w <= 0) {
      errors.push('Widget position.w must be a positive number');
    }
    if (typeof widget.position.h !== 'number' || widget.position.h <= 0) {
      errors.push('Widget position.h must be a positive number');
    }

    // Validate grid constraints (12-column grid)
    if (widget.position.x + widget.position.w > 12) {
      errors.push('Widget exceeds grid width (max 12 columns)');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate entire layout
 * @param {Array} widgets - Array of widgets to validate
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 */
const validateLayout = (widgets) => {
  const errors = [];

  if (!Array.isArray(widgets)) {
    errors.push('Widgets must be an array');
    return { valid: false, errors };
  }

  // Validate each widget
  widgets.forEach((widget, index) => {
    const validation = validateWidget(widget);
    if (!validation.valid) {
      errors.push(`Widget ${index} (${widget.id || 'unknown'}): ${validation.errors.join(', ')}`);
    }
  });

  // Check for duplicate IDs
  const ids = widgets.map(w => w.id).filter(Boolean);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    errors.push(`Duplicate widget IDs found: ${duplicateIds.join(', ')}`);
  }

  // Check for overlapping widgets (optional - can be allowed in some grid systems)
  // This is a simplified check - real overlap detection would be more complex
  for (let i = 0; i < widgets.length; i++) {
    for (let j = i + 1; j < widgets.length; j++) {
      const w1 = widgets[i];
      const w2 = widgets[j];
      
      if (w1.position && w2.position) {
        const overlap = !(
          w1.position.x + w1.position.w <= w2.position.x ||
          w2.position.x + w2.position.w <= w1.position.x ||
          w1.position.y + w1.position.h <= w2.position.y ||
          w2.position.y + w2.position.h <= w1.position.y
        );

        if (overlap) {
          errors.push(`Widgets ${w1.id} and ${w2.id} overlap`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Get dashboard layout for an admin
 * Returns saved layout or default layout if none exists
 * Requirements: 4.8
 * 
 * @param {string} adminId - Admin user ID
 * @returns {Promise<Object>} Dashboard layout
 */
const getLayout = async (adminId) => {
  try {
    // Try to find existing layout
    let layout = await DashboardLayout.findOne({ adminId });

    // If no layout exists, create default layout
    if (!layout) {
      layout = new DashboardLayout({
        adminId,
        widgets: DEFAULT_WIDGETS,
        theme: 'light',
        sidebarCollapsed: false
      });
      await layout.save();
      console.log(`[DashboardLayout] Created default layout for admin ${adminId}`);
    }

    return {
      widgets: layout.widgets,
      theme: layout.theme,
      sidebarCollapsed: layout.sidebarCollapsed,
      updatedAt: layout.updatedAt
    };
  } catch (error) {
    console.error('Error in getLayout:', error);
    throw new Error('Failed to fetch dashboard layout');
  }
};

/**
 * Save dashboard layout for an admin
 * Validates layout before saving
 * Requirements: 4.3, 4.7
 * 
 * @param {string} adminId - Admin user ID
 * @param {Object} layoutData - Layout data to save
 * @param {Array} layoutData.widgets - Array of widgets
 * @param {string} layoutData.theme - Theme (light/dark)
 * @param {boolean} layoutData.sidebarCollapsed - Sidebar state
 * @returns {Promise<Object>} Saved layout
 */
const saveLayout = async (adminId, layoutData) => {
  try {
    // Validate widgets if provided
    if (layoutData.widgets) {
      const validation = validateLayout(layoutData.widgets);
      if (!validation.valid) {
        throw new Error(`Invalid layout: ${validation.errors.join('; ')}`);
      }
    }

    // Validate theme if provided
    if (layoutData.theme && !['light', 'dark'].includes(layoutData.theme)) {
      throw new Error('Invalid theme: must be "light" or "dark"');
    }

    // Find existing layout or create new one
    let layout = await DashboardLayout.findOne({ adminId });

    if (layout) {
      // Update existing layout
      if (layoutData.widgets) {
        layout.widgets = layoutData.widgets;
      }
      if (layoutData.theme) {
        layout.theme = layoutData.theme;
      }
      if (typeof layoutData.sidebarCollapsed === 'boolean') {
        layout.sidebarCollapsed = layoutData.sidebarCollapsed;
      }
      layout.updatedAt = new Date();
    } else {
      // Create new layout
      layout = new DashboardLayout({
        adminId,
        widgets: layoutData.widgets || DEFAULT_WIDGETS,
        theme: layoutData.theme || 'light',
        sidebarCollapsed: layoutData.sidebarCollapsed || false
      });
    }

    await layout.save();
    console.log(`[DashboardLayout] Saved layout for admin ${adminId}`);

    return {
      widgets: layout.widgets,
      theme: layout.theme,
      sidebarCollapsed: layout.sidebarCollapsed,
      updatedAt: layout.updatedAt
    };
  } catch (error) {
    console.error('Error in saveLayout:', error);
    
    // Re-throw validation errors as-is
    if (error.message.startsWith('Invalid')) {
      throw error;
    }
    
    throw new Error('Failed to save dashboard layout');
  }
};

/**
 * Reset dashboard layout to default
 * Requirements: 4.9
 * 
 * @param {string} adminId - Admin user ID
 * @returns {Promise<Object>} Reset layout
 */
const resetLayout = async (adminId) => {
  try {
    // Find existing layout or create new one
    let layout = await DashboardLayout.findOne({ adminId });

    if (layout) {
      // Reset to defaults
      layout.widgets = DEFAULT_WIDGETS;
      layout.theme = 'light';
      layout.sidebarCollapsed = false;
      layout.updatedAt = new Date();
      await layout.save();
      console.log(`[DashboardLayout] Reset layout for admin ${adminId}`);
    } else {
      // Create new layout with defaults
      layout = new DashboardLayout({
        adminId,
        widgets: DEFAULT_WIDGETS,
        theme: 'light',
        sidebarCollapsed: false
      });
      await layout.save();
      console.log(`[DashboardLayout] Created default layout for admin ${adminId}`);
    }

    return {
      widgets: layout.widgets,
      theme: layout.theme,
      sidebarCollapsed: layout.sidebarCollapsed,
      updatedAt: layout.updatedAt
    };
  } catch (error) {
    console.error('Error in resetLayout:', error);
    throw new Error('Failed to reset dashboard layout');
  }
};

/**
 * Delete dashboard layout for an admin
 * Used for cleanup when admin is deleted
 * 
 * @param {string} adminId - Admin user ID
 * @returns {Promise<boolean>} Success status
 */
const deleteLayout = async (adminId) => {
  try {
    const result = await DashboardLayout.deleteOne({ adminId });
    console.log(`[DashboardLayout] Deleted layout for admin ${adminId}`);
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error in deleteLayout:', error);
    throw new Error('Failed to delete dashboard layout');
  }
};

/**
 * Get default widget configurations
 * Useful for frontend to know available widget types
 * 
 * @returns {Array} Default widgets
 */
const getDefaultWidgets = () => {
  return JSON.parse(JSON.stringify(DEFAULT_WIDGETS)); // Deep clone
};

module.exports = {
  getLayout,
  saveLayout,
  resetLayout,
  deleteLayout,
  getDefaultWidgets,
  validateWidget, // Export for testing
  validateLayout, // Export for testing
  DEFAULT_WIDGETS // Export for testing
};
