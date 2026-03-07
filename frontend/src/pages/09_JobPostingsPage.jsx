import React, { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAnimation } from '../context/AnimationContext';
import { listVariants } from '../utils/animationVariants';
import './09_JobPostingsPage.css';
import { SEOHead, StructuredData } from '../components/SEO';
import { useSEO } from '../hooks';
import { transformJobToSchema } from '../utils/seoHelpers';
import { RelatedLinks, Breadcrumbs } from '../components/InternalLinks';
import ComponentErrorBoundary from '../components/ErrorBoundary/ComponentErrorBoundary';
import JobCardGridSkeleton from '../components/SkeletonLoaders/JobCardGridSkeleton';
import JobCardListSkeleton from '../components/SkeletonLoaders/JobCardListSkeleton';
import ViewToggle from '../components/ViewToggle/ViewToggle';
import { 
  usePerformance, 
  useDebouncedCallback, 
  useCachedData,
  usePrefetch 
} from '../hooks/usePerformance';
import { dataCache } from '../utils/performanceOptimization';

// Lazy load المكونات غير الحرجة
const SavedSearchesPanel = lazy(() => import('../components/SavedSearchesPanel'));
const JobFilters = lazy(() => import('../components/JobFilters/JobFilters'));

const JobPostingsPage = () => {
    const { language, startBgMusic } = useApp();
    const seo = useSEO('jobPostings', {});
    const { shouldAnimate } = useAnimation();
    
    // تفعيل تحسينات الأداء
    const { getMetrics, isHighQualityNetwork } = usePerformance({
        enableLazyLoading: true,
        enablePerformanceMonitoring: true,
        enableMemoryCleanup: true
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
    const [view, setView] = useState(() => {
        // استرجاع التفضيل من localStorage
        return localStorage.getItem('jobViewPreference') || 'grid';
    });

    // Prefetch الصفحات المحتملة
    usePrefetch([
        '/api/job-postings?page=2',
        '/job-detail',
        '/apply'
    ]);

    // حفظ التفضيل عند التغيير
    const handleViewToggle = () => {
        const newView = view === 'grid' ? 'list' : 'grid';
        setView(newView);
        localStorage.setItem('jobViewPreference', newView);
    };

    // جلب الوظائف مع الفلاتر (مع caching)
    const fetchJobs = async (currentFilters = {}, page = 1) => {
        setLoading(true);
        try {
            // بناء query string
            const queryParams = new URLSearchParams({
                page,
                limit: pagination.limit,
                ...currentFilters
            });

            // التحقق من الـ cache أولاً
            const cacheKey = `jobs_${queryParams.toString()}`;
            if (dataCache.has(cacheKey)) {
                const cachedData = dataCache.get(cacheKey);
                setJobs(cachedData.data || []);
                setPagination(cachedData.pagination || pagination);
                setLoading(false);
                return;
            }

            const response = await fetch(`/api/job-postings?${queryParams}`);
            const data = await response.json();

            // حفظ في الـ cache
            dataCache.set(cacheKey, data);

            setJobs(data.data || []);
            setPagination(data.pagination || pagination);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        startBgMusic();
        fetchJobs(filters, pagination.page);
        
        // طباعة مقاييس الأداء بعد التحميل
        setTimeout(() => {
            const metrics = getMetrics();
            if (metrics) {
                console.log('Performance Metrics:', metrics);
            }
        }, 3000);
    }, [startBgMusic]);

    // معالج تغيير الفلاتر مع debounce
    const handleFilterChange = useDebouncedCallback((newFilters) => {
        setFilters(newFilters);
        fetchJobs(newFilters, 1); // إعادة التعيين للصفحة الأولى
    }, 300);

    // معالج مسح الفلاتر
    const handleClearFilters = () => {
        setFilters({});
        fetchJobs({}, 1);
    };

    // معالج تغيير الصفحة
    const handlePageChange = (newPage) => {
        fetchJobs(filters, newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Get animation variants based on shouldAnimate
    const containerVariants = shouldAnimate ? listVariants.container : { initial: {}, animate: {} };
    const itemVariants = shouldAnimate ? listVariants.item : { initial: {}, animate: {} };
    
    // تحديد جودة الصور بناءً على الشبكة
    const imageQuality = useMemo(() => {
        return isHighQualityNetwork() ? 'high' : 'medium';
    }, [isHighQualityNetwork]);

    if (loading) {
        return (
            <>
                <SEOHead {...seo} />
                <main id="main-content" tabIndex="-1" className="job-postings-page">
                    <div className="container mx-auto px-4 py-8">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold">Job Postings</h1>
                            <ViewToggle view={view} onToggle={handleViewToggle} />
                        </div>
                        
                        {/* Job listings skeleton with 6-9 items - مختلف حسب نوع العرض */}
                        <section aria-labelledby="job-results">
                            <h2 id="job-results" className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                                Available Positions
                            </h2>
                            <div className="job-listings">
                                {/* عرض skeleton مختلف حسب نوع العرض */}
                                {view === 'grid' ? (
                                    <JobCardGridSkeleton count={9} />
                                ) : (
                                    <JobCardListSkeleton count={9} />
                                )}
                            </div>
                        </section>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <SEOHead {...seo} />
            <main id="main-content" tabIndex="-1" className="job-postings-page">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb Navigation */}
                <Breadcrumbs />
                
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Job Postings</h1>
                    <ViewToggle view={view} onToggle={handleViewToggle} />
                </div>
                
                <p className="text-gray-600 mb-8">Language: {language}</p>
                
                {/* Job Filters - Lazy loaded */}
                <Suspense fallback={<div className="h-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />}>
                    <ComponentErrorBoundary componentName="JobFilters">
                        <JobFilters 
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                        />
                    </ComponentErrorBoundary>
                </Suspense>
                
                {/* Saved Searches Panel - Lazy loaded */}
                <Suspense fallback={<div className="h-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />}>
                    <ComponentErrorBoundary componentName="SavedSearchesPanel">
                        <SavedSearchesPanel />
                    </ComponentErrorBoundary>
                </Suspense>
                
                {/* Results Count */}
                {!loading && (
                    <div className="results-count mb-4">
                        <p className="text-gray-600 dark:text-gray-300">
                            {pagination.total} {language === 'ar' ? 'نتيجة' : language === 'fr' ? 'résultats' : 'results'}
                        </p>
                    </div>
                )}
                
                {/* Job listings with stagger animation and smooth transition */}
                <section aria-labelledby="job-results">
                    <h2 id="job-results" className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                        Available Positions
                    </h2>
                    <motion.div
                        className={`job-listings ${view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        style={{
                            opacity: loading ? 0 : 1,
                            transition: 'opacity 300ms ease-in-out'
                        }}
                    >
                        {jobs.map((job) => {
                            // Transform job data to schema format
                            const jobSchemaData = transformJobToSchema(job);
                            
                            return (
                                <React.Fragment key={job.id}>
                                    {/* Add JobPosting structured data for each job */}
                                    <StructuredData type="JobPosting" data={jobSchemaData} />
                                    
                                    {/* Wrap job card with ComponentErrorBoundary */}
                                    <ComponentErrorBoundary componentName={`JobCard-${job.id}`}>
                                        <motion.article
                                            className={`job-card bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow ${
                                                view === 'list' ? 'flex gap-6' : ''
                                            }`}
                                            variants={itemVariants}
                                        >
                                            {view === 'list' && (
                                                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center">
                                                    <span className="text-2xl">💼</span>
                                                </div>
                                            )}
                                            
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                                                    {job.title}
                                                </h3>
                                                <div className="job-details text-gray-600 dark:text-gray-300 space-y-1">
                                                    <p className="company">
                                                        <span className="font-medium">Company:</span> {job.company}
                                                    </p>
                                                    <p className="location">
                                                        <span className="font-medium">Location:</span> {job.location}
                                                    </p>
                                                    <p className="salary">
                                                        <span className="font-medium">Salary:</span> {
                                                            job.salary 
                                                                ? `${job.salary.currency} ${job.salary.min?.toLocaleString()} - ${job.salary.max?.toLocaleString()}`
                                                                : 'Negotiable'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <button className={`${view === 'list' ? 'self-start' : 'mt-4'} px-4 py-2 bg-[#D48161] text-white rounded hover:bg-[#c07050] transition-colors`}>
                                                Apply Now
                                            </button>
                                        </motion.article>
                                    </ComponentErrorBoundary>
                                </React.Fragment>
                            );
                        })}
                    </motion.div>
                </section>

                {/* Pagination */}
                {!loading && pagination.pages > 1 && (
                    <div className="pagination-container mt-8 flex justify-center items-center gap-4">
                        <button
                            className="pagination-btn"
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            aria-label="Previous page"
                        >
                            {language === 'ar' ? 'السابق' : language === 'fr' ? 'Précédent' : 'Previous'}
                        </button>
                        
                        <div className="pagination-info">
                            <span className="text-gray-600 dark:text-gray-300">
                                {language === 'ar' 
                                    ? `صفحة ${pagination.page} من ${pagination.pages}`
                                    : language === 'fr'
                                    ? `Page ${pagination.page} sur ${pagination.pages}`
                                    : `Page ${pagination.page} of ${pagination.pages}`
                                }
                            </span>
                        </div>
                        
                        <button
                            className="pagination-btn"
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.pages}
                            aria-label="Next page"
                        >
                            {language === 'ar' ? 'التالي' : language === 'fr' ? 'Suivant' : 'Next'}
                        </button>
                    </div>
                )}

                {/* Related Links for SEO */}
                <RelatedLinks />
            </div>
        </main>
        </>
    );
}

export default JobPostingsPage;
