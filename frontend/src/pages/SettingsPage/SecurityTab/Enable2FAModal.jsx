import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import './Enable2FAModal.css';

const Enable2FAModal = ({ onClose, onSuccess, language }) => {
    const [step, setStep] = useState(1); // 1: QR Code, 2: Verification
    const [qrData, setQrData] = useState(null);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        generateQRCode();
    }, []);

    const generateQRCode = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/settings/2fa/enable', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setQrData(data);
            } else {
                const errorData = await response.json();
                setError(errorData.message || t.generateError);
            }
        } catch (error) {
            setError(t.generateError);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/settings/2fa/verify-setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ otp })
            });

            if (response.ok) {
                const data = await response.json();
                onSuccess(data.backupCodes);
            } else {
                const errorData = await response.json();
                setError(errorData.message || t.verifyError);
            }
        } catch (error) {
            setError(t.verifyError);
        } finally {
            setLoading(false);
        }
    };

    const translations = {
        ar: {
            title: 'تفعيل المصادقة الثنائية',
            step1Title: 'الخطوة 1: مسح رمز QR',
            step1Desc: 'استخدم تطبيق المصادقة (مثل Google Authenticator) لمسح الرمز',
            step2Title: 'الخطوة 2: التحقق',
            step2Desc: 'أدخل الرمز المكون من 6 أرقام من تطبيق المصادقة',
            manualEntry: 'أو أدخل المفتاح يدوياً:',
            otpLabel: 'رمز التحقق',
            otpPlaceholder: '000000',
            next: 'التالي',
            verify: 'تحقق',
            cancel: 'إلغاء',
            verifying: 'جاري التحقق...',
            generateError: 'حدث خطأ أثناء إنشاء رمز QR',
            verifyError: 'رمز التحقق غير صحيح',
            loading: 'جاري التحميل...'
        },
        en: {
            title: 'Enable Two-Factor Authentication',
            step1Title: 'Step 1: Scan QR Code',
            step1Desc: 'Use an authenticator app (like Google Authenticator) to scan the code',
            step2Title: 'Step 2: Verification',
            step2Desc: 'Enter the 6-digit code from your authenticator app',
            manualEntry: 'Or enter the key manually:',
            otpLabel: 'Verification Code',
            otpPlaceholder: '000000',
            next: 'Next',
            verify: 'Verify',
            cancel: 'Cancel',
            verifying: 'Verifying...',
            generateError: 'Error generating QR code',
            verifyError: 'Invalid verification code',
            loading: 'Loading...'
        },
        fr: {
            title: 'Activer l\'authentification à deux facteurs',
            step1Title: 'Étape 1: Scanner le code QR',
            step1Desc: 'Utilisez une application d\'authentification (comme Google Authenticator) pour scanner le code',
            step2Title: 'Étape 2: Vérification',
            step2Desc: 'Entrez le code à 6 chiffres de votre application d\'authentification',
            manualEntry: 'Ou entrez la clé manuellement:',
            otpLabel: 'Code de vérification',
            otpPlaceholder: '000000',
            next: 'Suivant',
            verify: 'Vérifier',
            cancel: 'Annuler',
            verifying: 'Vérification...',
            generateError: 'Erreur lors de la génération du code QR',
            verifyError: 'Code de vérification invalide',
            loading: 'Chargement...'
        }
    };

    const t = translations[language] || translations.en;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content enable-2fa-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t.title}</h2>
                    <button onClick={onClose} className="modal-close" aria-label="Close">
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    {error && (
                        <div className="error-message">{error}</div>
                    )}

                    {step === 1 && (
                        <div className="step-content">
                            <h3>{t.step1Title}</h3>
                            <p className="step-description">{t.step1Desc}</p>

                            {loading ? (
                                <div className="loading-spinner">{t.loading}</div>
                            ) : qrData ? (
                                <>
                                    <div className="qr-code-container">
                                        <QRCode
                                            value={qrData.qrCode}
                                            size={200}
                                            level="H"
                                            includeMargin={true}
                                        />
                                    </div>

                                    <div className="manual-entry">
                                        <p>{t.manualEntry}</p>
                                        <code className="secret-key">{qrData.secret}</code>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="step-content">
                            <h3>{t.step2Title}</h3>
                            <p className="step-description">{t.step2Desc}</p>

                            <form onSubmit={handleVerify}>
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
                                        autoFocus
                                        className="otp-input"
                                    />
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-secondary">
                        {t.cancel}
                    </button>
                    {step === 1 ? (
                        <button
                            onClick={() => setStep(2)}
                            disabled={loading || !qrData}
                            className="btn btn-primary"
                        >
                            {t.next}
                        </button>
                    ) : (
                        <button
                            onClick={handleVerify}
                            disabled={loading || otp.length !== 6}
                            className="btn btn-primary"
                        >
                            {loading ? t.verifying : t.verify}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Enable2FAModal;
