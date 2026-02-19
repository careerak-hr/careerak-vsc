import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAnimation } from '../context/AnimationContext';
import { listVariants } from '../utils/animationVariants';
import './09_JobPostingsPage.css';

const JobPostingsPage = () => {
    const { language, startBgMusic } = useApp();
    const { shouldAnimate } = useAnimation();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        startBgMusic();
        
        // Simulate fetching jobs (replace with actual API call)
        const fetchJobs = async () => {
            setLoading(true);
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Mock job data
            const mockJobs = [
                { id: 1, title: 'Senior Frontend Developer', company: 'Tech Corp', location: 'Remote', salary: '$80k - $120k' },
                { id: 2, title: 'Backend Engineer', company: 'StartupXYZ', location: 'New York', salary: '$90k - $130k' },
                { id: 3, title: 'Full Stack Developer', company: 'Innovation Labs', location: 'San Francisco', salary: '$100k - $150k' },
                { id: 4, title: 'DevOps Engineer', company: 'Cloud Solutions', location: 'Austin', salary: '$95k - $140k' },
                { id: 5, title: 'UI/UX Designer', company: 'Design Studio', location: 'Los Angeles', salary: '$70k - $110k' },
                { id: 6, title: 'Product Manager', company: 'Product Co', location: 'Seattle', salary: '$110k - $160k' },
            ];
            
            setJobs(mockJobs);
            setLoading(false);
        };
        
        fetchJobs();
    }, [startBgMusic]);

    // Get animation variants based on shouldAnimate
    const containerVariants = shouldAnimate ? listVariants.container : { initial: {}, animate: {} };
    const itemVariants = shouldAnimate ? listVariants.item : { initial: {}, animate: {} };

    if (loading) {
        return (
            <div role="main" className="job-postings-page">
                <main className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-6">Job Postings</h1>
                    <p>Loading jobs...</p>
                </main>
            </div>
        );
    }

    return (
        <div role="main" className="job-postings-page">
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Job Postings</h1>
                <p className="text-gray-600 mb-8">Language: {language}</p>
                
                {/* Job listings with stagger animation */}
                <motion.div
                    className="job-listings space-y-4"
                    variants={containerVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
                    {jobs.map((job) => (
                        <motion.div
                            key={job.id}
                            className="job-card bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                            variants={itemVariants}
                        >
                            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                                {job.title}
                            </h2>
                            <div className="job-details text-gray-600 dark:text-gray-300 space-y-1">
                                <p className="company">
                                    <span className="font-medium">Company:</span> {job.company}
                                </p>
                                <p className="location">
                                    <span className="font-medium">Location:</span> {job.location}
                                </p>
                                <p className="salary">
                                    <span className="font-medium">Salary:</span> {job.salary}
                                </p>
                            </div>
                            <button className="mt-4 px-4 py-2 bg-[#D48161] text-white rounded hover:bg-[#c07050] transition-colors">
                                Apply Now
                            </button>
                        </motion.div>
                    ))}
                </motion.div>
            </main>
        </div>
    );
}

export default JobPostingsPage;
