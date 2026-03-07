/**
 * WithdrawalButton Component
 * 
 * Displays a withdraw button for applications that can be withdrawn
 * 
 * Features:
 * - Conditional display based on application status
 * - Confirmation dialog before withdrawal
 * - API call to withdraw application
 * - Success/error message handling
 * - Updates status timeline after withdrawal
 * - Multi-language support (ar, en, fr)
 * - Responsive design
 * 
 * Requirements: 6.1, 6.2, 6.3
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import './WithdrawalButton.css';

const WithdrawalButton = ({ 
  applicationId, 
  currentStatus, 
  onWithdrawSuccess,
  onWithdrawError,
  className = '' 
}) => {
  const { language } = useApp();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Requirement 6.1: Only show withdraw button for Pending or Reviewed status
  // Requirement 6.5: Do not allow withdrawal for Shortlisted, Accepted, or Rejected
  const withdrawableStatuses = ['Submitted', 'Reviewed'];
  const canWithdraw = withdrawableStatuses.includes(currentStatus);

  // Translations
  const translations = {
    withdrawButton: {
      ar: 'سحب الطلب',
      en: 'Withdraw Application',
      fr: 'Retirer la Candidature'
    },
    confirmTitle: {
      ar: 'تأكيد سحب الطلب',
      en: 'Confirm Withdrawal',
      fr: 'Confirmer le Retrait'
    },
    confirmMessage: {
      ar: 'هل أنت متأكد أنك تريد سحب طلبك؟ لا يمكن التراجع عن هذا الإجراء.',
      en: 'Are you sure you want to withdraw your application? This action cannot be undone.',
      fr: 'Êtes-vous sûr de vouloir retirer votre candidature? Cette action ne peut pas être annulée.'
    },
    confirmButton: {
      ar: 'نعم، سحب الطلب',
      en: 'Yes, Withdraw',
      fr: 'Oui, Retirer'
    },
    cancelButton: {
      ar: 'إلغاء',
      en: 'Cancel',
      fr: 'Annuler'
    },
    withdrawing: {
      ar: 'جاري السحب...',
      en: 'Withdrawing...',
      fr: 'Retrait en cours...'
    },
    successMessage: {
      ar: 'تم سحب طلبك بنجاح',
      en: 'Your application has been withdrawn successfully',
      fr: 'Votre candidature a été retirée avec succès'
    },
    errorMessage: {
      ar: 'فشل سحب الطلب. يرجى المحاولة مرة أخرى.',
      en: 'Failed to withdraw application. Please try again.',
      fr: 'Échec du retrait de la candidature. Veuillez réessayer.'
    },
    notAllowedMessage: {
      ar: 'لا يمكن سحب الطلب في هذه المرحلة',
      en: 'Withdrawal is not allowed at this stage',
      fr: 'Le retrait n\'est pas autorisé à ce stade'
    }
  };

  // Handle withdraw button click
  const handleWithdrawClick = () => {
    setError(null);
    setSuccess(false);
    setShowConfirmDialog(true);
  };

  // Handle withdrawal confirmation
  const handleConfirmWithdraw = async () => {
    setIsWithdrawing(true);
    setError(null);
    setSuccess(false);

    try {
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Call withdrawal API (Requirement 6.3)
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/applications/${applicationId}/withdraw`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to withdraw application');
      }

      // Success
      setSuccess(true);
      setShowConfirmDialog(false);

      // Show success message for 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

      // Call success callback
      if (onWithdrawSuccess) {
        onWithdrawSuccess(data.data);
      }

    } catch (err) {
      console.error('Error withdrawing application:', err);
      setError(err.message || translations.errorMessage[language]);
      setShowConfirmDialog(false);

      // Call error callback
      if (onWithdrawError) {
        onWithdrawError(err);
      }

      // Hide error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Handle dialog cancel
  const handleCancelWithdraw = () => {
    setShowConfirmDialog(false);
    setError(null);
  };

  // Don't render if withdrawal is not allowed
  if (!canWithdraw) {
    return null;
  }

  return (
    <div className={`withdrawal-button-container ${className}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Withdraw Button */}
      <button
        className="withdraw-button"
        onClick={handleWithdrawClick}
        disabled={isWithdrawing}
        aria-label={translations.withdrawButton[language]}
      >
        {isWithdrawing ? (
          <>
            <span className="button-spinner" aria-hidden="true"></span>
            <span>{translations.withdrawing[language]}</span>
          </>
        ) : (
          <>
            <span className="button-icon" aria-hidden="true">🔙</span>
            <span>{translations.withdrawButton[language]}</span>
          </>
        )}
      </button>

      {/* Success Message */}
      {success && (
        <div className="withdrawal-message withdrawal-success" role="alert" aria-live="polite">
          <span className="message-icon" aria-hidden="true">✅</span>
          <span>{translations.successMessage[language]}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="withdrawal-message withdrawal-error" role="alert" aria-live="assertive">
          <span className="message-icon" aria-hidden="true">❌</span>
          <span>{error}</span>
          <button
            className="message-close"
            onClick={() => setError(null)}
            aria-label={translations.cancelButton[language]}
          >
            ×
          </button>
        </div>
      )}

      {/* Confirmation Dialog (Requirement 6.2) */}
      {showConfirmDialog && (
        <ConfirmationDialog
          title={translations.confirmTitle[language]}
          message={translations.confirmMessage[language]}
          confirmText={translations.confirmButton[language]}
          cancelText={translations.cancelButton[language]}
          onConfirm={handleConfirmWithdraw}
          onCancel={handleCancelWithdraw}
          isLoading={isWithdrawing}
          variant="danger"
        />
      )}
    </div>
  );
};

export default WithdrawalButton;
