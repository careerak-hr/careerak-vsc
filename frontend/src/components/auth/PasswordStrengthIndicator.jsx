import React, { useState, useEffect, useMemo } from 'react';
import zxcvbn from 'zxcvbn';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';
import './PasswordStrengthIndicator.css';

/**
 * PasswordStrengthIndicator Component
 * مؤشر قوة كلمة المرور مع شريط ملون ومتطلبات
 * يستخدم zxcvbn لحساب القوة ويتحقق من Backend API
 */
function PasswordStrengthIndicator({ password, onStrengthChange }) {
  const { language } = useApp();
  const [backendValidation, setBackendValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  // حساب قوة كلمة المرور محلياً
  const localStrength = useMemo(() => {
    if (!password) return null;

    const result = zxcvbn(password);
    
    // التحقق من المتطلبات
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const labels = {
      ar: ['ضعيف جداً', 'ضعيف', 'متوسط', 'جيد', 'قوي'],
      en: ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'],
      fr: ['Très faible', 'Faible', 'Moyen', 'Bon', 'Fort']
    };

    const colors = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#10b981'];

    return {
      score: result.score,
      label: labels[language][result.score],
      color: colors[result.score],
      percentage: (result.score / 4) * 100,
      requirements,
      feedback: result.feedback.suggestions,
      crackTime: result.crack_times_display.offline_slow_hashing_1e4_per_second
    };
  }, [password, language]);

  // التحقق من Backend (debounced)
  useEffect(() => {
    if (!password || password.length < 3) {
      setBackendValidation(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsValidating(true);
      try {
        const response = await api.post('/auth/validate-password', { password });
        setBackendValidation(response.data);
        
        // إخطار المكون الأب بالتغيير
        if (onStrengthChange) {
          onStrengthChange({
            ...localStrength,
            backendValidation: response.data
          });
        }
      } catch (error) {
        console.error('Password validation error:', error);
        setBackendValidation(null);
      } finally {
        setIsValidating(false);
      }
    }, 500); // debounce 500ms

    return () => clearTimeout(timer);
  }, [password, localStrength, onStrengthChange]);

  if (!password) return null;

  const translations = {
    ar: {
      requirements: 'المتطلبات:',
      length: '8 أحرف على الأقل',
      uppercase: 'حرف كبير واحد على الأقل',
      lowercase: 'حرف صغير واحد على الأقل',
      number: 'رقم واحد على الأقل',
      special: 'رمز خاص واحد على الأقل',
      crackTime: 'وقت الاختراق:',
      suggestions: 'نصائح لتحسين كلمة المرور:',
      validating: 'جاري التحقق...'
    },
    en: {
      requirements: 'Requirements:',
      length: 'At least 8 characters',
      uppercase: 'At least one uppercase letter',
      lowercase: 'At least one lowercase letter',
      number: 'At least one number',
      special: 'At least one special character',
      crackTime: 'Crack time:',
      suggestions: 'Suggestions to improve your password:',
      validating: 'Validating...'
    },
    fr: {
      requirements: 'Exigences:',
      length: 'Au moins 8 caractères',
      uppercase: 'Au moins une lettre majuscule',
      lowercase: 'Au moins une lettre minuscule',
      number: 'Au moins un chiffre',
      special: 'Au moins un caractère spécial',
      crackTime: 'Temps de piratage:',
      suggestions: 'Suggestions pour améliorer votre mot de passe:',
      validating: 'Validation...'
    }
  };

  const t = translations[language];

  return (
    <div className="password-strength-indicator mt-2">
      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${localStrength.percentage}%`,
            backgroundColor: localStrength.color
          }}
        />
      </div>

      {/* Label and Crack Time */}
      <div className="flex justify-between items-center mt-1">
        <span 
          className="text-sm font-semibold"
          style={{ color: localStrength.color }}
        >
          {localStrength.label}
        </span>
        <span className="text-xs text-gray-500">
          {t.crackTime} {localStrength.crackTime}
        </span>
      </div>

      {/* Validating Indicator */}
      {isValidating && (
        <div className="text-xs text-blue-600 mt-1">
          {t.validating}
        </div>
      )}

      {/* Requirements Checklist */}
      <div className="mt-3 space-y-1">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          {t.requirements}
        </p>
        
        <RequirementItem 
          met={localStrength.requirements.length}
          text={t.length}
          language={language}
        />
        <RequirementItem 
          met={localStrength.requirements.uppercase}
          text={t.uppercase}
          language={language}
        />
        <RequirementItem 
          met={localStrength.requirements.lowercase}
          text={t.lowercase}
          language={language}
        />
        <RequirementItem 
          met={localStrength.requirements.number}
          text={t.number}
          language={language}
        />
        <RequirementItem 
          met={localStrength.requirements.special}
          text={t.special}
          language={language}
        />
      </div>

      {/* Feedback/Suggestions */}
      {localStrength.feedback && localStrength.feedback.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-blue-900 mb-1">
            {t.suggestions}
          </p>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
            {localStrength.feedback.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Backend Validation Results (if available) */}
      {backendValidation && backendValidation.suggestions && (
        <div className="mt-2 text-xs text-gray-600">
          <ul className="list-disc list-inside">
            {backendValidation.suggestions.map((suggestion, i) => (
              <li key={i}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * RequirementItem Component
 * عنصر متطلب واحد مع أيقونة ✓/✗
 */
function RequirementItem({ met, text, language }) {
  const isRTL = language === 'ar';
  
  return (
    <div 
      className={`flex items-center gap-2 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <span className="flex-shrink-0">
        {met ? (
          <svg 
            className="w-4 h-4 text-green-500" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
              clipRule="evenodd" 
            />
          </svg>
        ) : (
          <svg 
            className="w-4 h-4 text-gray-400" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
              clipRule="evenodd" 
            />
          </svg>
        )}
      </span>
      <span className={met ? 'text-green-700 font-medium' : 'text-gray-500'}>
        {text}
      </span>
    </div>
  );
}

export default PasswordStrengthIndicator;
