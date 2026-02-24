/**
 * PWA Install Tracking Utility
 * 
 * Requirements:
 * - Task 10.4.4: Monitor PWA install rate
 * - FR-PWA-4: Display install prompt on mobile
 * - FR-PWA-5: Provide standalone app experience
 * 
 * This utility tracks PWA install events and stores metrics for analysis:
 * - beforeinstallprompt event (prompt shown)
 * - appinstalled event (install completed)
 * - User dismissal of install prompt
 * 
 * Metrics are stored in:
 * 1. localStorage (client-side persistence)
 * 2. Backend API (if available)
 * 3. Google Analytics (if configured)
 * 
 * Usage:
 *   import { initPwaInstallTracking } from './utils/pwaInstallTracking';
 *   
 *   // In App.jsx or index.jsx
 *   initPwaInstallTracking();
 */

// Storage key for metrics
const METRICS_STORAGE_KEY = 'careerak_pwa_install_metrics';
const MAX_STORED_METRICS = 1000; // Limit storage size

/**
 * Detect platform
 */
function detectPlatform() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  if (/android/i.test(userAgent)) {
    return 'Android';
  }
  
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return 'iOS';
  }
  
  if (/Windows/.test(userAgent)) {
    return 'Desktop-Windows';
  }
  
  if (/Mac/.test(userAgent)) {
    return 'Desktop-Mac';
  }
  
  if (/Linux/.test(userAgent)) {
    return 'Desktop-Linux';
  }
  
  return 'Unknown';
}

/**
 * Detect browser
 */
function detectBrowser() {
  const userAgent = navigator.userAgent;
  
  if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) {
    return 'Chrome';
  }
  
  if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
    return 'Safari';
  }
  
  if (userAgent.indexOf('Firefox') > -1) {
    return 'Firefox';
  }
  
  if (userAgent.indexOf('Edg') > -1) {
    return 'Edge';
  }
  
  if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    return 'Opera';
  }
  
  return 'Unknown';
}

/**
 * Get stored metrics
 */
function getStoredMetrics() {
  try {
    const stored = localStorage.getItem(METRICS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[PWA Tracking] Failed to load metrics:', error);
    return [];
  }
}

/**
 * Store metric
 */
function storeMetric(metric) {
  try {
    const metrics = getStoredMetrics();
    
    // Add new metric
    metrics.push({
      ...metric,
      timestamp: new Date().toISOString(),
      platform: detectPlatform(),
      browser: detectBrowser(),
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    });
    
    // Limit storage size (keep most recent)
    if (metrics.length > MAX_STORED_METRICS) {
      metrics.splice(0, metrics.length - MAX_STORED_METRICS);
    }
    
    // Save to localStorage
    localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(metrics));
    
    // Send to backend if available
    sendMetricToBackend(metric);
    
    // Send to Google Analytics if available
    sendMetricToAnalytics(metric);
    
    console.log('[PWA Tracking] Metric stored:', metric.event);
  } catch (error) {
    console.error('[PWA Tracking] Failed to store metric:', error);
  }
}

/**
 * Send metric to backend API
 */
async function sendMetricToBackend(metric) {
  try {
    // Check if backend API is available
    const apiUrl = process.env.REACT_APP_API_URL || process.env.VITE_API_URL;
    if (!apiUrl) {
      return;
    }
    
    const endpoint = `${apiUrl}/analytics/pwa-install`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...metric,
        timestamp: new Date().toISOString(),
        platform: detectPlatform(),
        browser: detectBrowser(),
      }),
    });
    
    if (!response.ok) {
      console.warn('[PWA Tracking] Backend API returned error:', response.status);
    }
  } catch (error) {
    // Silently fail - backend tracking is optional
    console.debug('[PWA Tracking] Backend API not available:', error.message);
  }
}

/**
 * Send metric to Google Analytics
 */
function sendMetricToAnalytics(metric) {
  try {
    // Check if Google Analytics is available
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'pwa_install_tracking', {
        event_category: 'PWA',
        event_label: metric.event,
        platform: detectPlatform(),
        browser: detectBrowser(),
        value: metric.event === 'install_completed' ? 1 : 0,
      });
    }
    
    // Check if Google Analytics 4 is available
    if (typeof window.dataLayer !== 'undefined') {
      window.dataLayer.push({
        event: 'pwa_install_tracking',
        pwa_event: metric.event,
        pwa_platform: detectPlatform(),
        pwa_browser: detectBrowser(),
      });
    }
  } catch (error) {
    // Silently fail - analytics tracking is optional
    console.debug('[PWA Tracking] Analytics not available:', error.message);
  }
}

/**
 * Track install prompt shown
 */
