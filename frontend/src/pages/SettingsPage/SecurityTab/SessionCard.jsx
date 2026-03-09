import React from 'react';
import './SessionCard.css';

const SessionCard = ({ session, onLogout, language }) => {
    const getDeviceIcon = (deviceType) => {
        switch (deviceType?.toLowerCase()) {
            case 'mobile':
                return '📱';
            case 'tablet':
                return '📱';
            case 'desktop':
                return '💻';
            default:
                return '🖥️';
        }
    };

    const getBrowserIcon = (browser) => {
        const browserLower = browser?.toLowerCase() || '';
        if (browserLower.includes('chrome')) return '🌐';
        if (browserLower.includes('firefox')) return '🦊';
        if (browserLower.includes('safari')) return '🧭';
        if (browserLower.includes('edge')) return '🌊';
        return '🌐';
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeAgo = (date) => {
        if (!date) return '';
        const now = new Date();
        const then = new Date(date);
        const diffMs = now - then;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return t.justNow;
        if (diffMins < 60) return `${diffMins} ${t.minutesAgo}`;
        if (diffHours < 24) return `${diffHours} ${t.hoursAgo}`;
        return `${diffDays} ${t.daysAgo}`;
    };

    const translations = {
        ar: {
            currentSession: 'الجلسة الحالية',
            loginTime: 'وقت تسجيل الدخول',
            lastActivity: 'آخر نشاط',
            location: 'الموقع',
            ipAddress: 'عنوان IP',
            logout: 'تسجيل الخروج',
            justNow: 'الآن',
            minutesAgo: 'دقيقة',
            hoursAgo: 'ساعة',
            daysAgo: 'يوم',
            confirmLogout: 'هل أنت متأكد من تسجيل الخروج من هذه الجلسة؟'
        },
        en: {
            currentSession: 'Current Session',
            loginTime: 'Login Time',
            lastActivity: 'Last Activity',
            location: 'Location',
            ipAddress: 'IP Address',
            logout: 'Logout',
            justNow: 'Just now',
            minutesAgo: 'min ago',
            hoursAgo: 'hours ago',
            daysAgo: 'days ago',
            confirmLogout: 'Are you sure you want to logout from this session?'
        },
        fr: {
            currentSession: 'Session actuelle',
            loginTime: 'Heure de connexion',
            lastActivity: 'Dernière activité',
            location: 'Emplacement',
            ipAddress: 'Adresse IP',
            logout: 'Déconnexion',
            justNow: 'À l\'instant',
            minutesAgo: 'min',
            hoursAgo: 'heures',
            daysAgo: 'jours',
            confirmLogout: 'Êtes-vous sûr de vouloir vous déconnecter de cette session?'
        }
    };

    const t = translations[language] || translations.en;

    const handleLogout = () => {
        if (window.confirm(t.confirmLogout)) {
            onLogout(session.id);
        }
    };

    return (
        <div className={`session-card ${session.isCurrent ? 'current-session' : ''}`}>
            {session.isCurrent && (
                <div className="current-badge">{t.currentSession}</div>
            )}

            <div className="session-header">
                <div className="device-info">
                    <span className="device-icon">{getDeviceIcon(session.device?.type)}</span>
                    <div className="device-details">
                        <div className="device-name">
                            {session.device?.os || 'Unknown OS'}
                        </div>
                        <div className="browser-name">
                            <span className="browser-icon">{getBrowserIcon(session.device?.browser)}</span>
                            {session.device?.browser || 'Unknown Browser'}
                        </div>
                    </div>
                </div>

                {!session.isCurrent && (
                    <button
                        onClick={handleLogout}
                        className="logout-button"
                        aria-label={t.logout}
                    >
                        {t.logout}
                    </button>
                )}
            </div>

            <div className="session-details">
                <div className="detail-row">
                    <span className="detail-label">{t.loginTime}:</span>
                    <span className="detail-value">{formatDate(session.loginTime)}</span>
                </div>

                <div className="detail-row">
                    <span className="detail-label">{t.lastActivity}:</span>
                    <span className="detail-value">{getTimeAgo(session.lastActivity)}</span>
                </div>

                {session.location && (
                    <div className="detail-row">
                        <span className="detail-label">{t.location}:</span>
                        <span className="detail-value">
                            {session.location.city && session.location.country
                                ? `${session.location.city}, ${session.location.country}`
                                : session.location.country || 'Unknown'}
                        </span>
                    </div>
                )}

                <div className="detail-row">
                    <span className="detail-label">{t.ipAddress}:</span>
                    <span className="detail-value ip-address">{session.location?.ipAddress || 'Unknown'}</span>
                </div>
            </div>
        </div>
    );
};

export default SessionCard;
