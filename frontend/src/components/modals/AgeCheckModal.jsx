import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '../Accessibility/FocusTrap';
import { useAnimation } from '../../context/AnimationContext';
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

  // Focus trap for accessibility - Escape key closes modal
  // Note: AgeCheckModal doesn't have onClose, but user must make a choice
  const modalRef = useFocusTrap(true);
  
  // Get animation variants
  const { variants, shouldAnimate } = useAnimation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="auth-modal-backdrop" 
        dir={dir} 
        style={fontStyle}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={shouldAnimate ? variants.modalVariants.backdrop : {}}
      >
        <motion.div 
          ref={modalRef} 
          className="auth-modal-content" 
          dir={dir} 
          style={fontStyle}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={shouldAnimate ? variants.modalVariants.scaleIn : {}}
        >
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AgeCheckModal;
