import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import

const InterfaceCompanies = () => {
    const { language, user, startBgMusic } = useApp(); // Corrected hook

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    // ... (rest of the component remains the same)
    return (
        <div>
            <h1>Interface Companies Page</h1>
            <p>Language: {language}</p>
            <p>Company: {user?.companyName || 'Guest'}</p>
        </div>
    );
}

export default InterfaceCompanies;
