import React, { useState } from 'react';
import LinkedInPostPreview from '../components/LinkedIn/LinkedInPostPreview';

/**
 * مثال على استخدام مكون معاينة منشور LinkedIn
 * يوضح كيفية دمج المعاينة مع زر المشاركة
 */
const LinkedInPostPreviewExample = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [shareError, setShareError] = useState(null);

  // بيانات تجريبية
  const certificateId = '507f1f77bcf86cd799439011';
  const token = 'your_jwt_token_here';

  /**
   * فتح نافذة المعاينة
   */
  const handleOpenPreview = () => {
    setShowPreview(true);
    setShareSuccess(false);
    setShareError(null);
  };

  /**
   * إغلاق نافذة المعاينة
   */
  const handleClosePreview = () => {
    setShowPreview(false);
  };

  /**
   * مشاركة الشهادة على LinkedIn
   */
  const handleShare = async (certId) => {
    try {
      const response = await fetch('/api/linkedin/share-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ certificateId: certId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.messageAr || data.message || 'فشل في المشاركة');
      }

      setShareSuccess(true);
      setShareError(null);
      
      // إغلاق النافذة بعد 2 ثانية
      setTimeout(() => {
        setShowPreview(false);
      }, 2000);
    } catch (err) {
      console.error('Error sharing certificate:', err);
      setShareError(err.message);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>مثال: معاينة منشور LinkedIn</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>السيناريو</h2>
        <p>
          عند حصول المستخدم على شهادة، يمكنه معاينة كيف سيظهر المنشور على LinkedIn
          قبل نشره فعلياً. المعاينة تتضمن:
        </p>
        <ul>
          <li>نص المنشور الكامل</li>
          <li>صورة الشهادة (إن وجدت)</li>
          <li>معلومات المستخدم</li>
          <li>تقدير مدى الوصول المتوقع</li>
          <li>نصائح لتحسين التفاعل</li>
        </ul>
      </div>

      {/* زر فتح المعاينة */}
      <button
        onClick={handleOpenPreview}
        style={{
          padding: '12px 24px',
          backgroundColor: '#0a66c2',
          color: 'white',
          border: 'none',
          borderRadius: '24px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span>📱</span>
        معاينة المنشور على LinkedIn
      </button>

      {/* رسائل النجاح/الخطأ */}
      {shareSuccess && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#d1fae5',
          color: '#065f46',
          borderRadius: '8px',
          border: '1px solid #6ee7b7'
        }}>
          ✅ تم نشر الشهادة على LinkedIn بنجاح!
        </div>
      )}

      {shareError && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          borderRadius: '8px',
          border: '1px solid #fca5a5'
        }}>
          ❌ {shareError}
        </div>
      )}

      {/* مكون المعاينة */}
      {showPreview && (
        <LinkedInPostPreview
          certificateId={certificateId}
          token={token}
          onShare={handleShare}
          onClose={handleClosePreview}
        />
      )}

      {/* معلومات إضافية */}
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h3>كيفية الاستخدام</h3>
        <pre style={{ 
          backgroundColor: '#1f2937', 
          color: '#f9fafb', 
          padding: '16px', 
          borderRadius: '8px',
          overflow: 'auto'
        }}>
{`import LinkedInPostPreview from './components/LinkedIn/LinkedInPostPreview';

const [showPreview, setShowPreview] = useState(false);

const handleShare = async (certificateId) => {
  const response = await fetch('/api/linkedin/share-certificate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify({ certificateId })
  });
  
  const data = await response.json();
  // معالجة النتيجة...
};

<LinkedInPostPreview
  certificateId={certificateId}
  token={token}
  onShare={handleShare}
  onClose={() => setShowPreview(false)}
/>`}
        </pre>
      </div>

      {/* الميزات */}
      <div style={{ marginTop: '30px' }}>
        <h3>الميزات</h3>
        <ul>
          <li>✅ معاينة كاملة للمنشور قبل النشر</li>
          <li>✅ تقدير مدى الوصول (منخفض، متوسط، مرتفع)</li>
          <li>✅ نصائح لتحسين التفاعل</li>
          <li>✅ عرض عدد الهاشتاجات والروابط</li>
          <li>✅ تصميم يحاكي LinkedIn الفعلي</li>
          <li>✅ دعم RTL و Dark Mode</li>
          <li>✅ متجاوب على جميع الأجهزة</li>
        </ul>
      </div>
    </div>
  );
};

export default LinkedInPostPreviewExample;
