import React, { useState } from 'react';
import './LoginHistoryList.css';

const LoginHistoryList = ({ history, language }) => {
    const [filter, setFilter] = useState('all'); // all, success, failed
    const [dateRange, setDateRange] = useState('30'); // 7, 30, 90 days

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

    const filterHistory = () => {
        if (!history) return [];

        let filtered = [...history];

        // Filter by success/failed
        if (filter === 'success') {
            filtered = filtered.filter(item => item.success);
        } else if (filter === 'failed') {
            filtered = filtered.filter(item => !item.success);
        }

        // Filter by date range
        const daysAgo = parseInt(dateRange);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
        filtered = filtered.filter(item => new Date(item.timestamp) >= cutoffDate);

        return filtered;
    };

    const translations = {
        ar: {
            title: 'سجل تسجيل الدخول',
            filterLabel: 'تصفية',
            all: 'الكل',
            success: 'ناجح',
            failed: 'فاشل',
            dateRangeLabel: 'الفترة الزمنية',
            last7Days: 'آخر 7 أيام',
            last30Days: 'آخر 30 يوم',
            last90Days: 'آخر 90 يوم',
            noHistory: 'لا يوجد سجل',
            successfulLogin: 'تسجيل دخول ناجح',
            failedLogin: 'محاولة فاشلة',
            location: 'الموقع',
            device: 'الجهاز',
            ipAddress: 'عنوان IP',
            reason: 'السبب'
        },
        en: {
            title: 'Login History',
            filterLabel: 'Filter',
            all: 'All',
            success: 'Successful',
            failed: 'Failed',
            dateRangeLabel: 'Date Range',
            last7Days: 'Last 7 days',
            last30Days: 'Last 30 days',
            last90Days: 'Last 90 days',
            noHistory: 'No history',
            successfulLogin: 'Successful login',
            failedLogin: 'Failed attempt',
            location: 'Location',
            device: 'Device',
            ipAddress: 'IP Address',
            reason: 'Reason'
        },
        fr: {
            title: 'Historique de connexion',
            filterLabel: 'Filtrer',
            all: 'Tout',
            success: 'Réussi',
            failed: 'Échoué',
            dateRangeLabel: 'Période',
            last7Days: '7 derniers jours',
            last30Days: '30 derniers jours',
            last90Days: '90 derniers jours',
            noHistory: 'Aucun historique',
            successfulLogin: 'Connexion réussie',
            failedLogin: 'Tentative échouée',
            location: 'Emplacement',
            device: 'Appareil',
            ipAddress: 'Adresse IP',
            reason: 'Raison'
        }
    };

    const t = translations[language] || translations.en;

    const filteredHistory = filterHistory();

    return (
        <div className="login-history-list">
            {/* Filters */}
            <div className="history-filters">
                <div className="filter-group">
                    <label htmlFor="status-filter">{t.filterLabel}:</label>
                    <select
                        id="status-filter"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">{t.all}</option>
                        <option value="success">{t.success}</option>
                        <option value="failed">{t.failed}</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="date-filter">{t.dateRangeLabel}:</label>
                    <select
                        id="date-filter"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="filter-select"
                    >
                        <option value="7">{t.last7Days}</option>
                        <option value="30">{t.last30Days}</option>
                        <option value="90">{t.last90Days}</option>
                    </select>
                </div>
            </div>

            {/* History List */}
            {filteredHistory.length === 0 ? (
                <div className="no-history">
                    <p>{t.noHistory}</p>
                </div>
            ) : (
                <div className="history-items">
                    {filteredHistory.map((item, index) => (
                        <div
                            key={index}
                            className={`history-item ${item.success ? 'success' : 'failed'}`}
                        >
                            <div className="history-header">
                                <div className="status-indicator">
                                    <span className={`status-icon ${item.success ? 'success' : 'failed'}`}>
                                        {item.success ? '✓' : '✗'}
                                    </span>
                                    <span className="status-text">
                                        {item.success ? t.successfulLogin : t.failedLogin}
                                    </span>
                                </div>
                                <span className="timestamp">{formatDate(item.timestamp)}</span>
                            </div>

                            <div className="history-details">
                                <div className="detail-item">
                                    <span className="device-icon">{getDeviceIcon(item.device?.type)}</span>
                                    <span className="detail-text">
                                        {item.device?.os || 'Unknown'} • {item.device?.browser || 'Unknown'}
                                    </span>
                                </div>

                                {item.location && (
                                    <div className="detail-item">
                                        <span className="detail-icon">📍</span>
                                        <span className="detail-text">
                                            {item.location.city && item.location.country
                                                ? `${item.location.city}, ${item.location.country}`
                                                : item.location.country || 'Unknown'}
                                        </span>
                                    </div>
                                )}

                                <div className="detail-item">
                                    <span className="detail-icon">🌐</span>
                                    <span className="detail-text ip-address">
                                        {item.location?.ipAddress || 'Unknown'}
                                    </span>
                                </div>

                                {!item.success && item.failureReason && (
                                    <div className="detail-item failure-reason">
                                        <span className="detail-icon">⚠️</span>
                                        <span className="detail-text">
                                            {t.reason}: {item.failureReason}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LoginHistoryList;
