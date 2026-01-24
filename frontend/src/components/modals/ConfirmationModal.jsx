import React from 'react';

const ConfirmationModal = ({ t, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#E3DAD1] p-8 rounded-[2rem] shadow-2xl text-center max-w-sm border-4 border-[#304B60]">
        <p className="text-[#304B60] font-bold text-lg mb-6">{t.confirmData}</p>
        <div className="flex gap-4">
          <button onClick={onConfirm} className="flex-1 bg-[#304B60] text-[#D48161] py-3 rounded-xl font-black">{t.yes}</button>
          <button onClick={onCancel} className="flex-1 border-2 border-[#304B60] text-[#304B60] py-3 rounded-xl font-black">{t.no}</button>
        </div>
      </div>
    </div>
  );
};
export default ConfirmationModal;
