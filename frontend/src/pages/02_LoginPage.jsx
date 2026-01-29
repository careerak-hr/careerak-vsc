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
      // Admin login check
      if (identifier.trim() === 'admin01' && password === 'admin123') {
         console.log('Admin login detected, processing...');
         
         const adminUser = { _id: 'admin_master_01', firstName: 'Master', lastName: 'Admin', role: 'Admin', email: 'admin01' };
         console.log('Admin user object:', adminUser);
         await performLogin(adminUser, "OFFLINE_MASTER_ADMIN_TOKEN");
         console.log('Admin login completed, navigating to dashboard...');
         navigate('/admin-dashboard', { replace: true });
         return;
      }

      // Remember user preference
      if (rememberMe) localStorage.setItem('remembered_user', identifier);
      else localStorage.removeItem('remembered_user');

      // API login
      const response = await api.post('/users/login', { email: identifier, password });
      await performLogin(response.data.user, response.data.token);
      
      // Navigate based on user role
      const user = response.data.user;
      
      if (user.role === 'Admin') navigate('/admin-dashboard');
      else if (user.role === 'HR') navigate(user.bio ? '/profile' : '/onboarding-companies');
      else navigate(user.bio ? '/profile' : '/onboarding-individuals');
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || loginT.error);
    } finally {
      setLoading(false);
    }
  };

  // تحسين classes للحقول مع ضمان إمكانية الكتابة
  const inputCls = "w-full p-6 bg-[#E3DAD1] text-[#304B60] rounded-[2.5rem] border-2 border-[#D48161]/20 focus:border-[#D48161] outline-none font-black text-center transition-all placeholder:text-gray-400 shadow-sm input-field-enabled";
  
  // تطبيق الخط المناسب حسب اللغة
  const fontStyle = {
    fontFamily: language === 'ar' ? "'Amiri', serif" : 
                language === 'en' ? "'Cormorant Garamond', serif" : 
                "'EB Garamond', serif"
  };

  // إضافة styles مخصصة لضمان عمل حقول الإدخال - محسن
  const inputStyles = {
    ...fontStyle,
    WebkitUserSelect: 'text',
    MozUserSelect: 'text',
    msUserSelect: 'text',
    userSelect: 'text',
    pointerEvents: 'auto',
    WebkitTouchCallout: 'default',
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'rgba(212, 129, 97, 0.2)',
    position: 'relative',
    zIndex: 1
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-[#E3DAD1] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'} select-none login-page`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-sm px-8 flex flex-col items-center">
        
        <div className="mb-8">
          <div className="w-40 h-40 rounded-full border-4 border-[#304B60] shadow-2xl overflow-hidden pointer-events-none bg-[#E3DAD1]">
             <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-[#304B60] italic" style={{ fontFamily: language === 'ar' ? "'Amiri', serif" : language === 'en' ? "'Cormorant Garamond', serif" : "'EB Garamond', serif" }}>Careerak</h1>
          <p className="text-[#304B60]/50 font-bold text-lg mt-3" style={{ fontFamily: language === 'ar' ? "'Amiri', serif" : language === 'en' ? "'Cormorant Garamond', serif" : "'EB Garamond', serif" }}>{loginT.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <input
            type="text"
            placeholder={loginT.userPlaceholder}
            className={inputCls}
            style={inputStyles}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onFocus={(e) => {
              // ضمان إمكانية الكتابة عند التركيز
              e.target.style.userSelect = 'text';
              e.target.style.pointerEvents = 'auto';
            }}
            autoComplete="username"
            required
          />

          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={loginT.passPlaceholder}
              className={inputCls}
              style={inputStyles}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={(e) => {
                // ضمان إمكانية الكتابة عند التركيز
                e.target.style.userSelect = 'text';
                e.target.style.pointerEvents = 'auto';
              }}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute ${isRTL ? 'left-6' : 'right-6'} top-1/2 -translate-y-1/2 text-[#304B60]/30 hover:text-[#304B60] transition-colors`}
              style={{ pointerEvents: 'auto', userSelect: 'none' }}
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

          <div className={`flex items-center justify-center px-6 py-2 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
            <PremiumCheckbox
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              label={loginT.rememberMe}
              labelClassName="text-sm font-bold text-[#304B60]/60"
              labelStyle={fontStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#304B60] text-[#D48161] p-7 rounded-[3rem] font-black text-2xl shadow-2xl active:scale-95 transition-all mt-4"
            style={{ ...fontStyle, pointerEvents: 'auto', userSelect: 'none' }}
          >
            {loading ? <div className="w-8 h-8 border-4 border-[#D48161]/30 border-t-[#D48161] rounded-full animate-spin mx-auto"></div> : loginT.loginBtn}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-sm font-bold text-[#304B60]/40" style={fontStyle}>
            {loginT.noAccount} <span onClick={() => {
              // الموسيقى ستستمر عبر AuthContext - لا نحتاج لأي إدارة محلية
              navigate('/auth');
            }} className="text-[#304B60] cursor-pointer hover:underline font-black" style={{ pointerEvents: 'auto', userSelect: 'none' }}>{loginT.createAccount}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
