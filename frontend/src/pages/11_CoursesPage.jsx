import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAnimation } from '../context/AnimationContext';
import { listVariants } from '../utils/animationVariants';
import './11_CoursesPage.css';

const CoursesPage = () => {
    const { language, startBgMusic } = useApp();
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

    // Get animation variants based on shouldAnimate
    const containerVariants = shouldAnimate ? listVariants.container : { initial: {}, animate: {} };
    const itemVariants = shouldAnimate ? listVariants.item : { initial: {}, animate: {} };

    if (loading) {
        return (
            <div role="main" className="courses-page">
                <main className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-6">Courses</h1>
                    <p>Loading courses...</p>
                </main>
            </div>
        );
    }

    return (
        <div role="main" className="courses-page">
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Courses</h1>
                <p className="text-gray-600 mb-8">Language: {language}</p>
                
                {/* Course listings with stagger animation */}
                <motion.div
                    className="course-listings grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
                    {courses.map((course) => (
                        <motion.div
                            key={course.id}
                            className="course-card bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                            variants={itemVariants}
                        >
                            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                                {course.title}
                            </h2>
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
                        </motion.div>
                    ))}
                </motion.div>
            </main>
        </div>
    );
}

export default CoursesPage;
