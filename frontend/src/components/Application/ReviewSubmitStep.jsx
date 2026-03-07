import React, { useState } from 'react';
import { useApplicationForm } from '../../context/ApplicationContext';
import { useApp } from '../../context/AppContext';
import ApplicationPreview from './ApplicationPreview';
import './ReviewSubmitStep.css';

/**
 * ReviewSubmitStep Component (Step 5)
 * 
 * Final step of the application form that displays a preview of all entered data
 * and handles the final submission. Provides edit navigation to allow users to
 * return to specific steps for modifications.
 * 
 * Requirements: 3.1-3.6
 */
function ReviewSubmitStep({ onSubmitSuccess, onSubmitError }) {
  const {
    formData,
    setStep,
    jobPostingId,
  } = useApplicationForm();

  const { language, fontFamily } = useApp();
  const isRTL = language === 'ar';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const fontStyle = {
    fontFamily: fontFamily,
    fontWeight: 'inherit',
    fontStyle: 'inherit'
  };

  // Translations
  const translations = {
    ar: {
      successTitle: 'تم تقديم الطلب بنجاح!',
      successMessage: 'شكراً لك على التقديم. سنقوم بمراجعة طلبك وسنتواصل معك قريباً.',
      successButton: 'العودة إلى الصفحة الرئيسية',
      errorTitle: 'حدث خطأ',
      errorMessage: 'عذراً، حدث خطأ أثناء تقديم الطلب. يرجى المحاولة مرة أخرى.',
      tryAgain: 'حاول مرة أخرى',
      networkError: 'خطأ في الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت.',
      validationError: 'يرجى التأكد من ملء جميع الحقول المطلوبة.',
      serverError: 'خطأ في الخادم. يرجى المحاولة لاحقاً.',
    },
    en: {
      successTitle: 'Application Submitted Successfully!',
      successMessage: 'Thank you for applying. We will review your application and get back to you soon.',
      successButton: 'Back to Home',
      errorTitle: 'Error Occurred',
      errorMessage: 'Sorry, an error occurred while submitting your application. Please try again.',
      tryAgain: 'Try Again',
      networkError: 'Network connection error. Please check your internet connection.',
      validationError: 'Please ensure all required fields are filled.',
      serverError: 'Server error. Please try again later.',
    },
    fr: {
      successTitle: 'Candidature soumise avec succès!',
      successMessage: 'Merci pour votre candidature. Nous examinerons votre candidature et vous contacterons bientôt.',
      successButton: 'Retour à l\'accueil',
      errorTitle: 'Erreur survenue',
      errorMessage: 'Désolé, une erreur s\'est produite lors de la soumission de votre candidature. Veuillez réessayer.',
      tryAgain: 'Réessayer',
      networkError: 'Erreur de connexion réseau. Veuillez vérifier votre connexion Internet.',
      validationError: 'Veuillez vous assurer que tous les champs obligatoires sont remplis.',
      serverError: 'Erreur du serveur. Veuillez réessayer plus tard.',
    },
  };

  const t = translations[language] || translations.en;

  // Handle edit navigation
  const handleEdit = (step) => {
    setStep(step);
  };

  // Handle final submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Prepare application data
      const applicationData = {
        jobPostingId,
        formData: {
          // Personal Information
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          city: formData.city,
          
          // Education & Experience
          education: formData.education,
          experience: formData.experience,
          
          // Skills & Languages
          computerSkills: formData.computerSkills,
          softwareSkills: formData.softwareSkills,
          otherSkills: formData.otherSkills,
          languages: formData.languages,
          
          // Additional Information
          coverLetter: formData.coverLetter,
          expectedSalary: formData.expectedSalary,
          availableFrom: formData.availableFrom,
          noticePeriod: formData.noticePeriod,
        },
        files: formData.files,
        customAnswers: formData.customAnswers,
      };

      // Submit application
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Submission failed');
      }

      const result = await response.json();

      // Show success message
      setShowSuccess(true);

      // Call success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess(result.applicationId);
      }

    } catch (error) {
      console.error('Application submission error:', error);
      
      // Determine error type and set appropriate message
      let errorMessage = t.errorMessage;
      
      if (error.message === 'Failed to fetch' || error.message.includes('network')) {
        errorMessage = t.networkError;
      } else if (error.message.includes('validation')) {
        errorMessage = t.validationError;
      } else if (error.message.includes('server') || error.message.includes('500')) {
        errorMessage = t.serverError;
      }
      
      setSubmitError(errorMessage);

      // Call error callback if provided
      if (onSubmitError) {
        onSubmitError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle retry after error
  const handleRetry = () => {
    setSubmitError(null);
    handleSubmit();
  };

  // Handle success confirmation
  const handleSuccessConfirm = () => {
    // Navigate to home or job postings page
    window.location.href = '/job-postings';
  };

  // Show success confirmation
  if (showSuccess) {
    return (
      <div className={`review-submit-step ${isRTL ? 'rtl' : 'ltr'}`} style={fontStyle} role="status" aria-live="polite">
        <div className="success-container">
          <div className="success-icon" aria-hidden="true">✓</div>
          <h2 className="success-title">{t.successTitle}</h2>
          <p className="success-message">{t.successMessage}</p>
          <button
            type="button"
            className="btn-success-confirm"
            onClick={handleSuccessConfirm}
            aria-label="Return to home page"
          >
            {t.successButton}
          </button>
        </div>
      </div>
    );
  }

  // Show error message
  if (submitError) {
    return (
      <div className={`review-submit-step ${isRTL ? 'rtl' : 'ltr'}`} style={fontStyle} role="alert" aria-live="assertive">
        <div className="error-container">
          <div className="error-icon" aria-hidden="true">✕</div>
          <h2 className="error-title">{t.errorTitle}</h2>
          <p className="error-message">{submitError}</p>
          <button
            type="button"
            className="btn-retry"
            onClick={handleRetry}
            disabled={isSubmitting}
            aria-label="Retry submission"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? '...' : t.tryAgain}
          </button>
        </div>
      </div>
    );
  }

  // Show application preview
  return (
    <div className={`review-submit-step ${isRTL ? 'rtl' : 'ltr'}`} style={fontStyle} role="region" aria-labelledby="review-heading">
      <ApplicationPreview
        formData={formData}
        onEdit={handleEdit}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default ReviewSubmitStep;
