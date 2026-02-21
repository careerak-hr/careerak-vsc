import React, { useEffect, useState } from 'react';
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

const JobPostingsPage = () => {
    const { language, startBgMusic } = useApp();
    const seo = useSEO('jobPostings', {});
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
            
            // Mock job data with complete schema information
            const mockJobs = [
                { 
                    id: 1, 
                    title: 'Senior Frontend Developer', 
                    description: 'We are looking for an experienced frontend developer with expertise in React, TypeScript, and modern web technologies.',
                    company: 'Tech Corp', 
                    location: 'Riyadh', 
                    salary: { min: 80000, max: 120000, currency: 'SAR' },
                    jobType: 'Full-time',
                    status: 'Open',
                    createdAt: new Date().toISOString(),
                    postedBy: { companyName: 'Tech Corp', logo: 'https://careerak.com/logo.png' }
                },
                { 
                    id: 2, 
                    title: 'Backend Engineer', 
                    description: 'Join our team to build scalable backend systems using Node.js, MongoDB, and cloud technologies.',
                    company: 'StartupXYZ', 
                    location: 'Dubai', 
                    salary: { min: 90000, max: 130000, currency: 'AED' },
                    jobType: 'Full-time',
                    status: 'Open',
                    createdAt: new Date().toISOString(),
                    postedBy: { companyName: 'StartupXYZ' }
                },
                { 
                    id: 3, 
                    title: 'Full Stack Developer', 
                    description: 'Seeking a versatile full stack developer to work on both frontend and backend systems.',
                    company: 'Innovation Labs', 
                    location: 'Jeddah', 
                    salary: { min: 100000, max: 150000, currency: 'SAR' },
                    jobType: 'Full-time',
                    status: 'Open',
                    createdAt: new Date().toISOString(),
                    postedBy: { companyName: 'Innovation Labs' }
                },
                { 
                    id: 4, 
                    title: 'DevOps Engineer', 
                    description: 'Looking for a DevOps engineer to manage our cloud infrastructure and CI/CD pipelines.',
                    company: 'Cloud Solutions', 
                    location: 'Cairo', 
                    salary: { min: 95000, max: 140000, currency: 'EGP' },
                    jobType: 'Full-time',
                    status: 'Open',
                    createdAt: new Date().toISOString(),
                    postedBy: { companyName: 'Cloud Solutions' }
                },
                { 
                    id: 5, 
                    title: 'UI/UX Designer', 
                    description: 'Creative UI/UX designer needed to craft beautiful and intuitive user experiences.',
                    company: 'Design Studio', 
                    location: 'Doha', 
                    salary: { min: 70000, max: 110000, currency: 'QAR' },
                    jobType: 'Full-time',
                    status: 'Open',
                    createdAt: new Date().toISOString(),
                    postedBy: { companyName: 'Design Studio' }
                },
                { 
                    id: 6, 
                    title: 'Product Manager', 
                    description: 'Experienced product manager to lead product strategy and development.',
                    company: 'Product Co', 
                    location: 'Amman', 
                    salary: { min: 110000, max: 160000, currency: 'JOD' },
                    jobType: 'Full-time',
                    status: 'Open',
                    createdAt: new Date().toISOString(),
                    postedBy: { companyName: 'Product Co' }
                },
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
            <>
                <SEOHead {...seo} />
                <main id="main-content" tabIndex="-1" className="job-postings-page">
                    <div className="container mx-auto px-4 py-8">
                        <h1 className="text-3xl font-bold mb-6">Job Postings</h1>
                        <p>Loading jobs...</p>
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
                
                <h1 className="text-3xl font-bold mb-6">Job Postings</h1>
                <p className="text-gray-600 mb-8">Language: {language}</p>
                
                {/* Job listings with stagger animation */}
                <section aria-labelledby="job-results">
                    <h2 id="job-results" className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                        Available Positions
                    </h2>
                    <motion.div
                        className="job-listings space-y-4"
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
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
                                            className="job-card bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                            variants={itemVariants}
                                        >
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
                                            <button className="mt-4 px-4 py-2 bg-[#D48161] text-white rounded hover:bg-[#c07050] transition-colors">
                                                Apply Now
                                            </button>
                                        </motion.article>
                                    </ComponentErrorBoundary>
                                </React.Fragment>
                            );
                        })}
                    </motion.div>
                </section>

                {/* Related Links for SEO */}
                <RelatedLinks />
            </div>
        </main>
        </>
    );
}

export default JobPostingsPage;
