import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import
import './08_ApplyPage.css';

const ApplyPage = () => {
    const { language, startBgMusic } = useApp(); // Corrected hook

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    // ... (rest of the component remains the same)
    return (
        <div role="main">
            <main>
            <h1>Apply Page</h1>
            <p>Language: {language}</p>
            </main>
        </div>
    );
}

export default ApplyPage;
