import React from 'react';
import './AuthModals.css';

const GoodbyeModal = ({ t, onConfirm, language }) => {
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  
  return (
    <div className="auth-modal-backdrop" dir={dir}>
      <div className="auth-modal-content" dir={dir}>
        <p className="auth-modal-message">{t.sorryMessage}</p>
        <button
          onClick={onConfirm}
          className="auth-modal-btn auth-modal-btn-primary py-4 px-8"
        >
          {t.goodbye}
        </button>
      </div>
    </div>
  );
};

export default GoodbyeModal;
