import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import './ImageCropper.css';

export const ImageCropper = ({ image, onCropComplete, onCancel, lang }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => setCrop(crop);
  const onZoomChange = (zoom) => setZoom(zoom);

  const handleCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    onCropComplete(croppedAreaPixels);
  };

  return (
    <div className="image-cropper-container">
      <div className="image-cropper-cropper-wrapper">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={onCropChange}
          onCropComplete={handleCropComplete}
          onZoomChange={onZoomChange}
        />
      </div>
      <div className="image-cropper-controls-container">
        <div className="image-cropper-zoom-container">
          <span className="image-cropper-zoom-label">{lang === 'ar' ? 'تكبير' : 'Zoom'}</span>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(e.target.value)}
            className="image-cropper-zoom-slider"
          />
        </div>
        <div className="image-cropper-buttons-container">
          <button
            onClick={onCancel}
            className="image-cropper-btn image-cropper-btn-secondary"
          >
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            className="image-cropper-btn image-cropper-btn-primary"
          >
            {lang === 'ar' ? 'تم، حفظ' : 'Done, Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
