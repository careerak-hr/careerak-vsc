/**
 * Utility script to document SEO additions to all pages
 * 
 * This file documents which pages need SEOHead component added
 * and what page identifier to use for each.
 * 
 * Format: { filename: 'pageIdentifier' }
 */

export const pageSEOMapping = {
  // Already completed
  '00_LanguagePage.jsx': 'language',
  '01_EntryPage.jsx': 'entry',
  
  // Need to add SEOHead
  '02_LoginPage.jsx': 'login',
  '03_AuthPage.jsx': 'auth',
  '04_OTPVerification.jsx': 'otp',
  '05_OnboardingIndividuals.jsx': 'onboardingIndividuals',
  '06_OnboardingCompanies.jsx': 'onboardingCompanies',
  '07_ProfilePage.jsx': 'profile',
  '08_ApplyPage.jsx': 'apply',
  '09_JobPostingsPage.jsx': 'jobPostings',
  '10_PostJobPage.jsx': 'postJob',
  '11_CoursesPage.jsx': 'courses',
  '12_PostCoursePage.jsx': 'postCourse',
  '13_PolicyPage.jsx': 'policy',
  '14_SettingsPage.jsx': 'settings',
  '15_OnboardingIlliterate.jsx': 'onboardingIndividuals', // Same as individuals
  '16_OnboardingVisual.jsx': 'onboardingIndividuals', // Same as individuals
  '17_OnboardingUltimate.jsx': 'onboardingIndividuals', // Same as individuals
  '18_AdminDashboard.jsx': 'adminDashboard',
  '19_InterfaceIndividuals.jsx': 'profile', // Interface pages use profile metadata
  '20_InterfaceCompanies.jsx': 'profile',
  '21_InterfaceIlliterate.jsx': 'profile',
  '22_InterfaceVisual.jsx': 'profile',
  '23_InterfaceUltimate.jsx': 'profile',
  '24_InterfaceShops.jsx': 'profile',
  '25_InterfaceWorkshops.jsx': 'profile',
  '26_AdminSubDashboard.jsx': 'adminDashboard',
  '27_AdminPagesNavigator.jsx': 'adminDashboard',
  '28_AdminSystemControl.jsx': 'adminDashboard',
  '29_AdminDatabaseManager.jsx': 'adminDashboard',
  '30_AdminCodeEditor.jsx': 'adminDashboard',
  'NotificationsPage.jsx': 'notifications',
  'OAuthCallback.jsx': 'login' // OAuth callback uses login metadata
};

/**
 * Instructions for adding SEOHead to a page:
 * 
 * 1. Add imports at the top:
 *    import { SEOHead } from '../components/SEO';
 *    import { useSEO } from '../hooks';
 * 
 * 2. Inside the component function, add:
 *    const seo = useSEO('pageIdentifier', {});
 * 
 * 3. Wrap the return statement with fragment and add SEOHead:
 *    return (
 *      <>
 *        <SEOHead {...seo} />
 *        <main>...</main>
 *      </>
 *    );
 */

export default pageSEOMapping;
