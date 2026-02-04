
import React from "react";
import "./Modal.css"; // Use the unified modal CSS

const NotificationSettingsModal = ({ isOpen, onConfirm, language, t }) => {
  if (!isOpen) return null;

  // Use the correct translation keys from the t object
  const texts = {
    title: t.notificationTitle || "Enable Notifications?",
    description: t.notificationDesc || "Stay updated with job alerts and application statuses.",
    confirm: t.yes || "Yes",
    deny: t.no || "No",
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" dir={language === "ar" ? "rtl" : "ltr"}>
        <div className="modal-body">
          <h2 className="modal-title">{texts.title}</h2>
          <p className="modal-description">{texts.description}</p>
        </div>
        <div className="modal-actions">
          <button onClick={() => onConfirm(true)} className="modal-confirm-btn">
            {texts.confirm}
          </button>
          <button onClick={() => onConfirm(false)} className="modal-cancel-btn">
            {texts.deny}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsModal;
