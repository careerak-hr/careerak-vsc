import React, { useState } from 'react';
import { FaWhatsapp, FaLinkedin, FaTwitter, FaFacebook, FaLink, FaTimes, FaShare } from 'react-icons/fa';
import './ShareModal.css';

const ShareModal = ({ isOpen, onClose, job }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !job) return null;

  // بناء رابط الوظيفة
  const jobUrl = `${window.location.origin}/jobs/${job._id}`;
  const jobTitle = job.title || 'وظيفة';
  const companyName = job.company?.name || 'شركة';
  const shareText = `${jobTitle} في ${companyName}`;

  // نسخ الرابط
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(jobUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback للمتصفحات القديمة
      const textArea = document.createElement('textarea');
      textArea.value = jobUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1500);
    }
  };

  // مشاركة على WhatsApp
  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + jobUrl)}`;
    window.open(whatsappUrl, '_blank', 'width=600,height=400');
    onClose();
  };

  // مشاركة على LinkedIn
  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=400');
    onClose();
  };

  // مشاركة على Twitter
  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(jobUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    onClose();
  };

  // مشاركة على Facebook
  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    onClose();
  };

  // Web Share API (للأجهزة المحمولة)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: jobTitle,
          text: shareText,
          url: jobUrl
        });
        onClose();
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="share-modal-overlay" onClick={onClose} />
      
      {/* Modal */}
      <div className="share-modal">
        {/* Header */}
        <div className="share-modal-header">
          <h3 className="share-modal-title">
            <FaShare className="share-modal-icon" />
            مشاركة الوظيفة
          </h3>
          <button 
            className="share-modal-close"
            onClick={onClose}
            aria-label="إغلاق"
          >
            <FaTimes />
          </button>
        </div>

        {/* Job Info */}
        <div className="share-modal-job-info">
          <h4 className="share-modal-job-title">{jobTitle}</h4>
          <p className="share-modal-job-company">{companyName}</p>
        </div>

        {/* Share Options */}
        <div className="share-modal-options">
          {/* نسخ الرابط */}
          <button
            className="share-option share-option-copy"
            onClick={handleCopyLink}
            disabled={copied}
          >
            <FaLink className="share-option-icon" />
            <span className="share-option-text">
              {copied ? 'تم النسخ!' : 'نسخ الرابط'}
            </span>
          </button>

          {/* WhatsApp */}
          <button
            className="share-option share-option-whatsapp"
            onClick={handleWhatsAppShare}
          >
            <FaWhatsapp className="share-option-icon" />
            <span className="share-option-text">WhatsApp</span>
          </button>

          {/* LinkedIn */}
          <button
            className="share-option share-option-linkedin"
            onClick={handleLinkedInShare}
          >
            <FaLinkedin className="share-option-icon" />
            <span className="share-option-text">LinkedIn</span>
          </button>

          {/* Twitter */}
          <button
            className="share-option share-option-twitter"
            onClick={handleTwitterShare}
          >
            <FaTwitter className="share-option-icon" />
            <span className="share-option-text">Twitter</span>
          </button>

          {/* Facebook */}
          <button
            className="share-option share-option-facebook"
            onClick={handleFacebookShare}
          >
            <FaFacebook className="share-option-icon" />
            <span className="share-option-text">Facebook</span>
          </button>
        </div>

        {/* Native Share (للموبايل) */}
        {navigator.share && (
          <button
            className="share-modal-native"
            onClick={handleNativeShare}
          >
            <FaShare />
            <span>المزيد من الخيارات</span>
          </button>
        )}

        {/* رسالة النجاح */}
        {copied && (
          <div className="share-modal-success">
            ✓ تم نسخ الرابط بنجاح
          </div>
        )}
      </div>
    </>
  );
};

export default ShareModal;
