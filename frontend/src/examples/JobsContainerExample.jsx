import React, { useState, useEffect } from 'react';
import JobsContainer from '../components/JobsContainer';

/**
 * Example: JobsContainer with Grid/List Toggle and Skeleton Loading
 * 
 * This example demonstrates:
 * 1. Display 6-9 skeletons during loading (FR-LOAD-4)
 * 2. Smooth transition from skeleton to content (FR-LOAD-7: 300ms)
 * 3. Different skeleton for Grid/List views (FR-LOAD-6)
 * 4. No spinners - only skeleton loaders (FR-LOAD-7)
 * 5. View preference persistence (FR-VIEW-3)
 * 
 * Requirements:
 * - FR-LOAD-4: Display 6-9 skeletons during loading
 * - FR-LOAD-5: Smooth transition to actual content
 * - FR-LOAD-6: Different skeleton for Grid/List
 * - FR-LOAD-7: No spinners
 * - FR-VIEW-1: Toggle between Grid/List
 * - FR-VIEW-3: Save view preference
 */
const JobsContainerExample = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Simulate fetching jobs
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock job data
      const mockJobs = [
        {
          id: 1,
          title: 'Senior Frontend Developer',
          company: 'Tech Corp',
          location: 'Riyadh',
          salary: '80,000 - 120,000 SAR',
          description: 'We are looking for an experienced frontend developer...',
          tags: ['React', 'TypeScript', 'Tailwind'],
        },
        {
          id: 2,
          title: 'Backend Engineer',
          company: 'StartupXYZ',
          location: 'Dubai',
          salary: '90,000 - 130,000 AED',
          description: 'Join our team to build scalable backend systems...',
          tags: ['Node.js', 'MongoDB', 'AWS'],
        },
        {
          id: 3,
          title: 'Full Stack Developer',
          company: 'Innovation Labs',
          location: 'Jeddah',
          salary: '100,000 - 150,000 SAR',
          description: 'Seeking a versatile full stack developer...',
          tags: ['React', 'Node.js', 'PostgreSQL'],
        },
        {
          id: 4,
          title: 'DevOps Engineer',
          company: 'Cloud Solutions',
          location: 'Cairo',
          salary: '95,000 - 140,000 EGP',
          description: 'Looking for a DevOps engineer to manage our infrastructure...',
          tags: ['Docker', 'Kubernetes', 'CI/CD'],
        },
        {
          id: 5,
          title: 'UI/UX Designer',
          company: 'Design Studio',
          location: 'Doha',
          salary: '70,000 - 110,000 QAR',
          description: 'Creative UI/UX designer needed...',
          tags: ['Figma', 'Adobe XD', 'Prototyping'],
        },
        {
          id: 6,
          title: 'Product Manager',
          company: 'Product Co',
          location: 'Amman',
          salary: '110,000 - 160,000 JOD',
          description: 'Experienced product manager to lead product strategy...',
          tags: ['Agile', 'Roadmap', 'Analytics'],
        },
        {
          id: 7,
          title: 'Data Scientist',
          company: 'AI Labs',
          location: 'Riyadh',
          salary: '120,000 - 180,000 SAR',
          description: 'Data scientist to work on machine learning projects...',
          tags: ['Python', 'TensorFlow', 'ML'],
        },
        {
          id: 8,
          title: 'Mobile Developer',
          company: 'App Studio',
          location: 'Dubai',
          salary: '85,000 - 125,000 AED',
          description: 'Mobile developer for iOS and Android apps...',
          tags: ['React Native', 'Swift', 'Kotlin'],
        },
        {
          id: 9,
          title: 'Security Engineer',
          company: 'SecureTech',
          location: 'Jeddah',
          salary: '105,000 - 155,000 SAR',
          description: 'Security engineer to protect our systems...',
          tags: ['Security', 'Penetration Testing', 'SIEM'],
        },
      ];
      
      setJobs(mockJobs);
      setLoading(false);
    };
    
    fetchJobs();
  }, []);
  
  // Render job card based on view
  const renderJobCard = (job, view) => {
    if (view === 'grid') {
      return (
        <div
          key={job.id}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            {job.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-2">{job.company}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{job.location}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {job.tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#D48161] font-semibold">{job.salary}</span>
            <button className="px-4 py-2 bg-[#D48161] text-white rounded hover:bg-[#c07050] transition-colors">
              Apply
            </button>
          </div>
        </div>
      );
    }
    
    // List view
    return (
      <div
        key={job.id}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
      >
        <div className="flex gap-6">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              {job.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-2">{job.company}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{job.location}</p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{job.description}</p>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <span className="text-[#D48161] font-semibold whitespace-nowrap">{job.salary}</span>
            <button className="px-6 py-2 bg-[#D48161] text-white rounded hover:bg-[#c07050] transition-colors whitespace-nowrap">
              Apply Now
            </button>
            <button className="px-6 py-2 border border-[#D48161] text-[#D48161] rounded hover:bg-[#D48161] hover:text-white transition-colors whitespace-nowrap">
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Job Postings</h1>
      
      <JobsContainer
        jobs={jobs}
        loading={loading}
        renderJobCard={renderJobCard}
        skeletonCount={9}
        className="mt-6"
      />
    </div>
  );
};

export default JobsContainerExample;
