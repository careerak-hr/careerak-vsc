import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './ShareOnLinkedIn.css';

/**
 * مكون زر "Share on LinkedIn"
 * يسمح للمستخدم بمشاركة الشهادة على LinkedIn
 */
const ShareOnLinkedIn = ({ certificateId, certificateData }) => {
  const { language } = useApp();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // الترجمات
  const translations = {
    ar: {
      shareOnLinkedIn: 'مشاركة على LinkedIn',
      shareAsPost: 'مشاركة كمنشور',
      addToCertifications: 'إضافة إلى الشهادات',
      connecting: 'جاري الربط...',
      sharing: 'جاري المشاركة...',
      connectFirst: 'يجب ربط حساب LinkedIn أولاً',
      connectAccount: 'ربط حساب LinkedIn',
      sharedSuccessfully: 'تم المشاركة بنجاح على LinkedIn!',
      addedSuccessfully: 'تم إضافة الشهادة بنجاح!',
      errorOccurred: 'حدث خطأ أثناء المشاركة',
      viewPost: 'عرض المنشور',
      close: 'إغلاق',
      cancel: 'إلغاء',
      shareOptions: 'خيارات المشاركة'
    },
    en: {
      shareOnLinkedIn: 'Share on LinkedIn',
      shareAsPost: 'Share as Post',
      addToCertifications: 'Add to Certifications',
      connecting: 'Connecting...',
      sharing: 'Sharing...',
      connectFirst: 'Please connect your LinkedIn account first',
      connectAccount: 'Connect LinkedIn Account',
      sharedSuccessfully: 'Successfully shared on LinkedIn!',
      addedSuccessfully: 'Certificate added successfully!',
      errorOccurred: 'An error occurred while sharing',
      viewPost: 'View Post',
      close: 'Close',
      cancel: 'Cancel',
      shareOptions: 'Share Options'
    },
    fr: {
      shareOnLinkedIn: 'Partager sur LinkedIn',
      shareAsPost: 'Partager comme publication',
      addToCertifications: 'Ajouter aux certifications',
      connecting: 'Connexion...',
      sharing: 'Partage...',
      connectFirst: 'Veuillez d\'abord connecter votre compte LinkedIn',
      connectAccount: 'Connecter le compte LinkedIn',
      sharedSuccessfully: 'Partagé avec succès sur LinkedIn!',
      addedSuccessfully: 'Certificat ajouté avec succès!',
      errorOccurred: 'Une erreur s\'est produite lors du partage',
      viewPost: 'Voir la publication',
      close: 'Fermer',
      cancel: 'Annuler',
      shareOptions: 'Options de partage'
    }
  };

  const t = translations[language] || translations.ar;

  // التحقق من حالة ربط LinkedIn عند تحميل المكون
  useEffect(() => {
    checkLinkedInStatus();
  }, []);

  /**
   * التحقق من حالة ربط LinkedIn
   */
  const checkLinkedInStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/linkedin/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setIsConnected(data.isConnected);
        
        // إذا كان يحتاج إعادة مصادقة
        if (data.requiresReauth) {
          setError(t.connectFirst);
        }
      }
    } catch (error) {
      console.error('Error checking LinkedIn status:', error);
    }
  };

  /**
   * ربط حساب LinkedIn
   */
  const connectLinkedIn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/linkedin/auth-url', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // فتح نافذة OAuth
        window.location.href = data.authUrl;
      } else {
        setError(data.message || t.errorOccurred);
      }
    } catch (error) {
      console.error('Error connecting LinkedIn:', error);
      setError(t.errorOccurred);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * مشاركة الشهادة كمنشور
   */
  const shareAsPost = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      setShowOptions(false);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/linkedin/share-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ certificateId })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess({
          message: data.messageAr || data.message || t.sharedSuccessfully,
          postUrl: data.postUrl
        });
      } else {
        if (data.requiresAuth) {
          setError(t.connectFirst);
          setIsConnected(false);
        } else {
          setError(data.messageAr || data.message || t.errorOccurred);
        }
      }
    } catch (error) {
      console.error('Error sharing certificate:', error);
      setError(t.errorOccurred);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * إضافة الشهادة إلى قسم Certifications
   */
  const addToCertifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      setShowOptions(false);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/linkedin/add-certification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ certificateId })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess({
          message: data.messageAr || data.message || t.addedSuccessfully,
          postUrl: data.postUrl
        });
      } else {
        if (data.requiresAuth) {
          setError(t.connectFirst);
          setIsConnected(false);
        } else {
          setError(data.messageAr || data.message || t.errorOccurred);
        }
      }
    } catch (error) {
      console.error('Error adding certification:', error);
      setError(t.errorOccurred);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * عرض خيارات المشاركة
   */
  const handleShareClick = () => {
    if (!isConnected) {
      connectLinkedIn();
    } else {
      setShowOptions(true);
    }
  };

  return (
    <div className="share-on-linkedin">
      {/* زر المشاركة الرئيسي */}
      <button
        className="linkedin-share-button"
        onClick={handleShareClick}
        disabled={isLoading}
      >
        <svg className="linkedin-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        <span>
          {isLoading ? t.sharing : t.shareOnLinkedIn}
        </span>
      </button>

      {/* خيارات المشاركة */}
      {showOptions && (
        <div className="share-options-modal">
          <div className="share-options-content">
            <h3>{t.shareOptions}</h3>
            
            <div className="share-options-buttons">
              <button
                className="share-option-button"
                onClick={shareAsPost}
                disabled={isLoading}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                {t.shareAsPost}
              </button>

              <button
                className="share-option-button"
                onClick={addToCertifications}
                disabled={isLoading}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 16l-4-4 1.41-1.41L11 15.17l6.59-6.59L19 10l-8 8z"/>
                </svg>
                {t.addToCertifications}
              </button>
            </div>

            <button
              className="cancel-button"
              onClick={() => setShowOptions(false)}
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {/* رسالة النجاح */}
      {success && (
        <div className="success-message">
          <div className="success-content">
            <svg className="success-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
            <p>{success.message}</p>
            {success.postUrl && (
              <a
                href={success.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="view-post-link"
              >
                {t.viewPost}
              </a>
            )}
            <button
              className="close-button"
              onClick={() => setSuccess(null)}
            >
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* رسالة الخطأ */}
      {error && (
        <div className="error-message">
          <div className="error-content">
            <svg className="error-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p>{error}</p>
            {!isConnected && (
              <button
                className="connect-button"
                onClick={connectLinkedIn}
                disabled={isLoading}
              >
                {isLoading ? t.connecting : t.connectAccount}
              </button>
            )}
            <button
              className="close-button"
              onClick={() => setError(null)}
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareOnLinkedIn;
