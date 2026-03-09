import React, { useState } from 'react';
import './DeleteAccountModal.css';

const DeleteAccountModal = ({ onClose, onConfirm, user, language }) => {
    const [step, setStep] = useState(1);
    const [deletionType, setDeletionType] = useState('scheduled');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmText, setConfirmText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const translations = {
        ar: {
            title: 'تأكيد حذف الحساب',
            step1Title: 'الخطوة 1: اختر نوع الحذف',
            step2Title: 'الخطوة 2: التحقق من الهوية',
            step3Title: 'الخطوة 3: التأكيد النهائي',
            immediate: 'حذف فوري',
            immediateDesc: 'حذف الحساب فوراً بدون فترة سماح',
            scheduled: 'حذف مجدول (موصى به)',
            scheduledDesc: 'حذف بعد 30 يوم مع إمكانية الإلغاء',
            enterPassword: 'أدخل كلمة المرور',
            passwordPlaceholder: 'كلمة المرور',
            enterOTP: 'أدخل رمز التحقق (2FA)',
            otpPlaceholder: 'رمز التحقق',
            otpNote: 'المصادقة الثنائية مفعلة على حسابك',
            confirmDelete: 'للتأكيد، اكتب "حذف حسابي" في الحقل أدناه',
            confirmPlaceholder: 'اكتب "حذف حسابي"',
            confirmTextRequired: 'حذف حسابي',
            finalWarning: 'هذا الإجراء سيحذف جميع بياناتك بشكل نهائي',
            cancel: 'إلغاء',
            next: 'التالي',
            back: 'رجوع',
            confirm: 'تأكيد الحذف',
            confirming: 'جاري التأكيد...',
            passwordRequired: 'كلمة المرور مطلوبة',
            otpRequired: 'رمز التحقق مطلوب',
            confirmTextError: 'يرجى كتابة "حذف حسابي" للتأكيد'
        },
        en: {
            title: 'Confirm Account Deletion',
            step1Title: 'Step 1: Choose Deletion Type',
            step2Title: 'Step 2: Verify Identity',
            step3Title: 'Step 3: Final Confirmation',
            immediate: 'Immediate Deletion',
            immediateDesc: 'Delete account immediately without grace period',
            scheduled: 'Scheduled Deletion (Recommended)',
            scheduledDesc: 'Delete after 30 days with cancellation option',
            enterPassword: 'Enter your password',
            passwordPlaceholder: 'Password',
            enterOTP: 'Enter verification code (2FA)',
            otpPlaceholder: 'Verification code',
            otpNote: 'Two-factor authentication is enabled on your account',
            confirmDelete: 'To confirm, type "DELETE MY ACCOUNT" in the field below',
            confirmPlaceholder: 'Type "DELETE MY ACCOUNT"',
            confirmTextRequired: 'DELETE MY ACCOUNT',
            finalWarning: 'This action will permanently delete all your data',
            cancel: 'Cancel',
            next: 'Next',
            back: 'Back',
            confirm: 'Confirm Deletion',
            confirming: 'Confirming...',
            passwordRequired: 'Password is required',
            otpRequired: 'Verification code is required',
            confirmTextError: 'Please type "DELETE MY ACCOUNT" to confirm'
        },
        fr: {
            title: 'Confirmer la suppression du compte',
            step1Title: 'Étape 1: Choisir le type de suppression',
            step2Title: 'Étape 2: Vérifier l\'identité',
            step3Title: 'Étape 3: Confirmation finale',
            immediate: 'Suppression immédiate',
            immediateDesc: 'Supprimer le compte immédiatement sans période de grâce',
            scheduled: 'Suppression programmée (Recommandé)',
            scheduledDesc: 'Supprimer après 30 jours avec option d\'annulation',
            enterPassword: 'Entrez votre mot de passe',
            passwordPlaceholder: 'Mot de passe',
            enterOTP: 'Entrez le code de vérification (2FA)',
            otpPlaceholder: 'Code de vérification',
            otpNote: 'L\'authentification à deux facteurs est activée sur votre compte',
            confirmDelete: 'Pour confirmer, tapez "SUPPRIMER MON COMPTE" dans le champ ci-dessous',
            confirmPlaceholder: 'Tapez "SUPPRIMER MON COMPTE"',
            confirmTextRequired: 'SUPPRIMER MON COMPTE',
            finalWarning: 'Cette action supprimera définitivement toutes vos données',
            cancel: 'Annuler',
            next: 'Suivant',
            back: 'Retour',
            confirm: 'Confirmer la suppression',
            confirming: 'Confirmation...',
            passwordRequired: 'Le mot de passe est requis',
            otpRequired: 'Le code de vérification est requis',
            confirmTextError: 'Veuillez taper "SUPPRIMER MON COMPTE" pour confirmer'
        }
    };

    const t = translations[language] || translations.en;

    const handleNext = () => {
        setError('');
        
        if (step === 2) {
            if (!password) {
                setError(t.passwordRequired);
                return;
            }
            if (user?.twoFactorEnabled && !otp) {
                setError(t.otpRequired);
                return;
            }
        }

        if (step === 3) {
            if (confirmText !== t.confirmTextRequired) {
                setError(t.confirmTextError);
                return;
            }
        }

        if (step < 3) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        setError('');
        setStep(step - 1);
    };

    const handleSubmit = async () => {
        if (confirmText !== t.confirmTextRequired) {
            setError(t.confirmTextError);
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await onConfirm({
                type: deletionType,
                password,
                otp: user?.twoFactorEnabled ? otp : undefined
            });
        } catch (err) {
            setError(err.message || 'Error confirming deletion');
            setIsSubmitting(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="delete-modal-overlay" onClick={handleOverlayClick}>
            <div className="delete-modal">
                <div className="modal-header">
                    <h2 className="modal-title">⚠️ {t.title}</h2>
                    <button onClick={onClose} className="modal-close" aria-label="Close">
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    {/* Progress Steps */}
                    <div className="progress-steps">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`progress-step ${step >= s ? 'active' : ''}`}>
                                <div className="step-number">{s}</div>
                            </div>
                        ))}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="modal-error">
                            ❌ {error}
                        </div>
                    )}

                    {/* Step 1: Choose Deletion Type */}
                    {step === 1 && (
                        <div className="modal-step">
                            <h3 className="step-title">{t.step1Title}</h3>
                            
                            <label className="deletion-type-option">
                                <input
                                    type="radio"
                                    name="deletionType"
                                    value="scheduled"
                                    checked={deletionType === 'scheduled'}
                                    onChange={(e) => setDeletionType(e.target.value)}
                                />
                                <div className="option-content">
                                    <div className="option-header">
                                        <span className="option-icon">🕐</span>
                                        <span className="option-title">{t.scheduled}</span>
                                        <span className="recommended-badge">✓</span>
                                    </div>
                                    <p className="option-description">{t.scheduledDesc}</p>
                                </div>
                            </label>

                            <label className="deletion-type-option">
                                <input
                                    type="radio"
                                    name="deletionType"
                                    value="immediate"
                                    checked={deletionType === 'immediate'}
                                    onChange={(e) => setDeletionType(e.target.value)}
                                />
                                <div className="option-content">
                                    <div className="option-header">
                                        <span className="option-icon">⚡</span>
                                        <span className="option-title">{t.immediate}</span>
                                    </div>
                                    <p className="option-description">{t.immediateDesc}</p>
                                </div>
                            </label>
                        </div>
                    )}

                    {/* Step 2: Verify Identity */}
                    {step === 2 && (
                        <div className="modal-step">
                            <h3 className="step-title">{t.step2Title}</h3>
                            
                            <div className="form-group">
                                <label htmlFor="password" className="form-label">
                                    {t.enterPassword}
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t.passwordPlaceholder}
                                    className="form-input"
                                    autoFocus
                                />
                            </div>

                            {user?.twoFactorEnabled && (
                                <div className="form-group">
                                    <label htmlFor="otp" className="form-label">
                                        {t.enterOTP}
                                    </label>
                                    <input
                                        id="otp"
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder={t.otpPlaceholder}
                                        className="form-input"
                                        maxLength={6}
                                    />
                                    <p className="form-note">ℹ️ {t.otpNote}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Final Confirmation */}
                    {step === 3 && (
                        <div className="modal-step">
                            <h3 className="step-title">{t.step3Title}</h3>
                            
                            <div className="final-warning">
                                ⚠️ {t.finalWarning}
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmText" className="form-label">
                                    {t.confirmDelete}
                                </label>
                                <input
                                    id="confirmText"
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder={t.confirmPlaceholder}
                                    className="form-input"
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button
                        onClick={onClose}
                        className="modal-button cancel-button"
                        disabled={isSubmitting}
                    >
                        {t.cancel}
                    </button>

                    {step > 1 && (
                        <button
                            onClick={handleBack}
                            className="modal-button back-button"
                            disabled={isSubmitting}
                        >
                            {t.back}
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            className="modal-button next-button"
                        >
                            {t.next}
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="modal-button confirm-button"
                            disabled={isSubmitting || confirmText !== t.confirmTextRequired}
                        >
                            {isSubmitting ? t.confirming : t.confirm}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeleteAccountModal;
