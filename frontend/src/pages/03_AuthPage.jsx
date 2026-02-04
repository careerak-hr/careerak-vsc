import React from 'react';
import { useApp } from '../context/AppContext'; // Corrected import

const AuthPage = () => {
    const { language } = useApp(); // Corrected hook

    // ... (rest of the component remains the same)
    return (<div>Auth Page</div>);
}

export default AuthPage;
