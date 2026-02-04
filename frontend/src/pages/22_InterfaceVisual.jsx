import React from 'react';
import { useApp } from '../context/AppContext'; // Corrected import

const InterfaceVisual = () => {
    const { language, user, startBgMusic } = useApp(); // Corrected hook

    // ... (rest of the component remains the same)
    return (<div>Interface Visual Page</div>);
}

export default InterfaceVisual;
