import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';

/**
 * GoogleCalendarCallback - معالجة OAuth callback من Google
 * يقرأ code و state من URL ويرسلهما للـ backend
 */

const t = {
  ar: {
    processing: 'جاري معالجة الاتصال بـ Google Calendar...',
    success: 'تم ربط Google Calendar بنجاح! ✅',
    error: 'فشل ربط Google Calendar',
    redirecting: 'جاري التحويل...',
    goBack: 'العودة للمواعيد',
  },
  en: {
    processing: 'Processing Google Calendar connection...',
    success: 'Google Calendar connected successfully! ✅',
    error: 'Failed to connect Google Calendar',
    redirecting: 'Redirecting...',
    goBack: 'Back to Appointments',
  },
  fr: {
    processing: 'Traitement de la connexion Google Calendar...',
    success: 'Google Calendar connecté avec succès ! ✅',
    error: 'Échec de la connexion à Google Calendar',
    redirecting: 'Redirection...',
    goBack: 'Retour aux rendez-vous',
  },
};

const GoogleCalendarCallback = () => {
  const { language } = useApp();
  const tr = t[language] || t.ar;
  const isRTL = language === 'ar';
  const fontFamily = language === 'ar' ? 'Amiri, Cairo, serif' : 'Cormorant Garamond, serif';
  const navigate = useNavigate();

  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const error = params.get('error');

      if (error) {
        setStatus('error');
        setErrorMsg(error);
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setErrorMsg('Missing code or state parameters');
        return;
      }

      try {
        await api.get(`/integrations/google/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`);
        setStatus('success');
        // Redirect to appointments page after 2 seconds
        setTimeout(() => {
          navigate('/my-appointments');
        }, 2000);
      } catch (err) {
        setStatus('error');
        setErrorMsg(err?.response?.data?.message || err.message || tr.error);
      }
    };

    handleCallback();
  }, []);

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        fontFamily,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#E3DAD1',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: '#fff',
          border: '2px solid #304B60',
          borderRadius: '16px',
          padding: '40px 32px',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 4px 24px rgba(48,75,96,0.12)',
        }}
      >
        {/* Google Icon */}
        <div style={{ marginBottom: '20px' }}>
          <svg viewBox="0 0 24 24" width="48" height="48" style={{ display: 'inline-block' }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </div>

        {status === 'processing' && (
          <>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
            <p style={{ color: '#304B60', fontSize: '1rem', fontWeight: 600 }}>{tr.processing}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✅</div>
            <p style={{ color: '#155724', fontSize: '1rem', fontWeight: 700 }}>{tr.success}</p>
            <p style={{ color: '#304B60cc', fontSize: '0.85rem', marginTop: '8px' }}>{tr.redirecting}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>❌</div>
            <p style={{ color: '#721c24', fontSize: '1rem', fontWeight: 700 }}>{tr.error}</p>
            {errorMsg && (
              <p style={{ color: '#721c24cc', fontSize: '0.82rem', marginTop: '6px' }}>{errorMsg}</p>
            )}
            <button
              onClick={() => navigate('/my-appointments')}
              style={{
                marginTop: '20px',
                padding: '10px 24px',
                background: '#304B60',
                color: '#E3DAD1',
                border: '2px solid #D4816180',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily,
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              {tr.goBack}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCalendarCallback;
