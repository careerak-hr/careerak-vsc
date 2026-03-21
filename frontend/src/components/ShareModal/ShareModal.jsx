import React, { useState, useRef, useEffect } from 'react';
import {
  FaWhatsapp, FaLinkedin, FaTwitter, FaFacebook,
  FaLink, FaTimes, FaShare, FaTelegram, FaEnvelope,
  FaCommentDots,
} from 'react-icons/fa';
import { useApp } from '../../context/AppContext';
import ContactSelector from '../ContactSelector/ContactSelector';
import ShareFeedbackWidget from '../ShareFeedback/ShareFeedbackWidget';
import {
  createShareData,
  shareViaFacebook,
  shareViaTwitter,
  shareViaLinkedIn,
  shareViaWhatsApp,
  shareViaTelegram,
  shareViaEmail,
  copyShareLink,
  shouldUseNativeShare,
  isIOSSafari,
  isAndroidChrome,
  trackShare,
} from '../../utils/shareUtils';
import './ShareModal.css';

const translations = {
  ar: {
    title: 'مشاركة',
    copyLink: 'نسخ الرابط',
    copied: 'تم النسخ!',
    whatsapp: 'واتساب',
    linkedin: 'لينكدإن',
    twitter: 'تويتر',
    facebook: 'فيسبوك',
    telegram: 'تيليغرام',
    email: 'البريد الإلكتروني',
    chat: 'مشاركة عبر المحادثة',
    more: 'المزيد من الخيارات',
    success: 'تم نسخ الرابط بنجاح',
    copyFailed: 'تعذّر النسخ التلقائي. انسخ الرابط يدوياً:',
    error: 'فشل في المشاركة، يرجى المحاولة مجدداً',
  },
  en: {
    title: 'Share',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    whatsapp: 'WhatsApp',
    linkedin: 'LinkedIn',
    twitter: 'Twitter',
    facebook: 'Facebook',
    telegram: 'Telegram',
    email: 'Email',
    chat: 'Share via Chat',
    more: 'More options',
    success: 'Link copied successfully',
    copyFailed: 'Auto-copy failed. Copy the link manually:',
    error: 'Share failed, please try again',
  },
  fr: {
    title: 'Partager',
    copyLink: 'Copier le lien',
    copied: 'Copié !',
    whatsapp: 'WhatsApp',
    linkedin: 'LinkedIn',
    twitter: 'Twitter',
    facebook: 'Facebook',
    telegram: 'Telegram',
    email: 'E-mail',
    chat: 'Partager via Chat',
    more: "Plus d'options",
    success: 'Lien copié avec succès',
    copyFailed: 'Copie automatique échouée. Copiez le lien manuellement :',
    error: 'Échec du partage, veuillez réessayer',
  },
};

