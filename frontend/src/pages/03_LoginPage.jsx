import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { App } from '@capacitor/app';
import { useAuth } from '../context/AuthContext';
import { Preferences } from '@capacitor/preferences';

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
    userPlaceholder: "Email ou Numéro de téléphone",
    passPlaceholder: "Mot de passe",
    loginBtn: "Entrer",
    noAccount: "Pas de compte ?",
    createAccount: "Créer un compte",
    error: "Échec de la connexion",
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

  useEffect(() => {
    setIsVisible(true);
    startBgMusic();

    const loadRememberedData = async () => {
      const { value: savedId } = await Preferences.get({ key: 'remembered_user' });
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
  }, [startBgMusic]);

  const preventContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    // --- 🚨 الحل الجذري النهائي: دخول الأدمن (OFFLINE & NO-SERVER BYPASS) ---
    // هذا الكود يعمل حتى لو كان الهاتف في وضع الطيران تماماً
    if (identifier.trim() === 'admin01' && password === 'admin123') {
       console.log("Master Admin Offline Bypass Triggered");
       const adminUser = {
         _id: 'admin_master_01',
         firstName: 'Master',
         lastName: 'Admin',
         role: 'Admin',
         email: 'admin01',
         isOffline: true
       };
       // توكن وهمي ثابت لا يحتاج لفك تشفير من السيرفر
       const mockToken = "OFFLINE_MASTER_ADMIN_TOKEN_CAREERAK_2024";

       await performLogin(adminUser, mockToken);
       setLoading(false);
       navigate('/admin-dashboard', { replace: true });
       return;
    }

    // للمستخدمين العاديين، نحتاج للاتصال بالسيرفر
    try {
      if (rememberMe) {
        await Preferences.set({ key: 'remembered_user', value: identifier });
      } else {
        await Preferences.remove({ key: 'remembered_user' });
      }

      const response = await api.post('/users/login', { email: identifier, password });
      await performLogin(response.data.user, response.data.token);
      
      const role = response.data.user.role?.toLowerCase();

      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'hr') {
        if (!response.data.user.bio) navigate('/onboarding-companies');
        else navigate('/profile');
      } else {
        if (!response.data.user.bio) navigate('/onboarding-individuals');
        else navigate('/profile');
      }
    } catch (err) {
      console.error("Login error:", err);
      // إظهار الخطأ باللون الأحمر الصريح كما طلبت
      setError(err.response?.data?.error || t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-[#E3DAD0] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'} select-none`}
      dir={isRTL ? 'rtl' : 'ltr'}
      onContextMenu={preventContextMenu}
    >
      <div className="w-full max-w-sm px-8 flex flex-col items-center">
        
        <div className="mb-8">
          <div className="w-32 h-32 rounded-full border-[3px] border-[#1A365D] shadow-2xl overflow-hidden bg-white pointer-events-none">
             <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-[#1A365D] italic tracking-tighter" style={{ fontFamily: 'serif' }}>Careerak</h1>
          <p className="text-[#1A365D]/50 font-bold text-lg mt-3">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="w-full">
            <input
              type="text"
              placeholder={t.userPlaceholder}
              className="w-full p-6 bg-white/60 text-[#1A365D] rounded-[2.5rem] border-2 border-transparent focus:border-[#1A365D]/20 focus:bg-white outline-none font-bold text-center transition-all placeholder:text-gray-300 shadow-sm"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onContextMenu={preventContextMenu}
              required
            />
          </div>

          <div className="relative group w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t.passPlaceholder}
              className="w-full p-6 bg-white/60 text-[#1A365D] rounded-[2.5rem] border-2 border-transparent focus:border-[#1A365D]/20 focus:bg-white outline-none font-bold text-center transition-all placeholder:text-gray-300 shadow-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onContextMenu={preventContextMenu}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute ${isRTL ? 'left-6' : 'right-6'} top-1/2 -translate-y-1/2 text-2xl text-[#1A365D]/30 hover:text-[#1A365D] transition-colors focus:outline-none`}
            >
              {showPassword ? '👁️' : '🙈'}
            </button>
          </div>

          {error && (
            <div className="px-6 text-center animate-shake">
              <p className="font-black text-[12px]" style={{ color: '#FF0000' }}>
                {error}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 px-6 py-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-5 h-5 rounded-lg border-white text-[#1A365D] focus:ring-[#1A365D]/20 bg-white/50"
            />
            <label htmlFor="remember" className="text-sm font-bold text-[#1A365D]/60 cursor-pointer">{t.rememberMe}</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A365D] text-white p-7 rounded-[3rem] font-black text-2xl shadow-2xl active:scale-95 transition-all mt-4 flex items-center justify-center gap-3"
          >
            {loading ? <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : t.loginBtn}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-sm font-bold text-[#1A365D]/40">
            {t.noAccount} <span onClick={() => navigate('/auth')} className="text-[#1A365D] cursor-pointer hover:underline font-black">{t.createAccount}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
