import React, { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAnimation } from '../context/AnimationContext';
import { listVariants, pageVariants } from '../utils/animationVariants';
import './09_JobPostingsPage.css';
import { SEOHead, StructuredData } from '../components/SEO';
import { useSEO } from '../hooks';
import { transformJobToSchema } from '../utils/seoHelpers';
import { RelatedLinks, Breadcrumbs } from '../components/InternalLinks';
import ComponentErrorBoundary from '../components/ErrorBoundary/ComponentErrorBoundary';
import JobCardGridSkeleton from '../components/SkeletonLoaders/JobCardGridSkeleton';
import JobCardListSkeleton from '../components/SkeletonLoaders/JobCardListSkeleton';
import JobCardGrid from '../components/JobCard/JobCardGrid';
import JobCardList from '../components/JobCard/JobCardList';
import ViewToggle from '../components/ViewToggle/ViewToggle';
import { 
  usePerformance, 
  useDebouncedCallback, 
  usePrefetch
} from '../hooks/usePerformance';
import { dataCache } from '../utils/performanceOptimization';
import { performanceOptimizer } from '../utils/performanceOptimizer';
import axios from 'axios';

// Lazy load المكونات غير الحرجة
const SavedSearchesPanel = lazy(() => import('../components/SavedSearchesPanel'));
const JobFilters = lazy(() => import('../components/JobFilters/JobFilters'));

/**
 * صفحة عرض الوظائف المحسنة
 * تفعيل المهام: 12.1, 12.2, 12.3
 */
const JobPostingsPage = () => {
    const { language, startBgMusic } = useApp();
    const seo = useSEO('jobPostings', {});
    const { shouldAnimate } = useAnimation();
    
    // تفعيل تحسينات الأداء
    const { getMetrics } = usePerformance({
        enableLazyLoading: true,
        enablePerformanceMonitoring: true
    });
    
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });
    const [filters, setFilters] = useState({});
    const [view, setView] = useState(() => localStorage.getItem('jobViewPreference') || 'grid');

    // Prefetch البيانات
    usePrefetch(['/api/job-postings/filter-options']);

    useEffect(() => {
        startBgMusic();
        fetchJobs(filters, pagination.page);

        // تفعيل تحسينات الأداء العالمية
        performanceOptimizer.initializeOptimizations();
    }, [startBgMusic]);

    const handleViewToggle = (newView) => {
        setView(newView);
        localStorage.setItem('jobViewPreference', newView);
    };

    const fetchJobs = async (currentFilters = {}, page = 1) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page,
                limit: pagination.limit,
                ...currentFilters
            });

            const cacheKey = `jobs_${queryParams.toString()}`;
            if (dataCache.has(cacheKey)) {
                const cachedData = dataCache.get(cacheKey);
                setJobs(cachedData.data || []);
                setPagination(cachedData.pagination);
                setLoading(false);
                return;
            }

            const response = await axios.get(`/api/job-postings?${queryParams}`);
            dataCache.set(cacheKey, response.data);

            setJobs(response.data.data || []);
            setPagination(response.data.pagination);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setLoading(false);
        }
    };

    const handleBookmark = async (jobId) => {
        try {
            const response = await axios.post(`/api/job-postings/${jobId}/bookmark`);
            return response.data.data.bookmarked;
        } catch (err) {
            console.error('Error bookmarking:', err);
        }
    };

    const handleShare = async (job, platform) => {
        try {
            await axios.post(`/api/job-postings/${job._id || job.id}/share`, { platform });
        } catch (err) {
            console.error('Error recording share:', err);
        }
    };

    const handleFilterChange = useDebouncedCallback((newFilters) => {
        setFilters(newFilters);
        fetchJobs(newFilters, 1);
    }, 300);

    return (
        <motion.div
            className="job-postings-page"
            variants={pageVariants.fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <SEOHead {...seo} />
            <div className="container mx-auto px-4 py-8">
                <Breadcrumbs />
                
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold font-amiri">تصفح الوظائف</h1>
                    <ViewToggle view={view} onToggle={handleViewToggle} />
                </div>

                <Suspense fallback={<div className="h-20 bg-gray-100 rounded animate-pulse" />}>
                    <JobFilters onFilterChange={handleFilterChange} />
                </Suspense>

                <section aria-labelledby="job-results" className="mt-8">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                className={`job-listings ${view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {view === 'grid' ? <JobCardGridSkeleton count={6} /> : <JobCardListSkeleton count={6} />}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="results"
                                className={`job-listings ${view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}
                                variants={listVariants.container}
                                initial="initial"
                                animate="animate"
                                layout
                            >
                                {jobs.length > 0 ? jobs.map((job) => (
                                    <motion.div key={job._id || job.id} variants={listVariants.item} layout>
                                        <StructuredData type="JobPosting" data={transformJobToSchema(job)} />
                                        {view === 'grid' ? (
                                            <JobCardGrid
                                                job={job}
                                                onBookmark={handleBookmark}
                                                onShare={handleShare}
                                                isBookmarked={job.isBookmarked}
                                            />
                                        ) : (
                                            <JobCardList
                                                job={job}
                                                onBookmark={handleBookmark}
                                                onShare={handleShare}
                                                isBookmarked={job.isBookmarked}
                                            />
                                        )}
                                    </motion.div>
                                )) : (
                                    <div className="col-span-full text-center py-12">لا توجد وظائف تطابق بحثك.</div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                {pagination.pages > 1 && (
                    <div className="flex justify-center mt-12 gap-4">
                        <button
                            className="btn-outline"
                            disabled={pagination.page === 1}
                            onClick={() => fetchJobs(filters, pagination.page - 1)}
                        >
                            السابق
                        </button>
                        <span className="flex items-center">صفحة {pagination.page} من {pagination.pages}</span>
                        <button
                            className="btn-outline"
                            disabled={pagination.page === pagination.pages}
                            onClick={() => fetchJobs(filters, pagination.page + 1)}
                        >
                            التالي
                        </button>
                    </div>
                )}

                <RelatedLinks />
            </div>
        </motion.div>
    );
};

export default JobPostingsPage;
