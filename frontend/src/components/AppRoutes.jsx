import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext'; // Corrected import
import { FloatingWhatsApp } from './FloatingWhatsApp';
import { SuspenseWrapper, GlobalLoader } from './GlobalLoaders';
import SmartHomeRoute from './SmartHomeRoute';
import PageTransition from './PageTransition';
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
const ForgotPasswordPage = React.lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('../pages/ResetPasswordPage'));
const OAuthCallback = React.lazy(() => import('../pages/OAuthCallback'));
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
const AdminPagesNavigator = React.lazy(() => import('../pages/27_AdminPagesNavigator'));
const AdminSystemControl = React.lazy(() => import('../pages/28_AdminSystemControl'));
const AdminDatabaseManager = React.lazy(() => import('../pages/29_AdminDatabaseManager'));
const AdminCodeEditor = React.lazy(() => import('../pages/30_AdminCodeEditor'));
const NotificationsPage = React.lazy(() => import('../pages/NotificationsPage'));
const ConnectedAccountsPage = React.lazy(() => import('../pages/ConnectedAccountsPage'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));
const ServerErrorPage = React.lazy(() => import('../pages/ServerErrorPage'));
const ErrorBoundaryTest = React.lazy(() => import('../test/ErrorBoundaryTest'));
const ErrorRecoveryVerification = React.lazy(() => import('../test/ErrorRecoveryVerification'));

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
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* Home Route - Smart routing based on onboarding status */}
          <Route path="/" element={<SmartHomeRoute />} />
          
          {/* Entry page is now a public, unguarded route */}
          <Route path="/entry" element={
            <SuspenseWrapper>
              <PageTransition variant="fadeIn">
                <EntryPage />
              </PageTransition>
            </SuspenseWrapper>
          } />

          {/* Public Routes - Guest Only */}
          <Route path="/language" element={
            <GuestRoute>
              <SuspenseWrapper>
                <PageTransition variant="fadeIn">
                  <LanguagePage />
                </PageTransition>
              </SuspenseWrapper>
            </GuestRoute>
          } />
          <Route path="/login" element={
            <GuestRoute>
              <SuspenseWrapper>
                <PageTransition variant="slideInRight">
                  <LoginPage />
                </PageTransition>
              </SuspenseWrapper>
            </GuestRoute>
          } />
          <Route path="/auth" element={
            <GuestRoute>
              <SuspenseWrapper>
                <PageTransition variant="slideInRight">
                  <AuthPage />
                </PageTransition>
              </SuspenseWrapper>
            </GuestRoute>
          } />
          <Route path="/otp-verify" element={
            <GuestRoute>
              <SuspenseWrapper>
                <PageTransition variant="fadeIn">
                  <OTPVerification />
                </PageTransition>
              </SuspenseWrapper>
            </GuestRoute>
          } />
          
          {/* Forgot Password Route - Public */}
          <Route path="/forgot-password" element={
            <GuestRoute>
              <SuspenseWrapper>
                <PageTransition variant="slideInRight">
                  <ForgotPasswordPage />
                </PageTransition>
              </SuspenseWrapper>
            </GuestRoute>
          } />
          
          {/* Reset Password Route - Public */}
          <Route path="/reset-password" element={
            <GuestRoute>
              <SuspenseWrapper>
                <PageTransition variant="slideInRight">
                  <ResetPasswordPage />
                </PageTransition>
              </SuspenseWrapper>
            </GuestRoute>
          } />
          
          {/* OAuth Callback Route - Public */}
          <Route path="/auth/callback" element={
            <SuspenseWrapper>
              <PageTransition variant="fadeIn">
                <OAuthCallback />
              </PageTransition>
            </SuspenseWrapper>
          } />
          
          {/* Onboarding Routes - Protected + Onboarding Check */}
          <Route path="/onboarding-individuals" element={
            <OnboardingRoute>
              <SuspenseWrapper>
                <PageTransition variant="slideInRight">
                  <OnboardingIndividuals />
                </PageTransition>
              </SuspenseWrapper>
            </OnboardingRoute>
          } />
          <Route path="/onboarding-companies" element={
            <OnboardingRoute>
              <SuspenseWrapper>
                <PageTransition variant="slideInRight">
                  <OnboardingCompanies />
                </PageTransition>
              </SuspenseWrapper>
            </OnboardingRoute>
          } />
          <Route path="/onboarding-illiterate" element={
            <OnboardingRoute>
              <SuspenseWrapper>
                <PageTransition variant="slideInRight">
                  <OnboardingIlliterate />
                </PageTransition>
              </SuspenseWrapper>
            </OnboardingRoute>
          } />
          <Route path="/onboarding-visual" element={
            <OnboardingRoute>
              <SuspenseWrapper>
                <PageTransition variant="slideInRight">
                  <OnboardingVisual />
                </PageTransition>
              </SuspenseWrapper>
            </OnboardingRoute>
          } />
          <Route path="/onboarding-ultimate" element={
            <OnboardingRoute>
              <SuspenseWrapper>
                <PageTransition variant="slideInRight">
                  <OnboardingUltimate />
                </PageTransition>
              </SuspenseWrapper>
            </OnboardingRoute>
          } />
          
          {/* Protected Routes - Require Authentication */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <SuspenseWrapper>
                <PageTransition variant="fadeIn">
                  <ProfilePage />
                </PageTransition>
              </SuspenseWrapper>
            </ProtectedRoute>
          } />
          
          {/* Interface Routes - Protected */}
          <Route path="/interface-individuals" element={
            <ProtectedRoute>
              <SuspenseWrapper>
                <PageTransition variant="fadeIn">
                  <InterfaceIndividuals />
                </PageTransition>
              </SuspenseWrapper>
            </ProtectedRoute>
          } />
          <Route path="/interface-companies" element={
            <ProtectedRoute>
              <SuspenseWrapper>
                <PageTransition variant="fadeIn">
                  <InterfaceCompanies />
                </PageTransition>
              </SuspenseWrapper>
            </ProtectedRoute>
          } />
          <Route path="/interface-illiterate" element={
            <ProtectedRoute>
              <SuspenseWrapper>
                <PageTransition variant="fadeIn">
                  <InterfaceIlliterate />
                </PageTransition>
              </SuspenseWrapper>
            </ProtectedRoute>
          } />
          <Route path="/interface-visual" element={
            <ProtectedRoute>
              <SuspenseWrapper>
                <PageTransition variant="fadeIn">
                  <InterfaceVisual />
                </PageTransition>
              </SuspenseWrapper>
            </ProtectedRoute>
          } />
          <Route path="/interface-ultimate" element={
            <ProtectedRoute>
              <SuspenseWrapper>
                <PageTransition variant="fadeIn">
                  <InterfaceUltimate />
                </PageTransition>
              </SuspenseWrapper>
            </ProtectedRoute>
          } />
          <Route path="/interface-shops" element={
            <ProtectedRoute>
              <SuspenseWrapper>
                <PageTransition variant="fadeIn">
                  <InterfaceShops />
                </PageTransition>
              </SuspenseWrapper>
            </ProtectedRoute>
          } />
          <Route path="/interface-workshops" element={
            <ProtectedRoute>
              <SuspenseWrapper>
                <PageTransition variant="fadeIn">
                  <InterfaceWorkshops />
                </PageTransition>
              </SuspenseWrapper>
            </ProtectedRoute>
          } />
          
          {/* Admin Only Routes */}
          <Route path="/admin-dashboard" element={
            <AdminRoute>
              <SuspenseWrapper>
                <PageTransition variant="fadeIn">
                  <AdminDashboard />
                </PageTransition>
              </SuspenseWrapper>
            </AdminRoute>
          } />
          <Route path="/admin-sub-dashboard" element={
            <AdminRoute>
              <SuspenseWrapper>
                <PageTransition variant="fadeIn">
                  <AdminSubDashboard />
                </PageTransition>
              </SuspenseWrapper>
            </AdminRoute>
          } />
          <Route path="/admin-pages" element={
            <AdminRoute>
              <SuspenseWrapper>
                <PageTransition variant="fadeIn">
                  <AdminPagesNavigator />
                </PageTransition>
              </SuspenseWrapper>
            </AdminRoute>
          } />
          <Route path="/admin-system" element={
            <AdminRoute>
              <SuspenseWrapper>
                <PageTransition variant="fadeIn">
                  <AdminSystemControl />
                </PageTransition>
              </SuspenseWrapper>
            </AdminRoute>
          } />
          <Route path="/admin-database" element={
            <AdminRoute>
              <SuspenseWrapper>
                <PageTransition variant="fadeIn">
                  <AdminDatabaseManager />
                </PageTransition>
              </SuspenseWrapper>
            </AdminRoute>
          } />
          <Route path="/admin-code-editor" element={
            <AdminRoute>
              <SuspenseWrapper>
                <PageTransition variant="fadeIn">
                  <AdminCodeEditor />
                </PageTransition>
              </SuspenseWrapper>
            </AdminRoute>
          } />
          
          {/* Job Routes - Mixed Permissions */}
          <Route path="/job-postings" element={
            <ProtectedRoute>
              <SuspenseWrapper>
                <PageTransition variant="fadeIn">
                  <JobPostingsPage />
                </PageTransition>
              </SuspenseWrapper>
            </ProtectedRoute>
          } />
          <Route path="/apply/:jobId" element={
            <ProtectedRoute>
              <SuspenseWrapper>
                <PageTransition variant="slideInRight">
                  <ApplyPage />
                </PageTransition>
              </SuspenseWrapper>
            </ProtectedRoute>
          } />
          <Route path="/post-job" element={
            <HRRoute>
              <SuspenseWrapper>
                <PageTransition variant="fadeIn">
                  <PostJobPage />
                </PageTransition>
              </SuspenseWrapper>
            </HRRoute>
          } />
          
          {/* Course Routes - Mixed Permissions */}
          <Route path="/courses" element={
            <ProtectedRoute>
              <SuspenseWrapper>
                <PageTransition variant="fadeIn">
                  <CoursesPage />
                </PageTransition>
              </SuspenseWrapper>
            </ProtectedRoute>
          } />
          <Route path="/post-course" element={
            <HRRoute>
              <SuspenseWrapper>
                <PageTransition variant="fadeIn">
                  <PostCoursePage />
                </PageTransition>
              </SuspenseWrapper>
            </HRRoute>
          } />
          
          {/* Utility Routes - Protected */}
          <Route path="/notifications" element={
            <ProtectedRoute>
              <SuspenseWrapper>
                <PageTransition variant="fadeIn">
                  <NotificationsPage />
                </PageTransition>
              </SuspenseWrapper>
            </ProtectedRoute>
          } />
          <Route path="/connected-accounts" element={
            <ProtectedRoute>
              <SuspenseWrapper>
                <PageTransition variant="fadeIn">
                  <ConnectedAccountsPage />
                </PageTransition>
              </SuspenseWrapper>
            </ProtectedRoute>
          } />
          <Route path="/policy" element={
            <ProtectedRoute>
              <SuspenseWrapper>
                <PageTransition variant="fadeIn">
                  <PolicyPage />
                </PageTransition>
              </SuspenseWrapper>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SuspenseWrapper>
                <PageTransition variant="fadeIn">
                  <SettingsPage />
                </PageTransition>
              </SuspenseWrapper>
            </ProtectedRoute>
          } />
          
          {/* Fallback Route - 404 Page */}
          <Route path="*" element={
            <SuspenseWrapper>
              <PageTransition variant="fadeIn">
                <NotFoundPage />
              </PageTransition>
            </SuspenseWrapper>
          } />
          
          {/* Server Error Route - 500 Page */}
          <Route path="/500" element={
            <SuspenseWrapper>
              <PageTransition variant="fadeIn">
                <ServerErrorPage />
              </PageTransition>
            </SuspenseWrapper>
          } />
          
          {/* Error Boundary Test Route - Development Only */}
          {process.env.NODE_ENV === 'development' && (
            <>
              <Route path="/error-boundary-test" element={
                <SuspenseWrapper>
                  <PageTransition variant="fadeIn">
                    <ErrorBoundaryTest />
                  </PageTransition>
                </SuspenseWrapper>
              } />
              <Route path="/test/error-recovery" element={
                <SuspenseWrapper>
                  <PageTransition variant="fadeIn">
                    <ErrorRecoveryVerification />
                  </PageTransition>
                </SuspenseWrapper>
              } />
            </>
          )}
        </Routes>
      </AnimatePresence>
      
      {/* Conditional WhatsApp Widget */}
      {shouldShowWhatsApp && <FloatingWhatsApp />}
    </>
  );
}

export default AppRoutes;
