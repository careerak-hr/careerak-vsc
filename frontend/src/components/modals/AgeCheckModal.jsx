import React from 'react';
import './AuthModals.css';

const AgeCheckModal = ({ t, onResponse, language }) => {
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
    <div className="auth-modal-backdrop" dir={dir} style={fontStyle}>
      <div className="auth-modal-content" dir={dir} style={fontStyle}>
        <h2 className="auth-modal-title" style={fontStyle}>{t.ageCheckTitle}</h2>
        <p className="auth-modal-message" style={fontStyle}>{t.ageCheckMessage}</p>
        <div className="auth-modal-buttons" style={fontStyle}>
          <button
            onClick={() => onResponse(true)}
            className="auth-modal-btn auth-modal-btn-primary"
            style={fontStyle}
          >
            {t.above18}
          </button>
          <button
            onClick={() => onResponse(false)}
            className="auth-modal-btn auth-modal-btn-danger"
            style={fontStyle}
          >
            {t.below18}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgeCheckModal;
