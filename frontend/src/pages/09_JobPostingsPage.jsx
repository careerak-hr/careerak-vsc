import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import

const JobPostingsPage = () => {
    const { language, startBgMusic } = useApp(); // Corrected hook

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    // ... (rest of the component remains the same)
    return (
        <div>
            <h1>Job Postings Page</h1>
            <p>Language: {language}</p>
        </div>
    );
}

export default JobPostingsPage;
