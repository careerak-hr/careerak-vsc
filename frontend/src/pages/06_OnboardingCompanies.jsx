import React from 'react';
import { useApp } from '../context/AppContext'; // Corrected import

const OnboardingCompanies = () => {
    const { language, updateUser, startBgMusic } = useApp(); // Corrected hook

    // ... (rest of the component remains the same)
    return (<div>Onboarding Companies Page</div>);
}

export default OnboardingCompanies;
