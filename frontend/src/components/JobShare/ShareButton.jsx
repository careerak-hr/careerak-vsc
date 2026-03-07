import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import ShareModal from './ShareModal';
import { shareJob, isNativeShareSupported } from '../../utils/shareUtils';
import './ShareButton.css';

/**
 * زر مشاركة الوظيفة
 * يعرض زر مشاركة وعند النقر يفتح modal أو يستخدم Web Share API
 * 
 * @param {Object} props
 * @param {Object} props.job - بيانات الوظيفة
 * @param {string} props.size - حجم الزر (small, medium, large)
 * @param {string} props.variant - نوع الزر (icon, text, both)
 * @param {string} props.className - CSS classes إضافية
 * @param {Function} props.onShare - callback عند المشاركة (اختياري)
 */
const ShareButton = ({ 
  job, 
  size = 'medium',
  variant = 'icon',
  className = '',
  onShare
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleClick = async (e) => {
    e.stopPropagation();
    
    // إذا كان الجهاز يدعم Web Share API، استخدمه مباشرة
    if (isNativeShareSupported() && window.innerWidth <= 768) {
      setIsSharing(true);
      const success = await shareJob(job, 'native');
      setIsSharing(false);
      
      if (success) {
        onShare?.('native');
        return;
      }
    }
    
    // وإلا افتح Modal
    setShowModal(true);
  };

  const handleModalShare = (platform) => {
    onShare?.(platform);
    setShowModal(false);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  // تحديد CSS classes حسب الحجم والنوع
  const sizeClass = `share-button-${size}`;
  const variantClass = `share-button-${variant}`;

  return (
    <>
      <button
        className={`share-button ${sizeClass} ${variantClass} ${className}`}
        onClick={handleClick}
        disabled={isSharing}
        aria-label="مشاركة الوظيفة"
        title="مشاركة"
      >
        <Share2 
          size={size === 'small' ? 16 : size === 'large' ? 22 : 18} 
          className={isSharing ? 'share-icon-spinning' : ''}
        />
        {(variant === 'text' || variant === 'both') && (
          <span className="share-button-text">مشاركة</span>
        )}
      </button>

      {showModal && (
        <ShareModal
          job={job}
          onShare={handleModalShare}
          onClose={handleModalClose}
        />
      )}
    </>
  );
};

export default ShareButton;
