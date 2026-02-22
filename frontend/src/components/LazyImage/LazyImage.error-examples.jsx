/**
 * LazyImage Error Handling Examples
 * 
 * Demonstrates various error handling scenarios for the LazyImage component.
 * Shows how to use retry functionality, fallback images, and multi-language error messages.
 * 
 * Task: 8.3.4 Handle image load errors
 * Requirements: FR-LOAD-6
 */

import React from 'react';
import LazyImage from './LazyImage';
import { getImageErrorMessage } from '../../utils/imageErrorMessages';

/**
 * Example 1: Basic Error Handling with Retry
 */
export const BasicErrorExample = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Basic Error Handling</h2>
      <p>This image will fail to load and show a retry button</p>
      
      <LazyImage
        publicId="invalid/image/path"
        alt="This will fail"
        width={400}
        height={300}
        showRetry={true}
        onError={(e, errorDetails) => {
          console.log('Image failed to load:', errorDetails);
        }}
      />
    </div>
  );
};

/**
 * Example 2: Error with Fallback Image
 */
export const FallbackImageExample = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Fallback Image</h2>
      <p>If the primary image fails, a fallback image is shown</p>
      
      <LazyImage
        publicId="invalid/image/path"
        alt="Profile picture"
        width={200}
        height={200}
        fallbackImage="/default-avatar.png"
        showRetry={true}
      />
    </div>
  );
};

/**
 * Example 3: Multi-Language Error Messages
 */
export const MultiLanguageErrorExample = () => {
  const [language, setLanguage] = React.useState('en');
  
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Multi-Language Error Messages</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setLanguage('ar')}>العربية</button>
        <button onClick={() => setLanguage('en')}>English</button>
        <button onClick={() => setLanguage('fr')}>Français</button>
      </div>
      
      <LazyImage
        publicId="invalid/image/path"
        alt="Test image"
        width={400}
        height={300}
        errorMessage={getImageErrorMessage(language, 'loadFailed')}
        showRetry={true}
      />
    </div>
  );
};

/**
 * Example 4: Custom Error Handler
 */
export const CustomErrorHandlerExample = () => {
  const [errorCount, setErrorCount] = React.useState(0);
  
  const handleError = (e, errorDetails) => {
    setErrorCount(prev => prev + 1);
    console.error('Image error:', errorDetails);
    
    // Send to analytics or error tracking service
    // trackError('image_load_failed', errorDetails);
  };
  
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Custom Error Handler</h2>
      <p>Error count: {errorCount}</p>
      
      <LazyImage
        publicId="invalid/image/path"
        alt="Test image"
        width={400}
        height={300}
        onError={handleError}
        showRetry={true}
      />
    </div>
  );
};

/**
 * Example 5: Disable Error Logging
 */
export const NoLoggingExample = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Disable Error Logging</h2>
      <p>Errors won't be logged to console</p>
      
      <LazyImage
        publicId="invalid/image/path"
        alt="Test image"
        width={400}
        height={300}
        logErrors={false}
        showRetry={true}
      />
    </div>
  );
};

/**
 * Example 6: No Retry Button
 */
export const NoRetryExample = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>No Retry Button</h2>
      <p>Error state without retry option</p>
      
      <LazyImage
        publicId="invalid/image/path"
        alt="Test image"
        width={400}
        height={300}
        showRetry={false}
        errorMessage="This image is unavailable"
      />
    </div>
  );
};

/**
 * Example 7: Gallery with Error Handling
 */
export const GalleryWithErrorsExample = () => {
  const images = [
    { id: 'valid/image1', alt: 'Image 1' },
    { id: 'invalid/image2', alt: 'Image 2 (will fail)' },
    { id: 'valid/image3', alt: 'Image 3' },
    { id: 'invalid/image4', alt: 'Image 4 (will fail)' },
  ];
  
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Gallery with Mixed Success/Failure</h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
      }}>
        {images.map((image, index) => (
          <LazyImage
            key={index}
            publicId={image.id}
            alt={image.alt}
            width={200}
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
 * Example 8: Profile Picture with Fallback
 */
export const ProfilePictureExample = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Profile Picture with Fallback</h2>
      
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <LazyImage
          publicId="users/invalid-user-id"
          alt="User profile"
          preset="PROFILE_LARGE"
          fallbackImage="/default-avatar.png"
          showRetry={false}
          style={{ borderRadius: '50%' }}
        />
        
        <div>
          <h3>John Doe</h3>
          <p>Software Engineer</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Demo Component - Shows all examples
 */
const LazyImageErrorExamples = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1>LazyImage Error Handling Examples</h1>
      
      <BasicErrorExample />
      <hr />
      
      <FallbackImageExample />
      <hr />
      
      <MultiLanguageErrorExample />
      <hr />
      
      <CustomErrorHandlerExample />
      <hr />
      
      <NoLoggingExample />
      <hr />
      
      <NoRetryExample />
      <hr />
      
      <GalleryWithErrorsExample />
      <hr />
      
      <ProfilePictureExample />
    </div>
  );
};

export default LazyImageErrorExamples;
