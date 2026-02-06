import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import

const InterfaceIlliterate = () => {
    const { language, user, startBgMusic } = useApp(); // Corrected hook

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    // ... (rest of the component remains the same)
    return (
        <div>
            <h1>Interface Illiterate Page</h1>
            <p>Language: {language}</p>
            <p>User: {user?.name || 'Guest'}</p>
        </div>
    );
}

export default InterfaceIlliterate;
