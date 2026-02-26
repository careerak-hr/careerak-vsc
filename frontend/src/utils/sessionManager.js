/**
 * Session Manager Utility
 * 
 * Provides utilities for managing user sessions, including:
 * - Checking if session is expired
 * - Warning users before session expires
 * - Refreshing tokens
 * 
 * Requirement 11.9: Session expiration handling
 */

import { jwtDecode } from 'jwt-decode';

/**
 * Check if a JWT token is expired
 * 
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is expired, false otherwise
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired (with 10 second buffer)
    return decoded.exp < currentTime + 10;
  } catch (error) {
    console.error('[SessionManager] Error decoding token:', error);
    return true;
  }
};

/**
 * Get the time remaining until token expires (in seconds)
 * 
 * @param {string} token - JWT token
 * @returns {number} Seconds until expiration, or 0 if expired/invalid
 */
export const getTimeUntilExpiration = (token) => {
  if (!token) return 0;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const timeRemaining = decoded.exp - currentTime;
    
    return Math.max(0, Math.floor(timeRemaining));
  } catch (error) {
    console.error('[SessionManager] Error decoding token:', error);
    return 0;
  }
};

/**
 * Check if token will expire soon (within the next 5 minutes)
 * 
 * @param {string} token - JWT token
 * @returns {boolean} True if token expires within 5 minutes
 */
export const isTokenExpiringSoon = (token) => {
  const timeRemaining = getTimeUntilExpiration(token);
  return timeRemaining > 0 && timeRemaining < 300; // 5 minutes
};

/**
 * Get the current user's token from localStorage
 * 
 * @returns {string|null} JWT token or null if not found
 */
export const getCurrentToken = () => {
  return localStorage.getItem('token');
};

/**
 * Check if the current session is valid
 * 
 * @returns {boolean} True if session is valid (token exists and not expired)
 */
export const isSessionValid = () => {
  const token = getCurrentToken();
  return token && !isTokenExpired(token);
};

/**
 * Clear the current session
 * Removes token and user data from localStorage
 */
export const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('redirectAfterLogin');
};

/**
 * Start a session expiration warning timer
 * Calls the callback when the session is about to expire (5 minutes before)
 * 
 * @param {Function} onWarning - Callback to call when session is about to expire
 * @returns {number} Timer ID that can be used to clear the timer
 */
export const startExpirationWarningTimer = (onWarning) => {
  const token = getCurrentToken();
  if (!token) return null;
  
  const timeUntilExpiration = getTimeUntilExpiration(token);
  const warningTime = Math.max(0, (timeUntilExpiration - 300) * 1000); // 5 minutes before expiration
  
  if (warningTime <= 0) {
    // Already in warning period
    onWarning();
    return null;
  }
  
  return setTimeout(() => {
    onWarning();
  }, warningTime);
};

/**
 * Format time remaining in a human-readable format
 * 
 * @param {number} seconds - Seconds remaining
 * @returns {string} Formatted time string (e.g., "5 minutes", "1 hour")
 */
export const formatTimeRemaining = (seconds) => {
  if (seconds < 60) {
    return `${seconds} ثانية`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} دقيقة`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours} ساعة و ${minutes} دقيقة` : `${hours} ساعة`;
  }
};

export default {
  isTokenExpired,
  getTimeUntilExpiration,
  isTokenExpiringSoon,
  getCurrentToken,
  isSessionValid,
  clearSession,
  startExpirationWarningTimer,
  formatTimeRemaining
};
