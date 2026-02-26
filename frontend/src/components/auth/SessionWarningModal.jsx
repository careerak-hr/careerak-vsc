import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { 
  isSessionValid, 
  getTimeUntilExpiration, 
  formatTimeRemaining,
  clearSession
} from '../../utils/sessionManager';

/**
 * SessionWarningModal Component
 * 
 * Shows a warning modal when the user's session is about to expire.
 * Gives the user the option to continue their session or logout.
 * 
 * Requirement 11.9: Show session expired message and redirect to login
 * 
 * @component
 */
const SessionWarningModal = ({ warningThreshold = 300 }) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check session validity every 10 seconds
    const checkInterval = setInterval(() => {
      if (!isSessionValid()) {
        // Session is invalid, clear and redirect
        clearSession();
        navigate('/login?session=expired');
        return;
      }

      const remaining = getTimeUntilExpiration(localStorage.getItem('token'));
      setTimeRemaining(remaining);

      // Show warning if within threshold
      if (remaining > 0 && remaining <= warningThreshold && !showWarning) {
        setShowWarning(true);
      }

      // Auto-logout if expired
      if (remaining <= 0) {
        handleLogout();
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(checkInterval);
  }, [showWarning, warningThreshold, navigate]);

  const handleContinue = () => {
    // In a real app, you would refresh the token here
    // For now, just close the modal
    setShowWarning(false);
    
    // TODO: Implement token refresh
    console.log('[SessionWarning] User chose to continue session');
  };

  const handleLogout = () => {
    clearSession();
    setShowWarning(false);
    navigate('/login?session=expired');
  };

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-4">
            <svg
              className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            تنبيه: الجلسة على وشك الانتهاء
          </h3>

          {/* Message */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            ستنتهي جلستك خلال {formatTimeRemaining(timeRemaining)}.
            <br />
            هل تريد الاستمرار في استخدام التطبيق؟
          </p>

          {/* Countdown */}
          <div className="mb-6">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              دقائق:ثواني
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleContinue}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              الاستمرار
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

SessionWarningModal.propTypes = {
  warningThreshold: PropTypes.number
};

export default SessionWarningModal;
