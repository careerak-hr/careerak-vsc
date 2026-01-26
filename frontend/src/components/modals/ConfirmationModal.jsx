import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message, confirmText, cancelText, language }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#304B60]/40 backdrop-blur-sm flex items-center justify-center p-6 z-[1000]">
      <div className="bg-[#E3DAD1] p-8 rounded-[2.5rem] shadow-2xl text-center max-w-sm border-4 border-[#304B60] animate-in fade-in zoom-in duration-300">
        <p className="text-[#304B60] font-bold text-lg mb-6 leading-relaxed" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {message}
        </p>
        <div className={`flex gap-4 w-full ${!cancelText ? 'justify-center' : ''}`}>
          <button onClick={onConfirm} className={`${!cancelText ? 'w-full' : 'flex-1'} py-3 bg-[#304B60] text-[#E3DAD1] rounded-2xl font-bold shadow-lg border-2 border-[#304B60] hover:scale-105 transition-all text-lg`}>
            {confirmText || 'Confirm'}
          </button>
          {cancelText && (
            <button onClick={onClose || (() => {})} className="flex-1 py-3 bg-[#304B60] text-[#E3DAD1] rounded-2xl font-bold shadow-lg border-2 border-[#304B60] hover:scale-105 transition-all text-lg">
              {cancelText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
