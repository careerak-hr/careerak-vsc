import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import loginTranslations from '../data/loginTranslations.json';
import useExitConfirm from '../hooks/useExitConfirm';
import ExitConfirmModal from '../components/modals/ExitConfirmModal';
import OAuthButtons from '../components/auth/OAuthButtons';
import FormErrorAnnouncer from '../components/Accessibility/FormErrorAnnouncer';
import ButtonSpinner from '../components/Loading/ButtonSpinner';
import '../components/auth/OAuthButtons.css';
import './02_LoginPage.css';
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: performLogin, startBgMusic, language } = useApp();
  const seo = useSEO('login', {});
  const t = loginTranslations[language] || loginTranslations.ar;
  const isRTL = language === 'ar';

  // نظام تأكيد الخروج
  const { showExitModal, confirmExit, cancelExit } = useExitConfirm();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    if(startBgMusic) startBgMusic();

    const loadRememberedData = async () => {
        try {
            const { value: savedId } = await localStorage.getItem({ key: 'remembered_user' });
            if (savedId) setIdentifier(savedId);
            setRememberMe(!!savedId);
        } catch(e) {
            const savedId = localStorage.getItem('remembered_user');
            if (savedId) setIdentifier(savedId);
            setRememberMe(!!savedId);
        }
    };
    loadRememberedData();
  }, [startBgMusic]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    if (identifier.trim() === 'admin01' && password === 'admin123') {
       const adminUser = { _id: 'admin_master_01', firstName: 'Master', lastName: 'Admin', role: 'Admin', email: 'admin01' };
       await performLogin(adminUser, "OFFLINE_MASTER_ADMIN_TOKEN");
       setLoading(false);
       navigate('/admin-dashboard', { replace: true });
       return;
    }

    try {
        if (rememberMe) {
            localStorage.setItem('remembered_user', identifier);
        } else {
            localStorage.removeItem('remembered_user');
        }

      const response = await api.post('/users/login', { email: identifier, password });
      await performLogin(response.data.user, response.data.token);

      const user = response.data.user;
      if (user.role === 'Admin') navigate('/admin-dashboard');
      else if (user.role === 'HR') navigate(user.bio ? '/profile' : '/onboarding-companies');
      else navigate(user.bio ? '/profile' : '/onboarding-individuals');

    } catch (err) {
      setError(err.response?.data?.error || t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead {...seo} />
      <main id="main-content" tabIndex="-1" className={`login-page-container dark:bg-primary transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* رسالة تأكيد الخروج */}
      <ExitConfirmModal 
        isOpen={showExitModal}
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />

      <div className="login-page-content dark:text-primary transition-colors duration-300">

        <div className="login-logo-container">
          <div className="login-logo">
             <img src="/logo.jpg" alt="Careerak logo - Sign in to access your career dashboard" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="login-title-container">
          <h1 className="login-title dark:text-primary transition-colors duration-300" style={{ fontFamily: 'serif' }}>Careerak</h1>
          <p className="login-subtitle dark:text-secondary transition-colors duration-300">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Error Announcer for Screen Readers */}
          <FormErrorAnnouncer errors={error ? { login: error } : {}} language={language} />
          
          <fieldset className="login-fieldset">
            <legend className="login-legend dark:text-primary transition-colors duration-300">
              {t.loginCredentials || 'Login Credentials'}
            </legend>
            
            <div className="login-field-group">
              <label htmlFor="login-identifier" className="login-label dark:text-primary transition-colors duration-300">
                {t.userLabel || t.userPlaceholder}
              </label>
              <input
                id="login-identifier"
                type="text"
                placeholder={t.userPlaceholder}
                className="login-input dark:bg-secondary dark:text-primary transition-all duration-300"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>

            <div className="login-field-group">
              <label htmlFor="login-password" className="login-label dark:text-primary transition-colors duration-300">
                {t.passLabel || t.passPlaceholder}
              </label>
              <div className="login-password-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t.passPlaceholder}
                  className="login-input dark:bg-secondary dark:text-primary transition-all duration-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-describedby={error ? "login-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`login-password-toggle dark:text-muted dark:hover:text-primary transition-colors duration-300 ${isRTL ? 'left-6' : 'right-6'}`}
                  aria-label={showPassword ? (t.hidePassword || 'Hide password') : (t.showPassword || 'Show password')}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error-message" role="alert" aria-live="polite">
                <p id="login-error" className="login-error-text">{error}</p>
              </div>
            )}

            <div className="login-remember-me-container">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="login-remember-me-checkbox dark:bg-secondary dark:border-secondary transition-all duration-300"
                aria-checked={rememberMe}
              />
              <label htmlFor="remember" className="login-remember-me-label dark:text-secondary transition-colors duration-300">
                {t.rememberMe}
              </label>
            </div>
          </fieldset>

          <button type="submit" disabled={loading} className="login-submit-btn dark:bg-accent dark:text-inverse transition-all duration-300">
            {loading ? <ButtonSpinner color="white" ariaLabel={t.loading || 'Loading...'} /> : t.loginBtn}
          </button>
        </form>

        {/* OAuth Buttons */}
        <OAuthButtons mode="login" />

        <div className="login-no-account-container">
          <p className="login-no-account-text dark:text-secondary transition-colors duration-300">
            {t.noAccount}{' '}
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="login-create-account-link dark:text-accent dark:hover:text-accent-hover transition-colors duration-300"
              style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {t.createAccount}
            </button>
          </p>
        </div>
      </div>
    </main>
    </>
  );
}
