import React, { useEffect, useState, Suspense, lazy } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAnimation } from '../context/AnimationContext';
import { listVariants, pageVariants, buttonVariants } from '../utils/animationVariants';
import './07_ProfilePage.css';
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';
import { RelatedLinks, Breadcrumbs } from '../components/InternalLinks';
import ComponentErrorBoundary from '../components/ErrorBoundary/ComponentErrorBoundary';
import ShareButton from '../components/ShareButton/ShareButton';

// Lazy load components for performance (Task 12.3)
const PointsBalanceWidget = lazy(() => import('../components/Referral/PointsBalanceWidget'));
const ProfileCompletionWidget = lazy(() => import('../components/ProfileImprovement/ProfileCompletionWidget'));
const SuggestionsPanel = lazy(() => import('../components/ProfileImprovement/SuggestionsPanel'));
const PortfolioGallery = lazy(() => import('../components/Portfolio/PortfolioGallery'));
const SocialLinksSection = lazy(() => import('../components/SocialLinks/SocialLinksSection'));
const SkillsSection = lazy(() => import('../components/Skills/SkillsSection'));
const AboutSection = lazy(() => import('../components/About/AboutSection'));
const ProfileAnalytics = lazy(() => import('../components/ProfileImprovement/ProfileAnalytics'));
const ProfilePreview = lazy(() => import('../components/ProfileImprovement/ProfilePreview'));
const CertificatesGallery = lazy(() => import('../components/Certificates/CertificatesGallery'));

/**
 * Enhanced Profile Page
 * Implements Tasks 12.1, 12.2, 12.3
 */
const ProfilePage = () => {
    const { user, language, updateUser, logout, startBgMusic } = useApp();
    const { shouldAnimate } = useAnimation();
    const seo = useSEO('profile', {});

    const [completionData, setCompletionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    useEffect(() => {
        startBgMusic();
        fetchCompletionData();
    }, [startBgMusic]);

    const fetchCompletionData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/profile/completion');
            setCompletionData(response.data.data);
        } catch (error) {
            console.error('Error fetching completion data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = (data) => {
        updateUser(data);
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <motion.div
            className="profile-page-container"
            variants={pageVariants.fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <SEOHead {...seo} />
            <main id="main-content" tabIndex="-1" className="profile-page-main container mx-auto px-4 py-8">
                <Breadcrumbs />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                    {/* Sidebar - Staggered Entry (Task 12.2) */}
                    <motion.aside
                        className="lg:col-span-1 space-y-6"
                        variants={listVariants.container}
                        initial="initial"
                        animate="animate"
                    >
                        {/* Basic Info Card */}
                        <motion.section
                            variants={listVariants.item}
                            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                            <div className="text-center mb-6">
                                <motion.div
                                    className="relative inline-block"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <img
                                        src={user?.profileImage || '/logo.jpg'}
                                        alt={user?.firstName}
                                        className="w-32 h-32 rounded-full object-cover border-4 border-accent/20"
                                    />
                                </motion.div>
                                <h1 className="text-2xl font-bold mt-4 text-primary dark:text-white font-amiri">
                                    {user?.firstName} {user?.lastName}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">{user?.specialization || 'باحث عن عمل'}</p>
                            </div>

                            <div className="space-y-4">
                                <motion.button
                                    whileHover={buttonVariants.hover}
                                    whileTap={buttonVariants.tap}
                                    onClick={() => handleUpdateProfile({ name: 'Updated' })}
                                    className="w-full btn-primary py-3 rounded-xl font-bold"
                                >
                                    تعديل الملف الشخصي
                                </motion.button>

                                <motion.button
                                    whileHover={buttonVariants.hover}
                                    whileTap={buttonVariants.tap}
                                    onClick={() => setIsPreviewMode(true)}
                                    className="w-full bg-secondary/30 text-primary py-3 rounded-xl font-bold border border-primary/10 flex items-center justify-center gap-2"
                                >
                                    <span>معاينة كصاحب عمل</span>
                                </motion.button>

                                <ShareButton
                                    content={user}
                                    contentType="profile"
                                    variant="outline"
                                    size="medium"
                                    className="w-full"
                                />

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleLogout}
                                    className="w-full py-3 text-red-500 font-bold border border-red-100 rounded-xl hover:bg-red-50 transition-colors"
                                >
                                    تسجيل الخروج
                                </motion.button>
                            </div>
                        </motion.section>

                        {/* Points Balance Widget - Lazy Loaded (Requirements 2.4) */}
                        <Suspense fallback={<div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />}>
                            <motion.div variants={listVariants.item}>
                                <PointsBalanceWidget
                                    onReferFriend={() => window.location.href = '/referrals'}
                                    onViewHistory={() => window.location.href = '/referrals'}
                                />
                            </motion.div>
                        </Suspense>

                        {/* Profile Completion Widget - Lazy Loaded */}
                        <Suspense fallback={<div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />}>
                            <motion.div variants={listVariants.item}>
                                <ProfileCompletionWidget completion={completionData} />
                            </motion.div>
                        </Suspense>

                        {/* Suggestions Panel - Lazy Loaded */}
                        <Suspense fallback={<div className="h-60 bg-gray-100 rounded-2xl animate-pulse" />}>
                            <motion.div variants={listVariants.item}>
                                <SuggestionsPanel />
                            </motion.div>
                        </Suspense>

                        {/* Social Links - Lazy Loaded */}
                        <Suspense fallback={<div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />}>
                            <motion.div variants={listVariants.item}>
                                <SocialLinksSection />
                            </motion.div>
                        </Suspense>
                    </motion.aside>

                    {/* Main Content Area */}
                    <motion.div
                        className="lg:col-span-2 space-y-6"
                        variants={listVariants.container}
                        initial="initial"
                        animate="animate"
                    >
                        {/* Analytics - Critical for business (Task 11) */}
                        <Suspense fallback={<div className="h-80 bg-gray-100 rounded-2xl animate-pulse" />}>
                            <motion.div variants={listVariants.item}>
                                <ProfileAnalytics />
                            </motion.div>
                        </Suspense>

                        {/* About Me Section - Lazy Loaded (Task 7) */}
                        <Suspense fallback={<div className="h-60 bg-gray-100 rounded-2xl animate-pulse" />}>
                            <motion.div variants={listVariants.item}>
                                <AboutSection />
                            </motion.div>
                        </Suspense>

                        {/* Skills Section - Lazy Loaded (Task 8) */}
                        <Suspense fallback={<div className="h-80 bg-gray-100 rounded-2xl animate-pulse" />}>
                            <motion.div variants={listVariants.item}>
                                <SkillsSection />
                            </motion.div>
                        </Suspense>

                        {/* Portfolio Gallery - Lazy Loaded (Task 5) */}
                        <Suspense fallback={<div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />}>
                            <motion.div variants={listVariants.item}>
                                <PortfolioGallery />
                            </motion.div>
                        </Suspense>

                        {/* Certificates Gallery - Lazy Loaded */}
                        <Suspense fallback={<div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />}>
                            <motion.div variants={listVariants.item}>
                                <CertificatesGallery userId={user?._id} isOwnProfile={true} />
                            </motion.div>
                        </Suspense>
                    </motion.div>
                </div>

                <RelatedLinks />
            </main>

            {/* Full Screen Preview Modal (Task 10) */}
            <AnimatePresence>
                {isPreviewMode && (
                    <Suspense fallback={<div className="fixed inset-0 bg-white z-50 flex items-center justify-center">Loading Preview...</div>}>
                        <ProfilePreview onClose={() => setIsPreviewMode(false)} />
                    </Suspense>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default ProfilePage;
