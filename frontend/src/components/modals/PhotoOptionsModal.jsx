import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '../Accessibility/FocusTrap';
import { useAnimation } from '../../context/AnimationContext';
import './PhotoOptionsModal.css';

const PhotoOptionsModal = ({ t, onSelectFromGallery, onTakePhoto, onClose, language = 'ar' }) => {
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
  const modalRef = useFocusTrap(true, onClose);
  
  // Get animation variants
  const { variants, shouldAnimate } = useAnimation();
  
  const handleGalleryClick = () => {
    console.log('📱 User selected gallery option');
    onSelectFromGallery();
  };

  const handleCameraClick = () => {
    console.log('📷 User selected camera option');
    onTakePhoto();
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="photo-options-backdrop" 
        dir={dir}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={shouldAnimate ? variants.modalVariants.backdrop : {}}
      >
        <motion.div 
          ref={modalRef}
          className="photo-options-content dark:bg-[#2d2d2d] dark:border-[#D48161] transition-all duration-300"
          style={{
            border: '4px solid #304B60',
            backgroundColor: '#E3DAD1',
            borderRadius: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '2rem',
            ...fontStyle
          }}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={shouldAnimate ? variants.modalVariants.scaleIn : {}}
        >
        <h3 
          className="photo-options-title dark:text-[#e0e0e0] transition-colors duration-300"
          style={{ 
            color: '#304B60', 
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            ...fontStyle
          }}
        >
          {language === 'ar' ? '📸 رفع الصورة' :
           language === 'fr' ? '📸 Télécharger une photo' :
           '📸 Upload Photo'}
        </h3>
        <div className="photo-options-buttons-container">
          <button 
            onClick={handleGalleryClick} 
            className="photo-options-btn dark:bg-[#D48161] dark:text-[#1a1a1a] dark:border-[#D48161] transition-all duration-300"
            style={{
              backgroundColor: '#304B60',
              color: '#E3DAD1',
              border: '2px solid #304B60',
              padding: '1rem 1.5rem',
              borderRadius: '0.75rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '0.75rem',
              width: '100%',
              ...fontStyle
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#D48161';
              e.target.style.borderColor = '#D48161';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#304B60';
              e.target.style.borderColor = '#304B60';
            }}
          >
            🖼️ {language === 'ar' ? 'اختر من المعرض' :
                 language === 'fr' ? 'Choisir de la galerie' :
                 'Choose from Gallery'}
          </button>
          <button 
            onClick={handleCameraClick} 
            className="photo-options-btn dark:bg-[#D48161] dark:text-[#1a1a1a] dark:border-[#D48161] transition-all duration-300"
            style={{
              backgroundColor: '#304B60',
              color: '#E3DAD1',
              border: '2px solid #304B60',
              padding: '1rem 1.5rem',
              borderRadius: '0.75rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '0.75rem',
              width: '100%',
              ...fontStyle
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#D48161';
              e.target.style.borderColor = '#D48161';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#304B60';
              e.target.style.borderColor = '#304B60';
            }}
          >
            📷 {language === 'ar' ? 'التقط صورة' :
                 language === 'fr' ? 'Prendre une photo' :
                 'Take Photo'}
          </button>
          <button 
            onClick={onClose} 
            className="photo-options-cancel-btn dark:bg-[#1a1a1a] dark:text-[#e0e0e0] dark:border-[#D48161] transition-all duration-300"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#304B60',
              border: '2px solid #304B60',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
              ...fontStyle
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#F5F0E8';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#FFFFFF';
            }}
          >
            {language === 'ar' ? 'إلغاء' :
             language === 'fr' ? 'Annuler' :
             'Cancel'}
          </button>
        </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PhotoOptionsModal;
