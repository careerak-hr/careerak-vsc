import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

/**
 * SessionExpirationHandler Component
 * 
 * Handles session expiration events and shows appropriate messages to the user.
 * Requirement 11.9: Detect expired sessions, redirect to login, show session expired message
 * 
 * @component
 */
const SessionExpirationHandler = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();

  useEffect(() => {
    // Handle session expiration event
    const handleSessionExpired = (event) => {
      const { message, code } = event.detail;
      
      // Show toast notification
      if (showToast) {
        showToast(message, 'error');
      } else {
        // Fallback to alert if toast is not available
        alert(message);
      }
      
      // Log the event
      console.warn('[SessionExpiration]', code, message);
      
      // Navigate to login page with session expired flag
      navigate('/login?session=expired', { replace: true });
    };

    // Handle insufficient permissions event
    const handleInsufficientPermissions = (event) => {
      const { message, requiredRoles, userRole } = event.detail;
      
      // Show toast notification
      if (showToast) {
        showToast(message, 'error');
      } else {
        alert(message);
      }
      
      // Log the event
      console.warn('[InsufficientPermissions]', {
        requiredRoles,
        userRole,
        message
      });
      
      // Navigate back to home or previous page
      navigate(-1);
    };

    // Add event listeners
    window.addEventListener('sessionExpired', handleSessionExpired);
    window.addEventListener('insufficientPermissions', handleInsufficientPermissions);

    // Cleanup
    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpired);
      window.removeEventListener('insufficientPermissions', handleInsufficientPermissions);
    };
  }, [navigate, showToast]);

  // This component doesn't render anything
  return null;
};

export default SessionExpirationHandler;
