import React, { useEffect } from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { AppSettingsProvider } from "../context/AppSettingsContext";
import FontProvider from "./FontProvider";
import GlobalFontEnforcer from "./GlobalFontEnforcer";
import AppRoutes from "./AppRoutes";
import AppAudioPlayer from "./AppAudioPlayer";
import ErrorBoundary from "./ErrorBoundary";

/**
 * Application Shell - الهيكل الأساسي للتطبيق
 * Application Shell Pattern
 * 
 * المسؤوليات:
 * - توفير البنية الأساسية
 * - إدارة مقدمي السياق
 * - التوجيه الأساسي
 * - المكونات العامة
 */
const ApplicationShell = () => {
  return (
    <ErrorBoundary>
      <AppSettingsProvider>
        <AuthProvider>
          <FontProvider>
            <GlobalFontEnforcer />
            <Router>
              <AppAudioPlayer />
              <AppRoutes />
            </Router>
          </FontProvider>
        </AuthProvider>
      </AppSettingsProvider>
    </ErrorBoundary>
  );
};

export default ApplicationShell;