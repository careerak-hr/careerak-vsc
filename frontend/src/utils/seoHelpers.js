/**
 * SEO Helper Functions
 * 
 * Utility functions for generating structured data and SEO metadata.
 * 
 * Requirements:
 * - FR-SEO-6: JobPosting schema for job listings
 * - NFR-SEO-3: Include structured data for job postings and courses
 * - Property SEO-4: All jobs have structured data
 */

/**
 * Transform job data to JobPosting schema format
 * 
 * @param {Object} job - Job posting data from API
 * @param {Object} options - Additional options
 * @returns {Object} JobPosting schema data
 */
export const transformJobToSchema = (job, options = {}) => {
  const {
    baseUrl = 'https://careerak.com',
    organizationLogo = 'https://careerak.com/logo.png'
  } = options;

  // Map jobType to schema.org employmentType
  const employmentTypeMap = {
    'Full-time': 'FULL_TIME',
    'Part-time': 'PART_TIME',
    'Contract': 'CONTRACTOR',
    'Temporary': 'TEMPORARY'
  };

  // Build the schema data
  const schemaData = {
    title: job.title,
    description: job.description,
    datePosted: job.createdAt || new Date().toISOString(),
    employmentType: employmentTypeMap[job.jobType] || 'FULL_TIME',
    hiringOrganization: {
      name: job.postedBy?.companyName || job.company || 'Careerak',
      logo: job.postedBy?.logo || organizationLogo,
      url: job.postedBy?.website || baseUrl
    },
    jobLocation: {
      addressLocality: job.location,
      addressCountry: getCountryFromLocation(job.location)
    },
    url: `${baseUrl}/jobs/${job._id || job.id}`,
    identifier: job._id || job.id
  };

  // Add validThrough if status is Open (30 days from posting)
  if (job.status === 'Open' && job.createdAt) {
    const validDate = new Date(job.createdAt);
    validDate.setDate(validDate.getDate() + 30);
    schemaData.validThrough = validDate.toISOString();
  }

  // Add salary information if available
  if (job.salary && (job.salary.min || job.salary.max)) {
    const salaryValue = job.salary.max || job.salary.min;
    schemaData.baseSalary = {
      currency: job.salary.currency || 'SAR',
      value: salaryValue,
      unitText: 'YEAR'
    };
  }

  return schemaData;
};

/**
 * Get country code from location string
 * 
 * @param {string} location - Location string
 * @returns {string} Country code
 */
const getCountryFromLocation = (location) => {
  if (!location) return 'SA';
  
  const locationLower = location.toLowerCase();
  
  // Saudi Arabia
  if (locationLower.includes('saudi') || locationLower.includes('riyadh') || 
      locationLower.includes('jeddah') || locationLower.includes('dammam')) {
    return 'SA';
  }
  
  // UAE
  if (locationLower.includes('dubai') || locationLower.includes('abu dhabi') || 
      locationLower.includes('uae') || locationLower.includes('emirates')) {
    return 'AE';
  }
  
  // Egypt
  if (locationLower.includes('egypt') || locationLower.includes('cairo') || 
      locationLower.includes('alexandria')) {
    return 'EG';
  }
  
  // Kuwait
  if (locationLower.includes('kuwait')) {
    return 'KW';
  }
  
  // Qatar
  if (locationLower.includes('qatar') || locationLower.includes('doha')) {
    return 'QA';
  }
  
  // Bahrain
  if (locationLower.includes('bahrain') || locationLower.includes('manama')) {
    return 'BH';
  }
  
  // Oman
  if (locationLower.includes('oman') || locationLower.includes('muscat')) {
    return 'OM';
  }
  
  // Jordan
  if (locationLower.includes('jordan') || locationLower.includes('amman')) {
    return 'JO';
  }
  
  // Lebanon
  if (locationLower.includes('lebanon') || locationLower.includes('beirut')) {
    return 'LB';
  }
  
  // Default to Saudi Arabia
  return 'SA';
};

/**
 * Transform course data to Course schema format
 * 
 * @param {Object} course - Course data from API
 * @param {Object} options - Additional options
 * @returns {Object} Course schema data
 */
export const transformCourseToSchema = (course, options = {}) => {
  const {
    baseUrl = 'https://careerak.com',
    providerName = 'Careerak Academy'
  } = options;

  const schemaData = {
    name: course.title || course.name,
    description: course.description,
    provider: {
      name: course.provider?.name || providerName,
      url: course.provider?.url || baseUrl
    },
    courseMode: course.mode || 'online',
    url: `${baseUrl}/courses/${course._id || course.id}`
  };

  // Add image if available
  if (course.image || course.thumbnail) {
    schemaData.image = course.image || course.thumbnail;
  }

  // Add pricing information
  if (course.price !== undefined) {
    schemaData.offers = {
      price: course.price,
      priceCurrency: course.currency || 'SAR',
      availability: course.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    };
  }

  // Add course instance if dates are available
  if (course.startDate || course.endDate) {
    schemaData.hasCourseInstance = [{
      courseMode: course.mode || 'online',
      ...(course.startDate && { startDate: course.startDate }),
      ...(course.endDate && { endDate: course.endDate }),
      ...(course.instructor && {
        instructor: {
          name: course.instructor.name || course.instructor
        }
      })
    }];
  }

  return schemaData;
};

/**
 * Validate structured data
 * 
 * @param {Object} data - Structured data object
 * @param {string} type - Schema type (JobPosting, Course, etc.)
 * @returns {boolean} Whether the data is valid
 */
export const validateStructuredData = (data, type) => {
  if (!data || typeof data !== 'object') {
    console.error(`SEO: Invalid structured data for ${type}`);
    return false;
  }

  switch (type) {
    case 'JobPosting':
      return !!(data.title && data.description && data.datePosted && data.hiringOrganization);
    case 'Course':
      return !!(data.name && data.description && data.provider);
    default:
      return true;
  }
};

/**
 * Generate SEO-optimized alt text for images
 * 
 * @param {Object} options - Options for generating alt text
 * @returns {string} SEO-optimized alt text
 */
export const generateImageAltText = (options) => {
  const {
    type, // 'logo', 'profile', 'job', 'course'
    context, // Specific context
    name, // Name of person/company
    title, // Title for jobs/courses
    company, // Company name
  } = options;

  // Import from seoAltTextOptimizer for full functionality
  // This is a simplified version for basic use
  
  switch (type) {
    case 'logo':
      return `Careerak logo - ${context || 'Professional HR and recruitment platform'}`;
    
    case 'profile':
      return name ? `${name} professional profile photo` : 'User profile photo';
    
    case 'job':
      if (title && company) {
        return `${title} job opportunity at ${company}`;
      }
      return title ? `${title} position` : 'Job posting';
    
    case 'course':
      return title ? `${title} online course - Professional training` : 'Training course';
    
    default:
      return name || title || 'Image';
  }
};

/**
 * Optimize image URLs for SEO (add descriptive filenames)
 * 
 * @param {string} url - Image URL
 * @param {string} description - Description for filename
 * @returns {string} Optimized URL
 */
export const optimizeImageURL = (url, description) => {
  if (!url || !description) return url;
  
  // For Cloudinary URLs, we can add context in the public_id
  // This is a placeholder for future implementation
  return url;
};

export default {
  transformJobToSchema,
  transformCourseToSchema,
  validateStructuredData,
  generateImageAltText,
  optimizeImageURL
};
