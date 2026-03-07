import React from 'react';
import BookmarkedJobsPage from '../pages/BookmarkedJobsPage';
import '../pages/BookmarkedJobsPage.css';

/**
 * مثال استخدام صفحة الوظائف المحفوظة
 * 
 * الميزات:
 * - عرض جميع الوظائف المحفوظة
 * - البحث في الوظائف المحفوظة
 * - فلترة حسب الموقع، نوع العمل، والراتب
 * - التبديل بين عرض Grid و List
 * - حذف وظيفة من المفضلة
 * - حذف جميع الوظائف المحفوظة
 * - عداد الوظائف المحفوظة
 * - حالة فارغة عند عدم وجود وظائف
 * - حالة "لا توجد نتائج" عند الفلترة
 * 
 * المتطلبات:
 * - Requirements 2.2: صفحة منفصلة للوظائف المحفوظة
 * - Requirements 2.5: عداد الوظائف المحفوظة
 * - Requirements 8.1-8.6: فلترة وبحث محسّن
 */
const BookmarkedJobsPageExample = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      <h1 style={{ 
        padding: '2rem', 
        textAlign: 'center',
        backgroundColor: '#304B60',
        color: 'white',
        margin: 0
      }}>
        مثال: صفحة الوظائف المحفوظة
      </h1>
      
      <div style={{ padding: '2rem', backgroundColor: '#f5f5f5' }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#304B60', marginBottom: '1rem' }}>
            📋 الميزات المتاحة
          </h2>
          
          <ul style={{ lineHeight: '2', color: '#666' }}>
            <li>✅ عرض جميع الوظائف المحفوظة في مكان واحد</li>
            <li>✅ البحث في الوظائف المحفوظة (العنوان، الشركة، الوصف، المهارات)</li>
            <li>✅ فلترة حسب الموقع، نوع العمل، والراتب</li>
            <li>✅ التبديل بين عرض Grid (بطاقات) و List (قائمة)</li>
            <li>✅ حذف وظيفة واحدة من المفضلة</li>
            <li>✅ حذف جميع الوظائف المحفوظة دفعة واحدة</li>
            <li>✅ عداد الوظائف المحفوظة في الرأس</li>
            <li>✅ عداد النتائج بعد الفلترة</li>
            <li>✅ حالة فارغة جميلة عند عدم وجود وظائف محفوظة</li>
            <li>✅ حالة "لا توجد نتائج" عند الفلترة</li>
            <li>✅ تصميم متجاوب (Desktop, Tablet, Mobile)</li>
            <li>✅ دعم Dark Mode</li>
            <li>✅ دعم RTL/LTR</li>
            <li>✅ Animations سلسة</li>
            <li>✅ SEO محسّن</li>
          </ul>

          <h2 style={{ color: '#304B60', marginTop: '2rem', marginBottom: '1rem' }}>
            🎯 كيفية الاستخدام
          </h2>
          
          <div style={{ 
            backgroundColor: '#f9f9f9', 
            padding: '1.5rem', 
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            lineHeight: '1.8'
          }}>
            <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
              <strong>1. الوصول للصفحة:</strong>
            </p>
            <code style={{ display: 'block', marginBottom: '1.5rem' }}>
              {`<Link to="/bookmarked-jobs">الوظائف المحفوظة</Link>`}
            </code>

            <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
              <strong>2. البحث:</strong>
            </p>
            <p style={{ marginBottom: '1.5rem', color: '#888' }}>
              اكتب في شريط البحث للبحث في العنوان، الشركة، الوصف، أو المهارات
            </p>

            <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
              <strong>3. الفلترة:</strong>
            </p>
            <p style={{ marginBottom: '1.5rem', color: '#888' }}>
              اضغط على زر "فلاتر" واختر الموقع، نوع العمل، أو نطاق الراتب
            </p>

            <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
              <strong>4. تغيير العرض:</strong>
            </p>
            <p style={{ marginBottom: '1.5rem', color: '#888' }}>
              استخدم زر التبديل للتنقل بين عرض Grid و List
            </p>

            <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
              <strong>5. حذف وظيفة:</strong>
            </p>
            <p style={{ marginBottom: '1.5rem', color: '#888' }}>
              اضغط على أيقونة القلب في البطاقة لإزالة الوظيفة من المفضلة
            </p>

            <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
              <strong>6. حذف الكل:</strong>
            </p>
            <p style={{ marginBottom: 0, color: '#888' }}>
              اضغط على زر "حذف الكل" في الرأس لحذف جميع الوظائف المحفوظة
            </p>
          </div>

          <h2 style={{ color: '#304B60', marginTop: '2rem', marginBottom: '1rem' }}>
            🔗 API Endpoints المستخدمة
          </h2>
          
          <div style={{ 
            backgroundColor: '#f9f9f9', 
            padding: '1.5rem', 
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            lineHeight: '1.8'
          }}>
            <p><strong>GET</strong> /api/jobs/bookmarked</p>
            <p style={{ color: '#888', marginLeft: '2rem' }}>
              جلب جميع الوظائف المحفوظة للمستخدم
            </p>

            <p style={{ marginTop: '1rem' }}><strong>DELETE</strong> /api/jobs/:id/bookmark</p>
            <p style={{ color: '#888', marginLeft: '2rem' }}>
              حذف وظيفة واحدة من المفضلة
            </p>

            <p style={{ marginTop: '1rem' }}><strong>DELETE</strong> /api/jobs/bookmarked/clear</p>
            <p style={{ color: '#888', marginLeft: '2rem' }}>
              حذف جميع الوظائف المحفوظة
            </p>
          </div>

          <h2 style={{ color: '#304B60', marginTop: '2rem', marginBottom: '1rem' }}>
            📱 التصميم المتجاوب
          </h2>
          
          <ul style={{ lineHeight: '2', color: '#666' }}>
            <li><strong>Desktop (≥1024px):</strong> Grid 3 أعمدة، جميع الميزات</li>
            <li><strong>Tablet (640-1023px):</strong> Grid 2 أعمدة، فلاتر قابلة للطي</li>
            <li><strong>Mobile (&lt;640px):</strong> Grid عمود واحد، تصميم مبسط</li>
          </ul>

          <h2 style={{ color: '#304B60', marginTop: '2rem', marginBottom: '1rem' }}>
            ⚡ الأداء
          </h2>
          
          <ul style={{ lineHeight: '2', color: '#666' }}>
            <li>✅ Lazy loading للصفحة</li>
            <li>✅ Skeleton loading أثناء التحميل</li>
            <li>✅ Animations محسّنة (GPU-accelerated)</li>
            <li>✅ دعم prefers-reduced-motion</li>
            <li>✅ تحميل سريع (&lt;2 ثواني)</li>
          </ul>
        </div>
      </div>

      {/* الصفحة الفعلية */}
      <BookmarkedJobsPage />
    </div>
  );
};

export default BookmarkedJobsPageExample;
