import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAnimation } from '../context/AnimationContext';
import { feedbackVariants } from '../utils/animationVariants';
import AriaLiveRegion from '../components/Accessibility/AriaLiveRegion';
import SEOHead from '../components/SEO/SEOHead';
import './48_NotFoundPage.css';

/**
 * NotFoundPage - Custom 404 Error Page
 * 
 * Features:
 * - Multi-language support (ar, en, fr)
 * - Dark mode support
 * - Smooth animations with Framer Motion
 * - Accessibility with ARIA live regions
 * - Navigation options (Go Home, Go Back)
 * - SEO optimized
 * - Responsive design
 * 
 * Requirements: FR-ERR-10
 */
const NotFoundPage = () => {
  const navigate = useNavigate();
  const { language } = useApp();
  const { shouldAnimate } = useAnimation();

  // Multi-language content
  const content = {
    ar: {
      title: 'الصفحة غير موجودة - 404',
      heading: 'عذراً، الصفحة غير موجودة',
      message: 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى موقع آخر.',
      goHome: 'العودة للرئيسية',
      goBack: 'العودة للخلف',
      ariaMessage: 'خطأ 404: الصفحة غير موجودة',
      metaDescription: 'الصفحة المطلوبة غير موجودة. عد إلى الصفحة الرئيسية لاستكشاف منصة كاريرك للتوظيف والدورات التدريبية.'
    },
    en: {
      title: 'Page Not Found - 404',
      heading: 'Oops, Page Not Found',
      message: 'The page you are looking for does not exist or has been moved to another location.',
      goHome: 'Go to Home',
      goBack: 'Go Back',
      ariaMessage: 'Error 404: Page not found',
      metaDescription: 'The requested page was not found. Return to the home page to explore Careerak platform for jobs and training courses.'
    },
    fr: {
      title: 'Page Non Trouvée - 404',
      heading: 'Oups, Page Non Trouvée',
      message: 'La page que vous recherchez n\'existe pas ou a été déplacée vers un autre emplacement.',
      goHome: 'Aller à l\'Accueil',
      goBack: 'Retour',
      ariaMessage: 'Erreur 404: Page non trouvée',
      metaDescription: 'La page demandée est introuvable. Retournez à la page d\'accueil pour explorer la plateforme Careerak pour les emplois et les cours de formation.'
    }
  };

  const t = content[language] || content.ar;

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
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

      <div className="not-found-container" role="main">
        {shouldAnimate ? (
          <motion.div 
            className="not-found-card"
            variants={feedbackVariants.bounce}
            initial="initial"
            animate="animate"
          >
            {/* 404 Icon */}
            <motion.div 
              className="not-found-icon"
              aria-hidden="true"
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              🔍
            </motion.div>

            {/* 404 Number */}
            <motion.h1 
              className="not-found-number"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              404
            </motion.h1>

            {/* Heading */}
            <motion.h2 
              className="not-found-heading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {t.heading}
            </motion.h2>

            {/* Message */}
            <motion.p 
              className="not-found-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {t.message}
            </motion.p>

            {/* Action Buttons */}
            <motion.div 
              className="not-found-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={handleGoHome}
                className="not-found-btn not-found-btn-primary"
                aria-label={t.goHome}
              >
                {t.goHome}
              </button>

              <button
                onClick={handleGoBack}
                className="not-found-btn not-found-btn-secondary"
                aria-label={t.goBack}
              >
                {t.goBack}
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <div className="not-found-card">
            {/* 404 Icon */}
            <div className="not-found-icon" aria-hidden="true">
              🔍
            </div>

            {/* 404 Number */}
            <h1 className="not-found-number">404</h1>

            {/* Heading */}
            <h2 className="not-found-heading">{t.heading}</h2>

            {/* Message */}
            <p className="not-found-message">{t.message}</p>

            {/* Action Buttons */}
            <div className="not-found-actions">
              <button
                onClick={handleGoHome}
                className="not-found-btn not-found-btn-primary"
                aria-label={t.goHome}
              >
                {t.goHome}
              </button>

              <button
                onClick={handleGoBack}
                className="not-found-btn not-found-btn-secondary"
                aria-label={t.goBack}
              >
                {t.goBack}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotFoundPage;
