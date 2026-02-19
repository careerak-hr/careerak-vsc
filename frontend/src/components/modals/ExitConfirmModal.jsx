import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useFocusTrap } from '../Accessibility/FocusTrap';
import { useAnimation } from '../../context/AnimationContext';

// ✅ إضافة الأنيميشن في head مباشرة
if (typeof document !== 'undefined') {
  const styleId = 'exit-modal-animations';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes scaleIn {
        from { 
          opacity: 0;
          transform: scale(0.9) translateZ(0);
        }
        to { 
          opacity: 1;
          transform: scale(1) translateZ(0);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

const ExitConfirmModal = ({ isOpen, onConfirm, onCancel }) => {
  const { language } = useApp();

  //ترجمات
  const translations = {
    ar: {
      title: 'تأكيد الخروج',
      message: 'هل حقاً تريد الخروج من التطبيق؟',
      yes: 'نعم',
      no: 'لا'
    },
    en: {
      title: 'Confirm Exit',
      message: 'Do you really want to exit the application?',
      yes: 'Yes',
      no: 'No'
    },
    fr: {
      title: 'Confirmer la sortie',
      message: 'Voulez-vous vraiment quitter l\'application?',
      yes: 'Oui',
      no: 'Non'
    }
  };

  const t = translations[language] || translations.ar;
  const isRTL = language === 'ar';

  // الخطوط حسب اللغة
  const fontFamily = language === 'ar' 
    ? 'Amiri, Cairo, serif' 
    : language === 'en' 
    ? 'Cormorant Garamond, serif' 
    : 'EB Garamond, serif';

  const fontStyle = {
    fontFamily: fontFamily,
    fontWeight: 'inherit',
    fontStyle: 'inherit'
  };

  // Focus trap for accessibility - Escape key closes modal
  const modalRef = useFocusTrap(isOpen, onCancel);
  
  // Get animation variants
  const { variants, shouldAnimate } = useAnimation();

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-all duration-300"
          onClick={onCancel}
          dir={isRTL ? 'rtl' : 'ltr'}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={shouldAnimate ? variants.modalVariants.backdrop : {}}
        >
          <motion.div 
            ref={modalRef}
            className="bg-secondary dark:bg-[#2d2d2d] rounded-3xl shadow-2xl w-[90%] max-w-md mx-4 overflow-hidden border-4 border-[#304B60] dark:border-[#D48161] transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={shouldAnimate ? variants.modalVariants.scaleIn : {}}
          >
        {/* المحتوى */}
        <div className="p-8 text-center">
          {/* العنوان */}
          <h2 
            className="text-2xl font-black text-primary dark:text-[#e0e0e0] mb-4 transition-colors duration-300"
            style={fontStyle}
          >
            {t.title}
          </h2>

          {/* الرسالة */}
          <p 
            className="text-lg font-bold text-primary/80 dark:text-[#e0e0e0]/90 mb-8 transition-colors duration-300"
            style={fontStyle}
          >
            {t.message}
          </p>

          {/* الأزرار */}
          <div className="flex gap-4">
            {/* زر لا */}
            <button
              onClick={onCancel}
              className="flex-1 py-4 rounded-2xl font-black text-lg transition-all shadow-lg bg-secondary-light dark:bg-[#1a1a1a] text-primary dark:text-[#e0e0e0] border-2 border-accent hover:bg-accent dark:hover:bg-[#3d3d3d] hover:text-secondary dark:hover:text-[#e0e0e0] active:scale-95 duration-300"
              style={fontStyle}
            >
              {t.no}
            </button>

            {/* زر نعم */}
            <button
              onClick={onConfirm}
              className="flex-1 py-4 rounded-2xl font-black text-lg transition-all shadow-lg bg-primary dark:bg-accent text-accent dark:text-[#1a1a1a] hover:bg-primary/90 dark:hover:bg-[#c97151] active:scale-95 duration-300"
              style={fontStyle}
            >
              {t.yes}
            </button>
          </div>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExitConfirmModal;
