import React from 'react';
import './PhotoOptionsModal.css';

const PhotoOptionsModal = ({ t, onSelectFromGallery, onTakePhoto, onClose }) => {
  const handleGalleryClick = () => {
    console.log('📱 User selected gallery option');
    onSelectFromGallery();
  };

  const handleCameraClick = () => {
    console.log('📷 User selected camera option');
    onTakePhoto();
  };

  return (
    <div className="photo-options-backdrop">
      <div className="photo-options-content">
        <h3 className="photo-options-title">
          {t.uploadPhoto || 'رفع الصورة'}
        </h3>
        <div className="photo-options-buttons-container">
          <button 
            onClick={handleGalleryClick} 
            className="photo-options-btn"
          >
            🖼️ {t.selectFromGallery || 'اختر من المعرض'}
          </button>
          <button 
            onClick={handleCameraClick} 
            className="photo-options-btn"
          >
            📷 {t.takePhoto || 'التقط صورة'}
          </button>
          <button 
            onClick={onClose} 
            className="photo-options-cancel-btn"
          >
            {t.cancel || 'إلغاء'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoOptionsModal;
