/**
 * Unit Tests for Auto-Fill Functionality
 * 
 * Tests specific examples, edge cases, and error conditions
 * Requirements: 1.1, 1.6, 1.7
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchUserProfile,
  mapProfileToFormData,
  loadProfileDataForAutoFill,
  getEmptyFormData,
  validateAutoFillCompleteness
} from '../services/profileDataLoader';

// ============================================================================
// Mock Data
// ============================================================================

const mockCompleteProfile = {
  firstName: 'Ahmed',
  lastName: 'Hassan',
  email: 'ahmed.hassan@example.com',
  phone: '+201234567890',
  country: 'Egypt',
  city: 'Cairo',
  educationList: [
    {
      level: 'bachelor',
      degree: 'Computer Science',
      institution: 'Cairo University',
      city: 'Cairo',
      country: 'Egypt',
      year: '2020',
      grade: 'excellent'
    },
    {
      level: 'master',
      degree: 'Software Engineering',
      institution: 'AUC',
      city: 'Cairo',
      country: 'Egypt',
      year: '2022',
      grade: 'very_good'
    }
  ],
  experienceList: [
    {
      company: 'Tech Corp',
      position: 'Software Engineer',
      from: new Date('2020-06-01'),
      to: new Date('2022-12-31'),
      tasks: 'Developed web applications',
      workType: 'technical',
      jobLevel: 'Mid-level',
      country: 'Egypt',
      city: 'Cairo'
    },
    {
      company: 'Startup Inc',
      position: 'Senior Developer',
      from: new Date('2023-01-01'),
      to: null, // Current job
      tasks: 'Leading development team',
      workType: 'technical',
      jobLevel: 'Senior',
      country: 'Egypt',
      city: 'Cairo'
    }
  ],
  computerSkills: [
    { skill: 'JavaScript', proficiency: 'expert' },
    { skill: 'Python', proficiency: 'advanced' },
    { skill: 'Java', proficiency: 'intermediate' }
  ],
  softwareSkills: [
    { software: 'React', proficiency: 'expert' },
    { software: 'Node.js', proficiency: 'advanced' }
  ],
  otherSkills: ['Problem Solving', 'Team Leadership', 'Agile'],
  languages: [
    { language: 'Arabic', proficiency: 'native' },
    { language: 'English', proficiency: 'advanced' },
    { language: 'French', proficiency: 'intermediate' }
  ],
  specialization: 'Full Stack Development',
  interests: ['AI', 'Machine Learning', 'Cloud Computing'],
  bio: 'Passionate software engineer with 5 years of experience',
  cvFile: 'https://example.com/cv.pdf'
};

const mockPartialProfile = {
  firstName: 'Sara',
  lastName: 'Ali',
  email: 'sara.ali@example.com',
  phone: '+201987654321',
  country: 'Egypt',
  city: 'Alexandria',
  educationList: [
    {
      level: 'bachelor',
      degree: 'Business Administration',
      institution: 'Alexandria University',
      city: 'Alexandria',
      country: 'Egypt',
      year: '2021',
      grade: 'good'
    }
  ],
  experienceList: [],
  computerSkills: [],
  softwareSkills: [],
  otherSkills: [],
  languages: [
    { language: 'Arabic', proficiency: 'native' }
  ]
};

const mockEmptyProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  educationList: [],
  experienceList: [],
  computerSkills: [],
  softwareSkills: [],
  otherSkills: [],
  languages: []
};

// ============================================================================
// Unit Tests
// ============================================================================

describe('Auto-Fill Service - Complete Profile', () => {
  it('should map complete profile to form data correctly', () => {
    const formData = mapProfileToFormData(mockCompleteProfile);

    // Personal information
    expect(formData.fullName).toBe('Ahmed Hassan');
    expect(formData.email).toBe('ahmed.hassan@example.com');
    expect(formData.phone).toBe('+201234567890');
    expect(formData.country).toBe('Egypt');
    expect(formData.city).toBe('Cairo');

    // Education
    expect(formData.education).toHaveLength(2);
    expect(formData.education[0].degree).toBe('Computer Science');
    expect(formData.education[1].degree).toBe('Software Engineering');

    // Experience
    expect(formData.experience).toHaveLength(2);
    expect(formData.experience[0].company).toBe('Tech Corp');
    expect(formData.experience[1].company).toBe('Startup Inc');
    expect(formData.experience[1].current).toBe(true); // No end date

    // Skills
    expect(formData.computerSkills).toHaveLength(3);
    expect(formData.softwareSkills).toHaveLength(2);
    expect(formData.otherSkills).toHaveLength(3);

    // Languages
    expect(formData.languages).toHaveLength(3);
    expect(formData.languages[0].language).toBe('Arabic');
    expect(formData.languages[0].proficiency).toBe('native');
  });

  it('should validate auto-fill completeness for complete profile', () => {
    const formData = mapProfileToFormData(mockCompleteProfile);
    const validation = validateAutoFillCompleteness(mockCompleteProfile, formData);

    expect(validation.isComplete).toBe(true);
    expect(validation.mismatches).toHaveLength(0);
    expect(validation.entryCounts.education.match).toBe(true);
    expect(validation.entryCounts.experience.match).toBe(true);
    expect(validation.entryCounts.computerSkills.match).toBe(true);
    expect(validation.entryCounts.languages.match).toBe(true);
  });
});

describe('Auto-Fill Service - Partial Profile', () => {
  it('should map partial profile to form data correctly', () => {
    const formData = mapProfileToFormData(mockPartialProfile);

    // Personal information should be filled
    expect(formData.fullName).toBe('Sara Ali');
    expect(formData.email).toBe('sara.ali@example.com');

    // Education should have 1 entry
    expect(formData.education).toHaveLength(1);
    expect(formData.education[0].degree).toBe('Business Administration');

    // Empty arrays should be empty
    expect(formData.experience).toHaveLength(0);
    expect(formData.computerSkills).toHaveLength(0);
    expect(formData.softwareSkills).toHaveLength(0);
    expect(formData.otherSkills).toHaveLength(0);

    // Languages should have 1 entry
    expect(formData.languages).toHaveLength(1);
  });

  it('should validate auto-fill completeness for partial profile', () => {
    const formData = mapProfileToFormData(mockPartialProfile);
    const validation = validateAutoFillCompleteness(mockPartialProfile, formData);

    expect(validation.isComplete).toBe(true);
    expect(validation.entryCounts.education.profile).toBe(1);
    expect(validation.entryCounts.education.form).toBe(1);
    expect(validation.entryCounts.experience.profile).toBe(0);
    expect(validation.entryCounts.experience.form).toBe(0);
  });
});

describe('Auto-Fill Service - Empty Profile', () => {
  it('should handle empty profile without errors', () => {
    const formData = mapProfileToFormData(mockEmptyProfile);

    expect(formData.fullName).toBe('');
    expect(formData.email).toBe('');
    expect(formData.phone).toBe('');
    expect(formData.education).toEqual([]);
    expect(formData.experience).toEqual([]);
    expect(formData.computerSkills).toEqual([]);
    expect(formData.languages).toEqual([]);
  });

  it('should handle null profile', () => {
    const formData = mapProfileToFormData(null);
    const emptyData = getEmptyFormData();

    expect(formData).toEqual(emptyData);
  });

  it('should handle undefined profile', () => {
    const formData = mapProfileToFormData(undefined);
    const emptyData = getEmptyFormData();

    expect(formData).toEqual(emptyData);
  });
});

describe('Auto-Fill Service - Field Modification', () => {
  it('should allow modification of auto-filled fields', () => {
    const formData = mapProfileToFormData(mockCompleteProfile);
    const originalName = formData.fullName;

    // Modify field
    formData.fullName = 'Modified Name';

    expect(formData.fullName).toBe('Modified Name');
    expect(formData.fullName).not.toBe(originalName);
  });

  it('should allow modification of array fields', () => {
    const formData = mapProfileToFormData(mockCompleteProfile);
    const originalDegree = formData.education[0].degree;

    // Modify array field
    formData.education[0].degree = 'Modified Degree';

    expect(formData.education[0].degree).toBe('Modified Degree');
    expect(formData.education[0].degree).not.toBe(originalDegree);
  });

  it('should allow adding new entries to arrays', () => {
    const formData = mapProfileToFormData(mockCompleteProfile);
    const originalLength = formData.education.length;

    // Add new entry
    formData.education.push({
      level: 'phd',
      degree: 'Computer Science',
      institution: 'MIT',
      city: 'Boston',
      country: 'USA',
      year: '2024',
      grade: 'excellent'
    });

    expect(formData.education.length).toBe(originalLength + 1);
    expect(formData.education[formData.education.length - 1].institution).toBe('MIT');
  });

  it('should allow removing entries from arrays', () => {
    const formData = mapProfileToFormData(mockCompleteProfile);
    const originalLength = formData.education.length;

    // Remove entry
    formData.education.pop();

    expect(formData.education.length).toBe(originalLength - 1);
  });
});

describe('Auto-Fill Service - Edge Cases', () => {
  it('should handle profile with only firstName', () => {
    const profile = { firstName: 'Ahmed', lastName: '' };
    const formData = mapProfileToFormData(profile);

    expect(formData.fullName).toBe('Ahmed');
  });

  it('should handle profile with only lastName', () => {
    const profile = { firstName: '', lastName: 'Hassan' };
    const formData = mapProfileToFormData(profile);

    expect(formData.fullName).toBe('Hassan');
  });

  it('should handle profile with whitespace in names', () => {
    const profile = { firstName: '  Ahmed  ', lastName: '  Hassan  ' };
    const formData = mapProfileToFormData(profile);

    expect(formData.fullName).toBe('Ahmed   Hassan'); // Trim happens on outer spaces only
  });

  it('should handle experience with null end date as current job', () => {
    const profile = {
      experienceList: [
        {
          company: 'Current Company',
          position: 'Developer',
          from: new Date('2023-01-01'),
          to: null
        }
      ]
    };

    const formData = mapProfileToFormData(profile);

    expect(formData.experience[0].current).toBe(true);
    expect(formData.experience[0].to).toBeNull();
  });

  it('should handle experience with end date as past job', () => {
    const profile = {
      experienceList: [
        {
          company: 'Past Company',
          position: 'Developer',
          from: new Date('2020-01-01'),
          to: new Date('2022-12-31')
        }
      ]
    };

    const formData = mapProfileToFormData(profile);

    expect(formData.experience[0].current).toBe(false);
    expect(formData.experience[0].to).toBeInstanceOf(Date);
  });

  it('should handle skills with missing proficiency', () => {
    const profile = {
      computerSkills: [
        { skill: 'JavaScript' } // Missing proficiency
      ]
    };

    const formData = mapProfileToFormData(profile);

    expect(formData.computerSkills[0].proficiency).toBe('beginner'); // Default
  });

  it('should handle languages with missing proficiency', () => {
    const profile = {
      languages: [
        { language: 'Arabic' } // Missing proficiency
      ]
    };

    const formData = mapProfileToFormData(profile);

    expect(formData.languages[0].proficiency).toBe('beginner'); // Default
  });
});

describe('Auto-Fill Service - API Integration', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch user profile successfully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompleteProfile
    });

    const profile = await fetchUserProfile('user123', 'token123');

    expect(profile).toEqual(mockCompleteProfile);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/users/user123'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer token123'
        })
      })
    );
  });

  it('should throw error on failed fetch', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found'
    });

    await expect(fetchUserProfile('user123', 'token123')).rejects.toThrow('Failed to fetch profile');
  });

  it('should load profile data for auto-fill successfully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompleteProfile
    });

    const formData = await loadProfileDataForAutoFill('user123', 'token123');

    expect(formData.fullName).toBe('Ahmed Hassan');
    expect(formData.education).toHaveLength(2);
  });

  it('should return empty form data on API error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const formData = await loadProfileDataForAutoFill('user123', 'token123');
    const emptyData = getEmptyFormData();

    expect(formData).toEqual(emptyData);
  });
});

describe('Auto-Fill Service - Validation', () => {
  it('should detect entry count mismatch', () => {
    const profile = mockCompleteProfile;
    const formData = mapProfileToFormData(profile);

    // Manually remove an education entry to create mismatch
    formData.education.pop();

    const validation = validateAutoFillCompleteness(profile, formData);

    expect(validation.isComplete).toBe(false);
    expect(validation.entryCounts.education.match).toBe(false);
    expect(validation.mismatches.length).toBeGreaterThan(0);
  });

  it('should validate empty profile correctly', () => {
    const profile = mockEmptyProfile;
    const formData = mapProfileToFormData(profile);

    const validation = validateAutoFillCompleteness(profile, formData);

    expect(validation.isComplete).toBe(true);
    expect(validation.entryCounts.education.profile).toBe(0);
    expect(validation.entryCounts.education.form).toBe(0);
  });
});

// ============================================================================
// Tag for feature identification
// ============================================================================
describe.tags = ['Feature: apply-page-enhancements', 'Unit Tests', 'Auto-fill'];
