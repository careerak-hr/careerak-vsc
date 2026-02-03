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
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Set audio consent on component mount
    localStorage.setItem('audioConsent', 'true');
    
    setIsVisible(true);

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

  // استخدام التصميم الأصلي للحقول
  const inputCls = "w-full p-6 bg-[#E3DAD1] text-[#304B60] rounded-[2.5rem] border-2 border-[#D48161]/20 focus:border-[#D48161] outline-none font-black text-center transition-all placeholder:text-gray-400 shadow-sm";
  
  // تطبيق الخط المناسب حسب اللغة
  const fontStyle = {
    fontFamily: language === 'ar' ? "'Amiri', serif" : 
                language === 'en' ? "'Cormorant Garamond', serif" : 
                "'EB Garamond', serif"
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-[#E3DAD1] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'} select-none`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-sm px-8 flex flex-col items-center">
        
        {/* الشعار بالتصميم الأصلي */}
        <div className="mb-8">
          <div className="w-40 h-40 rounded-full border-4 border-[#304B60] shadow-2xl overflow-hidden pointer-events-none bg-[#E3DAD1]">
            <img src="./logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* العنوان بالتصميم الأصلي */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-[#304B60] italic" style={{ fontFamily: 'serif' }}>Careerak</h1>
          <p className="text-[#304B60]/50 font-bold text-lg mt-3" style={fontStyle}>{loginT.subtitle}</p>
        </div>

        {/* النموذج بالتصميم الأصلي */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <input
            type="text"
            placeholder={loginT.userPlaceholder}
            className={inputCls}
            style={fontStyle}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            required
          />

          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={loginT.passPlaceholder}
              className={inputCls}
              style={fontStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute ${isRTL ? 'left-6' : 'right-6'} top-1/2 -translate-y-1/2 text-[#304B60]/30 hover:text-[#304B60] transition-colors`}
            >
              {showPassword ? '👁️' : '🙈'}
            </button>
          </div>

          {error && (
            <div className="px-6 text-center animate-shake">
              <p className="font-black text-[12px] text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* مربع الاختيار بالتصميم الأصلي */}
          <div className="flex items-center justify-center gap-3 px-6 py-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-5 h-5 rounded-lg border-[#D48161]/30 text-[#304B60] focus:ring-[#304B60]/20 bg-[#E3DAD1]"
            />
            <label htmlFor="remember" className="text-sm font-bold text-[#304B60]/60 cursor-pointer" style={fontStyle}>
              {loginT.rememberMe}
            </label>
          </div>

          {/* زر الدخول بالتصميم الأصلي */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#304B60] text-[#D48161] p-7 rounded-[3rem] font-black text-2xl shadow-2xl active:scale-95 transition-all mt-4"
            style={fontStyle}
          >
            {loading ? <div className="w-8 h-8 border-4 border-[#D48161]/30 border-t-[#D48161] rounded-full animate-spin mx-auto"></div> : loginT.loginBtn}
          </button>
        </form>

        {/* رابط إنشاء الحساب بالتصميم الأصلي */}
        <div className="mt-12 text-center">
          <p className="text-sm font-bold text-[#304B60]/40" style={fontStyle}>
            {loginT.noAccount} <span onClick={() => navigate('/auth')} className="text-[#304B60] cursor-pointer hover:underline font-black">{loginT.createAccount}</span>
          </p>
        </div>
      </div>
    </div>
  );
}