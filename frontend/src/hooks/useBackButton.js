/**
 * Hook لإدارة زر الرجوع في Capacitor
 * Back Button Management Hook for Capacitor
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';

/**
 * Hook لمعالجة زر الرجوع بشكل ذكي
 * @param {Object} options - خيارات التخصيص
 * @param {Function} options.onBack - دالة مخصصة للرجوع (اختياري)
 * @param {boolean} options.exitOnRoot - الخروج من التطبيق عند الصفحة الرئيسية (افتراضي: true)
 * @param {Array<string>} options.exitRoutes - مسارات يتم الخروج منها مباشرة
 */
export const useBackButton = (options = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    onBack = null,
    exitOnRoot = true,
    exitRoutes = ['/', '/language', '/entry', '/login']
  } = options;

  useEffect(() => {
    let backButtonListener;

    const setupBackButton = async () => {
      try {
        // التحقق من وجود Capacitor
        if (!window.Capacitor || !App) {
          console.log('🔙 Capacitor not available, back button handler skipped');
          return;
        }

        backButtonListener = await App.addListener('backButton', ({ canGoBack }) => {
          const currentPath = location.pathname;
          console.log(`🔙 Back button pressed on: ${currentPath}`);

          // إذا كان هناك دالة مخصصة، استخدمها
          if (onBack && typeof onBack === 'function') {
            onBack();
            return;
          }

          // التحقق من المسارات التي يجب الخروج منها
          if (exitRoutes.includes(currentPath)) {
            console.log('🚪 Exit route detected, exiting app...');
            App.exitApp();
            return;
          }

          // إذا كان يمكن الرجوع في التاريخ
          if (canGoBack) {
            console.log('⬅️ Going back in history...');
            navigate(-1);
          } else if (exitOnRoot) {
            // إذا لم يكن هناك تاريخ، اخرج من التطبيق
            console.log('🚪 No history, exiting app...');
            App.exitApp();
          } else {
            // الرجوع للصفحة الرئيسية
            console.log('🏠 Going to home...');
            navigate('/');
          }
        });

        console.log('✅ Back button listener registered');
      } catch (error) {
        console.error('❌ Failed to setup back button listener:', error);
      }
    };

    setupBackButton();

    // تنظيف المستمع عند إلغاء التحميل
    return () => {
      if (backButtonListener) {
        backButtonListener.then(listener => {
          listener.remove();
          console.log('🗑️ Back button listener removed');
        }).catch(err => {
          console.error('❌ Failed to remove back button listener:', err);
        });
      }
    };
  }, [navigate, location.pathname, onBack, exitOnRoot, exitRoutes]);
};

/**
 * Hook بسيط لزر الرجوع مع سلوك افتراضي
 */
export const useSimpleBackButton = () => {
  useBackButton({
    exitOnRoot: true,
    exitRoutes: ['/', '/language', '/entry', '/login']
  });
};

export default useBackButton;
