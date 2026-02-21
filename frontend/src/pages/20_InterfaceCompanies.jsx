import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import
import './20_InterfaceCompanies.css';
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';

const InterfaceCompanies = () => {
    const { language, user, startBgMusic } = useApp(); // Corrected hook
    const seo = useSEO('interfaceCompanies');

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    // ... (rest of the component remains the same)
    return (
        <>
            <SEOHead {...seo} />
            <main id="main-content" tabIndex="-1">
                <h1>Company Interface</h1>
                
                <section aria-labelledby="company-info">
                    <h2 id="company-info">Company Information</h2>
                    <p>Language: {language}</p>
                    <p>Company: {user?.companyName || 'Guest'}</p>
                </section>
            </main>
        </>
    );
}

export default InterfaceCompanies;
