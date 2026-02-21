import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAnimation } from '../context/AnimationContext';
import { listVariants } from '../utils/animationVariants';
import './11_CoursesPage.css';
import { SEOHead, StructuredData } from '../components/SEO';
import { useSEO } from '../hooks';
import { RelatedLinks, Breadcrumbs } from '../components/InternalLinks';
import ComponentErrorBoundary from '../components/ErrorBoundary/ComponentErrorBoundary';

const CoursesPage = () => {
    const { language, startBgMusic } = useApp();
    const seo = useSEO('courses', {});
    const { shouldAnimate } = useAnimation();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        startBgMusic();
        
        // Simulate fetching courses (replace with actual API call)
        const fetchCourses = async () => {
            setLoading(true);
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Mock course data
            const mockCourses = [
                { id: 1, title: 'Advanced React Development', instructor: 'John Doe', duration: '8 weeks', price: '$299' },
                { id: 2, title: 'Node.js Backend Mastery', instructor: 'Jane Smith', duration: '10 weeks', price: '$349' },
                { id: 3, title: 'Full Stack Web Development', instructor: 'Mike Johnson', duration: '12 weeks', price: '$499' },
                { id: 4, title: 'UI/UX Design Fundamentals', instructor: 'Sarah Williams', duration: '6 weeks', price: '$249' },
                { id: 5, title: 'DevOps and Cloud Computing', instructor: 'David Brown', duration: '8 weeks', price: '$399' },
                { id: 6, title: 'Mobile App Development', instructor: 'Emily Davis', duration: '10 weeks', price: '$449' },
            ];
            
            setCourses(mockCourses);
            setLoading(false);
        };
        
        fetchCourses();
    }, [startBgMusic]);

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

    if (loading) {
        return (
            <>
                <SEOHead {...seo} />
                <main id="main-content" tabIndex="-1" className="courses-page">
                    <div className="container mx-auto px-4 py-8">
                        <h1 className="text-3xl font-bold mb-6">Courses</h1>
                        <p>Loading courses...</p>
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
                
                <h1 className="text-3xl font-bold mb-6">Courses</h1>
                <p className="text-gray-600 mb-8">Language: {language}</p>
                
                {/* Course listings with stagger animation */}
                <section aria-labelledby="course-catalog">
                    <h2 id="course-catalog" className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                        Available Courses
                    </h2>
                    <motion.div
                        className="course-listings grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        {courses.map((course) => (
                            <ComponentErrorBoundary key={course.id} componentName={`CourseCard-${course.id}`}>
                                <motion.article
                                    className="course-card bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                    variants={itemVariants}
                                >
                                    {/* Add Course structured data for SEO */}
                                    <StructuredData 
                                        type="Course" 
                                        data={generateCourseSchemaData(course)} 
                                    />
                                    
                                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                                        {course.title}
                                    </h3>
                                    <div className="course-details text-gray-600 dark:text-gray-300 space-y-1">
                                        <p className="instructor">
                                            <span className="font-medium">Instructor:</span> {course.instructor}
                                        </p>
                                        <p className="duration">
                                            <span className="font-medium">Duration:</span> {course.duration}
                                        </p>
                                        <p className="price">
                                            <span className="font-medium">Price:</span> {course.price}
                                        </p>
                                    </div>
                                    <button className="mt-4 w-full px-4 py-2 bg-[#D48161] text-white rounded hover:bg-[#c07050] transition-colors">
                                        Enroll Now
                                    </button>
                                </motion.article>
                            </ComponentErrorBoundary>
                        ))}
                    </motion.div>
                </section>

                {/* Related Links for SEO */}
                <RelatedLinks />
            </div>
        </main>
        </>
    );
}

export default CoursesPage;
