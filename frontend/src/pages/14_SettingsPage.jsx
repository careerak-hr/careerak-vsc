import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import notificationManager from '../services/notificationManager';
import './14_SettingsPage.css';

const SettingsPage = () => {
    const { language, saveLanguage, logout, startBgMusic } = useApp();
    const { isDark, themeMode, toggleTheme, setTheme } = useTheme();
    
    // Notification state
    const [notificationPermission, setNotificationPermission] = useState('default');
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');

    useEffect(() => {
        startBgMusic();
        
        // Check notification permission status
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
            setNotificationsEnabled(localStorage.getItem('notificationsEnabled') === 'true');
        }
    }, [startBgMusic]);

    const handleLanguageChange = (newLanguage) => {
        saveLanguage(newLanguage);
    };

    const handleLogout = () => {
        logout();
    };

    // Handle notification permission request
    const handleRequestNotificationPermission = async () => {
        setNotificationMessage('');
        
        try {
            const permission = await notificationManager.requestPermission();
            setNotificationPermission(permission);
            
            if (permission === 'granted') {
                setNotificationMessage('✅ Notification permission granted!');
                notificationManager.setEnabled(true);
                setNotificationsEnabled(true);
                
                // Send test notification
                setTimeout(() => {
                    notificationManager.testNotification('individual');
                }, 1000);
            } else if (permission === 'denied') {
                setNotificationMessage('❌ Notification permission denied. Please enable it in your browser settings.');
            } else {
                setNotificationMessage('⚠️ Notification permission dismissed.');
            }
        } catch (error) {
            setNotificationMessage(`❌ Error: ${error.message}`);
        }
    };

    // Handle toggle notifications
    const handleToggleNotifications = () => {
        const newState = !notificationsEnabled;
        notificationManager.setEnabled(newState);
        setNotificationsEnabled(newState);
        setNotificationMessage(newState ? '✅ Notifications enabled' : '❌ Notifications disabled');
    };

    // Get permission status display
    const getPermissionStatusDisplay = () => {
        switch (notificationPermission) {
            case 'granted':
                return { text: 'Granted ✅', color: '#4CAF50' };
            case 'denied':
                return { text: 'Denied ❌', color: '#f44336' };
            default:
                return { text: 'Not requested', color: '#9e9e9e' };
        }
    };

    const permissionStatus = getPermissionStatusDisplay();

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

                {/* Notification Settings */}
                <div className="settings-section dark:bg-secondary dark:border-secondary transition-all duration-300">
                    <h2 className="settings-section-title dark:text-primary transition-colors duration-300">
                        🔔 Notifications
                    </h2>
                    
                    {/* Browser Support Check */}
                    {!('Notification' in window) ? (
                        <div className="settings-warning" style={{ 
                            padding: '12px', 
                            backgroundColor: '#fff3cd', 
                            border: '1px solid #ffc107',
                            borderRadius: '8px',
                            marginBottom: '16px'
                        }}>
                            ⚠️ Your browser doesn't support notifications. Please use a modern browser like Chrome, Firefox, or Edge.
                        </div>
                    ) : (
                        <>
                            {/* Permission Status */}
                            <div className="settings-status-row" style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '16px',
                                padding: '12px',
                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                borderRadius: '8px'
                            }}>
                                <span className="settings-section-text dark:text-secondary transition-colors duration-300">
                                    Permission Status:
                                </span>
                                <span style={{ 
                                    color: permissionStatus.color,
                                    fontWeight: 'bold'
                                }}>
                                    {permissionStatus.text}
                                </span>
                            </div>

                            {/* Notification Message */}
                            {notificationMessage && (
                                <div style={{ 
                                    padding: '12px', 
                                    backgroundColor: notificationMessage.includes('❌') ? '#ffebee' : '#e8f5e9',
                                    border: `1px solid ${notificationMessage.includes('❌') ? '#f44336' : '#4CAF50'}`,
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    color: notificationMessage.includes('❌') ? '#c62828' : '#2e7d32'
                                }}>
                                    {notificationMessage}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="settings-buttons">
                                {notificationPermission !== 'granted' ? (
                                    <button 
                                        onClick={handleRequestNotificationPermission}
                                        className="settings-btn dark:bg-accent dark:text-inverse transition-all duration-300"
                                        aria-label="Request notification permission"
                                    >
                                        🔔 Enable Notifications
                                    </button>
                                ) : (
                                    <>
                                        <button 
                                            onClick={handleToggleNotifications}
                                            className={`settings-btn dark:bg-accent dark:text-inverse transition-all duration-300 ${notificationsEnabled ? 'settings-btn-active' : ''}`}
                                            aria-label={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
                                            aria-pressed={notificationsEnabled}
                                        >
                                            {notificationsEnabled ? '🔔 Notifications On' : '🔕 Notifications Off'}
                                        </button>
                                        
                                        {notificationsEnabled && (
                                            <button 
                                                onClick={() => notificationManager.testNotification('individual')}
                                                className="settings-btn dark:bg-accent dark:text-inverse transition-all duration-300"
                                                aria-label="Test notification"
                                            >
                                                🧪 Test Notification
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Info Section */}
                            <div style={{ 
                                marginTop: '16px',
                                padding: '12px',
                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                borderRadius: '8px'
                            }}>
                                <h4 className="settings-section-text dark:text-secondary transition-colors duration-300" style={{ 
                                    marginBottom: '8px',
                                    fontWeight: 'bold'
                                }}>
                                    ℹ️ About Notifications
                                </h4>
                                <ul className="settings-section-text dark:text-secondary transition-colors duration-300" style={{ 
                                    paddingLeft: '20px',
                                    margin: 0,
                                    fontSize: '14px',
                                    lineHeight: '1.6'
                                }}>
                                    <li>Receive real-time updates about job matches and applications</li>
                                    <li>Get notified about new messages and opportunities</li>
                                    <li>Works even when the app is closed (PWA feature)</li>
                                    <li>You can disable notifications anytime from this page</li>
                                </ul>
                            </div>
                        </>
                    )}
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
