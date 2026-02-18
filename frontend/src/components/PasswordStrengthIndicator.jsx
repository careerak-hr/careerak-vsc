import React from 'react';

/**
 * Visual indicator for password strength
 * Shows strength bar, label, crack time, and feedback
 * Supports Arabic, English, and French languages
 */
const PasswordStrengthIndicator = ({ strength, loading, language = 'ar' }) => {
  // Translations
  const translations = {
    ar: {
      checking: 'جاري التحقق من قوة كلمة المرور...',
      veryWeak: 'ضعيفة جداً',
      weak: 'ضعيفة',
      fair: 'متوسطة',
      good: 'جيدة',
      strong: 'قوية',
      crackTime: 'وقت الاختراق'
    },
    en: {
      checking: 'Checking password strength...',
      veryWeak: 'Very Weak',
      weak: 'Weak',
      fair: 'Fair',
      good: 'Good',
      strong: 'Strong',
      crackTime: 'Time to crack'
    },
    fr: {
      checking: 'Vérification de la force du mot de passe...',
      veryWeak: 'Très Faible',
      weak: 'Faible',
      fair: 'Moyen',
      good: 'Bon',
      strong: 'Fort',
      crackTime: 'Temps de piratage'
    }
  };

  const t = translations[language] || translations.ar;

  if (loading) {
    return (
      <div className="password-strength-loading mt-2">
        <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
          {t.checking}
        </span>
      </div>
    );
  }

  if (!strength) {
    return null;
  }

  const strengthLabels = [
    t.veryWeak, // 0
    t.weak,     // 1
    t.fair,     // 2
    t.good,     // 3
    t.strong    // 4
  ];

  const strengthColors = [
    'bg-red-500',    // 0: Very Weak
    'bg-orange-500', // 1: Weak
    'bg-yellow-500', // 2: Fair
    'bg-blue-500',   // 3: Good
    'bg-green-500'   // 4: Strong
  ];

  const strengthTextColors = [
    'text-red-600 dark:text-red-400',
    'text-orange-600 dark:text-orange-400',
    'text-yellow-600 dark:text-yellow-400',
    'text-blue-600 dark:text-blue-400',
    'text-green-600 dark:text-green-400'
  ];

  return (
    <div className="password-strength-indicator mt-2" role="status" aria-live="polite">
      {/* Strength Bar */}
      <div className="flex gap-1 mb-2" role="progressbar" aria-valuenow={strength.score} aria-valuemin="0" aria-valuemax="4">
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-2 flex-1 rounded transition-all duration-300 ${
              level <= strength.score
                ? strengthColors[strength.score]
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Strength Label */}
      <div className={`text-sm font-medium transition-colors duration-300 ${strengthTextColors[strength.score]}`}>
        {strengthLabels[strength.score]}
      </div>

      {/* Crack Time */}
      {strength.crackTime && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
          {t.crackTime}: {strength.crackTime}
        </div>
      )}

      {/* Warning */}
      {strength.warning && (
        <div className="text-xs text-orange-600 dark:text-orange-400 mt-1 transition-colors duration-300">
          ⚠️ {strength.warning}
        </div>
      )}

      {/* Suggestions */}
      {strength.suggestions && strength.suggestions.length > 0 && (
        <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1 list-disc list-inside transition-colors duration-300">
          {strength.suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
