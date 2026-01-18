import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function OTPVerification() {
  const navigate = useNavigate();
  const { language, login: performLogin } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isRTL = language === 'ar';

  useEffect(() => { setIsVisible(true); }, []);

  const t = {
    ar: {
      title: "تأكيد الرمز",
      sub: "أدخل الرمز المكون من 4 أرقام المرسل إليك",
      btn: "تأكيد المتابعة",
      resend: "لم يصلك الرمز؟",
      resendLink: "إعادة الإرسال",
      error: "رمز التحقق غير صحيح، يرجى المحاولة مجدداً"
    },
    en: {
      title: "Verify OTP",
      sub: "Enter the 4-digit code sent to you",
      btn: "Confirm & Continue",
      resend: "Didn't receive the code?",
      resendLink: "Resend",
      error: "Invalid code, please try again"
    }
  }[language || 'ar'];

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/users/verify-otp', { otp: code });
      await performLogin(res.data.user, res.data.token);
      
      const user = res.data.user;
      if (user.role === 'HR') navigate('/onboarding-companies');
      else navigate('/onboarding-individuals');
    } catch (err) {
      setError(err.response?.data?.error || t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'} bg-[#E3DAD0]`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`w-full max-w-md bg-white rounded-[4rem] shadow-2xl p-10 md:p-14 text-center transition-all duration-1000 transform ${isVisible ? 'translate-y-0' : 'translate-y-10'} border border-white`}>
        
        <div className="mb-10">
          <div className="w-24 h-24 bg-[#1A365D]/5 text-[#1A365D] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-[#1A365D]/5">
            <span className="text-4xl">🔐</span>
          </div>
          <h2 className="text-3xl font-black text-[#1A365D] mb-3">{t.title}</h2>
          <p className="text-[#1A365D]/40 font-bold text-sm tracking-wide">{t.sub}</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-8">
          <div className="relative">
            <input 
              type="text" 
              maxLength="4"
              placeholder="0 0 0 0" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-6 bg-gray-50 rounded-[2.5rem] border-2 border-transparent focus:border-[#1A365D]/10 focus:bg-white outline-none font-black text-4xl text-center tracking-[1.2rem] text-[#1A365D] transition-all duration-300 shadow-inner"
            />
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-[1.5rem] text-[11px] font-black border border-red-100 animate-shake">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || code.length < 4}
            className={`w-full py-6 rounded-[2.5rem] font-black shadow-2xl transition-all text-xl flex items-center justify-center gap-3 active:scale-95 ${
              loading || code.length < 4 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-[#1A365D] text-white'
            }`}
          >
            {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : t.btn}
          </button>
        </form>

        <div className="mt-12">
          <button className="text-[#1A365D]/50 font-black text-xs hover:text-[#1A365D] transition-colors">
            {t.resend} <span className="underline underline-offset-4">{t.resendLink}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
