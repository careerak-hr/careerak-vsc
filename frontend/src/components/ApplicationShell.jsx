
import React from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import { AppProvider } from "../context/AppContext";
import { ThemeProvider } from "../context/ThemeContext";
import { OfflineProvider } from "../context/OfflineContext";
import GlobalFontEnforcer from "./GlobalFontEnforcer";
import AppRoutes from "./AppRoutes";
import AppAudioPlayer from "./AppAudioPlayer";
import ErrorBoundary from "./ErrorBoundary";
import RouteErrorBoundary from "./ErrorBoundary/RouteErrorBoundary";
import BackButtonHandler from "./BackButtonHandler";
import OfflineIndicator from "./OfflineIndicator";
import SkipLink from "./Accessibility/SkipLink";
import { useApp } from "../context/AppContext";

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
                <BackButtonHandler />
                <AppAudioPlayer />
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
