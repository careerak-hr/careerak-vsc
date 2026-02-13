
import React from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import { AppProvider } from "../context/AppContext";
import GlobalFontEnforcer from "./GlobalFontEnforcer";
import AppRoutes from "./AppRoutes";
import AppAudioPlayer from "./AppAudioPlayer";
import ErrorBoundary from "./ErrorBoundary";
import BackButtonHandler from "./BackButtonHandler";

const ApplicationShell = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <GlobalFontEnforcer />
        <Router>
          <BackButtonHandler />
          <AppAudioPlayer />
          <AppRoutes />
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default ApplicationShell;
