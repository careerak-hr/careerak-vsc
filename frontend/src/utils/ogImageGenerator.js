/**
 * Open Graph Image Generator Utility
 * 
 * Provides functions to generate optimized Open Graph images for social media sharing.
 * Supports dynamic image generation and fallback strategies.
 * 
 * Requirements:
 * - Requirements 3.4: معاينة جذابة عند المشاركة (Open Graph)
 * - FR-SEO-4: Open Graph tags
 */

/**
 * Generate Open Graph image URL for a job posting
 * 
 * Priority:
 * 1. Company logo (if available and valid)
 * 2. Job thumbnail (if available)
 * 3. Default Careerak logo
 * 
 * @param {Object} job - Job object
 * @param {Object} job.company - Company information
 * @param {string} job.company.logo - Company logo URL
 * @param {string} job.thumbnail - Job thumbnail URL
 * @returns {string} Absolute URL for Open Graph image
 */
export const generateJobOGImage = (job) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Priority 1: Company logo
  if (job?.company?.logo) {
    return makeAbsoluteURL(job.company.logo, origin);
  }
  
  // Priority 2: Job thumbnail
  if (job?.thumbnail) {
    return makeAbsoluteURL(job.thumbnail, origin);
  }
  
  // Priority 3: Default logo
  return `${origin}/logo.png`;
};

/**
 * Generate Open Graph image URL for a course
 * 
 * @param {Object} course - Course object
 * @param {string} course.thumbnail - Course thumbnail URL
 * @param {string} course.instructor.avatar - Instructor avatar URL
 * @returns {string} Absolute URL for Open Graph image
 */
export const generateCourseOGImage = (course) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Priority 1: Course thumbnail
  if (course?.thumbnail) {
    return makeAbsoluteURL(course.thumbnail, origin);
  }
  
  // Priority 2: Instructor avatar
  if (course?.instructor?.avatar) {
    return makeAbsoluteURL(course.instructor.avatar, origin);
  }
  
  // Priority 3: Default logo
  return `${origin}/logo.png`;
};

/**
 * Generate Open Graph image URL for a company profile
 * 
 * @param {Object} company - Company object
 * @param {string} company.logo - Company logo URL
 * @param {string} company.coverImage - Company cover image URL
 * @returns {string} Absolute URL for Open Graph image
 */
export const generateCompanyOGImage = (company) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Priority 1: Cover image
  if (company?.coverImage) {
    return makeAbsoluteURL(company.coverImage, origin);
  }
  
  // Priority 2: Company logo
  if (company?.logo) {
    return makeAbsoluteURL(company.logo, origin);
  }
  
  // Priority 3: Default logo
  return `${origin}/logo.png`;
};

/**
 * Generate Open Graph image URL for a user profile
 * 
 * @param {Object} user - User object
 * @param {string} user.profilePicture - User profile picture URL
 * @returns {string} Absolute URL for Open Graph image
 */
export const generateUserOGImage = (user) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Priority 1: Profile picture
  if (user?.profilePicture) {
    return makeAbsoluteURL(user.profilePicture, origin);
  }
  
  // Priority 2: Default avatar
  return `${origin}/default-avatar.png`;
};

/**
 * Make a URL absolute if it's relative
 * 
 * @param {string} url - URL to convert
 * @param {string} origin - Origin to prepend if URL is relative
 * @returns {string} Absolute URL
 */
const makeAbsoluteURL = (url, origin) => {
  if (!url) return `${origin}/logo.png`;
  
  // Already absolute
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Relative URL - prepend origin
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${origin}${cleanUrl}`;
};

/**
 * Optimize image URL for Open Graph (recommended size: 1200x630)
 * 
 * If using Cloudinary, applies transformations for optimal OG image size.
 * 
 * @param {string} imageUrl - Original image URL
 * @returns {string} Optimized image URL
 */
export const optimizeOGImage = (imageUrl) => {
  if (!imageUrl) return imageUrl;
  
  // Check if it's a Cloudinary URL
  if (imageUrl.includes('cloudinary.com')) {
    // Insert transformation parameters before /upload/
    const transformation = 'c_fill,w_1200,h_630,q_auto,f_auto';
    return imageUrl.replace('/upload/', `/upload/${transformation}/`);
  }
  
  // For other CDNs, return as-is
  // TODO: Add transformations for other CDNs if needed
  return imageUrl;
};

/**
 * Generate Open Graph image with text overlay (for dynamic generation)
 * 
 * This would typically be done on the backend, but here's the structure
 * for a service that generates OG images with text overlays.
 * 
 * @param {Object} options - Image generation options
 * @param {string} options.title - Title text
 * @param {string} options.subtitle - Subtitle text
 * @param {string} options.backgroundImage - Background image URL
 * @param {string} options.logo - Logo URL
 * @returns {string} URL to generated image
 */
export const generateDynamicOGImage = (options) => {
  const { title, subtitle, backgroundImage, logo } = options;
  
  // This would call a backend service or external API like:
  // - Cloudinary's text overlay feature
  // - imgix's text rendering
  // - Custom backend endpoint
  // - Third-party service like og-image.vercel.app
  
  const params = new URLSearchParams({
    title: title || '',
    subtitle: subtitle || '',
    bg: backgroundImage || '',
    logo: logo || ''
  });
  
  // Example: Using a hypothetical backend endpoint
  return `/api/og-image?${params.toString()}`;
};

/**
 * Validate Open Graph image URL
 * 
 * Checks if the image URL is valid and accessible.
 * 
 * @param {string} imageUrl - Image URL to validate
 * @returns {Promise<boolean>} True if image is valid and accessible
 */
export const validateOGImage = async (imageUrl) => {
  if (!imageUrl) return false;
  
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    
    // Check if response is OK and content type is an image
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      return contentType && contentType.startsWith('image/');
    }
    
    return false;
  } catch (error) {
    console.error('Error validating OG image:', error);
    return false;
  }
};

/**
 * Get fallback Open Graph image
 * 
 * Returns the default Careerak logo as fallback.
 * 
 * @returns {string} Absolute URL to fallback image
 */
export const getFallbackOGImage = () => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/logo.png`;
};

/**
 * Generate Open Graph image dimensions
 * 
 * Returns recommended dimensions for Open Graph images.
 * 
 * @returns {Object} Width and height in pixels
 */
export const getOGImageDimensions = () => {
  return {
    width: 1200,
    height: 630,
    aspectRatio: '1.91:1'
  };
};

export default {
  generateJobOGImage,
  generateCourseOGImage,
  generateCompanyOGImage,
  generateUserOGImage,
  optimizeOGImage,
  generateDynamicOGImage,
  validateOGImage,
  getFallbackOGImage,
  getOGImageDimensions
};
