import React, { useState, useEffect } from 'react';
import './LinkedInPostPreview.css';

/**
 * مكون معاينة منشور LinkedIn قبل النشر
 * يعرض كيف سيظهر المنشور على LinkedIn مع نصائح لتحسين مدى الوصول
 */
const LinkedInPostPreview = ({ certificateId, token, onShare, onClose }) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (certificateId && token) {
      fetchPreview();
    }
  }, [certificateId, token]);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/linkedin/preview-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ certificateId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.messageAr || data.message || 'فشل في تحميل المعاينة');
      }

      setPreview(data.preview);
    } catch (err) {
      console.error('Error fetching preview:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (onShare) {
      setSharing(true);
      try {
        await onShare(certificateId);
      } catch (err) {
        console.error('Error sharing:', err);
      } finally {
        setSharing(false);
      }
    }
  };

  const getReachLevelColor = (level) => {
    switch (level) {
      case 'high': return '#10b981'; // green
      case 'medium': return '#f59e0b'; // orange
      case 'low': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  const getReachLevelText = (level) => {
    switch (level) {
      case 'high': return 'مرتفع';
      case 'medium': return 'متوسط';
      case 'low': return 'منخفض';
      default: return 'غير معروف';
    }
  };

  if (loading) {
    return (
      <div className="linkedin-preview-modal">
        <div className="linkedin-preview-content">
          <div className="preview-loading">
            <div className="spinner"></div>
            <p>جاري تحميل المعاينة...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="linkedin-preview-modal">
        <div className="linkedin-preview-content">
          <div className="preview-error">
            <p className="error-message">{error}</p>
            <button onClick={onClose} className="btn-close">إغلاق</button>
          </div>
        </div>
      </div>
    );
  }

  if (!preview) {
    return null;
  }

  return (
    <div className="linkedin-preview-modal" onClick={onClose}>
      <div className="linkedin-preview-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="preview-header">
          <h2>معاينة المنشور على LinkedIn</h2>
          <button onClick={onClose} className="btn-close-icon">×</button>
        </div>

        {/* LinkedIn Post Preview */}
        <div className="linkedin-post-preview">
          {/* User Info */}
          <div className="post-user-info">
            <div className="user-avatar">
              {preview.user.profilePicture ? (
                <img src={preview.user.profilePicture} alt={preview.user.name} />
              ) : (
                <div className="avatar-placeholder">{preview.user.name.charAt(0)}</div>
              )}
            </div>
            <div className="user-details">
              <h3>{preview.user.name}</h3>
              <p>الآن • 🌐</p>
            </div>
          </div>

          {/* Post Text */}
          <div className="post-text">
            {preview.text.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>

          {/* Certificate Card (if course has thumbnail) */}
          {preview.course && preview.course.thumbnail && (
            <div className="post-certificate-card">
              <img src={preview.course.thumbnail} alt={preview.certificate.courseName} />
              <div className="certificate-card-info">
                <h4>{preview.certificate.courseName}</h4>
                <p>Careerak</p>
              </div>
            </div>
          )}

          {/* Post Actions */}
          <div className="post-actions">
            <button className="post-action-btn">
              <span>👍</span> إعجاب
            </button>
            <button className="post-action-btn">
              <span>💬</span> تعليق
            </button>
            <button className="post-action-btn">
              <span>🔄</span> إعادة نشر
            </button>
            <button className="post-action-btn">
              <span>📤</span> إرسال
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="preview-metadata">
          <div className="metadata-item">
            <span className="metadata-label">عدد الأحرف:</span>
            <span className="metadata-value">{preview.metadata.characterCount}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">رابط التحقق:</span>
            <span className="metadata-value">
              {preview.metadata.hasVerificationUrl ? '✅ موجود' : '❌ غير موجود'}
            </span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">QR Code:</span>
            <span className="metadata-value">
              {preview.metadata.hasQRCode ? '✅ موجود' : '❌ غير موجود'}
            </span>
          </div>
        </div>

        {/* Estimated Reach */}
        <div className="preview-reach">
          <h3>مدى الوصول المتوقع</h3>
          <div className="reach-level" style={{ color: getReachLevelColor(preview.metadata.estimatedReach.level) }}>
            <span className="reach-icon">📊</span>
            <span className="reach-text">{getReachLevelText(preview.metadata.estimatedReach.level)}</span>
          </div>
          <div className="reach-details">
            <div className="reach-detail">
              <span>الهاشتاجات:</span>
              <span>{preview.metadata.estimatedReach.hashtags}</span>
            </div>
            <div className="reach-detail">
              <span>الروابط:</span>
              <span>{preview.metadata.estimatedReach.links}</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        {preview.metadata.estimatedReach.tips && preview.metadata.estimatedReach.tips.length > 0 && (
          <div className="preview-tips">
            <h3>💡 نصائح لتحسين مدى الوصول</h3>
            <ul>
              {preview.metadata.estimatedReach.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="preview-actions">
          <button onClick={onClose} className="btn-cancel">إلغاء</button>
          <button 
            onClick={handleShare} 
            className="btn-share"
            disabled={sharing}
          >
            {sharing ? 'جاري النشر...' : 'نشر على LinkedIn'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkedInPostPreview;
