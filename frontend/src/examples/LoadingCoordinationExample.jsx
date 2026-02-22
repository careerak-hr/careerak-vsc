import React, { useState, useEffect } from 'react';
import { LoadingCoordinator, LoadingSection, useSimpleCoordination } from '../components/Loading/LoadingCoordinator';
import SkeletonLoader from '../components/SkeletonLoaders/SkeletonLoader';

/**
 * Example 1: Using LoadingCoordinator with Context
 * 
 * This example shows how to coordinate multiple loading states
 * across different sections of a page to prevent layout shifts.
 */
export const CoordinatedPageExample = () => {
  return (
    <LoadingCoordinator 
      onAllLoaded={() => console.log('All sections loaded!')}
      announceProgress={true}
    >
      {/* Header Section */}
      <LoadingSection id="header" minHeight="100px">
        {(loading, setLoading) => (
          <HeaderSection loading={loading} onLoad={() => setLoading(false)} />
        )}
      </LoadingSection>

      {/* Main Content Section */}
      <LoadingSection id="content" minHeight="400px">
        {(loading, setLoading) => (
          <ContentSection loading={loading} onLoad={() => setLoading(false)} />
        )}
      </LoadingSection>

      {/* Sidebar Section */}
      <LoadingSection id="sidebar" minHeight="300px">
        {(loading, setLoading) => (
          <SidebarSection loading={loading} onLoad={() => setLoading(false)} />
        )}
      </LoadingSection>

      {/* Footer Section */}
      <LoadingSection id="footer" minHeight="80px">
        {(loading, setLoading) => (
          <FooterSection loading={loading} onLoad={() => setLoading(false)} />
        )}
      </LoadingSection>
    </LoadingCoordinator>
  );
};

/**
 * Example 2: Using Simple Coordination Hook
 * 
 * For simpler cases where you don't need the full context API
 */
export const SimpleCoordinationExample = () => {
  const { sections, updateSection, allLoaded, loadingPercentage } = useSimpleCoordination([
    { id: 'header', minHeight: '100px', loading: true },
    { id: 'content', minHeight: '400px', loading: true },
    { id: 'footer', minHeight: '80px', loading: true },
  ]);

  // Simulate loading
  useEffect(() => {
    const timers = [
      setTimeout(() => updateSection('header', false), 1000),
      setTimeout(() => updateSection('content', false), 2000),
      setTimeout(() => updateSection('footer', false), 1500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [updateSection]);

  return (
    <div className="p-4">
      {/* Progress indicator */}
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">
          Loading Progress: {loadingPercentage}%
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#D48161] h-2 rounded-full transition-all duration-300"
            style={{ width: `${loadingPercentage}%` }}
          />
        </div>
      </div>

      {/* Sections */}
      {sections.map(section => (
        <div 
          key={section.id} 
          style={section.style}
          className="mb-4 border border-gray-200 rounded-lg p-4"
        >
          {section.loading ? (
            <SkeletonLoader type="card" />
          ) : (
            <div>
              <h3 className="text-lg font-bold mb-2">
                {section.id.charAt(0).toUpperCase() + section.id.slice(1)}
              </h3>
              <p>Content loaded successfully!</p>
            </div>
          )}
        </div>
      ))}

      {allLoaded && (
        <div className="text-green-600 font-bold">
          ✓ All sections loaded!
        </div>
      )}
    </div>
  );
};

/**
 * Example 3: Job Listings Page with Coordinated Loading
 * 
 * Real-world example showing how to coordinate loading states
 * in a job listings page with filters, list, and details
 */
export const JobListingsCoordinatedExample = () => {
  return (
    <LoadingCoordinator className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Filters Section */}
        <LoadingSection id="filters" minHeight="300px" className="lg:col-span-1">
          {(loading, setLoading) => (
            <FiltersSection loading={loading} onLoad={() => setLoading(false)} />
          )}
        </LoadingSection>

        {/* Job List Section */}
        <LoadingSection id="job-list" minHeight="600px" className="lg:col-span-2">
          {(loading, setLoading) => (
            <JobListSection loading={loading} onLoad={() => setLoading(false)} />
          )}
        </LoadingSection>
      </div>

      {/* Featured Jobs Section */}
      <LoadingSection id="featured" minHeight="200px" className="mt-4">
        {(loading, setLoading) => (
          <FeaturedJobsSection loading={loading} onLoad={() => setLoading(false)} />
        )}
      </LoadingSection>
    </LoadingCoordinator>
  );
};

// Helper Components

const HeaderSection = ({ loading, onLoad }) => {
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(onLoad, 800);
    return () => clearTimeout(timer);
  }, [onLoad]);

  if (loading) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <SkeletonLoader type="text" width="200px" height="32px" />
      </div>
    );
  }

  return (
    <header className="bg-[#304B60] text-white p-4 rounded-lg">
      <h1 className="text-2xl font-bold">Page Header</h1>
    </header>
  );
};

