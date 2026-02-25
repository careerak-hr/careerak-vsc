import React, { useState, useCallback, useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './WidgetContainer.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

/**
 * WidgetContainer - Container for draggable and resizable dashboard widgets
 * 
 * Features:
 * - Drag-and-drop with react-grid-layout
 * - Resize handling
 * - Add/remove widget functionality
 * - Widget configuration modal
 * 
 * Requirements: 4.1-4.7
 */
const WidgetContainer = ({ 
  dashboardContext,
  availableWidgets = [],
  onLayoutChange,
  children 
}) => {
  const {
    layout,
    setLayout,
    isEditMode,
    saveDashboardLayout,
    language,
    isRTL
  } = dashboardContext || {};

  const [showAddWidgetModal, setShowAddWidgetModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState(null);

  // Default available widgets
  const defaultAvailableWidgets = [
    { id: 'quick_stats', name: language === 'ar' ? 'إحصائيات سريعة' : language === 'fr' ? 'Statistiques rapides' : 'Quick Stats', icon: '📊' },
    { id: 'user_chart', name: language === 'ar' ? 'مخطط المستخدمين' : language === 'fr' ? 'Graphique des utilisateurs' : 'User Chart', icon: '👥' },
    { id: 'job_chart', name: language === 'ar' ? 'مخطط الوظائف' : language === 'fr' ? 'Graphique des emplois' : 'Job Chart', icon: '💼' },
    { id: 'course_chart', name: language === 'ar' ? 'مخطط الدورات' : language === 'fr' ? 'Graphique des cours' : 'Course Chart', icon: '📚' },
    { id: 'review_chart', name: language === 'ar' ? 'مخطط التقييمات' : language === 'fr' ? 'Graphique des avis' : 'Review Chart', icon: '⭐' },
    { id: 'recent_users', name: language === 'ar' ? 'مستخدمون جدد' : language === 'fr' ? 'Nouveaux utilisateurs' : 'Recent Users', icon: '🆕' },
    { id: 'recent_jobs', name: language === 'ar' ? 'وظائف جديدة' : language === 'fr' ? 'Nouveaux emplois' : 'Recent Jobs', icon: '📝' },
    { id: 'recent_applications', name: language === 'ar' ? 'طلبات جديدة' : language === 'fr' ? 'Nouvelles candidatures' : 'Recent Applications', icon: '📋' },
    { id: 'activity_log', name: language === 'ar' ? 'سجل النشاط' : language === 'fr' ? 'Journal d\'activité' : 'Activity Log', icon: '📜' },
    { id: 'flagged_reviews', name: language === 'ar' ? 'تقييمات مبلغ عنها' : language === 'fr' ? 'Avis signalés' : 'Flagged Reviews', icon: '🚩' },
    { id: 'notifications', name: language === 'ar' ? 'الإشعارات' : language === 'fr' ? 'Notifications' : 'Notifications', icon: '🔔' }
  ];

  const widgets = availableWidgets.length > 0 ? availableWidgets : defaultAvailableWidgets;

  // Convert layout to react-grid-layout format
  const gridLayout = useMemo(() => {
    return (layout || []).map(widget => ({
      i: widget.id,
      x: widget.position.x,
      y: widget.position.y,
      w: widget.position.w,
      h: widget.position.h,
      minW: 2,
      minH: 2,
      maxW: 12,
      maxH: 10
    }));
  }, [layout]);

  // Handle layout change
  const handleLayoutChange = useCallback((newLayout) => {
    if (!isEditMode) return;

    // Convert back to our format
    const updatedLayout = newLayout.map(item => {
      const existingWidget = layout.find(w => w.id === item.i);
      return {
        ...existingWidget,
        id: item.i,
        position: {
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h
        }
      };
    });

    setLayout(updatedLayout);
    
    // Auto-save layout
    if (saveDashboardLayout) {
      saveDashboardLayout(updatedLayout);
    }

    // Notify parent
    if (onLayoutChange) {
      onLayoutChange(updatedLayout);
    }
  }, [isEditMode, layout, setLayout, saveDashboardLayout, onLayoutChange]);

  // Add widget
  const handleAddWidget = useCallback((widgetType) => {
    const newWidget = {
      id: `${widgetType}-${Date.now()}`,
      type: widgetType,
      position: {
        x: 0,
        y: Infinity, // Add to bottom
        w: 6,
        h: 4
      },
      config: {}
    };

    const updatedLayout = [...layout, newWidget];
    setLayout(updatedLayout);
    
    if (saveDashboardLayout) {
      saveDashboardLayout(updatedLayout);
    }

    setShowAddWidgetModal(false);
  }, [layout, setLayout, saveDashboardLayout]);

  // Remove widget
  const handleRemoveWidget = useCallback((widgetId) => {
    const updatedLayout = layout.filter(w => w.id !== widgetId);
    setLayout(updatedLayout);
    
    if (saveDashboardLayout) {
      saveDashboardLayout(updatedLayout);
    }
  }, [layout, setLayout, saveDashboardLayout]);

  // Configure widget
  const handleConfigureWidget = useCallback((widget) => {
    setSelectedWidget(widget);
    setShowConfigModal(true);
  }, []);

  // Save widget configuration
  const handleSaveConfig = useCallback((widgetId, config) => {
    const updatedLayout = layout.map(w => 
      w.id === widgetId ? { ...w, config } : w
    );
    setLayout(updatedLayout);
    
    if (saveDashboardLayout) {
      saveDashboardLayout(updatedLayout);
    }

    setShowConfigModal(false);
    setSelectedWidget(null);
  }, [layout, setLayout, saveDashboardLayout]);

  // Responsive breakpoints
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

  return (
    <div className={`widget-container ${isEditMode ? 'edit-mode' : ''} ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Add Widget Button (only in edit mode) */}
      {isEditMode && (
        <div className="widget-controls">
          <button 
            className="add-widget-btn"
            onClick={() => setShowAddWidgetModal(true)}
            aria-label="Add widget"
          >
            <span className="icon">+</span>
            <span className="text">
              {language === 'ar' ? 'إضافة عنصر' : language === 'fr' ? 'Ajouter un widget' : 'Add Widget'}
            </span>
          </button>
        </div>
      )}

      {/* Grid Layout */}
      <ResponsiveGridLayout
        className="grid-layout"
        layouts={{ lg: gridLayout }}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={60}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".widget-drag-handle"
        compactType="vertical"
        preventCollision={false}
      >
        {(layout || []).map((widget) => (
          <div key={widget.id} className="widget-wrapper">
            {/* Widget Header (only in edit mode) */}
            {isEditMode && (
              <div className="widget-header">
                <div className="widget-drag-handle" title="Drag to move">
                  <span className="icon">⋮⋮</span>
                </div>
                <div className="widget-actions">
                  <button
                    className="widget-config-btn"
                    onClick={() => handleConfigureWidget(widget)}
                    title="Configure"
                    aria-label="Configure widget"
                  >
                    <span className="icon">⚙️</span>
                  </button>
                  <button
                    className="widget-remove-btn"
                    onClick={() => handleRemoveWidget(widget.id)}
                    title="Remove"
                    aria-label="Remove widget"
                  >
                    <span className="icon">✕</span>
                  </button>
                </div>
              </div>
            )}

            {/* Widget Content */}
            <div className="widget-content">
              {React.Children.map(children, child => {
                if (React.isValidElement(child) && child.props.widgetId === widget.id) {
                  return React.cloneElement(child, { widget, isEditMode });
                }
                return null;
              })}
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>

      {/* Add Widget Modal */}
      {showAddWidgetModal && (
        <div className="modal-overlay" onClick={() => setShowAddWidgetModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {language === 'ar' ? 'إضافة عنصر' : language === 'fr' ? 'Ajouter un widget' : 'Add Widget'}
              </h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddWidgetModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="widget-grid">
                {widgets.map((widget) => (
                  <button
                    key={widget.id}
                    className="widget-option"
                    onClick={() => handleAddWidget(widget.id)}
                  >
                    <span className="widget-icon">{widget.icon}</span>
                    <span className="widget-name">{widget.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configure Widget Modal */}
      {showConfigModal && selectedWidget && (
        <div className="modal-overlay" onClick={() => setShowConfigModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {language === 'ar' ? 'تكوين العنصر' : language === 'fr' ? 'Configurer le widget' : 'Configure Widget'}
              </h2>
              <button 
                className="modal-close"
                onClick={() => setShowConfigModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                {language === 'ar' ? 'خيارات التكوين للعنصر:' : language === 'fr' ? 'Options de configuration pour le widget:' : 'Configuration options for widget:'} {selectedWidget.type}
              </p>
              {/* Widget-specific configuration form would go here */}
              <div className="config-form">
                <p className="config-placeholder">
                  {language === 'ar' ? 'نموذج التكوين سيتم إضافته هنا' : language === 'fr' ? 'Le formulaire de configuration sera ajouté ici' : 'Configuration form will be added here'}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowConfigModal(false)}
              >
                {language === 'ar' ? 'إلغاء' : language === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button 
                className="btn-save"
                onClick={() => handleSaveConfig(selectedWidget.id, selectedWidget.config)}
              >
                {language === 'ar' ? 'حفظ' : language === 'fr' ? 'Enregistrer' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetContainer;
