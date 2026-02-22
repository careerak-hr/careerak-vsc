import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getInternalLinks } from '../utils/internalLinking';
import { getNavAriaAttributes } from '../utils/ariaHelpers';
import './Footer.css';

export const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, user } = useApp();

  const isActive = (path) => location.pathname === path;
  
  // Get footer internal links for SEO
  const footerLinks = getInternalLinks('footer', language, user);
  
  // Get ARIA attributes for footer navigation
  const footerAriaAttrs = getNavAriaAttributes({
    label: 'footerNav',
    language
  });

  return (
    <>
      {/* Main Footer Navigation */}
      <footer 
        className="footer-container" 
        dir="rtl"
        {...footerAriaAttrs}
      >
        <nav className="footer-content">
          
          <button
            onClick={() => navigate('/profile')}
            className={`footer-btn ${isActive('/profile') ? 'footer-btn-active' : 'footer-btn-inactive'}`}
            aria-label="بروفايلي"
            aria-current={isActive('/profile') ? 'page' : undefined}
          >
            <span className={`footer-icon ${isActive('/profile') ? 'footer-icon-active' : ''}`} aria-hidden="true">👤</span>
            <span className="footer-label">بروفايلي</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className={`footer-btn ${isActive('/dashboard') ? 'footer-btn-active' : 'footer-btn-inactive'}`}
            aria-label="الرئيسية"
            aria-current={isActive('/dashboard') ? 'page' : undefined}
          >
            <span className={`footer-icon ${isActive('/dashboard') ? 'footer-icon-active' : ''}`} aria-hidden="true">🏠</span>
            <span className="footer-label">الرئيسية</span>
          </button>

          <div className="footer-center-btn-wrapper">
              <button
                onClick={() => navigate('/job-postings')}
                className="footer-center-btn"
                aria-label="بحث وظيفة"
              >
                <span className="footer-center-btn-icon" aria-hidden="true">+</span>
              </button>
              <span className="footer-center-label">بحث وظيفة</span>
          </div>

          <button
            onClick={() => navigate('/notifications')}
            className={`footer-btn ${isActive('/notifications') ? 'footer-btn-active' : 'footer-btn-inactive'}`}
            aria-label="تنبيهات"
            aria-current={isActive('/notifications') ? 'page' : undefined}
          >
            <div className="footer-notification-badge-container">
              <span className={`footer-icon ${isActive('/notifications') ? 'footer-icon-active' : ''}`} aria-hidden="true">🔔</span>
              <div className="footer-notification-badge" aria-label="3 إشعارات جديدة">3</div>
            </div>
            <span className="footer-label">تنبيهات</span>
          </button>

          <button
            onClick={() => navigate('/applications-status')}
            className={`footer-btn ${isActive('/applications-status') ? 'footer-btn-active' : 'footer-btn-inactive'}`}
            aria-label="طلباتي"
            aria-current={isActive('/applications-status') ? 'page' : undefined}
          >
            <span className={`footer-icon ${isActive('/applications-status') ? 'footer-icon-active' : ''}`} aria-hidden="true">⌛</span>
            <span className="footer-label">طلباتي</span>
          </button>

        </nav>
      </footer>

      {/* SEO Footer Links - Hidden visually but accessible to crawlers */}
      <div className="footer-seo-links" aria-hidden="true">
        <nav className="footer-seo-nav">
          {footerLinks.map((link, index) => (
            <Link 
              key={index}
              to={link.path}
              className="footer-seo-link"
              tabIndex="-1"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};
