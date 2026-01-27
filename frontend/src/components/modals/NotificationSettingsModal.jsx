import React from 'react';

const NotificationSettingsModal = ({ isOpen, onClose, onConfirm, language, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#304B60]/40 backdrop-blur-sm flex items-center justify-center p-6 z-[1000]">
      <div className="bg-[#E3DAD1] p-8 rounded-[2.5rem] shadow-2xl text-center max-w-sm border-4 border-[#304B60] animate-in fade-in zoom-in duration-300">
        <div className="mb-6">
          <div className="w-16 h-16 bg-[#304B60]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔔</span>
          </div>
          <p className="text-[#304B60] font-bold text-lg leading-relaxed" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {t.notificationTitle}
          </p>
          <p className="text-[#304B60]/60 font-bold text-sm mt-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {t.notificationDesc}
          </p>
        </div>
        <div className="flex gap-4 w-full">
          <button 
            onClick={() => onConfirm(true)} 
            className="flex-1 py-3 bg-[#304B60] text-[#E3DAD1] rounded-2xl font-bold shadow-lg border-2 border-[#304B60] hover:scale-105 transition-all text-lg"
          >
            {t.yes}
          </button>
          <button 
            onClick={() => onConfirm(false)} 
            className="flex-1 py-3 bg-[#304B60] text-[#E3DAD1] rounded-2xl font-bold shadow-lg border-2 border-[#304B60] hover:scale-105 transition-all text-lg"
          >
            {t.no}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsModal;