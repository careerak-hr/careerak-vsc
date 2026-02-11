import React from 'react';
import './AuthModals.css';

const AIAnalysisModal = ({ t, image, onAccept, onReject, isAnalyzing, language }) => {
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  
  return (
    <div className="auth-modal-backdrop" dir={dir}>
      <div className="auth-modal-content" dir={dir}>
        <h3 className="text-xl font-black text-[#304B60] mb-4">
          {isAnalyzing ? (t.aiAnalyzing || 'جاري التحليل الذكي...') : (t.aiComplete || 'اكتمل التحليل')}
        </h3>
        
        {isAnalyzing && (
          <div className="ai-modal-spinner"></div>
        )}
        
        {image && (
          <div className="ai-modal-image-wrapper">
            <img
              src={image}
              alt="AI Analysis Preview"
              className="ai-modal-img"
            />
            {!isAnalyzing && (
              <div className="ai-modal-check-mark">✓</div>
            )}
          </div>
        )}
        
        {!isAnalyzing && (
          <p className="ai-modal-message">
            {t.aiSuccess || 'الصورة مناسبة ومطابقة للمعايير'}
          </p>
        )}
        
        <div className="auth-modal-buttons">
          <button
            onClick={onAccept}
            disabled={isAnalyzing}
            className="ai-modal-btn auth-modal-btn-primary"
          >
            {t.accept || 'قبول'}
          </button>
          <button
            onClick={onReject}
            disabled={isAnalyzing}
            className="ai-modal-btn auth-modal-btn-danger"
          >
            {t.reject || 'رفض'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisModal;
