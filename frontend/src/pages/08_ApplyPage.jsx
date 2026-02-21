import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import
import './08_ApplyPage.css';
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';

const ApplyPage = () => {
    const { language, startBgMusic } = useApp(); // Corrected hook
    const seo = useSEO('apply');

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    // ... (rest of the component remains the same)
    return (
        <>
            <SEOHead {...seo} />
            <main id="main-content" tabIndex="-1">
                <h1>Apply for Job</h1>
                <p>Language: {language}</p>
            </main>
        </>
    );
}

export default ApplyPage;
