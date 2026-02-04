import React, { useEffect } from "react";
import { useApp } from "../context/AppContext";

const OTPVerification = () => {
  const { language, login: performLogin, user: tempUser, startBgMusic } =
    useApp();

  // تشغيل الموسيقى عند فتح الصفحة (اختياري)
  useEffect(() => {
    startBgMusic();
  }, []);

  return (
    <div>
      {/* عنوان الصفحة حسب اللغة */}
      <h2>
        {language === "ar"
          ? "صفحة التحقق OTP"
          : "OTP Verification Page"}
      </h2>

      {/* ترحيب بالمستخدم إذا موجود */}
      <p>Welcome {tempUser?.name}</p>

      {/* زر تأكيد OTP */}
      <button onClick={() => performLogin()}>
        Confirm OTP
      </button>
    </div>
  );
};

export default OTPVerification;
