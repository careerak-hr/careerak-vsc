
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
import { OfflineProvider } from "./context/OfflineContext";

// OPTIMIZATION: Defer performance measurement to after initial render (TTI optimization)
// This reduces the critical path and improves Time to Interactive
setTimeout(() => {
  import("./utils/performanceMeasurement").then(({ initPerformanceMeasurement }) => {
    initPerformanceMeasurement();
  });
}, 0);

// Register service worker for PWA functionality (FR-PWA-1)
// Only in production - dev mode causes issues with hot reload and CDN imports
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const registerSW = () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    };

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
            <OfflineProvider>
              <App />
            </OfflineProvider>
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
