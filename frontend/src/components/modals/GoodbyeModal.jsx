import React from 'react';

const GoodbyeModal = ({ t, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-[#E3DAD1] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-[#304B60]">
        {/* أيقونة وداع */}
        <div className="text-6xl mb-4">👋</div>
        
        {/* رسالة الوداع */}
        <h2 className="text-xl font-black text-[#304B60] mb-4">
          {t.sorryTitle || 'نأسف لذلك'}
        </h2>
        
        <p className="text-lg font-bold text-[#304B60]/80 mb-6">
          {t.sorryMessage}
        </p>
        
        {/* رسالة إضافية للتوضيح */}
        <p className="text-sm font-medium text-[#304B60]/60 mb-8">
          {t.exitMessage || 'سيتم إغلاق التطبيق الآن'}
        </p>
        
        <button
          onClick={onConfirm}
          className="bg-[#304B60] text-[#D48161] py-4 px-8 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all hover:bg-[#304B60]/90"
        >
          {t.goodbye}
        </button>
      </div>
    </div>
  );
};

export default GoodbyeModal;