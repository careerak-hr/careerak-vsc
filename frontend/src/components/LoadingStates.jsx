import React from 'react';
import './LoadingStates.css';

export const InitialLoadingScreen = () => {
  return (
    <div className="loading-screen-container">
      <div className="loading-content-container">
        <div className="loading-logo">
          <div className="loading-logo-text">C</div>
        </div>
        
        <h1 className="loading-title">كاريرك</h1>
        <p className="loading-subtitle">منصة التوظيف الذكية</p>
        
        <div className="loading-dots-container">
          <div className="loading-dot"></div>
          <div className="loading-dot" style={{ animationDelay: '0.1s' }}></div>
          <div className="loading-dot" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        <p className="loading-message">جاري تحميل التطبيق...</p>
      </div>
    </div>
  );
};

export const InitializationErrorScreen = ({ error, onRetry, onRestart }) => {
  return (
    <div className="error-screen-container">
      <div className="error-card">
        <div className="error-icon">⚠️</div>
        
        <h2 className="error-title">
          فشل في تحميل التطبيق
        </h2>
        
        <p className="error-message">
          حدث خطأ أثناء تهيئة التطبيق. يرجى المحاولة مرة أخرى.
        </p>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-6 text-left">
            <summary className="error-details summary">
              تفاصيل الخطأ (للمطورين)
            </summary>
            <div className="error-details-content">
              <strong>Error:</strong> {error.message}
              {error.stack && (
                <>
                  <br />
                  <strong>Stack:</strong>
                  <pre className="error-stack">
                    {error.stack}
                  </pre>
                </>
              )}
            </div>
          </details>
        )}
        
        <div className="error-actions">
          <button
            onClick={onRetry}
            className="error-action-btn bg-primary text-accent"
          >
            🔄 إعادة المحاولة
          </button>
          
          <button
            onClick={onRestart}
            className="error-action-btn bg-accent text-primary"
          >
            🔄 إعادة تشغيل التطبيق
          </button>
          
          <button
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            className="error-action-btn bg-hint text-white"
          >
            🧹 مسح البيانات وإعادة التحميل
          </button>
        </div>
        
        <div className="mt-6 text-xs text-hint">
          <p>إذا استمرت المشكلة، يرجى الاتصال بالدعم التقني</p>
          <p className="mt-1">الإصدار: {process.env.REACT_APP_VERSION || '1.3.0'}</p>
        </div>
      </div>
    </div>
  );
};

export const SimpleLoader = ({ message = "جاري التحميل..." }) => {
  return (
    <div className="simple-loader-container">
      <div className="text-center">
        <div className="simple-loader-spinner"></div>
        <p className="text-primary">{message}</p>
      </div>
    </div>
  );
};

export const ProgressLoader = ({ progress = 0, message = "جاري التحميل..." }) => {
  return (
    <div className="progress-loader-container">
      <div className="progress-loader-content">
        <div className="loading-logo mx-auto mb-6">
          <div className="loading-logo-text">C</div>
        </div>
        
        <h2 className="text-xl font-bold text-primary mb-4">كاريرك</h2>
        
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          ></div>
        </div>
        
        <p className="text-primary text-sm">{message}</p>
        <p className="text-primary text-xs mt-2">{Math.round(progress)}%</p>
      </div>
    </div>
  );
};