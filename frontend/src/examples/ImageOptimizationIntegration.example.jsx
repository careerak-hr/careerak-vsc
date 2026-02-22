/**
 * Image Optimization Integration Examples
 * 
 * This file demonstrates how to integrate Cloudinary image optimization
 * across different use cases in the Careerak platform.
 * 
 * Task: 9.1.3 Integrate image optimization with Cloudinary
 * Requirements: FR-PERF-3, FR-PERF-4, IR-2
 * 
 * @example
 * // Import this file to see examples of proper image optimization usage
 * import './examples/ImageOptimizationIntegration.example';
 */

import React from 'react';
import LazyImage from '../components/LazyImage/LazyImage';
import { getOptimizedImageUrl, ImagePresets } from '../utils/imageOptimization';

/**
 * Example 1: Profile Picture with Lazy Loading
 * 
 * Use Case: User profile pictures in lists, cards, or profile pages
 * Benefits: Lazy loading, WebP format, face detection cropping
 */
export const ProfilePictureExample = ({ user }) => {
  return (
    <div className="profile-picture-container">
      <LazyImage
        publicId={user.profilePicture}
        alt={`${user.name}'s profile picture`}
        preset="PROFILE_MEDIUM"
        placeholder={true}
        className="rounded-full"
      />
    </div>
  );
};

/**
 * Example 2: Company Logo with Lazy Loading
 * 
 * Use Case: Company logos in job listings, company pages
 * Benefits: Lazy loading, WebP format, proper sizing
 */
export const CompanyLogoExample = ({ company }) => {
  return (
    <div className="company-logo-container">
      <LazyImage
        publicId={company.logo}
        alt={`${company.name} logo`}
        preset="LOGO_MEDIUM"
        placeholder={true}
        className="object-contain"
      />
    </div>
  );
};

/**
 * Example 3: Job Thumbnail with Responsive Images
 * 
 * Use Case: Job listing thumbnails, course images
 * Benefits: Lazy loading, responsive images, WebP format
 */
export const JobThumbnailExample = ({ job }) => {
  return (
    <div className="job-thumbnail-container">
      <LazyImage
        publicId={job.thumbnail}
        alt={`${job.title} at ${job.company}`}
        preset="THUMBNAIL_MEDIUM"
        placeholder={true}
        responsive={true}
        responsiveWidths={[320, 640, 1024]}
        className="w-full h-auto"
      />
    </div>
  );
};

/**
 * Example 4: Hero Image with Full Responsive Support
 * 
 * Use Case: Hero banners, full-width images
 * Benefits: Responsive images for all screen sizes, lazy loading
 */
export const HeroImageExample = ({ heroImage }) => {
  return (
    <div className="hero-image-container">
      <LazyImage
        publicId={heroImage.cloudinaryId}
        alt={heroImage.description}
        responsive={true}
        responsiveWidths={[768, 1024, 1920]}
        sizes="100vw"
        placeholder={true}
        className="w-full h-auto"
      />
    </div>
  );
};

/**
 * Example 5: Gallery Images with Custom Dimensions
 * 
 * Use Case: Image galleries, portfolios
 * Benefits: Custom sizing, lazy loading, blur-up placeholders
 */
export const GalleryImageExample = ({ images }) => {
  return (
    <div className="gallery-grid grid grid-cols-3 gap-4">
      {images.map((image, index) => (
        <LazyImage
          key={image.id}
          publicId={image.cloudinaryId}
          alt={image.description || `Gallery image ${index + 1}`}
          width={400}
          height={400}
          placeholder={true}
          className="rounded-lg"
        />
      ))}
    </div>
  );
};

/**
 * Example 6: Static Logo (No Cloudinary Needed)
 * 
 * Use Case: Static assets like app logo from /public folder
 * Note: Small static assets don't need Cloudinary optimization
 */
export const StaticLogoExample = () => {
  return (
    <div className="static-logo-container">
      {/* Static assets from /public folder can use regular img tag */}
      <img 
        src="/logo.jpg" 
        alt="Careerak logo - Professional HR platform" 
        className="w-32 h-32 object-cover rounded-full"
      />
    </div>
  );
};

