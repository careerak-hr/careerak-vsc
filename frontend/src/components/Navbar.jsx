import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslate } from '../hooks/useTranslate';
import './Navbar.css';

export const Navbar = () => {
  const { logout, audioEnabled, setAudioEnabled } = useAuth();
  const t = useTranslate();
  const navT = t.navbar;
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifications = [
    { id: 1, type: 'application', message: t.new_job_application, time: '2h ago' },
    { id: 2, type: 'message', message: t.new_message_received, time: '1d ago' },
    { id: 3, type: 'system', message: t.profile_updated_successfully, time: '3d ago' }
  ];

  return (
    <>
      <nav className="navbar-container" dir="rtl">
        <div className="navbar-logo-container">
           <img src="./logo.jpg" alt="Logo" className="navbar-logo" />
           <span className="navbar-logo-text">Careerak</span>
        </div>

        <div className="navbar-actions-container">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="navbar-action-btn"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="navbar-action-btn relative"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 7v5h5l-5 5v-5H9V7h6z" />
              </svg>
              {notifications.length > 0 && (
                <span className="navbar-notifications-badge">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="navbar-notifications-dropdown">
                <div className="navbar-notifications-header">
                  <h3 className="navbar-notifications-title">{t('notifications')}</h3>
                </div>
                <div className="navbar-notifications-list">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div key={notification.id} className="navbar-notification-item">
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      {t('no_notifications')}
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <button className="w-full text-primary hover:text-primary-dark font-medium">
                    {t('view_all_notifications')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => setShowSettings(true)}
          className="navbar-settings-btn"
        >
          ⚙️
        </button>
      </nav>

      {showSettings && (
        <div className="settings-panel-backdrop" onClick={() => setShowSettings(false)}>
          <div className="settings-panel" onClick={e => e.stopPropagation()} dir="rtl">
            <div className="settings-panel-header">
              <h3 className="settings-panel-title">{navT.settings}</h3>
              <button onClick={() => setShowSettings(false)} className="settings-panel-close-btn">✕</button>
            </div>

            <div className="settings-panel-content">
              <div className="settings-panel-item">
                <span className="settings-panel-item-label">{navT.music}</span>
                <input type="checkbox" checked={audioEnabled} onChange={() => setAudioEnabled(!audioEnabled)} className="settings-panel-item-toggle" />
              </div>

              <div className="settings-panel-item">
                <span className="settings-panel-item-label">{navT.voice}</span>
                <input type="checkbox" defaultChecked className="settings-panel-item-toggle" />
              </div>

              <button className="settings-panel-btn">
                <span className="settings-panel-item-label">{navT.notifications}</span>
                <span>🔔</span>
              </button>

              <button className="settings-panel-btn">
                <span className="settings-panel-item-label">{navT.changePass}</span>
                <span>🔑</span>
              </button>

              <hr className="border-gray-100" />

              <button onClick={logout} className="settings-panel-logout-btn">
                <span>{navT.logout}</span>
                <span>🚪</span>
              </button>

              <button className="settings-panel-delete-btn">
                <span>{navT.deleteAccount}</span>
                <span>⚠️</span>
              </button>
            </div>

            <div className="settings-panel-footer">
               <button className="settings-panel-exit-btn">
                  {navT.exit}
               </button>
            </div>
          </div>
        </div>
      )}

      {showSearch && (
        <div className="search-bar-container">
          <div className="search-bar-content">
            <div className="search-bar-input-wrapper">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search_jobs_courses_users}
                className="search-bar-input"
              />
              <svg className="search-bar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <div className="search-results-container">
                <div className="search-result-item">
                  <p className="search-result-title">Software Developer</p>
                  <p className="search-result-subtitle">Job posting</p>
                </div>
                <div className="search-result-item">
                  <p className="search-result-title">React Course</p>
                  <p className="search-result-subtitle">Training course</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};