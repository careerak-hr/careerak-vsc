import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import
import './17_OnboardingUltimate.css';

const OnboardingUltimate = () => {
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
            <h1>Ultimate Onboarding</h1>
            
            <section aria-labelledby="onboarding-steps">
                <h2 id="onboarding-steps">Getting Started</h2>
                <p>Language: {language}</p>
                <button onClick={() => handleUpdateUser({ type: 'ultimate' })}>Continue</button>
            </section>
        </main>
    );
}

export default OnboardingUltimate;
