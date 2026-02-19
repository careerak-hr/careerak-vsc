/**
 * Image Optimization Utility for Cloudinary
 * 
 * This utility provides optimized image URLs for Cloudinary with:
 * - WebP format with JPEG/PNG fallback
 * - Automatic quality and format optimization (f_auto, q_auto)
 * - Responsive image sizing
 * - Blur-up placeholders for lazy loading
 * - Performance-optimized transformations
 * 
 * Requirements: FR-PERF-3, FR-PERF-4
 * Design: Section 3.3 Image Optimization
 */

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'careerak';
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Generate optimized Cloudinary URL with transformations
 * 
 * @param {string} publicId - Cloudinary public ID or full URL
 * @param {object} options - Transformation options
 * @param {number} options.width - Target width in pixels
 * @param {number} options.height - Target height in pixels
 * @param {string} options.crop - Crop mode (fill, fit, scale, etc.)
 * @param {string} options.format - Image format (webp, jpg, png, auto)
 * @param {number} options.quality - Quality (1-100, or 'auto')
 * @param {string} options.gravity - Gravity for cropping (face, center, etc.)
 * @param {boolean} options.blur - Apply blur effect for placeholder
 * @returns {string} Optimized Cloudinary URL
 */
export const getOptimizedImageUrl = (publicId, options = {}) => {
  if (!publicId) {
    console.warn('No publicId provided to getOptimizedImageUrl');
    return '';
  }

  // Extract public ID from full Cloudinary URL if needed
  const extractedPublicId = extractPublicId(publicId);

  // Default options for optimal performance
  const {
    width = null,
    height = null,
    crop = 'fill',
    format = 'auto',
    quality = 'auto',
    gravity = 'auto',
    blur = false,
  } = options;

  // Build transformation string
  const transformations = [];

  // Add dimensions if provided
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (width || height) transformations.push(`c_${crop}`);

  // Add gravity for smart cropping
  if (gravity && (width || height)) {
    transformations.push(`g_${gravity}`);
  }

  // Add format optimization (f_auto enables WebP with fallback)
  transformations.push(`f_${format}`);

  // Add quality optimization
  transformations.push(`q_${quality}`);

  // Add blur for placeholder
  if (blur) {
    transformations.push('e_blur:1000');
    transformations.push('q_1'); // Very low quality for placeholder
  }

  // Combine transformations
  const transformString = transformations.join(',');

  return `${CLOUDINARY_BASE_URL}/${transformString}/${extractedPublicId}`;
};

/**
 * Extract public ID from Cloudinary URL or return as-is
 * 
 * @param {string} urlOrPublicId - Full URL or public ID
 * @returns {string} Public ID
 */
const extractPublicId = (urlOrPublicId) => {
  if (!urlOrPublicId) return '';

  // If it's already a public ID (no http/https), return as-is
  if (!urlOrPublicId.startsWith('http')) {
    return urlOrPublicId;
  }

  // Extract from Cloudinary URL
  try {
    const url = new URL(urlOrPublicId);
    const pathParts = url.pathname.split('/');
    
    // Find 'upload' in path and get everything after it
    const uploadIndex = pathParts.indexOf('upload');
    if (uploadIndex !== -1 && uploadIndex < pathParts.length - 1) {
      // Skip transformation parameters (they start with letters like v, w_, h_, etc.)
      let startIndex = uploadIndex + 1;
      while (startIndex < pathParts.length && /^[a-z]_/.test(pathParts[startIndex])) {
        startIndex++;
      }
      return pathParts.slice(startIndex).join('/');
    }
  } catch (error) {
    console.warn('Failed to parse Cloudinary URL:', error);
  }

  return urlOrPublicId;
};

/**
 * Generate responsive image srcset for different screen sizes
 * 
 * @param {string} publicId - Cloudinary public ID
 * @param {object} options - Base transformation options
 * @param {number[]} widths - Array of widths for srcset (default: [320, 640, 768, 1024, 1280, 1920])
 * @returns {string} srcset string for img element
 */
export const getResponsiveSrcSet = (publicId, options = {}, widths = [320, 640, 768, 1024, 1280, 1920]) => {
  if (!publicId) return '';

  return widths
    .map(width => {
      const url = getOptimizedImageUrl(publicId, { ...options, width });
      return `${url} ${width}w`;
    })
    .join(', ');
};

