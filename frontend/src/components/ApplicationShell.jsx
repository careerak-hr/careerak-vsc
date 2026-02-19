
import React from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import { AppProvider } from "../context/AppContext";
import { ThemeProvider } from "../context/ThemeContext";
import { OfflineProvider } from "../context/OfflineContext";
import GlobalFontEnforcer from "./GlobalFontEnforcer";
import AppRoutes from "./AppRoutes";
import AppAudioPlayer from "./AppAudioPlayer";
import ErrorBoundary from "./ErrorBoundary";
import BackButtonHandler from "./BackButtonHandler";
import OfflineIndicator from "./OfflineIndicator";

const ApplicationShell = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <OfflineProvider>
          <AppProvider>
            <GlobalFontEnforcer />
            <OfflineIndicator />
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
          </AppProvider>
        </OfflineProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default ApplicationShell;
