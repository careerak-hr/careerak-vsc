import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from '../context/AnimationContext';
import './ToastNotification.css';

/**
 * ToastNotification Component
 * 
 * Displays temporary notification messages with auto-dismiss
 * Respects prefers-reduced-motion setting
 * 
 * Props:
 * - message: Notification message text (required)
 * - type: Notification type ('success', 'error', 'warning', 'info', default: 'info')
 * - duration: Auto-dismiss duration in ms (default: 3000, 0 = no auto-dismiss)
 * - onClose: Callback when notification is closed (optional)
 * - position: Position on screen ('top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center', default: 'top-right')
 * - className: Additional CSS classes (optional)
 * 
 * Usage:
 * <ToastNotification message="User deleted successfully" type="success" />
 * <ToastNotification message="Failed to save changes" type="error" duration={5000} />
 */
const ToastNotification = ({ 
  message, 
  type = 'info',
  duration = 3000,
  onClose,
  position = 'top-right',
  className = ''
}) => {
  const { shouldAnimate } = useAnimation();

  // Auto-dismiss after duration
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  // Type configurations
  const typeConfig = {
    success: {
      icon: '✓',
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      borderColor: 'border-green-600',
      ariaLabel: 'Success notification'
    },
    error: {
      icon: '✕',
      bgColor: 'bg-red-500',
      textColor: 'text-white',
      borderColor: 'border-red-600',
      ariaLabel: 'Error notification'
    },
    warning: {
      icon: '⚠',
      bgColor: 'bg-yellow-500',
      textColor: 'text-gray-900',
      borderColor: 'border-yellow-600',
      ariaLabel: 'Warning notification'
    },
    info: {
      icon: 'ℹ',
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
      borderColor: 'border-blue-600',
      ariaLabel: 'Information notification'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  // Position configurations
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  // Animation variants
  const toastVariants = shouldAnimate ? {
    initial: { 
      opacity: 0, 
      y: position.includes('top') ? -20 : 20,
      scale: 0.95
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: position.includes('top') ? -20 : 20,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  } : {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  if (!message) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={message}
        variants={toastVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={`toast-notification fixed ${positionClasses[position]} ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
        role="alert"
        aria-live="polite"
        aria-label={config.ariaLabel}
      >
        <div className="toast-content">
          <span className="toast-icon" aria-hidden="true">{config.icon}</span>
          <span className="toast-message">{message}</span>
          {onClose && (
            <button
              onClick={onClose}
              className="toast-close-btn"
              aria-label="Close notification"
            >
              ✕
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ToastNotification;
