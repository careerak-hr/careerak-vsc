import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import notificationManager from '../services/notificationManager';
import './14_SettingsPage_Styled.css';
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';

const SettingsPage = () => {
    const { language, saveLanguage, logout, startBgMusic } = useApp();
    const seo = useSEO('settings', {});
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
        <>
            <SEOHead {...seo} />
            <main 
                id="main-content" 
                tabIndex="-1" 
                className="settings-page-container"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
            <div className="settings-content">
                <h1 className="settings-title">
                    {language === 'ar' ? 'الإعدادات' : language === 'fr' ? 'Paramètres' : 'Settings'}
                </h1>
                
                {/* Language Settings */}
                <fieldset className="settings-section">
                    <legend className="settings-section-title">
                        {language === 'ar' ? 'اللغة' : language === 'fr' ? 'Langue' : 'Language'}
                    </legend>
                    <p className="settings-section-text">
                        {language === 'ar' ? `اللغة الحالية: ${language === 'ar' ? 'العربية' : language === 'en' ? 'الإنجليزية' : 'الفرنسية'}` : 
                         language === 'fr' ? `Langue actuelle: ${language === 'ar' ? 'Arabe' : language === 'en' ? 'Anglais' : 'Français'}` :
                         `Current Language: ${language === 'ar' ? 'Arabic' : language === 'en' ? 'English' : 'French'}`}
                    </p>
                    <div className="settings-buttons" role="group" aria-labelledby="language-legend">
                        <button 
                            onClick={() => handleLanguageChange('ar')}
                            className="settings-btn"
                            aria-pressed={language === 'ar'}
                        >
                            العربية
                        </button>
                        <button 
                            onClick={() => handleLanguageChange('en')}
                            className="settings-btn"
                            aria-pressed={language === 'en'}
                        >
                            English
                        </button>
                        <button 
                            onClick={() => handleLanguageChange('fr')}
                            className="settings-btn"
                            aria-pressed={language === 'fr'}
                        >
                            Français
                        </button>
                    </div>
                </fieldset>

                {/* Dark Mode Settings - DISABLED */}

                {/* Notification Settings */}
                <fieldset className="settings-section">
                    <legend className="settings-section-title">
                        🔔 {language === 'ar' ? 'الإشعارات' : language === 'fr' ? 'Notifications' : 'Notifications'}
                    </legend>
                    
                    {/* Browser Support Check */}
                    {!('Notification' in window) ? (
                        <div className="settings-warning">
                            ⚠️ {language === 'ar' ? 'متصفحك لا يدعم الإشعارات. يرجى استخدام متصفح حديث مثل Chrome أو Firefox أو Edge.' :
                                language === 'fr' ? "Votre navigateur ne prend pas en charge les notifications. Veuillez utiliser un navigateur moderne comme Chrome, Firefox ou Edge." :
                                "Your browser doesn't support notifications. Please use a modern browser like Chrome, Firefox, or Edge."}
                        </div>
                    ) : (
                        <>
                            {/* Permission Status */}
                            <div className="settings-status-row">
                                <span className="settings-section-text">
                                    {language === 'ar' ? 'حالة الإذن:' : language === 'fr' ? 'Statut de permission:' : 'Permission Status:'}
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
                                        className="settings-btn"
                                        aria-label={language === 'ar' ? 'طلب إذن الإشعارات' : language === 'fr' ? 'Demander la permission de notification' : 'Request notification permission'}
                                    >
                                        🔔 {language === 'ar' ? 'تفعيل الإشعارات' : language === 'fr' ? 'Activer les notifications' : 'Enable Notifications'}
                                    </button>
                                ) : (
                                    <>
                                        <button 
                                            onClick={handleToggleNotifications}
                                            className={`settings-btn ${notificationsEnabled ? 'settings-btn-active' : ''}`}
                                            aria-label={notificationsEnabled ? 
                                                (language === 'ar' ? 'تعطيل الإشعارات' : language === 'fr' ? 'Désactiver les notifications' : 'Disable notifications') :
                                                (language === 'ar' ? 'تفعيل الإشعارات' : language === 'fr' ? 'Activer les notifications' : 'Enable notifications')}
                                            aria-pressed={notificationsEnabled}
                                        >
                                            {notificationsEnabled ? 
                                                `🔔 ${language === 'ar' ? 'الإشعارات مفعلة' : language === 'fr' ? 'Notifications activées' : 'Notifications On'}` : 
                                                `🔕 ${language === 'ar' ? 'الإشعارات معطلة' : language === 'fr' ? 'Notifications désactivées' : 'Notifications Off'}`}
                                        </button>
                                        
                                        {notificationsEnabled && (
                                            <button 
                                                onClick={() => notificationManager.testNotification('individual')}
                                                className="settings-btn"
                                                aria-label={language === 'ar' ? 'اختبار الإشعار' : language === 'fr' ? 'Tester la notification' : 'Test notification'}
                                            >
                                                🧪 {language === 'ar' ? 'اختبار الإشعار' : language === 'fr' ? 'Tester' : 'Test Notification'}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Info Section */}
                            <div style={{ 
                                marginTop: '1rem',
                                padding: '0.875rem',
                                backgroundColor: isDark ? 'rgba(227, 218, 209, 0.05)' : 'rgba(48, 75, 96, 0.05)',
                                borderRadius: '0.75rem',
                                border: '1px solid #D4816180'
                            }}>
                                <h3 className="settings-section-text" style={{ 
                                    marginBottom: '0.5rem',
                                    fontWeight: 'bold'
                                }}>
                                    ℹ️ {language === 'ar' ? 'حول الإشعارات' : language === 'fr' ? 'À propos des notifications' : 'About Notifications'}
                                </h3>
                                <ul className="settings-section-text" style={{ 
                                    paddingLeft: language === 'ar' ? '0' : '1.25rem',
                                    paddingRight: language === 'ar' ? '1.25rem' : '0',
                                    margin: 0,
                                    fontSize: '0.875rem',
                                    lineHeight: '1.6'
                                }}>
                                    <li>{language === 'ar' ? 'استقبل تحديثات فورية عن الوظائف المناسبة والطلبات' : 
                                         language === 'fr' ? 'Recevez des mises à jour en temps réel sur les offres d\'emploi et les candidatures' :
                                         'Receive real-time updates about job matches and applications'}</li>
                                    <li>{language === 'ar' ? 'احصل على إشعارات بالرسائل والفرص الجديدة' :
                                         language === 'fr' ? 'Soyez informé des nouveaux messages et opportunités' :
                                         'Get notified about new messages and opportunities'}</li>
                                    <li>{language === 'ar' ? 'يعمل حتى عند إغلاق التطبيق (ميزة PWA)' :
                                         language === 'fr' ? 'Fonctionne même lorsque l\'application est fermée (fonctionnalité PWA)' :
                                         'Works even when the app is closed (PWA feature)'}</li>
                                    <li>{language === 'ar' ? 'يمكنك تعطيل الإشعارات في أي وقت من هذه الصفحة' :
                                         language === 'fr' ? 'Vous pouvez désactiver les notifications à tout moment depuis cette page' :
                                         'You can disable notifications anytime from this page'}</li>
                                </ul>
                            </div>
                        </>
                    )}
                </fieldset>

                {/* Logout */}
                <div className="settings-section">
                    <button 
                        onClick={handleLogout}
                        className="settings-btn-logout"
                        aria-label={language === 'ar' ? 'تسجيل الخروج من حسابك' : language === 'fr' ? 'Se déconnecter de votre compte' : 'Logout from your account'}
                    >
                        {language === 'ar' ? 'تسجيل الخروج' : language === 'fr' ? 'Se déconnecter' : 'Logout'}
                    </button>
                </div>
            </div>
        </main>
        </>
    );
}

export default SettingsPage;
