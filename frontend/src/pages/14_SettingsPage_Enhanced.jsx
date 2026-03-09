import React, { useEffect, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';
import './14_SettingsPage.css';

// Tab components (placeholders for now - will be implemented in next tasks)
const AccountTab = ({ language }) => <div>Account Tab - Coming Soon</div>;
const PrivacyTab = ({ language }) => <div>Privacy Tab - Coming Soon</div>;
const NotificationsTab = ({ language }) => <div>Notifications Tab - Coming Soon</div>;
const SecurityTab = ({ language }) => <div>Security Tab - Coming Soon</div>;
const DataTab = ({ language }) => <div>Data Tab - Coming Soon</div>;

const SettingsPage = () => {
    const { language, startBgMusic } = useApp();
    const seo = useSEO('settings', {});
    const { isDark } = useTheme();
    
    // Tab navigation state
    const [activeTab, setActiveTab] = useState('account');
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [undoStack, setUndoStack] = useState([]);
    
    // Tab definitions
    const tabs = [
        { id: 'account', label: { ar: 'الحساب', en: 'Account', fr: 'Compte' }, icon: '👤' },
        { id: 'privacy', label: { ar: 'الخصوصية', en: 'Privacy', fr: 'Confidentialité' }, icon: '🔒' },
        { id: 'notifications', label: { ar: 'الإشعارات', en: 'Notifications', fr: 'Notifications' }, icon: '🔔' },
        { id: 'security', label: { ar: 'الأمان', en: 'Security', fr: 'Sécurité' }, icon: '🛡️' },
        { id: 'data', label: { ar: 'البيانات', en: 'Data & Privacy', fr: 'Données' }, icon: '📊' }
    ];

    // Load last visited tab from localStorage
    useEffect(() => {
        startBgMusic();
        
        const lastTab = localStorage.getItem('careerak_settings_last_tab');
        if (lastTab && tabs.find(t => t.id === lastTab)) {
            setActiveTab(lastTab);
        }
    }, [startBgMusic]);

    // Save last visited tab to localStorage
    useEffect(() => {
        localStorage.setItem('careerak_settings_last_tab', activeTab);
    }, [activeTab]);

    // Handle tab change
    const handleTabChange = useCallback((tabId) => {
        if (unsavedChanges) {
            const confirmChange = window.confirm(
                language === 'ar' 
                    ? 'لديك تغييرات غير محفوظة. هل تريد المتابعة؟'
                    : language === 'fr'
                    ? 'Vous avez des modifications non enregistrées. Voulez-vous continuer?'
                    : 'You have unsaved changes. Do you want to continue?'
            );
            
            if (!confirmChange) return;
            setUnsavedChanges(false);
        }
        
        setActiveTab(tabId);
    }, [unsavedChanges, language]);

    // Render active tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'account':
                return <AccountTab language={language} />;
            case 'privacy':
                return <PrivacyTab language={language} />;
            case 'notifications':
                return <NotificationsTab language={language} />;
            case 'security':
                return <SecurityTab language={language} />;
            case 'data':
                return <DataTab language={language} />;
            default:
                return <AccountTab language={language} />;
        }
    };

    // Get page title based on language
    const getPageTitle = () => {
        const titles = {
            ar: 'الإعدادات',
            en: 'Settings',
            fr: 'Paramètres'
        };
        return titles[language] || titles.en;
    };

    return (
        <>
            <SEOHead {...seo} />
            <main 
                id="main-content" 
                tabIndex="-1" 
                className="settings-page-container dark:bg-primary transition-colors duration-300"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
            >
                <div className="settings-content dark:text-primary transition-colors duration-300">
                    <h1 className="settings-title dark:text-primary transition-colors duration-300">
                        {getPageTitle()}
                    </h1>
                    
                    {/* Tab Navigation */}
                    <nav 
                        className="settings-tabs-nav" 
                        role="tablist"
                        aria-label={language === 'ar' ? 'تبويبات الإعدادات' : language === 'fr' ? 'Onglets des paramètres' : 'Settings tabs'}
                    >
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                role="tab"
                                aria-selected={activeTab === tab.id}
                                aria-controls={`${tab.id}-panel`}
                                id={`${tab.id}-tab`}
                                className={`settings-tab ${activeTab === tab.id ? 'settings-tab-active' : ''} dark:bg-secondary dark:text-primary transition-all duration-300`}
                                onClick={() => handleTabChange(tab.id)}
                            >
                                <span className="settings-tab-icon" aria-hidden="true">{tab.icon}</span>
                                <span className="settings-tab-label">{tab.label[language]}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Tab Content */}
                    <div 
                        role="tabpanel"
                        id={`${activeTab}-panel`}
                        aria-labelledby={`${activeTab}-tab`}
                        className="settings-tab-content dark:bg-secondary dark:border-secondary transition-all duration-300"
                    >
                        {renderTabContent()}
                    </div>

                    {/* Unsaved Changes Indicator */}
                    {unsavedChanges && (
                        <div 
                            className="settings-unsaved-indicator"
                            role="status"
                            aria-live="polite"
                        >
                            {language === 'ar' 
                                ? '⚠️ لديك تغييرات غير محفوظة'
                                : language === 'fr'
                                ? '⚠️ Vous avez des modifications non enregistrées'
                                : '⚠️ You have unsaved changes'
                            }
                        </div>
                    )}
                </div>
            </main>
        </>
    );
};

export default SettingsPage;
