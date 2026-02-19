
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '../Accessibility/FocusTrap';
import { useAnimation } from '../../context/AnimationContext';
import './Modal.css'; // Use the unified modal CSS

const LanguageConfirmModal = ({ isOpen, onConfirm, onCancel, language, t }) => {
  // Focus trap for accessibility - Escape key closes modal
  const modalRef = useFocusTrap(isOpen, onCancel);
  
  // Get animation variants
  const { variants, shouldAnimate } = useAnimation();

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
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div 
          className="modal-backdrop" 
          dir={dir} 
          style={fontStyle}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={shouldAnimate ? variants.modalVariants.backdrop : {}}
        >
          <motion.div 
            ref={modalRef} 
            className="modal-content" 
            dir={dir} 
            style={fontStyle}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={shouldAnimate ? variants.modalVariants.scaleIn : {}}
          >
        <div className="modal-body" style={fontStyle}>
          <h2 className="modal-title" style={fontStyle}>{t.confirmLangTitle}</h2>
          <p className="modal-description" style={fontStyle}>{t.confirmLangDesc}</p>
        </div>
        <div className="modal-actions" style={fontStyle}>
          <button onClick={onConfirm} className="modal-confirm-btn" style={fontStyle}>
            {t.ok}
          </button>
          <button onClick={onCancel} className="modal-cancel-btn" style={fontStyle}>
            {t.no}
          </button>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LanguageConfirmModal;
