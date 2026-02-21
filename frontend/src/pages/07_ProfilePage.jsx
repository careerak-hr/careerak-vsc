import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import
import './07_ProfilePage.css';
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';
import { RelatedLinks, Breadcrumbs } from '../components/InternalLinks';

const ProfilePage = () => {
    const { user, language, updateUser, logout, startBgMusic } = useApp(); // Corrected hook
    const seo = useSEO('profile', {});

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    const handleUpdateProfile = (data) => {
        updateUser(data);
    };

    const handleLogout = () => {
        logout();
    };

    // ... (rest of the component remains the same)
    return (
        <>
            <SEOHead {...seo} />
            <main id="main-content" tabIndex="-1">
                {/* Breadcrumb Navigation */}
                <Breadcrumbs />
                
                <h1>Profile</h1>
                
                <section aria-labelledby="user-info">
                    <h2 id="user-info">User Information</h2>
                    <p>Language: {language}</p>
                    <p>User: {user?.name || 'Guest'}</p>
                </section>
                
                <section aria-labelledby="profile-actions">
                    <h2 id="profile-actions">Profile Actions</h2>
                    <button onClick={() => handleUpdateProfile({ name: 'Updated' })}>Update Profile</button>
                    <button onClick={handleLogout}>Logout</button>
                </section>

                {/* Related Links for SEO */}
                <RelatedLinks />
            </main>
        </>
    );
}

export default ProfilePage;
