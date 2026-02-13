import React from 'react';
import PolicyPage from '../../pages/13_PolicyPage.jsx';
import { useApp } from '../../context/AppContext';

const PolicyModal = ({ onClose, onAgree }) => {
  const { language } = useApp();
  const isRTL = language === 'ar';
  const fontFamily = language === 'ar' 
    ? 'Amiri, Cairo, serif' 
    : language === 'fr' 
      ? 'EB Garamond, serif' 
      : 'Cormorant Garamond, serif';

  const fontStyle = {
    fontFamily: fontFamily,
    fontWeight: 'inherit',
    fontStyle: 'inherit'
  };

  const titles = {
    ar: { title: 'سياسة الخصوصية', agree: 'موافق', close: 'إغلاق' },
    en: { title: 'Privacy Policy', agree: 'Agree', close: 'Close' },
    fr: { title: 'Politique de Confidentialité', agree: 'Accepter', close: 'Fermer' }
  };

  const t = titles[language] || titles.ar;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-[#E3DAD1] rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border-4 border-[#304B60]">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-[#304B60]/10 bg-[#E3DAD1] flex-shrink-0">
          <h2 className="text-2xl font-black text-[#304B60]" style={fontStyle}>{t.title}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#304B60] text-[#E3DAD1] flex items-center justify-center hover:bg-[#D48161] transition-colors"
            style={fontStyle}
          >
            ✕
          </button>
        </div>
        
        {/* Scrollable Content - Improved */}
        <div 
          className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#304B60] scrollbar-track-[#E3DAD1]"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            ...fontStyle
          }}
        >
          <PolicyPage isModal={true} />
        </div>
        
        {/* Footer - Fixed */}
        <div className="flex gap-4 p-6 border-t border-[#304B60]/10 bg-[#E3DAD1] flex-shrink-0">
          <button
            onClick={onAgree}
            className="flex-1 bg-[#304B60] text-[#D48161] py-3 rounded-2xl font-black hover:bg-[#D48161] hover:text-[#304B60] transition-colors"
            style={fontStyle}
          >
            {t.agree}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-[#E3DAD1] text-[#304B60] py-3 rounded-2xl font-black border-2 border-[#304B60]/20 hover:border-[#304B60] transition-colors"
            style={fontStyle}
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyModal;
