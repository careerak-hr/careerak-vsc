import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './NotificationsTab.css';

const NotificationsTab = () => {
    const { language } = useApp();
    
    // State for notification preferences
    const [preferences, setPreferences] = useState({
        jobNotifications: {
            enabled: true,
            inApp: true,
            email: true,
            push: false
        },
        courseNotifications: {
            enabled: true,
            inApp: true,
            email: false,
            push: false
        },
        chatNotifications: {
            enabled: true,
            inApp: true,
            email: true,
            push: true
        },
        reviewNotifications: {
            enabled: true,
            inApp: true,
            email: false,
            push: false
        },
        systemNotifications: {
            enabled: true,
            inApp: true,
            email: false,
            push: false
        },
        quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00'
        },
        frequency: 'immediate' // immediate, daily, weekly
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Load preferences from API
    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/settings/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response && response.ok) {
                const data = await response.json();
                if (data.preferences) {
                    setPreferences(data.preferences);
                }
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    };

    const handleToggleNotificationType = (type) => {
        setPreferences(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                enabled: !prev[type].enabled
            }
        }));
    };

    const handleToggleMethod = (type, method) => {
        setPreferences(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [method]: !prev[type][method]
            }
        }));
    };

    const handleQuietHoursToggle = () => {
        setPreferences(prev => ({
            ...prev,
            quietHours: {
                ...prev.quietHours,
                enabled: !prev.quietHours.enabled
            }
        }));
    };

    const handleQuietHoursChange = (field, value) => {
        setPreferences(prev => ({
            ...prev,
            quietHours: {
                ...prev.quietHours,
                [field]: value
            }
        }));
    };

    const handleFrequencyChange = (frequency) => {
        setPreferences(prev => ({
            ...prev,
            frequency
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/settings/notifications', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ preferences })
            });

            if (response.ok) {
                setMessage({ 
                    type: 'success', 
                    text: translations[language].saveSuccess 
                });
            } else {
                const error = await response.json();
                setMessage({ 
                    type: 'error', 
                    text: error.message || translations[language].saveError 
                });
            }
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: translations[language].saveError 
            });
        } finally {
            setLoading(false);
        }
    };

    const translations = {
        ar: {
            title: 'إعدادات الإشعارات',
            notificationTypes: 'أنواع الإشعارات',
            jobNotifications: 'إشعارات الوظائف',
            courseNotifications: 'إشعارات الدورات',
            chatNotifications: 'إشعارات المحادثات',
            reviewNotifications: 'إشعارات التقييمات',
            systemNotifications: 'إشعارات النظام',
            methods: 'طرق الإشعار',
            inApp: 'داخل التطبيق',
            email: 'البريد الإلكتروني',
            push: 'إشعارات الدفع',
            quietHours: 'ساعات الهدوء',
            quietHoursDesc: 'لن يتم إرسال إشعارات خلال هذه الفترة',
            start: 'البداية',
            end: 'النهاية',
            frequency: 'تكرار الإشعارات',
            immediate: 'فوري',
            daily: 'ملخص يومي',
            weekly: 'ملخص أسبوعي',
            save: 'حفظ التغييرات',
            saving: 'جاري الحفظ...',
            saveSuccess: 'تم حفظ الإعدادات بنجاح',
            saveError: 'حدث خطأ أثناء الحفظ'
        },
        en: {
            title: 'Notification Settings',
            notificationTypes: 'Notification Types',
            jobNotifications: 'Job Notifications',
            courseNotifications: 'Course Notifications',
            chatNotifications: 'Chat Notifications',
            reviewNotifications: 'Review Notifications',
            systemNotifications: 'System Notifications',
            methods: 'Notification Methods',
            inApp: 'In-App',
            email: 'Email',
            push: 'Push',
            quietHours: 'Quiet Hours',
            quietHoursDesc: 'No notifications will be sent during this period',
            start: 'Start',
            end: 'End',
            frequency: 'Notification Frequency',
            immediate: 'Immediate',
            daily: 'Daily Digest',
            weekly: 'Weekly Digest',
            save: 'Save Changes',
            saving: 'Saving...',
            saveSuccess: 'Settings saved successfully',
            saveError: 'Error saving settings'
        },
        fr: {
            title: 'Paramètres de notification',
            notificationTypes: 'Types de notifications',
            jobNotifications: 'Notifications d\'emploi',
            courseNotifications: 'Notifications de cours',
            chatNotifications: 'Notifications de chat',
            reviewNotifications: 'Notifications d\'avis',
            systemNotifications: 'Notifications système',
            methods: 'Méthodes de notification',
            inApp: 'Dans l\'application',
            email: 'E-mail',
            push: 'Push',
            quietHours: 'Heures calmes',
            quietHoursDesc: 'Aucune notification ne sera envoyée pendant cette période',
            start: 'Début',
            end: 'Fin',
            frequency: 'Fréquence des notifications',
            immediate: 'Immédiat',
            daily: 'Résumé quotidien',
            weekly: 'Résumé hebdomadaire',
            save: 'Enregistrer les modifications',
            saving: 'Enregistrement...',
            saveSuccess: 'Paramètres enregistrés avec succès',
            saveError: 'Erreur lors de l\'enregistrement'
        }
    };

    const t = translations[language] || translations.en;

    const notificationTypesList = [
        { key: 'jobNotifications', label: t.jobNotifications, icon: '💼' },
        { key: 'courseNotifications', label: t.courseNotifications, icon: '📚' },
        { key: 'chatNotifications', label: t.chatNotifications, icon: '💬' },
        { key: 'reviewNotifications', label: t.reviewNotifications, icon: '⭐' },
        { key: 'systemNotifications', label: t.systemNotifications, icon: '🔔' }
    ];

    return (
        <div className="notifications-tab">
            <h2 className="notifications-title">{t.title}</h2>

            {/* Message */}
            {message.text && (
                <div className={`notification-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Notification Types */}
            <section className="notifications-section">
                <h3 className="section-title">{t.notificationTypes}</h3>
                
                {notificationTypesList.map(({ key, label, icon }) => (
                    <div key={key} className="notification-type-card">
                        <div className="notification-type-header">
                            <div className="notification-type-info">
                                <span className="notification-icon">{icon}</span>
                                <span className="notification-label">{label}</span>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={preferences[key].enabled}
                                    onChange={() => handleToggleNotificationType(key)}
                                    aria-label={`Toggle ${label}`}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        {preferences[key].enabled && (
                            <div className="notification-methods">
                                <span className="methods-label">{t.methods}:</span>
                                <div className="method-toggles">
                                    <label className="method-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={preferences[key].inApp}
                                            onChange={() => handleToggleMethod(key, 'inApp')}
                                        />
                                        <span>{t.inApp}</span>
                                    </label>
                                    <label className="method-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={preferences[key].email}
                                            onChange={() => handleToggleMethod(key, 'email')}
                                        />
                                        <span>{t.email}</span>
                                    </label>
                                    <label className="method-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={preferences[key].push}
                                            onChange={() => handleToggleMethod(key, 'push')}
                                        />
                                        <span>{t.push}</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </section>

            {/* Quiet Hours */}
            <section className="notifications-section">
                <h3 className="section-title">{t.quietHours}</h3>
                <p className="section-description">{t.quietHoursDesc}</p>
                
                <div className="quiet-hours-card">
                    <div className="quiet-hours-toggle">
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={preferences.quietHours.enabled}
                                onChange={handleQuietHoursToggle}
                                aria-label="Toggle quiet hours"
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    {preferences.quietHours.enabled && (
                        <div className="quiet-hours-times">
                            <div className="time-input-group">
                                <label htmlFor="quiet-start">{t.start}</label>
                                <input
                                    id="quiet-start"
                                    type="time"
                                    value={preferences.quietHours.start}
                                    onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                                    className="time-input"
                                />
                            </div>
                            <div className="time-input-group">
                                <label htmlFor="quiet-end">{t.end}</label>
                                <input
                                    id="quiet-end"
                                    type="time"
                                    value={preferences.quietHours.end}
                                    onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                                    className="time-input"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Frequency */}
            <section className="notifications-section">
                <h3 className="section-title">{t.frequency}</h3>
                
                <div className="frequency-options">
                    <label className="frequency-option">
                        <input
                            type="radio"
                            name="frequency"
                            value="immediate"
                            checked={preferences.frequency === 'immediate'}
                            onChange={() => handleFrequencyChange('immediate')}
                        />
                        <span className="frequency-label">
                            <span className="frequency-icon">⚡</span>
                            <span>{t.immediate}</span>
                        </span>
                    </label>
                    <label className="frequency-option">
                        <input
                            type="radio"
                            name="frequency"
                            value="daily"
                            checked={preferences.frequency === 'daily'}
                            onChange={() => handleFrequencyChange('daily')}
                        />
                        <span className="frequency-label">
                            <span className="frequency-icon">📅</span>
                            <span>{t.daily}</span>
                        </span>
                    </label>
                    <label className="frequency-option">
                        <input
                            type="radio"
                            name="frequency"
                            value="weekly"
                            checked={preferences.frequency === 'weekly'}
                            onChange={() => handleFrequencyChange('weekly')}
                        />
                        <span className="frequency-label">
                            <span className="frequency-icon">📆</span>
                            <span>{t.weekly}</span>
                        </span>
                    </label>
                </div>
            </section>

            {/* Save Button */}
            <div className="notifications-actions">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="save-button"
                >
                    {loading ? t.saving : t.save}
                </button>
            </div>
        </div>
    );
};

export default NotificationsTab;