const ContentSection = ({ loading, onLoad }) => {
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(onLoad, 1500);
    return () => clearTimeout(timer);
  }, [onLoad]);

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader type="card" />
        <SkeletonLoader type="card" />
        <SkeletonLoader type="card" />
      </div>
    );
  }

  return (
    <main className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Main Content</h2>
        <p>This is the main content area. It loaded without causing layout shifts!</p>
      </div>
    </main>
  );
};

const SidebarSection = ({ loading, onLoad }) => {
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(onLoad, 1200);
    return () => clearTimeout(timer);
  }, [onLoad]);

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader type="card" height="100px" />
        <SkeletonLoader type="card" height="100px" />
      </div>
    );
  }

  return (
    <aside className="space-y-4">
      <div className="bg-[#E3DAD1] p-4 rounded-lg">
        <h3 className="font-bold mb-2">Sidebar Widget 1</h3>
        <p>Sidebar content</p>
      </div>
      <div className="bg-[#E3DAD1] p-4 rounded-lg">
        <h3 className="font-bold mb-2">Sidebar Widget 2</h3>
        <p>More sidebar content</p>
      </div>
    </aside>
  );
};

const FooterSection = ({ loading, onLoad }) => {
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(onLoad, 600);
    return () => clearTimeout(timer);
  }, [onLoad]);

  if (loading) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <SkeletonLoader type="text" width="150px" height="20px" />
      </div>
    );
  }

  return (
    <footer className="bg-[#304B60] text-white p-4 rounded-lg text-center">
      <p>© 2026 Careerak. All rights reserved.</p>
    </footer>
  );
};

const FiltersSection = ({ loading, onLoad }) => {
  useEffect(() => {
    const timer = setTimeout(onLoad, 1000);
    return () => clearTimeout(timer);
  }, [onLoad]);

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <SkeletonLoader type="text" width="100%" height="40px" />
        <SkeletonLoader type="text" width="100%" height="40px" />
        <SkeletonLoader type="text" width="100%" height="40px" />
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-bold mb-4">Filters</h3>
      <div className="space-y-2">
        <button className="w-full text-left p-2 hover:bg-gray-100 rounded">Location</button>
        <button className="w-full text-left p-2 hover:bg-gray-100 rounded">Job Type</button>
        <button className="w-full text-left p-2 hover:bg-gray-100 rounded">Salary Range</button>
      </div>
    </div>
  );
};

const JobListSection = ({ loading, onLoad }) => {
  useEffect(() => {
    const timer = setTimeout(onLoad, 1800);
    return () => clearTimeout(timer);
  }, [onLoad]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <SkeletonLoader key={i} type="card" height="120px" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-bold">Job Title {i}</h4>
          <p className="text-sm text-gray-600">Company Name</p>
          <p className="text-sm mt-2">Job description goes here...</p>
        </div>
      ))}
    </div>
  );
};

const FeaturedJobsSection = ({ loading, onLoad }) => {
  useEffect(() => {
    const timer = setTimeout(onLoad, 1300);
    return () => clearTimeout(timer);
  }, [onLoad]);

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <SkeletonLoader type="card" height="150px" />
      </div>
    );
  }

  return (
    <div className="bg-[#D48161] text-white p-6 rounded-lg">
      <h3 className="text-xl font-bold mb-4">Featured Jobs</h3>
      <p>Check out these amazing opportunities!</p>
    </div>
  );
};

export default {
  CoordinatedPageExample,
  SimpleCoordinationExample,
  JobListingsCoordinatedExample,
};
