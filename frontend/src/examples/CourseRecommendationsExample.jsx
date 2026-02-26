import React from 'react';
import CourseRecommendationsDashboard from '../components/CourseRecommendationsDashboard';
import './CourseRecommendationsExample.css';

/**
 * Course Recommendations Example
 * 
 * This example demonstrates how to use the CourseRecommendationsDashboard component
 * with level filtering functionality.
 * 
 * Features demonstrated:
 * 1. Displaying course recommendations with match scores
 * 2. Level filtering (beginner, intermediate, advanced)
 * 3. Employment improvement predictions
 * 4. Learning path visualization
 * 5. Multi-language support (ar, en, fr)
 * 
 * Task: 14.4 Courses Recommendations
 * Requirements: 2.1, 2.3
 */

const CourseRecommendationsExample = () => {
  return (
    <div className="course-recommendations-example">
      <header className="example-header">
        <h1>Course Recommendations Dashboard Example</h1>
        <p className="example-description">
          This component displays AI-recommended courses with level filtering capabilities.
          Users can filter courses by level (beginner, intermediate, advanced) to find
          courses that match their skill level.
        </p>
      </header>

      <div className="example-content">
        <section className="example-section">
          <h2>Component Features</h2>
          <ul className="features-list">
            <li>
              <strong>Level Filtering:</strong> Filter courses by beginner, intermediate, or advanced levels
            </li>
            <li>
              <strong>Match Scores:</strong> Visual percentage scores showing how well each course matches user skills
            </li>
            <li>
              <strong>Employment Improvement:</strong> Predicted improvement in job opportunities after completing each course
            </li>
            <li>
              <strong>Skill Coverage:</strong> Display of skills covered by each course
            </li>
            <li>
              <strong>Learning Paths:</strong> Visual timeline showing course progression
            </li>
            <li>
              <strong>Multi-language Support:</strong> Full support for Arabic, English, and French
            </li>
            <li>
              <strong>Responsive Design:</strong> Works on all device sizes
            </li>
            <li>
              <strong>Dark Mode:</strong> Automatic dark mode support
            </li>
          </ul>
        </section>

        <section className="example-section">
          <h2>Usage Instructions</h2>
          <div className="usage-instructions">
            <h3>Basic Usage:</h3>
            <pre className="code-block">
{`import CourseRecommendationsDashboard from './components/CourseRecommendationsDashboard';

function MyPage() {
  return (
    <div>
      <h1>My Learning Dashboard</h1>
      <CourseRecommendationsDashboard />
    </div>
  );
}`}
            </pre>

            <h3>Level Filtering:</h3>
            <p>
              The component includes built-in level filtering. Users can:
            </p>
            <ol>
              <li>Click "All Levels" to see all courses</li>
              <li>Click "Beginner" to see only beginner-level courses</li>
              <li>Click "Intermediate" to see only intermediate-level courses</li>
              <li>Click "Advanced" to see only advanced-level courses</li>
              <li>Use the "Reset Filters" button to clear level filters</li>
            </ol>

            <h3>API Integration:</h3>
            <p>
              The component expects the following API response structure:
            </p>
            <pre className="code-block">
{`{
  "success": true,
  "courseRecommendations": [
    {
      "id": "course-1",
      "title": "React Fundamentals",
      "description": "Learn React basics",
      "level": "beginner", // or "intermediate", "advanced"
      "matchScore": 85, // 0-100
      "employmentImprovement": { "percentage": 30 },
      "skills": ["JavaScript", "React", "HTML"],
      "duration": "4 weeks",
      "priority": "high", // or "medium", "low"
      "category": "Web Development",
      "learningPath": [
        {
          "week": 1,
          "title": "Introduction to React",
          "skills": ["JSX", "Components", "Props"]
        }
      ]
    }
  ]
}`}
            </pre>
          </div>
        </section>

        <section className="example-section">
          <h2>Live Demo</h2>
          <div className="live-demo">
            <div className="demo-note">
              <p>
                <strong>Note:</strong> This is a live demo of the component. The component will attempt to fetch
                real course recommendations from the API. If the API is not available, it will show cached data
                or an error state.
              </p>
            </div>
            
            <div className="component-container">
              <CourseRecommendationsDashboard />
            </div>
          </div>
        </section>

        <section className="example-section">
          <h2>Accessibility Features</h2>
          <ul className="accessibility-features">
            <li>Proper ARIA labels for all interactive elements</li>
            <li>Keyboard navigation support for filter buttons</li>
            <li>Screen reader announcements for loading states and errors</li>
            <li>High contrast color schemes for better visibility</li>
            <li>Focus indicators for all interactive elements</li>
            <li>Semantic HTML structure for better screen reader navigation</li>
          </ul>
        </section>

        <section className="example-section">
          <h2>Testing</h2>
          <p>
            The component includes comprehensive tests covering:
          </p>
          <ul>
            <li>Rendering and basic functionality</li>
            <li>Level filtering logic</li>
            <li>Error handling and fallback states</li>
            <li>Accessibility compliance</li>
            <li>Responsive behavior</li>
          </ul>
          <p>
            Run tests with: <code>npm test -- course-recommendations.test.jsx</code>
          </p>
        </section>
      </div>

      <footer className="example-footer">
        <p>
          <strong>Task:</strong> 14.4 Courses Recommendations<br />
          <strong>Requirements:</strong> 2.1 (Skill gap analysis), 2.3 (Employment improvement prediction)<br />
          <strong>Component:</strong> CourseRecommendationsDashboard.jsx<br />
          <strong>CSS:</strong> CourseRecommendationsDashboard.css<br />
          <strong>Tests:</strong> course-recommendations.test.jsx
        </p>
      </footer>
    </div>
  );
};

export default CourseRecommendationsExample;