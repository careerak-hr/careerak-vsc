import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import
import './07_ProfilePage.css';

const ProfilePage = () => {
    const { user, language, updateUser, logout, startBgMusic } = useApp(); // Corrected hook

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
        <div role="main">
            <main>
            <h1>Profile Page</h1>
            <p>Language: {language}</p>
            <p>User: {user?.name || 'Guest'}</p>
            <button onClick={() => handleUpdateProfile({ name: 'Updated' })}>Update Profile</button>
            <button onClick={handleLogout}>Logout</button>
            </main>
        </div>
    );
}

export default ProfilePage;
