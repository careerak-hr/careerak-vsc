import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '../Accessibility/FocusTrap';
import { useAnimation } from '../../context/AnimationContext';
import './AuthModals.css';

const GoodbyeModal = ({ t, onConfirm, language }) => {
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  
  // Focus trap for accessibility - Escape key closes modal
  // Note: GoodbyeModal requires user to click OK, no Escape close
  const modalRef = useFocusTrap(true);
  
  // Get animation variants
  const { variants, shouldAnimate } = useAnimation();
  
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
          className="auth-modal-content" 
          dir={dir}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={shouldAnimate ? variants.modalVariants.scaleIn : {}}
        >
        <p className="auth-modal-message">{t.sorryMessage}</p>
        <button
          onClick={onConfirm}
          className="auth-modal-btn auth-modal-btn-primary py-4 px-8"
        >
          {t.goodbye}
        </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GoodbyeModal;
