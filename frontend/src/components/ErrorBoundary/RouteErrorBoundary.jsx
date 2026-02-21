import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { logError } from '../../utils/errorTracking';
import './RouteErrorBoundary.css';

/**
 * RouteErrorBoundary - Full-page error boundary for route-level errors
 * 
 * Requirements:
 * - FR-ERR-1: Catch component errors with error boundary
 * - FR-ERR-2: Display user-friendly error messages in Arabic, English, or French
 * - FR-ERR-3: Log error details (component, stack trace, timestamp) to console
 * - FR-ERR-4: Provide "Retry" button to attempt recovery
 * - FR-ERR-5: Provide "Go Home" button to navigate to homepage
 * - FR-ERR-6: Display full-page error boundary for route-level errors
 * - FR-ERR-8: Reset error boundary and re-render on retry
 */
class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorTimestamp: null,
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
    const componentName = errorInfo.componentStack.split('\n')[1]?.trim() || 'Unknown';
    
    console.error('=== RouteErrorBoundary Error ===');
    console.error('Timestamp:', timestamp);
    console.error('Component:', componentName);
    
    // FR-ERR-3: Include user ID if authenticated
    if (this.props.user && this.props.user._id) {
      console.error('User ID:', this.props.user._id);
    }
    
    console.error('Error:', error);
    console.error('Stack Trace:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('================================');

    // Store error details in state
    this.setState({
      error: error,
      errorInfo: errorInfo,
      errorTimestamp: timestamp,
    });

    // Send to error tracking service (prepared for future integration)
    logError(error, {
      component: componentName,
      action: 'route-render',
      userId: this.props.user?._id,
      level: 'error',
      extra: {
        componentStack: errorInfo.componentStack,
        timestamp: timestamp,
        errorBoundary: 'RouteErrorBoundary',
      },
    });
  }

  // FR-ERR-8: Reset error boundary and re-render
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorTimestamp: null,
    });
    // Reload the page to reset the application state
    window.location.reload();
  };

  // FR-ERR-5: Navigate to homepage
  handleGoHome = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorTimestamp: null,
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // FR-ERR-6: Full-page error UI
      return (
        <RouteErrorUI
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorTimestamp={this.state.errorTimestamp}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          language={this.props.language}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * RouteErrorUI - Full-page error display component
 * FR-ERR-2: User-friendly error messages in multiple languages
 */
const RouteErrorUI = ({ error, errorInfo, errorTimestamp, onRetry, onGoHome, language }) => {
  // FR-ERR-2: Multi-language error messages
  const errorMessages = {
    ar: {
      title: 'عذراً، حدث خطأ غير متوقع',
      description: 'نعتذر عن هذا الإزعاج. حدث خطأ أثناء تحميل الصفحة.',
      retryButton: 'إعادة المحاولة',
      homeButton: 'العودة للرئيسية',
      detailsTitle: 'تفاصيل الخطأ (للمطورين)',
      errorLabel: 'الخطأ:',
      timestampLabel: 'الوقت:',
      stackLabel: 'التتبع:',
    },
    en: {
      title: 'Sorry, an unexpected error occurred',
      description: 'We apologize for the inconvenience. An error occurred while loading the page.',
      retryButton: 'Retry',
      homeButton: 'Go Home',
      detailsTitle: 'Error Details (for developers)',
      errorLabel: 'Error:',
      timestampLabel: 'Timestamp:',
      stackLabel: 'Stack:',
    },
    fr: {
      title: 'Désolé, une erreur inattendue s\'est produite',
      description: 'Nous nous excusons pour le désagrément. Une erreur s\'est produite lors du chargement de la page.',
      retryButton: 'Réessayer',
      homeButton: 'Retour à l\'accueil',
      detailsTitle: 'Détails de l\'erreur (pour les développeurs)',
      errorLabel: 'Erreur:',
      timestampLabel: 'Horodatage:',
      stackLabel: 'Trace:',
    },
  };

  const messages = errorMessages[language] || errorMessages.ar;

  // Animation variants for error display
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeInOut' },
    },
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      className="route-error-boundary-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      role="alert"
      aria-live="assertive"
    >
      <motion.div
        className="route-error-boundary-card"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Error Icon */}
        <div className="route-error-icon" aria-hidden="true">
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
          </svg>
        </div>

        {/* Error Title */}
        <h1 className="route-error-title">{messages.title}</h1>

        {/* Error Description */}
        <p className="route-error-description">{messages.description}</p>

        {/* Action Buttons */}
        <div className="route-error-actions">
          {/* FR-ERR-4: Retry button */}
          <button
            onClick={onRetry}
            className="route-error-btn route-error-btn-primary"
            aria-label={messages.retryButton}
          >
            {messages.retryButton}
          </button>

          {/* FR-ERR-5: Go Home button */}
          <button
            onClick={onGoHome}
            className="route-error-btn route-error-btn-secondary"
            aria-label={messages.homeButton}
          >
            {messages.homeButton}
          </button>
        </div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="route-error-details">
            <summary className="route-error-details-summary">
              {messages.detailsTitle}
            </summary>
            <div className="route-error-details-content">
              <div className="route-error-detail-item">
                <strong>{messages.timestampLabel}</strong>
                <span>{errorTimestamp}</span>
              </div>
              <div className="route-error-detail-item">
                <strong>{messages.errorLabel}</strong>
                <span>{error.toString()}</span>
              </div>
              {errorInfo && (
                <div className="route-error-detail-item">
                  <strong>{messages.stackLabel}</strong>
                  <pre className="route-error-stack">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}
      </motion.div>
    </motion.div>
  );
};

// Wrapper component to inject language from context
const RouteErrorBoundaryWrapper = ({ children }) => {
  const { language, user } = useApp();
  
  return (
    <RouteErrorBoundary language={language} user={user}>
      {children}
    </RouteErrorBoundary>
  );
};

export default RouteErrorBoundaryWrapper;
