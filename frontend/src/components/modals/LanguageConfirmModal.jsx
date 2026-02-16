
import React from 'react';
import './Modal.css'; // Use the unified modal CSS

const LanguageConfirmModal = ({ isOpen, onConfirm, onCancel, language, t }) => {
  if (!isOpen) return null;

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
      <div className="modal-content" dir={dir} style={fontStyle}>
        <div className="modal-body" style={fontStyle}>
          <h2 className="modal-title" style={fontStyle}>{t.title}</h2>
          <p className="modal-description" style={fontStyle}>{t.confirmLang}</p>
        </div>
        <div className="modal-actions" style={fontStyle}>
          <button onClick={onConfirm} className="modal-confirm-btn" style={fontStyle}>
            {t.ok}
          </button>
          <button onClick={onCancel} className="modal-cancel-btn" style={fontStyle}>
            {t.no}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageConfirmModal;
