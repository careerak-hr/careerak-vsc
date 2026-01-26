import React from 'react';

const AgeCheckModal = ({ t, onResponse }) => {
  return (    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-6">
      <div className="bg-[#E3DAD1] p-8 rounded-[2.5rem] shadow-2xl text-center max-w-sm border-4 border-[#304B60]">
        <h2 className="text-2xl font-black text-[#304B60] mb-6">{t.ageError}</h2>
        <div className="flex gap-4">
          <button onClick={() => onResponse(true)} className="flex-1 bg-[#304B60] text-[#D48161] py-4 rounded-2xl font-black">{t.above18}</button>
          <button onClick={() => onResponse(false)} className="flex-1 border-2 border-red-500 text-red-500 py-4 rounded-2xl font-black">{t.below18}</button>
        </div>
      </div>
    </div>
  );
};
export default AgeCheckModal;
