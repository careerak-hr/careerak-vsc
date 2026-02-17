import { useState, useEffect, useCallback, useRef } from 'react';
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
  const isHandlingBack = useRef(false);

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

  // ✅ صفحات يجب الرجوع منها للصفحة السابقة (بدون تأكيد خروج)
  const backPages = [
    '/auth' // عند الضغط على زر العودة في AuthPage، يرجع لصفحة Login
  ];

  // التحقق من أننا في صفحة خروج
  const isExitPage = useCallback(() => {
    return exitPages.some(page => location.pathname === page || location.pathname.startsWith(page));
  }, [location.pathname, exitPages]);

  // التحقق من أننا في صفحة يجب الرجوع منها
  const isBackPage = useCallback(() => {
    return backPages.some(page => location.pathname === page || location.pathname.startsWith(page));
  }, [location.pathname, backPages]);

  // معالجة زر الخلف في الهاتف
  useEffect(() => {
    let backButtonListener;

    const setupBackButton = async () => {
      try {
        // ✅ استخدام handler مع منع السلوك الافتراضي بشكل كامل
        const handleBackButton = (event) => {
          // ✅ منع التنفيذ المتعدد
          if (isHandlingBack.current) {
            console.log('⏳ Already handling back button, ignoring...');
            return;
          }

          isHandlingBack.current = true;
          console.log('🔙 Back button pressed, canGoBack:', event.canGoBack, 'current path:', location.pathname);

          // ✅ إذا كنا في صفحة يجب الرجوع منها (مثل /auth)، نرجع للصفحة السابقة
          if (isBackPage()) {
            console.log('⬅️ On back page, navigating to previous page');
            navigate(-1);
            setTimeout(() => {
              isHandlingBack.current = false;
            }, 300);
          }
          // إذا كنا في صفحة خروج، نعرض رسالة التأكيد ونمنع السلوك الافتراضي
          else if (isExitPage()) {
            console.log('📍 On exit page, showing confirmation modal');
            // ✅ عرض الرسالة مباشرة بدون setTimeout
            setShowExitModal(true);
            // ✅ إعادة تعيين الحالة بعد فترة قصيرة
            setTimeout(() => {
              isHandlingBack.current = false;
            }, 300);
          } else if (event.canGoBack) {
            // إذا كان يمكن الرجوع، نرجع للصفحة السابقة
            console.log('⬅️ Going back to previous page');
            navigate(-1);
            setTimeout(() => {
              isHandlingBack.current = false;
            }, 300);
          } else {
            // إذا لم يكن هناك صفحة سابقة، نعرض رسالة التأكيد
            console.log('🚪 No previous page, showing exit confirmation');
            setShowExitModal(true);
            setTimeout(() => {
              isHandlingBack.current = false;
            }, 300);
          }
        };

        // ✅ تسجيل المستمع مع priority عالية لمنع السلوك الافتراضي
        backButtonListener = await CapacitorApp.addListener('backButton', handleBackButton);

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
      isHandlingBack.current = false;
    };
  }, [location.pathname, navigate, isExitPage, isBackPage]);

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
