import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppSettingsProvider, useAppSettings } from "./context/AppSettingsContext";
import { FloatingWhatsApp } from "./components/FloatingWhatsApp";
import { discoverBestServer } from "./services/api";
import AppAudioPlayer from "./components/AppAudioPlayer";

// Import Pages
import LanguagePage from "./pages/00_LanguagePage";
import EntryPage from "./pages/01_EntryPage";
import LoginPage from "./pages/02_LoginPage";
import AuthPage from "./pages/03_AuthPage";
import OTPVerification from "./pages/04_OTPVerification";
import OnboardingIndividuals from "./pages/05_OnboardingIndividuals";
import OnboardingCompanies from "./pages/06_OnboardingCompanies";
import ProfilePage from "./pages/07_ProfilePage";
import ApplyPage from "./pages/08_ApplyPage";
import JobPostingsPage from "./pages/09_JobPostingsPage";
import PostJobPage from "./pages/10_PostJobPage";
import CoursesPage from "./pages/11_CoursesPage";
import PostCoursePage from "./pages/12_PostCoursePage";
import PolicyPage from "./pages/13_PolicyPage";
import SettingsPage from "./pages/14_SettingsPage";
import OnboardingIlliterate from "./pages/15_OnboardingIlliterate";
import OnboardingVisual from "./pages/16_OnboardingVisual";
import OnboardingUltimate from "./pages/17_OnboardingUltimate";
import AdminDashboard from "./pages/18_AdminDashboard";
import InterfaceIndividuals from "./pages/19_InterfaceIndividuals";
import InterfaceCompanies from "./pages/20_InterfaceCompanies";
import InterfaceIlliterate from "./pages/21_InterfaceIlliterate";
import InterfaceVisual from "./pages/22_InterfaceVisual";
import InterfaceUltimate from "./pages/23_InterfaceUltimate";
import InterfaceShops from "./pages/24_InterfaceShops";
import InterfaceWorkshops from "./pages/25_InterfaceWorkshops";
import AdminSubDashboard from "./pages/26_AdminSubDashboard";

function AppRoutes() {
  const { loaded } = useAppSettings();
  const location = useLocation();

  // Paths to hide the WhatsApp icon on
  const hideWhatsAppOnPaths = ['/', '/language', '/entry'];
  const shouldShowWhatsApp = !hideWhatsAppOnPaths.includes(location.pathname);

  if (!loaded) {
    return (
      <div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<LanguagePage />} />
        <Route path="/language" element={<LanguagePage />} />
        <Route path="/entry" element={<EntryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/otp-verify" element={<OTPVerification />} />
        <Route path="/onboarding-individuals" element={<OnboardingIndividuals />} />
        <Route path="/onboarding-companies" element={<OnboardingCompanies />} />
        <Route path="/onboarding-illiterate" element={<OnboardingIlliterate />} />
        <Route path="/onboarding-visual" element={<OnboardingVisual />} />
        <Route path="/onboarding-ultimate" element={<OnboardingUltimate />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/interface-individuals" element={<InterfaceIndividuals />} />
        <Route path="/interface-companies" element={<InterfaceCompanies />} />
        <Route path="/interface-illiterate" element={<InterfaceIlliterate />} />
        <Route path="/interface-visual" element={<InterfaceVisual />} />
        <Route path="/interface-ultimate" element={<InterfaceUltimate />} />
        <Route path="/interface-shops" element={<InterfaceShops />} />
        <Route path="/interface-workshops" element={<InterfaceWorkshops />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-sub-dashboard" element={<AdminSubDashboard />} />
        <Route path="/job-postings" element={<JobPostingsPage />} />
        <Route path="/apply/:jobId" element={<ApplyPage />} />
        <Route path="/post-job" element={<PostJobPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/post-course" element={<PostCoursePage />} />
        <Route path="/policy" element={<PolicyPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {shouldShowWhatsApp && <FloatingWhatsApp />}
    </>
  );
}

export default function App() {
  useEffect(() => {
    discoverBestServer()
      .then(url => console.log("Selected API baseURL:", url))
      .catch(err => console.error("Server discovery failed:", err));
  }, []);

  return (
    <AppSettingsProvider>
      <AuthProvider>
        <Router>
          <AppAudioPlayer />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </AppSettingsProvider>
  );
}
