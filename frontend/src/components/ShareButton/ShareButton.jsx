import React, { useState } from 'react';
import { FaShare } from 'react-icons/fa';
import ShareModal from '../ShareModal/ShareModal';
import './ShareButton.css';

const ShareButton = ({ job, variant = 'default', size = 'medium', className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        className={`share-button share-button-${variant} share-button-${size} ${className}`}
        onClick={handleClick}
        aria-label="مشاركة الوظيفة"
        title="مشاركة"
      >
        <FaShare className="share-button-icon" />
        {variant !== 'icon-only' && (
          <span className="share-button-text">مشاركة</span>
        )}
      </button>

      <ShareModal
        isOpen={isModalOpen}
        onClose={handleClose}
        job={job}
      />
    </>
  );
};

export default ShareButton;
