import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LanguageProvider } from "./context/LanguageContext";
import "./i18n/i18n"; // Import i18n configuration
import "./index.css";

// إصلاح بسيط لحقول الإدخال
const enableInputFields = () => {
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.style.pointerEvents = 'auto';
    input.style.userSelect = 'text';
    input.style.webkitUserSelect = 'text';
    input.style.touchAction = 'manipulation';
    if (input.tagName === 'SELECT') {
      input.style.cursor = 'pointer';
      input.style.userSelect = 'none';
      input.style.webkitUserSelect = 'none';
    } else {
      input.style.cursor = 'text';
    }
  });
};

// تطبيق الإصلاح عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', enableInputFields);
// تطبيق الإصلاح بشكل دوري
setInterval(enableInputFields, 1000);

ReactDOM.createRoot(document.getElementById("root")).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);
