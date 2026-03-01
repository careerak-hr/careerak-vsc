/**
 * 🆕 New For You Component - Usage Examples
 * أمثلة استخدام مكون "جديد لك"
 */

import React from 'react';
import NewForYou from '../components/NewForYou';
import { useApp } from '../context/AppContext';

/**
 * Example 1: Basic Usage
 * الاستخدام الأساسي
 */
export function BasicExample() {
  return (
    <div>
      <h1>الصفحة الرئيسية</h1>
      <NewForYou limit={5} />
    </div>
  );
}

/**
 * Example 2: With User Check
 * مع التحقق من المستخدم
 */
export function WithUserCheckExample() {
  const { user } = useApp();

  return (
    <div>
      <h1>الصفحة الرئيسية</h1>
      
      {user ? (
        <NewForYou limit={5} />
      ) : (
        <p>يرجى تسجيل الدخول لرؤية التوصيات</p>
      )}
    </div>
  );
}

/**
 * Example 3: Custom Limit
 * عدد مخصص من التوصيات
 */
export function CustomLimitExample() {
  return (
    <div>
      <h1>الصفحة الرئيسية</h1>
      
      {/* عرض 10 توصيات بدلاً من 5 */}
      <NewForYou limit={10} />
    </div>
  );
}

/**
 * Example 4: In Dashboard Layout
 * في تخطيط لوحة التحكم
 */
export function DashboardExample() {
  const { user } = useApp();

  return (
    <div className="dashboard">
      <aside className="sidebar">
        {/* Sidebar content */}
      </aside>
      
      <main className="main-content">
        <h1>مرحباً، {user?.name}</h1>
        
        {/* قسم "جديد لك" */}
        <NewForYou limit={5} />
        
        {/* باقي المحتوى */}
        <section>
          <h2>الوظائف المحفوظة</h2>
          {/* ... */}
        </section>
      </main>
    </div>
  );
}

/**
 * Example 5: With Loading State
 * مع حالة التحميل
 */
export function WithLoadingExample() {
  const { user, loading } = useApp();

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div>
      <h1>الصفحة الرئيسية</h1>
      {user && <NewForYou limit={5} />}
    </div>
  );
}

/**
 * Example 6: Multiple Sections
 * أقسام متعددة
 */
export function MultipleSectionsExample() {
  const { user } = useApp();

  return (
    <div>
      <h1>الصفحة الرئيسية</h1>
      
      {/* قسم "جديد لك" */}
      {user && <NewForYou limit={5} />}
      
      {/* قسم الوظائف الشائعة */}
      <section>
        <h2>الوظائف الشائعة</h2>
        {/* ... */}
      </section>
      
      {/* قسم الدورات المقترحة */}
      <section>
        <h2>الدورات المقترحة</h2>
        {/* ... */}
      </section>
    </div>
  );
}

/**
 * Example 7: With Error Boundary
 * مع معالجة الأخطاء
 */
export function WithErrorBoundaryExample() {
  const { user } = useApp();

  return (
    <div>
      <h1>الصفحة الرئيسية</h1>
      
      <ErrorBoundary fallback={<div>حدث خطأ في تحميل التوصيات</div>}>
        {user && <NewForYou limit={5} />}
      </ErrorBoundary>
    </div>
  );
}

/**
 * Example 8: Responsive Layout
 * تخطيط متجاوب
 */
export function ResponsiveLayoutExample() {
  const { user } = useApp();

  return (
    <div className="container">
      <h1>الصفحة الرئيسية</h1>
      
      <div className="grid">
        {/* على Desktop: 3 أعمدة */}
        {/* على Tablet: 2 أعمدة */}
        {/* على Mobile: 1 عمود */}
        {user && <NewForYou limit={6} />}
      </div>
    </div>
  );
}

/**
 * Example 9: With Analytics Tracking
 * مع تتبع التحليلات
 */
export function WithAnalyticsExample() {
  const { user } = useApp();

  const handleRecommendationView = () => {
    // Track view event
    if (window.gtag) {
      window.gtag('event', 'view_recommendations', {
        event_category: 'Recommendations',
        event_label: 'New For You Section'
      });
    }
  };

  React.useEffect(() => {
    if (user) {
      handleRecommendationView();
    }
  }, [user]);

  return (
    <div>
      <h1>الصفحة الرئيسية</h1>
      {user && <NewForYou limit={5} />}
    </div>
  );
}

/**
 * Example 10: Conditional Rendering
 * العرض الشرطي
 */
export function ConditionalRenderingExample() {
  const { user, language } = useApp();
  const [showRecommendations, setShowRecommendations] = React.useState(true);

  return (
    <div>
      <h1>الصفحة الرئيسية</h1>
      
      <button onClick={() => setShowRecommendations(!showRecommendations)}>
        {showRecommendations ? 'إخفاء التوصيات' : 'عرض التوصيات'}
      </button>
      
      {showRecommendations && user && <NewForYou limit={5} />}
    </div>
  );
}

/**
 * Example 11: Integration with Router
 * التكامل مع Router
 */
export function WithRouterExample() {
  const { user } = useApp();
  const navigate = useNavigate();

  const handleRecommendationClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  return (
    <div>
      <h1>الصفحة الرئيسية</h1>
      {user && <NewForYou limit={5} />}
    </div>
  );
}

/**
 * Example 12: Full Page Implementation
 * تنفيذ الصفحة الكاملة
 */
export function FullPageExample() {
  const { language, user, startBgMusic } = useApp();

  React.useEffect(() => {
    startBgMusic();
  }, [startBgMusic]);

  return (
    <main id="main-content" tabIndex="-1">
      <div className="page-header">
        <h1>مرحباً، {user?.name || 'ضيف'}</h1>
        <p>اكتشف الفرص المناسبة لك</p>
      </div>

      {/* قسم "جديد لك" */}
      {user && <NewForYou limit={5} />}

      {/* أقسام إضافية */}
      <section aria-labelledby="popular-jobs">
        <h2 id="popular-jobs">الوظائف الشائعة</h2>
        {/* ... */}
      </section>

      <section aria-labelledby="featured-courses">
        <h2 id="featured-courses">الدورات المميزة</h2>
        {/* ... */}
      </section>
    </main>
  );
}

// Export all examples
export default {
  BasicExample,
  WithUserCheckExample,
  CustomLimitExample,
  DashboardExample,
  WithLoadingExample,
  MultipleSectionsExample,
  WithErrorBoundaryExample,
  ResponsiveLayoutExample,
  WithAnalyticsExample,
  ConditionalRenderingExample,
  WithRouterExample,
  FullPageExample
};
