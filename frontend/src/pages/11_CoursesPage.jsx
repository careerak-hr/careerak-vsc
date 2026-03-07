import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAnimation } from '../context/AnimationContext';
import { listVariants } from '../utils/animationVariants';
import './11_CoursesPage.css';
import { SEOHead, StructuredData } from '../components/SEO';
import { useSEO } from '../hooks';
import { RelatedLinks, Breadcrumbs } from '../components/InternalLinks';
import ComponentErrorBoundary from '../components/ErrorBoundary/ComponentErrorBoundary';
import { CourseCardSkeleton } from '../components/SkeletonLoaders';
import CourseRecommendationsDashboard from '../components/CourseRecommendationsDashboard';

const CoursesPage = () => {
    const { language, startBgMusic, token } = useApp();
    const seo = useSEO('courses', {});
    const { shouldAnimate } = useAnimation();
    
    // State management for courses, filters, sort, view, loading, pagination
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filter state
    const [filters, setFilters] = useState({
        level: '',
        category: '',
        minDuration: '',
        maxDuration: '',
        isFree: '',
        minRating: '',
        search: ''
    });
    
    // Sort and view state
    const [sort, setSort] = useState('newest'); // newest, popular, rating, price_low, price_high
    const [view, setView] = useState(() => {
        // Load view preference from localStorage
        return localStorage.getItem('coursesViewPreference') || 'grid';
    });
    
    // Pagination state
    const [page, setPage] = useState(1);
    const [limit] = useState(12);
    const [totalCourses, setTotalCourses] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    
    // Fetch courses with API integration
    const fetchCourses = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Build query parameters
            const params = new URLSearchParams();
            
            // Add filters
            if (filters.level) params.append('level', filters.level);
            if (filters.category) params.append('category', filters.category);
            if (filters.minDuration) params.append('minDuration', filters.minDuration);
            if (filters.maxDuration) params.append('maxDuration', filters.maxDuration);
            if (filters.isFree !== '') params.append('isFree', filters.isFree);
            if (filters.minRating) params.append('minRating', filters.minRating);
            if (filters.search) params.append('search', filters.search);
            
            // Add sort
            params.append('sort', sort);
            
            // Add pagination
            params.append('page', page);
            params.append('limit', limit);
            params.append('view', view);
            
            // Make API call
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/courses?${params.toString()}`, {
                headers: token ? {
                    'Authorization': `Bearer ${token}`
                } : {}
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch courses: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Update state with response data
            setCourses(data.courses || []);
            setTotalCourses(data.total || 0);
            setTotalPages(Math.ceil((data.total || 0) / limit));
            
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError(err.message || 'Failed to load courses. Please try again later.');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, [filters, sort, page, limit, view, token]);

    useEffect(() => {
        startBgMusic();
        fetchCourses();
    }, [startBgMusic, fetchCourses]);
    
    // Save view preference to localStorage
    useEffect(() => {
        localStorage.setItem('coursesViewPreference', view);
    }, [view]);
    
    // Handle filter changes
    const handleFilterChange = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPage(1); // Reset to first page when filters change
    }, []);
    
    // Handle sort change
    const handleSortChange = useCallback((newSort) => {
        setSort(newSort);
        setPage(1); // Reset to first page when sort changes
    }, []);
    
    // Handle view change
    const handleViewChange = useCallback((newView) => {
        setView(newView);
    }, []);
    
    // Handle page change
    const handlePageChange = useCallback((newPage) => {
        setPage(newPage);
        // Scroll to top of courses section
        document.getElementById('course-catalog')?.scrollIntoView({ behavior: 'smooth' });
    }, []);
    
    // Handle clear filters
    const handleClearFilters = useCallback(() => {
        setFilters({
            level: '',
            category: '',
            minDuration: '',
            maxDuration: '',
            isFree: '',
            minRating: '',
            search: ''
        });
        setPage(1);
    }, []);

    // Generate Course schema data for structured data
    const generateCourseSchemaData = (course) => {
        // Extract price value and currency
        const priceMatch = course.price.match(/\$(\d+)/);
        const priceValue = priceMatch ? priceMatch[1] : '0';
        
        return {
            name: course.title,
            description: `Learn ${course.title} with ${course.instructor}. Duration: ${course.duration}.`,
            provider: {
                name: 'Careerak',
                url: 'https://careerak.com'
            },
            courseMode: 'online',
            url: `https://careerak.com/courses/${course.id}`,
            offers: {
                price: priceValue,
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock'
            },
            hasCourseInstance: [
                {
                    courseMode: 'online',
                    instructor: {
                        name: course.instructor
                    }
                }
            ]
        };
    };

    
    // Get animation variants based on shouldAnimate
    const containerVariants = shouldAnimate ? listVariants.container : { initial: {}, animate: {} };
    const itemVariants = shouldAnimate ? listVariants.item : { initial: {}, animate: {} };

    // Loading state
    if (loading && courses.length === 0) {
        return (
            <>
                <SEOHead {...seo} />
                <main id="main-content" tabIndex="-1" className="courses-page">
                    <div className="container mx-auto px-4 py-8">
                        <h1 className="text-3xl font-bold mb-6">
                            {language === 'ar' ? 'الدورات التدريبية' : language === 'fr' ? 'Cours' : 'Courses'}
                        </h1>
                        
                        {/* Course skeleton loaders with grid layout */}
                        <section aria-labelledby="course-catalog" aria-busy="true">
                            <h2 id="course-catalog" className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                                {language === 'ar' ? 'الدورات المتاحة' : language === 'fr' ? 'Cours disponibles' : 'Available Courses'}
                            </h2>
                            <div className="course-listings grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                <CourseCardSkeleton count={12} />
                            </div>
                        </section>
                    </div>
                </main>
            </>
        );
    }
    
    // Error state
    if (error) {
        return (
            <>
                <SEOHead {...seo} />
                <main id="main-content" tabIndex="-1" className="courses-page">
                    <div className="container mx-auto px-4 py-8">
                        <Breadcrumbs />
                        
                        <h1 className="text-3xl font-bold mb-6">
                            {language === 'ar' ? 'الدورات التدريبية' : language === 'fr' ? 'Cours' : 'Courses'}
                        </h1>
                        
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                            <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-xl font-semibold mb-2 text-red-800 dark:text-red-200">
                                {language === 'ar' ? 'حدث خطأ' : language === 'fr' ? 'Une erreur s\'est produite' : 'An Error Occurred'}
                            </h2>
                            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
                            <button
                                onClick={fetchCourses}
                                className="px-6 py-2 bg-[#D48161] text-white rounded-lg hover:bg-[#c07050] transition-colors"
                            >
                                {language === 'ar' ? 'إعادة المحاولة' : language === 'fr' ? 'Réessayer' : 'Try Again'}
                            </button>
                        </div>
                    </div>
                </main>
            </>
        );
    }


    return (
        <>
            <SEOHead {...seo} />
            <main id="main-content" tabIndex="-1" className="courses-page">
                <div className="container mx-auto px-4 py-8">
                    {/* Breadcrumb Navigation */}
                    <Breadcrumbs />
                    
                    <h1 className="text-3xl font-bold mb-2">
                        {language === 'ar' ? 'الدورات التدريبية' : language === 'fr' ? 'Cours' : 'Courses'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        {language === 'ar' 
                            ? 'اكتشف دورات تدريبية متنوعة لتطوير مهاراتك المهنية' 
                            : language === 'fr' 
                            ? 'Découvrez des cours variés pour développer vos compétences professionnelles'
                            : 'Discover diverse courses to develop your professional skills'}
                    </p>
                    
                    {/* AI-Powered Course Recommendations */}
                    <section aria-labelledby="ai-recommendations" className="mb-12">
                        <h2 id="ai-recommendations" className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                            {language === 'ar' 
                                ? 'توصيات الدورات بالذكاء الاصطناعي' 
                                : language === 'fr' 
                                ? 'Recommandations de cours par IA'
                                : 'AI-Powered Course Recommendations'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            {language === 'ar'
                                ? 'احصل على توصيات دورات مخصصة بناءً على ملفك الشخصي وأهدافك المهنية. يحلل الذكاء الاصطناعي مهاراتك ويقترح أفضل الدورات لتحسين فرص توظيفك.'
                                : language === 'fr'
                                ? 'Obtenez des recommandations de cours personnalisées basées sur votre profil et vos objectifs de carrière. Notre IA analyse vos compétences et suggère les meilleurs cours pour améliorer votre employabilité.'
                                : 'Get personalized course recommendations based on your profile and career goals. Our AI analyzes your skills and suggests the best courses to improve your employability.'}
                        </p>
                        <CourseRecommendationsDashboard />
                    </section>
                    
                    {/* All Available Courses */}
                    <section aria-labelledby="course-catalog" className="mt-12">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                            <div>
                                <h2 id="course-catalog" className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {language === 'ar' ? 'جميع الدورات المتاحة' : language === 'fr' ? 'Tous les cours disponibles' : 'All Available Courses'}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mt-2">
                                    {totalCourses > 0 
                                        ? `${totalCourses} ${language === 'ar' ? 'دورة متاحة' : language === 'fr' ? 'cours disponibles' : 'courses available'}`
                                        : language === 'ar' ? 'لا توجد دورات متاحة' : language === 'fr' ? 'Aucun cours disponible' : 'No courses available'}
                                </p>
                            </div>
                            
                            {/* Placeholder for filters, sort, and view controls - will be implemented in subtasks */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleViewChange('grid')}
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                        view === 'grid'
                                            ? 'bg-[#D48161] text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                    aria-label={language === 'ar' ? 'عرض شبكي' : language === 'fr' ? 'Vue grille' : 'Grid view'}
                                    aria-pressed={view === 'grid'}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleViewChange('list')}
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                        view === 'list'
                                            ? 'bg-[#D48161] text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                    aria-label={language === 'ar' ? 'عرض قائمة' : language === 'fr' ? 'Vue liste' : 'List view'}
                                    aria-pressed={view === 'list'}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        {/* Empty state */}
                        {courses.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <svg className="w-24 h-24 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                    {language === 'ar' ? 'لا توجد دورات' : language === 'fr' ? 'Aucun cours trouvé' : 'No Courses Found'}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {language === 'ar' 
                                        ? 'جرب تعديل معايير البحث أو الفلاتر' 
                                        : language === 'fr' 
                                        ? 'Essayez de modifier vos critères de recherche ou filtres'
                                        : 'Try adjusting your search criteria or filters'}
                                </p>
                                {(filters.level || filters.category || filters.search || filters.minRating) && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="px-6 py-2 bg-[#D48161] text-white rounded-lg hover:bg-[#c07050] transition-colors"
                                    >
                                        {language === 'ar' ? 'مسح الفلاتر' : language === 'fr' ? 'Effacer les filtres' : 'Clear Filters'}
                                    </button>
                                )}
                            </div>
                        )}
                        
                        {/* Course grid/list */}
                        {courses.length > 0 && (
                            <motion.div
                                className={`course-listings ${
                                    view === 'grid'
                                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                                        : 'flex flex-col gap-4'
                                }`}
                                variants={containerVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                            >
                                {courses.map((course) => (
                                    <ComponentErrorBoundary key={course._id || course.id} componentName={`CourseCard-${course._id || course.id}`}>
                                        <motion.article
                                            className={`course-card bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow ${
                                                view === 'list' ? 'flex flex-row' : 'flex flex-col'
                                            }`}
                                            variants={itemVariants}
                                        >
                                            {/* Add Course structured data for SEO */}
                                            <StructuredData 
                                                type="Course" 
                                                data={generateCourseSchemaData(course)} 
                                            />
                                            
                                            {/* Course content - will be enhanced in CourseCard component */}
                                            <div className="p-6">
                                                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                                                    {course.title}
                                                </h3>
                                                <div className="course-details text-gray-600 dark:text-gray-300 space-y-1">
                                                    <p className="instructor">
                                                        <span className="font-medium">
                                                            {language === 'ar' ? 'المدرب:' : language === 'fr' ? 'Instructeur:' : 'Instructor:'}
                                                        </span> {course.instructor?.fullName || course.instructor || 'N/A'}
                                                    </p>
                                                    <p className="duration">
                                                        <span className="font-medium">
                                                            {language === 'ar' ? 'المدة:' : language === 'fr' ? 'Durée:' : 'Duration:'}
                                                        </span> {course.totalDuration || course.duration || 'N/A'} {language === 'ar' ? 'ساعة' : language === 'fr' ? 'heures' : 'hours'}
                                                    </p>
                                                    <p className="price">
                                                        <span className="font-medium">
                                                            {language === 'ar' ? 'السعر:' : language === 'fr' ? 'Prix:' : 'Price:'}
                                                        </span> {course.price?.isFree ? (language === 'ar' ? 'مجاني' : language === 'fr' ? 'Gratuit' : 'Free') : `$${course.price?.amount || 0}`}
                                                    </p>
                                                </div>
                                                <button className="mt-4 w-full px-4 py-2 bg-[#D48161] text-white rounded hover:bg-[#c07050] transition-colors">
                                                    {language === 'ar' ? 'التسجيل الآن' : language === 'fr' ? 'S\'inscrire maintenant' : 'Enroll Now'}
                                                </button>
                                            </div>
                                        </motion.article>
                                    </ComponentErrorBoundary>
                                ))}
                            </motion.div>
                        )}
                        
                        {/* Pagination - will be enhanced in Pagination component */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    aria-label={language === 'ar' ? 'الصفحة السابقة' : language === 'fr' ? 'Page précédente' : 'Previous page'}
                                >
                                    {language === 'ar' ? 'السابق' : language === 'fr' ? 'Précédent' : 'Previous'}
                                </button>
                                
                                <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                    {language === 'ar' ? `صفحة ${page} من ${totalPages}` : language === 'fr' ? `Page ${page} sur ${totalPages}` : `Page ${page} of ${totalPages}`}
                                </span>
                                
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    aria-label={language === 'ar' ? 'الصفحة التالية' : language === 'fr' ? 'Page suivante' : 'Next page'}
                                >
                                    {language === 'ar' ? 'التالي' : language === 'fr' ? 'Suivant' : 'Next'}
                                </button>
                            </div>
                        )}
                    </section>

                    {/* Related Links for SEO */}
                    <RelatedLinks />
                </div>
            </main>
        </>
    );
}

export default CoursesPage;
