import React, { useRef, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const CropModal = ({ t, tempImage, crop, setCrop, onCropComplete, onSave, onClose }) => {
  const imgRef = useRef();
  
  const onImageLoad = useCallback((e) => {
    // eslint-disable-next-line no-unused-vars
    const { width, height } = e.currentTarget;
    setCrop({
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5
    });
  }, [setCrop]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#E3DAD1] p-6 rounded-[2rem] shadow-2xl w-full max-w-md text-center border-4 border-[#304B60]">
        <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.cropTitle}</h3>
        {tempImage && (
          <div className="flex justify-center mb-4">
            <ReactCrop 
              crop={crop} 
              onChange={c => setCrop(c)} 
              onComplete={onCropComplete} 
              aspect={1} 
              circularCrop={true}
            >
              <img 
                ref={imgRef} 
                src={tempImage} 
                onLoad={onImageLoad} 
                alt="Crop me" 
                style={{ maxHeight: '60vh' }}
              />
            </ReactCrop>
          </div>
        )}
        <div className="flex gap-4">
          <button 
            onClick={onClose} 
            className="flex-1 border-2 border-red-500 text-red-500 py-3 rounded-xl font-black"
          >
            {t.cancel}
          </button>
          <button 
            onClick={onSave} 
            className="flex-1 bg-[#304B60] text-[#D48161] py-3 rounded-xl font-black"
          >
            {t.done}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropModal;
