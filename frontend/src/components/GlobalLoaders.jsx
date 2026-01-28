import React from 'react';

/**
 * مكون شاشة التحميل العامة
 * Global Loading Screen Component
 */
export const GlobalLoader = () => (
  <div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div>
  </div>
);

/**
 * مكون Suspense مع شاشة التحميل المخصصة
 * Custom Suspense Component with Loading Screen
 */
export const SuspenseWrapper = ({ children }) => (
  <React.Suspense fallback={<GlobalLoader />}>
    {children}
  </React.Suspense>
);

export default GlobalLoader;