const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Default transformation options for image optimization
 * These transformations are applied to all uploaded images
 * 
 * f_auto: Automatically selects the best format (WebP, AVIF, JPEG, PNG)
 *         based on browser support and image content
 * q_auto: Automatically adjusts quality to balance file size and visual quality
 *         Uses intelligent compression algorithms
 * 
 * Benefits:
 * - Reduces bandwidth usage by 40-60%
 * - Improves page load times
 * - Maintains visual quality
 * - Automatic format selection (WebP for modern browsers, JPEG/PNG for older ones)
 * 
 * Requirements: FR-PERF-3, FR-PERF-4
 * Design: Section 3.3 Image Optimization
 */
const DEFAULT_IMAGE_TRANSFORMATIONS = {
  fetch_format: 'auto',  // f_auto - automatic format selection
  quality: 'auto',       // q_auto - automatic quality optimization
  flags: 'progressive',  // Progressive loading for better UX
};

/**
 * Upload image with automatic optimization
 * 
 * @param {Buffer|string} file - File buffer or path
 * @param {object} options - Upload options
 * @param {string} options.folder - Cloudinary folder path
 * @param {string} options.public_id - Custom public ID
 * @param {string[]} options.tags - Tags for the image
 * @param {object} options.transformation - Additional transformations
 * @returns {Promise<object>} Upload result with secure_url and public_id
 */
const uploadImage = async (file, options = {}) => {
  const {
    folder = 'careerak',
    public_id = null,
    tags = [],
    transformation = {},
  } = options;

  // Merge default transformations with custom ones
  const finalTransformation = {
    ...DEFAULT_IMAGE_TRANSFORMATIONS,
    ...transformation,
  };

  const uploadOptions = {
    folder,
    resource_type: 'image',
    transformation: finalTransformation,
  };

  if (public_id) uploadOptions.public_id = public_id;
  if (tags.length > 0) uploadOptions.tags = tags;

  // Upload based on input type
  if (Buffer.isBuffer(file)) {
    // Upload from buffer (multer memory storage)
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(file);
    });
  } else {
    // Upload from file path or URL
    return cloudinary.uploader.upload(file, uploadOptions);
  }
};

/**
 * Generate optimized image URL with transformations
 * 
 * @param {string} publicId - Cloudinary public ID
 * @param {object} options - Transformation options
 * @param {number} options.width - Target width
 * @param {number} options.height - Target height
 * @param {string} options.crop - Crop mode (fill, fit, scale, etc.)
 * @param {string} options.gravity - Gravity for cropping (face, center, etc.)
 * @returns {string} Optimized image URL
 */
const getOptimizedUrl = (publicId, options = {}) => {
  const {
    width = null,
    height = null,
    crop = 'fill',
    gravity = 'auto',
  } = options;

  const transformation = {
    ...DEFAULT_IMAGE_TRANSFORMATIONS,
  };

  if (width) transformation.width = width;
  if (height) transformation.height = height;
  if (width || height) {
    transformation.crop = crop;
    transformation.gravity = gravity;
  }

  return cloudinary.url(publicId, { transformation });
};

/**
 * Image presets for common use cases
 */
const IMAGE_PRESETS = {
  PROFILE_PICTURE: {
    width: 400,
    height: 400,
    crop: 'fill',
    gravity: 'face',
  },
  COMPANY_LOGO: {
    width: 300,
    height: 300,
    crop: 'fit',
  },
  JOB_THUMBNAIL: {
    width: 600,
    height: 400,
    crop: 'fill',
  },
  COURSE_THUMBNAIL: {
    width: 600,
    height: 400,
    crop: 'fill',
  },
};

/**
 * Upload image with preset transformations
 * 
 * @param {Buffer|string} file - File buffer or path
 * @param {string} preset - Preset name from IMAGE_PRESETS
 * @param {object} options - Additional upload options
 * @returns {Promise<object>} Upload result
 */
const uploadWithPreset = async (file, preset, options = {}) => {
  const presetTransformation = IMAGE_PRESETS[preset];
  if (!presetTransformation) {
    throw new Error(`Unknown preset: ${preset}`);
  }

  return uploadImage(file, {
    ...options,
    transformation: {
      ...presetTransformation,
      ...options.transformation,
    },
  });
};

// Export cloudinary instance and helper functions
module.exports = cloudinary;
module.exports.uploadImage = uploadImage;
module.exports.getOptimizedUrl = getOptimizedUrl;
module.exports.uploadWithPreset = uploadWithPreset;
module.exports.IMAGE_PRESETS = IMAGE_PRESETS;
module.exports.DEFAULT_IMAGE_TRANSFORMATIONS = DEFAULT_IMAGE_TRANSFORMATIONS;
