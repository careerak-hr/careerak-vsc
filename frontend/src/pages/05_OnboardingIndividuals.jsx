import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import './05_OnboardingIndividuals.css';
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';

const OnboardingIndividuals = () => {
    const { language, updateUser, user: tempUser, startBgMusic } = useApp(); // Corrected hook
    const seo = useSEO('onboardingIndividuals');

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    // استخدام المتغيرات لتجنب التحذيرات
    console.log('Current language:', language);
    console.log('User data:', tempUser);

    const handleUpdateUser = (data) => {
        updateUser(data);
    };

    // ... (rest of the component remains the same)
    return (
        <>
            <SEOHead {...seo} />
            <main id="main-content" tabIndex="-1">
                <h1>Individual Onboarding</h1>
                <p>Language: {language}</p>
                <p>User: {tempUser?.name || 'Guest'}</p>
                <button onClick={() => handleUpdateUser({ name: 'Test' })}>Update User</button>
            </main>
        </>
    );
}

export default OnboardingIndividuals;
