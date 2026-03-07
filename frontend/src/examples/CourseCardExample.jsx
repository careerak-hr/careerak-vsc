import React, { useState } from 'react';
import CourseCard from '../components/Courses/CourseCard';
import '../components/Courses/CourseCard.css';

/**
 * CourseCard Component Usage Examples
 * 
 * This file demonstrates various use cases for the CourseCard component.
 */

const CourseCardExample = () => {
  const [view, setView] = useState('grid');

  // Example courses with different configurations
  const courses = [
    // Popular paid course with all badges
    {
      _id: 'course1',
      title: 'Complete Web Development Bootcamp',
      description: 'Master web development from scratch with HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build real-world projects.',
      thumbnail: 'courses/web-dev-bootcamp.jpg',
      level: 'Beginner',
      totalDuration: 40,
      totalLessons: 120,
      price: {
        amount: 99.99,
        currency: 'USD',
        isFree: false
      },
      stats: {
        averageRating: 4.8,
        totalReviews: 2500,
        totalEnrollments: 15000
      },
      badges: [
        { type: 'most_popular', awardedAt: new Date() },
        { type: 'top_rated', awardedAt: new Date() },
        { type: 'recommended', awardedAt: new Date() }
      ]
    },

    // Free course with new badge
    {
      _id: 'course2',
      title: 'Introduction to Python Programming',
      description: 'Learn Python basics, data structures, and algorithms. Perfect for beginners starting their coding journey.',
      thumbnail: 'courses/python-intro.jpg',
      level: 'Beginner',
      totalDuration: 15,
      totalLessons: 45,
      price: {
        amount: 0,
        currency: 'USD',
        isFree: true
      },
      stats: {
        averageRating: 4.5,
        totalReviews: 850,
        totalEnrollments: 5000
      },
      badges: [
        { type: 'new', awardedAt: new Date() }
      ]
    },

    // Intermediate course with recommended badge
    {
      _id: 'course3',
      title: 'Advanced React Patterns and Best Practices',
      description: 'Deep dive into React hooks, context, performance optimization, and advanced patterns for building scalable applications.',
      thumbnail: 'courses/react-advanced.jpg',
      level: 'Intermediate',
      totalDuration: 25,
      totalLessons: 75,
      price: {
        amount: 79.99,
        currency: 'USD',
        isFree: false
      },
      stats: {
        averageRating: 4.7,
        totalReviews: 1200,
        totalEnrollments: 3500
      },
      badges: [
        { type: 'recommended', awardedAt: new Date() }
      ]
    },

    // Advanced course with top rated badge
    {
      _id: 'course4',
      title: 'Machine Learning and AI Fundamentals',
      description: 'Explore machine learning algorithms, neural networks, and AI concepts. Hands-on projects with Python and TensorFlow.',
      thumbnail: 'courses/ml-ai.jpg',
      level: 'Advanced',
      totalDuration: 50,
      totalLessons: 150,
      price: {
        amount: 149.99,
        currency: 'USD',
        isFree: false
      },
      stats: {
        averageRating: 4.9,
        totalReviews: 3200,
        totalEnrollments: 8000
      },
      badges: [
        { type: 'top_rated', awardedAt: new Date() }
      ]
    },

    // Course with no badges
    {
      _id: 'course5',
      title: 'Digital Marketing Essentials',
      description: 'Learn SEO, social media marketing, content strategy, and analytics to grow your online presence.',
      thumbnail: 'courses/digital-marketing.jpg',
      level: 'Beginner',
      totalDuration: 20,
      totalLessons: 60,
      price: {
        amount: 59.99,
        currency: 'USD',
        isFree: false
      },
      stats: {
        averageRating: 4.2,
        totalReviews: 450,
        totalEnrollments: 1200
      },
      badges: []
    },

    // Course with low rating
    {
      _id: 'course6',
      title: 'Basic Excel for Beginners',
      description: 'Master Excel basics including formulas, charts, and data analysis for everyday tasks.',
      thumbnail: 'courses/excel-basics.jpg',
      level: 'Beginner',
      totalDuration: 8,
      totalLessons: 30,
      price: {
        amount: 29.99,
        currency: 'USD',
        isFree: false
      },
      stats: {
        averageRating: 3.8,
        totalReviews: 120,
        totalEnrollments: 500
      },
      badges: []
    }
  ];

  return (
    <div style={{ padding: '40px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ 
          fontFamily: 'Amiri, Cairo, serif',
          color: '#304B60',
          marginBottom: '30px',
          fontSize: '32px'
        }}>
          CourseCard Component Examples
        </h1>

        {/* View Toggle */}
        <div style={{ marginBottom: '30px' }}>
          <button
            onClick={() => setView('grid')}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              background: view === 'grid' ? '#304B60' : '#E3DAD1',
              color: view === 'grid' ? 'white' : '#304B60',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Amiri, Cairo, serif',
              fontSize: '16px'
            }}
          >
            Grid View
          </button>
          <button
            onClick={() => setView('list')}
            style={{
              padding: '10px 20px',
              background: view === 'list' ? '#304B60' : '#E3DAD1',
              color: view === 'list' ? 'white' : '#304B60',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Amiri, Cairo, serif',
              fontSize: '16px'
            }}
          >
            List View
          </button>
        </div>

        {/* Grid View */}
        {view === 'grid' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {courses.map(course => (
              <CourseCard key={course._id} course={course} view="grid" />
            ))}
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {courses.map(course => (
              <CourseCard key={course._id} course={course} view="list" />
            ))}
          </div>
        )}

        {/* Usage Notes */}
        <div style={{
          marginTop: '60px',
          padding: '30px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            fontFamily: 'Amiri, Cairo, serif',
            color: '#304B60',
            marginBottom: '20px',
            fontSize: '24px'
          }}>
            Usage Notes
          </h2>

          <div style={{ lineHeight: '1.8', color: '#304B60' }}>
            <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>
              Basic Usage:
            </h3>
            <pre style={{
              background: '#f5f5f5',
              padding: '15px',
              borderRadius: '8px',
              overflow: 'auto'
            }}>
{`import CourseCard from './components/Courses/CourseCard';

<CourseCard course={courseData} view="grid" />`}
            </pre>

            <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>
              Props:
            </h3>
            <ul style={{ marginLeft: '20px' }}>
              <li><strong>course</strong> (required): Course object with all details</li>
              <li><strong>view</strong> (optional): "grid" or "list" (default: "grid")</li>
            </ul>

            <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>
              Features:
            </h3>
            <ul style={{ marginLeft: '20px' }}>
              <li>✅ Lazy loading for course thumbnails</li>
              <li>✅ Multiple badge types (most_popular, new, recommended, top_rated)</li>
              <li>✅ Rating stars with half-star support</li>
              <li>✅ Wishlist functionality with authentication</li>
              <li>✅ Grid and list view layouts</li>
              <li>✅ Multilingual support (ar, en, fr)</li>
              <li>✅ RTL support for Arabic</li>
              <li>✅ Responsive design (mobile, tablet, desktop)</li>
              <li>✅ Dark mode support</li>
              <li>✅ Accessibility compliant (ARIA labels, keyboard navigation)</li>
              <li>✅ Project color palette (#304B60, #E3DAD1, #D48161)</li>
              <li>✅ Project fonts (Amiri, Cairo)</li>
            </ul>

            <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>
              Course Object Structure:
            </h3>
            <pre style={{
              background: '#f5f5f5',
              padding: '15px',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '14px'
            }}>
{`{
  _id: 'course123',
  title: 'Course Title',
  description: 'Course description...',
  thumbnail: 'courses/image.jpg',
  level: 'Beginner' | 'Intermediate' | 'Advanced',
  totalDuration: 40, // hours
  totalLessons: 120,
  price: {
    amount: 99.99,
    currency: 'USD',
    isFree: false
  },
  stats: {
    averageRating: 4.8,
    totalReviews: 2500,
    totalEnrollments: 15000
  },
  badges: [
    { type: 'most_popular', awardedAt: Date },
    { type: 'new', awardedAt: Date },
    { type: 'recommended', awardedAt: Date },
    { type: 'top_rated', awardedAt: Date }
  ]
}`}
            </pre>

            <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>
              Responsive Breakpoints:
            </h3>
            <ul style={{ marginLeft: '20px' }}>
              <li><strong>Mobile:</strong> &lt; 640px (1 column, vertical layout)</li>
              <li><strong>Tablet:</strong> 640px - 1023px (2 columns in grid)</li>
              <li><strong>Desktop:</strong> ≥ 1024px (4 columns in grid)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCardExample;
