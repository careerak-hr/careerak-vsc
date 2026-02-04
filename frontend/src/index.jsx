
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n/i18n"; // Import i18n configuration
import "./index.css";
import { resetOnboarding } from './utils/onboardingUtils';

// Force reset onboarding status for all sessions to fix browser caching issues
resetOnboarding();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
