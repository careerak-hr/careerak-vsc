import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './CourseHero.css';

const CourseHero = ({ course, enrollment, onEnrollmentUpdate }) => {
    const { language, token } = useApp();
    const navigate = useNavigate();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    
    // Handle enrollment
    const handleEnroll = useCallback(async () => {
        if (!token) {
            navigate('/login');
            return;
        }
        
        setEnrolling(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/courses/${course._id}/enroll`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to enroll');
            }
            
            // Refresh enrollment status
            if (onEnrollmentUpdate) {
                await onEnrollmentUpdate();
            }
            
            // Show success message
            alert(language === 'ar' ? 'تم التسجيل بنجاح!' : language === 'fr' ? 'Inscription réussie!' : 'Enrolled successfully!');
            
        } catch (error) {
            console.error('Error enrolling:', error);
            alert(language === 'ar' ? 'فشل التسجيل. حاول مرة أخرى.' : language === 'fr' ? 'Échec de l\'inscription. Réessayez.' : 'Failed to enroll. Try again.');
        } finally {
            setEnrolling(false);
        }
    }, [course._id, token, navigate, language, onEnrollmentUpdate]);
    
    // Handle continue learning
    const handleContinueLearning = useCallback(() => {
        navigate(`/courses/${course._id}/learn`);
    }, [course._id, navigate]);
    
    // Handle wishlist toggle
    const handleWishlistToggle = useCallback(async () => {
        if (!token) {
            navigate('/login');
            return;
        }
        
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const method = isWishlisted ? 'DELETE' : 'POST';
            const response = await fetch(`${apiUrl}/api/wishlist/${course._id}`, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                setIsWishlisted(!isWishlisted);
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        }
    }, [course._id, token, isWishlisted, navigate]);
    
    // Handle share
    const handleShare = useCallback(() => {
        setShowShareModal(true);
    }, []);
    
    // Copy share link
    const copyShareLink = useCallback(async () => {
        const shareUrl = `${window.location.origin}/courses/${course._id}`;
        
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert(language === 'ar' ? 'تم نسخ الرابط!' : language === 'fr' ? 'Lien copié!' : 'Link copied!');
        } catch (error) {
            console.error('Error copying link:', error);
        }
    }, [course._id, language]);
    
    return (
        <section className="course-hero" aria-labelledby="course-title">
            <div className="hero-content grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Course Media */}
                <div className="lg:col-span-2">
                    {/* Course Thumbnail/Video */}
                    <div className="course-media mb-6">
                        {course.previewVideo ? (
                            <div className="video-container aspect-video bg-gray-900 rounded-lg overflow-hidden">
                                <video
                                    controls
                                    poster={course.thumbnail}
                                    className="w-full h-full"
                                    aria-label={language === 'ar' ? 'فيديو معاينة الدورة' : language === 'fr' ? 'Vidéo d\'aperçu du cours' : 'Course preview video'}
                                >
                                    <source src={course.previewVideo} type="video/mp4" />
                                    {language === 'ar' ? 'متصفحك لا يدعم تشغيل الفيديو.' : language === 'fr' ? 'Votre navigateur ne supporte pas la lecture vidéo.' : 'Your browser does not support video playback.'}
                                </video>
                            </div>
                        ) : course.thumbnail ? (
                            <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full aspect-video object-cover rounded-lg"
                            />
                        ) : (
                            <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                        )}
                    </div>
                    
                    {/* Course Title and Description */}
                    <h1 id="course-title" className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                        {course.title}
                    </h1>
                    
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                        {course.description}
                    </p>
                    
                    {/* Instructor Info (Brief) */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300">
                                {course.instructor?.fullName || course.instructorInfo?.name || language === 'ar' ? 'مدرب' : language === 'fr' ? 'Instructeur' : 'Instructor'}
                            </span>
                        </div>
                    </div>
                    
                    {/* Rating and Stats */}
                    <div className="flex flex-wrap items-center gap-6 mb-6">
                        {/* Rating */}
                        {course.stats?.averageRating > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg
                                            key={star}
                                            className={`w-5 h-5 ${
                                                star <= Math.round(course.stats.averageRating)
                                                    ? 'text-yellow-400'
                                                    : 'text-gray-300 dark:text-gray-600'
                                            }`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    {course.stats.averageRating.toFixed(1)}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                    ({course.stats.totalReviews || 0} {language === 'ar' ? 'تقييم' : language === 'fr' ? 'avis' : 'reviews'})
                                </span>
                            </div>
                        )}
                        
                        {/* Enrollments */}
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span>
                                {course.stats?.totalEnrollments || 0} {language === 'ar' ? 'طالب' : language === 'fr' ? 'étudiants' : 'students'}
                            </span>
                        </div>
                    </div>
                    
                    {/* Progress Bar (if enrolled) */}
                    {enrollment && (
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {language === 'ar' ? 'تقدمك' : language === 'fr' ? 'Votre progression' : 'Your Progress'}
                                </span>
                                <span className="text-sm font-medium text-[#D48161]">
                                    {enrollment.progress?.percentageComplete || 0}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-[#D48161] h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${enrollment.progress?.percentageComplete || 0}%` }}
                                    role="progressbar"
                                    aria-valuenow={enrollment.progress?.percentageComplete || 0}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Right Column - Enrollment Card */}
                <div className="lg:col-span-1">
                    <div className="sticky top-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                        {/* Price */}
                        <div className="mb-6">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {course.price?.isFree ? (
                                    <span className="text-green-600 dark:text-green-400">
                                        {language === 'ar' ? 'مجاني' : language === 'fr' ? 'Gratuit' : 'Free'}
                                    </span>
                                ) : (
                                    <span>${course.price?.amount || 0}</span>
                                )}
                            </div>
                        </div>
                        
                        {/* Enroll/Continue Button */}
                        {enrollment ? (
                            <button
                                onClick={handleContinueLearning}
                                className="w-full px-6 py-3 bg-[#D48161] text-white rounded-lg hover:bg-[#c07050] transition-colors font-medium mb-4"
                            >
                                {language === 'ar' ? 'متابعة التعلم' : language === 'fr' ? 'Continuer l\'apprentissage' : 'Continue Learning'}
                            </button>
                        ) : (
                            <button
                                onClick={handleEnroll}
                                disabled={enrolling}
                                className="w-full px-6 py-3 bg-[#D48161] text-white rounded-lg hover:bg-[#c07050] transition-colors font-medium mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {enrolling 
                                    ? (language === 'ar' ? 'جاري التسجيل...' : language === 'fr' ? 'Inscription...' : 'Enrolling...')
                                    : (language === 'ar' ? 'التسجيل الآن' : language === 'fr' ? 'S\'inscrire maintenant' : 'Enroll Now')
                                }
                            </button>
                        )}
                        
                        {/* Wishlist and Share Buttons */}
                        <div className="flex gap-2 mb-6">
                            <button
                                onClick={handleWishlistToggle}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                                aria-label={isWishlisted ? (language === 'ar' ? 'إزالة من المفضلة' : language === 'fr' ? 'Retirer des favoris' : 'Remove from wishlist') : (language === 'ar' ? 'إضافة للمفضلة' : language === 'fr' ? 'Ajouter aux favoris' : 'Add to wishlist')}
                            >
                                <svg className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'}`} fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                                aria-label={language === 'ar' ? 'مشاركة الدورة' : language === 'fr' ? 'Partager le cours' : 'Share course'}
                            >
                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Course Info */}
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{course.totalDuration || 0} {language === 'ar' ? 'ساعة' : language === 'fr' ? 'heures' : 'hours'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>{course.totalLessons || 0} {language === 'ar' ? 'درس' : language === 'fr' ? 'leçons' : 'lessons'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>{course.level || (language === 'ar' ? 'جميع المستويات' : language === 'fr' ? 'Tous niveaux' : 'All levels')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowShareModal(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                            {language === 'ar' ? 'مشاركة الدورة' : language === 'fr' ? 'Partager le cours' : 'Share Course'}
                        </h3>
                        <button
                            onClick={copyShareLink}
                            className="w-full px-4 py-2 bg-[#D48161] text-white rounded-lg hover:bg-[#c07050] transition-colors"
                        >
                            {language === 'ar' ? 'نسخ الرابط' : language === 'fr' ? 'Copier le lien' : 'Copy Link'}
                        </button>
                        <button
                            onClick={() => setShowShareModal(false)}
                            className="w-full mt-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            {language === 'ar' ? 'إغلاق' : language === 'fr' ? 'Fermer' : 'Close'}
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default CourseHero;
