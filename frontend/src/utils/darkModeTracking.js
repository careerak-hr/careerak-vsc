/**
 * Dark Mode Adoption Tracking Utility
 * 
 * Tracks dark mode usage metrics for analytics and optimization:
 * - Theme changes (light → dark, dark → light, system)
 * - Session duration in each mode
 * - User preferences over time
 * - Platform and browser breakdown
 * 
 * Data is stored in localStorage and optionally sent to backend API.
 * 
 * @module darkModeTracking
 */

const STORAGE_KEY = 'careerak_dark_mode_metrics';
const MAX_EVENTS = 1000; // Limit stored events to prevent localStorage overflow

/**
 * Get platform information
 * @returns {string} Platform name (Android, iOS, Desktop)
 */
const getPlatform = () => {
  if (typeof window === 'undefined') return 'Unknown';
  
  const ua = window.navigator.userAgent;
  if (/android/i.test(ua)) return 'Android';
  if (/iPad|iPhone|iPod/.test(ua)) return 'iOS';
  return 'Desktop';
};

/**
 * Get browser information
 * @returns {string} Browser name (Chrome, Safari, Firefox, Edge, Other)
 */
const getBrowser = () => {
  if (typeof window === 'undefined') return 'Unknown';
  
  const ua = window.navigator.userAgent;
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  return 'Other';
};

/**
 * Get stored metrics from localStorage
 * @returns {Array} Array of metric events
 */
const getStoredMetrics = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to parse dark mode metrics:', error);
    return [];
  }
};

/**
 * Save metrics to localStorage
 * @param {Array} metrics - Array of metric events
 */
