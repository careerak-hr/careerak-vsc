import React, { useState } from 'react';
import './Disable2FAModal.css';

const Disable2FAModal = ({ onClose, onSuccess, language }) => {
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/settings/2fa/disable', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password, otp })
            });

            if (response.ok) {
                onSuccess();
            } else {
                const errorData = await response.json();
                setError(errorData.message || t.disableError);
            }
        } catch (error) {
            setError(t.disableError);
        } finally {
            setLoading(false);
        }
    };

    const translations = {
        ar: {
            title: 'تعطيل المصادقة الثنائية',
            warning: 'تحذير: سيؤدي تعطيل المصادقة الثنائية إلى تقليل أمان حسابك',
            passwordLabel: 'كلمة المرور الحالية',
            passwordPlaceholder: 'أدخل كلمة المرور',
            otpLabel: 'رمز التحقق',
            otpPlaceholder: '000000',
            otpHelp: 'أدخل الرمز من تطبيق المصادقة',
            disable: 'تعطيل',
            cancel: 'إلغاء',
            disabling: 'جاري التعطيل...',
            disableError: 'حدث خطأ أثناء التعطيل'
        },
        en: {
            title: 'Disable Two-Factor Authentication',
            warning: 'Warning: Disabling two-factor authentication will reduce your account security',
            passwordLabel: 'Current Password',
            passwordPlaceholder: 'Enter your password',
            otpLabel: 'Verification Code',
            otpPlaceholder: '000000',
            otpHelp: 'Enter the code from your authenticator app',
            disable: 'Disable',
            cancel: 'Cancel',
            disabling: 'Disabling...',
            disableError: 'Error disabling two-factor authentication'
        },
        fr: {
            title: 'Désactiver l\'authentification à deux facteurs',
            warning: 'Attention: La désactivation de l\'authentification à deux facteurs réduira la sécurité de votre compte',
            passwordLabel: 'Mot de passe actuel',
            passwordPlaceholder: 'Entrez votre mot de passe',
            otpLabel: 'Code de vérification',
            otpPlaceholder: '000000',
            otpHelp: 'Entrez le code de votre application d\'authentification',
            disable: 'Désactiver',
            cancel: 'Annuler',
            disabling: 'Désactivation...',
            disableError: 'Erreur lors de la désactivation de l\'authentification à deux facteurs'
        }
    };

    const t = translations[language] || translations.en;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content disable-2fa-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t.title}</h2>
                    <button onClick={onClose} className="modal-close" aria-label="Close">
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    <div className="warning-message">
                        <span className="warning-icon">⚠️</span>
                        <p>{t.warning}</p>
                    </div>

                    {error && (
                        <div className="error-message">{error}</div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="password">{t.passwordLabel}</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t.passwordPlaceholder}
                                required
                                autoFocus
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="otp">{t.otpLabel}</label>
                            <input
                                id="otp"
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder={t.otpPlaceholder}
                                maxLength="6"
                                pattern="\d{6}"
                                required
                                className="otp-input"
                            />
                            <small className="form-help">{t.otpHelp}</small>
                        </div>
                    </form>
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-secondary">
                        {t.cancel}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !password || otp.length !== 6}
                        className="btn btn-danger"
                    >
                        {loading ? t.disabling : t.disable}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Disable2FAModal;
