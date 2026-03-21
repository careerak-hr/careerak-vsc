import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAnimation } from '../context/AnimationContext';
import { feedbackVariants } from '../utils/animationVariants';
import AriaLiveRegion from '../components/Accessibility/AriaLiveRegion';
import SEOHead from '../components/SEO/SEOHead';
import './ServerErrorPage.css';

/**
 * ServerErrorPage - Custom 500 Server Error Page
 * 
 * Features:
 * - Multi-language support (ar, en, fr)
 * - Dark mode support
 * - Smooth animations with Framer Motion
 * - Accessibility with ARIA live regions
 * - Navigation options (Go Home, Retry)
 * - SEO optimized
 * - Responsive design
 * 
 * Requirements: FR-ERR-4 (500 page)
 */
const ServerErrorPage = () => {
  const navigate = useNavigate();
  const { language } = useApp();
  const { shouldAnimate } = useAnimation();

  // Multi-language content
  const content = {
    ar: {
      title: 'خطأ في الخادم - 500',
      heading: 'عذراً، حدث خطأ في الخادم',
      message: 'نعتذر عن هذا الإزعاج. حدث خطأ غير متوقع في الخادم. يرجى المحاولة مرة أخرى لاحقاً.',
      technicalInfo: 'إذا استمرت المشكلة، يرجى الاتصال بفريق الدعم.',
      goHome: 'العودة للرئيسية',
      retry: 'إعادة المحاولة',
      ariaMessage: 'خطأ 500: خطأ في الخادم',
      metaDescription: 'حدث خطأ في الخادم. نعمل على حل المشكلة. يرجى المحاولة مرة أخرى لاحقاً.'
    },
    en: {
      title: 'Server Error - 500',
      heading: 'Oops, Server Error',
      message: 'We apologize for the inconvenience. An unexpected server error occurred. Please try again later.',
      technicalInfo: 'If the problem persists, please contact our support team.',
      goHome: 'Go to Home',
      retry: 'Retry',
      ariaMessage: 'Error 500: Server error',
      metaDescription: 'A server error occurred. We are working to resolve the issue. Please try again later.'
    },
    fr: {
      title: 'Erreur Serveur - 500',
      heading: 'Oups, Erreur Serveur',
      message: 'Nous nous excusons pour le désagrément. Une erreur serveur inattendue s\'est produite. Veuillez réessayer plus tard.',
      technicalInfo: 'Si le problème persiste, veuillez contacter notre équipe d\'assistance.',
      goHome: 'Aller à l\'Accueil',
      retry: 'Réessayer',
      ariaMessage: 'Erreur 500: Erreur serveur',
      metaDescription: 'Une erreur serveur s\'est produite. Nous travaillons à résoudre le problème. Veuillez réessayer plus tard.'
    }
  };

  const t = content[language] || content.ar;

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRetry = () => {
    // Reload the current page
    window.location.reload();
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <SEOHead
        title={t.title}
        description={t.metaDescription}
        noindex={true}
      />

      {/* Announce error to screen readers */}
      <AriaLiveRegion 
        message={t.ariaMessage}
        politeness="assertive"
        role="alert"
      />

      <div className="server-error-container" role="main">
        {shouldAnimate ? (
          <motion.div 
            className="server-error-card"
            variants={feedbackVariants.bounce}
            initial="initial"
            animate="animate"
          >
            {/* 500 Icon */}
            <motion.div 
              className="server-error-icon"
              aria-hidden="true"
              animate={{ 
                rotate: [0, -5, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              ⚠️
            </motion.div>

            {/* 500 Number */}
            <motion.h1 
              className="server-error-number"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              500
            </motion.h1>

            {/* Heading */}
            <motion.h2 
              className="server-error-heading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {t.heading}
            </motion.h2>

            {/* Message */}
            <motion.p 
              className="server-error-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {t.message}
            </motion.p>

            {/* Technical Info */}
            <motion.p 
              className="server-error-technical"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {t.technicalInfo}
            </motion.p>

            {/* Action Buttons */}
            <motion.div 
              className="server-error-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button
                onClick={handleRetry}
                className="server-error-btn server-error-btn-primary"
                aria-label={t.retry}
              >
                {t.retry}
              </button>

              <button
                onClick={handleGoHome}
                className="server-error-btn server-error-btn-secondary"
                aria-label={t.goHome}
              >
                {t.goHome}
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <div className="server-error-card">
            {/* 500 Icon */}
            <div className="server-error-icon" aria-hidden="true">
              ⚠️
            </div>

            {/* 500 Number */}
            <h1 className="server-error-number">500</h1>

            {/* Heading */}
            <h2 className="server-error-heading">{t.heading}</h2>

            {/* Message */}
            <p className="server-error-message">{t.message}</p>

            {/* Technical Info */}
            <p className="server-error-technical">{t.technicalInfo}</p>

            {/* Action Buttons */}
            <div className="server-error-actions">
              <button
                onClick={handleRetry}
                className="server-error-btn server-error-btn-primary"
                aria-label={t.retry}
              >
                {t.retry}
              </button>

              <button
                onClick={handleGoHome}
                className="server-error-btn server-error-btn-secondary"
                aria-label={t.goHome}
              >
                {t.goHome}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ServerErrorPage;
