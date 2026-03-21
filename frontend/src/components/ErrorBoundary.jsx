import React from 'react';
import { motion } from 'framer-motion';
import './ErrorBoundary.css';
import AriaLiveRegion from './Accessibility/AriaLiveRegion';
import { feedbackVariants } from '../utils/animationVariants';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          {/* Announce error to screen readers */}
          <AriaLiveRegion 
            message="خطأ: حدث خطأ غير متوقع في التطبيق. Error: An unexpected error occurred in the application."
            politeness="assertive"
            role="alert"
          />
          
          <div className="error-boundary-container" role="alert">
            <motion.div 
              className="error-boundary-card"
              variants={feedbackVariants.shake}
              initial="initial"
              animate="animate"
            >
              <div className="error-boundary-icon" aria-hidden="true">😵</div>
              
              <h2 className="error-boundary-title">
                عذراً، حدث خطأ غير متوقع
              </h2>
              
              <p className="error-boundary-message">
                نعتذر عن هذا الإزعاج. يرجى إعادة تحميل الصفحة أو المحاولة لاحقاً.
              </p>
              
              <div className="error-boundary-actions">
                <button
                  onClick={() => window.location.reload()}
                  className="error-boundary-action-btn bg-primary text-accent"
                  aria-label="إعادة تحميل الصفحة"
                >
                  إعادة تحميل الصفحة
                </button>
                
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = '/';
                  }}
                  className="error-boundary-action-btn bg-hint text-white"
                  aria-label="إعادة تعيين التطبيق"
                >
                  إعادة تعيين التطبيق
                </button>
              </div>

              {import.meta.env.DEV && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="error-boundary-details summary">
                    تفاصيل الخطأ (للمطورين)
                  </summary>
                  <div className="error-boundary-details-content">
                    <strong>Error:</strong> {this.state.error.toString()}
                    <br />
                    <strong>Stack:</strong>
                    <pre className="error-boundary-stack">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </details>
              )}
            </motion.div>
          </div>
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;