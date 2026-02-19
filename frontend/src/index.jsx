
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n/i18n"; // Import i18n configuration
import "./index.css";
import "./styles/fontEnforcement.css"; // Import font enforcement styles
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { initPerformanceMeasurement } from "./utils/performanceMeasurement";

// Initialize performance measurement (FCP, TTI, and other Core Web Vitals)
initPerformanceMeasurement();

// Register service worker for PWA functionality (FR-PWA-1)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration.scope);
        
        // FR-PWA-6: Update detection and notification
        // Listen for updates to the service worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is installed and ready
              // Show update notification to user
              showUpdateNotification(newWorker);
            }
          });
        });
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

/**
 * Show update notification to user (FR-PWA-6)
 * Offers to reload for the new version
 */
function showUpdateNotification(newWorker) {
  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'sw-update-notification';
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #304B60;
    color: #E3DAD1;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 16px;
    font-family: inherit;
    max-width: 90%;
    animation: slideUp 0.3s ease-out;
  `;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from {
        transform: translateX(-50%) translateY(100px);
        opacity: 0;
      }
      to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Message text
  const message = document.createElement('span');
  message.textContent = 'تحديث جديد متاح! قم بإعادة التحميل للحصول على أحدث إصدار.';
  message.style.cssText = 'flex: 1; font-size: 14px;';
  
  // Reload button
  const reloadButton = document.createElement('button');
  reloadButton.textContent = 'إعادة التحميل';
  reloadButton.style.cssText = `
    background: #D48161;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    transition: background 0.2s;
  `;
  reloadButton.onmouseover = () => {
    reloadButton.style.background = '#c06d4f';
  };
  reloadButton.onmouseout = () => {
    reloadButton.style.background = '#D48161';
  };
  reloadButton.onclick = () => {
    // Tell the new service worker to skip waiting
    newWorker.postMessage({ type: 'SKIP_WAITING' });
    // Reload the page
    window.location.reload();
  };
  
  // Dismiss button
  const dismissButton = document.createElement('button');
  dismissButton.textContent = '×';
  dismissButton.style.cssText = `
    background: transparent;
    color: #E3DAD1;
    border: none;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 24px;
    line-height: 1;
    transition: opacity 0.2s;
  `;
  dismissButton.onmouseover = () => {
    dismissButton.style.opacity = '0.7';
  };
  dismissButton.onmouseout = () => {
    dismissButton.style.opacity = '1';
  };
  dismissButton.onclick = () => {
    notification.remove();
  };
  
  // Assemble notification
  notification.appendChild(message);
  notification.appendChild(reloadButton);
  notification.appendChild(dismissButton);
  
  // Add to page
  document.body.appendChild(notification);
  
  // Auto-dismiss after 30 seconds if user doesn't interact
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slideUp 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }
  }, 30000);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
