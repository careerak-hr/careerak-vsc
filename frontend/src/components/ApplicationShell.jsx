
import React, { Suspense } from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import { AppProvider } from "../context/AppContext";
import { ThemeProvider } from "../context/ThemeContext";
import { OfflineProvider } from "../context/OfflineContext";
import GlobalFontEnforcer from "./GlobalFontEnforcer";
import AppRoutes from "./AppRoutes";
import ErrorBoundary from "./ErrorBoundary";
import RouteErrorBoundary from "./ErrorBoundary/RouteErrorBoundary";
import BackButtonHandler from "./BackButtonHandler";
import OfflineIndicator from "./OfflineIndicator";
import SkipLink from "./Accessibility/SkipLink";
import RouteProgressBar from "./RouteProgressBar";
import { useApp } from "../context/AppContext";

// OPTIMIZATION: Lazy load AppAudioPlayer for better TTI
// Audio player is not critical for initial render
const AppAudioPlayer = React.lazy(() => import("./AppAudioPlayer"));

/**
 * SkipLinkWrapper - Wraps SkipLink with language context
 */
const SkipLinkWrapper = () => {
  const { language } = useApp();
  return <SkipLink targetId="main-content" language={language} />;
};

const ApplicationShell = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <OfflineProvider>
          <AppProvider>
            <GlobalFontEnforcer />
            <OfflineIndicator />
            <SkipLinkWrapper />
            <RouteErrorBoundary>
              <Router
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true
                }}
              >
                <RouteProgressBar />
                <BackButtonHandler />
                {/* OPTIMIZATION: Lazy load AppAudioPlayer with Suspense */}
                {/* Audio player is not critical for initial render and improves TTI */}
                <Suspense fallback={null}>
                  <AppAudioPlayer />
                </Suspense>
                <AppRoutes />
              </Router>
            </RouteErrorBoundary>
          </AppProvider>
        </OfflineProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default ApplicationShell;
