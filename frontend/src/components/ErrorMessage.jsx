import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { feedbackVariants } from '../utils/animationVariants';
import { useAnimation } from '../context/AnimationContext';
import './FeedbackMessages.css';

/**
 * ErrorMessage Component
 * 
 * Displays error messages with shake animation
 * Respects prefers-reduced-motion setting
 * 
 * Props:
 * - message: Error message text (required)
 * - className: Additional CSS classes (optional)
 * - icon: Custom icon (optional, default: ⚠️)
 * - variant: Animation variant ('shake' or 'errorSlide', default: 'shake')
 * 
 * Usage:
 * <ErrorMessage message="Invalid email address" />
 * <ErrorMessage message="Password is required" variant="errorSlide" />
 */
const ErrorMessage = ({ 
  message, 
  className = '', 
  icon = '⚠️',
  variant = 'shake'
}) => {
  const { shouldAnimate } = useAnimation();

  if (!message) return null;

  const animationVariant = variant === 'errorSlide' 
    ? feedbackVariants.errorSlide 
    : feedbackVariants.shake;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={message}
        variants={shouldAnimate ? animationVariant : undefined}
        initial={shouldAnimate ? "initial" : undefined}
        animate={shouldAnimate ? "animate" : undefined}
        exit={shouldAnimate ? "exit" : undefined}
        className={`error-message ${className}`}
        role="alert"
        aria-live="assertive"
      >
        <span className="error-icon" aria-hidden="true">{icon}</span>
        <span className="error-text">{message}</span>
      </motion.div>
    </AnimatePresence>
  );
};

export default ErrorMessage;
