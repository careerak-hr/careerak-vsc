import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

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
    // هنا نقوم بإنشاء الصورة المقصوصة وإعادتها
    onCropComplete(croppedAreaPixels);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black flex flex-col">
      <div className="relative flex-grow">
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
      <div className="p-6 bg-white rounded-t-[2.5rem] flex flex-col gap-4">
        <div className="flex items-center justify-between px-4">
          <span className="font-bold text-gray-500">{lang === 'ar' ? 'تكبير' : 'Zoom'}</span>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(e.target.value)}
            className="w-2/3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1A365D]"
          />
        </div>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 py-4 rounded-2xl font-bold text-gray-500 bg-gray-100 active:scale-95 transition-all"
          >
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-4 rounded-2xl font-black text-white bg-[#1A365D] active:scale-95 transition-all"
          >
            {lang === 'ar' ? 'تم، حفظ' : 'Done, Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
