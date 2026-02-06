import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import

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
        <div>
            <h1>Onboarding Visual Page</h1>
            <p>Language: {language}</p>
            <button onClick={() => handleUpdateUser({ type: 'visual' })}>Continue</button>
        </div>
    );
}

export default OnboardingVisual;
