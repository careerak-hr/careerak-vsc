import React from 'react';
import './AuthModals.css';

const AIAnalysisModal = ({ t, image, onAccept, onReject, isAnalyzing, analysisResult, userType, language }) => {
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  
  // رسائل مخصصة حسب نوع المستخدم
  const getExpectedImageType = () => {
    if (language === 'ar') {
      return userType === 'individual' ? 'صورة شخصية للوجه' : 'لوجو الشركة';
    } else if (language === 'fr') {
      return userType === 'individual' ? 'Photo de profil' : 'Logo de l\'entreprise';
    } else {
      return userType === 'individual' ? 'Personal face photo' : 'Company logo';
    }
  };
  
  const getAnalysisMessage = () => {
    if (isAnalyzing) {
      return t.aiAnalyzing || 'جاري التحليل الذكي...';
    }
    
    if (!analysisResult) {
      return t.aiComplete || 'اكتمل التحليل';
    }
    
    if (analysisResult.isValid) {
      if (language === 'ar') {
        return `✓ الصورة مناسبة ومطابقة للمعايير\n${analysisResult.reason}`;
      } else if (language === 'fr') {
        return `✓ Image appropriée et conforme\n${analysisResult.reason}`;
      } else {
        return `✓ Image is suitable and compliant\n${analysisResult.reason}`;
      }
    } else {
      if (language === 'ar') {
        return `⚠ ${analysisResult.reason}\nالمطلوب: ${getExpectedImageType()}`;
      } else if (language === 'fr') {
        return `⚠ ${analysisResult.reason}\nRequis: ${getExpectedImageType()}`;
      } else {
        return `⚠ ${analysisResult.reason}\nRequired: ${getExpectedImageType()}`;
      }
    }
  };
  
  const getConfidenceColor = () => {
    if (!analysisResult) return '#304B60';
    if (analysisResult.confidence >= 70) return '#2ecc71'; // أخضر
    if (analysisResult.confidence >= 50) return '#f39c12'; // برتقالي
    return '#e74c3c'; // أحمر
  };
  
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
              style={{
                filter: isAnalyzing ? 'blur(2px)' : 'none',
                transition: 'filter 0.3s ease'
              }}
            />
            {!isAnalyzing && analysisResult && (
              <div 
                className="ai-modal-check-mark"
                style={{
                  backgroundColor: analysisResult.isValid ? '#304B60' : '#e74c3c',
                  color: '#E3DAD1'
                }}
              >
                {analysisResult.isValid ? '✓' : '✗'}
              </div>
            )}
          </div>
        )}
        
        {!isAnalyzing && analysisResult && (
          <>
            <p className="ai-modal-message whitespace-pre-line">
              {getAnalysisMessage()}
            </p>
            
            {analysisResult.confidence > 0 && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-[#304B60]">
                    {language === 'ar' ? 'مستوى الثقة' : language === 'fr' ? 'Niveau de confiance' : 'Confidence Level'}
                  </span>
                  <span className="text-sm font-black" style={{ color: getConfidenceColor() }}>
                    {analysisResult.confidence}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${analysisResult.confidence}%`,
                      backgroundColor: getConfidenceColor()
                    }}
                  ></div>
                </div>
              </div>
            )}
          </>
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
