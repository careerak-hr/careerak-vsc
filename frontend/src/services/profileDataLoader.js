/**
 * Profile Data Loader Service
 * 
 * Fetches user profile data and maps it to application form fields.
 * Handles missing profile data gracefully and populates arrays for
 * education, experience, skills, and languages.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7
 */

/**
 * Fetches user profile data from the backend
 * @param {string} userId - The user ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} User profile data
 */
export async function fetchUserProfile(userId, token) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Maps user profile data to application form fields
 * Handles missing fields gracefully by returning empty values
 * 
 * @param {Object} profile - User profile data from backend
 * @returns {Object} Mapped form data
 */
export function mapProfileToFormData(profile) {
  if (!profile) {
    return getEmptyFormData();
  }

  return {
    // Personal Information (Requirement 1.1)
    fullName: buildFullName(profile),
    email: profile.email || '',
    phone: profile.phone || '',
    country: profile.country || '',
    city: profile.city || '',

    // Education (Requirement 1.2)
    education: mapEducationList(profile.educationList),

    // Experience (Requirement 1.3)
    experience: mapExperienceList(profile.experienceList),

    // Computer Skills (Requirement 1.4)
    computerSkills: mapSkillsList(profile.computerSkills),

    // Software Skills (Requirement 1.4)
    softwareSkills: mapSkillsList(profile.softwareSkills),

    // Other Skills (Requirement 1.4)
    otherSkills: profile.otherSkills || [],

    // Languages (Requirement 1.5)
    languages: mapLanguagesList(profile.languages),

    // Additional fields
    specialization: profile.specialization || '',
    interests: profile.interests || [],
    bio: profile.bio || '',
    cvFile: profile.cvFile || ''
  };
}

/**
 * Builds full name from firstName and lastName
 * Handles missing names gracefully (Requirement 1.7)
 */
function buildFullName(profile) {
  const firstName = profile.firstName || '';
  const lastName = profile.lastName || '';
  
  if (!firstName && !lastName) {
    return '';
  }
  
  return `${firstName} ${lastName}`.trim();
}

/**
 * Maps education list from profile to form format
 * Handles missing or empty arrays (Requirement 1.7)
 */
function mapEducationList(educationList) {
  if (!educationList || !Array.isArray(educationList) || educationList.length === 0) {
    return [];
  }

  return educationList.map(edu => ({
    level: edu.level || '',
    degree: edu.degree || '',
    institution: edu.institution || '',
    city: edu.city || '',
    country: edu.country || '',
    year: edu.year || '',
    grade: edu.grade || ''
  }));
}

/**
 * Maps experience list from profile to form format
 * Handles missing or empty arrays (Requirement 1.7)
 */
function mapExperienceList(experienceList) {
  if (!experienceList || !Array.isArray(experienceList) || experienceList.length === 0) {
    return [];
  }

  return experienceList.map(exp => ({
    company: exp.company || '',
    position: exp.position || '',
    from: exp.from ? new Date(exp.from) : null,
    to: exp.to ? new Date(exp.to) : null,
    current: !exp.to, // If no end date, assume current
    tasks: exp.tasks || '',
    workType: exp.workType || '',
    jobLevel: exp.jobLevel || '',
    country: exp.country || '',
    city: exp.city || ''
  }));
}

/**
 * Maps skills list from profile to form format
 * Handles missing or empty arrays (Requirement 1.7)
 */
function mapSkillsList(skillsList) {
  if (!skillsList || !Array.isArray(skillsList) || skillsList.length === 0) {
    return [];
  }

  return skillsList.map(skill => ({
    skill: skill.skill || skill.software || '',
    proficiency: skill.proficiency || 'beginner'
  }));
}

/**
 * Maps languages list from profile to form format
 * Handles missing or empty arrays (Requirement 1.7)
 */
function mapLanguagesList(languagesList) {
  if (!languagesList || !Array.isArray(languagesList) || languagesList.length === 0) {
    return [];
  }

  return languagesList.map(lang => ({
    language: lang.language || '',
    proficiency: lang.proficiency || 'beginner'
  }));
}

/**
 * Returns empty form data structure
 * Used when profile is missing or empty (Requirement 1.7)
 */
export function getEmptyFormData() {
  return {
    fullName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    education: [],
    experience: [],
    computerSkills: [],
    softwareSkills: [],
    otherSkills: [],
    languages: [],
    specialization: '',
    interests: [],
    bio: '',
    cvFile: ''
  };
}

/**
 * Loads profile data and returns mapped form data
 * Main entry point for auto-fill functionality
 * 
 * @param {string} userId - The user ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Mapped form data ready for auto-fill
 */
export async function loadProfileDataForAutoFill(userId, token) {
  try {
    const profile = await fetchUserProfile(userId, token);
    return mapProfileToFormData(profile);
  } catch (error) {
    console.error('Error loading profile for auto-fill:', error);
    // Return empty form data on error (Requirement 1.7)
    return getEmptyFormData();
  }
}

/**
 * Validates that auto-filled data matches profile data
 * Used for testing and verification
 * 
 * @param {Object} profile - Original profile data
 * @param {Object} formData - Auto-filled form data
 * @returns {Object} Validation result with match status and details
 */
export function validateAutoFillCompleteness(profile, formData) {
  const results = {
    isComplete: true,
    mismatches: [],
    entryCounts: {
      education: {
        profile: profile.educationList?.length || 0,
        form: formData.education?.length || 0,
        match: (profile.educationList?.length || 0) === (formData.education?.length || 0)
      },
      experience: {
        profile: profile.experienceList?.length || 0,
        form: formData.experience?.length || 0,
        match: (profile.experienceList?.length || 0) === (formData.experience?.length || 0)
      },
      computerSkills: {
        profile: profile.computerSkills?.length || 0,
        form: formData.computerSkills?.length || 0,
        match: (profile.computerSkills?.length || 0) === (formData.computerSkills?.length || 0)
      },
      softwareSkills: {
        profile: profile.softwareSkills?.length || 0,
        form: formData.softwareSkills?.length || 0,
        match: (profile.softwareSkills?.length || 0) === (formData.softwareSkills?.length || 0)
      },
      languages: {
        profile: profile.languages?.length || 0,
        form: formData.languages?.length || 0,
        match: (profile.languages?.length || 0) === (formData.languages?.length || 0)
      }
    }
  };

  // Check if all entry counts match
  Object.values(results.entryCounts).forEach(count => {
    if (!count.match) {
      results.isComplete = false;
      results.mismatches.push(`Entry count mismatch: ${count.profile} vs ${count.form}`);
    }
  });

  return results;
}

export default {
  fetchUserProfile,
  mapProfileToFormData,
  loadProfileDataForAutoFill,
  getEmptyFormData,
  validateAutoFillCompleteness
};
