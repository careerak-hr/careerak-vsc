import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Confetti from 'react-confetti';

export default function OTPVerification() {
  const navigate = useNavigate();
  const { language, login: performLogin, user: tempUser, startBgMusic } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [method, setMethod] = useState('whatsapp');
  const [countdown, setCountdown] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [notification, setNotification] = useState('');

  const isRTL = language === 'ar';

  const t = {
    ar: {
      title: "تأكيد الرمز",
      sub: "أدخل الرمز المكون من 4 أرقام المرسل إليك عبر",
      whatsapp: "واتساب",
      email: "البريد الإلكتروني",
      btn: "تأكيد المتابعة",
      resend: "إعادة إرسال الكود عبر:",
      congrats: "تهانينا",
      error: "رمز التحقق غير صحيح، يرجى المحاولة مجدداً",
      sent: "تم إرسال الكود بنجاح",
      resendIn: "إعادة الإرسال خلال",
      seconds: "ثانية"
    },
    en: {
      title: "Verify Code",
      sub: "Enter the 4-digit code sent to you via",
      whatsapp: "WhatsApp",
      email: "Email",
      btn: "Confirm & Continue",
      resend: "Resend code via:",
      congrats: "Congratulations",
      error: "Invalid verification code, please try again",
      sent: "Code sent successfully",
      resendIn: "Resend in",
      seconds: "seconds"
    },
    fr: {
      title: "Vérifier le code",
      sub: "Entrez le code à 4 chiffres envoyé via",
      whatsapp: "WhatsApp",
      email: "E-mail",
      btn: "Confirmer et continuer",
      resend: "Renvoyer le code via :",
      congrats: "Félicitations",
      error: "Code de vérification invalide, veuillez réessayer",
      sent: "Code envoyé avec succès",
      resendIn: "Renvoyer dans",
      seconds: "secondes"
    }
  }[language || 'ar'];

  const handleSendOTP = useCallback(async (targetMethod) => {
    setMethod(targetMethod);
    setResendDisabled(true);
    setCountdown(60);
    setNotification(t.sent);
    setTimeout(() => setNotification(''), 3000);
    try { 
      await api.post('/users/send-otp', { userId: tempUser?._id, method: targetMethod });
    } catch (err) {}
  }, [tempUser, t.sent]);

  useEffect(() => {
    setIsVisible(true);
    
    // تشغيل الموسيقى الخلفية
    const audioEnabled = localStorage.getItem('audioConsent') === 'true' || localStorage.getItem('audio_enabled') === 'true';
    if (audioEnabled && startBgMusic) {
      startBgMusic();
    }
    
    if (tempUser?._id) handleSendOTP('whatsapp');
  }, [tempUser, handleSendOTP, startBgMusic]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/users/verify-otp', { otp: code, userId: tempUser?._id });
      setIsSuccess(true);
      setTimeout(async () => {
        await performLogin(res.data.user, res.data.token);
        navigate(res.data.user.role === 'HR' ? '/onboarding-companies' : '/onboarding-individuals');
      }, 4000);
    } catch (err) {
      setError(err.response?.data?.error || t.error);
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[20000] flex flex-col items-center justify-center bg-[#E3DAD1] overflow-hidden">
        <Confetti numberOfPieces={200} recycle={false} colors={['#304B60', '#D48161', '#E3DAD1']} />
        <div className="relative flex flex-col items-center">
            <div className="relative p-4 mb-8">
                <div className="absolute inset-0 border-2 border-[#D48161]/20 rounded-full animate-spin-slow"></div>
                <img src="./logo.jpg" alt="Logo" className="relative h-48 w-48 rounded-full border-[4px] border-[#304B60] shadow-2xl object-cover" />
            </div>
            <h2 className="text-6xl font-black text-[#304B60] animate-bounce italic">{t.congrats}</h2>
        </div>
      </div>
    );
  }

  const inputCls = "w-full p-6 bg-[#E3DAD1] text-[#304B60] rounded-[2.5rem] border-2 border-[#D48161]/30 focus:border-[#D48161] outline-none font-black text-4xl text-center tracking-[1.2rem] transition-all shadow-inner";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 bg-[#E3DAD1] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`w-full max-w-md bg-[#E3DAD1] rounded-[4rem] shadow-2xl p-10 text-center border-2 border-[#304B60]/10`}>
        <div className="mb-10">
          <div className="w-24 h-24 bg-[#304B60]/5 text-[#304B60] rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#304B60]/10">
            <span className="text-4xl">🔐</span>
          </div>
          <h2 className="text-3xl font-black text-[#304B60] mb-3">{t.title}</h2>
          <p className="text-[#304B60]/40 font-bold text-sm">
            {t.sub} <span className="text-[#304B60]">{method === 'whatsapp' ? t.whatsapp : t.email}</span>
          </p>
        </div>

        <div className="flex gap-2 mb-8 bg-[#304B60]/5 p-1 rounded-2xl">
            <button onClick={() => handleSendOTP('whatsapp')} disabled={resendDisabled} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${method === 'whatsapp' ? 'bg-[#304B60] text-[#D48161] shadow-md' : 'text-[#304B60]/40'}`}>{t.whatsapp}</button>
            <button onClick={() => handleSendOTP('email')} disabled={resendDisabled} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${method === 'email' ? 'bg-[#304B60] text-[#D48161] shadow-md' : 'text-[#304B60]/40'}`}>{t.email}</button>
        </div>

        {countdown > 0 && (
          <p className="text-xs font-bold text-[#304B60]/60 mb-4">{t.resendIn} {countdown} {t.seconds}</p>
        )}

        {notification && (
          <p className="text-xs font-bold text-green-600 mb-4 animate-fade-in">{notification}</p>
        )}

        <form onSubmit={handleVerify} className="space-y-8">
          <input type="text" maxLength="4" placeholder="0000" value={code} onChange={(e) => {
            const value = e.target.value.replace(/\D/g, ''); // أرقام فقط
            setCode(value);
          }} className={inputCls} />
          {error && <p className="text-xs font-black text-red-600 animate-shake">{error}</p>}
          <button type="submit" disabled={loading || code.length < 4} className="w-full py-6 bg-[#304B60] text-[#D48161] rounded-[2.5rem] font-black shadow-2xl text-xl active:scale-95 transition-all">
            {loading ? "..." : t.btn}
          </button>
        </form>
      </div>
    </div>
  );
}
