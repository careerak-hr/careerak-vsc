import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Confetti from 'react-confetti';
import otpTranslations from '../data/otpTranslations.json';
import './04_OTPVerification.css';

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
  const t = otpTranslations[language || 'ar'];

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
      <div className="otp-success-container">
        <Confetti numberOfPieces={200} recycle={false} colors={['#304B60', '#D48161', '#E3DAD1']} />
        <div className="otp-success-content">
            <div className="otp-success-logo-wrapper">
                <div className="otp-success-spinning-border"></div>
                <img src="./logo.jpg" alt="Logo" className="otp-success-logo" />
            </div>
            <h2 className="otp-success-title">{t.congrats}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`otp-page-container ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="otp-card">
        <div className="mb-10">
          <div className="otp-icon-container">
            <span className="otp-icon">🔐</span>
          </div>
          <h2 className="otp-title">{t.title}</h2>
          <p className="otp-subtitle">
            {t.sub} <span className="otp-subtitle-method">{method === 'whatsapp' ? t.whatsapp : t.email}</span>
          </p>
        </div>

        <div className="otp-method-switcher">
            <button onClick={() => handleSendOTP('whatsapp')} disabled={resendDisabled} className={`otp-method-btn ${method === 'whatsapp' ? 'otp-method-btn-active' : 'otp-method-btn-inactive'}`}>{t.whatsapp}</button>
            <button onClick={() => handleSendOTP('email')} disabled={resendDisabled} className={`otp-method-btn ${method === 'email' ? 'otp-method-btn-active' : 'otp-method-btn-inactive'}`}>{t.email}</button>
        </div>

        {countdown > 0 && (
          <p className="otp-countdown">{t.resendIn} {countdown} {t.seconds}</p>
        )}

        {notification && (
          <p className="otp-notification">{notification}</p>
        )}

        <form onSubmit={handleVerify} className="otp-form">
          <input type="text" maxLength="4" placeholder="0000" value={code} onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            setCode(value);
          }} className="otp-input" />
          {error && <p className="otp-error">{error}</p>}
          <button type="submit" disabled={loading || code.length < 4} className="otp-submit-btn">
            {loading ? "..." : t.btn}
          </button>
        </form>
      </div>
    </div>
  );
}