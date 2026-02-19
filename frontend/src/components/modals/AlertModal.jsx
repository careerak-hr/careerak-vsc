import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '../Accessibility/FocusTrap';
import { useAnimation } from '../../context/AnimationContext';
import AriaLiveRegion from '../Accessibility/AriaLiveRegion';

const AlertModal = ({ isOpen, onClose, message, language, t }) => {
  // Focus trap for accessibility - Escape key closes modal
  const modalRef = useFocusTrap(isOpen, onClose);
  
  // Get animation variants
  const { variants, shouldAnimate } = useAnimation();

  if (!isOpen) return null;

  return (
    <>
      {/* Announce alert to screen readers */}
      <AriaLiveRegion 
        message={message} 
        politeness="assertive"
        role="alert"
      />
      
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div 
            className="fixed inset-0 bg-[#304B60]/40 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 z-[1000] transition-all duration-300"
            role="dialog"
            aria-modal="true"
            aria-labelledby="alert-message"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={shouldAnimate ? variants.modalVariants.backdrop : {}}
          >
            <motion.div 
              ref={modalRef} 
              className="bg-[#E3DAD1] dark:bg-[#2d2d2d] p-8 rounded-[2.5rem] shadow-2xl text-center max-w-sm border-4 border-[#304B60] dark:border-[#D48161] animate-in fade-in zoom-in duration-300 transition-all"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={shouldAnimate ? variants.modalVariants.scaleIn : {}}
            >
          <p 
            id="alert-message"
            className="text-[#304B60] dark:text-[#e0e0e0] font-bold text-lg mb-6 leading-relaxed transition-colors duration-300" 
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
            {message}
          </p>
          <button 
            onClick={onClose} 
            className="w-full py-3 bg-[#304B60] dark:bg-[#D48161] text-[#E3DAD1] dark:text-[#1a1a1a] rounded-2xl font-bold shadow-lg border-2 border-[#304B60] dark:border-[#D48161] hover:scale-105 transition-all text-lg duration-300"
            aria-label={t?.ok || 'OK'}
          >
            {t?.ok || 'OK'}
          </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AlertModal;