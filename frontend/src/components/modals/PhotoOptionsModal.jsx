import React from 'react';
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
  
  const handleGalleryClick = () => {
    console.log('📱 User selected gallery option');
    onSelectFromGallery();
  };

  const handleCameraClick = () => {
    console.log('📷 User selected camera option');
    onTakePhoto();
  };

  return (
    <div className="photo-options-backdrop" dir={dir}>
      <div 
        className="photo-options-content"
        style={{
          border: '4px solid #304B60',
          backgroundColor: '#E3DAD1',
          borderRadius: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '2rem',
          ...fontStyle
        }}
      >
        <h3 
          className="photo-options-title"
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
            className="photo-options-btn"
            style={{
              backgroundColor: '#304B60',
              color: '#E3DAD1',
              border: '2px solid #304B60',
              padding: '1rem 1.5rem',
              borderRadius: '0.75rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
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
            className="photo-options-btn"
            style={{
              backgroundColor: '#304B60',
              color: '#E3DAD1',
              border: '2px solid #304B60',
              padding: '1rem 1.5rem',
              borderRadius: '0.75rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
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
            className="photo-options-cancel-btn"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#304B60',
              border: '2px solid #304B60',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
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
      </div>
    </div>
  );
};

export default PhotoOptionsModal;
