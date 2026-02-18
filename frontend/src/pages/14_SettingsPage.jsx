import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import './14_SettingsPage.css';

const SettingsPage = () => {
    const { language, saveLanguage, logout, startBgMusic } = useApp();
    const { isDark, themeMode, toggleTheme, setTheme } = useTheme();

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    const handleLanguageChange = (newLanguage) => {
        saveLanguage(newLanguage);
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="settings-page-container dark:bg-primary transition-colors duration-300" role="main">
            <main className="settings-content dark:text-primary transition-colors duration-300">
                <h1 className="settings-title dark:text-primary transition-colors duration-300">Settings Page</h1>
                
                {/* Language Settings */}
                <div className="settings-section dark:bg-secondary dark:border-secondary transition-all duration-300">
                    <h2 className="settings-section-title dark:text-primary transition-colors duration-300">Language</h2>
                    <p className="settings-section-text dark:text-secondary transition-colors duration-300">Current Language: {language}</p>
                    <div className="settings-buttons">
                        <button 
                            onClick={() => handleLanguageChange('ar')}
                            className="settings-btn dark:bg-accent dark:text-inverse transition-all duration-300"
                        >
                            العربية
                        </button>
                        <button 
                            onClick={() => handleLanguageChange('en')}
                            className="settings-btn dark:bg-accent dark:text-inverse transition-all duration-300"
                        >
                            English
                        </button>
                        <button 
                            onClick={() => handleLanguageChange('fr')}
                            className="settings-btn dark:bg-accent dark:text-inverse transition-all duration-300"
                        >
                            Français
                        </button>
                    </div>
                </div>

                {/* Dark Mode Settings */}
                <div className="settings-section dark:bg-secondary dark:border-secondary transition-all duration-300">
                    <h2 className="settings-section-title dark:text-primary transition-colors duration-300">Theme</h2>
                    <p className="settings-section-text dark:text-secondary transition-colors duration-300">
                        Current Mode: {isDark ? 'Dark' : 'Light'} ({themeMode})
                    </p>
                    <div className="settings-buttons">
                        <button 
                            onClick={() => setTheme('light')}
                            className={`settings-btn dark:bg-accent dark:text-inverse transition-all duration-300 ${themeMode === 'light' ? 'settings-btn-active' : ''}`}
                            aria-label="Light theme"
                            aria-pressed={themeMode === 'light'}
                        >
                            ☀️ Light
                        </button>
                        <button 
                            onClick={() => setTheme('dark')}
                            className={`settings-btn dark:bg-accent dark:text-inverse transition-all duration-300 ${themeMode === 'dark' ? 'settings-btn-active' : ''}`}
                            aria-label="Dark theme"
                            aria-pressed={themeMode === 'dark'}
                        >
                            🌙 Dark
                        </button>
                        <button 
                            onClick={() => setTheme('system')}
                            className={`settings-btn dark:bg-accent dark:text-inverse transition-all duration-300 ${themeMode === 'system' ? 'settings-btn-active' : ''}`}
                            aria-label="System theme"
                            aria-pressed={themeMode === 'system'}
                        >
                            💻 System
                        </button>
                    </div>
                    <button 
                        onClick={toggleTheme}
                        className="settings-btn-toggle dark:bg-accent dark:text-inverse transition-all duration-300"
                    >
                        Toggle Theme
                    </button>
                </div>

                {/* Logout */}
                <div className="settings-section dark:bg-secondary dark:border-secondary transition-all duration-300">
                    <button 
                        onClick={handleLogout}
                        className="settings-btn-logout dark:bg-error dark:text-inverse transition-all duration-300"
                    >
                        Logout
                    </button>
                </div>
            </main>
        </div>
    );
}

export default SettingsPage;
