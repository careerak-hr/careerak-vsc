import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import
import './26_AdminSubDashboard.css';

const AdminSubDashboard = () => {
    const { user, language, token, startBgMusic } = useApp(); // Corrected hook

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    // استخدام token للتحقق من الصلاحيات
    console.log('Admin token:', token);

    // ... (rest of the component remains the same)
    return (
        <main id="main-content" tabIndex="-1">
            <h1>Admin Sub Dashboard</h1>
            
            <section aria-labelledby="admin-info">
                <h2 id="admin-info">Administrator Information</h2>
                <p>Language: {language}</p>
                <p>Admin: {user?.name || 'Admin'}</p>
            </section>
        </main>
    );
}

export default AdminSubDashboard;
