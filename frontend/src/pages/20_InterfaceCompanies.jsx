import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import
import './20_InterfaceCompanies.css';

const InterfaceCompanies = () => {
    const { language, user, startBgMusic } = useApp(); // Corrected hook

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    return (
        <div className="interface-companies-container">
            <div className="interface-companies-content">
                <div className="under-development-card">
                    <div className="under-development-icon">🏢</div>
                    <h1 className="under-development-title">
                        {language === 'ar' ? 'واجهة الشركات' : 
                         language === 'fr' ? 'Interface Entreprises' : 
                         'Companies Interface'}
                    </h1>
                    <div className="under-development-badge">
                        {language === 'ar' ? '🚧 قيد التطوير' : 
                         language === 'fr' ? '🚧 En Développement' : 
                         '🚧 Under Development'}
                    </div>
                    <p className="under-development-description">
                        {language === 'ar' ? 'هذه الصفحة قيد التطوير حالياً. سيتم إطلاقها قريباً مع ميزات متقدمة للشركات.' : 
                         language === 'fr' ? 'Cette page est en cours de développement. Elle sera bientôt disponible avec des fonctionnalités avancées pour les entreprises.' : 
                         'This page is currently under development. It will be launched soon with advanced features for companies.'}
                    </p>
                    <div className="under-development-info">
                        <p><strong>{language === 'ar' ? 'اللغة:' : language === 'fr' ? 'Langue:' : 'Language:'}</strong> {language}</p>
                        <p><strong>{language === 'ar' ? 'الشركة:' : language === 'fr' ? 'Entreprise:' : 'Company:'}</strong> {user?.companyName || (language === 'ar' ? 'ضيف' : language === 'fr' ? 'Invité' : 'Guest')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InterfaceCompanies;
