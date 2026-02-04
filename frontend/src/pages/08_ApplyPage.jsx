import React from 'react';
import { useApp } from '../context/AppContext'; // Corrected import

const ApplyPage = () => {
    const { language, startBgMusic } = useApp(); // Corrected hook

    // ... (rest of the component remains the same)
    return (<div>Apply Page</div>);
}

export default ApplyPage;
