import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import

const CoursesPage = () => {
    const { language, startBgMusic } = useApp(); // Corrected hook

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    // ... (rest of the component remains the same)
    return (
        <div>
            <h1>Courses Page</h1>
            <p>Language: {language}</p>
        </div>
    );
}

export default CoursesPage;
