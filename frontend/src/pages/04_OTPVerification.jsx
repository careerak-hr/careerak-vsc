import React, { useEffect } from "react";
import { useApp } from "../context/AppContext";
import './04_OTPVerification.css';
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';

const OTPVerification = () => {
  const { language, login: performLogin, user: tempUser, startBgMusic } =
    useApp();
  const seo = useSEO('otp', {});

  // تشغيل الموسيقى عند فتح الصفحة (اختياري)
  useEffect(() => {
    startBgMusic();
  }, [startBgMusic]);

  return (
    <>
      <SEOHead {...seo} />
      <main id="main-content" tabIndex="-1">
      {/* عنوان الصفحة حسب اللغة */}
      <h1>
        {language === "ar"
          ? "التحقق من الرمز"
          : "OTP Verification"}
      </h1>

      {/* ترحيب بالمستخدم إذا موجود */}
      <p>Welcome {tempUser?.name}</p>

      {/* زر تأكيد OTP */}
      <button onClick={() => performLogin()}>
        Confirm OTP
      </button>
    </main>
    </>
  );
};

export default OTPVerification;
