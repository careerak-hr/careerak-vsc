import React, { useEffect } from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { AppSettingsProvider } from "../context/AppSettingsContext";
import FontProvider from "./FontProvider";
import GlobalFontEnforcer from "./GlobalFontEnforcer";
import AppRoutes from "./AppRoutes";
import AppAudioPlayer from "./AppAudioPlayer";
import ErrorBoundary from "./ErrorBoundary";

// Input Fields Fix
import { initializeDirectFix } from '../utils/inputFieldsDirectFix';

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
  useEffect(() => {
    // تطبيق إصلاح حقول الإدخال على مستوى التطبيق
    const fixCleanup = initializeDirectFix();
    
    return () => {
      if (fixCleanup && fixCleanup.cleanup) {
        fixCleanup.cleanup();
      }
    };
  }, []);

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