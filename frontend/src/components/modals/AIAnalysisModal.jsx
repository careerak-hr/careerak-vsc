import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '../Accessibility/FocusTrap';
import { useAnimation } from '../../context/AnimationContext';
import './AuthModals.css';

const AIAnalysisModal = ({ t, image, onAccept, onReject, isAnalyzing, analysisResult, userType, language }) => {
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  
  // الخطوط حسب اللغة
  const fontFamily = language === 'ar' ? 'Amiri, Cairo, serif' : 
                     language === 'fr' ? 'EB Garamond, serif' : 
                     'Cormorant Garamond, serif';
  
  const fontStyle = {
    fontFamily: fontFamily,
    fontWeight: 'inherit',
    fontStyle: 'inherit'
  };

  // Focus trap for accessibility - Escape key closes modal
  // Note: AIAnalysisModal auto-closes, no manual close needed
  const modalRef = useFocusTrap(true);
  
  // Get animation variants
  const { variants, shouldAnimate } = useAnimation();
  
  // رسائل مخصصة حسب نوع المستخدم
  const getExpectedImageType = () => {
    if (language === 'ar') {
      return userType === 'individual' ? 'صورة شخصية' : 'لوجو شركة';
    } else if (language === 'fr') {
      return userType === 'individual' ? 'Photo personnelle' : 'Logo d\'entreprise';
    } else {
      return userType === 'individual' ? 'Personal photo' : 'Company logo';
    }
  };
  
  const getAnalyzingMessage = () => {
    if (language === 'ar') {
      return '🤖 جاري التحليل الذكي للصورة...';
    } else if (language === 'fr') {
      return '🤖 Analyse intelligente en cours...';
    } else {
      return '🤖 AI analysis in progress...';
    }
  };
  
  const getAnalysisMessage = () => {
    if (!analysisResult) return '';
    
    if (analysisResult.isValid) {
      if (language === 'ar') {
        return `✓ ${analysisResult.reason}`;
      } else if (language === 'fr') {
        return `✓ ${analysisResult.reason}`;
      } else {
        return `✓ ${analysisResult.reason}`;
      }
    } else {
      return analysisResult.reason;
    }
  };
  
  const getConfidenceColor = () => {
    if (!analysisResult) return '#304B60';
    if (analysisResult.confidence >= 70) return '#2ecc71';
    if (analysisResult.confidence >= 50) return '#f39c12';
    return '#e74c3c';
  };
  
  // إذا كانت الصورة غير صالحة، نرفضها تلقائياً بعد 2 ثانية
  React.useEffect(() => {
    if (!isAnalyzing && analysisResult && !analysisResult.isValid) {
      const timer = setTimeout(() => {
        onReject();
      }, 2500);
      return () => clearTimeout(timer);
    } else if (!isAnalyzing && analysisResult && analysisResult.isValid) {
      // إذا كانت صالحة، نقبلها تلقائياً بعد 1.5 ثانية
      const timer = setTimeout(() => {
        onAccept();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAnalyzing, analysisResult, onReject, onAccept]);
  
  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="auth-modal-backdrop" 
        dir={dir}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={shouldAnimate ? variants.modalVariants.backdrop : {}}
      >
        <motion.div 
          ref={modalRef}
          className="auth-modal-content dark:bg-[#2d2d2d] dark:border-[#D48161] transition-all duration-300" 
          dir={dir}
          style={{
            border: '4px solid #304B60',
            backgroundColor: '#E3DAD1',
            borderRadius: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            ...fontStyle
          }}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={shouldAnimate ? variants.modalVariants.scaleIn : {}}
        >
        <h3 
          className="text-xl font-black mb-4 dark:text-[#e0e0e0] transition-colors duration-300"
          style={{ color: '#304B60', ...fontStyle }}
        >
          {isAnalyzing ? getAnalyzingMessage() : (
            language === 'ar' ? '✓ اكتمل التحليل' :
            language === 'fr' ? '✓ Analyse terminée' :
            '✓ Analysis Complete'
          )}
        </h3>
        
        {isAnalyzing && (
          <div className="ai-modal-spinner"></div>
        )}
        
        {image && (
          <div className="ai-modal-image-wrapper">
            <img
              src={image}
              alt="Your uploaded photo being analyzed by AI for suitability"
              className="ai-modal-img dark:border-[#D48161] transition-all duration-300"
              style={{
                filter: isAnalyzing ? 'blur(2px)' : 'none',
                transition: 'filter 0.3s ease',
                border: '3px solid #304B60'
              }}
            />
            {!isAnalyzing && analysisResult && (
              <div 
                className="ai-modal-check-mark dark:bg-[#D48161] dark:text-[#1a1a1a] transition-all duration-300"
                style={{
                  backgroundColor: analysisResult.isValid ? '#2ecc71' : '#e74c3c',
                  color: '#FFFFFF',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              >
                {analysisResult.isValid ? '✓' : '✗'}
              </div>
            )}
          </div>
        )}
        
        {!isAnalyzing && analysisResult && (
          <>
            <p 
              className="ai-modal-message whitespace-pre-line dark:text-[#e0e0e0] transition-colors duration-300"
              style={{ 
                color: analysisResult.isValid ? '#304B60' : '#e74c3c',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                ...fontStyle
              }}
            >
              {getAnalysisMessage()}
            </p>
            
            {analysisResult.confidence > 0 && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span 
                    className="text-sm font-bold dark:text-[#e0e0e0] transition-colors duration-300"
                    style={{ color: '#304B60', ...fontStyle }}
                  >
                    {language === 'ar' ? 'مستوى الثقة' : 
                     language === 'fr' ? 'Niveau de confiance' : 
                     'Confidence Level'}
                  </span>
                  <span 
                    className="text-sm font-black transition-colors duration-300" 
                    style={{ color: getConfidenceColor(), ...fontStyle }}
                  >
                    {analysisResult.confidence}%
                  </span>
                </div>
                <div 
                  className="w-full rounded-full h-2 dark:bg-[#1a1a1a] transition-colors duration-300"
                  style={{ backgroundColor: '#D4C5B9' }}
                >
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
            
            {!analysisResult.isValid && (
              <p 
                className="text-sm mt-3 dark:text-[#e0e0e0]/80 transition-colors duration-300"
                style={{ color: '#304B60', opacity: 0.8, ...fontStyle }}
              >
                {language === 'ar' ? 'يرجى اختيار صورة أخرى...' :
                 language === 'fr' ? 'Veuillez choisir une autre image...' :
                 'Please choose another image...'}
              </p>
            )}
          </>
        )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIAnalysisModal;
