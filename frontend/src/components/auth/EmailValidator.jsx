import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';
import './EmailValidator.css';

/**
 * EmailValidator Component
 * التحقق الفوري من صحة البريد الإلكتروني
 * مع اقتراحات لتصحيح الأخطاء الشائعة
 */
function EmailValidator({ value, onChange, onValidation }) {
  const { language } = useApp();
  const [validation, setValidation] = useState(null);
  const [checking, setChecking] = useState(false);
  
  // Debounced validation
  useEffect(() => {
    if (!value) {
      setValidation(null);
      if (onValidation) onValidation(null);
      return;
    }
    
    const timer = setTimeout(async () => {
      setChecking(true);
      try {
        const response = await api.post('/auth/check-email', { email: value });
        const result = response.data;
        setValidation(result);
        if (onValidation) onValidation(result);
      } catch (error) {
        console.error('خطأ في التحقق من البريد:', error);
        const errorResult = {
          success: false,
          valid: false,
          error: language === 'ar' ? 'حدث خطأ في التحقق' : 'Validation error',
          errorEn: 'Validation error'
        };
        setValidation(errorResult);
        if (onValidation) onValidation(errorResult);
      } finally {
        setChecking(false);
      }
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timer);
  }, [value, language, onValidation]);
  
  const getStatusIcon = () => {
    if (checking) {
      return (
        <svg className="email-validator-icon checking" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="60" strokeDashoffset="0">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 12 12"
              to="360 12 12"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      );
    }
    
    if (validation?.valid) {
      return (
        <svg className="email-validator-icon valid" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#10b981" />
          <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    
    if (validation?.valid === false) {
      return (
        <svg className="email-validator-icon invalid" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#ef4444" />
          <path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
    
    return null;
  };
  
  const getErrorMessage = () => {
    if (!validation || validation.valid) return null;
    
    const errorText = language === 'ar' ? validation.error : validation.errorEn;
    
    return (
      <div className="email-validator-message error">
        <span>{errorText}</span>
        
        {/* اقتراح التصحيح */}
        {validation.suggestion && (
          <button
            type="button"
            onClick={() => onChange(validation.suggestion)}
            className="email-validator-suggestion"
          >
            {validation.suggestion}
          </button>
        )}
        
        {/* رابط تسجيل الدخول */}
        {validation.action === 'login' && (
          <a href="/login" className="email-validator-login-link">
            {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
          </a>
        )}
      </div>
    );
  };
  
  return (
    <div className="email-validator">
      <div className="email-validator-input-wrapper">
        <input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`email-validator-input ${validation?.valid === false ? 'invalid' : ''} ${validation?.valid === true ? 'valid' : ''}`}
          placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        />
        
        {/* Status Icon */}
        <div className="email-validator-icon-wrapper">
          {getStatusIcon()}
        </div>
      </div>
      
      {/* Error/Success Message */}
      {getErrorMessage()}
      
      {validation?.valid && (
        <div className="email-validator-message success">
          {language === 'ar' ? '✓ البريد الإلكتروني متاح' : '✓ Email is available'}
        </div>
      )}
    </div>
  );
}

export default EmailValidator;
