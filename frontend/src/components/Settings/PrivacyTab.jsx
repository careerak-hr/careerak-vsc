import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './PrivacyTab.css';

const PrivacyTab = () => {
    const { language } = useApp();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [hasChanges, setHasChanges] = useState(false);

    // Privacy settings state
    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: 'everyone',
        showEmail: false,
        showPhone: false,
        messagePermissions: 'everyone',
        showOnlineStatus: true,
        allowSearchEngineIndexing: true
    });

    // Translations
    const translations = {
        ar: {
            title: 'إعدادات الخصوصية',
            profileVisibility: 'رؤية الملف الشخصي',
            everyone: 'الجميع',
            registered: 'المستخدمون المسجلون فقط',
            none: 'لا أحد',
            contactInfo: 'معلومات الاتصال',
            showEmail: 'إظهار البريد الإلكتروني في الملف الشخصي',
            showPhone: 'إظهار رقم الهاتف في الملف الشخصي',
            messaging: 'الرسائل',
            messagePermissions: 'من يمكنه إرسال رسائل لي',
            contacts: 'جهات الاتصال فقط',
            activity: 'النشاط',
            showOnlineStatus: 'إظهار حالة النشاط (متصل/غير متصل)',
            searchEngine: 'محركات البحث',
            allowSearchEngineIndexing: 'السماح لمحركات البحث بفهرسة ملفي الشخصي',
            saveButton: 'حفظ التغييرات',
            saving: 'جاري الحفظ...',
            successMessage: 'تم حفظ إعدادات الخصوصية بنجاح',
            errorMessage: 'حدث خطأ أثناء حفظ الإعدادات',
            unsavedChanges: 'لديك تغييرات غير محفوظة'
        },
        en: {
            title: 'Privacy Settings',
            profileVisibility: 'Profile Visibility',
            everyone: 'Everyone',
            registered: 'Registered Users Only',
            none: 'No One',
            contactInfo: 'Contact Information',
            showEmail: 'Show email address in profile',
            showPhone: 'Show phone number in profile',
            messaging: 'Messaging',
            messagePermissions: 'Who can send me messages',
            contacts: 'Contacts Only',
            activity: 'Activity',
            showOnlineStatus: 'Show online status (online/offline)',
            searchEngine: 'Search Engines',
            allowSearchEngineIndexing: 'Allow search engines to index my profile',
            saveButton: 'Save Changes',
            saving: 'Saving...',
            successMessage: 'Privacy settings saved successfully',
            errorMessage: 'An error occurred while saving settings',
            unsavedChanges: 'You have unsaved changes'
        },
        fr: {
            title: 'Paramètres de confidentialité',
            profileVisibility: 'Visibilité du profil',
            everyone: 'Tout le monde',
            registered: 'Utilisateurs enregistrés uniquement',
            none: 'Personne',
            contactInfo: 'Informations de contact',
            showEmail: 'Afficher l\'adresse e-mail dans le profil',
            showPhone: 'Afficher le numéro de téléphone dans le profil',
            messaging: 'Messagerie',
            messagePermissions: 'Qui peut m\'envoyer des messages',
            contacts: 'Contacts uniquement',
            activity: 'Activité',
            showOnlineStatus: 'Afficher le statut en ligne (en ligne/hors ligne)',
            searchEngine: 'Moteurs de recherche',
            allowSearchEngineIndexing: 'Autoriser les moteurs de recherche à indexer mon profil',
            saveButton: 'Enregistrer les modifications',
            saving: 'Enregistrement...',
            successMessage: 'Paramètres de confidentialité enregistrés avec succès',
            errorMessage: 'Une erreur s\'est produite lors de l\'enregistrement des paramètres',
            unsavedChanges: 'Vous avez des modifications non enregistrées'
        }
    };

    const t = translations[language] || translations.en;

    // Load privacy settings on mount
    useEffect(() => {
        loadPrivacySettings();
    }, []);

    const loadPrivacySettings = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/privacy`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.privacy) {
                    setPrivacySettings(data.privacy);
                }
            }
        } catch (error) {
            console.error('Error loading privacy settings:', error);
        }
    };

    const handleChange = (field, value) => {
        setPrivacySettings(prev => ({
            ...prev,
            [field]: value
        }));
        setHasChanges(true);
        setMessage({ type: '', text: '' });
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setMessage({ type: 'error', text: 'Not authenticated' });
                setLoading(false);
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/privacy`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(privacySettings)
            });

            if (response.ok) {
                setMessage({ type: 'success', text: t.successMessage });
                setHasChanges(false);
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.message || t.errorMessage });
            }
        } catch (error) {
            console.error('Error saving privacy settings:', error);
            setMessage({ type: 'error', text: t.errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="privacy-tab">
            <h2 className="privacy-tab-title">{t.title}</h2>

            {/* Unsaved changes warning */}
            {hasChanges && (
                <div className="privacy-warning">
                    ⚠️ {t.unsavedChanges}
                </div>
            )}

            {/* Message display */}
            {message.text && (
                <div className={`privacy-message privacy-message-${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Profile Visibility */}
            <div className="privacy-section">
                <h3 className="privacy-section-title">{t.profileVisibility}</h3>
                <div className="privacy-radio-group">
                    <label className="privacy-radio-label">
                        <input
                            type="radio"
                            name="profileVisibility"
                            value="everyone"
                            checked={privacySettings.profileVisibility === 'everyone'}
                            onChange={(e) => handleChange('profileVisibility', e.target.value)}
                        />
                        <span>{t.everyone}</span>
                    </label>
                    <label className="privacy-radio-label">
                        <input
                            type="radio"
                            name="profileVisibility"
                            value="registered"
                            checked={privacySettings.profileVisibility === 'registered'}
                            onChange={(e) => handleChange('profileVisibility', e.target.value)}
                        />
                        <span>{t.registered}</span>
                    </label>
                    <label className="privacy-radio-label">
                        <input
                            type="radio"
                            name="profileVisibility"
                            value="none"
                            checked={privacySettings.profileVisibility === 'none'}
                            onChange={(e) => handleChange('profileVisibility', e.target.value)}
                        />
                        <span>{t.none}</span>
                    </label>
                </div>
            </div>

            {/* Contact Information */}
            <div className="privacy-section">
                <h3 className="privacy-section-title">{t.contactInfo}</h3>
                <div className="privacy-checkbox-group">
                    <label className="privacy-checkbox-label">
                        <input
                            type="checkbox"
                            checked={privacySettings.showEmail}
                            onChange={(e) => handleChange('showEmail', e.target.checked)}
                        />
                        <span>{t.showEmail}</span>
                    </label>
                    <label className="privacy-checkbox-label">
                        <input
                            type="checkbox"
                            checked={privacySettings.showPhone}
                            onChange={(e) => handleChange('showPhone', e.target.checked)}
                        />
                        <span>{t.showPhone}</span>
                    </label>
                </div>
            </div>

            {/* Message Permissions */}
            <div className="privacy-section">
                <h3 className="privacy-section-title">{t.messaging}</h3>
                <div className="privacy-radio-group">
                    <label className="privacy-radio-label">
                        <input
                            type="radio"
                            name="messagePermissions"
                            value="everyone"
                            checked={privacySettings.messagePermissions === 'everyone'}
                            onChange={(e) => handleChange('messagePermissions', e.target.value)}
                        />
                        <span>{t.everyone}</span>
                    </label>
                    <label className="privacy-radio-label">
                        <input
                            type="radio"
                            name="messagePermissions"
                            value="contacts"
                            checked={privacySettings.messagePermissions === 'contacts'}
                            onChange={(e) => handleChange('messagePermissions', e.target.value)}
                        />
                        <span>{t.contacts}</span>
                    </label>
                    <label className="privacy-radio-label">
                        <input
                            type="radio"
                            name="messagePermissions"
                            value="none"
                            checked={privacySettings.messagePermissions === 'none'}
                            onChange={(e) => handleChange('messagePermissions', e.target.value)}
                        />
                        <span>{t.none}</span>
                    </label>
                </div>
            </div>

            {/* Activity Status */}
            <div className="privacy-section">
                <h3 className="privacy-section-title">{t.activity}</h3>
                <div className="privacy-checkbox-group">
                    <label className="privacy-checkbox-label">
                        <input
                            type="checkbox"
                            checked={privacySettings.showOnlineStatus}
                            onChange={(e) => handleChange('showOnlineStatus', e.target.checked)}
                        />
                        <span>{t.showOnlineStatus}</span>
                    </label>
                </div>
            </div>

            {/* Search Engine Indexing */}
            <div className="privacy-section">
                <h3 className="privacy-section-title">{t.searchEngine}</h3>
                <div className="privacy-checkbox-group">
                    <label className="privacy-checkbox-label">
                        <input
                            type="checkbox"
                            checked={privacySettings.allowSearchEngineIndexing}
                            onChange={(e) => handleChange('allowSearchEngineIndexing', e.target.checked)}
                        />
                        <span>{t.allowSearchEngineIndexing}</span>
                    </label>
                </div>
            </div>

            {/* Save Button */}
            <div className="privacy-actions">
                <button
                    className="privacy-save-button"
                    onClick={handleSave}
                    disabled={loading || !hasChanges}
                >
                    {loading ? t.saving : t.saveButton}
                </button>
            </div>
        </div>
    );
};

export default PrivacyTab;
