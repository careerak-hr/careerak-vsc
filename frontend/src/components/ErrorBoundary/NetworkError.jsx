import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { 
  NetworkErrorTypes, 
  getNetworkErrorMessage,
  monitorNetworkStatus 
} from '../../utils/networkErrorHandler';
import './NetworkError.css';

/**
 * NetworkError Component - Display specific network error messages with retry options
 * 
 * Requirements:
 * - FR-ERR-9: When network errors occur, the system shall display specific network error messages with retry options
 * 
 * Features:
 * - Specific error messages for different network error types
 * - Multi-language support (Arabic, English, French)
 * - Retry functionality with loading states
 * - Offline detection and auto-retry when online
 * - Animated error display with Framer Motion
 * - Accessibility support with ARIA attributes
 */
const NetworkError = ({
  error,
  onRetry,
  onDismiss,
  className = '',
  size = 'medium', // 'small', 'medium', 'large'
  showDetails = false,
  autoRetryOnline = true,
  maxAutoRetries = 3
}) => {
  const { language } = useApp();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [autoRetryCount, setAutoRetryCount] = useState(0);

  // Monitor network status
  useEffect(() => {
    if (!autoRetryOnline) return;

    const cleanup = monitorNetworkStatus(
      () => {
        setIsOnline(true);
        // Auto-retry when coming back online (for offline errors)
        if (error?.type === NetworkErrorTypes.OFFLINE_ERROR && 
            autoRetryCount < maxAutoRetries && 
            onRetry) {
          handleAutoRetry();
        }
      },
      () => {
        setIsOnline(false);
      }
    );

    return cleanup;
  }, [autoRetryOnline, error?.type, autoRetryCount, maxAutoRetries, onRetry]);

  // Handle manual retry
  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      await onRetry();
      // If retry succeeds, the error component should be unmounted
    } catch (retryError) {
      console.error('[NetworkError] Retry failed:', retryError);
      // Keep showing the error, retry count is already incremented
    } finally {
      setIsRetrying(false);
    }
  };

  // Handle auto-retry when coming back online
  const handleAutoRetry = async () => {
    if (!onRetry || isRetrying) return;

    setAutoRetryCount(prev => prev + 1);
    setIsRetrying(true);

    try {
      await onRetry();
    } catch (retryError) {
      console.error('[NetworkError] Auto-retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  // Get error message based on type and language
  const errorMessage = error?.type 
    ? getNetworkErrorMessage(error.type, language)
    : getNetworkErrorMessage(NetworkErrorTypes.NETWORK_ERROR, language);

  // Determine if retry is available
  const canRetry = onRetry && (error?.isRetryable !== false);
  const showRetryButton = canRetry && !isRetrying;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 }
    }
  };

  const iconVariants = {
    idle: { rotate: 0 },
    spinning: {
      rotate: 360,
      transition: { duration: 1, repeat: Infinity, ease: 'linear' }
    }
  };

  // Get appropriate icon based on error type
  const getErrorIcon = () => {
    switch (error?.type) {
      case NetworkErrorTypes.OFFLINE_ERROR:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M1 9L12 2L23 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12L12 7L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 15L12 12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case NetworkErrorTypes.TIMEOUT_ERROR:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case NetworkErrorTypes.SERVER_ERROR:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
            <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
            <line x1="7" y1="7" x2="17" y2="13" stroke="currentColor" strokeWidth="2"/>
            <line x1="17" y1="7" x2="7" y2="13" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case NetworkErrorTypes.UNAUTHORIZED_ERROR:
      case NetworkErrorTypes.FORBIDDEN_ERROR:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 15V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
    }
  };

  return (
    <motion.div
      className={`network-error network-error--${size} ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      role="alert"
      aria-live="polite"
    >
      <div className="network-error__content">
        {/* Error Icon */}
        <motion.div
          className="network-error__icon"
          variants={iconVariants}
          animate={isRetrying ? 'spinning' : 'idle'}
          aria-hidden="true"
        >
          {getErrorIcon()}
        </motion.div>

        {/* Error Message */}
        <div className="network-error__message">
          <h3 className="network-error__title">
            {errorMessage.title}
          </h3>
          <p className="network-error__description">
            {errorMessage.message}
          </p>
          
          {/* Suggestion */}
          {errorMessage.suggestion && (
            <p className="network-error__suggestion">
              💡 {errorMessage.suggestion}
            </p>
          )}

          {/* Online Status Indicator */}
          {error?.type === NetworkErrorTypes.OFFLINE_ERROR && (
            <div className={`network-error__status ${isOnline ? 'online' : 'offline'}`}>
              <span className="network-error__status-indicator" />
              {isOnline ? (
                language === 'ar' ? 'متصل الآن' :
                language === 'en' ? 'Online now' : 'En ligne maintenant'
              ) : (
                language === 'ar' ? 'غير متصل' :
                language === 'en' ? 'Offline' : 'Hors ligne'
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="network-error__actions">
          {showRetryButton && (
            <button
              onClick={handleRetry}
              className="network-error__button network-error__button--primary"
              disabled={isRetrying}
              aria-label={errorMessage.action}
            >
              {isRetrying ? (
                <>
                  <motion.div
                    className="network-error__spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  {language === 'ar' ? 'جاري المحاولة...' :
                   language === 'en' ? 'Retrying...' : 'Nouvelle tentative...'}
                </>
              ) : (
                errorMessage.action
              )}
            </button>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="network-error__button network-error__button--secondary"
              aria-label={
                language === 'ar' ? 'إغلاق' :
                language === 'en' ? 'Dismiss' : 'Fermer'
              }
            >
              {language === 'ar' ? 'إغلاق' :
               language === 'en' ? 'Dismiss' : 'Fermer'}
            </button>
          )}
        </div>

        {/* Error Details (Development/Debug) */}
        {showDetails && error && (
          <details className="network-error__details">
            <summary className="network-error__details-summary">
              {language === 'ar' ? 'تفاصيل الخطأ' :
               language === 'en' ? 'Error Details' : 'Détails de l\'erreur'}
            </summary>
            <div className="network-error__details-content">
              <div className="network-error__detail-item">
                <strong>Type:</strong> {error.type}
              </div>
              {error.context?.url && (
                <div className="network-error__detail-item">
                  <strong>URL:</strong> {error.context.url}
                </div>
              )}
              {error.context?.method && (
                <div className="network-error__detail-item">
                  <strong>Method:</strong> {error.context.method}
                </div>
              )}
              {error.context?.status && (
                <div className="network-error__detail-item">
                  <strong>Status:</strong> {error.context.status}
                </div>
              )}
              <div className="network-error__detail-item">
                <strong>Retries:</strong> {retryCount}
              </div>
              <div className="network-error__detail-item">
                <strong>Auto Retries:</strong> {autoRetryCount}
              </div>
              <div className="network-error__detail-item">
                <strong>Timestamp:</strong> {error.context?.timestamp}
              </div>
              {error.originalError?.message && (
                <div className="network-error__detail-item">
                  <strong>Original Error:</strong>
                  <pre className="network-error__error-message">
                    {error.originalError.message}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </motion.div>
  );
};

/**
 * NetworkErrorBoundary - Error boundary specifically for network errors
 * 
 * This component catches network errors and displays them using the NetworkError component
 */
export class NetworkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasNetworkError: false,
      networkError: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Check if this is a network error
    if (error.networkError || error.isNetworkError) {
      return {
        hasNetworkError: true,
        networkError: error.networkError || error,
      };
    }
    
    // Not a network error, let other error boundaries handle it
    return null;
  }

  componentDidCatch(error, errorInfo) {
    // Only handle network errors
    if (error.networkError || error.isNetworkError) {
      console.error('[NetworkErrorBoundary] Network error caught:', error);
      
      // Log to error tracking
      if (this.props.onError) {
        this.props.onError(error, errorInfo);
      }
    }
  }

  handleRetry = () => {
    this.setState({
      hasNetworkError: false,
      networkError: null,
    });
    
    // Call retry callback if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleDismiss = () => {
    this.setState({
      hasNetworkError: false,
      networkError: null,
    });
  };

  render() {
    if (this.state.hasNetworkError) {
      return (
        <NetworkError
          error={this.state.networkError}
          onRetry={this.handleRetry}
          onDismiss={this.handleDismiss}
          size={this.props.size}
          showDetails={this.props.showDetails}
          autoRetryOnline={this.props.autoRetryOnline}
          maxAutoRetries={this.props.maxAutoRetries}
        />
      );
    }

    return this.props.children;
  }
}

export default NetworkError;