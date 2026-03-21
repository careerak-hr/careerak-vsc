import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import VerificationPage from '../pages/VerificationPage';

/**
 * مثال استخدام صفحة التحقق من الشهادات
 * Certificate Verification Page Usage Example
 * 
 * Features:
 * - التحقق من صحة الشهادة
 * - عرض تفاصيل الشهادة
 * - QR Code للمشاركة السريعة
 * - نسخ رابط التحقق
 * - تحميل QR Code
 * - دعم متعدد اللغات (ar, en, fr)
 * - تصميم متجاوب
 * - Dark Mode Support
 * - RTL Support
 */

/**
 * Example 1: استخدام أساسي
 * Basic Usage
 */
export const BasicVerificationExample = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <VerificationPage />
      </AppProvider>
    </BrowserRouter>
  );
};

/**
 * Example 2: استخدام مع certificateId محدد
 * Usage with specific certificateId
 */
export const SpecificCertificateExample = () => {
  // في التطبيق الفعلي، سيتم الحصول على certificateId من URL params
  // In real app, certificateId will be obtained from URL params
  
  return (
    <BrowserRouter>
      <AppProvider>
        {/* المسار: /verify/550e8400-e29b-41d4-a716-446655440000 */}
        <VerificationPage />
      </AppProvider>
    </BrowserRouter>
  );
};

/**
 * Example 3: استخدام في مكون آخر
 * Usage in another component
 */
export const EmbeddedVerificationExample = () => {
  const handleVerify = (certificateId) => {
    // التوجيه إلى صفحة التحقق
    window.location.href = `/verify/${certificateId}`;
  };

  return (
    <div className="certificate-card">
      <h3>شهادة إتمام الدورة</h3>
      <p>رقم الشهادة: 550e8400-e29b-41d4-a716-446655440000</p>
      <button onClick={() => handleVerify('550e8400-e29b-41d4-a716-446655440000')}>
        التحقق من الشهادة
      </button>
    </div>
  );
};

/**
 * Example 4: مشاركة رابط التحقق مع QR Code
 * Share verification link with QR Code
 */
export const ShareVerificationExample = () => {
  const certificateId = '550e8400-e29b-41d4-a716-446655440000';
  const verificationUrl = `https://careerak.com/verify/${certificateId}`;

  const shareOnSocialMedia = (platform) => {
    const text = encodeURIComponent(`تحقق من شهادتي على Careerak: ${verificationUrl}`);
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(verificationUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}`,
      whatsapp: `https://wa.me/?text=${text}`
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="share-verification">
      <h3>مشاركة رابط التحقق</h3>
      <p>رابط التحقق: {verificationUrl}</p>
      
      <div className="share-buttons">
        <button onClick={() => shareOnSocialMedia('twitter')}>
          مشاركة على Twitter
        </button>
        <button onClick={() => shareOnSocialMedia('facebook')}>
          مشاركة على Facebook
        </button>
        <button onClick={() => shareOnSocialMedia('linkedin')}>
          مشاركة على LinkedIn
        </button>
        <button onClick={() => shareOnSocialMedia('whatsapp')}>
          مشاركة على WhatsApp
        </button>
      </div>
    </div>
  );
};

/**
 * Example 5: استخدام API للتحقق البرمجي
 * Using API for programmatic verification
 */
export const ProgrammaticVerificationExample = () => {
  const [certificate, setCertificate] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const verifyCertificate = async (certificateId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/verify/${certificateId}`);
      const data = await response.json();

      if (data.success && data.found) {
        setCertificate(data.certificate);
      } else {
        setError(data.message || 'Certificate not found');
      }
    } catch (err) {
      setError('Error verifying certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="programmatic-verification">
      <h3>التحقق البرمجي من الشهادة</h3>
      
      <input 
        type="text" 
        placeholder="أدخل رقم الشهادة"
        onBlur={(e) => verifyCertificate(e.target.value)}
      />

      {loading && <p>جاري التحقق...</p>}
      {error && <p className="error">{error}</p>}
      
      {certificate && (
        <div className="certificate-info">
          <h4>✅ شهادة صالحة</h4>
          <p>الحامل: {certificate.holder.name}</p>
          <p>الدورة: {certificate.course.name}</p>
          <p>تاريخ الإصدار: {new Date(certificate.dates.issued).toLocaleDateString('ar')}</p>
        </div>
      )}
    </div>
  );
};

/**
 * Example 6: QR Code Scanner Integration
 * تكامل ماسح QR Code
 */
export const QRCodeScannerExample = () => {
  const [scannedUrl, setScannedUrl] = React.useState('');

  const handleScan = (data) => {
    if (data) {
      setScannedUrl(data);
      
      // استخراج certificateId من URL
      const match = data.match(/\/verify\/([a-f0-9-]+)/i);
      if (match) {
        const certificateId = match[1];
        window.location.href = `/verify/${certificateId}`;
      }
    }
  };

  return (
    <div className="qr-scanner">
      <h3>مسح QR Code للتحقق</h3>
      <p>امسح QR Code الموجود على الشهادة للتحقق منها</p>
      
      {/* يمكن استخدام مكتبة مثل react-qr-reader */}
      {/* <QrReader onScan={handleScan} /> */}
      
      {scannedUrl && (
        <p>تم مسح: {scannedUrl}</p>
      )}
    </div>
  );
};

/**
 * Example 7: Bulk Verification
 * التحقق من عدة شهادات
 */
export const BulkVerificationExample = () => {
  const [certificateIds, setCertificateIds] = React.useState('');
  const [results, setResults] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const verifyBulk = async () => {
    try {
      setLoading(true);
      
      const ids = certificateIds.split('\n').filter(id => id.trim());
      
      const response = await fetch('/api/verify/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateIds: ids })
      });
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bulk-verification">
      <h3>التحقق من عدة شهادات</h3>
      
      <textarea
        placeholder="أدخل أرقام الشهادات (كل رقم في سطر)"
        value={certificateIds}
        onChange={(e) => setCertificateIds(e.target.value)}
        rows={10}
      />
      
      <button onClick={verifyBulk} disabled={loading}>
        {loading ? 'جاري التحقق...' : 'التحقق من الشهادات'}
      </button>

      {results && (
        <div className="results">
          <h4>النتائج:</h4>
          <p>الإجمالي: {results.summary.total}</p>
          <p>صالحة: {results.summary.valid}</p>
          <p>غير صالحة: {results.summary.invalid}</p>
          <p>غير موجودة: {results.summary.notFound}</p>
        </div>
      )}
    </div>
  );
};

// Export all examples
export default {
  BasicVerificationExample,
  SpecificCertificateExample,
  EmbeddedVerificationExample,
  ShareVerificationExample,
  ProgrammaticVerificationExample,
  QRCodeScannerExample,
  BulkVerificationExample
};