function trackPromptShown(event) {
  storeMetric({
    event: 'prompt_shown',
    promptType: 'beforeinstallprompt',
  });
  
  console.log('[PWA Tracking] Install prompt shown');
}

/**
 * Track install prompt accepted
 */
function trackPromptAccepted() {
  storeMetric({
    event: 'prompt_accepted',
  });
  
  console.log('[PWA Tracking] Install prompt accepted');
}

/**
 * Track install prompt dismissed
 */
function trackPromptDismissed() {
  storeMetric({
    event: 'prompt_dismissed',
  });
  
  console.log('[PWA Tracking] Install prompt dismissed');
}

/**
 * Track install completed
 */
function trackInstallCompleted() {
  storeMetric({
    event: 'install_completed',
  });
  
  console.log('[PWA Tracking] PWA install completed');
}

/**
 * Track app launched in standalone mode
 */
function trackStandaloneLaunch() {
  storeMetric({
    event: 'standalone_launch',
  });
  
  console.log('[PWA Tracking] App launched in standalone mode');
}

/**
 * Get install rate statistics
 */
export function getPwaInstallStats(periodDays = 30) {
  const metrics = getStoredMetrics();
  
  // Filter by period
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - periodDays);
  
  const filteredMetrics = metrics.filter(metric => {
    const metricDate = new Date(metric.timestamp);
    return metricDate >= cutoffDate;
  });
  
  // Calculate stats
  const totalPrompts = filteredMetrics.filter(m => m.event === 'prompt_shown').length;
  const totalInstalls = filteredMetrics.filter(m => m.event === 'install_completed').length;
  const totalDismissed = filteredMetrics.filter(m => m.event === 'prompt_dismissed').length;
  const totalAccepted = filteredMetrics.filter(m => m.event === 'prompt_accepted').length;
  
  const installRate = totalPrompts > 0 ? totalInstalls / totalPrompts : 0;
  const dismissRate = totalPrompts > 0 ? totalDismissed / totalPrompts : 0;
  const acceptRate = totalPrompts > 0 ? totalAccepted / totalPrompts : 0;
  
  return {
    period: periodDays,
    totalPrompts,
    totalInstalls,
    totalDismissed,
    totalAccepted,
    installRate,
    dismissRate,
    acceptRate,
    metrics: filteredMetrics,
  };
}

/**
 * Export metrics for analysis
 */
export function exportPwaMetrics() {
  const metrics = getStoredMetrics();
  const stats = getPwaInstallStats(30);
  
  return {
    exportDate: new Date().toISOString(),
    totalMetrics: metrics.length,
    stats,
    metrics,
  };
}

/**
 * Clear stored metrics
 */
export function clearPwaMetrics() {
  try {
    localStorage.removeItem(METRICS_STORAGE_KEY);
    console.log('[PWA Tracking] Metrics cleared');
  } catch (error) {
    console.error('[PWA Tracking] Failed to clear metrics:', error);
  }
}

/**
 * Initialize PWA install tracking
 */
export function initPwaInstallTracking() {
  console.log('[PWA Tracking] Initializing...');
  
  // Check if already in standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    trackStandaloneLaunch();
  }
  
  // Track beforeinstallprompt event
  let deferredPrompt = null;
  
  window.addEventListener('beforeinstallprompt', (event) => {
    // Prevent the default prompt
    event.preventDefault();
    
    // Store the event for later use
    deferredPrompt = event;
    
    // Track prompt shown
    trackPromptShown(event);
    
    // Show custom install UI (if implemented)
    // This is where you would show your custom install button
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'block';
      
      installButton.addEventListener('click', async () => {
        if (!deferredPrompt) {
          return;
        }
        
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user's response
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          trackPromptAccepted();
        } else {
          trackPromptDismissed();
        }
        
        // Clear the deferred prompt
        deferredPrompt = null;
        installButton.style.display = 'none';
      });
    }
  });
  
  // Track appinstalled event
  window.addEventListener('appinstalled', (event) => {
    trackInstallCompleted();
    
    // Hide install button if visible
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'none';
    }
  });
  
  // Track display mode changes
  window.matchMedia('(display-mode: standalone)').addEventListener('change', (event) => {
    if (event.matches) {
      trackStandaloneLaunch();
    }
  });
  
  console.log('[PWA Tracking] Initialized successfully');
  console.log('[PWA Tracking] Platform:', detectPlatform());
  console.log('[PWA Tracking] Browser:', detectBrowser());
  console.log('[PWA Tracking] Standalone:', window.matchMedia('(display-mode: standalone)').matches);
}

// Export tracking functions for manual use
export {
  trackPromptShown,
  trackPromptAccepted,
  trackPromptDismissed,
  trackInstallCompleted,
  trackStandaloneLaunch,
  detectPlatform,
  detectBrowser,
};
