import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import adminSubDashboardTranslations from '../data/adminSubDashboardTranslations.json';
import './26_AdminSubDashboard.css';

export default function AdminSubDashboard() {
  const navigate = useNavigate();
  const { user, language, token, startBgMusic } = useAuth();
  const [permissions, setPermissions] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  const loadPermissions = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/sub-admin-permissions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPermissions(res.data);
    } catch (err) {
      console.error('Failed to load permissions', err);
    }
  }, [token]);

  useEffect(() => {
    setIsVisible(true);
    
    const audioEnabled = localStorage.getItem('audioConsent') === 'true' || localStorage.getItem('audio_enabled') === 'true';
    if (audioEnabled && startBgMusic) {
      startBgMusic();
    }
    
    loadPermissions();
  }, [startBgMusic, loadPermissions]);

  const t = adminSubDashboardTranslations[language || 'ar'];

  return (
    <div className={`admin-sub-dashboard-container ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="admin-sub-dashboard-main">
        <div className="admin-sub-dashboard-header">
          <h2 className="admin-sub-dashboard-title">{t.welcome.replace('{firstName}', user?.firstName || 'المدير')}</h2>
          <p className="admin-sub-dashboard-subtitle">{t.sub}</p>
        </div>

        <div className="admin-sub-dashboard-grid">
          {permissions.manageUsers && (
            <div className="admin-sub-dashboard-card" onClick={() => navigate('/admin-users')}>
              <div className="admin-sub-dashboard-card-icon">👥</div>
              <h3 className="admin-sub-dashboard-card-title">{t.manageUsers}</h3>
              <p className="admin-sub-dashboard-card-description">{t.usersDesc}</p>
            </div>
          )}

          {permissions.manageJobs && (
            <div className="admin-sub-dashboard-card" onClick={() => navigate('/admin-jobs')}>
              <div className="admin-sub-dashboard-card-icon">💼</div>
              <h3 className="admin-sub-dashboard-card-title">{t.manageJobs}</h3>
              <p className="admin-sub-dashboard-card-description">{t.jobsDesc}</p>
            </div>
          )}

          {permissions.manageCourses && (
            <div className="admin-sub-dashboard-card" onClick={() => navigate('/admin-courses')}>
              <div className="admin-sub-dashboard-card-icon">🎓</div>
              <h3 className="admin-sub-dashboard-card-title">{t.manageCourses}</h3>
              <p className="admin-sub-dashboard-card-description">{t.coursesDesc}</p>
            </div>
          )}

          {permissions.viewReports && (
            <div className="admin-sub-dashboard-card" onClick={() => navigate('/admin-reports')}>
              <div className="admin-sub-dashboard-card-icon">📊</div>
              <h3 className="admin-sub-dashboard-card-title">{t.viewReports}</h3>
              <p className="admin-sub-dashboard-card-description">{t.reportsDesc}</p>
            </div>
          )}

          <div className="admin-sub-dashboard-card" onClick={() => navigate('/settings')}>
            <div className="admin-sub-dashboard-card-icon">⚙️</div>
            <h3 className="admin-sub-dashboard-card-title">{t.settings}</h3>
            <p className="admin-sub-dashboard-card-description">{t.settingsDesc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}