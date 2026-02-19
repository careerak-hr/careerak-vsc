/**
 * LazyImage Component Examples
 * 
 * Demonstrates various use cases of the LazyImage component.
 * This file is for documentation and testing purposes.
 */

import React from 'react';
import LazyImage from './LazyImage';

/**
 * Example 1: Basic Usage
 * Simple lazy-loaded image with default settings
 */
export const BasicExample = () => (
  <LazyImage
    publicId="sample/profile-photo"
    alt="User profile photo"
    width={400}
    height={400}
  />
);

/**
 * Example 2: With Preset
 * Using predefined image preset for consistent sizing
 */
export const PresetExample = () => (
  <LazyImage
    publicId="sample/profile-photo"
    alt="User profile photo"
    preset="PROFILE_LARGE"
  />
);

/**
 * Example 3: Responsive Image
 * Image that adapts to different screen sizes
 */
export const ResponsiveExample = () => (
  <LazyImage
    publicId="sample/banner"
    alt="Banner image"
    responsive={true}
    responsiveWidths={[320, 640, 768, 1024, 1280, 1920]}
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  />
);

/**
 * Example 4: Without Placeholder
 * Lazy image without blur-up placeholder
 */
export const NoPlaceholderExample = () => (
  <LazyImage
    publicId="sample/photo"
    alt="Photo"
    width={300}
    height={300}
    placeholder={false}
  />
);

/**
 * Example 5: Custom Intersection Observer Settings
 * Load image earlier with custom rootMargin
 */
export const CustomObserverExample = () => (
  <LazyImage
    publicId="sample/photo"
    alt="Photo"
    width={300}
    height={300}
    threshold={0.5}
    rootMargin="200px"
  />
);

/**
 * Example 6: With Event Handlers
 * Handle load and error events
 */
export const WithHandlersExample = () => (
  <LazyImage
    publicId="sample/photo"
    alt="Photo"
    width={300}
    height={300}
    onLoad={(e) => console.log('Image loaded:', e)}
    onError={(e) => console.error('Image failed to load:', e)}
  />
);

/**
 * Example 7: PNG Fallback
 * Use PNG instead of JPEG as fallback format
 */
export const PngFallbackExample = () => (
  <LazyImage
    publicId="sample/logo"
    alt="Company logo"
    width={200}
    height={200}
    fallbackFormat="png"
  />
);

/**
 * Example 8: Without Spinner
 * Hide loading spinner
 */
export const NoSpinnerExample = () => (
  <LazyImage
    publicId="sample/photo"
    alt="Photo"
    width={300}
    height={300}
    showSpinner={false}
  />
);

/**
 * Example 9: Grid of Lazy Images
 * Multiple images that load as they enter viewport
 */
export const GridExample = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
      <LazyImage
        key={num}
        publicId={`sample/photo-${num}`}
        alt={`Photo ${num}`}
        width={300}
        height={300}
      />
    ))}
  </div>
);

/**
 * Example 10: Long Page with Many Images
 * Demonstrates performance benefit of lazy loading
 */
export const LongPageExample = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    {Array.from({ length: 20 }, (_, i) => (
      <div key={i} style={{ marginBottom: '100vh' }}>
        <h2>Section {i + 1}</h2>
        <LazyImage
          publicId={`sample/section-${i + 1}`}
          alt={`Section ${i + 1} image`}
          width={800}
          height={400}
        />
      </div>
    ))}
  </div>
);

/**
 * Example 11: Custom Styling
 * LazyImage with custom CSS classes and styles
 */
export const CustomStyledExample = () => (
  <LazyImage
    publicId="sample/photo"
    alt="Photo"
    width={400}
    height={400}
    className="custom-image-class"
    style={{
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }}
  />
);

/**
 * Example 12: Error Handling
 * Image with invalid publicId to demonstrate error state
 */
export const ErrorExample = () => (
  <LazyImage
    publicId="invalid/nonexistent-image"
    alt="This will fail to load"
    width={300}
    height={300}
  />
);

/**
 * Example 13: No PublicId
 * Demonstrates placeholder when no image is provided
 */
export const NoPublicIdExample = () => (
  <LazyImage
    publicId=""
    alt="No image"
    width={300}
    height={300}
  />
);

/**
 * Complete Demo Page
 * Shows all examples together
 */
export const DemoPage = () => (
  <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
    <h1>LazyImage Component Examples</h1>
    
    <section style={{ marginBottom: '3rem' }}>
      <h2>Basic Usage</h2>
      <BasicExample />
    </section>

    <section style={{ marginBottom: '3rem' }}>
      <h2>With Preset</h2>
      <PresetExample />
    </section>

    <section style={{ marginBottom: '3rem' }}>
      <h2>Responsive Image</h2>
      <ResponsiveExample />
    </section>

    <section style={{ marginBottom: '3rem' }}>
      <h2>Custom Styled</h2>
      <CustomStyledExample />
    </section>

    <section style={{ marginBottom: '3rem' }}>
      <h2>Grid of Images</h2>
      <GridExample />
    </section>

    <section style={{ marginBottom: '3rem' }}>
      <h2>Error State</h2>
      <ErrorExample />
    </section>

    <section style={{ marginBottom: '3rem' }}>
      <h2>No Image Placeholder</h2>
      <NoPublicIdExample />
    </section>
  </div>
);

export default DemoPage;
