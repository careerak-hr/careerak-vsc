
import React from 'react';
import './Modal.css'; // Use the unified modal CSS

const AudioSettingsModal = ({ isOpen, onConfirm, language, t }) => {
  if (!isOpen) return null;

  // Use the correct translation keys from the t object with fallbacks
  const texts = {
    title: t?.audioTitle || "Enable Audio?",
    confirm: t?.yes || "Yes",
    deny: t?.no || "No",
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="modal-backdrop" dir={dir}>
      <div className="modal-content" dir={dir}>
        <div className="modal-body">
          <h2 className="modal-title">{texts.title}</h2>
        </div>
        <div className="modal-actions">
          <button onClick={() => onConfirm(true)} className="modal-confirm-btn">
            {texts.confirm}
          </button>
          <button onClick={() => onConfirm(false)} className="modal-cancel-btn">
            {texts.deny}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioSettingsModal;
