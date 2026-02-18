import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import
import './19_InterfaceIndividuals.css';

const InterfaceIndividuals = () => {
    const { language, user, startBgMusic } = useApp(); // Corrected hook

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    // ... (rest of the component remains the same)
    return (
        <div role="main">
            <main>
            <h1>Interface Individuals Page</h1>
            <p>Language: {language}</p>
            <p>User: {user?.name || 'Guest'}</p>
            </main>
        </div>
    );
}

export default InterfaceIndividuals;
