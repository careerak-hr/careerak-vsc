import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import
import './23_InterfaceUltimate.css';

const InterfaceUltimate = () => {
    const { language, user, startBgMusic } = useApp(); // Corrected hook

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    return (
        <div className="interface-ultimate-container">
            <div className="interface-ultimate-content">
                <div className="under-development-card">
                    <div className="under-development-icon">⭐</div>
                    <h1 className="under-development-title">
                        {language === 'ar' ? 'الواجهة المتقدمة' : 
                         language === 'fr' ? 'Interface Ultime' : 
                         'Ultimate Interface'}
                    </h1>
                    <div className="under-development-badge">
                        {language === 'ar' ? '🚧 قيد التطوير' : 
                         language === 'fr' ? '🚧 En Développement' : 
                         '🚧 Under Development'}
                    </div>
                    <p className="under-development-description">
                        {language === 'ar' ? 'هذه الصفحة قيد التطوير حالياً. سيتم إطلاقها قريباً مع ميزات متقدمة وشاملة.' : 
                         language === 'fr' ? 'Cette page est en cours de développement. Elle sera bientôt disponible avec des fonctionnalités avancées et complètes.' : 
                         'This page is currently under development. It will be launched soon with advanced and comprehensive features.'}
                    </p>
                    <div className="under-development-info">
                        <p><strong>{language === 'ar' ? 'اللغة:' : language === 'fr' ? 'Langue:' : 'Language:'}</strong> {language}</p>
                        <p><strong>{language === 'ar' ? 'المستخدم:' : language === 'fr' ? 'Utilisateur:' : 'User:'}</strong> {user?.name || (language === 'ar' ? 'ضيف' : language === 'fr' ? 'Invité' : 'Guest')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InterfaceUltimate;
