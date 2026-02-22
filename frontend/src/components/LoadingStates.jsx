import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LoadingStates.css';
import AriaLiveRegion from './Accessibility/AriaLiveRegion';
import { useAnimation } from '../context/AnimationContext';

export const InitialLoadingScreen = () => {
  const { shouldAnimate } = useAnimation();

  // Fade animation variants (200ms)
  const fadeVariants = shouldAnimate ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  } : {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 1 }
  };

  return (
    <>
      {/* Announce loading to screen readers */}
      <AriaLiveRegion 
        message="جاري تحميل التطبيق... Loading application..."
        politeness="polite"
        role="status"
      />
      
      <motion.div 
        className="loading-screen-container"
        variants={fadeVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
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
          
          <p className="loading-message" aria-live="polite">جاري تحميل التطبيق...</p>
        </div>
      </motion.div>
    </>
  );
};

export const InitializationErrorScreen = ({ error, onRetry, onRestart }) => {
  const { shouldAnimate } = useAnimation();

  // Fade animation variants (200ms)
  const fadeVariants = shouldAnimate ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  } : {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 1 }
  };

  return (
    <>
      {/* Announce error to screen readers */}
      <AriaLiveRegion 
        message="خطأ: فشل في تحميل التطبيق. Error: Failed to load application."
        politeness="assertive"
        role="alert"
      />
      
      <motion.div 
        className="error-screen-container"
        variants={fadeVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
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
              aria-label="إعادة المحاولة"
            >
              🔄 إعادة المحاولة
            </button>
            
            <button
              onClick={onRestart}
              className="error-action-btn bg-accent text-primary"
              aria-label="إعادة تشغيل التطبيق"
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
              aria-label="مسح البيانات وإعادة التحميل"
            >
              🧹 مسح البيانات وإعادة التحميل
            </button>
          </div>
          
          <div className="mt-6 text-xs text-hint">
            <p>إذا استمرت المشكلة، يرجى الاتصال بالدعم التقني</p>
            <p className="mt-1">الإصدار: {import.meta.env.VITE_APP_VERSION || '1.3.0'}</p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export const SimpleLoader = ({ message = "جاري التحميل..." }) => {
  const { shouldAnimate } = useAnimation();

  // Fade animation variants (200ms)
  const fadeVariants = shouldAnimate ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  } : {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 1 }
  };

  return (
    <>
      {/* Announce loading to screen readers */}
      <AriaLiveRegion 
        message={message}
        politeness="polite"
        role="status"
      />
      
      <motion.div 
        className="simple-loader-container"
        variants={fadeVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="text-center">
          <div className="simple-loader-spinner" role="status" aria-label={message}></div>
          <p className="text-primary">{message}</p>
        </div>
      </motion.div>
    </>
  );
};

export const ProgressLoader = ({ progress = 0, message = "جاري التحميل..." }) => {
  const { shouldAnimate } = useAnimation();

  // Fade animation variants (200ms)
  const fadeVariants = shouldAnimate ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  } : {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 1 }
  };

  return (
    <>
      {/* Announce progress to screen readers */}
      <AriaLiveRegion 
        message={`${message} ${Math.round(progress)}%`}
        politeness="polite"
        role="status"
      />
      
      <motion.div 
        className="progress-loader-container"
        variants={fadeVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="progress-loader-content">
          <div className="loading-logo mx-auto mb-6">
            <div className="loading-logo-text">C</div>
          </div>
          
          <h2 className="text-xl font-bold text-primary mb-4">كاريرك</h2>
          
          <div 
            className="progress-bar-container"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label={message}
          >
            <div 
              className="progress-bar-fill"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            ></div>
          </div>
          
          <p className="text-primary text-sm">{message}</p>
          <p className="text-primary text-xs mt-2">{Math.round(progress)}%</p>
        </div>
      </motion.div>
    </>
  );
};