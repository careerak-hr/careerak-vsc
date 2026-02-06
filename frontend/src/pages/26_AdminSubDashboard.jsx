import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import

const AdminSubDashboard = () => {
    const { user, language, token, startBgMusic } = useApp(); // Corrected hook

    useEffect(() => {
        startBgMusic();
    }, [startBgMusic]);

    // استخدام token للتحقق من الصلاحيات
    console.log('Admin token:', token);

    // ... (rest of the component remains the same)
    return (
        <div>
            <h1>Admin Sub Dashboard Page</h1>
            <p>Language: {language}</p>
            <p>Admin: {user?.name || 'Admin'}</p>
        </div>
    );
}

export default AdminSubDashboard;
