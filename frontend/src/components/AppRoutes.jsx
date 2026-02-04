import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext'; // Corrected import
import { FloatingWhatsApp } from './FloatingWhatsApp';
import { SuspenseWrapper, GlobalLoader } from './GlobalLoaders';
import SmartHomeRoute from './SmartHomeRoute';
import { 
  ProtectedRoute, 
  AdminRoute, 
  HRRoute, 
  GuestRoute, 
  OnboardingRoute 
} from './RouteGuards';

// Lazy load all pages for better performance
const LanguagePage = React.lazy(() => import('../pages/00_LanguagePage'));
const EntryPage = React.lazy(() => import('../pages/01_EntryPage'));
const LoginPage = React.lazy(() => import('../pages/02_LoginPage'));
const AuthPage = React.lazy(() => import('../pages/03_AuthPage'));
const OTPVerification = React.lazy(() => import('../pages/04_OTPVerification'));
const OnboardingIndividuals = React.lazy(() => import('../pages/05_OnboardingIndividuals'));
const OnboardingCompanies = React.lazy(() => import('../pages/06_OnboardingCompanies'));
const ProfilePage = React.lazy(() => import('../pages/07_ProfilePage'));
const ApplyPage = React.lazy(() => import('../pages/08_ApplyPage'));
const JobPostingsPage = React.lazy(() => import('../pages/09_JobPostingsPage'));
const PostJobPage = React.lazy(() => import('../pages/10_PostJobPage'));
const CoursesPage = React.lazy(() => import('../pages/11_CoursesPage'));
const PostCoursePage = React.lazy(() => import('../pages/12_PostCoursePage'));
const PolicyPage = React.lazy(() => import('../pages/13_PolicyPage'));
const SettingsPage = React.lazy(() => import('../pages/14_SettingsPage'));
const OnboardingIlliterate = React.lazy(() => import('../pages/15_OnboardingIlliterate'));
const OnboardingVisual = React.lazy(() => import('../pages/16_OnboardingVisual'));
const OnboardingUltimate = React.lazy(() => import('../pages/17_OnboardingUltimate'));
const AdminDashboard = React.lazy(() => import('../pages/18_AdminDashboard'));
const InterfaceIndividuals = React.lazy(() => import('../pages/19_InterfaceIndividuals'));
const InterfaceCompanies = React.lazy(() => import('../pages/20_InterfaceCompanies'));
const InterfaceIlliterate = React.lazy(() => import('../pages/21_InterfaceIlliterate'));
const InterfaceVisual = React.lazy(() => import('../pages/22_InterfaceVisual'));
const InterfaceUltimate = React.lazy(() => import('../pages/23_InterfaceUltimate'));
const InterfaceShops = React.lazy(() => import('../pages/24_InterfaceShops'));
const InterfaceWorkshops = React.lazy(() => import('../pages/25_InterfaceWorkshops'));
const AdminSubDashboard = React.lazy(() => import('../pages/26_AdminSubDashboard'));

/**
 * Main Application Routes Component with Route Protection
 */
