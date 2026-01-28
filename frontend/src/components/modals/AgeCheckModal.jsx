import React from 'react';

const AgeCheckModal = ({ t, onResponse }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-[#E3DAD1] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-[#304B60]">
        <h2 className="text-2xl font-black text-[#304B60] mb-6">{t.ageCheckTitle}</h2>
        <p className="text-lg font-bold text-[#304B60]/80 mb-8">{t.ageCheckMessage}</p>
        <div className="flex gap-4">
          <button
            onClick={() => onResponse(true)}
            className="flex-1 bg-[#304B60] text-[#D48161] py-4 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all"
          >
            {t.above18}
          </button>
          <button
            onClick={() => onResponse(false)}
            className="flex-1 bg-[#304B60] text-[#D48161] py-4 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all"
          >
            {t.below18}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgeCheckModal;
