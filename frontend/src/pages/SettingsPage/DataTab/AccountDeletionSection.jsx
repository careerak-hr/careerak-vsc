import React from 'react';
import './AccountDeletionSection.css';

const AccountDeletionSection = ({ onDeleteRequest, language }) => {
    const translations = {
        ar: {
            title: 'حذف الحساب',
            warning: 'تحذير: هذا الإجراء لا يمكن التراجع عنه',
            description: 'حذف حسابك بشكل دائم سيؤدي إلى:',
            consequences: [
                'حذف جميع بياناتك الشخصية',
                'حذف جميع منشوراتك ورسائلك',
                'حذف جميع طلبات التوظيف والدورات',
                'حذف جميع التقييمات والمراجعات',
                'فقدان الوصول إلى حسابك نهائياً'
            ],
            gracePeriod: 'فترة السماح',
            gracePeriodDesc: 'لديك 30 يوماً لإلغاء الحذف قبل أن يصبح نهائياً',
            deleteButton: 'حذف الحساب',
            thinkCarefully: 'يرجى التفكير بعناية قبل المتابعة'
        },
        en: {
            title: 'Delete Account',
            warning: 'Warning: This action cannot be undone',
            description: 'Permanently deleting your account will:',
            consequences: [
                'Delete all your personal data',
                'Delete all your posts and messages',
                'Delete all job applications and courses',
                'Delete all reviews and ratings',
                'Permanently lose access to your account'
            ],
            gracePeriod: 'Grace Period',
            gracePeriodDesc: 'You have 30 days to cancel deletion before it becomes permanent',
            deleteButton: 'Delete Account',
            thinkCarefully: 'Please think carefully before proceeding'
        },
        fr: {
            title: 'Supprimer le compte',
            warning: 'Attention: Cette action est irréversible',
            description: 'La suppression permanente de votre compte entraînera:',
            consequences: [
                'Suppression de toutes vos données personnelles',
                'Suppression de tous vos messages et publications',
                'Suppression de toutes les candidatures et cours',
                'Suppression de tous les avis et évaluations',
                'Perte permanente de l\'accès à votre compte'
            ],
            gracePeriod: 'Période de grâce',
            gracePeriodDesc: 'Vous avez 30 jours pour annuler la suppression avant qu\'elle ne devienne définitive',
            deleteButton: 'Supprimer le compte',
            thinkCarefully: 'Veuillez réfléchir attentivement avant de continuer'
        }
    };

    const t = translations[language] || translations.en;

    return (
        <section className="account-deletion-section">
            <div className="deletion-warning-banner">
                <span className="warning-icon">⚠️</span>
                <span className="warning-text">{t.warning}</span>
            </div>

            <div className="section-header">
                <h3 className="section-title">🗑️ {t.title}</h3>
            </div>

            <div className="deletion-content">
                <p className="deletion-description">{t.description}</p>

                <ul className="consequences-list">
                    {t.consequences.map((consequence, index) => (
                        <li key={index} className="consequence-item">
                            <span className="consequence-icon">❌</span>
                            <span className="consequence-text">{consequence}</span>
                        </li>
                    ))}
                </ul>

                <div className="grace-period-info">
                    <div className="info-header">
                        <span className="info-icon">🕐</span>
                        <span className="info-title">{t.gracePeriod}</span>
                    </div>
                    <p className="info-description">{t.gracePeriodDesc}</p>
                </div>

                <div className="deletion-actions">
                    <p className="think-carefully">💭 {t.thinkCarefully}</p>
                    <button
                        onClick={onDeleteRequest}
                        className="delete-account-button"
                    >
                        {t.deleteButton}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default AccountDeletionSection;
