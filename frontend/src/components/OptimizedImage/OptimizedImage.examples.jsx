/**
 * OptimizedImage Component - Usage Examples
 * 
 * This file contains practical examples of how to use the OptimizedImage component
 * in different scenarios throughout the Careerak application.
 */

import React from 'react';
import OptimizedImage from './OptimizedImage';

/**
 * Example 1: Profile Picture
 * Use case: User profile pages, cards, avatars
 */
export const ProfilePictureExample = ({ user }) => (
  <div className="profile-card">
    <OptimizedImage
      publicId={user.profileImage}
      alt={`${user.name}'s profile picture`}
      preset="PROFILE_LARGE"
      className="rounded-full border-4 border-primary"
      loading="eager"
    />
    <h2>{user.name}</h2>
  </div>
);

/**
 * Example 2: Company Logo
 * Use case: Company profiles, job listings
 * Note: Use PNG fallback for logos with transparency
 */
export const CompanyLogoExample = ({ company }) => (
  <div className="company-header">
    <OptimizedImage
      publicId={company.logo}
      alt={`${company.name} logo`}
      preset="LOGO_MEDIUM"
      fallbackFormat="png"
      className="company-logo"
    />
    <h1>{company.name}</h1>
  </div>
);

/**
 * Example 3: Job Thumbnail
 * Use case: Job listings, course cards
 */
export const JobThumbnailExample = ({ job }) => (
  <div className="job-card">
    <OptimizedImage
      publicId={job.thumbnail}
      alt={job.title}
      preset="THUMBNAIL_MEDIUM"
      loading="lazy"
      placeholder={true}
      className="job-thumbnail"
    />
    <div className="job-details">
      <h3>{job.title}</h3>
      <p>{job.company}</p>
    </div>
  </div>
);

/**
 * Example 4: Hero Banner (Responsive)
 * Use case: Homepage hero, landing pages
 */
export const HeroBannerExample = () => (
  <section className="hero">
    <OptimizedImage
      publicId="hero/homepage-banner"
      alt="Welcome to Careerak - Your Career Platform"
      responsive={true}
      responsiveWidths={[768, 1024, 1920]}
      sizes="100vw"
      loading="eager"
      placeholder={true}
      className="hero-image"
    />
    <div className="hero-content">
      <h1>Find Your Dream Job</h1>
      <button>Get Started</button>
    </div>
  </section>
);

/**
 * Example 5: Gallery Grid (Responsive)
 * Use case: Image galleries, portfolios
 */
export const GalleryExample = ({ images }) => (
  <div className="gallery-grid">
    {images.map((image, index) => (
      <OptimizedImage
        key={image.id}
        publicId={image.publicId}
        alt={image.caption}
        preset="GALLERY_MEDIUM"
        responsive={true}
        responsiveWidths={[320, 640, 1024]}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        loading={index < 6 ? 'eager' : 'lazy'}
        placeholder={true}
        className="gallery-item"
      />
    ))}
  </div>
);

/**
 * Example 6: Course Card with Custom Dimensions
 * Use case: Course listings, educational content
 */
export const CourseCardExample = ({ course }) => (
  <div className="course-card">
    <OptimizedImage
      publicId={course.thumbnail}
      alt={course.title}
      width={600}
      height={400}
      loading="lazy"
      placeholder={true}
      className="course-thumbnail"
    />
    <div className="course-info">
      <h3>{course.title}</h3>
      <p>{course.instructor}</p>
      <span>{course.duration}</span>
    </div>
  </div>
);

/**
 * Example 7: User Avatar (Small)
 * Use case: Comments, chat messages, notifications
 */
export const UserAvatarExample = ({ user }) => (
  <div className="user-comment">
    <OptimizedImage
      publicId={user.profileImage}
      alt={user.name}
      preset="PROFILE_SMALL"
      className="avatar-small rounded-full"
      loading="lazy"
    />
    <div className="comment-content">
      <strong>{user.name}</strong>
      <p>{user.comment}</p>
    </div>
  </div>
);

/**
 * Example 8: Background Image (Full Width)
 * Use case: Section backgrounds, banners
 */
export const BackgroundImageExample = () => (
  <section className="about-section">
    <div className="background-wrapper">
      <OptimizedImage
        publicId="backgrounds/about-us"
        alt=""
        responsive={true}
        responsiveWidths={[768, 1024, 1920]}
        sizes="100vw"
        loading="lazy"
        placeholder={true}
        className="background-image"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1,
        }}
      />
    </div>
    <div className="content">
      <h2>About Us</h2>
      <p>Your career journey starts here...</p>
    </div>
  </section>
);

