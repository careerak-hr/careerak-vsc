
import React from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { AppSettingsProvider } from "../context/AppSettingsContext";
import GlobalFontEnforcer from "./GlobalFontEnforcer";
import AppRoutes from "./AppRoutes";
import AppAudioPlayer from "./AppAudioPlayer";
import ErrorBoundary from "./ErrorBoundary";

/**
 * Application Shell - The main structure of the application.
 */
const ApplicationShell = () => {
  return (
    <ErrorBoundary>
      <AppSettingsProvider>
        <AuthProvider>
          <GlobalFontEnforcer />
          <Router>
            <AppAudioPlayer />
            <AppRoutes />
          </Router>
        </AuthProvider>
      </AppSettingsProvider>
    </ErrorBoundary>
  );
};

export default ApplicationShell;
