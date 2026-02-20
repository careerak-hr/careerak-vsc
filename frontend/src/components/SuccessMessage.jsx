import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { feedbackVariants } from '../utils/animationVariants';
import { useAnimation } from '../context/AnimationContext';
import './FeedbackMessages.css';

/**
 * SuccessMessage Component
 * 
 * Displays success messages with bounce animation
 * Respects prefers-reduced-motion setting
 * 
 * Props:
 * - message: Success message text (required)
 * - className: Additional CSS classes (optional)
 * - icon: Custom icon (optional, default: ✅)
 * - variant: Animation variant ('bounce' or 'successScale', default: 'bounce')
 * 
 * Usage:
 * <SuccessMessage message="Profile updated successfully!" />
 * <SuccessMessage message="Job posted!" variant="successScale" />
 */
const SuccessMessage = ({ 
  message, 
  className = '', 
  icon = '✅',
  variant = 'bounce'
}) => {
  const { shouldAnimate } = useAnimation();

  if (!message) return null;

  const animationVariant = variant === 'successScale' 
    ? feedbackVariants.successScale 
    : feedbackVariants.bounce;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={message}
        variants={shouldAnimate ? animationVariant : undefined}
        initial={shouldAnimate ? "initial" : undefined}
        animate={shouldAnimate ? "animate" : undefined}
        exit={shouldAnimate ? "exit" : undefined}
        className={`success-message ${className}`}
        role="status"
        aria-live="polite"
      >
        <span className="success-icon" aria-hidden="true">{icon}</span>
        <span className="success-text">{message}</span>
      </motion.div>
    </AnimatePresence>
  );
};

export default SuccessMessage;
