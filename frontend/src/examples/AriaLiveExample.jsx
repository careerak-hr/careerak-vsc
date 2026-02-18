import React, { useState } from 'react';
import {
  AriaLiveRegion,
  useAriaLive,
  FormErrorAnnouncer,
  LoadingAnnouncer,
  NotificationAnnouncer
} from '../components/Accessibility';

/**
 * AriaLiveExample Component
 * 
 * Demonstrates the usage of ARIA live regions for accessibility.
 * This example shows how to announce dynamic content changes to screen readers.
 */
const AriaLiveExample = () => {
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const { message, politeness, announce, announceSuccess, announceError } = useAriaLive();

  // Example 1: Basic AriaLiveRegion
  const handleBasicAnnouncement = () => {
    announce('This is a polite announcement', 'polite');
  };

  const handleUrgentAnnouncement = () => {
    announce('This is an urgent announcement!', 'assertive');
  };

  // Example 2: Form Validation
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Simulate form validation
    const errors = {
      email: 'البريد الإلكتروني غير صحيح',
      password: 'كلمة المرور قصيرة جداً'
    };
    
    setFormErrors(errors);
    announceError('يوجد أخطاء في النموذج');
    
    // Clear errors after 5 seconds
    setTimeout(() => {
      setFormErrors({});
      announceSuccess('تم تصحيح الأخطاء');
    }, 5000);
  };

  // Example 3: Loading States
  const handleLoadData = () => {
    setIsLoading(true);
    
    // Simulate data loading
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  };

  // Example 4: Notifications
  const showSuccessNotification = () => {
    setNotification({
      type: 'success',
      title: 'نجح',
      message: 'تم حفظ البيانات بنجاح'
    });
    
    setTimeout(() => setNotification(null), 5000);
  };

  const showErrorNotification = () => {
    setNotification({
      type: 'error',
      title: 'خطأ',
      message: 'فشل في حفظ البيانات'
    });
    
    setTimeout(() => setNotification(null), 5000);
  };

  const showWarningNotification = () => {
    setNotification({
      type: 'warning',
      message: 'يرجى التحقق من البيانات المدخلة'
    });
    
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto" dir="rtl">
      <h1 className="text-3xl font-bold mb-8 text-[#304B60]">
        أمثلة على ARIA Live Regions
      </h1>

      {/* Global Announcers */}
      <AriaLiveRegion message={message} politeness={politeness} />
      <FormErrorAnnouncer errors={formErrors} language="ar" />
      <LoadingAnnouncer 
        isLoading={isLoading} 
        loadingMessage="جاري تحميل البيانات..."
        completeMessage="اكتمل تحميل البيانات"
        language="ar"
      />
      <NotificationAnnouncer notification={notification} language="ar" />

      {/* Example 1: Basic Announcements */}
      <section className="mb-8 p-6 bg-[#E3DAD1] rounded-2xl">
        <h2 className="text-2xl font-bold mb-4 text-[#304B60]">
          1. الإعلانات الأساسية
        </h2>
        <p className="mb-4 text-[#304B60]">
          استخدم useAriaLive hook للإعلان عن الرسائل لقارئات الشاشة
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleBasicAnnouncement}
            className="px-6 py-3 bg-[#304B60] text-[#E3DAD1] rounded-xl hover:scale-105 transition-all"
          >
            إعلان عادي (polite)
          </button>
          <button
            onClick={handleUrgentAnnouncement}
            className="px-6 py-3 bg-[#D48161] text-white rounded-xl hover:scale-105 transition-all"
          >
            إعلان عاجل (assertive)
          </button>
        </div>
        {message && (
          <div className="mt-4 p-4 bg-white rounded-xl">
            <strong>الرسالة الحالية:</strong> {message} ({politeness})
          </div>
        )}
      </section>

      {/* Example 2: Form Validation */}
      <section className="mb-8 p-6 bg-[#E3DAD1] rounded-2xl">
        <h2 className="text-2xl font-bold mb-4 text-[#304B60]">
          2. التحقق من النماذج
        </h2>
        <p className="mb-4 text-[#304B60]">
          يتم الإعلان عن أخطاء النموذج تلقائياً لقارئات الشاشة
        </p>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-[#304B60]">البريد الإلكتروني</label>
            <input
              type="email"
              className="w-full p-3 rounded-xl border-2 border-[#D4816180]"
              aria-invalid={!!formErrors.email}
              aria-describedby={formErrors.email ? 'email-error' : undefined}
            />
            {formErrors.email && (
              <p id="email-error" className="text-red-600 mt-2" role="alert">
                {formErrors.email}
              </p>
            )}
          </div>
          <div>
            <label className="block mb-2 text-[#304B60]">كلمة المرور</label>
            <input
              type="password"
              className="w-full p-3 rounded-xl border-2 border-[#D4816180]"
              aria-invalid={!!formErrors.password}
              aria-describedby={formErrors.password ? 'password-error' : undefined}
            />
            {formErrors.password && (
              <p id="password-error" className="text-red-600 mt-2" role="alert">
                {formErrors.password}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-[#304B60] text-[#E3DAD1] rounded-xl hover:scale-105 transition-all"
          >
            إرسال النموذج
          </button>
        </form>
      </section>

      {/* Example 3: Loading States */}
      <section className="mb-8 p-6 bg-[#E3DAD1] rounded-2xl">
        <h2 className="text-2xl font-bold mb-4 text-[#304B60]">
          3. حالات التحميل
        </h2>
        <p className="mb-4 text-[#304B60]">
          يتم الإعلان عن حالات التحميل والاكتمال تلقائياً
        </p>
        <button
          onClick={handleLoadData}
          disabled={isLoading}
          className="px-6 py-3 bg-[#304B60] text-[#E3DAD1] rounded-xl hover:scale-105 transition-all disabled:opacity-50"
        >
          {isLoading ? 'جاري التحميل...' : 'تحميل البيانات'}
        </button>
        {isLoading && (
          <div className="mt-4 p-4 bg-white rounded-xl" role="status" aria-live="polite">
            <div className="animate-pulse">جاري تحميل البيانات...</div>
          </div>
        )}
      </section>

      {/* Example 4: Notifications */}
      <section className="mb-8 p-6 bg-[#E3DAD1] rounded-2xl">
        <h2 className="text-2xl font-bold mb-4 text-[#304B60]">
          4. الإشعارات
        </h2>
        <p className="mb-4 text-[#304B60]">
          يتم الإعلان عن الإشعارات بناءً على نوعها (نجاح، خطأ، تحذير)
        </p>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={showSuccessNotification}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:scale-105 transition-all"
          >
            إشعار نجاح
          </button>
          <button
            onClick={showErrorNotification}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:scale-105 transition-all"
          >
            إشعار خطأ
          </button>
          <button
            onClick={showWarningNotification}
            className="px-6 py-3 bg-yellow-600 text-white rounded-xl hover:scale-105 transition-all"
          >
            إشعار تحذير
          </button>
        </div>
        {notification && (
          <div 
            className={`mt-4 p-4 rounded-xl ${
              notification.type === 'success' ? 'bg-green-100' :
              notification.type === 'error' ? 'bg-red-100' :
              notification.type === 'warning' ? 'bg-yellow-100' :
              'bg-blue-100'
            }`}
            role="status"
          >
            {notification.title && <strong>{notification.title}: </strong>}
            {notification.message}
          </div>
        )}
      </section>

      {/* Screen Reader Instructions */}
      <section className="p-6 bg-[#304B60] text-[#E3DAD1] rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">
          تعليمات لمستخدمي قارئات الشاشة
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li>جميع الإعلانات يتم نطقها تلقائياً</li>
          <li>الإعلانات العادية (polite) لا تقاطع القراءة الحالية</li>
          <li>الإعلانات العاجلة (assertive) تقاطع القراءة فوراً</li>
          <li>أخطاء النماذج يتم الإعلان عنها فور حدوثها</li>
          <li>حالات التحميل يتم الإعلان عنها عند البدء والانتهاء</li>
        </ul>
      </section>
    </div>
  );
};

export default AriaLiveExample;
