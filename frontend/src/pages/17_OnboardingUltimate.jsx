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
        <div>
            <h1>Onboarding Ultimate Page</h1>
            <p>Language: {language}</p>
            <button onClick={() => handleUpdateUser({ type: 'ultimate' })}>Continue</button>
        </div>
    );
}

export default OnboardingUltimate;
