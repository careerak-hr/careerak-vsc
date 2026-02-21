import React from "react";
import { useAppBootstrap } from "./hooks/useAppBootstrap";
import ApplicationShell from "./components/ApplicationShell";
import { 
  InitialLoadingScreen, 
  InitializationErrorScreen 
} from "./components/LoadingStates";
import ServiceWorkerManager from "./components/ServiceWorkerManager";
import OfflineQueueStatus from "./components/OfflineQueueStatus";
import { StructuredData } from "./components/SEO";

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

  // Organization schema data for Careerak
  const organizationData = {
    name: 'Careerak',
    url: 'https://careerak.com',
    logo: 'https://careerak.com/logo.jpg',
    description: 'Regional platform specialized in Human Resources, Employment, Training Courses, and Career Development across Arab countries.',
    contactPoint: {
      telephone: '+966-XX-XXX-XXXX',
      contactType: 'Customer Service',
      email: 'careerak.hr@gmail.com',
      availableLanguage: ['Arabic', 'English', 'French']
    },
    sameAs: [
      'https://www.facebook.com/careerak',
      'https://www.twitter.com/careerak',
      'https://www.linkedin.com/company/careerak'
    ]
  };

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
  return (
    <>
      <StructuredData type="Organization" data={organizationData} />
      <ApplicationShell />
      <ServiceWorkerManager />
      <OfflineQueueStatus />
    </>
  );
}
