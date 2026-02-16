import React from 'react';
import { useApp } from '../../context/AppContext';

const ExitConfirmModal = ({ isOpen, onConfirm, onCancel }) => {
  const { language } = useApp();

  // الترجمات
  const translations = {
    ar: {
      title: 'تأكيد الخروج',
      message: 'هل حقاً تريد الخروج من التطبيق؟',
      yes: 'نعم',
      no: 'لا'
    },
    en: {
      title: 'Confirm Exit',
      message: 'Do you really want to exit the application?',
      yes: 'Yes',
      no: 'No'
    },
    fr: {
      title: 'Confirmer la sortie',
      message: 'Voulez-vous vraiment quitter l\'application?',
      yes: 'Oui',
      no: 'Non'
    }
  };

  const t = translations[language] || translations.ar;
  const isRTL = language === 'ar';

  // الخطوط حسب اللغة
  const fontFamily = language === 'ar' 
    ? 'Amiri, Cairo, serif' 
    : language === 'en' 
    ? 'Cormorant Garamond, serif' 
    : 'EB Garamond, serif';

  const fontStyle = {
    fontFamily: fontFamily,
    fontWeight: 'inherit',
    fontStyle: 'inherit'
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div 
        className="bg-secondary rounded-3xl shadow-2xl w-[90%] max-w-md mx-4 overflow-hidden animate-scale-in"
        style={{ border: '4px solid #304B60' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* المحتوى */}
        <div className="p-8 text-center">
          {/* العنوان */}
          <h2 
            className="text-2xl font-black text-primary mb-4"
            style={fontStyle}
          >
            {t.title}
          </h2>

          {/* الرسالة */}
          <p 
            className="text-lg font-bold text-primary/80 mb-8"
            style={fontStyle}
          >
            {t.message}
          </p>

          {/* الأزرار */}
          <div className="flex gap-4">
            {/* زر لا */}
            <button
              onClick={onCancel}
              className="flex-1 py-4 rounded-2xl font-black text-lg transition-all shadow-lg bg-secondary-light text-primary border-2 border-accent hover:bg-accent hover:text-secondary active:scale-95"
              style={fontStyle}
            >
              {t.no}
            </button>

            {/* زر نعم */}
            <button
              onClick={onConfirm}
              className="flex-1 py-4 rounded-2xl font-black text-lg transition-all shadow-lg bg-primary text-accent hover:bg-primary/90 active:scale-95"
              style={fontStyle}
            >
              {t.yes}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitConfirmModal;
