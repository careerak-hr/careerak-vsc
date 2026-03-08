import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAnimation } from '../context/AnimationContext';
import { pageVariants } from '../utils/animationVariants'; // fadeInVariants not found
import './CourseDetailsPage.css';
import { SEOHead, StructuredData } from '../components/SEO';
import { Breadcrumbs } from '../components/InternalLinks';
import ComponentErrorBoundary from '../components/ErrorBoundary/ComponentErrorBoundary';
// import CourseHero from '../components/Courses/CourseHero'; // Component not found
// import CourseOverview from '../components/Courses/CourseOverview'; // Component not found
// import CourseCurriculum from '../components/Courses/CourseCurriculum'; // Component not found
// import InstructorInfo from '../components/Courses/InstructorInfo'; // Component not found
// import CourseReviews from '../components/Courses/CourseReviews'; // Component not found

const CourseDetailsPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { language, startBgMusic, token } = useApp();
    const { shouldAnimate } = useAnimation();
    
    // State management
    const [course, setCourse] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Fetch course details
    const fetchCourseDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/courses/${courseId}`, {
                headers: token ? {
                    'Authorization': `Bearer ${token}`
                } : {}
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Course not found');
                }
                throw new Error(`Failed to fetch course: ${response.statusText}`);
            }
            
            const data = await response.json();
            setCourse(data.course || data);
            
        } catch (err) {
            console.error('Error fetching course details:', err);
            setError(err.message || 'Failed to load course details');
        } finally {
            setLoading(false);
        }
    }, [courseId, token]);
    
    // Check enrollment status
    const checkEnrollment = useCallback(async () => {
        if (!token || !courseId) return;
        
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/courses/${courseId}/progress`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setEnrollment(data.enrollment || data);
            }
        } catch (err) {
            console.error('Error checking enrollment:', err);
            // Not enrolled or error - enrollment will remain null
        }
    }, [courseId, token]);
    
    useEffect(() => {
        startBgMusic();
        fetchCourseDetails();
        checkEnrollment();
    }, [startBgMusic, fetchCourseDetails, checkEnrollment]);
    
    // Handle tab change
    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
    }, []);
    
    // Generate SEO data
    const seoData = course ? {
        title: `${course.title} - ${language === 'ar' ? 'دورة تدريبية' : language === 'fr' ? 'Cours' : 'Course'} | Careerak`,
        description: course.description || `${language === 'ar' ? 'تعلم' : language === 'fr' ? 'Apprenez' : 'Learn'} ${course.title}`,
        keywords: `${course.title}, ${course.category || ''}, ${course.level || ''}, ${language === 'ar' ? 'دورة تدريبية' : language === 'fr' ? 'cours' : 'course'}`,
        image: course.thumbnail || 'https://careerak.com/images/course-default.jpg',
        url: `https://careerak.com/courses/${courseId}`
    } : {};
    
    // Generate Course structured data
    const courseSchemaData = course ? {
        name: course.title,
        description: course.description,
        provider: {
            name: 'Careerak',
            url: 'https://careerak.com'
        },
        courseMode: 'online',
        url: `https://careerak.com/courses/${courseId}`,
        offers: {
            price: course.price?.amount || '0',
            priceCurrency: course.price?.currency || 'USD',
            availability: 'https://schema.org/InStock'
        },
        aggregateRating: course.stats?.averageRating ? {
            ratingValue: course.stats.averageRating,
            reviewCount: course.stats.totalReviews || 0
        } : undefined,
        hasCourseInstance: [
            {
                courseMode: 'online',
                instructor: {
                    name: course.instructor?.fullName || course.instructorInfo?.name || 'Instructor'
                }
            }
        ]
    } : null;
    
    // Get animation variants
    const containerVariants = shouldAnimate ? pageVariants : { initial: {}, animate: {} };
    
    // Loading state
    if (loading) {
        return (
            <>
                <SEOHead {...seoData} />
                <main id="main-content" tabIndex="-1" className="course-details-page">
                    <div className="container mx-auto px-4 py-8">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
                            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded mb-8"></div>
                            <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
                        </div>
                    </div>
                </main>
            </>
        );
    }
    
    // Error state
    if (error || !course) {
        return (
            <>
                <SEOHead {...seoData} />
                <main id="main-content" tabIndex="-1" className="course-details-page">
                    <div className="container mx-auto px-4 py-8">
                        <Breadcrumbs />
                        
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                            <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-xl font-semibold mb-2 text-red-800 dark:text-red-200">
                                {language === 'ar' ? 'حدث خطأ' : language === 'fr' ? 'Une erreur s\'est produite' : 'An Error Occurred'}
                            </h2>
                            <p className="text-red-600 dark:text-red-300 mb-4">{error || (language === 'ar' ? 'الدورة غير موجودة' : language === 'fr' ? 'Cours introuvable' : 'Course not found')}</p>
                            <button
                                onClick={() => navigate('/courses')}
                                className="px-6 py-2 bg-[#D48161] text-white rounded-lg hover:bg-[#c07050] transition-colors"
                            >
                                {language === 'ar' ? 'العودة للدورات' : language === 'fr' ? 'Retour aux cours' : 'Back to Courses'}
                            </button>
                        </div>
                    </div>
                </main>
            </>
        );
    }
    
    return (
        <>
            <SEOHead {...seoData} />
            {courseSchemaData && <StructuredData type="Course" data={courseSchemaData} />}
            
            <motion.main
                id="main-content"
                tabIndex="-1"
                className="course-details-page"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                <div className="container mx-auto px-4 py-8">
                    {/* Breadcrumb Navigation */}
                    <Breadcrumbs />
                    
                    {/* Course Hero Section */}
                    <ComponentErrorBoundary componentName="CourseHero">
                        <CourseHero 
                            course={course} 
                            enrollment={enrollment}
                            onEnrollmentUpdate={checkEnrollment}
                        />
                    </ComponentErrorBoundary>
                    
                    {/* Tab Navigation */}
                    <div className="tabs-container mt-8 mb-6">
                        <nav className="flex border-b border-gray-200 dark:border-gray-700" role="tablist" aria-label={language === 'ar' ? 'تبويبات الدورة' : language === 'fr' ? 'Onglets du cours' : 'Course tabs'}>
                            <button
                                role="tab"
                                aria-selected={activeTab === 'overview'}
                                aria-controls="overview-panel"
                                id="overview-tab"
                                onClick={() => handleTabChange('overview')}
                                className={`px-6 py-3 font-medium transition-colors ${
                                    activeTab === 'overview'
                                        ? 'border-b-2 border-[#D48161] text-[#D48161]'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            >
                                {language === 'ar' ? 'نظرة عامة' : language === 'fr' ? 'Aperçu' : 'Overview'}
                            </button>
                            <button
                                role="tab"
                                aria-selected={activeTab === 'curriculum'}
                                aria-controls="curriculum-panel"
                                id="curriculum-tab"
                                onClick={() => handleTabChange('curriculum')}
                                className={`px-6 py-3 font-medium transition-colors ${
                                    activeTab === 'curriculum'
                                        ? 'border-b-2 border-[#D48161] text-[#D48161]'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            >
                                {language === 'ar' ? 'المنهج' : language === 'fr' ? 'Programme' : 'Curriculum'}
                            </button>
                            <button
                                role="tab"
                                aria-selected={activeTab === 'instructor'}
                                aria-controls="instructor-panel"
                                id="instructor-tab"
                                onClick={() => handleTabChange('instructor')}
                                className={`px-6 py-3 font-medium transition-colors ${
                                    activeTab === 'instructor'
                                        ? 'border-b-2 border-[#D48161] text-[#D48161]'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            >
                                {language === 'ar' ? 'المدرب' : language === 'fr' ? 'Instructeur' : 'Instructor'}
                            </button>
                            <button
                                role="tab"
                                aria-selected={activeTab === 'reviews'}
                                aria-controls="reviews-panel"
                                id="reviews-tab"
                                onClick={() => handleTabChange('reviews')}
                                className={`px-6 py-3 font-medium transition-colors ${
                                    activeTab === 'reviews'
                                        ? 'border-b-2 border-[#D48161] text-[#D48161]'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            >
                                {language === 'ar' ? 'التقييمات' : language === 'fr' ? 'Avis' : 'Reviews'}
                                {course.stats?.totalReviews > 0 && (
                                    <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
                                        {course.stats.totalReviews}
                                    </span>
                                )}
                            </button>
                        </nav>
                    </div>
                    
                    {/* Tab Content */}
                    <div className="tab-content">
                        {activeTab === 'overview' && (
                            <ComponentErrorBoundary componentName="CourseOverview">
                                <div role="tabpanel" id="overview-panel" aria-labelledby="overview-tab">
                                    <CourseOverview course={course} />
                                </div>
                            </ComponentErrorBoundary>
                        )}
                        
                        {activeTab === 'curriculum' && (
                            <ComponentErrorBoundary componentName="CourseCurriculum">
                                <div role="tabpanel" id="curriculum-panel" aria-labelledby="curriculum-tab">
                                    {/* <CourseCurriculum 
                                        course={course} 
                                        enrollment={enrollment}
                                    /> */}
                                    <div className="p-8 text-center text-gray-500">
                                        <p>المنهج الدراسي قريباً</p>
                                        <p className="text-sm mt-2">Course curriculum coming soon</p>
                                    </div>
                                </div>
                            </ComponentErrorBoundary>
                        )}
                        
                        {activeTab === 'instructor' && (
                            <ComponentErrorBoundary componentName="InstructorInfo">
                                <div role="tabpanel" id="instructor-panel" aria-labelledby="instructor-tab">
                                    <InstructorInfo 
                                        instructor={course.instructor}
                                        instructorInfo={course.instructorInfo}
                                    />
                                </div>
                            </ComponentErrorBoundary>
                        )}
                        
                        {activeTab === 'reviews' && (
                            <ComponentErrorBoundary componentName="CourseReviews">
                                <div role="tabpanel" id="reviews-panel" aria-labelledby="reviews-tab">
                                    <CourseReviews 
                                        courseId={courseId}
                                        enrollment={enrollment}
                                    />
                                </div>
                            </ComponentErrorBoundary>
                        )}
                    </div>
                </div>
            </motion.main>
        </>
    );
};

export default CourseDetailsPage;
