import React from 'react';
import './ExportStatusCard.css';

const ExportStatusCard = ({ exportRequest, language }) => {
    const translations = {
        ar: {
            status: {
                pending: 'قيد الانتظار',
                processing: 'جاري المعالجة',
                completed: 'مكتمل',
                failed: 'فشل'
            },
            requestedAt: 'تاريخ الطلب',
            format: 'التنسيق',
            dataTypes: 'أنواع البيانات',
            progress: 'التقدم',
            download: 'تحميل',
            expiresIn: 'ينتهي خلال',
            days: 'أيام',
            expired: 'منتهي الصلاحية',
            fileSize: 'حجم الملف'
        },
        en: {
            status: {
                pending: 'Pending',
                processing: 'Processing',
                completed: 'Completed',
                failed: 'Failed'
            },
            requestedAt: 'Requested',
            format: 'Format',
            dataTypes: 'Data Types',
            progress: 'Progress',
            download: 'Download',
            expiresIn: 'Expires in',
            days: 'days',
            expired: 'Expired',
            fileSize: 'File Size'
        },
        fr: {
            status: {
                pending: 'En attente',
                processing: 'En cours',
                completed: 'Terminé',
                failed: 'Échoué'
            },
            requestedAt: 'Demandé',
            format: 'Format',
            dataTypes: 'Types de données',
            progress: 'Progression',
            download: 'Télécharger',
            expiresIn: 'Expire dans',
            days: 'jours',
            expired: 'Expiré',
            fileSize: 'Taille du fichier'
        }
    };

    const t = translations[language] || translations.en;

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return '⏳';
            case 'processing': return '⚙️';
            case 'completed': return '✅';
            case 'failed': return '❌';
            default: return '📦';
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'processing': return 'status-processing';
            case 'completed': return 'status-completed';
            case 'failed': return 'status-failed';
            default: return '';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '-';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };

    const calculateDaysRemaining = (expiresAt) => {
        if (!expiresAt) return null;
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry - now;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    const daysRemaining = exportRequest.expiresAt ? calculateDaysRemaining(exportRequest.expiresAt) : null;
    const isExpired = daysRemaining !== null && daysRemaining === 0;

    return (
        <div className={`export-status-card ${getStatusClass(exportRequest.status)}`}>
            <div className="export-card-header">
                <div className="export-status">
                    <span className="status-icon">{getStatusIcon(exportRequest.status)}</span>
                    <span className="status-text">{t.status[exportRequest.status]}</span>
                </div>
                <span className="export-date">{formatDate(exportRequest.requestedAt)}</span>
            </div>

            <div className="export-card-body">
                {/* Data Types */}
                <div className="export-info-row">
                    <span className="info-label">{t.dataTypes}:</span>
                    <div className="data-types-tags">
                        {exportRequest.dataTypes.map(type => (
                            <span key={type} className="data-type-tag">{type}</span>
                        ))}
                    </div>
                </div>

                {/* Format */}
                <div className="export-info-row">
                    <span className="info-label">{t.format}:</span>
                    <span className="info-value">{exportRequest.format.toUpperCase()}</span>
                </div>

                {/* File Size */}
                {exportRequest.fileSize && (
                    <div className="export-info-row">
                        <span className="info-label">{t.fileSize}:</span>
                        <span className="info-value">{formatFileSize(exportRequest.fileSize)}</span>
                    </div>
                )}

                {/* Progress Bar */}
                {exportRequest.status === 'processing' && (
                    <div className="export-progress">
                        <div className="progress-label">
                            <span>{t.progress}</span>
                            <span>{exportRequest.progress}%</span>
                        </div>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${exportRequest.progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Download Button */}
                {exportRequest.status === 'completed' && exportRequest.downloadUrl && !isExpired && (
                    <div className="export-actions">
                        <a
                            href={exportRequest.downloadUrl}
                            download
                            className="download-button"
                        >
                            📥 {t.download}
                        </a>
                        {daysRemaining !== null && (
                            <span className="expiry-info">
                                {t.expiresIn} {daysRemaining} {t.days}
                            </span>
                        )}
                    </div>
                )}

                {/* Expired Message */}
                {isExpired && (
                    <div className="expired-message">
                        ⚠️ {t.expired}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExportStatusCard;
