import React, { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { 
  shareJob, 
  getJobUrl,
  isNativeShareSupported 
} from '../../utils/shareUtils';
import { useApp } from '../../context/AppContext';
import './ShareButton.css';

// أيقونات المنصات (SVG inline للأداء)
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

/**
 * Modal مشاركة الوظيفة
 * يعرض خيارات المشاركة المختلفة
 * 
 * @param {Object} props
 * @param {Object} props.job - بيانات الوظيفة
 * @param {Function} props.onShare - callback عند المشاركة
 * @param {Function} props.onClose - callback عند الإغلاق
 */
const ShareModal = ({ job, onShare, onClose }) => {
  const { language } = useApp();
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const jobUrl = getJobUrl(job.id);

  // إغلاق عند الضغط على Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // منع scroll في الخلفية
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleShare = async (platform) => {
    if (isSharing) return;

    setIsSharing(true);

    try {
      if (platform === 'copy') {
        const success = await shareJob(job, 'copy');
        if (success) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          onShare?.('copy');
        }
      } else {
        await shareJob(job, platform);
        onShare?.(platform);
        // إغلاق Modal بعد المشاركة (ما عدا النسخ)
        setTimeout(() => onClose(), 300);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const shareOptions = [
    {
      id: 'copy',
      name: language === 'ar' ? 'نسخ الرابط' : 'Copy Link',
      icon: copied ? <Check size={24} /> : <Copy size={24} />,
      color: '#6B7280',
      action: () => handleShare('copy')
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: <WhatsAppIcon />,
      color: '#25D366',
      action: () => handleShare('whatsapp')
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <LinkedInIcon />,
      color: '#0A66C2',
      action: () => handleShare('linkedin')
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: <TwitterIcon />,
      color: '#000000',
      action: () => handleShare('twitter')
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <FacebookIcon />,
      color: '#1877F2',
      action: () => handleShare('facebook')
    }
  ];

  // إضافة خيار المشاركة الأصلي للموبايل
  if (isNativeShareSupported() && window.innerWidth <= 768) {
    shareOptions.unshift({
      id: 'native',
      name: language === 'ar' ? 'مشاركة' : 'Share',
      icon: <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
      </svg>,
      color: '#304B60',
      action: () => handleShare('native')
    });
  }

  return (
    <div 
      className="share-modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div className="share-modal">
        {/* Header */}
        <div className="share-modal-header">
          <h3 id="share-modal-title" className="share-modal-title">
            {language === 'ar' ? 'مشاركة الوظيفة' : 'Share Job'}
          </h3>
          <button
            className="share-modal-close"
            onClick={onClose}
            aria-label={language === 'ar' ? 'إغلاق' : 'Close'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Job Info */}
        <div className="share-modal-job-info">
          <h4 className="share-modal-job-title">{job.title}</h4>
          <p className="share-modal-job-company">{job.company?.name}</p>
        </div>

        {/* Share Options */}
        <div className="share-modal-options">
          {shareOptions.map((option) => (
            <button
              key={option.id}
              className={`share-option ${copied && option.id === 'copy' ? 'share-option-copied' : ''}`}
              onClick={option.action}
              disabled={isSharing}
              style={{ '--option-color': option.color }}
            >
              <div className="share-option-icon" style={{ color: option.color }}>
                {option.icon}
              </div>
              <span className="share-option-name">{option.name}</span>
            </button>
          ))}
        </div>

        {/* URL Display */}
        <div className="share-modal-url">
          <input
            type="text"
            value={jobUrl}
            readOnly
            className="share-modal-url-input"
            onClick={(e) => e.target.select()}
          />
        </div>

        {/* Success Message */}
        {copied && (
          <div className="share-modal-success">
            <Check size={16} />
            <span>{language === 'ar' ? 'تم نسخ الرابط!' : 'Link copied!'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
