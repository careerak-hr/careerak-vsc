import React from 'react';
import { useFocusTrap } from '../Accessibility/FocusTrap';
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message, confirmText, cancelText, language }) => {
  // Focus trap for accessibility - Escape key closes modal
  const modalRef = useFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="confirm-modal-backdrop" dir={dir}>
      <div ref={modalRef} className="confirm-modal-content" dir={dir}>
        <p className="confirm-modal-message" dir={dir}>
          {message}
        </p>
        <div className={`confirm-modal-buttons ${!cancelText ? 'justify-center' : ''}`}>
          <button onClick={onConfirm} className={`confirm-modal-btn ${!cancelText ? 'w-full' : 'flex-1'}`}>
            {confirmText || 'Confirm'}
          </button>
          {cancelText && (
            <button onClick={onClose || (() => {})} className="confirm-modal-btn">
              {cancelText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
