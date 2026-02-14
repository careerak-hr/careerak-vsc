import React, { useRef, useCallback, useState, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './CropModal.css';

const CropModal = ({ t, image, crop, setCrop, onCropComplete, onSave, onClose, language }) => {
  const imgRef = useRef();
  const containerRef = useRef();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [scale, setScale] = useState(1);
  const [touchDistance, setTouchDistance] = useState(0);
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
  
  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    const size = Math.min(width, height) * 0.8; // 80% من أصغر بعد
    const x = (width - size) / 2;
    const y = (height - size) / 2;

    const initialCrop = {
      unit: 'px',
      x,
      y,
      width: size,
      height: size
    };

    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  }, [setCrop]);

  const handleCropChange = (newCrop) => {
    setCrop(newCrop);
  };

  const handleCropComplete = (crop, pixelCrop) => {
    setCompletedCrop(pixelCrop);
    if (onCropComplete) {
      onCropComplete(crop, pixelCrop);
    }
  };

  // دعم Zoom بالأصابع (Pinch to Zoom)
  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      setTouchDistance(distance);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && touchDistance > 0) {
      e.preventDefault();
      const newDistance = getTouchDistance(e.touches);
      const scaleChange = newDistance / touchDistance;
      const newScale = Math.min(Math.max(scale * scaleChange, 0.5), 3);
      setScale(newScale);
      setTouchDistance(newDistance);
    }
  };

  const handleTouchEnd = () => {
    setTouchDistance(0);
  };

  // دعم Zoom بالماوس (Mouse Wheel)
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(scale + delta, 0.5), 3);
    setScale(newScale);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd);
      container.addEventListener('wheel', handleWheel, { passive: false });
      
      return () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, [scale, touchDistance]);

  const handleSave = () => {
    if (completedCrop && completedCrop.width && completedCrop.height) {
      onSave();
    } else {
      console.warn('⚠️ No valid crop area selected');
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1);
  };

  return (
    <div className="crop-modal-backdrop" dir={dir}>
      <div 
        className="crop-modal-content" 
        dir={dir}
        style={{
          border: '4px solid #304B60',
          backgroundColor: '#E3DAD1',
          borderRadius: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          ...fontStyle
        }}
      >
        <h3 
          className="crop-modal-title"
          style={{ color: '#304B60', ...fontStyle }}
        >
          {language === 'ar' ? '✂️ قص الصورة' :
           language === 'fr' ? '✂️ Recadrer l\'image' :
           '✂️ Crop Image'}
        </h3>
        <p 
          className="crop-modal-subtitle"
          style={{ color: '#304B60', opacity: 0.8, ...fontStyle }}
        >
          {language === 'ar' ? 'اسحب لتحديد المنطقة • استخدم إصبعين للتكبير/التصغير' :
           language === 'fr' ? 'Faites glisser pour sélectionner • Pincez pour zoomer' :
           'Drag to select area • Pinch to zoom'}
        </p>
        
        {image && (
          <div 
            ref={containerRef}
            className="crop-modal-image-container"
            style={{ 
              overflow: 'hidden',
              position: 'relative',
              touchAction: 'none',
              border: '2px solid #304B60',
              borderRadius: '0.75rem'
            }}
          >
            <ReactCrop 
              crop={crop} 
              onChange={handleCropChange}
              onComplete={handleCropComplete}
              aspect={1} 
              circularCrop={true}
              minWidth={100}
              minHeight={100}
              style={{
                maxHeight: '60vh',
                maxWidth: '100%'
              }}
            >
              <img 
                ref={imgRef} 
                src={image}
                onLoad={onImageLoad} 
                alt="Crop preview" 
                style={{ 
                  maxHeight: '60vh', 
                  maxWidth: '100%',
                  transform: `scale(${scale})`,
                  transformOrigin: 'center',
                  transition: 'transform 0.1s ease-out'
                }}
              />
            </ReactCrop>
          </div>
        )}
        
        {/* أزرار التحكم بالزووم */}
        <div 
          className="flex justify-center items-center gap-3 my-3"
          style={{ ...fontStyle }}
        >
          <button
            onClick={handleZoomOut}
            className="crop-zoom-btn"
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
            className="text-sm font-bold"
            style={{ color: '#304B60', minWidth: '60px', textAlign: 'center', ...fontStyle }}
          >
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="crop-zoom-btn"
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
            onClick={handleResetZoom}
            className="text-xs"
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
        
        <div className="crop-modal-buttons-container">
          <button 
            onClick={onClose} 
            className="crop-modal-btn crop-modal-btn-secondary"
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
            className="crop-modal-btn crop-modal-btn-primary"
            disabled={!completedCrop || !completedCrop.width}
            style={{
              backgroundColor: '#304B60',
              color: '#E3DAD1',
              border: '2px solid #304B60',
              opacity: (!completedCrop || !completedCrop.width) ? 0.5 : 1,
              ...fontStyle
            }}
          >
            {language === 'ar' ? '✓ تم' : language === 'fr' ? '✓ Terminé' : '✓ Done'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropModal;
