import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import
import './06_OnboardingCompanies.css';

const OnboardingCompanies = () => {
    const { language, updateUser, startBgMusic } = useApp(); // Corrected hook

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
        <div role="main">
            <main>
            <h1>Onboarding Companies Page</h1>
            <p>Language: {language}</p>
            <button onClick={() => handleUpdateUser({ companyName: 'Test' })}>Update Company</button>
            </main>
        </div>
    );
}

export default OnboardingCompanies;
