import React from 'react';

const PhotoOptionsModal = ({ onSelectFromGallery, onTakePhoto, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#E3DAD1] p-6 rounded-[2rem] shadow-2xl w-full max-w-xs border-4 border-[#304B60]">
        <div className="flex flex-col gap-4">
          <button onClick={onSelectFromGallery} className="py-4 bg-[#304B60] text-[#D48161] rounded-xl font-black">اختر من المعرض</button>
          <button onClick={onTakePhoto} className="py-4 bg-[#304B60] text-[#D48161] rounded-xl font-black">التقط صورة</button>
          <button onClick={onClose} className="mt-2 py-2 text-xs text-red-500">إلغاء</button>
        </div>
      </div>
    </div>
  );
};
export default PhotoOptionsModal;
