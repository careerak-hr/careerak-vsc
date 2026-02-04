import React from 'react';
import { useApp } from '../context/AppContext'; // Corrected import

const AdminSubDashboard = () => {
    const { user, language, token, startBgMusic } = useApp(); // Corrected hook

    // ... (rest of the component remains the same)
    return (<div>Admin Sub Dashboard Page</div>);
}

export default AdminSubDashboard;