function AppRoutes() {
  const { isAppLoading } = useApp(); // Corrected hook
  const location = useLocation();

  const hideWhatsAppOnPaths = ['/', '/language', '/entry'];
  const shouldShowWhatsApp = !hideWhatsAppOnPaths.includes(location.pathname);

  if (isAppLoading) {
    return <GlobalLoader />;
  }

  return (
    <>
      <Routes>
        {/* Home Route - Smart routing based on onboarding status */}
        <Route path="/" element={<SmartHomeRoute />} />
        
        {/* Entry page is now a public, unguarded route */}
        <Route path="/entry" element={
          <SuspenseWrapper><EntryPage /></SuspenseWrapper>
        } />

        {/* Public Routes - Guest Only */}
        <Route path="/language" element={
          <GuestRoute>
            <SuspenseWrapper><LanguagePage /></SuspenseWrapper>
          </GuestRoute>
        } />
        <Route path="/login" element={
          <GuestRoute>
            <SuspenseWrapper><LoginPage /></SuspenseWrapper>
          </GuestRoute>
        } />
        <Route path="/auth" element={
          <GuestRoute>
            <SuspenseWrapper><AuthPage /></SuspenseWrapper>
          </GuestRoute>
        } />
        <Route path="/otp-verify" element={
          <GuestRoute>
            <SuspenseWrapper><OTPVerification /></SuspenseWrapper>
          </GuestRoute>
        } />
        
        {/* Onboarding Routes - Protected + Onboarding Check */}
        <Route path="/onboarding-individuals" element={
          <OnboardingRoute>
            <SuspenseWrapper><OnboardingIndividuals /></SuspenseWrapper>
          </OnboardingRoute>
        } />
        <Route path="/onboarding-companies" element={
          <OnboardingRoute>
            <SuspenseWrapper><OnboardingCompanies /></SuspenseWrapper>
          </OnboardingRoute>
        } />
        <Route path="/onboarding-illiterate" element={
          <OnboardingRoute>
            <SuspenseWrapper><OnboardingIlliterate /></SuspenseWrapper>
          </OnboardingRoute>
        } />
        <Route path="/onboarding-visual" element={
          <OnboardingRoute>
            <SuspenseWrapper><OnboardingVisual /></SuspenseWrapper>
          </OnboardingRoute>
        } />
        <Route path="/onboarding-ultimate" element={
          <OnboardingRoute>
            <SuspenseWrapper><OnboardingUltimate /></SuspenseWrapper>
          </OnboardingRoute>
        } />
        
        {/* Protected Routes - Require Authentication */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <SuspenseWrapper><ProfilePage /></SuspenseWrapper>
          </ProtectedRoute>
        } />
        
        {/* Interface Routes - Protected */}
        <Route path="/interface-individuals" element={
          <ProtectedRoute>
            <SuspenseWrapper><InterfaceIndividuals /></SuspenseWrapper>
          </ProtectedRoute>
        } />
        <Route path="/interface-companies" element={
          <ProtectedRoute>
            <SuspenseWrapper><InterfaceCompanies /></SuspenseWrapper>
          </ProtectedRoute>
        } />
        <Route path="/interface-illiterate" element={
          <ProtectedRoute>
            <SuspenseWrapper><InterfaceIlliterate /></SuspenseWrapper>
          </ProtectedRoute>
        } />
        <Route path="/interface-visual" element={
          <ProtectedRoute>
            <SuspenseWrapper><InterfaceVisual /></SuspenseWrapper>
          </ProtectedRoute>
        } />
        <Route path="/interface-ultimate" element={
          <ProtectedRoute>
            <SuspenseWrapper><InterfaceUltimate /></SuspenseWrapper>
          </ProtectedRoute>
        } />
        <Route path="/interface-shops" element={
          <ProtectedRoute>
            <SuspenseWrapper><InterfaceShops /></SuspenseWrapper>
          </ProtectedRoute>
        } />
        <Route path="/interface-workshops" element={
          <ProtectedRoute>
            <SuspenseWrapper><InterfaceWorkshops /></SuspenseWrapper>
          </ProtectedRoute>
        } />
        
        {/* Admin Only Routes */}
        <Route path="/admin-dashboard" element={
          <AdminRoute>
            <SuspenseWrapper><AdminDashboard /></SuspenseWrapper>
          </AdminRoute>
        } />
        <Route path="/admin-sub-dashboard" element={
          <AdminRoute>
            <SuspenseWrapper><AdminSubDashboard /></SuspenseWrapper>
          </AdminRoute>
        } />
        
        {/* Job Routes - Mixed Permissions */}
        <Route path="/job-postings" element={
          <ProtectedRoute>
            <SuspenseWrapper><JobPostingsPage /></SuspenseWrapper>
          </ProtectedRoute>
        } />
        <Route path="/apply/:jobId" element={
          <ProtectedRoute>
            <SuspenseWrapper><ApplyPage /></SuspenseWrapper>
          </ProtectedRoute>
        } />
        <Route path="/post-job" element={
          <HRRoute>
            <SuspenseWrapper><PostJobPage /></SuspenseWrapper>
          </HRRoute>
        } />
        
        {/* Course Routes - Mixed Permissions */}
        <Route path="/courses" element={
          <ProtectedRoute>
            <SuspenseWrapper><CoursesPage /></SuspenseWrapper>
          </ProtectedRoute>
        } />
        <Route path="/post-course" element={
          <HRRoute>
            <SuspenseWrapper><PostCoursePage /></SuspenseWrapper>
          </HRRoute>
        } />
        
        {/* Utility Routes - Protected */}
        <Route path="/policy" element={
          <ProtectedRoute>
            <SuspenseWrapper><PolicyPage /></SuspenseWrapper>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SuspenseWrapper><SettingsPage /></SuspenseWrapper>
          </ProtectedRoute>
        } />
        
        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Conditional WhatsApp Widget */}
      {shouldShowWhatsApp && <FloatingWhatsApp />}
    </>
  );
}

export default AppRoutes;
