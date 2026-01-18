import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-[#1A365D] text-white p-4 xs:p-6 sm:p-8 mt-10 xs:mt-12" dir="rtl">
      <div className="container mx-auto px-2 xs:px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 xs:gap-8 mb-6 xs:mb-8">
          <div>
            <h3 className="font-bold text-base xs:text-lg mb-3 xs:mb-4">عن كاريرك</h3>
            <p className="text-blue-100 text-xs xs:text-sm leading-relaxed">منصة تربط بين الموهوبين والفرص المهنية المميزة</p>
          </div>
          <div>
            <h3 className="font-bold text-base xs:text-lg mb-3 xs:mb-4">الخدمات</h3>
            <ul className="text-blue-100 text-xs xs:text-sm space-y-1.5 xs:space-y-2">
              <li><a href="#" className="hover:text-white transition">الوظائف</a></li>
              <li><a href="#" className="hover:text-white transition">الدورات</a></li>
              <li><a href="#" className="hover:text-white transition">التدريب</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-base xs:text-lg mb-3 xs:mb-4">الشركة</h3>
            <ul className="text-blue-100 text-xs xs:text-sm space-y-1.5 xs:space-y-2">
              <li><a href="#" className="hover:text-white transition">عن الشركة</a></li>
              <li><a href="#" className="hover:text-white transition">اتصل بنا</a></li>
              <li><a href="#" className="hover:text-white transition">الشروط والأحكام</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-base xs:text-lg mb-3 xs:mb-4">تابعنا</h3>
            <div className="flex gap-3 xs:gap-4">
              <a href="#" className="hover:text-blue-300 transition text-xl xs:text-2xl">📱</a>
              <a href="#" className="hover:text-blue-300 transition text-xl xs:text-2xl">🐦</a>
              <a href="#" className="hover:text-blue-300 transition text-xl xs:text-2xl">💼</a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/30 pt-4 xs:pt-6 text-center text-white text-xs xs:text-sm">
          <p>&copy; 2026 Careerak. جميع الحقوق محفوظة</p>
          <p className="mt-1 xs:mt-2">منصة الموارد البشرية الأكثر ثقة في المنطقة</p>
        </div>
      </div>
    </footer>
  );
};
