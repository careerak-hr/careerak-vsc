import React, { useState } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import './PasswordGenerator.css';

/**
 * مكون توليد كلمات مرور قوية
 * يوفر اقتراحات لكلمات مرور قوية مع إمكانية النسخ والتوليد الجديد
 * 
 * @param {Function} onGenerate - دالة callback تُستدعى عند توليد كلمة مرور جديدة
 * @param {string} language - اللغة الحالية (ar, en, fr)
 */
function PasswordGenerator({ onGenerate, language = 'ar' }) {
  const [generated, setGenerated] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // النصوص متعددة اللغات
  const texts = {
    ar: {
      suggestButton: '🔑 اقتراح كلمة مرور قوية',
      copyButton: 'نسخ',
      regenerateButton: 'توليد جديد',
      copiedMessage: '✓ تم النسخ!',
      generatedLabel: 'كلمة المرور المقترحة:'
    },
    en: {
      suggestButton: '🔑 Suggest Strong Password',
      copyButton: 'Copy',
      regenerateButton: 'Regenerate',
      copiedMessage: '✓ Copied!',
      generatedLabel: 'Suggested Password:'
    },
    fr: {
      suggestButton: '🔑 Suggérer un mot de passe fort',
      copyButton: 'Copier',
      regenerateButton: 'Régénérer',
      copiedMessage: '✓ Copié!',
      generatedLabel: 'Mot de passe suggéré:'
    }
  };

  const t = texts[language] || texts.ar;

  /**
   * توليد كلمة مرور قوية
   * نفس الخوارزمية المستخدمة في Backend
   */
  const generatePassword = (length = 14) => {
    // التأكد من أن الطول لا يقل عن 12
    if (length < 12) length = 12;
    if (length > 32) length = 32;

    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*(),.?":{}|<>';

    const allChars = uppercase + lowercase + numbers + special;

    let password = '';

    // ضمان وجود حرف واحد على الأقل من كل نوع
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // ملء الباقي عشوائياً
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // خلط الأحرف بشكل عشوائي (Fisher-Yates shuffle)
    const passwordArray = password.split('');
    for (let i = passwordArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
    }

    return passwordArray.join('');
  };

  /**
   * معالج توليد كلمة مرور جديدة
   */
  const handleGenerate = () => {
    setIsGenerating(true);
    
    // تأخير بسيط لإظهار animation
    setTimeout(() => {
      const password = generatePassword(14);
      setGenerated(password);
      setCopied(false);
      setIsGenerating(false);
      
      // استدعاء callback إذا وُجد
      if (onGenerate) {
        onGenerate(password);
      }
    }, 300);
  };

  /**
   * معالج نسخ كلمة المرور
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generated);
      setCopied(true);
      
      // إخفاء رسالة النجاح بعد 2 ثانية
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy password:', error);
      // Fallback: استخدام طريقة قديمة
      const textArea = document.createElement('textarea');
      textArea.value = generated;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="password-generator">
      {/* زر الاقتراح */}
      <button
        type="button"
        onClick={handleGenerate}
        className="suggest-button"
        disabled={isGenerating}
      >
        {t.suggestButton}
      </button>

      {/* عرض كلمة المرور المقترحة */}
      {generated && (
        <div className="generated-password-container">
          <label className="generated-label">{t.generatedLabel}</label>
          
          <div className="password-display">
            {/* كلمة المرور في code block */}
            <code className="password-code" dir="ltr">
              {generated}
            </code>

            {/* أزرار الإجراءات */}
            <div className="action-buttons">
              {/* زر النسخ */}
              <button
                type="button"
                onClick={handleCopy}
                className="action-button copy-button"
                title={t.copyButton}
                aria-label={t.copyButton}
              >
                {copied ? (
                  <Check size={18} className="icon-check" />
                ) : (
                  <Copy size={18} className="icon-copy" />
                )}
              </button>

              {/* زر التوليد الجديد */}
              <button
                type="button"
                onClick={handleGenerate}
                className={`action-button regenerate-button ${isGenerating ? 'spinning' : ''}`}
                title={t.regenerateButton}
                aria-label={t.regenerateButton}
                disabled={isGenerating}
              >
                <RefreshCw size={18} className="icon-refresh" />
              </button>
            </div>
          </div>

          {/* رسالة تأكيد النسخ */}
          {copied && (
            <p className="copied-message">
              {t.copiedMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default PasswordGenerator;
