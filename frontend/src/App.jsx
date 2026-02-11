import React from "react";
import { useAppBootstrap } from "./hooks/useAppBootstrap";
import ApplicationShell from "./components/ApplicationShell";
import { 
  InitialLoadingScreen, 
  InitializationErrorScreen 
} from "./components/LoadingStates";

/**
 * المكون الرئيسي للتطبيق - Application Entry Point
 * Application Shell Pattern Implementation
 * 
 * المسؤوليات:
 * - نقطة دخول التطبيق
 * - إدارة حالة التهيئة
 * - عرض حالات التحميل والأخطاء
 * - تفويض المنطق إلى طبقات متخصصة
 * 
 * المعمارية:
 * - Separation of Concerns
 * - Single Responsibility Principle
 * - Clean Architecture
 */
export default function App() {
  // استخدام Hook لإدارة دورة حياة التطبيق
  const {
    isLoading,
    isReady,
    error,
    retry,
    restart
  } = useAppBootstrap();

  // تخطي شاشة التحميل - عرض التطبيق مباشرة
  // حالة الخطأ
  if (error) {
    return (
      <InitializationErrorScreen 
        error={error}
        onRetry={retry}
        onRestart={restart}
      />
    );
  }

  // عرض التطبيق مباشرة (حتى أثناء التحميل)
  return <ApplicationShell />;
}
