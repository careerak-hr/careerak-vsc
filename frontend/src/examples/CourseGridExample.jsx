import React, { useState, useEffect } from 'react';
import CourseGrid from '../components/Courses/CourseGrid';

/**
 * CourseGrid Component Example
 * 
 * This example demonstrates how to use the CourseGrid component
 * with different states and configurations.
 */

const CourseGridExample = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');

  // Mock courses data
  const mockCourses = [
    {
      _id: '1',
      title: 'JavaScript Fundamentals',
      description: 'Learn the basics of JavaScript programming',
      level: 'Beginner',
      totalDuration: 10,
      totalLessons: 25,
      thumbnail: 'courses/javascript-basics',
      price: { isFree: true },
      stats: {
        averageRating: 4.5,
        totalReviews: 150,
        totalEnrollments: 1200
      },
      badges: [{ type: 'most_popular' }]
    },
    {
      _id: '2',
      title: 'React Advanced Patterns',
      description: 'Master advanced React development techniques',
      level: 'Advanced',
      totalDuration: 20,
      totalLessons: 40,
      thumbnail: 'courses/react-advanced',
      price: { isFree: false, amount: 99, currency: 'USD' },
      stats: {
        averageRating: 4.8,
        totalReviews: 200,
        totalEnrollments: 800
      },
      badges: [{ type: 'top_rated' }, { type: 'recommended' }]
    },
    {
      _id: '3',
      title: 'Node.js Backend Development',
      description: 'Build scalable backend applications with Node.js',
      level: 'Intermediate',
      totalDuration: 15,
      totalLessons: 30,
      thumbnail: 'courses/nodejs-backend',
      price: { isFree: false, amount: 79, currency: 'USD' },
      stats: {
        averageRating: 4.6,
        totalReviews: 120,
        totalEnrollments: 600
      },
      badges: [{ type: 'new' }]
    },
    {
      _id: '4',
      title: 'MongoDB Database Design',
      description: 'Learn database design and optimization with MongoDB',
      level: 'Intermediate',
      totalDuration: 12,
      totalLessons: 28,
      thumbnail: 'courses/mongodb-design',
      price: { isFree: true },
      stats: {
        averageRating: 4.4,
        totalReviews: 90,
        totalEnrollments: 500
      },
      badges: []
    }
  ];

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setCourses(mockCourses);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Listen for clear filters event
  useEffect(() => {
    const handleClearFilters = () => {
      console.log('Clear filters event received');
      // Reset filters logic here
    };

    window.addEventListener('clearFilters', handleClearFilters);
    return () => window.removeEventListener('clearFilters', handleClearFilters);
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>
        CourseGrid Component Examples
      </h1>

      {/* View Toggle */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <button
          onClick={() => setView('grid')}
          style={{
            padding: '0.5rem 1rem',
            marginRight: '1rem',
            backgroundColor: view === 'grid' ? '#D48161' : '#E3DAD1',
            color: view === 'grid' ? 'white' : '#304B60',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Grid View
        </button>
        <button
          onClick={() => setView('list')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: view === 'list' ? '#D48161' : '#E3DAD1',
            color: view === 'list' ? 'white' : '#304B60',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          List View
        </button>
      </div>

      {/* Example 1: Loading State */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>Example 1: Loading State</h2>
        <CourseGrid courses={[]} loading={true} view={view} />
      </section>

      {/* Example 2: Empty State */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>Example 2: Empty State (No Courses)</h2>
        <CourseGrid courses={[]} loading={false} view={view} />
      </section>

      {/* Example 3: Grid View with Courses */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>Example 3: Courses in {view === 'grid' ? 'Grid' : 'List'} View</h2>
        <CourseGrid courses={courses} loading={loading} view={view} />
      </section>

      {/* Example 4: Single Course */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>Example 4: Single Course</h2>
        <CourseGrid courses={[mockCourses[0]]} loading={false} view={view} />
      </section>

      {/* Responsive Behavior Notes */}
      <section style={{ marginTop: '3rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <h3>Responsive Behavior:</h3>
        <ul>
          <li><strong>Mobile (&lt; 640px):</strong> 1 column</li>
          <li><strong>Tablet (640px - 1023px):</strong> 2 columns (grid view)</li>
          <li><strong>Desktop (≥ 1024px):</strong> 4 columns (grid view)</li>
          <li><strong>List View:</strong> Always 1 column on all devices</li>
        </ul>
      </section>
    </div>
  );
};

export default CourseGridExample;
