
import React from 'react';
import './Modal.css'; // Use the unified modal CSS

const AudioSettingsModal = ({ isOpen, onConfirm, language, t }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="modal-body">
          <h2 className="modal-title">{t.audioTitle}</h2>
        </div>
        <div className="modal-actions">
          <button onClick={() => onConfirm(true)} className="modal-confirm-btn">
            {t.yes}
          </button>
          <button onClick={() => onConfirm(false)} className="modal-cancel-btn">
            {t.no}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioSettingsModal;
