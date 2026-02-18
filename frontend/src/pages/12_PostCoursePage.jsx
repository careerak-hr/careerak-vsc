import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import
import './12_PostCoursePage.css';

const PostCoursePage = () => {
    const { user, language, startBgMusic } = useApp(); // Corrected hook

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    // ... (rest of the component remains the same)
    return (
        <div role="main">
            <main>
            <h1>Post Course Page</h1>
            <p>Language: {language}</p>
            <p>User: {user?.name || 'Guest'}</p>
            </main>
        </div>
    );
}

export default PostCoursePage;
