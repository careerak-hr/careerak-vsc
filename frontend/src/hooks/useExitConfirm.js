import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';

/**
 * Hook لإدارة تأكيد الخروج من التطبيق
 * يتعامل مع زر الخلف في الهاتف وأزرار الخروج في الواجهة
 */
const useExitConfirm = () => {
  const [showExitModal, setShowExitModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // الصفحات التي يجب فيها تأكيد الخروج عند الضغط على زر الخلف
  const exitPages = [
    '/login',
    '/entry',
    '/admin-dashboard',
    '/profile',
    '/interface-individuals',
    '/interface-companies',
    '/interface-illiterate',
    '/interface-visual',
    '/interface-ultimate',
    '/interface-shops',
    '/interface-workshops'
  ];

  // التحقق من أننا في صفحة خروج
  const isExitPage = useCallback(() => {
    return exitPages.some(page => location.pathname === page || location.pathname.startsWith(page));
  }, [location.pathname]);

  // معالجة زر الخلف في الهاتف
  useEffect(() => {
    let backButtonListener;

    const setupBackButton = async () => {
      try {
        backButtonListener = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
          console.log('🔙 Back button pressed, canGoBack:', canGoBack, 'current path:', location.pathname);

          // إذا كنا في صفحة خروج، نعرض رسالة التأكيد
          if (isExitPage()) {
            console.log('📍 On exit page, showing confirmation modal');
            setShowExitModal(true);
          } else if (canGoBack) {
            // إذا كان يمكن الرجوع، نرجع للصفحة السابقة
            console.log('⬅️ Going back to previous page');
            navigate(-1);
          } else {
            // إذا لم يكن هناك صفحة سابقة، نعرض رسالة التأكيد
            console.log('🚪 No previous page, showing exit confirmation');
            setShowExitModal(true);
          }
        });

        console.log('✅ Back button listener registered');
      } catch (error) {
        console.log('⚠️ Back button listener not available (web environment)');
      }
    };

    setupBackButton();

    return () => {
      if (backButtonListener && typeof backButtonListener.remove === 'function') {
        backButtonListener.remove();
        console.log('🗑️ Back button listener removed');
      }
    };
  }, [location.pathname, navigate, isExitPage]);

  // دالة لإظهار رسالة التأكيد يدوياً (للأزرار في الواجهة)
  const requestExit = useCallback(() => {
    console.log('🚪 Exit requested manually');
    setShowExitModal(true);
  }, []);

  // دالة تأكيد الخروج
  const confirmExit = useCallback(async () => {
    console.log('✅ Exit confirmed, closing app');
    setShowExitModal(false);
    
    try {
      // محاولة إغلاق التطبيق (يعمل فقط على الهاتف)
      await CapacitorApp.exitApp();
    } catch (error) {
      console.log('⚠️ Cannot exit app (web environment)');
      // في بيئة الويب، يمكن إغلاق النافذة إذا كانت مفتوحة بواسطة JavaScript
      if (window.opener) {
        window.close();
      } else {
        // أو الانتقال لصفحة الخروج
        navigate('/entry', { replace: true });
      }
    }
  }, [navigate]);

  // دالة إلغاء الخروج
  const cancelExit = useCallback(() => {
    console.log('❌ Exit cancelled');
    setShowExitModal(false);
  }, []);

  return {
    showExitModal,
    requestExit,
    confirmExit,
    cancelExit,
    isExitPage: isExitPage()
  };
};

export default useExitConfirm;
