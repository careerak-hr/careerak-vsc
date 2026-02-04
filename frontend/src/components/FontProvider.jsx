import React from 'react';
import { useApp } from '../context/AppContext'; // Corrected import

const FontProvider = ({ children }) => {
    const { language } = useApp(); // Corrected hook

    // ... (rest of the component remains the same)
    return (<div>{children}</div>);
}

export default FontProvider;
