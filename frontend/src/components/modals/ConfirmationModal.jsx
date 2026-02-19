import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '../Accessibility/FocusTrap';
import { useAnimation } from '../../context/AnimationContext';
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message, confirmText, cancelText, language }) => {
  // Focus trap for accessibility - Escape key closes modal
  const modalRef = useFocusTrap(isOpen, onClose);
  
  // Get animation variants
  const { variants, shouldAnimate } = useAnimation();

  if (!isOpen) return null;

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div 
          className="confirm-modal-backdrop" 
          dir={dir}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={shouldAnimate ? variants.modalVariants.backdrop : {}}
        >
          <motion.div 
            ref={modalRef} 
            className="confirm-modal-content" 
            dir={dir}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={shouldAnimate ? variants.modalVariants.scaleIn : {}}
          >
        <p className="confirm-modal-message" dir={dir}>
          {message}
        </p>
        <div className={`confirm-modal-buttons ${!cancelText ? 'justify-center' : ''}`}>
          <button onClick={onConfirm} className={`confirm-modal-btn ${!cancelText ? 'w-full' : 'flex-1'}`}>
            {confirmText || 'Confirm'}
          </button>
          {cancelText && (
            <button onClick={onClose || (() => {})} className="confirm-modal-btn">
              {cancelText}
            </button>
          )}
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
