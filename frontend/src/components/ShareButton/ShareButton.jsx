import React, { useState } from 'react';
import { FaShare } from 'react-icons/fa';
import ShareModal from '../ShareModal/ShareModal';
import { useApp } from '../../context/AppContext';
import './ShareButton.css';

// i18n translations for share button
const translations = {
  ar: { button: 'مشاركة' },
  en: { button: 'Share' },
  fr: { button: 'Partager' },
};

const ShareButton = ({
  content,
  contentType = 'job',
  job, // legacy prop
  variant = 'default',
  size = 'medium',
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { language } = useApp();

  // Backward compatibility: if job prop is passed, treat it as content with contentType='job'
  const resolvedContent = content || job;
  const resolvedContentType = content ? contentType : 'job';

  const t = translations[language] || translations.ar;

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
        aria-label={t.button}
        title={t.button}
      >
        <FaShare className="share-button-icon" />
        {variant !== 'icon-only' && (
          <span className="share-button-text">{t.button}</span>
        )}
      </button>

      <ShareModal
        isOpen={isModalOpen}
        onClose={handleClose}
        content={resolvedContent}
        contentType={resolvedContentType}
      />
    </>
  );
};

export default ShareButton;
