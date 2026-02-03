import React, { useRef, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './CropModal.css';

const CropModal = ({ t, image, crop, setCrop, onCropComplete, onSave, onClose }) => {
  const imgRef = useRef();
  
  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    const size = Math.min(width, height);
    const x = (width - size) / 2;
    const y = (height - size) / 2;

    setCrop({
      unit: 'px',
      x,
      y,
      width: size,
      height: size
    });
  }, [setCrop]);

  return (
    <div className="crop-modal-backdrop">
      <div className="crop-modal-content">
        <h3 className="crop-modal-title">{t.cropTitle}</h3>
        {image && (
          <div className="crop-modal-image-container">
            <ReactCrop 
              crop={crop} 
              onChange={c => setCrop(c)} 
              onComplete={onCropComplete} 
              aspect={1} 
              circularCrop={true}
            >
              <img 
                ref={imgRef} 
                src={image}
                onLoad={onImageLoad} 
                alt="Crop me" 
                style={{ maxHeight: '60vh' }}
              />
            </ReactCrop>
          </div>
        )}
        <div className="crop-modal-buttons-container">
          <button 
            onClick={onClose} 
            className="crop-modal-btn crop-modal-btn-secondary"
          >
            {t.cancel}
          </button>
          <button 
            onClick={onSave} 
            className="crop-modal-btn crop-modal-btn-primary"
          >
            {t.done}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropModal;
