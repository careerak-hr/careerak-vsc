import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import pusherClient from '../../utils/pusherClient';
import './DashboardContainer.css';

/**
 * DashboardContainer - Main container component for admin dashboard
 * 
 * Features:
 * - Layout state management
 * - Edit mode toggle
 * - Theme switching (light/dark)
 * - Pusher client connection for real-time updates
 * - RTL support for Arabic
 * 
 * Requirements: 4.1-4.10, 10.2, 10.3, 10.9
 */
const DashboardContainer = ({ adminId, role = 'admin', children }) => {
  const { language, isRTL } = useApp();
  
  // Dashboard state
  const [layout, setLayout] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [theme, setTheme] = useState('light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pusherConnected, setPusherConnected] = useState(false);

  // Load dashboard layout from API
  const loadDashboardLayout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/admin/dashboard/layout', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load dashboard layout');
      }

      const data = await response.json();
      setLayout(data.widgets || []);
      setTheme(data.theme || 'light');
      setSidebarCollapsed(data.sidebarCollapsed || false);
    } catch (err) {
      console.error('Error loading dashboard layout:', err);
      setError(err.message);
      // Load default layout on error
      loadDefaultLayout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load default layout
  const loadDefaultLayout = () => {
    const defaultLayout = [
      { id: 'quick-stats', type: 'quick_stats', position: { x: 0, y: 0, w: 12, h: 2 } },
      { id: 'user-chart', type: 'user_chart', position: { x: 0, y: 2, w: 6, h: 4 } },
      { id: 'job-chart', type: 'job_chart', position: { x: 6, y: 2, w: 6, h: 4 } },
      { id: 'activity-log', type: 'activity_log', position: { x: 0, y: 6, w: 12, h: 4 } }
    ];
    setLayout(defaultLayout);
  };

  // Save dashboard layout to API
  const saveDashboardLayout = useCallback(async (newLayout) => {
    try {
      const response = await fetch('/api/admin/dashboard/layout', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ widgets: newLayout })
      });

      if (!response.ok) {
        throw new Error('Failed to save dashboard layout');
      }

      return true;
    } catch (err) {
      console.error('Error saving dashboard layout:', err);
      setError(err.message);
      return false;
    }
  }, []);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
  }, []);

  // Toggle theme
  const toggleTheme = useCallback(async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    // Apply theme to document
    document.documentElement.setAttribute('data-theme', newTheme);

    // Save theme preference
    try {
      await fetch('/api/admin/dashboard/layout', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          widgets: layout,
          theme: newTheme 
        })
      });
    } catch (err) {
      console.error('Error saving theme preference:', err);
    }
  }, [theme, layout]);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // Reset layout to default
  const resetLayout = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/dashboard/layout/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reset dashboard layout');
      }

      const data = await response.json();
      setLayout(data.widgets || []);
    } catch (err) {
      console.error('Error resetting dashboard layout:', err);
      setError(err.message);
      loadDefaultLayout();
    }
  }, []);

  // Initialize Pusher connection
  useEffect(() => {
    const initPusher = async () => {
      try {
        // Initialize Pusher client
        await pusherClient.init();
        
        // Subscribe to admin channel
        const channel = pusherClient.subscribe(`private-admin-${adminId}`);
        
        // Listen for real-time updates
        channel.bind('statistics-update', (data) => {
          // Trigger statistics refresh
          window.dispatchEvent(new CustomEvent('dashboard-statistics-update', { detail: data }));
        });

        channel.bind('notification', (data) => {
          // Trigger notification update
          window.dispatchEvent(new CustomEvent('dashboard-notification', { detail: data }));
        });

        channel.bind('activity-log', (data) => {
          // Trigger activity log update
          window.dispatchEvent(new CustomEvent('dashboard-activity-log', { detail: data }));
        });

        setPusherConnected(true);
      } catch (err) {
        console.error('Error initializing Pusher:', err);
        setPusherConnected(false);
      }
    };

    initPusher();

    // Cleanup on unmount
    return () => {
      pusherClient.unsubscribe(`private-admin-${adminId}`);
    };
  }, [adminId]);

  // Load dashboard layout on mount
  useEffect(() => {
    loadDashboardLayout();
  }, [loadDashboardLayout]);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Apply RTL direction
  useEffect(() => {
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [isRTL]);

  // Context value for child components
  const dashboardContext = {
    layout,
    setLayout,
    widgets,
    setWidgets,
    isEditMode,
    toggleEditMode,
    theme,
    toggleTheme,
    sidebarCollapsed,
    toggleSidebar,
    resetLayout,
    saveDashboardLayout,
    pusherConnected,
    adminId,
    role,
    language,
    isRTL
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>{language === 'ar' ? 'جاري التحميل...' : language === 'fr' ? 'Chargement...' : 'Loading...'}</p>
      </div>
    );
  }

  if (error && layout.length === 0) {
    return (
      <div className="dashboard-error">
        <p>{language === 'ar' ? 'خطأ في تحميل لوحة التحكم' : language === 'fr' ? 'Erreur de chargement du tableau de bord' : 'Error loading dashboard'}</p>
        <button onClick={loadDashboardLayout}>
          {language === 'ar' ? 'إعادة المحاولة' : language === 'fr' ? 'Réessayer' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`dashboard-container ${theme} ${isRTL ? 'rtl' : 'ltr'} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
      data-edit-mode={isEditMode}
    >
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="icon">{sidebarCollapsed ? '☰' : '✕'}</span>
          </button>
          <h1 className="dashboard-title">
            {language === 'ar' ? 'لوحة التحكم' : language === 'fr' ? 'Tableau de bord' : 'Admin Dashboard'}
          </h1>
        </div>

        <div className="header-right">
          {/* Pusher connection indicator */}
          <div className={`pusher-status ${pusherConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              {pusherConnected 
                ? (language === 'ar' ? 'متصل' : language === 'fr' ? 'Connecté' : 'Connected')
                : (language === 'ar' ? 'غير متصل' : language === 'fr' ? 'Déconnecté' : 'Disconnected')
              }
            </span>
          </div>

          {/* Theme toggle */}
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <span className="icon">{theme === 'light' ? '🌙' : '☀️'}</span>
          </button>

          {/* Edit mode toggle */}
          <button 
            className={`edit-mode-toggle ${isEditMode ? 'active' : ''}`}
            onClick={toggleEditMode}
            aria-label={isEditMode ? 'Exit edit mode' : 'Enter edit mode'}
          >
            <span className="icon">{isEditMode ? '✓' : '✎'}</span>
            <span className="text">
              {isEditMode 
                ? (language === 'ar' ? 'حفظ' : language === 'fr' ? 'Enregistrer' : 'Save')
                : (language === 'ar' ? 'تعديل' : language === 'fr' ? 'Modifier' : 'Edit')
              }
            </span>
          </button>

          {/* Reset layout button (only in edit mode) */}
          {isEditMode && (
            <button 
              className="reset-layout-btn"
              onClick={resetLayout}
              aria-label="Reset layout to default"
            >
              <span className="icon">↺</span>
              <span className="text">
                {language === 'ar' ? 'إعادة تعيين' : language === 'fr' ? 'Réinitialiser' : 'Reset'}
              </span>
            </button>
          )}
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="dashboard-content">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { dashboardContext });
          }
          return child;
        })}
      </main>
    </div>
  );
};

export default DashboardContainer;
