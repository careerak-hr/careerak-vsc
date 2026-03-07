import React from 'react';
import { useApp } from '../../context/AppContext';
import './CourseOverview.css';

const CourseOverview = ({ course }) => {
    const { language } = useApp();
    
    return (
        <div className="course-overview">
            {/* Learning Outcomes */}
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                <section className="mb-8">
                    <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                        {language === 'ar' ? 'ماذا ستتعلم' : language === 'fr' ? 'Ce que vous apprendrez' : 'What You\'ll Learn'}
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {course.learningOutcomes.map((outcome, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-700 dark:text-gray-300">{outcome}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
            
            {/* Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
                <section className="mb-8">
                    <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                        {language === 'ar' ? 'المتطلبات الأساسية' : language === 'fr' ? 'Prérequis' : 'Prerequisites'}
                    </h3>
                    <ul className="space-y-2">
                        {course.prerequisites.map((prerequisite, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-700 dark:text-gray-300">{prerequisite}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
            
            {/* Topics Covered */}
            {course.topics && course.topics.length > 0 && (
                <section className="mb-8">
                    <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                        {language === 'ar' ? 'المواضيع المغطاة' : language === 'fr' ? 'Sujets couverts' : 'Topics Covered'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {course.topics.map((topic, index) => (
                            <span
                                key={index}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                            >
                                {topic}
                            </span>
                        ))}
                    </div>
                </section>
            )}
            
            {/* Course Details */}
            <section className="mb-8">
                <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                    {language === 'ar' ? 'تفاصيل الدورة' : language === 'fr' ? 'Détails du cours' : 'Course Details'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <svg className="w-6 h-6 text-[#D48161]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {language === 'ar' ? 'المدة الإجمالية' : language === 'fr' ? 'Durée totale' : 'Total Duration'}
                            </div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                                {course.totalDuration || 0} {language === 'ar' ? 'ساعة' : language === 'fr' ? 'heures' : 'hours'}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <svg className="w-6 h-6 text-[#D48161]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {language === 'ar' ? 'عدد الدروس' : language === 'fr' ? 'Nombre de leçons' : 'Number of Lessons'}
                            </div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                                {course.totalLessons || 0} {language === 'ar' ? 'درس' : language === 'fr' ? 'leçons' : 'lessons'}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Description */}
            {course.content && (
                <section>
                    <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                        {language === 'ar' ? 'الوصف' : language === 'fr' ? 'Description' : 'Description'}
                    </h3>
                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                        {course.content}
                    </div>
                </section>
            )}
        </div>
    );
};

export default CourseOverview;
