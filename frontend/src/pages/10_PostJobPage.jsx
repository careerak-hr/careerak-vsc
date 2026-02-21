import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import
import './10_PostJobPage.css';
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';

const PostJobPage = () => {
    const { language, startBgMusic } = useApp(); // Corrected hook
    const seo = useSEO('postJob');

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    // ... (rest of the component remains the same)
    return (
        <>
            <SEOHead {...seo} />
            <main id="main-content" tabIndex="-1">
                <h1>Post Job</h1>
                
                <section aria-labelledby="job-form">
                    <h2 id="job-form">Job Details</h2>
                    <p>Language: {language}</p>
                </section>
            </main>
        </>
    );
}

export default PostJobPage;
