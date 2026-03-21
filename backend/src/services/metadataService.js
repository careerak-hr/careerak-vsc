const JobPosting = require('../models/JobPosting');
const EducationalCourse = require('../models/EducationalCourse');
const { User, Individual } = require('../models/User');
const CompanyInfo = require('../models/CompanyInfo');
const UserSettings = require('../models/UserSettings');
const { getOptimizedUrl } = require('../config/cloudinary');

const SITE_NAME = 'Careerak';
const BASE_URL = 'https://careerak.com';
const DEFAULT_IMAGES = {
  job: `${BASE_URL}/images/default-job.jpg`,
  course: `${BASE_URL}/images/default-course.jpg`,
  profile: `${BASE_URL}/images/default-profile.jpg`,
  company: `${BASE_URL}/images/default-company.jpg`
};

/**
 * Truncate a string to a maximum length, appending '...' if truncated.
 */
function truncate(str, maxLength) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Format a salary range into a human-readable string.
 * Supports Arabic, English, and French.
 * @param {{ min?: number, max?: number }} salary
 * @returns {string}
 */
function formatSalaryRange(salary) {
  if (!salary) return '';
  const { min, max } = salary;
  if (!min && !max) return '';
  if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()}`;
  if (min) return `${min.toLocaleString()}+`;
  if (max) return `≤ ${max.toLocaleString()}`;
  return '';
}

/**
 * Build the og:title for a job: "Job Title - Company Name"
 * @param {object} job
 * @returns {string}
 */
function buildJobOgTitle(job) {
  const companyName = job.company?.name;
  if (companyName) return `${job.title} - ${companyName}`;
  return job.title;
}

/**
 * Build the og:description for a job.
 * Includes location, salary range, and a brief description.
 * Supports multilingual content (Arabic, English, French).
 * @param {object} job
 * @returns {string}
 */
function buildJobOgDescription(job) {
  const parts = [];

  // Location
  const location = job.location?.type || job.location?.city || job.location?.country;
  if (location) parts.push(location);

  // Salary range
  const salary = formatSalaryRange(job.salary);
  if (salary) parts.push(salary);

  // Brief description
  if (job.description) parts.push(truncate(job.description, 150));

  return truncate(parts.join(' | '), 200);
}

/**
 * Format course duration into a human-readable string.
 * @param {object} course
 * @returns {string}
 */
function formatCourseDuration(course) {
  // Prefer totalDuration (hours) if available
  if (course.totalDuration && course.totalDuration > 0) {
    return `${course.totalDuration}h`;
  }
  // Fall back to duration object
  if (course.duration && course.duration.value) {
    return `${course.duration.value} ${course.duration.unit || 'hours'}`;
  }
  return '';
}

/**
 * Build the og:description for a course.
 * Includes instructor name, duration, rating, and a brief description.
 * Req 2.3: course title, instructor name, duration, and rating
 * @param {object} course - populated with instructor
 * @returns {string}
 */
function buildCourseOgDescription(course) {
  const parts = [];

  // Instructor name
  if (course.instructor) {
    const { firstName, lastName } = course.instructor;
    const instructorName = [firstName, lastName].filter(Boolean).join(' ');
    if (instructorName) parts.push(instructorName);
  }

  // Duration
  const duration = formatCourseDuration(course);
  if (duration) parts.push(duration);

  // Rating
  const rating = course.stats?.averageRating;
  if (rating && rating > 0) parts.push(`★ ${rating.toFixed(1)}`);

  // Brief description
  if (course.description) parts.push(truncate(course.description, 120));

  return truncate(parts.join(' | '), 200);
}

/**
 * Build a skills summary string from a user's skills arrays.
 * Combines computerSkills, otherSkills, and interests (up to 5 items total).
 * @param {object} user - Individual user document
 * @returns {string}
 */
function buildSkillsSummary(user) {
  const skills = [];

  if (Array.isArray(user.computerSkills)) {
    user.computerSkills.forEach(s => { if (s && s.skill) skills.push(s.skill); });
  }
  if (Array.isArray(user.otherSkills)) {
    user.otherSkills.forEach(s => { if (s) skills.push(s); });
  }
  if (Array.isArray(user.interests)) {
    user.interests.forEach(i => { if (i) skills.push(i); });
  }

  const unique = [...new Set(skills)].slice(0, 5);
  return unique.join(', ');
}

/**
 * Build the og:description for a user profile.
 * Req 3.4: include user name, title, skills, and profile picture
 * @param {object} user - Individual user document
 * @param {string} fullName
 * @returns {string}
 */
function buildProfileOgDescription(user, fullName) {
  const parts = [];

  // Title / specialization
  const title = user.specialization || '';
  if (title) parts.push(title);

  // Skills summary
  const skills = buildSkillsSummary(user);
  if (skills) parts.push(skills);

  // Bio as fallback / supplement
  if (user.bio) parts.push(truncate(user.bio, 100));

  if (parts.length === 0) return truncate(fullName, 200);
  return truncate(parts.join(' | '), 200);
}

/**
 * Build the og:description for a company profile.
 * Req 4.3: include company name, industry, and employee count
 * Req 4.5: include active job count in the share preview
 * @param {object} companyInfo - CompanyInfo document (populated with company)
 * @returns {string}
 */
function buildCompanyOgDescription(companyInfo) {
  const parts = [];

  // Industry
  const industry = companyInfo.company?.companyIndustry;
  if (industry) parts.push(industry);

  // Employee count
  if (companyInfo.employeeCount) parts.push(`${companyInfo.employeeCount} employees`);

  // Active job count
  if (companyInfo.activeJobPostings > 0) {
    parts.push(`${companyInfo.activeJobPostings} open position${companyInfo.activeJobPostings !== 1 ? 's' : ''}`);
  }

  // Description as supplement
  if (companyInfo.description) parts.push(truncate(companyInfo.description, 120));

  if (parts.length === 0) {
    const companyName = companyInfo.company?.companyName || '';
    return truncate(companyName, 200);
  }

  return truncate(parts.join(' | '), 200);
}

/**
 * Build a Cloudinary-optimised profile image URL (PROFILE_LARGE: 400x400, face gravity).
 * Falls back to the raw URL or the default profile image if no public ID is available.
 * @param {string|undefined} profileImage - raw URL or Cloudinary public ID
 * @returns {string}
 */
function buildProfileImageUrl(profileImage) {
  if (!profileImage) return DEFAULT_IMAGES.profile;

  // If it looks like a full URL (already resolved), return as-is
  if (profileImage.startsWith('http://') || profileImage.startsWith('https://')) {
    return profileImage;
  }

  // Treat as a Cloudinary public ID and apply PROFILE_LARGE preset
  try {
    return getOptimizedUrl(profileImage, {
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'face'
    });
  } catch {
    return DEFAULT_IMAGES.profile;
  }
}

/**
 * Generate Open Graph meta tags for a given content type and ID.
 * Req 14
 *
 * @param {string} contentType - 'job' | 'course' | 'profile' | 'company'
 * @param {string} contentId
 * @returns {Promise<object|null>} OG tags object, or null if content not found
 */
async function generateOpenGraphTags(contentType, contentId) {
  try {
    switch (contentType) {
      case 'job': {
        // 2.1.1 - OG tags for jobs
        // Req 1.5: include job title, company name, location, salary range
        // Req 14.2: og:title, og:description, og:image, og:url, og:type
        // Req 14.4: og:image references a 1200x630-optimised image URL
        // Req 18: supports Arabic, English, and French content
        const job = await JobPosting.findById(contentId).lean();
        if (!job) return null;

        return {
          'og:title': buildJobOgTitle(job),
          'og:description': buildJobOgDescription(job),
          'og:image': job.company?.logo || DEFAULT_IMAGES.job,
          'og:url': `${BASE_URL}/job-postings/${contentId}`,
          'og:type': 'website',
          'og:site_name': SITE_NAME
        };
      }

      case 'course': {
        // 2.1.2 - OG tags for courses
        // Req 2.3: include course title, instructor name, duration, and rating
        // Req 14.2: og:title, og:description, og:image, og:url, og:type
        // Req 14.4: og:image references a 1200x630-optimised image URL
        const course = await EducationalCourse.findById(contentId)
          .populate('instructor', 'firstName lastName')
          .lean();
        if (!course) return null;

        return {
          'og:title': course.title,
          'og:description': buildCourseOgDescription(course),
          'og:image': course.thumbnail || DEFAULT_IMAGES.course,
          'og:url': `${BASE_URL}/courses/${contentId}`,
          'og:type': 'website',
          'og:site_name': SITE_NAME
        };
      }

      case 'profile': {
        // 2.1.3 - OG tags for user profiles
        // Req 3.2: respect privacy settings - only public profiles can be shared externally
        // Req 3.4: include user name, title, skills, and profile picture
        // Req 14.2: og:title, og:description, og:image, og:url, og:type
        // Req 18: supports Arabic, English, and French content
        const user = await Individual.findById(contentId).lean();
        if (!user) return null;

        // Check privacy settings - only 'everyone' visibility allows external sharing
        const settings = await UserSettings.findOne({ userId: contentId }).lean();
        const profileVisibility = settings?.privacy?.profileVisibility ?? 'everyone';
        if (profileVisibility === 'none') return null;

        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
        const title = user.specialization || '';
        const ogTitle = title ? `${fullName} - ${title}` : fullName || SITE_NAME;

        return {
          'og:title': ogTitle,
          'og:description': buildProfileOgDescription(user, fullName),
          'og:image': buildProfileImageUrl(user.profileImage),
          'og:url': `${BASE_URL}/profile/${contentId}`,
          'og:type': 'profile',
          'og:site_name': SITE_NAME,
          // Profile-specific Open Graph tags
          ...(user.firstName && { 'profile:first_name': user.firstName }),
          ...(user.lastName && { 'profile:last_name': user.lastName })
        };
      }

      case 'company': {
        // 2.1.4 - OG tags for company profiles
        // Req 4.3: include company name, logo, industry, and employee count
        // Req 4.5: include active job count in the share preview
        // Req 14.2: og:title, og:description, og:image, og:url, og:type
        const companyInfo = await CompanyInfo.findOne({ company: contentId })
          .populate('company', 'companyName companyIndustry')
          .lean();
        if (!companyInfo) return null;

        const companyName = companyInfo.company?.companyName || SITE_NAME;

        return {
          'og:title': companyName,
          'og:description': buildCompanyOgDescription(companyInfo),
          'og:image': companyInfo.logo || DEFAULT_IMAGES.company,
          'og:url': `${BASE_URL}/companies/${contentId}`,
          'og:type': 'profile',
          'og:site_name': SITE_NAME
        };
      }

      default:
        return null;
    }
  } catch (error) {
    return null;
  }
}

/**
 * Generate Twitter Card meta tags for a given content type and ID.
 * Req 7.2, Req 14.3 (2.1.5)
 *
 * Card types:
 *  - 'summary_large_image' for jobs and courses (rich preview with large image)
 *  - 'summary' for user profiles and company profiles
 *
 * @param {string} contentType - 'job' | 'course' | 'profile' | 'company'
 * @param {string} contentId
 * @returns {Promise<object|null>} Twitter card tags object, or null if content not found
 */
async function generateTwitterCardTags(contentType, contentId) {
  const DEFAULT_OG_IMAGE = `${BASE_URL}/images/og-default.jpg`;

  const ogTags = await generateOpenGraphTags(contentType, contentId);
  if (!ogTags) return null;

  // Use summary_large_image for jobs/courses, summary for profiles/companies
  const cardType = (contentType === 'job' || contentType === 'course')
    ? 'summary_large_image'
    : 'summary';

  const tags = {
    'twitter:card': cardType,
    'twitter:site': '@careerak',
    'twitter:title': ogTags['og:title'],
    'twitter:description': ogTags['og:description'],
    'twitter:image': ogTags['og:image'] || DEFAULT_OG_IMAGE
  };

  // Add twitter:creator for user profiles
  if (contentType === 'profile') {
    tags['twitter:creator'] = '@careerak';
  }

  return tags;
}

/**
 * Generate both Open Graph and Twitter Card meta tags.
 *
 * @param {string} contentType
 * @param {string} contentId
 * @returns {Promise<{ openGraph: object, twitterCard: object }|null>}
 */
async function generateAllMetaTags(contentType, contentId) {
  const [openGraph, twitterCard] = await Promise.all([
    generateOpenGraphTags(contentType, contentId),
    generateTwitterCardTags(contentType, contentId)
  ]);

  if (!openGraph && !twitterCard) return null;

  return { openGraph, twitterCard };
}

module.exports = {
  generateOpenGraphTags,
  generateTwitterCardTags,
  generateAllMetaTags
};
