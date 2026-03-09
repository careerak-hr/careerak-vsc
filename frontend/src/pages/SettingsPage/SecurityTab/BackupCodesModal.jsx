import React, { useState, useEffect } from 'react';
import './BackupCodesModal.css';

const BackupCodesModal = ({ onClose, language }) => {
    const [backupCodes, setBackupCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [regenerating, setRegenerating] = useState(false);

    useEffect(() => {
        loadBackupCodes();
    }, []);

    const loadBackupCodes = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/settings/2fa/backup-codes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setBackupCodes(data.backupCodes || []);
            } else {
                const errorData = await response.json();
                setError(errorData.message || t.loadError);
            }
        } catch (error) {
            setError(t.loadError);
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async () => {
        if (!window.confirm(t.confirmRegenerate)) return;

        setRegenerating(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/settings/2fa/regenerate-codes', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setBackupCodes(data.backupCodes || []);
            } else {
                const errorData = await response.json();
                setError(errorData.message || t.regenerateError);
            }
        } catch (error) {
            setError(t.regenerateError);
        } finally {
            setRegenerating(false);
        }
    };

    const handleDownload = () => {
        const content = `Careerak Backup Codes\n\n${backupCodes.join('\n')}\n\nKeep these codes safe. Each code can only be used once.`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'careerak-backup-codes.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(backupCodes.join('\n'));
            alert(t.copied);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const translations = {
        ar: {
            title: 'أكواد الاحتياط',
            description: 'استخدم هذه الأكواد لتسجيل الدخول إذا فقدت الوصول إلى تطبيق المصادقة',
            warning: 'احفظ هذه الأكواد في مكان آمن. كل كود يمكن استخدامه مرة واحدة فقط.',
            regenerate: 'إعادة إنشاء الأكواد',
            download: 'تحميل',
            copy: 'نسخ',
            close: 'إغلاق',
            regenerating: 'جاري إعادة الإنشاء...',
            confirmRegenerate: 'هل أنت متأكد؟ سيؤدي هذا إلى إبطال جميع الأكواد الحالية.',
            loadError: 'حدث خطأ أثناء تحميل الأكواد',
            regenerateError: 'حدث خطأ أثناء إعادة إنشاء الأكواد',
            copied: 'تم النسخ إلى الحافظة',
            loading: 'جاري التحميل...'
        },
        en: {
            title: 'Backup Codes',
            description: 'Use these codes to login if you lose access to your authenticator app',
            warning: 'Keep these codes safe. Each code can only be used once.',
            regenerate: 'Regenerate Codes',
            download: 'Download',
            copy: 'Copy',
            close: 'Close',
            regenerating: 'Regenerating...',
            confirmRegenerate: 'Are you sure? This will invalidate all current codes.',
            loadError: 'Error loading backup codes',
            regenerateError: 'Error regenerating backup codes',
            copied: 'Copied to clipboard',
            loading: 'Loading...'
        },
        fr: {
            title: 'Codes de secours',
            description: 'Utilisez ces codes pour vous connecter si vous perdez l\'accès à votre application d\'authentification',
            warning: 'Gardez ces codes en sécurité. Chaque code ne peut être utilisé qu\'une seule fois.',
            regenerate: 'Régénérer les codes',
            download: 'Télécharger',
            copy: 'Copier',
            close: 'Fermer',
            regenerating: 'Régénération...',
            confirmRegenerate: 'Êtes-vous sûr? Cela invalidera tous les codes actuels.',
            loadError: 'Erreur lors du chargement des codes de secours',
            regenerateError: 'Erreur lors de la régénération des codes de secours',
            copied: 'Copié dans le presse-papiers',
            loading: 'Chargement...'
        }
    };

    const t = translations[language] || translations.en;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content backup-codes-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t.title}</h2>
                    <button onClick={onClose} className="modal-close" aria-label="Close">
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    <p className="modal-description">{t.description}</p>

                    <div className="warning-message">
                        <span className="warning-icon">⚠️</span>
                        <p>{t.warning}</p>
                    </div>

                    {error && (
                        <div className="error-message">{error}</div>
                    )}

                    {loading ? (
                        <div className="loading-spinner">{t.loading}</div>
                    ) : (
                        <div className="backup-codes-list">
                            {backupCodes.map((code, index) => (
                                <div key={index} className="backup-code-item">
                                    <span className="code-number">{index + 1}.</span>
                                    <code className="backup-code">{code}</code>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <div className="footer-actions">
                        <button
                            onClick={handleRegenerate}
                            disabled={loading || regenerating}
                            className="btn btn-secondary"
                        >
                            {regenerating ? t.regenerating : t.regenerate}
                        </button>
                        <div className="action-buttons">
                            <button
                                onClick={handleDownload}
                                disabled={loading || backupCodes.length === 0}
                                className="btn btn-outline"
                            >
                                {t.download}
                            </button>
                            <button
                                onClick={handleCopy}
                                disabled={loading || backupCodes.length === 0}
                                className="btn btn-outline"
                            >
                                {t.copy}
                            </button>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn btn-primary">
                        {t.close}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BackupCodesModal;