/**
 * Example 9: Product/Service Image
 * Use case: E-commerce, service listings
 */
export const ProductImageExample = ({ product }) => (
  <div className="product-card">
    <OptimizedImage
      publicId={product.image}
      alt={product.name}
      width={400}
      height={400}
      responsive={true}
      responsiveWidths={[320, 640, 800]}
      sizes="(max-width: 640px) 100vw, 400px"
      loading="lazy"
      placeholder={true}
      className="product-image"
    />
    <h3>{product.name}</h3>
    <p className="price">{product.price}</p>
  </div>
);

/**
 * Example 10: Certificate/Achievement Badge
 * Use case: User achievements, certifications
 */
export const CertificateBadgeExample = ({ certificate }) => (
  <div className="certificate-item">
    <OptimizedImage
      publicId={certificate.badgeImage}
      alt={`${certificate.name} certificate`}
      preset="LOGO_SMALL"
      fallbackFormat="png"
      className="certificate-badge"
    />
    <div className="certificate-details">
      <h4>{certificate.name}</h4>
      <p>{certificate.issuer}</p>
      <span>{certificate.date}</span>
    </div>
  </div>
);

/**
 * Example 11: With Error Handling
 * Use case: Handling missing or failed images
 */
export const WithErrorHandlingExample = ({ imageId }) => {
  const handleImageError = (error) => {
    console.error('Image failed to load:', error);
    // Track error in analytics
    // Show user-friendly message
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully');
    // Track successful load
  };

  return (
    <OptimizedImage
      publicId={imageId}
      alt="Content image"
      width={600}
      height={400}
      onError={handleImageError}
      onLoad={handleImageLoad}
      placeholder={true}
    />
  );
};

/**
 * Example 12: Conditional Rendering
 * Use case: Optional images, user-generated content
 */
export const ConditionalImageExample = ({ item }) => (
  <div className="item-card">
    {item.image ? (
      <OptimizedImage
        publicId={item.image}
        alt={item.title}
        preset="THUMBNAIL_MEDIUM"
        loading="lazy"
        placeholder={true}
      />
    ) : (
      <div className="placeholder-image">
        <span>📷</span>
        <p>No image available</p>
      </div>
    )}
    <h3>{item.title}</h3>
  </div>
);

/**
 * Example 13: List of Images (Optimized Loading)
 * Use case: Search results, feeds
 */
export const ImageListExample = ({ items }) => (
  <div className="items-list">
    {items.map((item, index) => (
      <div key={item.id} className="item">
        <OptimizedImage
          publicId={item.image}
          alt={item.title}
          preset="THUMBNAIL_SMALL"
          // Load first 3 eagerly, rest lazily
          loading={index < 3 ? 'eager' : 'lazy'}
          placeholder={true}
        />
        <h4>{item.title}</h4>
      </div>
    ))}
  </div>
);

/**
 * Example 14: Modal/Lightbox Image
 * Use case: Image previews, lightboxes
 */
export const ModalImageExample = ({ image, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <OptimizedImage
          publicId={image.publicId}
          alt={image.caption}
          responsive={true}
          responsiveWidths={[768, 1024, 1920]}
          sizes="90vw"
          loading="eager"
          placeholder={true}
          className="modal-image"
        />
        <p>{image.caption}</p>
      </div>
    </div>
  );
};

/**
 * Example 15: Comparison (Before/After)
 * Use case: Portfolio, transformations
 */
export const ComparisonExample = ({ beforeImage, afterImage }) => (
  <div className="comparison-container">
    <div className="comparison-side">
      <h4>Before</h4>
      <OptimizedImage
        publicId={beforeImage}
        alt="Before"
        width={400}
        height={300}
        loading="lazy"
        placeholder={true}
      />
    </div>
    <div className="comparison-side">
      <h4>After</h4>
      <OptimizedImage
        publicId={afterImage}
        alt="After"
        width={400}
        height={300}
        loading="lazy"
        placeholder={true}
      />
    </div>
  </div>
);

export default {
  ProfilePictureExample,
  CompanyLogoExample,
  JobThumbnailExample,
  HeroBannerExample,
  GalleryExample,
  CourseCardExample,
  UserAvatarExample,
  BackgroundImageExample,
  ProductImageExample,
  CertificateBadgeExample,
  WithErrorHandlingExample,
  ConditionalImageExample,
  ImageListExample,
  ModalImageExample,
  ComparisonExample,
};
