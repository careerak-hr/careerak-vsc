import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import
import './25_InterfaceWorkshops.css';

const InterfaceWorkshops = () => {
    const { language, user, startBgMusic } = useApp(); // Corrected hook

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    // ... (rest of the component remains the same)
    return (
        <main id="main-content" tabIndex="-1">
            <h1>Workshop Interface</h1>
            
            <section aria-labelledby="user-info">
                <h2 id="user-info">User Information</h2>
                <p>Language: {language}</p>
                <p>User: {user?.name || 'Guest'}</p>
            </section>
        </main>
    );
}

export default InterfaceWorkshops;
