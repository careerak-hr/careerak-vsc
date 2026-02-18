import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';
import './PasswordGenerator.css';

/**
 * PasswordGenerator Component
 * مكون لتوليد كلمات مرور قوية مع خيارات النسخ والتوليد الجديد
 */
function PasswordGenerator({ onPasswordGenerated }) {
  const { language } = useApp();
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState(null);

  const translations = {
    ar: {
      suggestButton: '🔑 اقتراح كلمة مرور قوية',
      generating: 'جاري التوليد...',
      copy: 'نسخ',
      copied: 'تم النسخ!',
      regenerate: 'توليد جديد',
      strength: 'القوة:',
      usePassword: 'استخدام كلمة المرور',
      generatedPassword: 'كلمة المرور المقترحة:'
    },
    en: {
      suggestButton: '🔑 Suggest Strong Password',
      generating: 'Generating...',
      copy: 'Copy',
      copied: 'Copied!',
      regenerate: 'Generate New',
      strength: 'Strength:',
      usePassword: 'Use Password',
      generatedPassword: 'Suggested Password:'
    },
    fr: {
      suggestButton: '🔑 Suggérer un mot de passe fort',
      generating: 'Génération...',
      copy: 'Copier',
      copied: 'Copié!',
      regenerate: 'Générer nouveau',
      strength: 'Force:',
      usePassword: 'Utiliser le mot de passe',
      generatedPassword: 'Mot de passe suggéré:'
    }
  };

  const t = translations[language];
  const isRTL = language === 'ar';

  /**
   * توليد كلمة مرور جديدة
   */
  const handleGenerate = async () => {
    setIsGenerating(true);
    setCopied(false);

    try {
      const response = await api.post('/auth/generate-password', {
        length: 14 // طول افتراضي
      });

      if (response.data.success) {
        const { password, strength: passwordStrength } = response.data.data;
        setGeneratedPassword(password);
        setStrength(passwordStrength);

        // إخطار المكون الأب
        if (onPasswordGenerated) {
          onPasswordGenerated(password);
        }
      }
    } catch (error) {
      console.error('Error generating password:', error);
      // في حالة الخطأ، نولد كلمة مرور محلياً
      const localPassword = generateLocalPassword();
      setGeneratedPassword(localPassword);
      
      if (onPasswordGenerated) {
        onPasswordGenerated(localPassword);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * توليد كلمة مرور محلياً (fallback)
   */
  const generateLocalPassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = uppercase + lowercase + numbers + special;

    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    for (let i = password.length; i < 14; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // خلط الأحرف
    const passwordArray = password.split('');
    for (let i = passwordArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
    }

    return passwordArray.join('');
  };

  /**
   * نسخ كلمة المرور للحافظة
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      
      // إخفاء رسالة "تم النسخ" بعد 2 ثانية
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback للمتصفحات القديمة
      const textArea = document.createElement('textarea');
      textArea.value = generatedPassword;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      className="password-generator mt-2"
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      {/* زر التوليد */}
      {!generatedPassword && (
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="suggest-password-btn"
        >
          {isGenerating ? t.generating : t.suggestButton}
        </button>
      )}

      {/* عرض كلمة المرور المولدة */}
      {generatedPassword && (
        <div className="generated-password-container">
          <p className="generated-label">
            {t.generatedPassword}
          </p>

          <div className="password-display">
            <code className="password-text">
              {generatedPassword}
            </code>

            <div className="password-actions">
              {/* زر النسخ */}
              <button
                type="button"
                onClick={handleCopy}
                className="action-btn copy-btn"
                title={t.copy}
              >
                {copied ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>

              {/* زر التوليد الجديد */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="action-btn regenerate-btn"
                title={t.regenerate}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* رسالة تأكيد النسخ */}
          {copied && (
            <p className="copy-confirmation">
              ✓ {t.copied}
            </p>
          )}

          {/* عرض قوة كلمة المرور */}
          {strength && (
            <div className="strength-display">
              <span className="strength-label">{t.strength}</span>
              <span 
                className="strength-value"
                style={{ color: strength.color }}
              >
                {strength.labelAr || strength.label}
              </span>
              <span className="strength-percentage">
                ({Math.round(strength.percentage)}%)
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PasswordGenerator;
