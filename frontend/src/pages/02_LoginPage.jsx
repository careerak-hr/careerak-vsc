import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { App } from '@capacitor/app';
import { useAuth } from '../context/AuthContext';
import { useTranslate } from '../hooks/useTranslate';
import { PremiumCheckbox } from '../components/LuxuryCheckbox';

export default function LoginPage() {
  const navigate = useNavigate();
  const { language, login: performLogin } = useAuth();
  const t = useTranslate();
  const loginT = t.loginPage;
  const isRTL = language === 'ar';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Set audio consent on component mount
    localStorage.setItem('audioConsent', 'true');

    const loadRememberedData = async () => {
      const savedId = localStorage.getItem('remembered_user');
      if (savedId) {
        setIdentifier(savedId);
        setRememberMe(true);
      }
    };
    loadRememberedData();

    const backButtonListener = App.addListener('backButton', () => {
      App.exitApp();
    });

    return () => {
      backButtonListener.then(l => l.remove());
    };
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Remember user preference
      if (rememberMe) {
        localStorage.setItem('remembered_user', identifier);
      } else {
        localStorage.removeItem('remembered_user');
      }

      // API login for all users (including admin)
      const response = await api.post('/users/login', { email: identifier, password });
      const { user, token } = response.data;
      
      await performLogin(user, token);
      
      // Navigate based on user role
      if (user.role === 'Admin') {
        navigate('/admin-dashboard', { replace: true });
      } else if (user.role === 'HR') {
        navigate(user.bio ? '/profile' : '/onboarding-companies', { replace: true });
      } else {
        navigate(user.bio ? '/profile' : '/onboarding-individuals', { replace: true });
      }
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || loginT.error || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Simple input styles without complex CSS
  const inputStyle = {
    width: '100%',
    padding: '24px',
    backgroundColor: '#E3DAD1',
    color: '#304B60',
    borderRadius: '40px',
    border: '2px solid rgba(212, 129, 97, 0.2)',
    outline: 'none',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: '16px',
    fontFamily: language === 'ar' ? "'Amiri', serif" : 
                language === 'en' ? "'Cormorant Garamond', serif" : 
                "'EB Garamond', serif"
  };

  const buttonStyle = {
    width: '100%',
    backgroundColor: '#304B60',
    color: '#D48161',
    padding: '28px',
    borderRadius: '48px',
    fontWeight: 'bold',
    fontSize: '24px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: language === 'ar' ? "'Amiri', serif" : 
                language === 'en' ? "'Cormorant Garamond', serif" : 
                "'EB Garamond', serif"
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E3DAD1', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ width: '160px', height: '160px', borderRadius: '50%', border: '4px solid #304B60', margin: '0 auto', overflow: 'hidden', backgroundColor: '#E3DAD1' }}>
             <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#304B60', fontStyle: 'italic', margin: '0', fontFamily: language === 'ar' ? "'Amiri', serif" : language === 'en' ? "'Cormorant Garamond', serif" : "'EB Garamond', serif" }}>Careerak</h1>
          <p style={{ color: 'rgba(48, 75, 96, 0.5)', fontWeight: 'bold', fontSize: '18px', marginTop: '12px', fontFamily: language === 'ar' ? "'Amiri', serif" : language === 'en' ? "'Cormorant Garamond', serif" : "'EB Garamond', serif" }}>{loginT.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input
            type="text"
            placeholder={loginT.userPlaceholder}
            style={inputStyle}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            required
          />

          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder={loginT.passPlaceholder}
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                [isRTL ? 'left' : 'right']: '24px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              {showPassword ? '👁️' : '🙈'}
            </button>
          </div>

          {error && (
            <div style={{ padding: '0 24px', textAlign: 'center' }}>
              <p style={{ fontWeight: 'bold', fontSize: '12px', color: '#dc2626', margin: 0 }}>
                {error}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', flexDirection: isRTL ? 'row' : 'row-reverse' }}>
            <PremiumCheckbox
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              label={loginT.rememberMe}
              labelClassName="text-sm font-bold text-[#304B60]/60"
              labelStyle={{ fontFamily: language === 'ar' ? "'Amiri', serif" : language === 'en' ? "'Cormorant Garamond', serif" : "'EB Garamond', serif" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
          >
            {loading ? '⏳' : loginT.loginBtn}
          </button>
        </form>

        <div style={{ marginTop: '48px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'rgba(48, 75, 96, 0.4)', fontFamily: language === 'ar' ? "'Amiri', serif" : language === 'en' ? "'Cormorant Garamond', serif" : "'EB Garamond', serif" }}>
            {loginT.noAccount} <span onClick={() => {
              navigate('/auth');
            }} style={{ color: '#304B60', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}>{loginT.createAccount}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
