import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PasswordStrengthIndicator from '../components/auth/PasswordStrengthIndicator';
import FormErrorAnnouncer from '../components/Accessibility/FormErrorAnnouncer';
import ButtonSpinner from '../components/Loading/ButtonSpinner';
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';
import './32_ResetPasswordPage.css';

/**
 * ResetPasswordPage Component
 * 
 * صفحة إعادة تعيين كلمة المرور - Requirements 7.3
 * 
 * الميزات:
 * - استقبال token من URL
 * - حقل كلمة المرور الجديدة مع PasswordStrengthIndicator
 * - حقل تأكيد كلمة المرور
 * - زر "إعادة تعيين كلمة المرور"
 * - التحقق من صحة token عند التحميل
 * - رسالة خطأ إذا كان token غير صالح أو منتهي الصلاحية
 * - رسالة نجاح وإعادة توجيه تلقائية بعد 3 ثواني
 * - دعم متعدد اللغات (ar, en, fr)
 * - تصميم متناسق مع LoginPage و AuthPage
 * - استخدام الألوان المعتمدة (#304B60, #E3DAD1, #D48161)
 * - إطارات الحقول بلون نحاسي باهت (#D4816180)
 * - SEO optimization
 * - Accessibility support
 */
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useApp();
  const isRTL = language === 'ar';
  
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);

  // الترجمات المضمنة
  const translations = {
    ar: {
      title: 'إعادة تعيين كلمة المرور',
      subtitle: 'أدخل كلمة المرور الجديدة',
      passwordLabel: 'كلمة المرور الجديدة',
      passwordPlaceholder: 'أدخل كلمة المرور الجديدة',
      confirmPasswordLabel: 'تأكيد كلمة المرور',
      confirmPasswordPlaceholder: 'أعد إدخال كلمة المرور',
      submitButton: 'إعادة تعيين كلمة المرور',
      backToLogin: 'العودة لتسجيل الدخول',
      backToForgotPassword: 'طلب رابط جديد',
      successMessage: 'تم إعادة تعيين كلمة المرور بنجاح',
      successDescription: 'سيتم توجيهك إلى صفحة تسجيل الدخول خلال 3 ثواني...',
      invalidTokenTitle: 'رابط غير صالح',
      invalidTokenMessage: 'الرابط الذي استخدمته غير صالح أو منتهي الصلاحية.',
      invalidTokenDescription: 'يرجى طلب رابط جديد لإعادة تعيين كلمة المرور.',
      errorPasswordMismatch: 'كلمتا المرور غير متطابقتين',
      errorPasswordTooShort: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
      errorGeneral: 'حدث خطأ أثناء إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.',
      loading: 'جاري إعادة التعيين...',
      verifying: 'جاري التحقق من الرابط...',
      showPassword: 'إظهار كلمة المرور',
      hidePassword: 'إخفاء كلمة المرور',
    },
    en: {
      title: 'Reset Password',
      subtitle: 'Enter your new password',
      passwordLabel: 'New Password',
      passwordPlaceholder: 'Enter new password',
      confirmPasswordLabel: 'Confirm Password',
      confirmPasswordPlaceholder: 'Re-enter password',
      submitButton: 'Reset Password',
      backToLogin: 'Back to Login',
      backToForgotPassword: 'Request New Link',
      successMessage: 'Password reset successfully',
      successDescription: 'You will be redirected to login page in 3 seconds...',
      invalidTokenTitle: 'Invalid Link',
      invalidTokenMessage: 'The link you used is invalid or has expired.',
      invalidTokenDescription: 'Please request a new link to reset your password.',
      errorPasswordMismatch: 'Passwords do not match',
      errorPasswordTooShort: 'Password must be at least 8 characters',
      errorGeneral: 'An error occurred while resetting password. Please try again.',
      loading: 'Resetting...',
      verifying: 'Verifying link...',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
    },
    fr: {
      title: 'Réinitialiser le mot de passe',
      subtitle: 'Entrez votre nouveau mot de passe',
      passwordLabel: 'Nouveau mot de passe',
      passwordPlaceholder: 'Entrez le nouveau mot de passe',
      confirmPasswordLabel: 'Confirmer le mot de passe',
      confirmPasswordPlaceholder: 'Ré-entrez le mot de passe',
      submitButton: 'Réinitialiser le mot de passe',
      backToLogin: 'Retour à la connexion',
      backToForgotPassword: 'Demander un nouveau lien',
      successMessage: 'Mot de passe réinitialisé avec succès',
      successDescription: 'Vous serez redirigé vers la page de connexion dans 3 secondes...',
      invalidTokenTitle: 'Lien invalide',
      invalidTokenMessage: 'Le lien que vous avez utilisé est invalide ou a expiré.',
      invalidTokenDescription: 'Veuillez demander un nouveau lien pour réinitialiser votre mot de passe.',
      errorPasswordMismatch: 'Les mots de passe ne correspondent pas',
      errorPasswordTooShort: 'Le mot de passe doit contenir au moins 8 caractères',
      errorGeneral: 'Une erreur s\'est produite lors de la réinitialisation. Veuillez réessayer.',
      loading: 'Réinitialisation...',
      verifying: 'Vérification du lien...',
      showPassword: 'Afficher le mot de passe',
      hidePassword: 'Masquer le mot de passe',
    },
  };

  const t = translations[language] || translations.ar;

  // SEO
  const seo = useSEO('resetPassword', {
    title: `${t.title} | Careerak`,
    description: t.subtitle,
  });

  // التحقق من token عند التحميل
  useEffect(() => {
    setIsVisible(true);
    
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setVerifyingToken(false);
        return;
      }

      try {
        // TODO: Task 13.2 - تنفيذ API call للتحقق من token
        // const apiUrl = import.meta.env.VITE_API_URL || '';
        // const response = await fetch(`${apiUrl}/auth/verify-reset-token`, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({ token }),
        // });
        // 
        // if (!response.ok) {
        //   throw new Error('Invalid token');
        // }

        // محاكاة API call (1 ثانية)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // افتراض أن token صالح
        setTokenValid(true);
      } catch (err) {
        console.error('Error verifying token:', err);
        setTokenValid(false);
      } finally {
        setVerifyingToken(false);
      }
    };

    verifyToken();
  }, [token]);

  // إعادة توجيه تلقائية بعد النجاح
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // التحقق من صحة البيانات
    if (password.length < 8) {
      setError(t.errorPasswordTooShort);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.errorPasswordMismatch);
      setLoading(false);
      return;
    }

    try {
      // TODO: Task 13.2 - تنفيذ API call لإعادة تعيين كلمة المرور
      // const apiUrl = import.meta.env.VITE_API_URL || '';
      // const response = await fetch(`${apiUrl}/auth/reset-password`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ token, password }),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to reset password');
      // }

      // محاكاة API call (2 ثانية)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // عرض رسالة النجاح
      setSuccess(true);
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(t.errorGeneral);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordStrengthChange = (strength) => {
    setPasswordStrength(strength);
  };

  // حالة التحقق من token
  if (verifyingToken) {
    return (
      <>
        <SEOHead {...seo} />
        <main
          id="main-content"
          tabIndex="-1"
          className="reset-password-page-container dark:bg-primary transition-all duration-300"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="reset-password-page-content dark:text-primary transition-colors duration-300">
            <div className="reset-password-logo-container">
              <div className="reset-password-logo">
                <img
                  src="/logo.jpg"
                  alt="Careerak logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="reset-password-verifying-container">
              <ButtonSpinner color="#304B60" ariaLabel={t.verifying} />
              <p className="reset-password-verifying-text dark:text-secondary transition-colors duration-300">
                {t.verifying}
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  // حالة token غير صالح
  if (!tokenValid) {
    return (
      <>
        <SEOHead {...seo} />
        <main
          id="main-content"
          tabIndex="-1"
          className={`reset-password-page-container dark:bg-primary transition-all duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="reset-password-page-content dark:text-primary transition-colors duration-300">
            <div className="reset-password-logo-container">
              <div className="reset-password-logo">
                <img
                  src="/logo.jpg"
                  alt="Careerak logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="reset-password-invalid-container">
              <div className="reset-password-invalid-icon">
                <svg
                  className="w-16 h-16 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="reset-password-invalid-title dark:text-primary transition-colors duration-300">
                {t.invalidTokenTitle}
              </h2>
              <p className="reset-password-invalid-message dark:text-secondary transition-colors duration-300">
                {t.invalidTokenMessage}
              </p>
              <p className="reset-password-invalid-description dark:text-secondary transition-colors duration-300">
                {t.invalidTokenDescription}
              </p>
              <div className="reset-password-invalid-actions">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="reset-password-back-btn dark:bg-accent dark:text-inverse transition-all duration-300"
                >
                  {t.backToForgotPassword}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="reset-password-secondary-btn dark:bg-secondary dark:text-primary transition-all duration-300"
                >
                  {t.backToLogin}
                </button>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SEOHead {...seo} />
      <main
        id="main-content"
        tabIndex="-1"
        className={`reset-password-page-container dark:bg-primary transition-all duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="reset-password-page-content dark:text-primary transition-colors duration-300">
          {/* Logo */}
          <div className="reset-password-logo-container">
            <div className="reset-password-logo">
              <img
                src="/logo.jpg"
                alt="Careerak logo - Reset your password"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Title */}
          <div className="reset-password-title-container">
            <h1
              className="reset-password-title dark:text-primary transition-colors duration-300"
              style={{ fontFamily: 'serif' }}
            >
              Careerak
            </h1>
            <p className="reset-password-subtitle dark:text-secondary transition-colors duration-300">
              {t.subtitle}
            </p>
          </div>

          {/* Success State */}
          {success ? (
            <div className="reset-password-success-container">
              <div className="reset-password-success-icon">
                <svg
                  className="w-16 h-16 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="reset-password-success-title dark:text-primary transition-colors duration-300">
                {t.successMessage}
              </h2>
              <p className="reset-password-success-description dark:text-secondary transition-colors duration-300">
                {t.successDescription}
              </p>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="reset-password-form">
              {/* Error Announcer for Screen Readers */}
              <FormErrorAnnouncer
                errors={error ? { resetPassword: error } : {}}
                language={language}
              />

              <fieldset className="reset-password-fieldset">
                <legend className="reset-password-legend dark:text-primary transition-colors duration-300">
                  {t.title}
                </legend>

                {/* New Password Field */}
                <div className="reset-password-field-group">
                  <label
                    htmlFor="reset-password-new"
                    className="reset-password-label dark:text-primary transition-colors duration-300"
                  >
                    {t.passwordLabel}
                  </label>
                  <div className="reset-password-password-wrapper">
                    <input
                      id="reset-password-new"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t.passwordPlaceholder}
                      className="reset-password-input dark:bg-secondary dark:text-primary transition-all duration-300"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={loading}
                      aria-describedby={error ? 'reset-password-error' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`reset-password-password-toggle dark:text-muted dark:hover:text-primary transition-colors duration-300 ${
                        isRTL ? 'left-6' : 'right-6'
                      }`}
                      aria-label={showPassword ? t.hidePassword : t.showPassword}
                    >
                      {showPassword ? '👁️' : '🙈'}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <PasswordStrengthIndicator
                      password={password}
                      onStrengthChange={handlePasswordStrengthChange}
                    />
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="reset-password-field-group">
                  <label
                    htmlFor="reset-password-confirm"
                    className="reset-password-label dark:text-primary transition-colors duration-300"
                  >
                    {t.confirmPasswordLabel}
                  </label>
                  <div className="reset-password-password-wrapper">
                    <input
                      id="reset-password-confirm"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t.confirmPasswordPlaceholder}
                      className="reset-password-input dark:bg-secondary dark:text-primary transition-all duration-300"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={loading}
                      aria-describedby={error ? 'reset-password-error' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`reset-password-password-toggle dark:text-muted dark:hover:text-primary transition-colors duration-300 ${
                        isRTL ? 'left-6' : 'right-6'
                      }`}
                      aria-label={showConfirmPassword ? t.hidePassword : t.showPassword}
                    >
                      {showConfirmPassword ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="reset-password-error-message" role="alert" aria-live="polite">
                    <p id="reset-password-error" className="reset-password-error-text">
                      {error}
                    </p>
                  </div>
                )}
              </fieldset>

              <button
                type="submit"
                disabled={loading || !password || !confirmPassword || password.length < 8}
                className="reset-password-submit-btn dark:bg-accent dark:text-inverse transition-all duration-300"
              >
                {loading ? (
                  <ButtonSpinner color="white" ariaLabel={t.loading} />
                ) : (
                  t.submitButton
                )}
              </button>

              {/* Back to Login Link */}
              <div className="reset-password-back-link-container">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="reset-password-back-link dark:text-accent dark:hover:text-accent-hover transition-colors duration-300"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    font: 'inherit',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {t.backToLogin}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
