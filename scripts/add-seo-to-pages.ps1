# PowerShell script to add SEOHead to all page components
# This script documents the changes needed for each page

$pages = @(
    @{File="04_OTPVerification.jsx"; SEOKey="otp"},
    @{File="05_OnboardingIndividuals.jsx"; SEOKey="onboardingIndividuals"},
    @{File="06_OnboardingCompanies.jsx"; SEOKey="onboardingCompanies"},
    @{File="07_ProfilePage.jsx"; SEOKey="profile"},
    @{File="08_ApplyPage.jsx"; SEOKey="apply"},
    @{File="09_JobPostingsPage.jsx"; SEOKey="jobPostings"},
    @{File="10_PostJobPage.jsx"; SEOKey="postJob"},
    @{File="11_CoursesPage.jsx"; SEOKey="courses"},
    @{File="12_PostCoursePage.jsx"; SEOKey="postCourse"},
    @{File="13_PolicyPage.jsx"; SEOKey="policy"},
    @{File="14_SettingsPage.jsx"; SEOKey="settings"},
    @{File="15_OnboardingIlliterate.jsx"; SEOKey="onboardingIndividuals"},
    @{File="16_OnboardingVisual.jsx"; SEOKey="onboardingIndividuals"},
    @{File="17_OnboardingUltimate.jsx"; SEOKey="onboardingIndividuals"},
    @{File="18_AdminDashboard.jsx"; SEOKey="adminDashboard"},
    @{File="19_InterfaceIndividuals.jsx"; SEOKey="profile"},
    @{File="20_InterfaceCompanies.jsx"; SEOKey="profile"},
    @{File="21_InterfaceIlliterate.jsx"; SEOKey="profile"},
    @{File="22_InterfaceVisual.jsx"; SEOKey="profile"},
    @{File="23_InterfaceUltimate.jsx"; SEOKey="profile"},
    @{File="24_InterfaceShops.jsx"; SEOKey="profile"},
    @{File="25_InterfaceWorkshops.jsx"; SEOKey="profile"},
    @{File="26_AdminSubDashboard.jsx"; SEOKey="adminDashboard"},
    @{File="27_AdminPagesNavigator.jsx"; SEOKey="adminDashboard"},
    @{File="28_AdminSystemControl.jsx"; SEOKey="adminDashboard"},
    @{File="29_AdminDatabaseManager.jsx"; SEOKey="adminDashboard"},
    @{File="30_AdminCodeEditor.jsx"; SEOKey="adminDashboard"},
    @{File="NotificationsPage.jsx"; SEOKey="notifications"},
    @{File="OAuthCallback.jsx"; SEOKey="login"}
)

Write-Host "Pages to update: $($pages.Count)"
Write-Host ""
Write-Host "For each page, add the following:"
Write-Host "1. Import statements:"
Write-Host "   import { SEOHead } from '../components/SEO';"
Write-Host "   import { useSEO } from '../hooks';"
Write-Host ""
Write-Host "2. Inside component function:"
Write-Host "   const seo = useSEO('pageKey', {});"
Write-Host ""
Write-Host "3. Wrap return with fragment:"
Write-Host "   return ("
Write-Host "     <>"
Write-Host "       <SEOHead {...seo} />"
Write-Host "       <main>...</main>"
Write-Host "     </>"
Write-Host "   );"
Write-Host ""

foreach ($page in $pages) {
    Write-Host "- $($page.File) -> useSEO('$($page.SEOKey)', {})"
}
