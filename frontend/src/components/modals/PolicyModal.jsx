import React, { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useFocusTrap } from '../Accessibility/FocusTrap';
import { useAnimation } from '../../context/AnimationContext';

// Lazy load PolicyPage for better performance
const PolicyPage = React.lazy(() => import('../../pages/13_PolicyPage.jsx'));

const PolicyModal = ({ onClose, onAgree }) => {
  const { language } = useApp();
  const isRTL = language === 'ar';
  const fontFamily = language === 'ar' 
    ? 'Amiri, Cairo, serif' 
    : language === 'fr' 
      ? 'EB Garamond, serif' 
      : 'Cormorant Garamond, serif';

  const fontStyle = {
    fontFamily: fontFamily,
    fontWeight: 'inherit',
    fontStyle: 'inherit'
  };

  const titles = {
    ar: { title: 'سياسة الخصوصية', agree: 'موافق', close: 'إغلاق' },
    en: { title: 'Privacy Policy', agree: 'Agree', close: 'Close' },
    fr: { title: 'Politique de Confidentialité', agree: 'Accepter', close: 'Fermer' }
  };

  const t = titles[language] || titles.ar;

  // Focus trap for accessibility - Escape key closes modal
  const modalRef = useFocusTrap(true, onClose);
  
  // Get animation variants
  const { variants, shouldAnimate } = useAnimation();

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 transition-all duration-300" 
        dir={isRTL ? 'rtl' : 'ltr'}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={shouldAnimate ? variants.modalVariants.backdrop : {}}
      >
        <motion.div 
          ref={modalRef} 
          className="bg-[#E3DAD1] dark:bg-[#2d2d2d] rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border-4 border-[#304B60] dark:border-[#D48161] overflow-hidden transition-all duration-300"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={shouldAnimate ? variants.modalVariants.scaleIn : {}}
        >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-[#304B60]/10 dark:border-[#D48161]/20 bg-[#E3DAD1] dark:bg-[#2d2d2d] flex-shrink-0 transition-all duration-300">
          <h2 className="text-2xl font-black text-[#304B60] dark:text-[#e0e0e0] transition-colors duration-300" style={fontStyle}>{t.title}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#304B60] dark:bg-[#D48161] text-[#E3DAD1] dark:text-[#1a1a1a] flex items-center justify-center hover:bg-[#D48161] dark:hover:bg-[#c97151] transition-all duration-300"
            aria-label={language === 'ar' ? 'إغلاق' : language === 'fr' ? 'Fermer' : 'Close'}
            style={fontStyle}
          >
            ✕
          </button>
        </div>
        
        {/* Scrollable Content - Improved */}
        <div 
          className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#304B60] dark:scrollbar-thumb-[#D48161] scrollbar-track-[#E3DAD1] dark:scrollbar-track-[#1a1a1a] transition-all duration-300"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            ...fontStyle
          }}
        >
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60] dark:border-[#D48161]"></div>
            </div>
          }>
            <PolicyPage isModal={true} />
          </Suspense>
        </div>
        
        {/* Footer - Fixed */}
        <div className="flex gap-4 p-6 border-t border-[#304B60]/10 dark:border-[#D48161]/20 bg-[#E3DAD1] dark:bg-[#2d2d2d] flex-shrink-0 transition-all duration-300">
          <button
            onClick={onAgree}
            className="flex-1 bg-[#304B60] dark:bg-[#D48161] text-[#D48161] dark:text-[#1a1a1a] py-3 rounded-2xl font-black hover:bg-[#D48161] dark:hover:bg-[#c97151] hover:text-[#304B60] dark:hover:text-[#1a1a1a] transition-all duration-300"
            style={fontStyle}
          >
            {t.agree}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-[#E3DAD1] dark:bg-[#1a1a1a] text-[#304B60] dark:text-[#e0e0e0] py-3 rounded-2xl font-black border-2 border-[#304B60]/20 dark:border-[#D48161]/50 hover:border-[#304B60] dark:hover:border-[#D48161] transition-all duration-300"
            style={fontStyle}
          >
            {t.close}
          </button>
        </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PolicyModal;
