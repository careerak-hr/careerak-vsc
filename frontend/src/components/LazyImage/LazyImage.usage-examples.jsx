/**
 * LazyImage Real-World Usage Examples
 * 
 * This file demonstrates how to use LazyImage in actual application scenarios.
 * Use these examples when implementing job postings, courses, profiles, etc.
 */

import React from 'react';
import LazyImage from './LazyImage';

/**
 * Example 1: Job Posting Card
 * Use case: Job listings page with company logos
 */
export const JobPostingCard = ({ job }) => {
  return (
    <div className="job-card">
      <div className="job-card-header">
        <LazyImage
          publicId={job.companyLogo}
          alt={`${job.companyName} logo`}
          preset="LOGO_MEDIUM"
          placeholder={true}
          className="company-logo"
        />
        <div className="job-info">
          <h3>{job.title}</h3>
          <p>{job.companyName}</p>
        </div>
      </div>
      <div className="job-card-body">
        <p>{job.description}</p>
        <div className="job-meta">
          <span>{job.location}</span>
          <span>{job.salary}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Example 2: Course Card with Thumbnail
 * Use case: Courses page with course thumbnails
 */
export const CourseCard = ({ course }) => {
  return (
    <div className="course-card">
      <LazyImage
        publicId={course.thumbnail}
        alt={course.title}
        preset="THUMBNAIL_MEDIUM"
        placeholder={true}
        responsive={true}
        className="course-thumbnail"
      />
      <div className="course-details">
        <h3>{course.title}</h3>
        <p>{course.instructor}</p>
        <div className="course-meta">
          <span>{course.duration}</span>
          <span>{course.level}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Example 3: User Profile Header
 * Use case: Profile page with user avatar
 */
export const ProfileHeader = ({ user }) => {
  return (
    <div className="profile-header">
      <LazyImage
        publicId={user.profileImage}
        alt={`${user.firstName} ${user.lastName}`}
        preset="PROFILE_LARGE"
        placeholder={true}
        className="profile-avatar"
      />
      <div className="profile-info">
        <h1>{user.firstName} {user.lastName}</h1>
        <p>{user.title}</p>
        <p>{user.location}</p>
      </div>
    </div>
  );
};

/**
 * Example 4: Job Listings Grid
 * Use case: Multiple job cards with lazy loading
 * First 3 load eagerly, rest lazily for better UX
 */
export const JobListingsGrid = ({ jobs }) => {
  return (
    <div className="jobs-grid">
      {jobs.map((job, index) => (
        <div key={job._id} className="job-card">
          <LazyImage
            publicId={job.companyLogo}
            alt={`${job.companyName} logo`}
            preset="LOGO_MEDIUM"
            placeholder={true}
            // First 3 images load immediately for better perceived performance
            threshold={index < 3 ? 0 : 0.1}
            rootMargin={index < 3 ? '0px' : '50px'}
          />
          <div className="job-details">
            <h3>{job.title}</h3>
            <p>{job.companyName}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Example 5: Course Gallery
 * Use case: Responsive course thumbnails for different screen sizes
 */
export const CourseGallery = ({ courses }) => {
  return (
    <div className="course-gallery">
      {courses.map((course) => (
        <div key={course._id} className="course-item">
          <LazyImage
            publicId={course.thumbnail}
            alt={course.title}
            responsive={true}
            responsiveWidths={[320, 640, 768, 1024]}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            placeholder={true}
            className="course-image"
          />
          <h4>{course.title}</h4>
        </div>
      ))}
    </div>
  );
};

/**
 * Example 6: User Avatar (Small)
 * Use case: Comments, chat messages, notifications
 */
export const UserAvatar = ({ user, size = 'small' }) => {
  const preset = size === 'small' ? 'PROFILE_SMALL' : 
                 size === 'medium' ? 'PROFILE_MEDIUM' : 
                 'PROFILE_LARGE';

  return (
    <LazyImage
      publicId={user.profileImage}
      alt={user.firstName ? `${user.firstName} ${user.lastName}` : user.companyName}
      preset={preset}
      placeholder={true}
      className={`user-avatar user-avatar-${size}`}
    />
  );
};

/**
 * Example 7: Company Profile Banner
 * Use case: Company profile page with banner image
 */
export const CompanyBanner = ({ company }) => {
  return (
    <div className="company-profile">
      <LazyImage
        publicId={company.bannerImage}
        alt={`${company.name} banner`}
        preset="BANNER_LARGE"
        placeholder={true}
        responsive={true}
        className="company-banner"
      />
      <div className="company-info-overlay">
        <LazyImage
          publicId={company.logo}
          alt={`${company.name} logo`}
          preset="LOGO_LARGE"
          placeholder={true}
          className="company-logo"
        />
        <h1>{company.name}</h1>
      </div>
    </div>
  );
};

/**
 * Example 8: Image Gallery with Lightbox
 * Use case: Portfolio, project gallery
 */
export const ImageGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = React.useState(null);

  return (
    <>
      <div className="image-gallery-grid">
        {images.map((image, index) => (
          <button
            key={image._id}
            onClick={() => setSelectedImage(image)}
            className="gallery-item"
          >
            <LazyImage
              publicId={image.publicId}
              alt={image.alt}
              preset="THUMBNAIL_MEDIUM"
              placeholder={true}
              className="gallery-thumbnail"
            />
          </button>
        ))}
      </div>

      {selectedImage && (
        <div className="lightbox" onClick={() => setSelectedImage(null)}>
          <LazyImage
            publicId={selectedImage.publicId}
            alt={selectedImage.alt}
            preset="BANNER_LARGE"
            placeholder={true}
            className="lightbox-image"
          />
        </div>
      )}
    </>
  );
};

/**
 * Example 9: Conditional Image Loading
 * Use case: Load different image based on user role or state
 */
export const ConditionalImage = ({ user }) => {
  // If user has profile image, show it; otherwise show default
  const imagePublicId = user.profileImage || 'defaults/avatar-placeholder';

  return (
    <LazyImage
      publicId={imagePublicId}
      alt={user.firstName ? `${user.firstName} ${user.lastName}` : 'User'}
      preset="PROFILE_MEDIUM"
      placeholder={true}
      className="user-profile-image"
    />
  );
};

/**
 * Example 10: Error Handling
 * Use case: Handle image load errors gracefully
 */
export const ImageWithErrorHandling = ({ publicId, alt }) => {
  const [hasError, setHasError] = React.useState(false);

  const handleError = () => {
    console.error(`Failed to load image: ${publicId}`);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className="image-error-fallback">
        <span>⚠️</span>
        <p>Image unavailable</p>
      </div>
    );
  }

  return (
    <LazyImage
      publicId={publicId}
      alt={alt}
      preset="THUMBNAIL_MEDIUM"
      placeholder={true}
      onError={handleError}
    />
  );
};

/**
 * Example 11: Loading State Callback
 * Use case: Track when images finish loading
 */
export const ImageWithLoadTracking = ({ publicId, alt, onImageLoad }) => {
  const handleLoad = () => {
    console.log(`Image loaded: ${publicId}`);
    if (onImageLoad) onImageLoad();
  };

  return (
    <LazyImage
      publicId={publicId}
      alt={alt}
      preset="THUMBNAIL_MEDIUM"
      placeholder={true}
      onLoad={handleLoad}
    />
  );
};

/**
 * Example 12: Disable Placeholder for Specific Cases
 * Use case: When you don't want blur-up effect
 */
export const ImageWithoutPlaceholder = ({ publicId, alt }) => {
  return (
    <LazyImage
      publicId={publicId}
      alt={alt}
      preset="THUMBNAIL_MEDIUM"
      placeholder={false}
      showSpinner={true}
    />
  );
};

// Export all examples
export default {
  JobPostingCard,
  CourseCard,
  ProfileHeader,
  JobListingsGrid,
  CourseGallery,
  UserAvatar,
  CompanyBanner,
  ImageGallery,
  ConditionalImage,
  ImageWithErrorHandling,
  ImageWithLoadTracking,
  ImageWithoutPlaceholder,
};