/**
 * Generate blur-up placeholder URL for lazy loading
 * 
 * Creates a tiny, heavily blurred version of the image for use as a placeholder
 * while the full image loads. This provides a better user experience by showing
 * a preview of the image content rather than a blank space.
 * 
 * The placeholder is:
 * - Very small (20px wide by default) to load instantly
 * - Heavily blurred (blur:1000) to hide pixelation
 * - Very low quality (q:1) to minimize file size
 * - Scaled up with CSS to fill the container
 * 
 * @param {string} publicId - Cloudinary public ID
 * @param {number} width - Placeholder width (default: 20px for optimal performance)
 * @returns {string} Blurred placeholder URL
 * 
 * @example
 * const placeholderUrl = getPlaceholderUrl('profile/user123');
 * // Returns: https://res.cloudinary.com/.../w_20,f_auto,q_1,e_blur:1000/profile/user123
 */
export const getPlaceholderUrl = (publicId, width = 20) => {
  if (!publicId) return '';

  return getOptimizedImageUrl(publicId, {
    width,
    quality: 1,
    blur: true,
  });
};

/**
 * Presets for common image use cases
 */
export const ImagePresets = {
  // Profile pictures
  PROFILE_SMALL: { width: 100, height: 100, crop: 'fill', gravity: 'face' },
  PROFILE_MEDIUM: { width: 200, height: 200, crop: 'fill', gravity: 'face' },
  PROFILE_LARGE: { width: 400, height: 400, crop: 'fill', gravity: 'face' },

  // Company logos
  LOGO_SMALL: { width: 80, height: 80, crop: 'fit' },
  LOGO_MEDIUM: { width: 150, height: 150, crop: 'fit' },
  LOGO_LARGE: { width: 300, height: 300, crop: 'fit' },

  // Job/Course thumbnails
  THUMBNAIL_SMALL: { width: 300, height: 200, crop: 'fill' },
  THUMBNAIL_MEDIUM: { width: 600, height: 400, crop: 'fill' },
  THUMBNAIL_LARGE: { width: 1200, height: 800, crop: 'fill' },

  // Full-width images
  HERO_MOBILE: { width: 768, crop: 'scale' },
  HERO_TABLET: { width: 1024, crop: 'scale' },
  HERO_DESKTOP: { width: 1920, crop: 'scale' },

  // Gallery images
  GALLERY_THUMB: { width: 200, height: 200, crop: 'fill' },
  GALLERY_MEDIUM: { width: 600, height: 600, crop: 'fit' },
  GALLERY_LARGE: { width: 1200, height: 1200, crop: 'fit' },
};

/**
 * Get optimized image URL using a preset
 * 
 * @param {string} publicId - Cloudinary public ID
 * @param {string} presetName - Preset name from ImagePresets
 * @param {object} overrides - Additional options to override preset
 * @returns {string} Optimized URL
 */
export const getImageWithPreset = (publicId, presetName, overrides = {}) => {
  const preset = ImagePresets[presetName];
  if (!preset) {
    console.warn(`Unknown preset: ${presetName}`);
    return getOptimizedImageUrl(publicId, overrides);
  }

  return getOptimizedImageUrl(publicId, { ...preset, ...overrides });
};

/**
 * Upload image to Cloudinary (requires backend API)
 * This is a helper that prepares the upload request
 * 
 * @param {File|Blob} file - Image file to upload
 * @param {object} options - Upload options
 * @param {string} options.folder - Cloudinary folder path
 * @param {string} options.publicId - Custom public ID
 * @param {string[]} options.tags - Tags for the image
 * @returns {Promise<object>} Upload response with public_id and url
 */
export const prepareImageUpload = async (file, options = {}) => {
  const { folder = 'careerak', publicId = null, tags = [] } = options;

  // Create FormData for upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'careerak_preset'); // Configure this in Cloudinary dashboard
  
  if (folder) formData.append('folder', folder);
  if (publicId) formData.append('public_id', publicId);
  if (tags.length > 0) formData.append('tags', tags.join(','));

  return formData;
};

/**
 * Check if browser supports WebP format
 * 
 * @returns {Promise<boolean>} True if WebP is supported
 */
export const supportsWebP = () => {
  return new Promise((resolve) => {
    const webP = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
    const img = new Image();
    img.onload = () => resolve(img.width === 1);
    img.onerror = () => resolve(false);
    img.src = webP;
  });
};

