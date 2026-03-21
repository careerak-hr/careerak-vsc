import { useState, useEffect } from 'react';
import bootstrapManager from '../core/BootstrapManager';

/**
 * Hook لإدارة دورة حياة التطبيق
 * Application Lifecycle Hook
 * 
 * المسؤوليات:
 * - تهيئة التطبيق
 * - إدارة حالة التحميل
 * - معالجة الأخطاء
 * - تنظيف الموارد
 */
export const useAppBootstrap = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const initializeApp = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('🚀 useAppBootstrap: Starting application initialization...');
        
        // تهيئة التطبيق
        await bootstrapManager.init();

        if (isMounted) {
          setIsReady(true);
          setIsLoading(false);
          console.log('✅ useAppBootstrap: Application ready');
        }

      } catch (err) {
        console.error('❌ useAppBootstrap: Initialization failed:', err);
        
        if (isMounted) {
          setError(err);
          setIsLoading(false);
          setIsReady(false);
        }
      }
    };

    initializeApp();

    // تنظيف عند إلغاء تحميل المكون
    return () => {
      isMounted = false;
    };
  }, [retryCount]); // إعادة التشغيل عند تغيير retryCount

  // تنظيف الموارد عند إغلاق التطبيق
  useEffect(() => {
    const handleUnload = () => {
      bootstrapManager.destroy();
    };

    window.addEventListener('beforeunload', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      // تنظيف الموارد عند إلغاء تحميل المكون
      if (isReady) {
        bootstrapManager.destroy();
      }
    };
  }, [isReady]);

  /**
   * إعادة محاولة التهيئة
   */
  const retry = () => {
    setRetryCount(prev => prev + 1);
  };

  /**
   * إعادة تشغيل التطبيق
   */
  const restart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await bootstrapManager.restart();
      
      setIsReady(true);
      setIsLoading(false);
    } catch (err) {
      setError(err);
      setIsLoading(false);
      setIsReady(false);
    }
  };

  /**
   * الحصول على خدمة من Bootstrap Manager
   */
  const getService = (serviceName) => {
    return bootstrapManager.getService(serviceName);
  };

  /**
   * الحصول على حالة النظام
   */
  const getSystemStatus = () => {
    return bootstrapManager.getSystemStatus();
  };

  return {
    // حالة التطبيق
    isLoading,
    isReady,
    error,
    retryCount,

    // إجراءات
    retry,
    restart,
    getService,
    getSystemStatus,

    // معلومات إضافية
    bootstrapManager: import.meta.env.DEV ? bootstrapManager : undefined
  };
};