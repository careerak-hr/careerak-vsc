import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import AriaLiveRegion from './AriaLiveRegion';

/**
 * FormErrorAnnouncer Component
 * 
 * Announces form validation errors to screen readers using aria-live regions.
 * Automatically detects when errors change and announces them appropriately.
 * 
 * @component
 * @example
 * <FormErrorAnnouncer 
 *   errors={{ email: 'Invalid email', password: 'Password too short' }}
 *   language="ar"
 * />
 */
const FormErrorAnnouncer = ({ errors = {}, language = 'ar' }) => {
  const [errorMessage, setErrorMessage] = useState('');

  // Translation strings for error announcements
  const translations = {
    ar: {
      errorPrefix: 'خطأ في النموذج:',
      multipleErrors: 'يوجد {count} أخطاء في النموذج',
      fieldError: '{field}: {error}'
    },
    en: {
      errorPrefix: 'Form error:',
      multipleErrors: 'There are {count} errors in the form',
      fieldError: '{field}: {error}'
    },
    fr: {
      errorPrefix: 'Erreur de formulaire:',
      multipleErrors: 'Il y a {count} erreurs dans le formulaire',
      fieldError: '{field}: {error}'
    }
  };

  const t = translations[language] || translations.ar;

  useEffect(() => {
    const errorKeys = Object.keys(errors).filter(key => errors[key]);
    
    if (errorKeys.length === 0) {
      setErrorMessage('');
      return;
    }

    // Build error message
    let message = '';
    
    if (errorKeys.length === 1) {
      // Single error
      const field = errorKeys[0];
      const error = errors[field];
      message = `${t.errorPrefix} ${error}`;
    } else {
      // Multiple errors
      const errorCount = errorKeys.length;
      message = t.multipleErrors.replace('{count}', errorCount);
      
      // Add first few errors
      const firstErrors = errorKeys.slice(0, 3).map(key => errors[key]);
      message += '. ' + firstErrors.join('. ');
    }

    setErrorMessage(message);
  }, [errors, t]);

  return (
    <AriaLiveRegion 
      message={errorMessage} 
      politeness="assertive"
      role="alert"
    />
  );
};

FormErrorAnnouncer.propTypes = {
  /** Object containing field errors { fieldName: errorMessage } */
  errors: PropTypes.object,
  
  /** Current language for translations */
  language: PropTypes.oneOf(['ar', 'en', 'fr'])
};

export default FormErrorAnnouncer;
