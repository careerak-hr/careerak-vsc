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
        <div role="main">
            <main>
            <h1>Admin Sub Dashboard Page</h1>
            <p>Language: {language}</p>
            <p>Admin: {user?.name || 'Admin'}</p>
            </main>
        </div>
    );
}

export default AdminSubDashboard;
