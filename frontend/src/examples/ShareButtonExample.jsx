import React from 'react';
import ShareButton from '../components/ShareButton';

/**
 * مثال شامل لاستخدام ShareButton و ShareModal
 * 
 * الميزات:
 * - 5 خيارات مشاركة: نسخ الرابط، WhatsApp، LinkedIn، Twitter، Facebook
 * - Web Share API للأجهزة المحمولة
 * - رسالة تأكيد عند نسخ الرابط
 * - تصميم متجاوب
 * - دعم RTL
 * - Dark Mode
 * - Accessibility
 */

const ShareButtonExample = () => {
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
        marginBottom: '40px'
      }}>
        أمثلة ShareButton
      </h1>

      {/* مثال 1: الزر الافتراضي */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ 
          fontFamily: 'Amiri, Cairo, serif',
          fontSize: '24px',
          color: '#304B60',
          marginBottom: '16px'
        }}>
          1. الزر الافتراضي (Default)
        </h2>
        <div style={{ 
          padding: '20px',
          background: '#E3DAD1',
          borderRadius: '12px',
          border: '2px solid #D4816180'
        }}>
          <ShareButton job={sampleJob} />
        </div>
        <pre style={{ 
          background: '#f5f5f5',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '16px',
          overflow: 'auto'
        }}>
{`<ShareButton job={job} />`}
        </pre>
      </section>

      {/* مثال 2: أحجام مختلفة */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ 
          fontFamily: 'Amiri, Cairo, serif',
          fontSize: '24px',
          color: '#304B60',
          marginBottom: '16px'
        }}>
          2. أحجام مختلفة
        </h2>
        <div style={{ 
          padding: '20px',
          background: '#E3DAD1',
          borderRadius: '12px',
          border: '2px solid #D4816180',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <ShareButton job={sampleJob} size="small" />
          <ShareButton job={sampleJob} size="medium" />
          <ShareButton job={sampleJob} size="large" />
        </div>
        <pre style={{ 
          background: '#f5f5f5',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '16px',
          overflow: 'auto'
        }}>
{`<ShareButton job={job} size="small" />
<ShareButton job={job} size="medium" />
<ShareButton job={job} size="large" />`}
        </pre>
      </section>

      {/* مثال 3: أنماط مختلفة */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ 
          fontFamily: 'Amiri, Cairo, serif',
          fontSize: '24px',
          color: '#304B60',
          marginBottom: '16px'
        }}>
          3. أنماط مختلفة (Variants)
        </h2>
        <div style={{ 
          padding: '20px',
          background: '#E3DAD1',
          borderRadius: '12px',
          border: '2px solid #D4816180',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <ShareButton job={sampleJob} variant="default" />
          <ShareButton job={sampleJob} variant="primary" />
          <ShareButton job={sampleJob} variant="outline" />
          <ShareButton job={sampleJob} variant="icon-only" />
        </div>
        <pre style={{ 
          background: '#f5f5f5',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '16px',
          overflow: 'auto'
        }}>
{`<ShareButton job={job} variant="default" />
<ShareButton job={job} variant="primary" />
<ShareButton job={job} variant="outline" />
<ShareButton job={job} variant="icon-only" />`}
        </pre>
      </section>

      {/* مثال 4: في بطاقة وظيفة */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ 
          fontFamily: 'Amiri, Cairo, serif',
          fontSize: '24px',
          color: '#304B60',
          marginBottom: '16px'
        }}>
          4. في بطاقة وظيفة
        </h2>
        <div style={{ 
          padding: '24px',
          background: 'white',
          borderRadius: '12px',
          border: '2px solid #D4816180',
          maxWidth: '400px'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ 
              fontFamily: 'Amiri, Cairo, serif',
              fontSize: '20px',
              color: '#304B60',
              marginBottom: '8px'
            }}>
              {sampleJob.title}
            </h3>
            <p style={{ 
              fontFamily: 'Amiri, Cairo, serif',
              fontSize: '16px',
              color: '#304B60',
              opacity: 0.7,
              marginBottom: '8px'
            }}>
              {sampleJob.company.name}
            </p>
            <p style={{ 
              fontFamily: 'Amiri, Cairo, serif',
              fontSize: '14px',
              color: '#304B60',
              opacity: 0.6
            }}>
              {sampleJob.location.city}, {sampleJob.location.country}
            </p>
          </div>
          <div style={{ 
            display: 'flex',
            gap: '12px',
            justifyContent: 'space-between'
          }}>
            <button style={{
              flex: 1,
              padding: '10px 16px',
              background: '#304B60',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'Amiri, Cairo, serif',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              تقديم
            </button>
            <ShareButton job={sampleJob} variant="outline" />
          </div>
        </div>
        <pre style={{ 
          background: '#f5f5f5',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '16px',
          overflow: 'auto'
        }}>
{`<div className="job-card">
  <div className="job-info">
    <h3>{job.title}</h3>
    <p>{job.company.name}</p>
    <p>{job.location.city}</p>
  </div>
  <div className="job-actions">
    <button>تقديم</button>
    <ShareButton job={job} variant="outline" />
  </div>
</div>`}
        </pre>
      </section>

      {/* مثال 5: مع Custom Class */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ 
          fontFamily: 'Amiri, Cairo, serif',
          fontSize: '24px',
          color: '#304B60',
          marginBottom: '16px'
        }}>
          5. مع Custom Class
        </h2>
        <div style={{ 
          padding: '20px',
          background: '#E3DAD1',
          borderRadius: '12px',
          border: '2px solid #D4816180'
        }}>
          <ShareButton 
            job={sampleJob} 
            className="my-custom-share-button"
          />
        </div>
        <pre style={{ 
          background: '#f5f5f5',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '16px',
          overflow: 'auto'
        }}>
{`<ShareButton 
  job={job} 
  className="my-custom-share-button"
/>`}
        </pre>
      </section>

      {/* معلومات إضافية */}
      <section style={{ 
        padding: '24px',
        background: '#E3DAD1',
        borderRadius: '12px',
        border: '2px solid #D4816180'
      }}>
        <h2 style={{ 
          fontFamily: 'Amiri, Cairo, serif',
          fontSize: '24px',
          color: '#304B60',
          marginBottom: '16px'
        }}>
          📋 الميزات
        </h2>
        <ul style={{ 
          fontFamily: 'Amiri, Cairo, serif',
          fontSize: '16px',
          color: '#304B60',
          lineHeight: '1.8'
        }}>
          <li>✅ 5 خيارات مشاركة: نسخ الرابط، WhatsApp، LinkedIn، Twitter، Facebook</li>
          <li>✅ Web Share API للأجهزة المحمولة (المزيد من الخيارات)</li>
          <li>✅ رسالة تأكيد عند نسخ الرابط (1.5 ثانية)</li>
          <li>✅ تصميم متجاوب (Desktop, Tablet, Mobile)</li>
          <li>✅ دعم RTL/LTR</li>
          <li>✅ Dark Mode Support</li>
          <li>✅ Accessibility (ARIA labels, Focus states)</li>
          <li>✅ Animations سلسة (fadeIn, slideUp)</li>
          <li>✅ Reduced Motion Support</li>
          <li>✅ 3 أحجام: small, medium, large</li>
          <li>✅ 4 أنماط: default, primary, outline, icon-only</li>
        </ul>
      </section>
    </div>
  );
};

export default ShareButtonExample;
