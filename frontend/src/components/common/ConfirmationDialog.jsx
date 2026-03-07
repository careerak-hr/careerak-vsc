/**
 * ConfirmationDialog Component
 * 
 * A reusable confirmation dialog for critical actions
 * 
 * Features:
 * - Modal overlay with backdrop
 * - Customizable title, message, and button text
 * - Loading state support
 * - Variant support (danger, warning, info)
 * - Keyboard navigation (Escape to cancel, Enter to confirm)
 * - Focus trap
 * - Multi-language support
 * - Responsive design
 * - Accessibility compliant
 * 
 * Requirements: 6.2
 */

import React, { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import './ConfirmationDialog.css';

const ConfirmationDialog = ({
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'danger', // 'danger', 'warning', 'info'
  className = ''
}) => {
  const { language } = useApp();
  const dialogRef = useRef(null);
  const confirmButtonRef = useRef(null);

  // Focus trap and keyboard navigation
  useEffect(() => {
    // Focus the confirm button when dialog opens
    if (confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }

    // Handle keyboard events
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      } else if (e.key === 'Enter' && !isLoading) {
        onConfirm();
      }
    };

    // Trap focus within dialog
    const handleFocusTrap = (e) => {
      if (!dialogRef.current) return;

      const focusableElements = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleFocusTrap);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleFocusTrap);
      document.body.style.overflow = '';
    };
  }, [onConfirm, onCancel, isLoading]);

  // Get variant icon
  const getVariantIcon = () => {
    switch (variant) {
      case 'danger':
        return '⚠️';
      case 'warning':
        return '⚡';
      case 'info':
        return 'ℹ️';
      default:
        return '❓';
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onCancel();
    }
  };

  return (
    <div
      className="confirmation-dialog-backdrop"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`confirmation-dialog confirmation-dialog-${variant} ${className}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Dialog Icon */}
        <div className="dialog-icon" aria-hidden="true">
          {getVariantIcon()}
        </div>

        {/* Dialog Title */}
        <h2 id="dialog-title" className="dialog-title">
          {title}
        </h2>

        {/* Dialog Message */}
        <p id="dialog-message" className="dialog-message">
          {message}
        </p>

        {/* Dialog Actions */}
        <div className="dialog-actions">
          <button
            className="dialog-button dialog-button-cancel"
            onClick={onCancel}
            disabled={isLoading}
            aria-label={cancelText}
          >
            {cancelText}
          </button>

          <button
            ref={confirmButtonRef}
            className={`dialog-button dialog-button-confirm dialog-button-${variant}`}
            onClick={onConfirm}
            disabled={isLoading}
            aria-label={confirmText}
          >
            {isLoading ? (
              <>
                <span className="button-spinner" aria-hidden="true"></span>
                <span>{confirmText}</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
