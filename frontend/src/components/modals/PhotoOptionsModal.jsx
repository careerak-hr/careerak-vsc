import React from 'react';

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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#E3DAD1] p-6 rounded-[2rem] shadow-2xl w-full max-w-xs border-4 border-[#304B60]">
        <h3 className="text-lg font-black text-[#304B60] text-center mb-4">
          {t.uploadPhoto || 'رفع الصورة'}
        </h3>
        <div className="flex flex-col gap-4">
          <button 
            onClick={handleGalleryClick} 
            className="py-4 bg-[#304B60] text-[#D48161] rounded-xl font-black hover:bg-[#1A365D] transition-colors"
          >
            🖼️ {t.selectFromGallery || 'اختر من المعرض'}
          </button>
          <button 
            onClick={handleCameraClick} 
            className="py-4 bg-[#304B60] text-[#D48161] rounded-xl font-black hover:bg-[#1A365D] transition-colors"
          >
            📷 {t.takePhoto || 'التقط صورة'}
          </button>
          <button 
            onClick={onClose} 
            className="mt-2 py-2 text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            {t.cancel || 'إلغاء'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoOptionsModal;
