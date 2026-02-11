import React, { useRef, useCallback, useState } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './CropModal.css';

const CropModal = ({ t, image, crop, setCrop, onCropComplete, onSave, onClose }) => {
  const imgRef = useRef();
  const [completedCrop, setCompletedCrop] = useState(null);
  
  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    const size = Math.min(width, height);
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

  const handleSave = () => {
    if (completedCrop && completedCrop.width && completedCrop.height) {
      onSave();
    } else {
      console.warn('⚠️ No valid crop area selected');
    }
  };

  return (
    <div className="crop-modal-backdrop">
      <div className="crop-modal-content">
        <h3 className="crop-modal-title">{t.cropTitle || 'قص الصورة'}</h3>
        <p className="crop-modal-subtitle">{t.cropSubtitle || 'اسحب لتحديد المنطقة المطلوبة'}</p>
        
        {image && (
          <div className="crop-modal-image-container">
            <ReactCrop 
              crop={crop} 
              onChange={handleCropChange}
              onComplete={handleCropComplete}
              aspect={1} 
              circularCrop={true}
              minWidth={100}
              minHeight={100}
            >
              <img 
                ref={imgRef} 
                src={image}
                onLoad={onImageLoad} 
                alt="Crop preview" 
                style={{ maxHeight: '60vh', maxWidth: '100%' }}
              />
            </ReactCrop>
          </div>
        )}
        
        <div className="crop-modal-buttons-container">
          <button 
            onClick={onClose} 
            className="crop-modal-btn crop-modal-btn-secondary"
          >
            {t.cancel || 'إلغاء'}
          </button>
          <button 
            onClick={handleSave} 
            className="crop-modal-btn crop-modal-btn-primary"
            disabled={!completedCrop || !completedCrop.width}
          >
            {t.done || 'تم'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropModal;