const saveMetrics = (metrics) => {
  try {
    // Keep only the most recent MAX_EVENTS
    const trimmed = metrics.slice(-MAX_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save dark mode metrics:', error);
  }
};

/**
 * Track a dark mode event
 * @param {string} eventType - Type of event (theme_changed, session_start, session_end)
 * @param {Object} data - Additional event data
 */
export const trackDarkModeEvent = (eventType, data = {}) => {
  if (typeof window === 'undefined') return;

  const event = {
    type: eventType,
    timestamp: new Date().toISOString(),
    platform: getPlatform(),
    browser: getBrowser(),
    ...data
  };

  // Store in localStorage
  const metrics = getStoredMetrics();
  metrics.push(event);
  saveMetrics(metrics);

  // Send to backend API if available
  sendToBackend(event);

  // Send to Google Analytics if available
  sendToGA(event);
};

/**
 * Send event to backend API
 * @param {Object} event - Event data
 */
const sendToBackend = async (event) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL;
    if (!apiUrl) return;

    await fetch(`${apiUrl}/api/analytics/dark-mode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
  } catch (error) {
    // Silently fail - analytics shouldn't break the app
    console.debug('Failed to send dark mode event to backend:', error);
  }
};

/**
 * Send event to Google Analytics
 * @param {Object} event - Event data
 */
const sendToGA = (event) => {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'dark_mode_tracking', {
        event_category: 'Theme',
        event_label: event.type,
        theme_mode: event.themeMode,
        from_mode: event.fromMode,
        to_mode: event.toMode,
        platform: event.platform,
        browser: event.browser,
      });
    }
  } catch (error) {
    console.debug('Failed to send dark mode event to GA:', error);
  }
};

/**
 * Track theme change
 * @param {string} fromMode - Previous theme mode
 * @param {string} toMode - New theme mode
 * @param {boolean} isDark - Whether dark mode is active
 */
export const trackThemeChange = (fromMode, toMode, isDark) => {
  trackDarkModeEvent('theme_changed', {
    fromMode,
    toMode,
    isDark,
    themeMode: toMode,
  });
};

/**
 * Track session start
 * @param {string} themeMode - Current theme mode
 * @param {boolean} isDark - Whether dark mode is active
 */
export const trackSessionStart = (themeMode, isDark) => {
  trackDarkModeEvent('session_start', {
    themeMode,
    isDark,
  });
};

/**
 * Track session end
 * @param {string} themeMode - Current theme mode
 * @param {boolean} isDark - Whether dark mode is active
 * @param {number} duration - Session duration in milliseconds
 */
export const trackSessionEnd = (themeMode, isDark, duration) => {
  trackDarkModeEvent('session_end', {
    themeMode,
    isDark,
    duration,
  });
};

/**
 * Get dark mode adoption metrics
 * @param {number} days - Number of days to analyze (default: 30)
 * @returns {Object} Adoption metrics
 */
export const getDarkModeMetrics = (days = 30) => {
  const metrics = getStoredMetrics();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // Filter events within the time period
  const recentEvents = metrics.filter(event => {
    const eventDate = new Date(event.timestamp);
    return eventDate >= cutoffDate;
  });

  // Count theme changes
  const themeChanges = recentEvents.filter(e => e.type === 'theme_changed');
  
  // Count sessions by theme
  const sessionStarts = recentEvents.filter(e => e.type === 'session_start');
  const darkSessions = sessionStarts.filter(e => e.isDark).length;
  const lightSessions = sessionStarts.filter(e => !e.isDark).length;
  const totalSessions = sessionStarts.length;

  // Calculate adoption rate
  const adoptionRate = totalSessions > 0 ? (darkSessions / totalSessions) * 100 : 0;

  // Count by platform
  const byPlatform = {};
  sessionStarts.forEach(event => {
    const platform = event.platform || 'Unknown';
    if (!byPlatform[platform]) {
      byPlatform[platform] = { dark: 0, light: 0, total: 0 };
    }
    byPlatform[platform].total++;
    if (event.isDark) {
      byPlatform[platform].dark++;
    } else {
      byPlatform[platform].light++;
    }
  });

  // Count by browser
  const byBrowser = {};
  sessionStarts.forEach(event => {
    const browser = event.browser || 'Unknown';
    if (!byBrowser[browser]) {
      byBrowser[browser] = { dark: 0, light: 0, total: 0 };
    }
    byBrowser[browser].total++;
    if (event.isDark) {
      byBrowser[browser].dark++;
    } else {
      byBrowser[browser].light++;
    }
  });

  // Daily trends
  const dailyTrends = {};
  sessionStarts.forEach(event => {
    const date = new Date(event.timestamp).toISOString().split('T')[0];
    if (!dailyTrends[date]) {
      dailyTrends[date] = { dark: 0, light: 0, total: 0 };
    }
    dailyTrends[date].total++;
    if (event.isDark) {
      dailyTrends[date].dark++;
    } else {
      dailyTrends[date].light++;
    }
  });

  return {
    period: days,
    totalSessions,
    darkSessions,
    lightSessions,
    adoptionRate: adoptionRate.toFixed(2),
    themeChanges: themeChanges.length,
    byPlatform,
    byBrowser,
    dailyTrends,
  };
};

/**
 * Export metrics to JSON
 * @param {number} days - Number of days to export (default: 30)
 * @returns {string} JSON string of metrics
 */
export const exportMetrics = (days = 30) => {
  const metrics = getDarkModeMetrics(days);
  return JSON.stringify(metrics, null, 2);
};

/**
 * Clear all stored metrics
 */
export const clearMetrics = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear dark mode metrics:', error);
  }
};

/**
 * Initialize dark mode tracking
 * Call this once when the app starts
 */
export const initDarkModeTracking = () => {
  if (typeof window === 'undefined') return;

  // Track session start
  const themeMode = localStorage.getItem('careerak-theme') || 'system';
  const isDark = document.documentElement.classList.contains('dark');
  
  trackSessionStart(themeMode, isDark);

  // Track session end on page unload
  const sessionStartTime = Date.now();
  
  window.addEventListener('beforeunload', () => {
    const duration = Date.now() - sessionStartTime;
    const currentThemeMode = localStorage.getItem('careerak-theme') || 'system';
    const currentIsDark = document.documentElement.classList.contains('dark');
    
    trackSessionEnd(currentThemeMode, currentIsDark, duration);
  });
};

export default {
  trackDarkModeEvent,
  trackThemeChange,
  trackSessionStart,
  trackSessionEnd,
  getDarkModeMetrics,
  exportMetrics,
  clearMetrics,
  initDarkModeTracking,
};
