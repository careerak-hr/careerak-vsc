import React, { Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppSettingsProvider, useAppSettings } from "./context/AppSettingsContext";
import { FloatingWhatsApp } from "./components/FloatingWhatsApp";
import { discoverBestServer } from "./services/api";
import AppAudioPlayer from "./components/AppAudioPlayer";
import FontProvider from "./components/FontProvider";
import { isOnboardingComplete } from "./utils/onboardingUtils";
import "./utils/resetSettings"; // إضافة أداة إعادة التعيين للاختبار

// Lazy load pages for better performance
const LanguagePage = React.lazy(() => import("./pages/00_LanguagePage"));
const EntryPage = React.lazy(() => import("./pages/01_EntryPage"));
const LoginPage = React.lazy(() => import("./pages/02_LoginPage"));
const AuthPage = React.lazy(() => import("./pages/03_AuthPage"));
const OTPVerification = React.lazy(() => import("./pages/04_OTPVerification"));
const OnboardingIndividuals = React.lazy(() => import("./pages/05_OnboardingIndividuals"));
const OnboardingCompanies = React.lazy(() => import("./pages/06_OnboardingCompanies"));
const ProfilePage = React.lazy(() => import("./pages/07_ProfilePage"));
const ApplyPage = React.lazy(() => import("./pages/08_ApplyPage"));
const JobPostingsPage = React.lazy(() => import("./pages/09_JobPostingsPage"));
const PostJobPage = React.lazy(() => import("./pages/10_PostJobPage"));
const CoursesPage = React.lazy(() => import("./pages/11_CoursesPage"));
const PostCoursePage = React.lazy(() => import("./pages/12_PostCoursePage"));
const PolicyPage = React.lazy(() => import("./pages/13_PolicyPage"));
const SettingsPage = React.lazy(() => import("./pages/14_SettingsPage"));
const OnboardingIlliterate = React.lazy(() => import("./pages/15_OnboardingIlliterate"));
const OnboardingVisual = React.lazy(() => import("./pages/16_OnboardingVisual"));
const OnboardingUltimate = React.lazy(() => import("./pages/17_OnboardingUltimate"));
const AdminDashboard = React.lazy(() => import("./pages/18_AdminDashboard"));
const InterfaceIndividuals = React.lazy(() => import("./pages/19_InterfaceIndividuals"));
const InterfaceCompanies = React.lazy(() => import("./pages/20_InterfaceCompanies"));
const InterfaceIlliterate = React.lazy(() => import("./pages/21_InterfaceIlliterate"));
const InterfaceVisual = React.lazy(() => import("./pages/22_InterfaceVisual"));
const InterfaceUltimate = React.lazy(() => import("./pages/23_InterfaceUltimate"));
const InterfaceShops = React.lazy(() => import("./pages/24_InterfaceShops"));
const InterfaceWorkshops = React.lazy(() => import("./pages/25_InterfaceWorkshops"));
const AdminSubDashboard = React.lazy(() => import("./pages/26_AdminSubDashboard"));

// مكون للتوجيه الذكي للصفحة الرئيسية
function SmartHomeRoute() {
  const isComplete = isOnboardingComplete();
  
  // إذا لم يكمل المستخدم الإعداد الأولي
  if (!isComplete) {
    console.log("🆕 First time user, showing language selection");
    return <Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><LanguagePage /></Suspense>;
  }
  
  // المستخدم أكمل الإعداد، انتقل لصفحة الدخول
  console.log("✅ User completed onboarding, redirecting to entry");
  return <Navigate to="/entry" replace />;
}

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
        <Route path="/" element={<SmartHomeRoute />} />
        <Route path="/language" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><LanguagePage /></Suspense>} />
        <Route path="/entry" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><EntryPage /></Suspense>} />
        <Route path="/login" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><LoginPage /></Suspense>} />
        <Route path="/auth" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><AuthPage /></Suspense>} />
        <Route path="/otp-verify" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><OTPVerification /></Suspense>} />
        <Route path="/onboarding-individuals" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><OnboardingIndividuals /></Suspense>} />
        <Route path="/onboarding-companies" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><OnboardingCompanies /></Suspense>} />
        <Route path="/onboarding-illiterate" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><OnboardingIlliterate /></Suspense>} />
        <Route path="/onboarding-visual" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><OnboardingVisual /></Suspense>} />
        <Route path="/onboarding-ultimate" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><OnboardingUltimate /></Suspense>} />
        <Route path="/profile" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><ProfilePage /></Suspense>} />
        <Route path="/interface-individuals" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><InterfaceIndividuals /></Suspense>} />
        <Route path="/interface-companies" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><InterfaceCompanies /></Suspense>} />
        <Route path="/interface-illiterate" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><InterfaceIlliterate /></Suspense>} />
        <Route path="/interface-visual" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><InterfaceVisual /></Suspense>} />
        <Route path="/interface-ultimate" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><InterfaceUltimate /></Suspense>} />
        <Route path="/interface-shops" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><InterfaceShops /></Suspense>} />
        <Route path="/interface-workshops" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><InterfaceWorkshops /></Suspense>} />
        <Route path="/admin-dashboard" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><AdminDashboard /></Suspense>} />
        <Route path="/admin-sub-dashboard" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><AdminSubDashboard /></Suspense>} />
        <Route path="/job-postings" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><JobPostingsPage /></Suspense>} />
        <Route path="/apply/:jobId" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><ApplyPage /></Suspense>} />
        <Route path="/post-job" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><PostJobPage /></Suspense>} />
        <Route path="/courses" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><CoursesPage /></Suspense>} />
        <Route path="/post-course" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><PostCoursePage /></Suspense>} />
        <Route path="/policy" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><PolicyPage /></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div></div>}><SettingsPage /></Suspense>} />
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
        <FontProvider>
          <Router>
            <AppAudioPlayer />
            <AppRoutes />
          </Router>
        </FontProvider>
      </AuthProvider>
    </AppSettingsProvider>
  );
}
