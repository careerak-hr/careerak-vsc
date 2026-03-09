import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import Enable2FAModal from './SecurityTab/Enable2FAModal';
import Disable2FAModal from './SecurityTab/Disable2FAModal';
import BackupCodesModal from './SecurityTab/BackupCodesModal';
import ActiveSessionsList from './SecurityTab/ActiveSessionsList';
import LoginHistoryList from './SecurityTab/LoginHistoryList';
import './SecurityTab.css';

const SecurityTab = () => {
    const { language } = useApp();
    
    // State
    const [user, setUser] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loginHistory, setLoginHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Modal states
    const [showEnable2FA, setShowEnable2FA] = useState(false);
    const [showDisable2FA, setShowDisable2FA] = useState(false);
    const [showBackupCodes, setShowBackupCodes] = useState(false);

    // Load data on mount
    useEffect(() => {
        loadSecurityData();
    }, []);

    const loadSecurityData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            // Load user data
            const userResponse = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (userResponse.ok) {
                const userData = await userResponse.json();
                setUser(userData.user);
            }

            // Load active sessions
            const sessionsResponse = await fetch('/api/settings/sessions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (sessionsResponse.ok) {
                const sessionsData = await sessionsResponse.json();
                setSessions(sessionsData.sessions || []);
            }

            // Load login history
            const historyResponse = await fetch('/api/settings/login-history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                setLoginHistory(historyData.history || []);
            }
        } catch (error) {
            console.error('Error loading security data:', error);
            setMessage({ type: 'error', text: t.loadError });
        } finally {
            setLoading(false);
        }
    };

    const handle2FAEnabled = (backupCodes) => {
        setShowEnable2FA(false);
        setUser(prev => ({ ...prev, twoFactorEnabled: true }));
        setMessage({ type: 'success', text: t.twoFactorEnabled });
        // Optionally show backup codes modal
        if (backupCodes) {
            setShowBackupCodes(true);
        }
    };

    const handle2FADisabled = () => {
        setShowDisable2FA(false);
        setUser(prev => ({ ...prev, twoFactorEnabled: false }));
        setMessage({ type: 'success', text: t.twoFactorDisabled });
    };

    const handleLogoutSession = async (sessionId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/settings/sessions/${sessionId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setSessions(prev => prev.filter(s => s.id !== sessionId));
                setMessage({ type: 'success', text: t.sessionLoggedOut });
            } else {
                setMessage({ type: 'error', text: t.logoutError });
            }
        } catch (error) {
            setMessage({ type: 'error', text: t.logoutError });
        }
    };

    const handleLogoutAllOthers = async () => {
        if (!window.confirm(t.confirmLogoutAll)) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/settings/sessions/others', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                await loadSecurityData();
                setMessage({ type: 'success', text: t.allSessionsLoggedOut });
            } else {
                setMessage({ type: 'error', text: t.logoutError });
            }
        } catch (error) {
            setMessage({ type: 'error', text: t.logoutError });
        }
    };

    const translations = {
        ar: {
            title: 'الأمان',
            twoFactorAuth: 'المصادقة الثنائية (2FA)',
            twoFactorDesc: 'أضف طبقة أمان إضافية لحسابك',
            enabled: 'مفعّل',
            disabled: 'معطّل',
            enable: 'تفعيل',
            disable: 'تعطيل',
            viewBackupCodes: 'عرض أكواد الاحتياط',
            activeSessions: 'الجلسات النشطة',
            activeSessionsDesc: 'إدارة الأجهزة المتصلة بحسابك',
            logoutAll: 'تسجيل الخروج من جميع الأجهزة الأخرى',
            loginHistory: 'سجل تسجيل الدخول',
            loginHistoryDesc: 'عرض آخر محاولات تسجيل الدخول',
            twoFactorEnabled: 'تم تفعيل المصادقة الثنائية بنجاح',
            twoFactorDisabled: 'تم تعطيل المصادقة الثنائية',
            sessionLoggedOut: 'تم تسجيل الخروج من الجلسة',
            allSessionsLoggedOut: 'تم تسجيل الخروج من جميع الجلسات الأخرى',
            logoutError: 'حدث خطأ أثناء تسجيل الخروج',
            loadError: 'حدث خطأ أثناء تحميل البيانات',
            confirmLogoutAll: 'هل أنت متأكد من تسجيل الخروج من جميع الأجهزة الأخرى؟',
            loading: 'جاري التحميل...'
        },
        en: {
            title: 'Security',
            twoFactorAuth: 'Two-Factor Authentication (2FA)',
            twoFactorDesc: 'Add an extra layer of security to your account',
            enabled: 'Enabled',
            disabled: 'Disabled',
            enable: 'Enable',
            disable: 'Disable',
            viewBackupCodes: 'View Backup Codes',
            activeSessions: 'Active Sessions',
            activeSessionsDesc: 'Manage devices connected to your account',
            logoutAll: 'Logout from all other devices',
            loginHistory: 'Login History',
            loginHistoryDesc: 'View recent login attempts',
            twoFactorEnabled: 'Two-factor authentication enabled successfully',
            twoFactorDisabled: 'Two-factor authentication disabled',
            sessionLoggedOut: 'Session logged out successfully',
            allSessionsLoggedOut: 'All other sessions logged out successfully',
            logoutError: 'Error logging out',
            loadError: 'Error loading data',
            confirmLogoutAll: 'Are you sure you want to logout from all other devices?',
            loading: 'Loading...'
        },
        fr: {
            title: 'Sécurité',
            twoFactorAuth: 'Authentification à deux facteurs (2FA)',
            twoFactorDesc: 'Ajoutez une couche de sécurité supplémentaire à votre compte',
            enabled: 'Activé',
            disabled: 'Désactivé',
            enable: 'Activer',
            disable: 'Désactiver',
            viewBackupCodes: 'Voir les codes de secours',
            activeSessions: 'Sessions actives',
            activeSessionsDesc: 'Gérer les appareils connectés à votre compte',
            logoutAll: 'Se déconnecter de tous les autres appareils',
            loginHistory: 'Historique de connexion',
            loginHistoryDesc: 'Voir les tentatives de connexion récentes',
            twoFactorEnabled: 'Authentification à deux facteurs activée avec succès',
            twoFactorDisabled: 'Authentification à deux facteurs désactivée',
            sessionLoggedOut: 'Session déconnectée avec succès',
            allSessionsLoggedOut: 'Toutes les autres sessions déconnectées avec succès',
            logoutError: 'Erreur lors de la déconnexion',
            loadError: 'Erreur lors du chargement des données',
            confirmLogoutAll: 'Êtes-vous sûr de vouloir vous déconnecter de tous les autres appareils?',
            loading: 'Chargement...'
        }
    };

    const t = translations[language] || translations.en;

    if (loading) {
        return (
            <div className="security-tab">
                <div className="loading-message">{t.loading}</div>
            </div>
        );
    }

    return (
        <div className="security-tab">
            <h2 className="security-title">{t.title}</h2>

            {/* Message */}
            {message.text && (
                <div className={`security-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Two-Factor Authentication */}
            <section className="security-section">
                <div className="section-header">
                    <div className="section-info">
                        <h3 className="section-title">
                            <span className="section-icon">🔐</span>
                            {t.twoFactorAuth}
                        </h3>
                        <p className="section-description">{t.twoFactorDesc}</p>
                    </div>
                    <div className="section-status">
                        <span className={`status-badge ${user?.twoFactorEnabled ? 'enabled' : 'disabled'}`}>
                            {user?.twoFactorEnabled ? t.enabled : t.disabled}
                        </span>
                    </div>
                </div>

                <div className="section-actions">
                    {user?.twoFactorEnabled ? (
                        <>
                            <button
                                onClick={() => setShowDisable2FA(true)}
                                className="btn btn-secondary"
                            >
                                {t.disable}
                            </button>
                            <button
                                onClick={() => setShowBackupCodes(true)}
                                className="btn btn-outline"
                            >
                                {t.viewBackupCodes}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setShowEnable2FA(true)}
                            className="btn btn-primary"
                        >
                            {t.enable}
                        </button>
                    )}
                </div>
            </section>

            {/* Active Sessions */}
            <section className="security-section">
                <div className="section-header">
                    <div className="section-info">
                        <h3 className="section-title">
                            <span className="section-icon">💻</span>
                            {t.activeSessions}
                        </h3>
                        <p className="section-description">{t.activeSessionsDesc}</p>
                    </div>
                </div>

                <ActiveSessionsList
                    sessions={sessions}
                    onLogout={handleLogoutSession}
                    language={language}
                />

                {sessions.length > 1 && (
                    <div className="section-actions">
                        <button
                            onClick={handleLogoutAllOthers}
                            className="btn btn-danger"
                        >
                            {t.logoutAll}
                        </button>
                    </div>
                )}
            </section>

            {/* Login History */}
            <section className="security-section">
                <div className="section-header">
                    <div className="section-info">
                        <h3 className="section-title">
                            <span className="section-icon">📜</span>
                            {t.loginHistory}
                        </h3>
                        <p className="section-description">{t.loginHistoryDesc}</p>
                    </div>
                </div>

                <LoginHistoryList
                    history={loginHistory}
                    language={language}
                />
            </section>

            {/* Modals */}
            {showEnable2FA && (
                <Enable2FAModal
                    onClose={() => setShowEnable2FA(false)}
                    onSuccess={handle2FAEnabled}
                    language={language}
                />
            )}

            {showDisable2FA && (
                <Disable2FAModal
                    onClose={() => setShowDisable2FA(false)}
                    onSuccess={handle2FADisabled}
                    language={language}
                />
            )}

            {showBackupCodes && (
                <BackupCodesModal
                    onClose={() => setShowBackupCodes(false)}
                    language={language}
                />
            )}
        </div>
    );
};

export default SecurityTab;
