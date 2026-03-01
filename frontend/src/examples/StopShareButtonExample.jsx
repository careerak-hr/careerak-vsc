import React, { useState } from 'react';
import ScreenShareControls from '../components/VideoInterview/ScreenShareControls';
import ScreenShareDisplay from '../components/VideoInterview/ScreenShareDisplay';

/**
 * مثال على استخدام زر إيقاف مشاركة الشاشة
 * يوضح كيفية استخدام المكون مع جميع الميزات
 */
const StopShareButtonExample = () => {
  const [stream, setStream] = useState(null);
  const [shareType, setShareType] = useState(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleShareStart = (newStream, type) => {
    console.log('بدء المشاركة:', type);
    setStream(newStream);
    setShareType(type);
    setIsSharing(true);
  };

  const handleShareStop = () => {
    console.log('إيقاف المشاركة');
    
    // إيقاف جميع tracks
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    setStream(null);
    setShareType(null);
    setIsSharing(false);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>
        مثال على زر إيقاف مشاركة الشاشة
      </h1>

      {/* معلومات الميزة */}
      <div style={{
        background: '#f0f9ff',
        border: '2px solid #0ea5e9',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem', color: '#0369a1' }}>
          ✨ الميزات الرئيسية
        </h3>
        <ul style={{ margin: 0, paddingRight: '1.5rem', lineHeight: '1.8' }}>
          <li>زر إيقاف واضح ومرئي بلون أحمر مميز</li>
          <li>أيقونة stop-circle واضحة</li>
          <li>نص "إيقاف المشاركة" يبقى ظاهراً حتى على الموبايل</li>
          <li>modal تأكيد قبل الإيقاف لتجنب الإيقاف العرضي</li>
          <li>تأثيرات hover وactive واضحة</li>
          <li>مؤشر "يشارك الآن" مع أيقونة نابضة</li>
          <li>معلومات الجودة (الدقة وmعدل الإطارات)</li>
          <li>زر تبديل المصدر</li>
        </ul>
      </div>

      {/* مكون التحكم */}
      <div style={{
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem' }}>التحكم في المشاركة</h3>
        
        <ScreenShareControls
          onShareStart={handleShareStart}
          onShareStop={handleShareStop}
        />

        {/* حالة المشاركة */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: isSharing ? '#dcfce7' : '#fef3c7',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <strong>الحالة:</strong>{' '}
          {isSharing ? (
            <span style={{ color: '#16a34a' }}>
              ✅ يشارك {shareType === 'screen' ? 'الشاشة الكاملة' : 
                        shareType === 'window' ? 'نافذة' : 
                        shareType === 'tab' ? 'تبويب' : 'مشاركة'}
            </span>
          ) : (
            <span style={{ color: '#ca8a04' }}>⏸️ لا توجد مشاركة نشطة</span>
          )}
        </div>
      </div>

      {/* عرض الشاشة المشاركة */}
      {stream && (
        <div style={{
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1rem' }}>معاينة المشاركة</h3>
          
          <ScreenShareDisplay
            stream={stream}
            sharerName="أنت"
            shareType={shareType}
            onClose={handleShareStop}
          />
        </div>
      )}

      {/* تعليمات الاستخدام */}
      <div style={{
        background: '#fef3c7',
        border: '2px solid #fbbf24',
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <h3 style={{ margin: '0 0 1rem', color: '#92400e' }}>
          📝 تعليمات الاستخدام
        </h3>
        <ol style={{ margin: 0, paddingRight: '1.5rem', lineHeight: '1.8' }}>
          <li>انقر على "مشاركة الشاشة" لبدء المشاركة</li>
          <li>اختر نوع المشاركة (شاشة كاملة، نافذة، أو تبويب)</li>
          <li>لاحظ ظهور زر "إيقاف المشاركة" باللون الأحمر</li>
          <li>انقر على "إيقاف المشاركة" لإيقاف المشاركة</li>
          <li>سيظهر modal تأكيد - اختر "إيقاف المشاركة" للتأكيد أو "إلغاء" للرجوع</li>
        </ol>
      </div>

      {/* معلومات تقنية */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: '#f9fafb',
        borderRadius: '12px',
        fontSize: '0.9rem',
        color: '#6b7280'
      }}>
        <h4 style={{ margin: '0 0 0.5rem', color: '#374151' }}>
          ℹ️ معلومات تقنية
        </h4>
        <ul style={{ margin: 0, paddingRight: '1.5rem', lineHeight: '1.6' }}>
          <li><strong>المكون:</strong> ScreenShareControls.jsx</li>
          <li><strong>التنسيقات:</strong> ScreenShareControls.css</li>
          <li><strong>Modal التأكيد:</strong> StopShareConfirmModal.jsx</li>
          <li><strong>الخدمة:</strong> screenShareService.js</li>
          <li><strong>الاختبارات:</strong> ScreenShareControls.test.jsx (8 اختبارات)</li>
          <li><strong>المتطلبات:</strong> Requirements 3.5 (زر واضح لإيقاف المشاركة)</li>
        </ul>
      </div>
    </div>
  );
};

export default StopShareButtonExample;
