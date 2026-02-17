import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import
import './10_PostJobPage.css';

const PostJobPage = () => {
    const { language, startBgMusic } = useApp(); // Corrected hook

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    // ... (rest of the component remains the same)
    return (
        <div>
            <h1>Post Job Page</h1>
            <p>Language: {language}</p>
        </div>
    );
}

export default PostJobPage;