/**
 * Example 7: Profile Image Upload Preview
 * 
 * Use Case: Image preview during upload before saving to Cloudinary
 * Note: Use regular img with blob URL for preview, LazyImage after upload
 */
export const ImageUploadPreviewExample = ({ previewUrl, uploadedImage }) => {
  return (
    <div className="image-upload-preview">
      {/* During upload - use blob URL */}
      {previewUrl && !uploadedImage && (
        <img 
          src={previewUrl} 
          alt="Upload preview" 
          className="w-full h-auto"
        />
      )}
      
      {/* After upload - use LazyImage with Cloudinary */}
      {uploadedImage && (
        <LazyImage
          publicId={uploadedImage.cloudinaryId}
          alt="Uploaded image"
          preset="PROFILE_LARGE"
          placeholder={true}
        />
      )}
    </div>
  );
};

/**
 * Example 8: Optimized URL for Background Images
 * 
 * Use Case: CSS background images, inline styles
 * Benefits: Optimized URL with f_auto, q_auto
 */
export const BackgroundImageExample = ({ backgroundImage }) => {
  const optimizedUrl = getOptimizedImageUrl(backgroundImage.cloudinaryId, {
    width: 1920,
    height: 1080,
  });

  return (
    <div 
      className="hero-section"
      style={{
        backgroundImage: `url(${optimizedUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <h1>Hero Content</h1>
    </div>
  );
};

/**
 * Example 9: Avatar List with Multiple Sizes
 * 
 * Use Case: User lists, comment sections, team pages
 * Benefits: Different sizes for different contexts
 */
export const AvatarListExample = ({ users }) => {
  return (
    <div className="avatar-list">
      {/* Small avatars for lists */}
      <div className="user-list">
        {users.map(user => (
          <LazyImage
            key={user.id}
            publicId={user.avatar}
            alt={user.name}
            preset="PROFILE_SMALL"
            placeholder={true}
            className="inline-block rounded-full"
          />
        ))}
      </div>
      
      {/* Large avatar for profile page */}
      <div className="profile-header">
        <LazyImage
          publicId={users[0].avatar}
          alt={users[0].name}
          preset="PROFILE_LARGE"
          placeholder={true}
          className="rounded-full"
        />
      </div>
    </div>
  );
};

/**
 * Example 10: Error Handling and Fallback
 * 
 * Use Case: Handling missing or failed images
 * Benefits: Graceful degradation, retry functionality
 */
export const ImageWithFallbackExample = ({ user }) => {
  return (
    <div className="image-with-fallback">
      <LazyImage
        publicId={user.profilePicture}
        alt={user.name}
        preset="PROFILE_MEDIUM"
        placeholder={true}
        fallbackImage="/default-avatar.png"
        showRetry={true}
        errorMessage="Failed to load profile picture"
        onError={(e, error) => {
          console.error('Image load error:', error);
          // Track error in analytics
        }}
      />
    </div>
  );
};

/**
 * Integration Checklist
 * 
 * ✅ Use LazyImage for all Cloudinary images
 * ✅ Use appropriate presets (PROFILE_*, LOGO_*, THUMBNAIL_*)
 * ✅ Enable placeholders for better UX
 * ✅ Use responsive images for large images
 * ✅ Provide descriptive alt text
 * ✅ Handle errors gracefully
 * ✅ Keep static assets as regular img tags
 * ✅ Use blob URLs for upload previews
 * ✅ Use getOptimizedImageUrl for background images
 * ✅ Test on slow networks (3G throttling)
 */

/**
 * Performance Checklist
 * 
 * ✅ All Cloudinary images use f_auto and q_auto
 * ✅ Images are lazy loaded (below the fold)
 * ✅ Responsive images use srcset
 * ✅ Blur-up placeholders for large images
 * ✅ Appropriate presets for use case
 * ✅ Images resized before upload (max 2000px)
 * ✅ Lighthouse Performance score 90+
 * ✅ CLS (Cumulative Layout Shift) < 0.1
 */

export default {
  ProfilePictureExample,
  CompanyLogoExample,
  JobThumbnailExample,
  HeroImageExample,
  GalleryImageExample,
  StaticLogoExample,
  ImageUploadPreviewExample,
  BackgroundImageExample,
  AvatarListExample,
  ImageWithFallbackExample,
};