/**
 * Generate WebP URL with JPEG/PNG fallback URLs
 * This provides explicit format control for <picture> element usage
 * 
 * @param {string} publicId - Cloudinary public ID
 * @param {object} options - Transformation options
 * @returns {object} Object with webp, jpeg, and png URLs
 * 
 * @example
 * const urls = getWebPWithFallback('profile/user123', { width: 400 });
 * // Returns: { webp: '...f_webp...', jpeg: '...f_jpg...', png: '...f_png...' }
 */
export const getWebPWithFallback = (publicId, options = {}) => {
  if (!publicId) {
    return { webp: '', jpeg: '', png: '' };
  }

  // Generate WebP version (modern browsers)
  const webpUrl = getOptimizedImageUrl(publicId, {
    ...options,
    format: 'webp',
  });

  // Generate JPEG fallback (most compatible)
  const jpegUrl = getOptimizedImageUrl(publicId, {
    ...options,
    format: 'jpg',
  });

  // Generate PNG fallback (for images requiring transparency)
  const pngUrl = getOptimizedImageUrl(publicId, {
    ...options,
    format: 'png',
  });

  return {
    webp: webpUrl,
    jpeg: jpegUrl,
    png: pngUrl,
  };
};

/**
 * Generate responsive WebP srcset with JPEG fallback
 * Creates srcset for both WebP and JPEG formats
 * 
 * @param {string} publicId - Cloudinary public ID
 * @param {object} options - Base transformation options
 * @param {number[]} widths - Array of widths for srcset
 * @returns {object} Object with webpSrcSet and jpegSrcSet
 * 
 * @example
 * const srcsets = getResponsiveWebPSrcSet('hero/banner', {}, [640, 1024, 1920]);
 * // Use in <picture>:
 * // <source srcSet={srcsets.webpSrcSet} type="image/webp" />
 * // <source srcSet={srcsets.jpegSrcSet} type="image/jpeg" />
 */
export const getResponsiveWebPSrcSet = (publicId, options = {}, widths = [320, 640, 768, 1024, 1280, 1920]) => {
  if (!publicId) {
    return { webpSrcSet: '', jpegSrcSet: '' };
  }

  // Generate WebP srcset
  const webpSrcSet = widths
    .map(width => {
      const url = getOptimizedImageUrl(publicId, { ...options, width, format: 'webp' });
      return `${url} ${width}w`;
    })
    .join(', ');

  // Generate JPEG srcset as fallback
  const jpegSrcSet = widths
    .map(width => {
      const url = getOptimizedImageUrl(publicId, { ...options, width, format: 'jpg' });
      return `${url} ${width}w`;
    })
    .join(', ');

  return {
    webpSrcSet,
    jpegSrcSet,
  };
};

/**
 * Get image dimensions from URL
 * 
 * @param {string} url - Image URL
 * @returns {Promise<{width: number, height: number}>} Image dimensions
 */
export const getImageDimensions = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Generate sizes attribute for responsive images
 * 
 * @param {object} breakpoints - Breakpoint configuration
 * @returns {string} sizes attribute value
 * 
 * @example
 * generateSizesAttribute({
 *   mobile: { maxWidth: 640, imageWidth: '100vw' },
 *   tablet: { maxWidth: 1024, imageWidth: '50vw' },
 *   desktop: { imageWidth: '33vw' }
 * })
 * // Returns: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
 */
export const generateSizesAttribute = (breakpoints) => {
  const sizes = [];

  if (breakpoints.mobile) {
    sizes.push(`(max-width: ${breakpoints.mobile.maxWidth}px) ${breakpoints.mobile.imageWidth}`);
  }
  if (breakpoints.tablet) {
    sizes.push(`(max-width: ${breakpoints.tablet.maxWidth}px) ${breakpoints.tablet.imageWidth}`);
  }
  if (breakpoints.desktop) {
    sizes.push(breakpoints.desktop.imageWidth);
  }

  return sizes.join(', ');
};

/**
 * Default export with all utilities
 */
export default {
  getOptimizedImageUrl,
  getResponsiveSrcSet,
  getPlaceholderUrl,
  getImageWithPreset,
  prepareImageUpload,
  supportsWebP,
  getWebPWithFallback,
  getResponsiveWebPSrcSet,
  getImageDimensions,
  generateSizesAttribute,
  ImagePresets,
};
