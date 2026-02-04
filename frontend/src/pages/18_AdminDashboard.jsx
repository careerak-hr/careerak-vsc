import React from 'react';
import { useApp } from '../context/AppContext'; // Corrected import

const AdminDashboard = () => {
    const { logout, user, language, token, isAppLoading: authLoading, startBgMusic } = useApp(); // Corrected hook

    // ... (rest of the component remains the same)
    return (<div>Admin Dashboard Page</div>);
}

export default AdminDashboard;
