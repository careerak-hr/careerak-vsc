import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import
import './06_OnboardingCompanies.css';
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';

const OnboardingCompanies = () => {
    const { language, updateUser, startBgMusic } = useApp(); // Corrected hook
    const seo = useSEO('onboardingCompanies');

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    // استخدام المتغيرات لتجنب التحذيرات
    console.log('Current language:', language);

    const handleUpdateUser = (data) => {
        updateUser(data);
    };

    // ... (rest of the component remains the same)
    return (
        <>
            <SEOHead {...seo} />
            <main id="main-content" tabIndex="-1">
                <h1>Company Onboarding</h1>
                <p>Language: {language}</p>
                <button onClick={() => handleUpdateUser({ companyName: 'Test' })}>Update Company</button>
            </main>
        </>
    );
}

export default OnboardingCompanies;
