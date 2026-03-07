/**
 * Smooth Transition Example
 * 
 * Demonstrates the smooth transition from skeleton loaders to actual content
 * 
 * Requirements:
 * - FR-LOAD-5: Smooth transition from skeleton to content
 * - FR-LOAD-7: Apply smooth transitions (300ms fade)
 * - FR-LOAD-8: Prevent layout shifts (CLS < 0.1)
 */

import React, { useState, useEffect } from 'react';
import JobsContainer from '../components/JobsContainer/JobsContainer';
import { JobCardGrid, JobCardList } from '../components/JobCard';

// Mock job data
const mockJobs = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    company: { name: 'Tech Corp', logo: '/logo1.png' },
    location: 'Riyadh, Saudi Arabia',
    salary: '15000 - 20000 SAR',
    type: 'Full-time',
    description: 'We are looking for an experienced frontend developer...',
    tags: ['React', 'TypeScript', 'Tailwind CSS']
  },
  {
    id: 2,
    title: 'Backend Engineer',
    company: { name: 'Innovation Labs', logo: '/logo2.png' },
    location: 'Jeddah, Saudi Arabia',
    salary: '12000 - 18000 SAR',
    type: 'Full-time',
    description: 'Join our team to build scalable backend systems...',
    tags: ['Node.js', 'MongoDB', 'Express']
  },
  {
    id: 3,
    title: 'UI/UX Designer',
    company: { name: 'Creative Studio', logo: '/logo3.png' },
    location: 'Dubai, UAE',
    salary: '10000 - 15000 AED',
    type: 'Contract',
    description: 'Design beautiful and intuitive user interfaces...',
    tags: ['Figma', 'Adobe XD', 'Prototyping']
  },
  {
    id: 4,
    title: 'DevOps Engineer',
    company: { name: 'Cloud Solutions', logo: '/logo4.png' },
    location: 'Remote',
    salary: '18000 - 25000 SAR',
    type: 'Full-time',
    description: 'Manage and optimize our cloud infrastructure...',
    tags: ['AWS', 'Docker', 'Kubernetes']
  },
  {
    id: 5,
    title: 'Mobile Developer',
    company: { name: 'App Factory', logo: '/logo5.png' },
    location: 'Cairo, Egypt',
    salary: '8000 - 12000 EGP',
    type: 'Full-time',
    description: 'Build amazing mobile applications for iOS and Android...',
    tags: ['React Native', 'Flutter', 'Mobile']
  },
  {
    id: 6,
    title: 'Data Scientist',
    company: { name: 'AI Research', logo: '/logo6.png' },
    location: 'Riyadh, Saudi Arabia',
    salary: '20000 - 30000 SAR',
    type: 'Full-time',
    description: 'Analyze data and build machine learning models...',
    tags: ['Python', 'TensorFlow', 'Data Analysis']
  }
];

const SmoothTransitionExample = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  // Simulate loading data
  useEffect(() => {
    // Show skeleton for 2 seconds
    const timer = setTimeout(() => {
      setJobs(mockJobs);
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Function to render job card based on view
  const renderJobCard = (job, view) => {
    if (view === 'grid') {
      return <JobCardGrid key={job.id} job={job} />;
    }
    return <JobCardList key={job.id} job={job} />;
  };

  // Function to reload (for testing)
  const handleReload = () => {
    setLoading(true);
    setJobs([]);
    
    setTimeout(() => {
      setJobs(mockJobs);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Smooth Transition Example
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This example demonstrates the smooth transition from skeleton loaders to actual content.
            The transition includes:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mb-4">
            <li>Fade-in animation (300ms)</li>
            <li>Staggered appearance of cards (50ms delay between each)</li>
            <li>Shimmer effect on skeleton loaders</li>
            <li>No layout shifts (CLS = 0)</li>
            <li>Smooth view toggle (Grid ↔ List)</li>
          </ul>
          
          <button
            onClick={handleReload}
            className="px-6 py-3 bg-[#D48161] hover:bg-[#c07050] text-white rounded-lg transition-colors duration-200"
          >
            Reload to See Transition Again
          </button>
        </div>

        <JobsContainer
          jobs={jobs}
          loading={loading}
          renderJobCard={renderJobCard}
          skeletonCount={6}
          className="jobs-container"
        />
      </div>
    </div>
  );
};

export default SmoothTransitionExample;
