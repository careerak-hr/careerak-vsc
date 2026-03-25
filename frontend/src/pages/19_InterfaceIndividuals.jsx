import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLocation } from 'react-router-dom';
import './19_InterfaceIndividuals.css';
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';
import NewForYou from '../components/NewForYou';

const InterfaceIndividuals = () => {
    const { language, user, startBgMusic } = useApp();
    const location = useLocation();
    const seo = useSEO('interfaceIndividuals');

    const isPreview = new URLSearchParams(location.search).get('preview') === 'true';
    const isAdmin = user?.role === 'Admin';

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    return (
        <>
            <SEOHead {...seo} />
            <main id="main-content" tabIndex="-1">
                <h1>Individual Interface</h1>
                
                {/* قسم "جديد لك" - يُخفى في وضع المعاينة للأدمن */}
                {user && !isAdmin && <NewForYou limit={5} />}

                {isAdmin && isPreview && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#304B60', fontWeight: 'bold' }}>
                        🔍 {language === 'ar' ? 'وضع المعاينة - واجهة الأفراد' : 'Preview Mode - Individuals Interface'}
                    </div>
                )}
                
                <section aria-labelledby="user-info">
                    <h2 id="user-info">User Information</h2>
                    <p>Language: {language}</p>
                    <p>User: {user?.name || 'Guest'}</p>
                </section>
            </main>
        </>
    );
}

export default InterfaceIndividuals;
