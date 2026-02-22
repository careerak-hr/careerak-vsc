/**
 * OptimizedImage Error Handling Examples
 * 
 * Demonstrates error handling for the OptimizedImage component.
 * Shows retry functionality, fallback images, and error messages.
 * 
 * Task: 8.3.4 Handle image load errors
 * Requirements: FR-LOAD-6, FR-PERF-3
 */

import React from 'react';
import OptimizedImage from './OptimizedImage';
import { getImageErrorMessage } from '../../utils/imageErrorMessages';

/**
 * Example 1: Basic Error with Retry
 */
export const BasicErrorExample = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Basic Error Handling</h2>
      
      <OptimizedImage
        publicId="invalid/image"
        alt="Failed image"
        width={400}
        height={300}
        showRetry={true}
      />
    </div>
  );
};

/**
 * Example 2: Company Logo with Fallback
 */
export const CompanyLogoExample = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Company Logo with Fallback</h2>
      
      <OptimizedImage
        publicId="companies/invalid-company"
        alt="Company logo"
        preset="LOGO_MEDIUM"
        fallbackImage="/default-company-logo.png"
        showRetry={false}
      />
    </div>
  );
};

/**
 * Example 3: Job Posting Thumbnail
 */
export const JobThumbnailExample = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Job Posting Thumbnail</h2>
      
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1rem',
        maxWidth: '400px',
      }}>
        <OptimizedImage
          publicId="jobs/invalid-job-image"
          alt="Job posting"
          preset="THUMBNAIL_MEDIUM"
          fallbackImage="/default-job-thumbnail.png"
          showRetry={true}
          errorMessage="Unable to load job image"
        />
        
        <h3 style={{ marginTop: '1rem' }}>Software Engineer</h3>
        <p>Tech Company Inc.</p>
      </div>
    </div>
  );
};

/**
 * Example 4: Course Card with Error
 */
export const CourseCardExample = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Course Card with Error Handling</h2>
      
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        maxWidth: '350px',
      }}>
        <OptimizedImage
          publicId="courses/invalid-course"
          alt="Course thumbnail"
          width={350}
          height={200}
          fallbackImage="/default-course-thumbnail.png"
          showRetry={false}
        />
        
        <div style={{ padding: '1rem' }}>
          <h3>Web Development Bootcamp</h3>
          <p>Learn HTML, CSS, and JavaScript</p>
          <button style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#304B60',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}>
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Example 5: Responsive Image with Error
 */
export const ResponsiveErrorExample = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Responsive Image with Error</h2>
      
      <OptimizedImage
        publicId="invalid/responsive-image"
        alt="Responsive image"
        responsive={true}
        responsiveWidths={[320, 640, 1024]}
        showRetry={true}
        errorMessage="Failed to load responsive image"
      />
    </div>
  );
};

/**
 * Example 6: Multiple Images with Mixed Results
 */
export const MultipleImagesExample = () => {
  const images = [
    { id: 'valid/image1', alt: 'Success 1' },
    { id: 'invalid/image2', alt: 'Failure 1' },
    { id: 'valid/image3', alt: 'Success 2' },
    { id: 'invalid/image4', alt: 'Failure 2' },
  ];
  
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Multiple Images (Mixed Success/Failure)</h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
      }}>
        {images.map((image, index) => (
          <OptimizedImage
            key={index}
            publicId={image.id}
            alt={image.alt}
            width={300}
            height={200}
            showRetry={true}
            fallbackImage="/placeholder.png"
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Example 7: Custom Error Handler with Analytics
 */
export const AnalyticsErrorExample = () => {
  const [errors, setErrors] = React.useState([]);
  
  const handleError = (e, errorDetails) => {
    setErrors(prev => [...prev, errorDetails]);
    
    // Send to analytics
    console.log('Tracking error:', errorDetails);
  };
  
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Error Tracking Example</h2>
      
      <OptimizedImage
        publicId="invalid/tracked-image"
        alt="Tracked image"
        width={400}
        height={300}
        onError={handleError}
        showRetry={true}
      />
      
      {errors.length > 0 && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#fee2e2',
          borderRadius: '0.375rem',
        }}>
          <h3>Error Log:</h3>
          <pre>{JSON.stringify(errors, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

/**
 * Demo Component
 */
const OptimizedImageErrorExamples = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1>OptimizedImage Error Handling Examples</h1>
      
      <BasicErrorExample />
      <hr />
      
      <CompanyLogoExample />
      <hr />
      
      <JobThumbnailExample />
      <hr />
      
      <CourseCardExample />
      <hr />
      
      <ResponsiveErrorExample />
      <hr />
      
      <MultipleImagesExample />
      <hr />
      
      <AnalyticsErrorExample />
    </div>
  );
};

export default OptimizedImageErrorExamples;
