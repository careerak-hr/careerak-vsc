import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LanguageProvider } from "./context/LanguageContext";
import "./i18n/i18n"; // Import i18n configuration
import "./index.css";

// تم تعطيل النظام العام لإصلاح حقول الإدخال لأنه لم يعد ضرورياً
// import "./utils/globalInputFieldsFix";

ReactDOM.createRoot(document.getElementById("root")).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);
