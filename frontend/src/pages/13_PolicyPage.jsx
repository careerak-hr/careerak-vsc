import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Corrected import

const PolicyPage = ({ isModal }) => {
    const { startBgMusic } = useApp(); // Corrected hook

    useEffect(() => {
        if (!isModal) {
            startBgMusic();
        }
    }, [startBgMusic, isModal]);

    // ... (rest of the component remains the same)
    return (
        <div>
            <h1>Policy Page</h1>
            {isModal && <p>Modal Mode</p>}
        </div>
    );
}

export default PolicyPage;
