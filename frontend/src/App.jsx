import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppSettingsProvider } from "./context/AppSettingsContext";
import { discoverBestServer } from "./services/api";
import AppAudioPlayer from "./components/AppAudioPlayer";
import FontProvider from "./components/FontProvider";
import GlobalFontEnforcer from "./components/GlobalFontEnforcer";
import AppRoutes from "./components/AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary";
import performanceMonitor from "./utils/monitoring";

// Import development utilities
import "./utils/resetSettings"; // إضافة أداة إعادة التعيين للاختبار
import "./utils/fontTester"; // إضافة أداة اختبار الخطوط للتطوير
import "./utils/audioTester"; // إضافة أداة اختبار النظام الصوتي للتطوير
import "./utils/appExitManager"; // إضافة مدير الخروج من التطبيق للتطوير
import "./utils/exitTester"; // إضافة أداة اختبار نظام الخروج للتطوير
import "./utils/cvAnalyzerTester"; // إضافة أداة اختبار تحليل السيرة الذاتية للتطوير
import "./utils/devTools"; // إضافة أدوات التطوير المتقدمة

/**
 * المكون الرئيسي للتطبيق
 * Main Application Component
 * 
 * يدير:
 * - مقدمي السياق (Context Providers)
 * - التوجيه الأساسي (Router)
 * - المكونات العامة (Global Components)
 * - اكتشاف الخادم (Server Discovery)
 * - معالجة الأخطاء (Error Handling)
 * - مراقبة الأداء (Performance Monitoring)
 * - أدوات التطوير (Development Tools)
 */
export default function App() {
  // اكتشاف أفضل خادم API عند بدء التطبيق
  useEffect(() => {
    discoverBestServer()
      .then(url => {
        console.log("Selected API baseURL:", url);
        
        // تسجيل بداية الجلسة
        performanceMonitor.logUserAction({
          type: 'session_start',
          url: window.location.href,
          timestamp: Date.now(),
          apiUrl: url
        });
      })
      .catch(err => {
        console.error("Server discovery failed:", err);
        performanceMonitor.logError({
          type: 'Server Discovery Error',
          message: err.message,
          timestamp: Date.now()
        });
      });

    // تسجيل معلومات الجلسة
    const sessionInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        colorDepth: window.screen.colorDepth
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    console.log("Session Info:", sessionInfo);
    
    // حفظ تقرير الأداء كل 5 دقائق
    const reportInterval = setInterval(() => {
      performanceMonitor.saveReportLocally();
    }, 5 * 60 * 1000);

    // تنظيف عند إغلاق التطبيق
    const handleBeforeUnload = () => {
      performanceMonitor.saveReportLocally();
      clearInterval(reportInterval);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(reportInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
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
}
