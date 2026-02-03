import React from 'react';
import './AuthModals.css';

const AgeCheckModal = ({ t, onResponse }) => {
  return (
    <div className="auth-modal-backdrop">
      <div className="auth-modal-content">
        <h2 className="auth-modal-title">{t.ageCheckTitle}</h2>
        <p className="auth-modal-message">{t.ageCheckMessage}</p>
        <div className="auth-modal-buttons">
          <button
            onClick={() => onResponse(true)}
            className="auth-modal-btn auth-modal-btn-primary"
          >
            {t.above18}
          </button>
          <button
            onClick={() => onResponse(false)}
            className="auth-modal-btn auth-modal-btn-danger"
          >
            {t.below18}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgeCheckModal;
