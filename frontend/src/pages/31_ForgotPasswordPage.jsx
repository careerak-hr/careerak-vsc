import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import EmailValidator from '../components/auth/EmailValidator';
import FormErrorAnnouncer from '../components/Accessibility/FormErrorAnnouncer';
import ButtonSpinner from '../components/Loading/ButtonSpinner';
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';
import './ForgotPasswordPage.css';

/**
 * ForgotPasswordPage Component
 * 
 * صفحة نسيت كلمة المرور - Requirements 7.3
 * 
 * الميزات:
 * - حقل البريد الإلكتروني مع EmailValidator component
 * - زر "إرسال رابط إعادة التعيين"
 * - رسالة تأكيد بعد الإرسال
 * - دعم متعدد اللغات (ar, en, fr)
 * - تصميم متناسق مع LoginPage و AuthPage
 * - استخدام الألوان المعتمدة (#304B60, #E3DAD1, #D48161)
 * - إطارات الحقول بلون نحاسي باهت (#D4816180)
 * - SEO optimization
 * - Accessibility support
 * - Loading state أثناء الإرسال
 */
export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { language } = useApp();
  const isRTL = language === 'ar';
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // الترجمات المضمنة
  const translations = {
    ar: {
      title: 'نسيت كلمة المرور',
      subtitle: 'أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور',
      emailLabel: 'البريد الإلكتروني',
      emailPlaceholder: 'أدخل بريدك الإلكتروني',
      submitButton: 'إرسال رابط إعادة التعيين',
      backToLogin: 'العودة لتسجيل الدخول',
      successMessage: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
      successDescription: 'يرجى التحقق من بريدك الإلكتروني واتباع التعليمات لإعادة تعيين كلمة المرور.',
      errorMessage: 'حدث خطأ أثناء إرسال الرابط. يرجى المحاولة مرة أخرى.',
      loading: 'جاري الإرسال...',
    },
    en: {
      title: 'Forgot Password',
      subtitle: 'Enter your email to reset your password',
      emailLabel: 'Email Address',
      emailPlaceholder: 'Enter your email',
      submitButton: 'Send Reset Link',
      backToLogin: 'Back to Login',
      successMessage: 'Password reset link has been sent to your email',
      successDescription: 'Please check your email and follow the instructions to reset your password.',
      errorMessage: 'An error occurred while sending the link. Please try again.',
      loading: 'Sending...',
    },
    fr: {
      title: 'Mot de passe oublié',
      subtitle: 'Entrez votre email pour réinitialiser votre mot de passe',
      emailLabel: 'Adresse e-mail',
      emailPlaceholder: 'Entrez votre email',
      submitButton: 'Envoyer le lien de réinitialisation',
      backToLogin: 'Retour à la connexion',
      successMessage: 'Le lien de réinitialisation a été envoyé à votre email',
      successDescription: 'Veuillez vérifier votre email et suivre les instructions pour réinitialiser votre mot de passe.',
      errorMessage: 'Une erreur s\'est produite lors de l\'envoi du lien. Veuillez réessayer.',
      loading: 'Envoi en cours...',
    },
  };

  const t = translations[language] || translations.ar;

  // SEO
  const seo = useSEO('forgotPassword', {
    title: `${t.title} | Careerak`,
    description: t.subtitle,
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: Task 13.2 - تنفيذ API call لإرسال رابط إعادة التعيين
      // const apiUrl = import.meta.env.VITE_API_URL || '';
      // const response = await fetch(`${apiUrl}/auth/forgot-password`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ email }),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to send reset link');
      // }

      // محاكاة API call (2 ثانية)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // عرض رسالة النجاح
      setSuccess(true);
    } catch (err) {
      console.error('Error sending reset link:', err);
      setError(t.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <>
      <SEOHead {...seo} />
      <main
        id="main-content"
        tabIndex="-1"
        className={`forgot-password-page-container dark:bg-primary transition-all duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="forgot-password-page-content dark:text-primary transition-colors duration-300">
          {/* Logo */}
          <div className="forgot-password-logo-container">
            <div className="forgot-password-logo">
              <img
                src="/logo.jpg"
                alt="Careerak logo - Reset your password"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Title */}
          <div className="forgot-password-title-container">
            <h1
              className="forgot-password-title dark:text-primary transition-colors duration-300"
              style={{ fontFamily: 'serif' }}
            >
              Careerak
            </h1>
            <p className="forgot-password-subtitle dark:text-secondary transition-colors duration-300">
              {t.subtitle}
            </p>
          </div>

          {/* Success State */}
          {success ? (
            <div className="forgot-password-success-container">
              <div className="forgot-password-success-icon">
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
              <h2 className="forgot-password-success-title dark:text-primary transition-colors duration-300">
                {t.successMessage}
              </h2>
              <p className="forgot-password-success-description dark:text-secondary transition-colors duration-300">
                {t.successDescription}
              </p>
              <button
                type="button"
                onClick={handleBackToLogin}
                className="forgot-password-back-btn dark:bg-accent dark:text-inverse transition-all duration-300"
              >
                {t.backToLogin}
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="forgot-password-form">
              {/* Error Announcer for Screen Readers */}
              <FormErrorAnnouncer
                errors={error ? { forgotPassword: error } : {}}
                language={language}
              />

              <fieldset className="forgot-password-fieldset">
                <legend className="forgot-password-legend dark:text-primary transition-colors duration-300">
                  {t.title}
                </legend>

                <div className="forgot-password-field-group">
                  <label
                    htmlFor="forgot-password-email"
                    className="forgot-password-label dark:text-primary transition-colors duration-300"
                  >
                    {t.emailLabel}
                  </label>
                  <EmailValidator
                    value={email}
                    onChange={setEmail}
                    placeholder={t.emailPlaceholder}
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="forgot-password-error-message" role="alert" aria-live="polite">
                    <p id="forgot-password-error" className="forgot-password-error-text">
                      {error}
                    </p>
                  </div>
                )}
              </fieldset>

              <button
                type="submit"
                disabled={loading || !email}
                className="forgot-password-submit-btn dark:bg-accent dark:text-inverse transition-all duration-300"
              >
                {loading ? (
                  <ButtonSpinner color="white" ariaLabel={t.loading} />
                ) : (
                  t.submitButton
                )}
              </button>

              {/* Back to Login Link */}
              <div className="forgot-password-back-link-container">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="forgot-password-back-link dark:text-accent dark:hover:text-accent-hover transition-colors duration-300"
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
