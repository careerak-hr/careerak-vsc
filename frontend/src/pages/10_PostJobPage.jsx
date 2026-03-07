import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import './10_PostJobPage.css';
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';
import CustomQuestionsManager from '../components/CustomQuestionsManager';

const PostJobPage = () => {
    const { language, startBgMusic } = useApp();
    const seo = useSEO('postJob');
    const [customQuestions, setCustomQuestions] = useState([]);

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    const handleQuestionsChange = (questions) => {
        setCustomQuestions(questions);
        console.log('Custom questions updated:', questions);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Validate and submit job posting with custom questions
        console.log('Submitting job with custom questions:', customQuestions);
    };

    return (
        <>
            <SEOHead {...seo} />
            <main id="main-content" tabIndex="-1">
                <div className="post-job-container">
                    <h1>Post Job</h1>
                    
                    <form onSubmit={handleSubmit}>
                        <section aria-labelledby="job-form">
                            <h2 id="job-form">Job Details</h2>
                            <p>Language: {language}</p>
                            {/* TODO: Add other job posting fields here */}
                        </section>

                        <section aria-labelledby="custom-questions">
                            <CustomQuestionsManager
                                questions={customQuestions}
                                onChange={handleQuestionsChange}
                                language={language}
                            />
                        </section>

                        <div className="form-actions">
                            <button type="submit" className="btn-submit">
                                {language === 'ar' ? 'نشر الوظيفة' : language === 'fr' ? 'Publier l\'emploi' : 'Post Job'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}

export default PostJobPage;
