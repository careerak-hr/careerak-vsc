import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * OAuthCallback Component
 * Handles OAuth callback from backend
 * Extracts token and user data from URL params
 * Saves to localStorage and redirects to dashboard
 */
export default function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('');

  // الخطوط المعتمدة حسب اللغة
  const fontFamily = language === 'ar' ? 'Amiri, Cairo, serif' : 
                     language === 'fr' ? 'EB Garamond, serif' : 
                     'Cormorant Garamond, serif';

  // الترجمات
  const translations = {
    ar: {
      processing: 'جاري معالجة تسجيل الدخول...',
      success: 'تم تسجيل الدخول بنجاح!',
      redirecting: 'جاري التوجيه...',
      error: 'حدث خطأ أثناء تسجيل الدخول',
      tryAgain: 'يرجى المحاولة مرة أخرى'
    },
    en: {
      processing: 'Processing login...',
      success: 'Login successful!',
      redirecting: 'Redirecting...',
      error: 'An error occurred during login',
      tryAgain: 'Please try again'
    },
    fr: {
      processing: 'Traitement de la connexion...',
      success: 'Connexion réussie!',
      redirecting: 'Redirection...',
      error: 'Une erreur est survenue lors de la connexion',
      tryAgain: 'Veuillez réessayer'
    }
  };

  const t = translations[language] || translations.ar;

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract query parameters
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userStr = params.get('user');
        const error = params.get('error');

        // Handle error
        if (error) {
          console.error('OAuth error:', error);
          setStatus('error');
          setMessage(getErrorMessage(error));
          
          // Send error message to opener window
          if (window.opener) {
            window.opener.postMessage({
              type: 'oauth-error',
              error: error
            }, window.location.origin);
            
            // Close popup after 2 seconds
            setTimeout(() => {
              window.close();
            }, 2000);
          } else {
            // If not in popup, redirect to login after 3 seconds
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          }
          return;
        }

        // Validate token and user
        if (!token || !userStr) {
          throw new Error('Missing token or user data');
        }

        // Parse user data
        const user = JSON.parse(decodeURIComponent(userStr));

        // Save to localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Update status
        setStatus('success');
        setMessage(t.success);

        // Determine redirect URL based on user role/type
        let redirectPath = '/entry'; // Default
        if (user.role === 'admin') {
          redirectPath = '/admin-dashboard';
        } else if (user.accountType === 'company') {
          redirectPath = '/interface-companies';
        } else if (user.accountType === 'individual') {
          redirectPath = '/interface-individuals';
        }

        // Send success message to opener window
        if (window.opener) {
          window.opener.postMessage({
            type: 'oauth-success',
            token: token,
            user: user
          }, window.location.origin);
          
          // Close popup after 1 second
          setTimeout(() => {
            window.close();
          }, 1000);
        } else {
          // If not in popup, redirect to appropriate page
          setTimeout(() => {
            navigate(redirectPath);
          }, 1500);
        }

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(t.error);
        
        // Send error message to opener window
        if (window.opener) {
          window.opener.postMessage({
            type: 'oauth-error',
            error: error.message
          }, window.location.origin);
          
          setTimeout(() => {
            window.close();
          }, 2000);
        } else {
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      }
    };

    handleCallback();
  }, [location, navigate, t, language]);

  /**
   * Get user-friendly error message
   */
  const getErrorMessage = (error) => {
    const errorMessages = {
      ar: {
        authentication_failed: 'فشل التحقق من الهوية',
        token_generation_failed: 'فشل في إنشاء رمز الدخول',
        user_cancelled: 'تم إلغاء العملية',
        access_denied: 'تم رفض الوصول',
        unknown_error: 'حدث خطأ غير معروف'
      },
      en: {
        authentication_failed: 'Authentication failed',
        token_generation_failed: 'Failed to generate token',
        user_cancelled: 'Operation cancelled',
        access_denied: 'Access denied',
        unknown_error: 'Unknown error occurred'
      },
      fr: {
        authentication_failed: "Échec de l'authentification",
        token_generation_failed: 'Échec de la génération du token',
        user_cancelled: 'Opération annulée',
        access_denied: 'Accès refusé',
        unknown_error: 'Erreur inconnue'
      }
    };

    const messages = errorMessages[language] || errorMessages.ar;
    return messages[error] || messages.unknown_error;
  };

  return (
    <div 
      className="oauth-callback-container"
      style={{ 
        fontFamily,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #E3DAD1 0%, #F5F0EB 100%)',
        padding: '2rem'
      }}
    >
      <div 
        className="oauth-callback-card"
        style={{
          background: 'white',
          borderRadius: '24px',
          padding: '3rem 2rem',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 10px 40px rgba(48, 75, 96, 0.1)',
          border: '4px solid #304B60'
        }}
      >
        {/* Status Icon */}
        <div style={{ marginBottom: '1.5rem' }}>
          {status === 'processing' && (
            <div 
              className="spinner"
              style={{
                width: '60px',
                height: '60px',
                border: '4px solid #E3DAD1',
                borderTop: '4px solid #D48161',
                borderRadius: '50%',
                margin: '0 auto',
                animation: 'spin 1s linear infinite'
              }}
            />
          )}
          
          {status === 'success' && (
            <div 
              style={{
                width: '60px',
                height: '60px',
                background: '#10b981',
                borderRadius: '50%',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}
            >
              ✓
            </div>
          )}
          
          {status === 'error' && (
            <div 
              style={{
                width: '60px',
                height: '60px',
                background: '#ef4444',
                borderRadius: '50%',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                color: 'white'
              }}
            >
              ✕
            </div>
          )}
        </div>

        {/* Status Message */}
        <h2 
          style={{
            fontFamily,
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#304B60',
            marginBottom: '0.5rem'
          }}
        >
          {status === 'processing' && t.processing}
          {status === 'success' && t.success}
          {status === 'error' && t.error}
        </h2>

        {/* Additional Message */}
        {message && (
          <p 
            style={{
              fontFamily,
              fontSize: '1rem',
              color: '#6B7280',
              marginTop: '0.5rem'
            }}
          >
            {message}
          </p>
        )}

        {/* Redirecting Message */}
        {status === 'success' && (
          <p 
            style={{
              fontFamily,
              fontSize: '0.875rem',
              color: '#9CA3AF',
              marginTop: '1rem'
            }}
          >
            {t.redirecting}
          </p>
        )}

        {/* Try Again Message */}
        {status === 'error' && (
          <p 
            style={{
              fontFamily,
              fontSize: '0.875rem',
              color: '#9CA3AF',
              marginTop: '1rem'
            }}
          >
            {t.tryAgain}
          </p>
        )}
      </div>

      {/* Spinner Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
