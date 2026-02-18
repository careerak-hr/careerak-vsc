
import React from 'react';
import { useFocusTrap } from '../Accessibility/FocusTrap';
import './Modal.css'; // Use the unified modal CSS

const AudioSettingsModal = ({ isOpen, onConfirm, language, t }) => {
  // Focus trap for accessibility - Escape key closes modal
  const modalRef = useFocusTrap(isOpen, () => onConfirm(false));

  if (!isOpen) return null;

  // Use the correct translation keys from the t object
  const texts = {
    title: t?.audioTitle || "Enable Audio?",
    description: t?.audioDesc || "Enable audio and music in the app?",
    confirm: t?.yes || "Yes",
    deny: t?.no || "No",
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const fontFamily = language === 'ar' 
    ? "Amiri, Cairo, serif" 
    : language === 'fr' 
      ? "EB Garamond, serif" 
      : "Cormorant Garamond, serif";

  // Create inline style object
  const fontStyle = {
    fontFamily: fontFamily,
    fontWeight: 'inherit',
    fontStyle: 'inherit'
  };

  return (
    <div className="modal-backdrop" dir={dir} style={fontStyle}>
      <div ref={modalRef} className="modal-content" dir={dir} style={fontStyle}>
        <div className="modal-body" style={fontStyle}>
          <h2 className="modal-title" style={fontStyle}>{texts.title}</h2>
          <p className="modal-description" style={fontStyle}>{texts.description}</p>
        </div>
        <div className="modal-actions" style={fontStyle}>
          <button onClick={() => onConfirm(true)} className="modal-confirm-btn" style={fontStyle}>
            {texts.confirm}
          </button>
          <button onClick={() => onConfirm(false)} className="modal-cancel-btn" style={fontStyle}>
            {texts.deny}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioSettingsModal;
