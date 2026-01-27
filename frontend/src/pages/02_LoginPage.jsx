import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { App } from '@capacitor/app';
import { useAuth } from '../context/AuthContext';

const loginTranslations = {
  ar: {
    subtitle: "تسجيل الدخول",
    userPlaceholder: "البريد الإلكتروني أو رقم الهاتف",
    passPlaceholder: "كلمة المرور",
    loginBtn: "دخول",
    noAccount: "ليس لديك حساب؟",
    createAccount: "أنشئ حساباً الآن",
    error: "فشل الدخول، تحقق من البيانات",
    rememberMe: "تذكرني"
  },
  en: {
    subtitle: "Login",
    userPlaceholder: "Email or Phone Number",
    passPlaceholder: "Password",
    loginBtn: "Login",
    noAccount: "Don't have an account?",
    createAccount: "Create account now",
    error: "Login failed, check your credentials",
    rememberMe: "Remember me"
  },
  fr: {
    subtitle: "Connexion",
    userPlaceholder: "E-mail ou numéro de téléphone",
    passPlaceholder: "Mot de passe",
    loginBtn: "Se connecter",
    noAccount: "Vous n'avez pas de compte ?",
    createAccount: "Créer un compte maintenant",
    error: "Échec de la connexion, vérifiez vos identifiants",
    rememberMe: "Se souvenir de moi"
  }
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { language, login: performLogin, startBgMusic } = useAuth();
  const t = loginTranslations[language] || loginTranslations.ar;
  const isRTL = language === 'ar';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const musicRef = useRef(null);
  
  useEffect(() => {
    // Set audio consent on component mount
    localStorage.setItem('audioConsent', 'true');
    
    setIsVisible(true);
    
    // تشغيل الموسيقى الخلفية
    const audioEnabled = localStorage.getItem('audioConsent') === 'true' || localStorage.getItem('audio_enabled') === 'true';
    if (audioEnabled && !musicRef.current) {
      console.log("Playing Music.mp3 on login page");
      musicRef.current = new Audio('/Music.mp3');
      musicRef.current.loop = true;
      musicRef.current.volume = 0.4;
      musicRef.current.play().catch((e) => console.log("Background music play failed:", e));
    }

    const loadRememberedData = async () => {
      const savedId = localStorage.getItem('remembered_user');
      if (savedId) {
        setIdentifier(savedId);
        setRememberMe(true);
      }
    };
    loadRememberedData();

    const backButtonListener = App.addListener('backButton', () => {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current.currentTime = 0;
        musicRef.current = null;
      }
      App.exitApp();
    });

    const handleAppState = (state) => {
      if (musicRef.current) {
        if (state.isActive && audioEnabled) {
          musicRef.current.play().catch(() => {});
        } else {
          musicRef.current.pause();
        }
      }
    };
    const appStateListener = App.addListener('appStateChange', handleAppState);

    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current.currentTime = 0;
        musicRef.current = null;
      }
      backButtonListener.then(l => l.remove());
      appStateListener.then(l => l.remove());
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
         
         // إيقاف موسيقى صفحة تسجيل الدخول قبل الانتقال
         if (musicRef.current) {
           musicRef.current.pause();
           musicRef.current.currentTime = 0;
           musicRef.current = null;
         }
         
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
      
      // إيقاف موسيقى صفحة تسجيل الدخول قبل الانتقال
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current.currentTime = 0;
        musicRef.current = null;
      }
      
      if (user.role === 'Admin') navigate('/admin-dashboard');
      else if (user.role === 'HR') navigate(user.bio ? '/profile' : '/onboarding-companies');
      else navigate(user.bio ? '/profile' : '/onboarding-individuals');
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || t.error);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full p-6 bg-[#E3DAD1] text-[#304B60] rounded-[2.5rem] border-2 border-[#D48161]/20 focus:border-[#D48161] outline-none font-black text-center transition-all placeholder:text-gray-400 shadow-sm";

  return (
    <div className={`min-h-screen flex items-center justify-center bg-[#E3DAD1] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'} select-none`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-sm px-8 flex flex-col items-center">
        
        <div className="mb-8">
          <div className="w-40 h-40 rounded-full border-4 border-[#304B60] shadow-2xl overflow-hidden pointer-events-none bg-[#E3DAD1]">
             <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-[#304B60] italic" style={{ fontFamily: 'serif' }}>Careerak</h1>
          <p className="text-[#304B60]/50 font-bold text-lg mt-3">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <input
            type="text"
            placeholder={t.userPlaceholder}
            className={inputCls}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />

          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t.passPlaceholder}
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <div className={`flex items-center justify-center gap-3 px-6 py-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-5 h-5 rounded-lg border-[#D48161]/30 text-[#304B60] focus:ring-[#304B60]/20 bg-[#E3DAD1]"
            />
            <label htmlFor="remember" className="text-sm font-bold text-[#304B60]/60 cursor-pointer">{t.rememberMe}</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#304B60] text-[#D48161] p-7 rounded-[3rem] font-black text-2xl shadow-2xl active:scale-95 transition-all mt-4"
          >
            {loading ? <div className="w-8 h-8 border-4 border-[#D48161]/30 border-t-[#D48161] rounded-full animate-spin mx-auto"></div> : t.loginBtn}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-sm font-bold text-[#304B60]/40">
            {t.noAccount} <span onClick={() => navigate('/auth')} className="text-[#304B60] cursor-pointer hover:underline font-black">{t.createAccount}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
