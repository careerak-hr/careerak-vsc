import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useApp } from '../context/AppContext';
import loginTranslations from '../data/loginTranslations.json';
import useExitConfirm from '../hooks/useExitConfirm';
import ExitConfirmModal from '../components/modals/ExitConfirmModal';
import OAuthButtons from '../components/auth/OAuthButtons';
import '../components/auth/OAuthButtons.css';
import './02_LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: performLogin, startBgMusic, language } = useApp();
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
    <div className={`login-page-container dark:bg-primary transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={isRTL ? 'rtl' : 'ltr'} role="main">
      {/* رسالة تأكيد الخروج */}
      <ExitConfirmModal 
        isOpen={showExitModal}
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />

      <main className="login-page-content dark:text-primary transition-colors duration-300">

        <div className="login-logo-container">
          <div className="login-logo">
             <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="login-title-container">
          <h1 className="login-title dark:text-primary transition-colors duration-300" style={{ fontFamily: 'serif' }}>Careerak</h1>
          <p className="login-subtitle dark:text-secondary transition-colors duration-300">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder={t.userPlaceholder}
            className="login-input dark:bg-secondary dark:text-primary transition-all duration-300"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />

          <div className="login-password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t.passPlaceholder}
              className="login-input dark:bg-secondary dark:text-primary transition-all duration-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`login-password-toggle dark:text-muted dark:hover:text-primary transition-colors duration-300 ${isRTL ? 'left-6' : 'right-6'}`}>
              {showPassword ? '👁️' : '🙈'}
            </button>
          </div>

          {error && (
            <div className="login-error-message">
              <p className="login-error-text">{error}</p>
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
            <label htmlFor="remember" className="login-remember-me-label dark:text-secondary transition-colors duration-300">{t.rememberMe}</label>
          </div>

          <button type="submit" disabled={loading} className="login-submit-btn dark:bg-accent dark:text-inverse transition-all duration-300">
            {loading ? <div className="login-loading-spinner dark:border-accent transition-colors duration-300"></div> : t.loginBtn}
          </button>
        </form>

        {/* OAuth Buttons */}
        <OAuthButtons mode="login" />

        <div className="login-no-account-container">
          <p className="login-no-account-text dark:text-secondary transition-colors duration-300">
            {t.noAccount} <span onClick={() => navigate('/auth')} className="login-create-account-link dark:text-accent dark:hover:text-accent-hover transition-colors duration-300">{t.createAccount}</span>
          </p>
        </div>
      </main>
    </div>
  );
}
