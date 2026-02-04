
import React from 'react';
import './Modal.css'; // Use the unified modal CSS

const LanguageConfirmModal = ({ isOpen, onConfirm, onCancel, language, t }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="modal-body">
          <p className="modal-description">{t.confirmLang}</p>
        </div>
        <div className="modal-actions">
          <button onClick={onConfirm} className="modal-confirm-btn">
            {t.ok}
          </button>
          <button onClick={onCancel} className="modal-cancel-btn">
            {t.no}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageConfirmModal;
