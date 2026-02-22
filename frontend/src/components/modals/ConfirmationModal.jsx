import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '../Accessibility/FocusTrap';
import { useAnimation } from '../../context/AnimationContext';
import { getModalAriaAttributes, getAriaLabel } from '../../utils/ariaHelpers';
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message, confirmText, cancelText, language }) => {
  // Focus trap for accessibility - Escape key closes modal
  const modalRef = useFocusTrap(isOpen, onClose);
  
  // Get animation variants
  const { variants, shouldAnimate } = useAnimation();

  if (!isOpen) return null;

  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const modalId = 'confirmation-modal';
  const messageId = `${modalId}-message`;

  // Get ARIA attributes for modal
  const modalAriaAttrs = getModalAriaAttributes({
    titleId: messageId,
    modal: true,
    language
  });

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
          onClick={onClose}
          aria-hidden="true"
        >
          <motion.div 
            ref={modalRef} 
            className="confirm-modal-content" 
            dir={dir}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={shouldAnimate ? variants.modalVariants.scaleIn : {}}
            onClick={(e) => e.stopPropagation()}
            {...modalAriaAttrs}
          >
            <p 
              id={messageId}
              className="confirm-modal-message" 
              dir={dir}
            >
              {message}
            </p>
            <div className={`confirm-modal-buttons ${!cancelText ? 'justify-center' : ''}`}>
              <button 
                onClick={onConfirm} 
                className={`confirm-modal-btn ${!cancelText ? 'w-full' : 'flex-1'}`}
                aria-label={confirmText || getAriaLabel('submit', language)}
              >
                {confirmText || 'Confirm'}
              </button>
              {cancelText && (
                <button 
                  onClick={onClose || (() => {})} 
                  className="confirm-modal-btn"
                  aria-label={cancelText || getAriaLabel('cancel', language)}
                >
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
