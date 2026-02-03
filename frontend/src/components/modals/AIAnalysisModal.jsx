import React from 'react';
import './AuthModals.css';

const AIAnalysisModal = ({ t, image, onAccept, onReject, isAnalyzing }) => {
  return (
    <div className="auth-modal-backdrop">
      <div className="auth-modal-content">
        <h3 className="text-xl font-black text-[#304B60] mb-4">{t.aiAnalyzing}</h3>
        <div className="ai-modal-spinner"></div>
        {image && (
          <img
            src={image}
            alt="Analyzing"
            className="ai-modal-img"
          />
        )}
        <div className="auth-modal-buttons">
          <button
            onClick={onAccept}
            disabled={isAnalyzing}
            className="ai-modal-btn auth-modal-btn-primary"
          >
            {t.done}
          </button>
          <button
            onClick={onReject}
            disabled={isAnalyzing}
            className="ai-modal-btn auth-modal-btn-danger"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisModal;
