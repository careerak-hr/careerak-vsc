import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import
import './12_PostCoursePage.css';
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';

const PostCoursePage = () => {
    const { user, language, startBgMusic } = useApp(); // Corrected hook
    const seo = useSEO('postCourse');

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    // ... (rest of the component remains the same)
    return (
        <>
            <SEOHead {...seo} />
            <main id="main-content" tabIndex="-1">
                <h1>Post Course</h1>
                <p>Language: {language}</p>
                <p>User: {user?.name || 'Guest'}</p>
            </main>
        </>
    );
}

export default PostCoursePage;
