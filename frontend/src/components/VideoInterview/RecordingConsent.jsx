import React, { useState, useEffect } from 'react';
import './RecordingConsent.css';

/**
 * Recording Consent Component
 * طلب موافقة المشاركين على تسجيل المقابلة
 * 
 * Requirements: 2.2, 2.3
 */
const RecordingConsent = ({ 
  interviewId, 
  userId, 
  userName,
  isHost,
  onConsentGiven,
  onConsentDenied,
  apiUrl,
  token 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [consented, setConsented] = useState(false);
  const [allConsents, setAllConsents] = useState([]);

  useEffect(() => {
    // جلب حالة الموافقات الحالية
    fetchConsents();
  }, [interviewId]);

  /**
   * جلب حالة الموافقات
   */
  const fetchConsents = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/api/interviews/${interviewId}/recording-consents`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAllConsents(data.consents || []);
        
        // التحقق من موافقة المستخدم الحالي
        const userConsent = data.consents.find(c => c.userId === userId);
        if (userConsent) {
          setConsented(userConsent.consented);
        }
      }
    } catch (err) {
      console.error('Error fetching consents:', err);
    }
  };

  /**
   * إرسال الموافقة
   */
  const handleConsent = async (consented) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${apiUrl}/api/interviews/${interviewId}/recording-consent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            consented,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit consent');
      }

      const data = await response.json();
      setConsented(consented);

      // تحديث قائمة الموافقات
      await fetchConsents();

      // استدعاء callback
      if (consented && onConsentGiven) {
        onConsentGiven();
      } else if (!consented && onConsentDenied) {
        onConsentDenied();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * التحقق من موافقة جميع المشاركين
   */
  const hasAllConsents = () => {
    return allConsents.length > 0 && allConsents.every(c => c.consented);
  };

  /**
   * عرض حالة الموافقات (للمضيف فقط)
   */
  const renderConsentsStatus = () => {
    if (!isHost || allConsents.length === 0) {
      return null;
    }

    return (
      <div className="consents-status">
        <h4>حالة الموافقات:</h4>
        <ul>
          {allConsents.map((consent, index) => (
            <li key={index} className={consent.consented ? 'consented' : 'pending'}>
              <span className="consent-icon">
                {consent.consented ? '✓' : '⏳'}
              </span>
              <span className="consent-name">{consent.userName || 'مشارك'}</span>
              <span className="consent-status">
                {consent.consented ? 'وافق' : 'في الانتظار'}
              </span>
            </li>
          ))}
        </ul>
        {hasAllConsents() && (
          <div className="all-consents-message">
            ✓ جميع المشاركين وافقوا على التسجيل
          </div>
        )}
      </div>
    );
  };

  if (consented) {
    return (
      <div className="recording-consent consented">
        <div className="consent-message">
          <span className="consent-icon">✓</span>
          <p>لقد وافقت على تسجيل هذه المقابلة</p>
        </div>
        {renderConsentsStatus()}
      </div>
    );
  }

  return (
    <div className="recording-consent">
      <div className="consent-header">
        <span className="recording-icon">🔴</span>
        <h3>طلب موافقة على التسجيل</h3>
      </div>

      <div className="consent-body">
        <p className="consent-description">
          يرغب المضيف في تسجيل هذه المقابلة. سيتم تسجيل الفيديو والصوت لجميع المشاركين.
        </p>

        <div className="consent-details">
          <h4>معلومات التسجيل:</h4>
          <ul>
            <li>✓ سيتم تسجيل الفيديو والصوت بجودة عالية</li>
            <li>✓ سيتم تخزين التسجيل بشكل آمن ومشفر</li>
            <li>✓ يمكن للمضيف والمشاركين الوصول للتسجيل</li>
            <li>✓ سيتم حذف التسجيل تلقائياً بعد 90 يوم</li>
            <li>✓ يمكنك طلب حذف التسجيل في أي وقت</li>
          </ul>
        </div>

        <div className="consent-warning">
          <span className="warning-icon">⚠️</span>
          <p>
            موافقتك إلزامية لبدء التسجيل. إذا رفضت، لن يتم تسجيل المقابلة.
          </p>
        </div>

        {error && (
          <div className="consent-error">
            <span className="error-icon">✗</span>
            <p>{error}</p>
          </div>
        )}

        <div className="consent-actions">
          <button
            className="consent-button accept"
            onClick={() => handleConsent(true)}
            disabled={loading}
          >
            {loading ? 'جاري الإرسال...' : 'أوافق على التسجيل'}
          </button>
          <button
            className="consent-button deny"
            onClick={() => handleConsent(false)}
            disabled={loading}
          >
            لا أوافق
          </button>
        </div>
      </div>

      {renderConsentsStatus()}
    </div>
  );
};

export default RecordingConsent;
