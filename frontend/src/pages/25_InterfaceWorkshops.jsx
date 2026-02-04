import React from 'react';
import { useApp } from '../context/AppContext'; // Corrected import

const InterfaceWorkshops = () => {
    const { language, user, startBgMusic } = useApp(); // Corrected hook

    // ... (rest of the component remains the same)
    return (<div>Interface Workshops Page</div>);
}

export default InterfaceWorkshops;
