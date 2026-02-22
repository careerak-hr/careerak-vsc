/**
 * Image Placeholder Demo
 * 
 * This file demonstrates the various placeholder states of the LazyImage component.
 * 
 * **Validates: Requirements FR-LOAD-6**
 * 
 * FR-LOAD-6: When images are loading, the system shall display a placeholder with loading animation.
 */

import React, { useState } from 'react';
import LazyImage from '../components/LazyImage/LazyImage';

const ImagePlaceholderDemo = () => {
  const [showDemo, setShowDemo] = useState(true);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#304B60' }}>
        Image Placeholder Demo
      </h1>

      <p style={{ marginBottom: '2rem', color: '#666' }}>
        This demo showcases the various placeholder states of the LazyImage component,
        fulfilling requirement FR-LOAD-6: "When images are loading, the system shall 
        display a placeholder with loading animation."
      </p>

      {/* Demo 1: Standard Placeholder with Blur-Up */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#304B60' }}>
          1. Standard Placeholder with Blur-Up Effect
        </h2>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          Shows a low-resolution blurred version while the full image loads.
        </p>
        <div style={{ 
          width: '400px', 
          height: '300px',
          border: '2px solid #D48161',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <LazyImage
            publicId="sample/profile-image"
            alt="Profile with blur-up placeholder"
            width={400}
            height={300}
            placeholder={true}
            showSpinner={true}
          />
        </div>
      </section>

      {/* Demo 2: Placeholder with Spinner Only */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#304B60' }}>
          2. Placeholder with Loading Spinner
        </h2>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          Shows a centered spinner while the image loads.
        </p>
        <div style={{ 
          width: '300px', 
          height: '300px',
          border: '2px solid #D48161',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <LazyImage
            publicId="sample/company-logo"
            alt="Company logo with spinner"
            width={300}
            height={300}
            placeholder={false}
            showSpinner={true}
          />
        </div>
      </section>

      {/* Demo 3: Empty Placeholder (No Image) */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#304B60' }}>
          3. Empty Placeholder (No Image Provided)
        </h2>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          Shows a camera icon when no image is provided.
        </p>
        <div style={{ 
          width: '200px', 
          height: '200px',
          border: '2px solid #D48161',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <LazyImage
            publicId=""
            alt="Empty placeholder"
            width={200}
            height={200}
          />
        </div>
      </section>

      {/* Demo 4: Error Placeholder with Retry */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#304B60' }}>
          4. Error Placeholder with Retry Button
        </h2>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          Shows an error state with a retry button when image fails to load.
        </p>
        <div style={{ 
          width: '400px', 
          height: '300px',
          border: '2px solid #D48161',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <LazyImage
            publicId="nonexistent/image"
            alt="Error placeholder demo"
            width={400}
            height={300}
            showRetry={true}
            errorMessage="Failed to load image. Please try again."
          />
        </div>
      </section>

      {/* Demo 5: Multiple Images with Staggered Loading */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#304B60' }}>
          5. Multiple Images with Placeholders
        </h2>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          Demonstrates how placeholders work with multiple images loading independently.
        </p>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div 
              key={num}
              style={{ 
                border: '2px solid #D48161',
                borderRadius: '8px',
                overflow: 'hidden',
                aspectRatio: '1'
              }}
            >
              <LazyImage
                publicId={`sample/image-${num}`}
                alt={`Sample image ${num}`}
                preset="THUMBNAIL_MEDIUM"
                placeholder={true}
                showSpinner={true}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Demo 6: Responsive Images with Placeholders */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#304B60' }}>
          6. Responsive Image with Placeholder
        </h2>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          Placeholder maintains aspect ratio across different screen sizes.
        </p>
        <div style={{ 
          width: '100%', 
          maxWidth: '800px',
          border: '2px solid #D48161',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <LazyImage
            publicId="sample/banner-image"
            alt="Responsive banner with placeholder"
            responsive={true}
            placeholder={true}
            showSpinner={true}
          />
        </div>
      </section>

      {/* Demo 7: Profile Pictures with Placeholders */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#304B60' }}>
          7. Profile Pictures with Circular Placeholders
        </h2>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          Demonstrates placeholders with circular profile images.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {['small', 'medium', 'large'].map((size) => {
            const dimensions = size === 'small' ? 80 : size === 'medium' ? 120 : 160;
            return (
              <div 
                key={size}
                style={{ 
                  width: dimensions,
                  height: dimensions,
                  border: '2px solid #D48161',
                  borderRadius: '50%',
                  overflow: 'hidden'
                }}
              >
                <LazyImage
                  publicId={`sample/profile-${size}`}
                  alt={`${size} profile picture`}
                  width={dimensions}
                  height={dimensions}
                  preset={`PROFILE_${size.toUpperCase()}`}
                  placeholder={true}
                  showSpinner={true}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* Demo 8: Loading States Comparison */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#304B60' }}>
          8. Loading States Comparison
        </h2>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          Side-by-side comparison of different placeholder configurations.
        </p>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          {/* With Blur + Spinner */}
          <div>
            <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#666' }}>
              Blur + Spinner
            </h3>
            <div style={{ 
              border: '2px solid #D48161',
              borderRadius: '8px',
              overflow: 'hidden',
              aspectRatio: '4/3'
            }}>
              <LazyImage
                publicId="sample/demo-1"
                alt="Blur and spinner"
                placeholder={true}
                showSpinner={true}
              />
            </div>
          </div>

          {/* Spinner Only */}
          <div>
            <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#666' }}>
              Spinner Only
            </h3>
            <div style={{ 
              border: '2px solid #D48161',
              borderRadius: '8px',
              overflow: 'hidden',
              aspectRatio: '4/3'
            }}>
              <LazyImage
                publicId="sample/demo-2"
                alt="Spinner only"
                placeholder={false}
                showSpinner={true}
              />
            </div>
          </div>

          {/* Blur Only */}
          <div>
            <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#666' }}>
              Blur Only
            </h3>
            <div style={{ 
              border: '2px solid #D48161',
              borderRadius: '8px',
              overflow: 'hidden',
              aspectRatio: '4/3'
            }}>
              <LazyImage
                publicId="sample/demo-3"
                alt="Blur only"
                placeholder={true}
                showSpinner={false}
              />
            </div>
          </div>

          {/* No Placeholder */}
          <div>
            <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#666' }}>
              No Placeholder
            </h3>
            <div style={{ 
              border: '2px solid #D48161',
              borderRadius: '8px',
              overflow: 'hidden',
              aspectRatio: '4/3'
            }}>
              <LazyImage
                publicId="sample/demo-4"
                alt="No placeholder"
                placeholder={false}
                showSpinner={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section style={{ 
        marginTop: '3rem', 
        padding: '1.5rem', 
        backgroundColor: '#f3f4f6',
        borderRadius: '8px'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#304B60' }}>
          Technical Details
        </h2>
        <ul style={{ color: '#666', lineHeight: '1.8' }}>
          <li><strong>Requirement:</strong> FR-LOAD-6</li>
          <li><strong>Component:</strong> LazyImage</li>
          <li><strong>Location:</strong> frontend/src/components/LazyImage/</li>
          <li><strong>Placeholder Types:</strong> Initial, Blur-up, Spinner, Error, Empty</li>
          <li><strong>Animation Duration:</strong> 300ms fade transitions</li>
          <li><strong>Accessibility:</strong> ARIA labels, screen reader support</li>
          <li><strong>Performance:</strong> Lazy loading with Intersection Observer</li>
          <li><strong>Browser Support:</strong> Chrome 58+, Firefox 55+, Safari 12.1+, Edge 79+</li>
        </ul>
      </section>

      {/* Usage Code Example */}
      <section style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        backgroundColor: '#1f2937',
        borderRadius: '8px',
        color: '#e5e7eb'
      }}>
        <h2 style={{ marginBottom: '1rem', color: '#D48161' }}>
          Usage Example
        </h2>
        <pre style={{ 
          overflow: 'auto', 
          padding: '1rem',
          backgroundColor: '#111827',
          borderRadius: '4px',
          fontSize: '0.875rem'
        }}>
{`import LazyImage from '../components/LazyImage/LazyImage';

<LazyImage
  publicId="profile/user123"
  alt="User profile picture"
  width={400}
  height={400}
  placeholder={true}      // Enable blur-up placeholder
  showSpinner={true}      // Show loading spinner
  showRetry={true}        // Show retry button on error
  errorMessage="Failed"   // Custom error message
  onLoad={(e) => console.log('Loaded')}
  onError={(e, error) => console.error('Error:', error)}
/>`}
        </pre>
      </section>
    </div>
  );
};

export default ImagePlaceholderDemo;
