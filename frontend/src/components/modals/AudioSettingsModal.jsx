import React from 'react';
import './LanguageConfirmModal.css';

const AudioSettingsModal = ({ isOpen, onConfirm, language, t }) => {
  if (!isOpen) return null;

  return (
    <div className="lang-confirm-modal-backdrop">
      <div className="lang-confirm-modal-content">
        <p className="lang-confirm-modal-text" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t.audioTitle}
        </p>
        <div className="lang-confirm-modal-buttons">
          <button onClick={() => onConfirm(true)} className="lang-confirm-modal-btn">
            {t.yes}
          </button>
          <button onClick={() => onConfirm(false)} className="lang-confirm-modal-btn">
            {t.no}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioSettingsModal;
