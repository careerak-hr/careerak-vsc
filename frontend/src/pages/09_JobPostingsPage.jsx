import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import
import './09_JobPostingsPage.css';

const JobPostingsPage = () => {
    const { language, startBgMusic } = useApp(); // Corrected hook

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    // ... (rest of the component remains the same)
    return (
        <div role="main">
            <main>
            <h1>Job Postings Page</h1>
            <p>Language: {language}</p>
            </main>
        </div>
    );
}

export default JobPostingsPage;
