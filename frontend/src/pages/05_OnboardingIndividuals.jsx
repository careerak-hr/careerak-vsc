import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import

const OnboardingIndividuals = () => {
    const { language, updateUser, user: tempUser, startBgMusic } = useApp(); // Corrected hook

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
        <div>
            <h1>Onboarding Individuals Page</h1>
            <p>Language: {language}</p>
            <p>User: {tempUser?.name || 'Guest'}</p>
            <button onClick={() => handleUpdateUser({ name: 'Test' })}>Update User</button>
        </div>
    );
}

export default OnboardingIndividuals;
