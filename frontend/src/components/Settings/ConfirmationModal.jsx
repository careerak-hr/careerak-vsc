import React, { useEffect, useRef } from 'react';
import './ConfirmationModal.css';

/**
 * Confirmation modal for sensitive actions
 * 
 * @param {boolean} isOpen - Whether modal is open
 * @param {Function} onClose - Close handler
 * @param {Function} onConfirm - Confirm handler
 * @param {string} title - Modal title
 * @param {string} message - Confirmation message
 * @param {string} confirmText - Confirm button text (default: "تأكيد")
 * @param {string} cancelText - Cancel button text (default: "إلغاء")
 * @param {string} variant - Variant type: 'danger' | 'warning' | 'info' (default: 'warning')
 * @param {boolean} requiresTyping - Requires user to type confirmation text (default: false)
 * @param {string} confirmationText - Text user must type to confirm (default: "تأكيد")
 */
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  variant = 'warning',
  requiresTyping = false,
  confirmationText = 'تأكيد',
  children
}) => {
  const [typedText, setTypedText] = React.useState('');
  const [isConfirming, setIsConfirming] = React.useState(false);
  const modalRef = useRef(null);
  const confirmButtonRef = useRef(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTypedText('');
      setIsConfirming(false);
      // Focus confirm button or input
      setTimeout(() => {
        if (requiresTyping) {
          const input = modalRef.current?.querySelector('input');
          input?.focus();
        } else {
          confirmButtonRef.current?.focus();
        }
      }, 100);
    }
  }, [isOpen, requiresTyping]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen && !isConfirming) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, isConfirming, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleConfirm = async () => {
    if (isConfirming) return;

    try {
      setIsConfirming(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Confirmation error:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isConfirming) {
      onClose();
    }
  };

  const canConfirm = !requiresTyping || typedText.trim() === confirmationText;

  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
            <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2"/>
            <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2"/>
          </svg>
        );
      case 'warning':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeWidth="2"/>
            <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2"/>
            <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2"/>
          </svg>
        );
      case 'info':
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
            <line x1="12" y1="16" x2="12" y2="12" strokeWidth="2"/>
            <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2"/>
          </svg>
        );
    }
  };

  return (
    <div 
      className="confirmation-modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
      aria-describedby="confirmation-modal-message"
    >
      <div className={`confirmation-modal ${variant}`} ref={modalRef}>
        <div className="modal-icon">
          {getIcon()}
        </div>

        <h2 id="confirmation-modal-title" className="modal-title">
          {title}
        </h2>

        <p id="confirmation-modal-message" className="modal-message">
          {message}
        </p>

        {children && (
          <div className="modal-content">
            {children}
          </div>
        )}

        {requiresTyping && (
          <div className="confirmation-input-container">
            <label htmlFor="confirmation-input" className="input-label">
              اكتب "{confirmationText}" للتأكيد:
            </label>
            <input
              id="confirmation-input"
              type="text"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={confirmationText}
              className="confirmation-input"
              disabled={isConfirming}
              autoComplete="off"
            />
          </div>
        )}

        <div className="modal-actions">
          <button
            className="cancel-button"
            onClick={onClose}
            disabled={isConfirming}
            type="button"
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            className={`confirm-button ${variant}`}
            onClick={handleConfirm}
            disabled={!canConfirm || isConfirming}
            type="button"
          >
            {isConfirming ? 'جاري التنفيذ...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
