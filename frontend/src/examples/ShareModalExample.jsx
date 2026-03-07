import React, { useState } from 'react';
import ShareButton from '../components/ShareButton/ShareButton';
import ShareModal from '../components/ShareModal/ShareModal';

/**
 * مثال على استخدام ShareModal و ShareButton
 * 
 * الميزات:
 * - 5 خيارات للمشاركة: نسخ الرابط، WhatsApp، LinkedIn، Twitter، Facebook
 * - Web Share API للأجهزة المحمولة
 * - رسالة تأكيد عند نسخ الرابط
 * - تصميم متجاوب
 * - دعم RTL
 * - دعم Dark Mode
 */

const ShareModalExample = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // بيانات وظيفة تجريبية
  const sampleJob = {
    _id: '507f1f77bcf86cd799439011',
    title: 'مطور Full Stack',
    company: {
      name: 'شركة التقنية المتقدمة',
      logo: 'https://via.placeholder.com/100'
    },
    location: {
      city: 'الرياض',
      country: 'السعودية'
    },
    salary: 15000,
    experienceLevel: 'متوسط',
    employmentType: 'دوام كامل'
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ 
        fontFamily: 'Amiri, Cairo, serif',
        fontSize: '32px',
        color: '#304B60',
        marginBottom: '24px'
      }}>
        مثال على نظام المشاركة
      </h1>

      <div style={{ 
        background: 'white',
        border: '2px solid #D4816180',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <h2 style={{ 
          fontFamily: 'Amiri, Cairo, serif',
          fontSize: '24px',
          color: '#304B60',
          marginBottom: '16px'
        }}>
          الطريقة 1: استخدام ShareButton (موصى به)
        </h2>
        
        <p style={{ 
          fontFamily: 'Amiri, Cairo, serif',
          fontSize: '16px',
          color: '#304B60',
          marginBottom: '16px',
          opacity: 0.8
        }}>
          مكون جاهز يحتوي على الزر والـ Modal معاً
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <ShareButton job={sampleJob} variant="default" size="medium" />
          <ShareButton job={sampleJob} variant="primary" size="medium" />
          <ShareButton job={sampleJob} variant="icon-only" size="small" />
        </div>

        <pre style={{ 
          background: '#f5f5f5',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '16px',
          overflow: 'auto'
        }}>
{`import ShareButton from '../components/ShareButton/ShareButton';

<ShareButton 
  job={job} 
  variant="default"  // default | primary | icon-only
  size="medium"      // small | medium | large
/>`}
        </pre>
      </div>

      <div style={{ 
        background: 'white',
        border: '2px solid #D4816180',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <h2 style={{ 
          fontFamily: 'Amiri, Cairo, serif',
          fontSize: '24px',
          color: '#304B60',
          marginBottom: '16px'
        }}>
          الطريقة 2: استخدام ShareModal مباشرة
        </h2>
        
        <p style={{ 
          fontFamily: 'Amiri, Cairo, serif',
          fontSize: '16px',
          color: '#304B60',
          marginBottom: '16px',
          opacity: 0.8
        }}>
          للتحكم الكامل في متى وكيف يُفتح الـ Modal
        </p>

        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: '12px 24px',
            background: '#304B60',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontFamily: 'Amiri, Cairo, serif',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          فتح Modal المشاركة
        </button>

        <ShareModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          job={sampleJob}
        />

        <pre style={{ 
          background: '#f5f5f5',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '16px',
          overflow: 'auto'
        }}>
{`import ShareModal from '../components/ShareModal/ShareModal';

const [isModalOpen, setIsModalOpen] = useState(false);

<button onClick={() => setIsModalOpen(true)}>
  مشاركة
</button>

<ShareModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  job={job}
/>`}
        </pre>
      </div>

      <div style={{ 
        background: '#E3DAD1',
        border: '2px solid #D48161',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h2 style={{ 
          fontFamily: 'Amiri, Cairo, serif',
          fontSize: '24px',
          color: '#304B60',
          marginBottom: '16px'
        }}>
          الميزات المتاحة
        </h2>

        <ul style={{ 
          fontFamily: 'Amiri, Cairo, serif',
          fontSize: '16px',
          color: '#304B60',
          lineHeight: '1.8',
          paddingRight: '24px'
        }}>
          <li>✅ نسخ الرابط مع رسالة تأكيد</li>
          <li>✅ مشاركة على WhatsApp</li>
          <li>✅ مشاركة على LinkedIn</li>
          <li>✅ مشاركة على Twitter</li>
          <li>✅ مشاركة على Facebook</li>
          <li>✅ Web Share API للأجهزة المحمولة</li>
          <li>✅ تصميم متجاوب (Desktop, Tablet, Mobile)</li>
          <li>✅ دعم RTL/LTR</li>
          <li>✅ دعم Dark Mode</li>
          <li>✅ Accessibility كامل</li>
          <li>✅ Animations سلسة</li>
        </ul>
      </div>

      <div style={{ 
        marginTop: '32px',
        padding: '20px',
        background: '#fff3cd',
        border: '2px solid #ffc107',
        borderRadius: '12px'
      }}>
        <h3 style={{ 
          fontFamily: 'Amiri, Cairo, serif',
          fontSize: '20px',
          color: '#856404',
          marginBottom: '12px'
        }}>
          ملاحظات مهمة
        </h3>
        <ul style={{ 
          fontFamily: 'Amiri, Cairo, serif',
          fontSize: '14px',
          color: '#856404',
          lineHeight: '1.6',
          paddingRight: '24px',
          margin: 0
        }}>
          <li>يتطلب كائن job يحتوي على: _id, title, company.name</li>
          <li>Web Share API يعمل فقط على HTTPS أو localhost</li>
          <li>نسخ الرابط يتطلب HTTPS أو localhost</li>
          <li>يفتح روابط المشاركة في نافذة منبثقة (600x400)</li>
        </ul>
      </div>
    </div>
  );
};

export default ShareModalExample;
