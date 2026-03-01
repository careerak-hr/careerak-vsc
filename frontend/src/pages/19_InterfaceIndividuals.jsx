import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import
import './19_InterfaceIndividuals.css';
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';
import NewForYou from '../components/NewForYou';

const InterfaceIndividuals = () => {
    const { language, user, startBgMusic } = useApp(); // Corrected hook
    const seo = useSEO('interfaceIndividuals');

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    // ... (rest of the component remains the same)
    return (
        <>
            <SEOHead {...seo} />
            <main id="main-content" tabIndex="-1">
                <h1>Individual Interface</h1>
                
                {/* قسم "جديد لك" - التوصيات اليومية */}
                {user && <NewForYou limit={5} />}
                
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
