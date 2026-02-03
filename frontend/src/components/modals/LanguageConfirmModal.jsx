import React from 'react';
import './LanguageConfirmModal.css';

const LanguageConfirmModal = ({ isOpen, onClose, onConfirm, onCancel, language, t }) => {
  if (!isOpen) return null;

  return (
    <div className="lang-confirm-modal-backdrop">
      <div className="lang-confirm-modal-content">
        <p className="lang-confirm-modal-text" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t.confirmLang}
        </p>
        <div className="lang-confirm-modal-buttons">
          <button onClick={onConfirm} className="lang-confirm-modal-btn">
            {t.ok}
          </button>
          <button onClick={onCancel} className="lang-confirm-modal-btn">
            {t.no}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageConfirmModal;
