import React, { useState, useEffect } from 'react';
import './LinkedInIntegrationExample.css';

/**
 * مثال كامل لتكامل LinkedIn
 * يوضح كيفية:
 * 1. ربط حساب LinkedIn
 * 2. مشاركة الشهادات
 * 3. التحقق من حالة الربط
 * 4. إلغاء الربط
 */

// ==================== مكون ربط LinkedIn ====================
function LinkedInConnect({ token, onConnectionChange }) {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/linkedin/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setIsConnected(data.isConnected);
      
      if (onConnectionChange) {
        onConnectionChange(data.isConnected);
      }
    } catch (error) {
      console.error('Error checking LinkedIn status:', error);
      setError('فشل في التحقق من حالة الربط');
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/linkedin/auth-url', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        // حفظ state في localStorage للتحقق لاحقاً
        localStorage.setItem('linkedin_state', data.state);
        
        // إعادة توجيه المستخدم إلى LinkedIn
        window.location.href = data.authUrl;
      } else {
        setError('فشل في الحصول على رابط المصادقة');
      }
    } catch (error) {
      console.error('Error connecting to LinkedIn:', error);
      setError('فشل في الاتصال بـ LinkedIn');
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('هل أنت متأكد من إلغاء ربط حساب LinkedIn؟')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/linkedin/unlink', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsConnected(false);
        if (onConnectionChange) {
          onConnectionChange(false);
        }
        alert('تم إلغاء ربط حساب LinkedIn بنجاح');
      } else {
        setError('فشل في إلغاء الربط');
      }
    } catch (error) {
      console.error('Error disconnecting from LinkedIn:', error);
      setError('فشل في إلغاء الربط');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="linkedin-connect">
      <div className="linkedin-status">
        {isConnected ? (
          <span className="status-badge connected">✓ متصل بـ LinkedIn</span>
        ) : (
          <span className="status-badge disconnected">✗ غير متصل</span>
        )}
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {isConnected ? (
        <button 
          onClick={handleDisconnect} 
          disabled={loading}
          className="btn btn-danger"
        >
          {loading ? 'جاري الإلغاء...' : 'إلغاء ربط LinkedIn'}
        </button>
      ) : (
        <button 
          onClick={handleConnect} 
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'جاري الربط...' : 'ربط حساب LinkedIn'}
        </button>
      )}
    </div>
  );
}

// ==================== مكون مشاركة الشهادة ====================
function ShareCertificate({ certificateId, token, isLinkedInConnected }) {
  const [loading, setLoading] = useState(false);
  const [shared, setShared] = useState(false);
  const [error, setError] = useState(null);

  const handleShare = async () => {
    if (!isLinkedInConnected) {
      alert('يرجى ربط حساب LinkedIn أولاً');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/linkedin/share-certificate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ certificateId })
      });

      const data = await response.json();

      if (data.success) {
        setShared(true);
        alert('تم مشاركة الشهادة بنجاح على LinkedIn!');
        
        // فتح المنشور في نافذة جديدة (اختياري)
        if (data.postUrl) {
          window.open(data.postUrl, '_blank');
        }
      } else if (data.requiresAuth) {
        alert('يرجى ربط حساب LinkedIn أولاً');
      } else {
        setError(data.messageAr || 'فشل في مشاركة الشهادة');
      }
    } catch (error) {
      console.error('Error sharing certificate:', error);
      setError('فشل في مشاركة الشهادة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="share-certificate">
      {error && (
        <div className="error-message">{error}</div>
      )}

      <button 
        onClick={handleShare} 
        disabled={loading || shared || !isLinkedInConnected}
        className="btn btn-linkedin"
      >
        {loading ? (
          'جاري المشاركة...'
        ) : shared ? (
          '✓ تم المشاركة'
        ) : (
          <>
            <svg className="linkedin-icon" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            مشاركة على LinkedIn
          </>
        )}
      </button>

      {!isLinkedInConnected && (
        <p className="hint-text">يجب ربط حساب LinkedIn أولاً</p>
      )}
    </div>
  );
}

// ==================== صفحة Callback ====================
function LinkedInCallback({ token }) {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const error = params.get('error');

      // التحقق من وجود خطأ من LinkedIn
      if (error) {
        setStatus('error');
        setMessage(`خطأ من LinkedIn: ${error}`);
        return;
      }

      // التحقق من state
      const savedState = localStorage.getItem('linkedin_state');
      if (state !== savedState) {
        setStatus('error');
        setMessage('خطأ في التحقق من الأمان (state mismatch)');
        return;
      }

      // إرسال code إلى Backend
      const response = await fetch(
        `/api/linkedin/callback?code=${code}&state=${state}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('تم ربط حساب LinkedIn بنجاح!');
        
        // حذف state من localStorage
        localStorage.removeItem('linkedin_state');
        
        // إعادة التوجيه بعد 2 ثانية
        setTimeout(() => {
          window.location.href = '/profile/settings';
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.messageAr || 'فشل في ربط حساب LinkedIn');
      }
    } catch (error) {
      console.error('Error handling LinkedIn callback:', error);
      setStatus('error');
      setMessage('فشل في معالجة الاستجابة من LinkedIn');
    }
  };

  return (
    <div className="linkedin-callback">
      <div className={`callback-status ${status}`}>
        {status === 'processing' && (
          <>
            <div className="spinner"></div>
            <p>جاري ربط حساب LinkedIn...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="success-icon">✓</div>
            <p>{message}</p>
            <p className="redirect-text">جاري إعادة التوجيه...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="error-icon">✗</div>
            <p>{message}</p>
            <button onClick={() => window.location.href = '/profile/settings'}>
              العودة إلى الإعدادات
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ==================== مثال كامل ====================
function LinkedInIntegrationExample() {
  const [token] = useState('YOUR_JWT_TOKEN'); // استبدل بـ token حقيقي
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [certificates] = useState([
    { id: 'cert_123', name: 'Advanced JavaScript', date: '2026-03-13' },
    { id: 'cert_456', name: 'React Mastery', date: '2026-03-10' },
    { id: 'cert_789', name: 'Node.js Expert', date: '2026-03-05' }
  ]);

  return (
    <div className="linkedin-integration-example">
      <h1>تكامل LinkedIn - مثال كامل</h1>

      {/* قسم ربط الحساب */}
      <section className="section">
        <h2>1. ربط حساب LinkedIn</h2>
        <LinkedInConnect 
          token={token}
          onConnectionChange={setIsLinkedInConnected}
        />
      </section>

      {/* قسم مشاركة الشهادات */}
      <section className="section">
        <h2>2. مشاركة الشهادات</h2>
        <div className="certificates-grid">
          {certificates.map(cert => (
            <div key={cert.id} className="certificate-card">
              <h3>{cert.name}</h3>
              <p className="date">{cert.date}</p>
              <ShareCertificate 
                certificateId={cert.id}
                token={token}
                isLinkedInConnected={isLinkedInConnected}
              />
            </div>
          ))}
        </div>
      </section>

      {/* معلومات إضافية */}
      <section className="section info">
        <h2>ملاحظات</h2>
        <ul>
          <li>يجب ربط حساب LinkedIn قبل مشاركة الشهادات</li>
          <li>يتم حفظ access token بشكل آمن في قاعدة البيانات</li>
          <li>يمكن إلغاء الربط في أي وقت</li>
          <li>المشاركة تتم كمنشور عام على LinkedIn</li>
        </ul>
      </section>
    </div>
  );
}

export default LinkedInIntegrationExample;
export { LinkedInConnect, ShareCertificate, LinkedInCallback };
