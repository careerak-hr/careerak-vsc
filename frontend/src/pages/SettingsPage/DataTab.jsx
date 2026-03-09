import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import DataExportSection from './DataTab/DataExportSection';
import ExportStatusCard from './DataTab/ExportStatusCard';
import AccountDeletionSection from './DataTab/AccountDeletionSection';
import DeleteAccountModal from './DataTab/DeleteAccountModal';
import PendingDeletionCard from './DataTab/PendingDeletionCard';
import './DataTab.css';

const DataTab = () => {
    const { language } = useApp();
    
    // State
    const [user, setUser] = useState(null);
    const [exportRequests, setExportRequests] = useState([]);
    const [pendingDeletion, setPendingDeletion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Load data on mount
    useEffect(() => {
        loadDataPrivacyInfo();
    }, []);

    const loadDataPrivacyInfo = async () => {
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

            // Load export requests
            const exportsResponse = await fetch('/api/settings/data/exports', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (exportsResponse.ok) {
                const exportsData = await exportsResponse.json();
                setExportRequests(exportsData.exports || []);
            }

            // Load deletion status
            const deletionResponse = await fetch('/api/settings/account/deletion-status', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (deletionResponse.ok) {
                const deletionData = await deletionResponse.json();
                setPendingDeletion(deletionData.pendingDeletion || null);
            }
        } catch (error) {
            console.error('Error loading data privacy info:', error);
            setMessage({ type: 'error', text: t.loadError });
        } finally {
            setLoading(false);
        }
    };

    const handleExportRequest = async (options) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/settings/data/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(options)
            });

            if (response.ok) {
                const data = await response.json();
                setExportRequests(prev => [data.export, ...prev]);
                setMessage({ type: 'success', text: t.exportRequested });
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.message || t.exportError });
            }
        } catch (error) {
            setMessage({ type: 'error', text: t.exportError });
        }
    };

    const handleDeleteAccount = async (options) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/settings/account/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(options)
            });

            if (response.ok) {
                const data = await response.json();
                setPendingDeletion(data.pendingDeletion);
                setShowDeleteModal(false);
                setMessage({ type: 'success', text: t.deletionScheduled });
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.message || t.deletionError });
            }
        } catch (error) {
            setMessage({ type: 'error', text: t.deletionError });
        }
    };

    const handleCancelDeletion = async () => {
        if (!window.confirm(t.confirmCancelDeletion)) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/settings/account/cancel-deletion', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setPendingDeletion(null);
                setMessage({ type: 'success', text: t.deletionCancelled });
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.message || t.cancelError });
            }
        } catch (error) {
            setMessage({ type: 'error', text: t.cancelError });
        }
    };

    const translations = {
        ar: {
            title: 'البيانات والخصوصية',
            subtitle: 'إدارة بياناتك الشخصية وحقوق الخصوصية',
            exportRequested: 'تم طلب تصدير البيانات بنجاح',
            exportError: 'حدث خطأ أثناء طلب التصدير',
            deletionScheduled: 'تم جدولة حذف الحساب',
            deletionError: 'حدث خطأ أثناء طلب الحذف',
            deletionCancelled: 'تم إلغاء حذف الحساب',
            cancelError: 'حدث خطأ أثناء الإلغاء',
            loadError: 'حدث خطأ أثناء تحميل البيانات',
            confirmCancelDeletion: 'هل أنت متأكد من إلغاء حذف الحساب؟',
            loading: 'جاري التحميل...'
        },
        en: {
            title: 'Data & Privacy',
            subtitle: 'Manage your personal data and privacy rights',
            exportRequested: 'Data export requested successfully',
            exportError: 'Error requesting data export',
            deletionScheduled: 'Account deletion scheduled',
            deletionError: 'Error requesting account deletion',
            deletionCancelled: 'Account deletion cancelled',
            cancelError: 'Error cancelling deletion',
            loadError: 'Error loading data',
            confirmCancelDeletion: 'Are you sure you want to cancel account deletion?',
            loading: 'Loading...'
        },
        fr: {
            title: 'Données et confidentialité',
            subtitle: 'Gérez vos données personnelles et vos droits à la confidentialité',
            exportRequested: 'Exportation de données demandée avec succès',
            exportError: 'Erreur lors de la demande d\'exportation',
            deletionScheduled: 'Suppression du compte programmée',
            deletionError: 'Erreur lors de la demande de suppression',
            deletionCancelled: 'Suppression du compte annulée',
            cancelError: 'Erreur lors de l\'annulation',
            loadError: 'Erreur lors du chargement des données',
            confirmCancelDeletion: 'Êtes-vous sûr de vouloir annuler la suppression du compte?',
            loading: 'Chargement...'
        }
    };

    const t = translations[language] || translations.en;

    if (loading) {
        return (
            <div className="data-tab loading">
                <div className="loading-spinner"></div>
                <p>{t.loading}</p>
            </div>
        );
    }

    return (
        <div className="data-tab">
            <div className="data-tab-header">
                <h2 className="data-tab-title">{t.title}</h2>
                <p className="data-tab-subtitle">{t.subtitle}</p>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`data-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Pending Deletion Warning */}
            {pendingDeletion && (
                <PendingDeletionCard
                    pendingDeletion={pendingDeletion}
                    onCancel={handleCancelDeletion}
                    language={language}
                />
            )}

            {/* Data Export Section */}
            <DataExportSection
                onExportRequest={handleExportRequest}
                language={language}
            />

            {/* Export Status Cards */}
            {exportRequests.length > 0 && (
                <div className="export-requests-section">
                    {exportRequests.map(exportRequest => (
                        <ExportStatusCard
                            key={exportRequest._id}
                            exportRequest={exportRequest}
                            language={language}
                        />
                    ))}
                </div>
            )}

            {/* Account Deletion Section */}
            {!pendingDeletion && (
                <AccountDeletionSection
                    onDeleteRequest={() => setShowDeleteModal(true)}
                    language={language}
                />
            )}

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <DeleteAccountModal
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDeleteAccount}
                    user={user}
                    language={language}
                />
            )}
        </div>
    );
};

export default DataTab;
