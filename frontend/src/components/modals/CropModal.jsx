import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';
import { useFocusTrap } from '../Accessibility/FocusTrap';
import { useAnimation } from '../../context/AnimationContext';
import './CropModal.css';

const CropModal = ({ t, image, crop, setCrop, onCropComplete, onSave, onClose, language }) => {
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
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

  // دالة تُستدعى عند تغيير منطقة القص
  const onCropChange = (location) => {
    setCrop(location);
  };

  // دالة تُستدعى عند اكتمال القص
  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    console.log('✂️ Crop completed:', croppedAreaPixels);
    setCroppedAreaPixels(croppedAreaPixels);
    if (onCropComplete) {
      onCropComplete(croppedArea, croppedAreaPixels);
    }
  }, [onCropComplete]);

  // دالة الحفظ
  const handleSave = () => {
    if (croppedAreaPixels) {
      console.log('💾 Saving crop with pixels:', croppedAreaPixels);
      onSave();
    } else {
      console.warn('⚠️ No valid crop area selected');
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="crop-modal-backdrop" 
        dir={dir}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={shouldAnimate ? variants.modalVariants.backdrop : {}}
      >
        <motion.div 
          ref={modalRef}
          className="crop-modal-content dark:bg-[#2d2d2d] dark:border-[#D48161] transition-all duration-300" 
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
          className="crop-modal-title dark:text-[#e0e0e0] transition-colors duration-300"
          style={{ color: '#304B60', ...fontStyle }}
        >
          {language === 'ar' ? '✂️ قص الصورة' :
           language === 'fr' ? '✂️ Recadrer l\'image' :
           '✂️ Crop Image'}
        </h3>
        <p 
          className="crop-modal-subtitle dark:text-[#e0e0e0]/80 transition-colors duration-300"
          style={{ color: '#304B60', opacity: 0.8, ...fontStyle }}
        >
          {language === 'ar' ? 'اسحب لتحديد المنطقة • استخدم إصبعين للتكبير/التصغير' :
           language === 'fr' ? 'Faites glisser pour sélectionner • Pincez pour zoomer' :
           'Drag to select area • Pinch to zoom'}
        </p>
        
        {/* منطقة القص */}
        <div 
          className="crop-modal-image-container dark:border-[#D48161] transition-all duration-300"
          style={{ 
            position: 'relative',
            width: '100%',
            height: '400px',
            backgroundColor: '#000',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            border: '2px solid #304B60'
          }}
        >
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteHandler}
            style={{
              containerStyle: {
                width: '100%',
                height: '100%',
                backgroundColor: '#000'
              }
            }}
          />
        </div>
        
        {/* أزرار التحكم بالزووم */}
        <div 
          className="flex justify-center items-center gap-3 my-4"
          style={{ ...fontStyle }}
        >
          <button
            onClick={() => setZoom(Math.max(1, zoom - 0.1))}
            className="crop-zoom-btn dark:bg-[#D48161] dark:text-[#1a1a1a] transition-all duration-300"
            aria-label={language === 'ar' ? 'تصغير' : language === 'fr' ? 'Dézoomer' : 'Zoom out'}
            style={{
              backgroundColor: '#304B60',
              color: '#E3DAD1',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              ...fontStyle
            }}
          >
            −
          </button>
          <span 
            className="text-sm font-bold dark:text-[#e0e0e0] transition-colors duration-300"
            style={{ color: '#304B60', minWidth: '60px', textAlign: 'center', ...fontStyle }}
            aria-live="polite"
          >
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.1))}
            className="crop-zoom-btn dark:bg-[#D48161] dark:text-[#1a1a1a] transition-all duration-300"
            aria-label={language === 'ar' ? 'تكبير' : language === 'fr' ? 'Zoomer' : 'Zoom in'}
            style={{
              backgroundColor: '#304B60',
              color: '#E3DAD1',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              ...fontStyle
            }}
          >
            +
          </button>
          <button
            onClick={() => setZoom(1)}
            className="text-xs dark:bg-[#c97151] transition-all duration-300"
            aria-label={language === 'ar' ? 'إعادة تعيين التكبير' : language === 'fr' ? 'Réinitialiser le zoom' : 'Reset zoom'}
            style={{
              backgroundColor: '#D48161',
              color: '#FFFFFF',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              ...fontStyle
            }}
          >
            {language === 'ar' ? 'إعادة' : language === 'fr' ? 'Réinitialiser' : 'Reset'}
          </button>
        </div>
        
        {/* أزرار الحفظ والإلغاء */}
        <div className="crop-modal-buttons-container">
          <button 
            onClick={onClose} 
            className="crop-modal-btn crop-modal-btn-secondary dark:bg-[#1a1a1a] dark:text-[#e0e0e0] dark:border-[#D48161] transition-all duration-300"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#304B60',
              border: '2px solid #304B60',
              ...fontStyle
            }}
          >
            {language === 'ar' ? 'إلغاء' : language === 'fr' ? 'Annuler' : 'Cancel'}
          </button>
          <button 
            onClick={handleSave} 
            className="crop-modal-btn crop-modal-btn-primary dark:bg-[#D48161] dark:text-[#1a1a1a] dark:border-[#D48161] transition-all duration-300"
            disabled={!croppedAreaPixels}
            style={{
              backgroundColor: '#304B60',
              color: '#E3DAD1',
              border: '2px solid #304B60',
              opacity: !croppedAreaPixels ? 0.5 : 1,
              cursor: !croppedAreaPixels ? 'not-allowed' : 'pointer',
              ...fontStyle
            }}
          >
            {language === 'ar' ? '✓ تم' : language === 'fr' ? '✓ Terminé' : '✓ Done'}
          </button>
        </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CropModal;
