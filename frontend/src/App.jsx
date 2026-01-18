import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppSettingsProvider } from "./context/AppSettingsContext";
import { FloatingWhatsApp } from "./components/FloatingWhatsApp";
import { discoverBestServer } from "./services/api";

// استيراد القائمة الرسمية والنهائية لجميع فئات المجتمع
import LanguagePage from "./pages/00_LanguagePage";
import EntryPage from "./pages/01_EntryPage";
import LoginPage from "./pages/03_LoginPage";
import AuthPage from "./pages/04_AuthPage";
import OTPVerification from "./pages/05_OTPVerification";
import OnboardingIndividuals from "./pages/06_OnboardingIndividuals";
import OnboardingCompanies from "./pages/07_OnboardingCompanies";
import ProfilePage from "./pages/08_ProfilePage";
import ApplyPage from "./pages/09_ApplyPage";
import JobPostingsPage from "./pages/10_JobPostingsPage";
import PostJobPage from "./pages/11_PostJobPage";
import CoursesPage from "./pages/12_CoursesPage";
import PostCoursePage from "./pages/13_PostCoursePage";
import PolicyPage from "./pages/14_PolicyPage";
import SettingsPage from "./pages/15_SettingsPage";

// استيراد واجهات الشمول الإنساني الجديدة
import OnboardingIlliterate from "./pages/16_OnboardingIlliterate";
import OnboardingVisual from "./pages/17_OnboardingVisual";
import OnboardingUltimate from "./pages/18_OnboardingUltimate";
import AdminDashboard from "./pages/19_AdminDashboard";

function AppRoutes() {
  const { language, audioEnabled, loading } = useAuth();

  if (loading) return null;

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            (!language || audioEnabled === null)
              ? <LanguagePage />
              : <Navigate to="/entry" replace />
          }
        />

        <Route path="/entry" element={<EntryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/otp-verify" element={<OTPVerification />} />

        <Route path="/onboarding-individuals" element={<OnboardingIndividuals />} />
        <Route path="/onboarding-companies" element={<OnboardingCompanies />} />
        <Route path="/onboarding-illiterate" element={<OnboardingIlliterate />} />
        <Route path="/onboarding-visual" element={<OnboardingVisual />} />
        <Route path="/onboarding-ultimate" element={<OnboardingUltimate />} />

        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/apply/:jobId" element={<ApplyPage />} />
        <Route path="/job-postings" element={<JobPostingsPage />} />
        <Route path="/post-job" element={<PostJobPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/post-course" element={<PostCoursePage />} />
        <Route path="/policy" element={<PolicyPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        <Route
          path="/language"
          element={
            (!language || audioEnabled === null)
              ? <LanguagePage />
              : <Navigate to="/entry" replace />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <FloatingWhatsApp />
    </>
  );
}

export default function App() {
  useEffect(() => {
    // تجهيز السيرفر بالخلفية بدون إيقاف الواجهة
    discoverBestServer()
      .then(url => {
        console.log("Selected API baseURL:", url);
      })
      .catch(err => {
        console.error("Server discovery failed:", err);
      });
  }, []);

  return (
    <AppSettingsProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </AppSettingsProvider>
  );
}
