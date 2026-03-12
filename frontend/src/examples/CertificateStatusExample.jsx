import React, { useState, useEffect } from 'react';
import CertificateStatus from '../components/Certificates/CertificateStatus';

/**
 * مثال على استخدام مكون CertificateStatus
 * يوضح كيفية عرض حالة الشهادة في سيناريوهات مختلفة
 */
const CertificateStatusExample = () => {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * جلب بيانات الشهادة من API
   * @param {string} certificateId - معرف الشهادة
   */
  const fetchCertificate = async (certificateId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/certificates/verify/${certificateId}`);
      const data = await response.json();
      
      if (data.success) {
        setCertificate(data.certificate);
      } else {
        console.error('Certificate not found');
      }
    } catch (error) {
      console.error('Error fetching certificate:', error);
    } finally {
      setLoading(false);
    }
  };

  // أمثلة على حالات مختلفة للشهادات
  const exampleCertificates = {
    valid: {
      status: 'active',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // سنة من الآن
      revocationReason: null
    },
    expired: {
      status: 'active',
      expiryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // منذ 30 يوم
      revocationReason: null
    },
    revoked: {
      status: 'revoked',
      expiryDate: null,
      revocationReason: 'Certificate was revoked due to policy violation'
    },
    revokedWithExpiry: {
      status: 'revoked',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      revocationReason: 'User requested certificate cancellation'
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ 
        fontFamily: 'Amiri, serif', 
        fontSize: '2rem', 
        color: '#304B60',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        أمثلة على عرض حالة الشهادة
        <br />
        <span style={{ fontSize: '1.5rem', fontFamily: 'Cormorant Garamond, serif' }}>
          Certificate Status Display Examples
        </span>
      </h1>

      {/* مثال 1: شهادة صالحة */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ 
          fontFamily: 'Amiri, serif', 
          fontSize: '1.5rem', 
          color: '#304B60',
          marginBottom: '1rem'
        }}>
          1. شهادة صالحة / Valid Certificate
        </h2>
        <CertificateStatus
          status={exampleCertificates.valid.status}
          expiryDate={exampleCertificates.valid.expiryDate}
          revocationReason={exampleCertificates.valid.revocationReason}
        />
      </section>

      {/* مثال 2: شهادة منتهية */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ 
          fontFamily: 'Amiri, serif', 
          fontSize: '1.5rem', 
          color: '#304B60',
          marginBottom: '1rem'
        }}>
          2. شهادة منتهية / Expired Certificate
        </h2>
        <CertificateStatus
          status={exampleCertificates.expired.status}
          expiryDate={exampleCertificates.expired.expiryDate}
          revocationReason={exampleCertificates.expired.revocationReason}
        />
      </section>

      {/* مثال 3: شهادة ملغاة */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ 
          fontFamily: 'Amiri, serif', 
          fontSize: '1.5rem', 
          color: '#304B60',
          marginBottom: '1rem'
        }}>
          3. شهادة ملغاة / Revoked Certificate
        </h2>
        <CertificateStatus
          status={exampleCertificates.revoked.status}
          expiryDate={exampleCertificates.revoked.expiryDate}
          revocationReason={exampleCertificates.revoked.revocationReason}
        />
      </section>

      {/* مثال 4: شهادة ملغاة مع تاريخ انتهاء */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ 
          fontFamily: 'Amiri, serif', 
          fontSize: '1.5rem', 
          color: '#304B60',
          marginBottom: '1rem'
        }}>
          4. شهادة ملغاة مع تاريخ انتهاء / Revoked Certificate with Expiry
        </h2>
        <CertificateStatus
          status={exampleCertificates.revokedWithExpiry.status}
          expiryDate={exampleCertificates.revokedWithExpiry.expiryDate}
          revocationReason={exampleCertificates.revokedWithExpiry.revocationReason}
        />
      </section>

      {/* مثال 5: استخدام مع API */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ 
          fontFamily: 'Amiri, serif', 
          fontSize: '1.5rem', 
          color: '#304B60',
          marginBottom: '1rem'
        }}>
          5. استخدام مع API / Usage with API
        </h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="أدخل معرف الشهادة / Enter Certificate ID"
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              fontFamily: 'Amiri, serif',
              border: '2px solid #D4816180',
              borderRadius: '8px',
              marginBottom: '0.5rem'
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value) {
                fetchCertificate(e.target.value);
              }
            }}
          />
          <p style={{ 
            fontSize: '0.9rem', 
            color: '#666',
            fontFamily: 'Amiri, serif'
          }}>
            اضغط Enter للبحث / Press Enter to search
          </p>
        </div>

        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            fontFamily: 'Amiri, serif',
            color: '#304B60'
          }}>
            جاري التحميل... / Loading...
          </div>
        )}

        {certificate && !loading && (
          <CertificateStatus
            status={certificate.status}
            expiryDate={certificate.expiryDate}
            revocationReason={certificate.revocationReason}
          />
        )}
      </section>

      {/* ملاحظات الاستخدام */}
      <section style={{ 
        marginTop: '3rem',
        padding: '1.5rem',
        background: '#F3F4F6',
        borderRadius: '12px',
        border: '2px solid #D4816180'
      }}>
        <h3 style={{ 
          fontFamily: 'Amiri, serif', 
          fontSize: '1.25rem', 
          color: '#304B60',
          marginBottom: '1rem'
        }}>
          ملاحظات الاستخدام / Usage Notes
        </h3>
        
        <ul style={{ 
          fontFamily: 'Amiri, serif',
          lineHeight: '1.8',
          color: '#304B60'
        }}>
          <li>
            <strong>Props المطلوبة / Required Props:</strong>
            <ul>
              <li><code>status</code>: حالة الشهادة ('active', 'revoked', 'expired')</li>
            </ul>
          </li>
          <li>
            <strong>Props الاختيارية / Optional Props:</strong>
            <ul>
              <li><code>expiryDate</code>: تاريخ انتهاء الشهادة (ISO string)</li>
              <li><code>revocationReason</code>: سبب إلغاء الشهادة (string)</li>
              <li><code>className</code>: CSS classes إضافية</li>
            </ul>
          </li>
          <li>
            <strong>الألوان / Colors:</strong>
            <ul>
              <li>أخضر / Green: شهادة صالحة</li>
              <li>أحمر / Red: شهادة ملغاة</li>
              <li>برتقالي / Orange: شهادة منتهية</li>
            </ul>
          </li>
          <li>
            <strong>الميزات / Features:</strong>
            <ul>
              <li>دعم RTL/LTR</li>
              <li>دعم Dark Mode</li>
              <li>تصميم متجاوب (Responsive)</li>
              <li>جاهز للطباعة (Print-ready)</li>
            </ul>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default CertificateStatusExample;
