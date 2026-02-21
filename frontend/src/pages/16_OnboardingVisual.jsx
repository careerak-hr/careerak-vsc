import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import
import './16_OnboardingVisual.css';

const OnboardingVisual = () => {
    const { language, updateUser, startBgMusic } = useApp(); // Corrected hook

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    const handleUpdateUser = (data) => {
        updateUser(data);
    };

    // ... (rest of the component remains the same)
    return (
        <main id="main-content" tabIndex="-1">
            <h1>Visual Onboarding</h1>
            
            <section aria-labelledby="onboarding-steps">
                <h2 id="onboarding-steps">Getting Started</h2>
                <p>Language: {language}</p>
                <button onClick={() => handleUpdateUser({ type: 'visual' })}>Continue</button>
            </section>
        </main>
    );
}

export default OnboardingVisual;