const ShareModal = ({ isOpen, onClose, content, contentType = 'job', job, token }) => {
  const [copied, setCopied] = useState(false);
  const [copyFallbackUrl, setCopyFallbackUrl] = useState(null);
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastShareMethod, setLastShareMethod] = useState(null);
  const { language } = useApp();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Backward compatibility
  const resolvedContent = content || job;
  const resolvedContentType = content ? contentType : 'job';

  const t = translations[language] || translations.ar;
  const isRTL = language === 'ar';

  // Auto-trigger native share on mobile when modal opens.
  // NOTE: On iOS Safari, navigator.share() MUST be called directly from a user
  // gesture handler. Calling it from useEffect (which runs asynchronously after
  // render) will be blocked by iOS Safari's user gesture requirement.
  // Therefore, we do NOT auto-trigger here for iOS Safari — the user must tap
  // the "More options" button or the share button directly.
  //
  // Android Chrome: navigator.share() is supported since Chrome 61 and does NOT
  // have the same user-gesture restriction from useEffect. Auto-trigger works
  // correctly on Android Chrome.
  React.useEffect(() => {
    if (!isOpen || !resolvedContent) return;
    // Skip auto-trigger on iOS Safari — it blocks navigator.share() from useEffect
    if (isIOSSafari()) return;
    if (!shouldUseNativeShare()) return;

    const shareData = createShareData(resolvedContent, resolvedContentType);
    navigator.share(shareData)
      .then(() => onClose?.())
      .catch((err) => {
        if (err.name !== 'AbortError') console.error('Native share failed:', err);
      });
  }, [isOpen, resolvedContent, resolvedContentType]);

  if (!isOpen || !resolvedContent) return null;

  const shareData = createShareData(resolvedContent, resolvedContentType);
  const contentTitle = shareData.title;
  const contentUrl = shareData.url;

  // Req 12: Copy link with fallback for manual copy
  const handleCopyLink = async () => {
    setCopyFallbackUrl(null);
    const result = await copyShareLink(resolvedContent, resolvedContentType);
    if (result.success) {
      setCopied(true);
      setLastShareMethod('copy_link');
      setTimeout(() => {
        if (isMountedRef.current) {
          setCopied(false);
          setShowFeedback(true);
        }
      }, 1500);
    } else {
      // Req 12.5: show link for manual copying when clipboard access fails
      setCopyFallbackUrl(result.url);
    }
  };

  // Req 9: WhatsApp - mobile deep link vs desktop web
  const handleWhatsApp = () => {
    shareViaWhatsApp(resolvedContent, resolvedContentType);
    setLastShareMethod('whatsapp');
    setShowFeedback(true);
  };

  // Req 8: LinkedIn with UTM params
  const handleLinkedIn = () => {
    shareViaLinkedIn(resolvedContent, resolvedContentType);
    setLastShareMethod('linkedin');
    setShowFeedback(true);
  };

  // Req 7: Twitter with 280 char limit + hashtags + UTM
  const handleTwitter = () => {
    shareViaTwitter(resolvedContent, resolvedContentType);
    setLastShareMethod('twitter');
    setShowFeedback(true);
  };

  // Req 6: Facebook with UTM params
  const handleFacebook = () => {
    shareViaFacebook(resolvedContent, resolvedContentType);
    setLastShareMethod('facebook');
    setShowFeedback(true);
  };

  // Req 10: Telegram with UTM params
  const handleTelegram = () => {
    shareViaTelegram(resolvedContent, resolvedContentType);
    setLastShareMethod('telegram');
    setShowFeedback(true);
  };

  // Req 11: Email with UTM params + call-to-action
  const handleEmail = () => {
    shareViaEmail(resolvedContent, resolvedContentType);
    setLastShareMethod('email');
    setShowFeedback(true);
  };

  // Req 5: Internal chat share
  const handleChat = () => {
    setShowContactSelector(true);
  };

  const handleNativeShare = async () => {
    // This is called directly from a button click — safe for iOS Safari user gesture requirement
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        const id = resolvedContent?._id || resolvedContent?.id;
        if (id) trackShare(id, 'native', resolvedContentType);
        onClose();
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Share failed:', err);
      }
    }
  };

  return (
    <>
      <div className="share-modal-overlay" onClick={onClose} />
      <div
        className="share-modal"
        dir={isRTL ? 'rtl' : 'ltr'}
        role="dialog"
        aria-modal="true"
        aria-label={t.title}
      >
        {showFeedback ? (
          <ShareFeedbackWidget
            contentType={resolvedContentType}
            contentId={resolvedContent?._id || resolvedContent?.id}
            shareMethod={lastShareMethod}
            onClose={onClose}
            token={token}
          />
        ) : showContactSelector ? (
          <ContactSelector
            content={resolvedContent}
            contentType={resolvedContentType}
            onClose={() => setShowContactSelector(false)}
            onSent={onClose}
          />
        ) : (
          <>
            {/* Header */}
            <div className="share-modal-header">
              <h3 className="share-modal-title">
                <FaShare className="share-modal-icon" />
                {t.title}
              </h3>
              <button className="share-modal-close" onClick={onClose} aria-label="إغلاق">
                <FaTimes />
              </button>
            </div>

            {/* Content Info */}
            <div className="share-modal-content-info">
              <h4 className="share-modal-content-title">{contentTitle}</h4>
            </div>

            {/* Share Options Grid */}
            <div className="share-modal-options">
              <button
                className="share-option share-option-copy"
                onClick={handleCopyLink}
                disabled={copied}
              >
                <FaLink className="share-option-icon" />
                <span className="share-option-text">{copied ? t.copied : t.copyLink}</span>
              </button>

              <button className="share-option share-option-whatsapp" onClick={handleWhatsApp}>
                <FaWhatsapp className="share-option-icon" />
                <span className="share-option-text">{t.whatsapp}</span>
              </button>

              <button className="share-option share-option-linkedin" onClick={handleLinkedIn}>
                <FaLinkedin className="share-option-icon" />
                <span className="share-option-text">{t.linkedin}</span>
              </button>

              <button className="share-option share-option-twitter" onClick={handleTwitter}>
                <FaTwitter className="share-option-icon" />
                <span className="share-option-text">{t.twitter}</span>
              </button>

              <button className="share-option share-option-facebook" onClick={handleFacebook}>
                <FaFacebook className="share-option-icon" />
                <span className="share-option-text">{t.facebook}</span>
              </button>

              <button className="share-option share-option-telegram" onClick={handleTelegram}>
                <FaTelegram className="share-option-icon" />
                <span className="share-option-text">{t.telegram}</span>
              </button>

              <button className="share-option share-option-email" onClick={handleEmail}>
                <FaEnvelope className="share-option-icon" />
                <span className="share-option-text">{t.email}</span>
              </button>

              <button className="share-option share-option-chat" onClick={handleChat}>
                <FaCommentDots className="share-option-icon" />
                <span className="share-option-text">{t.chat}</span>
              </button>
            </div>

            {/* Native Share */}
            {navigator.share && (
              <button className="share-modal-native" onClick={handleNativeShare}>
                <FaShare />
                <span>{t.more}</span>
              </button>
            )}

            {/* Success Message */}
            {copied && (
              <div className="share-modal-success">✓ {t.success}</div>
            )}

            {/* Req 12.5: Clipboard fallback - show link for manual copy */}
            {copyFallbackUrl && (
              <div className="share-modal-copy-fallback">
                <p className="share-modal-copy-fallback-label">{t.copyFailed}</p>
                <input
                  className="share-modal-copy-fallback-input"
                  type="text"
                  readOnly
                  value={copyFallbackUrl}
                  onFocus={(e) => e.target.select()}
                  dir="ltr"
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ShareModal;
