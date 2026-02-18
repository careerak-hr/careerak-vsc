import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useFocusTrap } from './Accessibility/FocusTrap';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const { language, user, logout } = useApp();
    const { isDark, themeMode, toggleTheme } = useTheme();
    const [showSettings, setShowSettings] = useState(false);
    
    // Focus trap for settings panel
    const settingsPanelRef = useFocusTrap(showSettings, () => setShowSettings(false));

    // Get theme icon based on current mode
    const getThemeIcon = () => {
        if (themeMode === 'light') return '☀️';
        if (themeMode === 'dark') return '🌙';
        return '🌓'; // system
    };

    // Get theme label
    const getThemeLabel = () => {
        const labels = {
            ar: { light: 'فاتح', dark: 'داكن', system: 'النظام' },
            en: { light: 'Light', dark: 'Dark', system: 'System' },
            fr: { light: 'Clair', dark: 'Sombre', system: 'Système' }
        };
        return labels[language]?.[themeMode] || labels.en[themeMode];
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <nav 
                className="navbar-container dark:bg-primary/80 dark:border-secondary/20 transition-colors duration-300"
                role="navigation"
                aria-label={language === 'ar' ? 'التنقل الرئيسي' : language === 'fr' ? 'Navigation principale' : 'Main navigation'}
            >
                {/* Logo */}
                <div className="navbar-logo-container">
                    <img 
                        src="/logo.png" 
                        alt="Careerak" 
                        className="navbar-logo dark:border-accent transition-colors duration-300"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                    <span className="navbar-logo-text dark:text-secondary transition-colors duration-300">
                        Careerak
                    </span>
                </div>

                {/* Actions */}
                <div className="navbar-actions-container">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="navbar-action-btn dark:text-secondary dark:hover:text-accent transition-all duration-300"
                        aria-label={`Toggle theme (current: ${themeMode})`}
                        title={getThemeLabel()}
                    >
                        <span className="text-2xl">{getThemeIcon()}</span>
                    </button>

                    {/* Settings Button */}
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="navbar-settings-btn dark:bg-secondary/10 dark:hover:bg-secondary/20 transition-all duration-300"
                        aria-label={language === 'ar' ? 'الإعدادات' : language === 'fr' ? 'Paramètres' : 'Settings'}
                        aria-expanded={showSettings}
                        aria-controls="settings-panel"
                    >
                        ⚙️
                    </button>
                </div>
            </nav>

            {/* Settings Panel */}
            {showSettings && (
                <div 
                    className="settings-panel-backdrop"
                    onClick={() => setShowSettings(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="settings-panel-title"
                >
                    <div 
                        ref={settingsPanelRef}
                        id="settings-panel"
                        className="settings-panel dark:bg-primary dark:shadow-2xl transition-colors duration-300"
                        onClick={(e) => e.stopPropagation()}
                        dir={language === 'ar' ? 'rtl' : 'ltr'}
                        role="document"
                    >
                        {/* Header */}
                        <div className="settings-panel-header">
                            <h2 
                                id="settings-panel-title"
                                className="settings-panel-title dark:text-secondary transition-colors duration-300"
                            >
                                {language === 'ar' ? 'الإعدادات' : 
                                 language === 'fr' ? 'Paramètres' : 
                                 'Settings'}
                            </h2>
                            <button 
                                onClick={() => setShowSettings(false)}
                                className="settings-panel-close-btn dark:text-secondary transition-colors duration-300"
                                aria-label={language === 'ar' ? 'إغلاق' : language === 'fr' ? 'Fermer' : 'Close'}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div className="settings-panel-content">
                            {/* User Info */}
                            {user && (
                                <div className="settings-panel-item dark:bg-secondary/10 transition-colors duration-300">
                                    <span className="settings-panel-item-label dark:text-secondary transition-colors duration-300">
                                        {user.name || user.username}
                                    </span>
                                </div>
                            )}

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="settings-panel-btn dark:bg-secondary/10 dark:hover:bg-secondary/20 transition-all duration-300"
                            >
                                <span className="settings-panel-item-label dark:text-secondary transition-colors duration-300">
                                    {language === 'ar' ? 'المظهر' : 
                                     language === 'fr' ? 'Thème' : 
                                     'Theme'}
                                </span>
                                <span className="flex items-center gap-2 dark:text-accent transition-colors duration-300">
                                    <span className="text-xl">{getThemeIcon()}</span>
                                    <span className="text-sm">{getThemeLabel()}</span>
                                </span>
                            </button>

                            {/* Navigation Links */}
                            <button
                                onClick={() => {
                                    navigate('/profile');
                                    setShowSettings(false);
                                }}
                                className="settings-panel-btn dark:bg-secondary/10 dark:hover:bg-secondary/20 transition-all duration-300"
                            >
                                <span className="settings-panel-item-label dark:text-secondary transition-colors duration-300">
                                    {language === 'ar' ? 'الملف الشخصي' : 
                                     language === 'fr' ? 'Profil' : 
                                     'Profile'}
                                </span>
                                <span className="dark:text-accent transition-colors duration-300">👤</span>
                            </button>

                            <button
                                onClick={() => {
                                    navigate('/settings');
                                    setShowSettings(false);
                                }}
                                className="settings-panel-btn dark:bg-secondary/10 dark:hover:bg-secondary/20 transition-all duration-300"
                            >
                                <span className="settings-panel-item-label dark:text-secondary transition-colors duration-300">
                                    {language === 'ar' ? 'الإعدادات المتقدمة' : 
                                     language === 'fr' ? 'Paramètres Avancés' : 
                                     'Advanced Settings'}
                                </span>
                                <span className="dark:text-accent transition-colors duration-300">⚙️</span>
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="settings-panel-footer">
                            <button
                                onClick={handleLogout}
                                className="settings-panel-logout-btn dark:bg-danger/20 dark:text-danger transition-all duration-300"
                            >
                                <span>
                                    {language === 'ar' ? 'تسجيل الخروج' : 
                                     language === 'fr' ? 'Déconnexion' : 
                                     'Logout'}
                                </span>
                                <span>🚪</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
