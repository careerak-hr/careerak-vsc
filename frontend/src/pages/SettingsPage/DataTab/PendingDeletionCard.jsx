import React from 'react';
import './PendingDeletionCard.css';

const PendingDeletionCard = ({ pendingDeletion, onCancel, language }) => {
    const translations = {
        ar: {
            title: 'حذف الحساب مجدول',
            scheduledFor: 'مجدول للحذف في',
            daysRemaining: 'الأيام المتبقية',
            days: 'يوم',
            warning: 'سيتم حذف حسابك وجميع بياناتك بشكل نهائي في التاريخ المحدد',
            canCancel: 'يمكنك إلغاء الحذف في أي وقت قبل التاريخ المحدد',
            cancelButton: 'إلغاء حذف الحساب',
            lastChance: 'آخر فرصة للإلغاء!'
        },
        en: {
            title: 'Account Deletion Scheduled',
            scheduledFor: 'Scheduled for deletion on',
            daysRemaining: 'Days Remaining',
            days: 'days',
            warning: 'Your account and all data will be permanently deleted on the scheduled date',
            canCancel: 'You can cancel the deletion at any time before the scheduled date',
            cancelButton: 'Cancel Account Deletion',
            lastChance: 'Last chance to cancel!'
        },
        fr: {
            title: 'Suppression du compte programmée',
            scheduledFor: 'Programmé pour suppression le',
            daysRemaining: 'Jours restants',
            days: 'jours',
            warning: 'Votre compte et toutes les données seront définitivement supprimés à la date prévue',
            canCancel: 'Vous pouvez annuler la suppression à tout moment avant la date prévue',
            cancelButton: 'Annuler la suppression du compte',
            lastChance: 'Dernière chance d\'annuler!'
        }
    };

    const t = translations[language] || translations.en;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateDaysRemaining = () => {
        const now = new Date();
        const scheduledDate = new Date(pendingDeletion.scheduledDate);
        const diff = scheduledDate - now;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    const daysRemaining = calculateDaysRemaining();
    const isUrgent = daysRemaining <= 7;

    return (
        <div className={`pending-deletion-card ${isUrgent ? 'urgent' : ''}`}>
            <div className="deletion-card-header">
                <div className="header-icon">
                    {isUrgent ? '🚨' : '⏰'}
                </div>
                <div className="header-content">
                    <h3 className="card-title">{t.title}</h3>
                    {isUrgent && (
                        <span className="urgent-badge">{t.lastChance}</span>
                    )}
                </div>
            </div>

            <div className="deletion-card-body">
                {/* Countdown */}
                <div className="countdown-section">
                    <div className="countdown-circle">
                        <div className="countdown-number">{daysRemaining}</div>
                        <div className="countdown-label">{t.days}</div>
                    </div>
                    <div className="countdown-info">
                        <p className="scheduled-date">
                            <strong>{t.scheduledFor}:</strong>
                            <br />
                            {formatDate(pendingDeletion.scheduledDate)}
                        </p>
                    </div>
                </div>

                {/* Warning */}
                <div className="deletion-warning">
                    <p className="warning-text">
                        ⚠️ {t.warning}
                    </p>
                    <p className="cancel-info">
                        ℹ️ {t.canCancel}
                    </p>
                </div>

                {/* Cancel Button */}
                <button
                    onClick={onCancel}
                    className="cancel-deletion-button"
                >
                    {t.cancelButton}
                </button>
            </div>
        </div>
    );
};

export default PendingDeletionCard;
