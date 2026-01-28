import React from 'react';

/**
 * حالات التحميل والأخطاء
 * Loading and Error States
 */

// شاشة التحميل الأولية
export const InitialLoadingScreen = () => {
  return (
    <div className="min-h-screen bg-[#E3DAD1] flex items-center justify-center">
      <div className="text-center">
        {/* اللوجو */}
        <div className="w-24 h-24 mx-auto mb-6 bg-[#304B60] rounded-full flex items-center justify-center">
          <div className="text-[#D48161] text-2xl font-bold">C</div>
        </div>
        
        {/* اسم التطبيق */}
        <h1 className="text-3xl font-bold text-[#304B60] mb-4">كاريرك</h1>
        <p className="text-[#304B60] mb-8">منصة التوظيف الذكية</p>
        
        {/* مؤشر التحميل */}
        <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
          <div className="w-3 h-3 bg-[#304B60] rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-[#304B60] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-[#304B60] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        <p className="text-[#304B60] mt-4 text-sm">جاري تحميل التطبيق...</p>
      </div>
    </div>
  );
};

// شاشة خطأ التهيئة
export const InitializationErrorScreen = ({ error, onRetry, onRestart }) => {
  return (
    <div className="min-h-screen bg-[#E3DAD1] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {/* أيقونة الخطأ */}
        <div className="text-6xl mb-4">⚠️</div>
        
        <h2 className="text-2xl font-bold text-[#304B60] mb-4">
          فشل في تحميل التطبيق
        </h2>
        
        <p className="text-gray-600 mb-6">
          حدث خطأ أثناء تهيئة التطبيق. يرجى المحاولة مرة أخرى.
        </p>
        
        {/* تفاصيل الخطأ (للمطورين فقط) */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-red-600 font-semibold mb-2">
              تفاصيل الخطأ (للمطورين)
            </summary>
            <div className="bg-red-50 p-4 rounded border text-sm">
              <strong>Error:</strong> {error.message}
              {error.stack && (
                <>
                  <br />
                  <strong>Stack:</strong>
                  <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </>
              )}
            </div>
          </details>
        )}
        
        {/* أزرار الإجراءات */}
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full bg-[#304B60] text-[#D48161] py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            🔄 إعادة المحاولة
          </button>
          
          <button
            onClick={onRestart}
            className="w-full bg-[#D48161] text-[#304B60] py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            🔄 إعادة تشغيل التطبيق
          </button>
          
          <button
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            🧹 مسح البيانات وإعادة التحميل
          </button>
        </div>
        
        {/* معلومات إضافية */}
        <div className="mt-6 text-xs text-gray-500">
          <p>إذا استمرت المشكلة، يرجى الاتصال بالدعم التقني</p>
          <p className="mt-1">الإصدار: {process.env.REACT_APP_VERSION || '1.3.0'}</p>
        </div>
      </div>
    </div>
  );
};

// مؤشر تحميل بسيط
export const SimpleLoader = ({ message = "جاري التحميل..." }) => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#304B60] mb-4"></div>
        <p className="text-[#304B60]">{message}</p>
      </div>
    </div>
  );
};

// شاشة تحميل مع تقدم
export const ProgressLoader = ({ progress = 0, message = "جاري التحميل..." }) => {
  return (
    <div className="min-h-screen bg-[#E3DAD1] flex items-center justify-center">
      <div className="text-center max-w-md w-full px-4">
        <div className="w-16 h-16 mx-auto mb-6 bg-[#304B60] rounded-full flex items-center justify-center">
          <div className="text-[#D48161] text-xl font-bold">C</div>
        </div>
        
        <h2 className="text-xl font-bold text-[#304B60] mb-4">كاريرك</h2>
        
        {/* شريط التقدم */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-[#304B60] h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          ></div>
        </div>
        
        <p className="text-[#304B60] text-sm">{message}</p>
        <p className="text-[#304B60] text-xs mt-2">{Math.round(progress)}%</p>
      </div>
    </div>
  );
};