
import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./i18n/i18n"; // Import i18n configuration
import "./index.css";
import "./styles/fontEnforcement.css"; // Import font enforcement styles
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AnimationProvider } from "./context/AnimationContext";

// OPTIMIZATION: Defer performance measurement to after initial render (TTI optimization)
// This reduces the critical path and improves Time to Interactive
setTimeout(() => {
  import("./utils/performanceMeasurement").then(({ initPerformanceMeasurement }) => {
    initPerformanceMeasurement();
  });
}, 0);

// OPTIMIZATION: Defer service worker registration to after initial render (TTI optimization)
// Register service worker for PWA functionality (FR-PWA-1)
// This is deferred to improve Time to Interactive by reducing critical path work
// FR-PWA-6: Update detection and notification is handled by ServiceWorkerManager component
if ('serviceWorker' in navigator) {
  // Wait for page load and then defer registration
  window.addEventListener('load', () => {
    // Use requestIdleCallback if available, otherwise setTimeout
    const registerSW = () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration.scope);
          // Note: Update detection and notification is handled by ServiceWorkerManager component
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    };

    // Use requestIdleCallback for better performance, fallback to setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(registerSW, { timeout: 2000 });
    } else {
      setTimeout(registerSW, 1000);
    }
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <AnimationProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </AnimationProvider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);

// Remove initial loader once React has rendered (improves perceived FCP)
// This ensures the loader is removed as soon as the first content is painted
if (typeof window !== 'undefined') {
  // Use requestAnimationFrame to ensure DOM is ready
  requestAnimationFrame(() => {
    document.body.classList.add('app-ready');
  });
}
