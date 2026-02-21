import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { logError } from '../../utils/errorTracking';
import './ComponentErrorBoundary.css';

/**
 * ComponentErrorBoundary - Inline error boundary for component-level errors
 * 
 * Requirements:
 * - FR-ERR-1: Catch component errors with error boundary
 * - FR-ERR-2: Display user-friendly error messages in Arabic, English, or French
 * - FR-ERR-3: Log error details (component, stack trace, timestamp) to console
 * - FR-ERR-4: Provide "Retry" button to attempt recovery
 * - FR-ERR-7: Display inline error boundary without breaking the entire page
 * - FR-ERR-8: Reset error boundary and re-render component on retry
 */
class ComponentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorTimestamp: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorTimestamp: new Date().toISOString(),
    };
  }

  componentDidCatch(error, errorInfo) {
    // FR-ERR-3: Log error details to console
    const timestamp = new Date().toISOString();
    const componentName = this.props.componentName || 
      errorInfo.componentStack.split('\n')[1]?.trim() || 'Unknown';
    
    console.error('=== ComponentErrorBoundary Error ===');
    console.error('Timestamp:', timestamp);
    console.error('Component:', componentName);
    
    // FR-ERR-3: Include user ID if authenticated
    if (this.props.user && this.props.user._id) {
      console.error('User ID:', this.props.user._id);
    }
    
    console.error('Error:', error);
    console.error('Stack Trace:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Retry Count:', this.state.retryCount);
    console.error('====================================');

    // Store error details in state
    this.setState({
      error: error,
      errorInfo: errorInfo,
      errorTimestamp: timestamp,
    });

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo, componentName);
    }

    // Send to error tracking service (prepared for future integration)
    logError(error, {
      component: componentName,
      action: 'component-render',
      userId: this.props.user?._id,
      level: 'error',
      extra: {
        componentStack: errorInfo.componentStack,
        timestamp: timestamp,
        retryCount: this.state.retryCount,
        errorBoundary: 'ComponentErrorBoundary',
      },
    });
  }

  // FR-ERR-8: Reset error boundary and re-render component
  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorTimestamp: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      // FR-ERR-7: Inline error UI (doesn't break the entire page)
      return (
        <ComponentErrorUI
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorTimestamp={this.state.errorTimestamp}
          retryCount={this.state.retryCount}
          onRetry={this.handleRetry}
          language={this.props.language}
          componentName={this.props.componentName}
          fallback={this.props.fallback}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * ComponentErrorUI - Inline error display component
 * FR-ERR-2: User-friendly error messages in multiple languages
 */
const ComponentErrorUI = ({ 
  error, 
  errorInfo, 
  errorTimestamp, 
  retryCount,
  onRetry, 
  language, 
  componentName,
  fallback 
}) => {
  // FR-ERR-2: Multi-language error messages
  const errorMessages = {
    ar: {
      title: 'حدث خطأ في هذا المكون',
      description: 'عذراً، حدث خطأ أثناء تحميل هذا الجزء من الصفحة.',
      retryButton: 'إعادة المحاولة',
      retryingMessage: 'جاري إعادة المحاولة...',
      detailsTitle: 'تفاصيل الخطأ (للمطورين)',
      componentLabel: 'المكون:',
      errorLabel: 'الخطأ:',
      timestampLabel: 'الوقت:',
      retryCountLabel: 'عدد المحاولات:',
    },
    en: {
      title: 'An error occurred in this component',
      description: 'Sorry, an error occurred while loading this part of the page.',
      retryButton: 'Retry',
      retryingMessage: 'Retrying...',
      detailsTitle: 'Error Details (for developers)',
      componentLabel: 'Component:',
      errorLabel: 'Error:',
      timestampLabel: 'Timestamp:',
      retryCountLabel: 'Retry Count:',
    },
    fr: {
      title: 'Une erreur s\'est produite dans ce composant',
      description: 'Désolé, une erreur s\'est produite lors du chargement de cette partie de la page.',
      retryButton: 'Réessayer',
      retryingMessage: 'Nouvelle tentative...',
      detailsTitle: 'Détails de l\'erreur (pour les développeurs)',
      componentLabel: 'Composant:',
      errorLabel: 'Erreur:',
      timestampLabel: 'Horodatage:',
      retryCountLabel: 'Nombre de tentatives:',
    },
  };

  const messages = errorMessages[language] || errorMessages.ar;

  // If custom fallback is provided, use it
  if (fallback) {
    return fallback;
  }

  // Animation variants for error display
  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      className="component-error-boundary-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      role="alert"
      aria-live="polite"
    >
      <div className="component-error-boundary-card">
        {/* Error Icon */}
        <div className="component-error-icon" aria-hidden="true">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 12V22"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Error Content */}
        <div className="component-error-content">
          <h3 className="component-error-title">{messages.title}</h3>
          <p className="component-error-description">{messages.description}</p>

          {/* FR-ERR-4: Retry button */}
          <button
            onClick={onRetry}
            className="component-error-btn"
            aria-label={messages.retryButton}
          >
            {messages.retryButton}
          </button>
        </div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="component-error-details">
            <summary className="component-error-details-summary">
              {messages.detailsTitle}
            </summary>
            <div className="component-error-details-content">
              {componentName && (
                <div className="component-error-detail-item">
                  <strong>{messages.componentLabel}</strong>
                  <span>{componentName}</span>
                </div>
              )}
              <div className="component-error-detail-item">
                <strong>{messages.timestampLabel}</strong>
                <span>{errorTimestamp}</span>
              </div>
              <div className="component-error-detail-item">
                <strong>{messages.retryCountLabel}</strong>
                <span>{retryCount}</span>
              </div>
              <div className="component-error-detail-item">
                <strong>{messages.errorLabel}</strong>
                <span>{error.toString()}</span>
              </div>
              {errorInfo && (
                <div className="component-error-detail-item">
                  <pre className="component-error-stack">
                    {errorInfo.componentStack}
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
 * Wrapper component to inject language from context
 * 
 * Usage:
 * <ComponentErrorBoundary componentName="JobCard">
 *   <JobCard />
 * </ComponentErrorBoundary>
 * 
 * With custom fallback:
 * <ComponentErrorBoundary 
 *   componentName="ProfileImage"
 *   fallback={<div>Failed to load image</div>}
 * >
 *   <ProfileImage />
 * </ComponentErrorBoundary>
 */
const ComponentErrorBoundaryWrapper = ({ 
  children, 
  componentName, 
  fallback,
  onError 
}) => {
  const { language, user } = useApp();
  
  return (
    <ComponentErrorBoundary 
      language={language}
      user={user}
      componentName={componentName}
      fallback={fallback}
      onError={onError}
    >
      {children}
    </ComponentErrorBoundary>
  );
};

export default ComponentErrorBoundaryWrapper;
