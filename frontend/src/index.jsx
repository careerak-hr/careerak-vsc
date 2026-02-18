
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n/i18n"; // Import i18n configuration
import "./index.css";
import "./styles/fontEnforcement.css"; // Import font enforcement styles
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
