import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import
import './14_SettingsPage.css';

const SettingsPage = () => {
    const { language, saveLanguage, logout, startBgMusic } = useApp(); // Corrected hook

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    const handleLanguageChange = (newLanguage) => {
        saveLanguage(newLanguage);
    };

    const handleLogout = () => {
        logout();
    };

    // ... (rest of the component remains the same)
    return (
        <div>
            <h1>Settings Page</h1>
            <p>Current Language: {language}</p>
            <button onClick={() => handleLanguageChange('ar')}>العربية</button>
            <button onClick={() => handleLanguageChange('en')}>English</button>
            <button onClick={() => handleLanguageChange('fr')}>Français</button>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default SettingsPage;
