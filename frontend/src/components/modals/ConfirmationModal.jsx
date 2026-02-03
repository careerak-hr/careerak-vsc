import React from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message, confirmText, cancelText, language }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-backdrop">
      <div className="confirm-modal-content">
        <p className="confirm-modal-message" dir={language === 'ar' ? 'rtl' : 'ltr'}>
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
