import React from 'react';
import './EnhancedErrorMessage.css';

/**
 * EnhancedErrorMessage Component
 * 
 * Displays clear, specific error messages with visual clarity and actionable suggestions.
 * 
 * @param {Object} props
 * @param {string} props.error - The error message key from translations
 * @param {string} props.fieldName - The field name (e.g., 'email', 'password')
 * @param {string} props.language - Current language ('ar', 'en', 'fr')
 * @param {Function} props.onSuggestionClick - Callback when a suggestion is clicked
 * @param {string} props.className - Additional CSS classes
 */
export default function EnhancedErrorMessage({ 
  error, 
  fieldName, 
  language = 'ar', 
  onSuggestionClick,
  className = '' 
}) {
  if (!error) return null;

  const isRTL = language === 'ar';

  // Get suggestions based on field and error type
  const getSuggestions = () => {
    const suggestions = {
      ar: {
        email: {
          invalid: [
            { text: 'تأكد من وجود @ في البريد', action: 'check_format' },
            { text: 'تحقق من اسم النطاق (مثال: gmail.com)', action: 'check_domain' },
            { text: 'تجنب المسافات في البريد', action: 'remove_spaces' }
          ],
          exists: [
            { text: 'سجل الدخول بدلاً من التسجيل', action: 'login' },
            { text: 'استخدم بريد إلكتروني آخر', action: 'change_email' },
            { text: 'استرجع كلمة المرور إذا نسيتها', action: 'forgot_password' }
          ],
          required: [
            { text: 'أدخل بريدك الإلكتروني', action: 'focus_field' },
            { text: 'استخدم بريد صحيح (مثال: user@example.com)', action: 'show_example' }
          ]
        },
        password: {
          weak: [
            { text: 'استخدم 8 أحرف على الأقل', action: 'increase_length' },
            { text: 'أضف حرف كبير وحرف صغير', action: 'add_case' },
            { text: 'أضف رقم ورمز خاص (!@#$%)', action: 'add_special' },
            { text: 'اقترح كلمة مرور قوية', action: 'generate_password' }
          ],
          mismatch: [
            { text: 'تأكد من كتابة نفس كلمة المرور', action: 'check_match' },
            { text: 'انسخ كلمة المرور والصقها في التأكيد', action: 'copy_paste' },
            { text: 'اظهر كلمة المرور للتحقق', action: 'show_password' }
          ],
          required: [
            { text: 'أدخل كلمة مرور قوية', action: 'focus_field' },
            { text: 'استخدم 8 أحرف على الأقل', action: 'show_requirements' }
          ]
        },
        phone: {
          invalid: [
            { text: 'استخدم أرقام فقط (بدون مسافات أو رموز)', action: 'remove_symbols' },
            { text: 'تأكد من الطول (7-15 رقم)', action: 'check_length' },
            { text: 'اختر كود البلد الصحيح', action: 'check_country_code' }
          ],
          required: [
            { text: 'أدخل رقم هاتفك', action: 'focus_field' },
            { text: 'استخدم أرقام فقط', action: 'show_example' }
          ]
        },
        birthDate: {
          invalid: [
            { text: 'يجب أن يكون عمرك 18 سنة على الأقل', action: 'check_age' },
            { text: 'تحقق من التاريخ المدخل', action: 'verify_date' },
            { text: 'اتصل بالدعم إذا كان عمرك صحيح', action: 'contact_support' }
          ],
          required: [
            { text: 'اختر تاريخ ميلادك', action: 'focus_field' },
            { text: 'استخدم التقويم لاختيار التاريخ', action: 'use_calendar' }
          ]
        },
        required: [
          { text: 'املأ هذا الحقل', action: 'focus_field' },
          { text: 'هذا الحقل إجباري', action: 'show_info' }
        ]
      },
      en: {
        email: {
          invalid: [
            { text: 'Make sure @ is present', action: 'check_format' },
            { text: 'Check domain name (e.g., gmail.com)', action: 'check_domain' },
            { text: 'Avoid spaces in email', action: 'remove_spaces' }
          ],
          exists: [
            { text: 'Login instead of registering', action: 'login' },
            { text: 'Use a different email', action: 'change_email' },
            { text: 'Recover password if forgotten', action: 'forgot_password' }
          ],
          required: [
            { text: 'Enter your email address', action: 'focus_field' },
            { text: 'Use valid email (e.g., user@example.com)', action: 'show_example' }
          ]
        },
        password: {
          weak: [
            { text: 'Use at least 8 characters', action: 'increase_length' },
            { text: 'Add uppercase and lowercase letters', action: 'add_case' },
            { text: 'Add number and special character (!@#$%)', action: 'add_special' },
            { text: 'Suggest strong password', action: 'generate_password' }
          ],
          mismatch: [
            { text: 'Make sure to type the same password', action: 'check_match' },
            { text: 'Copy password and paste in confirmation', action: 'copy_paste' },
            { text: 'Show password to verify', action: 'show_password' }
          ],
          required: [
            { text: 'Enter a strong password', action: 'focus_field' },
            { text: 'Use at least 8 characters', action: 'show_requirements' }
          ]
        },
        phone: {
          invalid: [
            { text: 'Use numbers only (no spaces or symbols)', action: 'remove_symbols' },
            { text: 'Check length (7-15 digits)', action: 'check_length' },
            { text: 'Select correct country code', action: 'check_country_code' }
          ],
          required: [
            { text: 'Enter your phone number', action: 'focus_field' },
            { text: 'Use numbers only', action: 'show_example' }
          ]
        },
        birthDate: {
          invalid: [
            { text: 'You must be at least 18 years old', action: 'check_age' },
            { text: 'Verify the entered date', action: 'verify_date' },
            { text: 'Contact support if age is correct', action: 'contact_support' }
          ],
          required: [
            { text: 'Select your birth date', action: 'focus_field' },
            { text: 'Use calendar to select date', action: 'use_calendar' }
          ]
        },
        required: [
          { text: 'Fill this field', action: 'focus_field' },
          { text: 'This field is required', action: 'show_info' }
        ]
      },
      fr: {
        email: {
          invalid: [
            { text: 'Assurez-vous que @ est présent', action: 'check_format' },
            { text: 'Vérifiez le nom de domaine (ex: gmail.com)', action: 'check_domain' },
            { text: 'Évitez les espaces dans l\'email', action: 'remove_spaces' }
          ],
          exists: [
            { text: 'Connectez-vous au lieu de vous inscrire', action: 'login' },
            { text: 'Utilisez un autre email', action: 'change_email' },
            { text: 'Récupérez le mot de passe si oublié', action: 'forgot_password' }
          ],
          required: [
            { text: 'Entrez votre adresse email', action: 'focus_field' },
            { text: 'Utilisez un email valide (ex: user@example.com)', action: 'show_example' }
          ]
        },
        password: {
          weak: [
            { text: 'Utilisez au moins 8 caractères', action: 'increase_length' },
            { text: 'Ajoutez majuscules et minuscules', action: 'add_case' },
            { text: 'Ajoutez chiffre et caractère spécial (!@#$%)', action: 'add_special' },
            { text: 'Suggérer un mot de passe fort', action: 'generate_password' }
          ],
          mismatch: [
            { text: 'Assurez-vous de taper le même mot de passe', action: 'check_match' },
            { text: 'Copiez et collez le mot de passe', action: 'copy_paste' },
            { text: 'Affichez le mot de passe pour vérifier', action: 'show_password' }
          ],
          required: [
            { text: 'Entrez un mot de passe fort', action: 'focus_field' },
            { text: 'Utilisez au moins 8 caractères', action: 'show_requirements' }
          ]
        },
        phone: {
          invalid: [
            { text: 'Utilisez uniquement des chiffres', action: 'remove_symbols' },
            { text: 'Vérifiez la longueur (7-15 chiffres)', action: 'check_length' },
            { text: 'Sélectionnez le bon code pays', action: 'check_country_code' }
          ],
          required: [
            { text: 'Entrez votre numéro de téléphone', action: 'focus_field' },
            { text: 'Utilisez uniquement des chiffres', action: 'show_example' }
          ]
        },
        birthDate: {
          invalid: [
            { text: 'Vous devez avoir au moins 18 ans', action: 'check_age' },
            { text: 'Vérifiez la date saisie', action: 'verify_date' },
            { text: 'Contactez le support si l\'âge est correct', action: 'contact_support' }
          ],
          required: [
            { text: 'Sélectionnez votre date de naissance', action: 'focus_field' },
            { text: 'Utilisez le calendrier', action: 'use_calendar' }
          ]
        },
        required: [
          { text: 'Remplissez ce champ', action: 'focus_field' },
          { text: 'Ce champ est obligatoire', action: 'show_info' }
        ]
      }
    };

    // Determine error type from error message
    let errorType = 'required';
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('invalid') || errorLower.includes('غير صحيح') || errorLower.includes('invalide')) {
      errorType = 'invalid';
    } else if (errorLower.includes('weak') || errorLower.includes('ضعيف') || errorLower.includes('faible')) {
      errorType = 'weak';
    } else if (errorLower.includes('mismatch') || errorLower.includes('غير متطابق') || errorLower.includes('ne correspondent pas')) {
      errorType = 'mismatch';
    } else if (errorLower.includes('exists') || errorLower.includes('موجود') || errorLower.includes('existe')) {
      errorType = 'exists';
    }

    // Get suggestions for this field and error type
    const langSuggestions = suggestions[language] || suggestions.ar;
    const fieldSuggestions = langSuggestions[fieldName] || {};
    
    return fieldSuggestions[errorType] || langSuggestions.required;
  };

  const suggestions = getSuggestions();

  const handleSuggestionClick = (action) => {
    if (onSuggestionClick) {
      onSuggestionClick(action, fieldName);
    }
  };

  return (
    <div 
      className={`enhanced-error-message ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      role="alert"
      aria-live="polite"
    >
      <div className="enhanced-error-header">
        <span className="enhanced-error-icon" aria-hidden="true">⚠️</span>
        <p className="enhanced-error-text">{error}</p>
      </div>
      
      {suggestions && suggestions.length > 0 && (
        <div className="enhanced-error-suggestions">
          <p className="enhanced-error-suggestions-title">
            {language === 'ar' ? 'اقتراحات للحل:' : 
             language === 'fr' ? 'Suggestions:' : 
             'Suggestions:'}
          </p>
          <ul className="enhanced-error-suggestions-list">
            {suggestions.slice(0, 4).map((suggestion, index) => (
              <li key={index} className="enhanced-error-suggestion-item">
                <button
                  type="button"
                  className="enhanced-error-suggestion-btn"
                  onClick={() => handleSuggestionClick(suggestion.action)}
                  aria-label={suggestion.text}
                >
                  <span className="enhanced-error-suggestion-bullet" aria-hidden="true">•</span>
                  <span className="enhanced-error-suggestion-text">{suggestion.text}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
