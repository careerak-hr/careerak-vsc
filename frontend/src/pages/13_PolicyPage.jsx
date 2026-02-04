import React from 'react';
import { useApp } from '../context/AppContext'; // Corrected import

const PolicyPage = ({ isModal }) => {
    const { startBgMusic } = useApp(); // Corrected hook

    // ... (rest of the component remains the same)
    return (<div>Policy Page</div>);
}

export default PolicyPage;
