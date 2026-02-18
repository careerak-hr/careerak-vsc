import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Footer.css';

export const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <footer 
      className="footer-container" 
      dir="rtl"
      role="navigation"
      aria-label="التنقل السفلي"
    >
      <nav className="footer-content">
        
        <button
          onClick={() => navigate('/profile')}
          className={`footer-btn ${isActive('/profile') ? 'footer-btn-active' : 'footer-btn-inactive'}`}
          aria-label="بروفايلي"
        >
          <span className={`footer-icon ${isActive('/profile') ? 'footer-icon-active' : ''}`}>👤</span>
          <span className="footer-label">بروفايلي</span>
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className={`footer-btn ${isActive('/dashboard') ? 'footer-btn-active' : 'footer-btn-inactive'}`}
          aria-label="الرئيسية"
        >
          <span className={`footer-icon ${isActive('/dashboard') ? 'footer-icon-active' : ''}`}>🏠</span>
          <span className="footer-label">الرئيسية</span>
        </button>

        <div className="footer-center-btn-wrapper">
            <button
              onClick={() => navigate('/search-jobs')}
              className="footer-center-btn"
              aria-label="بحث وظيفة"
            >
              <span className="footer-center-btn-icon">+</span>
            </button>
            <span className="footer-center-label">بحث وظيفة</span>
        </div>

        <button
          onClick={() => navigate('/notifications')}
          className={`footer-btn ${isActive('/notifications') ? 'footer-btn-active' : 'footer-btn-inactive'}`}
          aria-label="تنبيهات"
        >
          <div className="footer-notification-badge-container">
            <span className={`footer-icon ${isActive('/notifications') ? 'footer-icon-active' : ''}`}>🔔</span>
            <div className="footer-notification-badge">3</div>
          </div>
          <span className="footer-label">تنبيهات</span>
        </button>

        <button
          onClick={() => navigate('/applications-status')}
          className={`footer-btn ${isActive('/applications-status') ? 'footer-btn-active' : 'footer-btn-inactive'}`}
          aria-label="طلباتي"
        >
          <span className={`footer-icon ${isActive('/applications-status') ? 'footer-icon-active' : ''}`}>⌛</span>
          <span className="footer-label">طلباتي</span>
        </button>

      </nav>
    </footer>
  );
};
