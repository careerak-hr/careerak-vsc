import React from 'react';
import { useApp } from '../context/AppContext'; // Corrected import

const Navbar = () => {
    const { logout, audioEnabled, setAudioEnabled } = useApp(); // Corrected hook

    // ... (rest of the component remains the same)
    return (<div>Navbar</div>);
}

export default Navbar;
