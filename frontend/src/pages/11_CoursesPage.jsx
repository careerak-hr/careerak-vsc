import React from 'react';
import { useApp } from '../context/AppContext'; // Corrected import

const CoursesPage = () => {
    const { language, startBgMusic } = useApp(); // Corrected hook

    // ... (rest of the component remains the same)
    return (<div>Courses Page</div>);
}

export default CoursesPage;
