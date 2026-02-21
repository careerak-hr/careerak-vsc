import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { logError } from '../../utils/errorTracking';
import NetworkError from './NetworkError';
import errorBoundaryTranslations from '../../data/errorBoundaryTranslations.json';
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
      // Check if this is a network error
      if (this.state.error?.networkError || this.state.error?.isNetworkError) {
        return (
          <div className="route-error-boundary-container">
            <NetworkError
              error={this.state.error.networkError || this.state.error}
              onRetry={this.handleRetry}
              onDismiss={this.handleGoHome}
              size="large"
              showDetails={process.env.NODE_ENV === 'development'}
              autoRetryOnline={true}
              maxAutoRetries={3}
            />
          </div>
        );
      }

      // FR-ERR-6: Full-page error UI for non-network errors
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
 * Task 7.5.4: Use i18n for error messages
 */
const RouteErrorUI = ({ error, errorInfo, errorTimestamp, onRetry, onGoHome, language }) => {
  // Task 7.5.4: Use i18n translation file instead of hardcoded messages
  const messages = errorBoundaryTranslations[language]?.routeError || errorBoundaryTranslations.ar.routeError;

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
