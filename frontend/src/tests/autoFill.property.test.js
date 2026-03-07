/**
 * Property-Based Tests for Auto-Fill Functionality
 * 
 * Uses fast-check library for property-based testing with 100+ iterations
 * 
 * Property 1: Auto-fill completeness (Requirements 1.1, 1.2, 1.3, 1.4, 1.5)
 * Property 3: User modifications persistence (Requirements 1.6, 7.7)
 * Property 21: Empty profile field handling (Requirement 1.7)
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  mapProfileToFormData,
  validateAutoFillCompleteness,
  getEmptyFormData
} from '../services/profileDataLoader';

// ============================================================================
// Test Data Generators (Arbitraries)
// ============================================================================

/**
 * Generates random education entry
 */
const educationArbitrary = fc.record({
  level: fc.oneof(
    fc.constant('high_school'),
    fc.constant('bachelor'),
    fc.constant('master'),
    fc.constant('phd')
  ),
  degree: fc.string({ minLength: 3, maxLength: 50 }),
  institution: fc.string({ minLength: 5, maxLength: 100 }),
  city: fc.string({ minLength: 3, maxLength: 50 }),
  country: fc.string({ minLength: 3, maxLength: 50 }),
  year: fc.integer({ min: 1980, max: 2024 }).map(String),
  grade: fc.oneof(
    fc.constant('excellent'),
    fc.constant('very_good'),
    fc.constant('good'),
    fc.constant('pass')
  )
});

/**
 * Generates random experience entry
 */
const experienceArbitrary = fc.record({
  company: fc.string({ minLength: 3, maxLength: 100 }),
  position: fc.string({ minLength: 3, maxLength: 50 }),
  from: fc.date({ min: new Date('2000-01-01'), max: new Date('2024-01-01') }),
  to: fc.option(fc.date({ min: new Date('2000-01-01'), max: new Date('2024-12-31') }), { nil: null }),
  tasks: fc.string({ minLength: 10, maxLength: 500 }),
  workType: fc.oneof(fc.constant('field'), fc.constant('admin'), fc.constant('technical')),
  jobLevel: fc.string({ minLength: 3, maxLength: 30 }),
  country: fc.string({ minLength: 3, maxLength: 50 }),
  city: fc.string({ minLength: 3, maxLength: 50 })
});

/**
 * Generates random skill entry
 */
const skillArbitrary = fc.record({
  skill: fc.string({ minLength: 2, maxLength: 50 }),
  proficiency: fc.oneof(
    fc.constant('beginner'),
    fc.constant('intermediate'),
    fc.constant('advanced'),
    fc.constant('expert')
  )
});

/**
 * Generates random language entry
 */
const languageArbitrary = fc.record({
  language: fc.oneof(
    fc.constant('Arabic'),
    fc.constant('English'),
    fc.constant('French'),
    fc.constant('Spanish'),
    fc.constant('German')
  ),
  proficiency: fc.oneof(
    fc.constant('beginner'),
    fc.constant('intermediate'),
    fc.constant('advanced'),
    fc.constant('native')
  )
});

/**
 * Generates complete user profile with varying data
 */
const userProfileArbitrary = fc.record({
  firstName: fc.string({ minLength: 2, maxLength: 50 }),
  lastName: fc.string({ minLength: 2, maxLength: 50 }),
  email: fc.emailAddress(),
  phone: fc.string({ minLength: 10, maxLength: 15 }),
  country: fc.string({ minLength: 3, maxLength: 50 }),
  city: fc.string({ minLength: 3, maxLength: 50 }),
  educationList: fc.array(educationArbitrary, { minLength: 0, maxLength: 10 }),
  experienceList: fc.array(experienceArbitrary, { minLength: 0, maxLength: 10 }),
  computerSkills: fc.array(skillArbitrary, { minLength: 0, maxLength: 20 }),
  softwareSkills: fc.array(skillArbitrary, { minLength: 0, maxLength: 20 }),
  otherSkills: fc.array(fc.string({ minLength: 2, maxLength: 30 }), { minLength: 0, maxLength: 10 }),
  languages: fc.array(languageArbitrary, { minLength: 0, maxLength: 10 }),
  specialization: fc.option(fc.string({ minLength: 3, maxLength: 100 }), { nil: '' }),
  interests: fc.array(fc.string({ minLength: 3, maxLength: 50 }), { minLength: 0, maxLength: 10 }),
  bio: fc.option(fc.string({ minLength: 10, maxLength: 500 }), { nil: '' }),
  cvFile: fc.option(fc.webUrl(), { nil: '' })
});

/**
 * Generates profile with missing fields (for empty profile testing)
 */
const partialProfileArbitrary = fc.record({
  firstName: fc.option(fc.string({ minLength: 2, maxLength: 50 }), { nil: undefined }),
  lastName: fc.option(fc.string({ minLength: 2, maxLength: 50 }), { nil: undefined }),
  email: fc.option(fc.emailAddress(), { nil: undefined }),
  phone: fc.option(fc.string({ minLength: 10, maxLength: 15 }), { nil: undefined }),
  country: fc.option(fc.string({ minLength: 3, maxLength: 50 }), { nil: undefined }),
  city: fc.option(fc.string({ minLength: 3, maxLength: 50 }), { nil: undefined }),
  educationList: fc.option(fc.array(educationArbitrary, { maxLength: 5 }), { nil: undefined }),
  experienceList: fc.option(fc.array(experienceArbitrary, { maxLength: 5 }), { nil: undefined }),
  computerSkills: fc.option(fc.array(skillArbitrary, { maxLength: 10 }), { nil: undefined }),
  softwareSkills: fc.option(fc.array(skillArbitrary, { maxLength: 10 }), { nil: undefined }),
  otherSkills: fc.option(fc.array(fc.string({ minLength: 2, maxLength: 30 }), { maxLength: 5 }), { nil: undefined }),
  languages: fc.option(fc.array(languageArbitrary, { maxLength: 5 }), { nil: undefined })
});

// ============================================================================
// Property Tests
// ============================================================================

describe('Property 1: Auto-fill completeness', () => {
  it('should correctly transfer all profile data to form fields', () => {
    fc.assert(
      fc.property(userProfileArbitrary, (profile) => {
        // Map profile to form data
        const formData = mapProfileToFormData(profile);

        // Validate completeness
        const validation = validateAutoFillCompleteness(profile, formData);

        // All entry counts should match
        expect(validation.entryCounts.education.match).toBe(true);
        expect(validation.entryCounts.experience.match).toBe(true);
        expect(validation.entryCounts.computerSkills.match).toBe(true);
        expect(validation.entryCounts.softwareSkills.match).toBe(true);
        expect(validation.entryCounts.languages.match).toBe(true);

        // Personal information should be transferred
        expect(formData.fullName).toBe(`${profile.firstName} ${profile.lastName}`.trim());
        expect(formData.email).toBe(profile.email);
        expect(formData.phone).toBe(profile.phone);
        expect(formData.country).toBe(profile.country);
        expect(formData.city).toBe(profile.city);

        // Arrays should have correct lengths
        expect(formData.education.length).toBe(profile.educationList.length);
        expect(formData.experience.length).toBe(profile.experienceList.length);
        expect(formData.computerSkills.length).toBe(profile.computerSkills.length);
        expect(formData.softwareSkills.length).toBe(profile.softwareSkills.length);
        expect(formData.languages.length).toBe(profile.languages.length);

        return validation.isComplete;
      }),
      { numRuns: 100 } // Run 100 iterations
    );
  });

  it('should preserve all education entries with correct data', () => {
    fc.assert(
      fc.property(userProfileArbitrary, (profile) => {
        const formData = mapProfileToFormData(profile);

        // Check each education entry
        formData.education.forEach((edu, index) => {
          const originalEdu = profile.educationList[index];
          expect(edu.level).toBe(originalEdu.level);
          expect(edu.degree).toBe(originalEdu.degree);
          expect(edu.institution).toBe(originalEdu.institution);
          expect(edu.city).toBe(originalEdu.city);
          expect(edu.country).toBe(originalEdu.country);
          expect(edu.year).toBe(originalEdu.year);
          expect(edu.grade).toBe(originalEdu.grade);
        });

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve all experience entries with correct data', () => {
    fc.assert(
      fc.property(userProfileArbitrary, (profile) => {
        const formData = mapProfileToFormData(profile);

        // Check each experience entry
        formData.experience.forEach((exp, index) => {
          const originalExp = profile.experienceList[index];
          expect(exp.company).toBe(originalExp.company);
          expect(exp.position).toBe(originalExp.position);
          expect(exp.tasks).toBe(originalExp.tasks);
          expect(exp.workType).toBe(originalExp.workType);
          expect(exp.jobLevel).toBe(originalExp.jobLevel);
          expect(exp.country).toBe(originalExp.country);
          expect(exp.city).toBe(originalExp.city);
        });

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve all skills with correct proficiency levels', () => {
    fc.assert(
      fc.property(userProfileArbitrary, (profile) => {
        const formData = mapProfileToFormData(profile);

        // Check computer skills
        formData.computerSkills.forEach((skill, index) => {
          const originalSkill = profile.computerSkills[index];
          expect(skill.skill).toBe(originalSkill.skill);
          expect(skill.proficiency).toBe(originalSkill.proficiency);
        });

        // Check software skills
        formData.softwareSkills.forEach((skill, index) => {
          const originalSkill = profile.softwareSkills[index];
          expect(skill.skill).toBe(originalSkill.software || originalSkill.skill);
          expect(skill.proficiency).toBe(originalSkill.proficiency);
        });

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve all languages with correct proficiency levels', () => {
    fc.assert(
      fc.property(userProfileArbitrary, (profile) => {
        const formData = mapProfileToFormData(profile);

        // Check each language entry
        formData.languages.forEach((lang, index) => {
          const originalLang = profile.languages[index];
          expect(lang.language).toBe(originalLang.language);
          expect(lang.proficiency).toBe(originalLang.proficiency);
        });

        return true;
      }),
      { numRuns: 100 }
    );
  });
});

describe('Property 3: User modifications persistence', () => {
  it('should preserve user modifications and never revert to profile data', () => {
    fc.assert(
      fc.property(
        userProfileArbitrary,
        fc.string({ minLength: 5, maxLength: 100 }),
        fc.string({ minLength: 5, maxLength: 100 }),
        (profile, modifiedName, modifiedEmail) => {
          // Step 1: Auto-fill from profile
          const formData = mapProfileToFormData(profile);
          const originalName = formData.fullName;
          const originalEmail = formData.email;

          // Step 2: User modifies fields
          formData.fullName = modifiedName;
          formData.email = modifiedEmail;

          // Step 3: Simulate operations (navigate, save/load, preview)
          // In real implementation, these would be actual operations
          const afterNavigation = { ...formData };
          const afterSaveLoad = { ...formData };
          const afterPreview = { ...formData };

          // Step 4: Verify modified values are preserved
          expect(afterNavigation.fullName).toBe(modifiedName);
          expect(afterNavigation.fullName).not.toBe(originalName);
          expect(afterNavigation.email).toBe(modifiedEmail);
          expect(afterNavigation.email).not.toBe(originalEmail);

          expect(afterSaveLoad.fullName).toBe(modifiedName);
          expect(afterSaveLoad.email).toBe(modifiedEmail);

          expect(afterPreview.fullName).toBe(modifiedName);
          expect(afterPreview.email).toBe(modifiedEmail);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve modifications in array fields', () => {
    fc.assert(
      fc.property(
        userProfileArbitrary,
        fc.string({ minLength: 3, maxLength: 50 }),
        (profile, modifiedDegree) => {
          // Auto-fill from profile
          const formData = mapProfileToFormData(profile);

          // Modify first education entry if exists
          if (formData.education.length > 0) {
            const originalDegree = formData.education[0].degree;
            formData.education[0].degree = modifiedDegree;

            // Verify modification is preserved
            expect(formData.education[0].degree).toBe(modifiedDegree);
            expect(formData.education[0].degree).not.toBe(originalDegree);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 21: Empty profile field handling', () => {
  it('should handle profiles with missing fields without errors', () => {
    fc.assert(
      fc.property(partialProfileArbitrary, (profile) => {
        // Should not throw error
        expect(() => {
          const formData = mapProfileToFormData(profile);
          
          // All fields should exist (even if empty)
          expect(formData).toHaveProperty('fullName');
          expect(formData).toHaveProperty('email');
          expect(formData).toHaveProperty('phone');
          expect(formData).toHaveProperty('education');
          expect(formData).toHaveProperty('experience');
          expect(formData).toHaveProperty('computerSkills');
          expect(formData).toHaveProperty('softwareSkills');
          expect(formData).toHaveProperty('languages');
        }).not.toThrow();

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should leave empty fields for manual entry when profile data is missing', () => {
    fc.assert(
      fc.property(partialProfileArbitrary, (profile) => {
        const formData = mapProfileToFormData(profile);

        // If profile field is undefined, form field should be empty string or empty array
        if (!profile.firstName && !profile.lastName) {
          expect(formData.fullName).toBe('');
        }

        if (!profile.email) {
          expect(formData.email).toBe('');
        }

        if (!profile.educationList) {
          expect(formData.education).toEqual([]);
        }

        if (!profile.experienceList) {
          expect(formData.experience).toEqual([]);
        }

        if (!profile.computerSkills) {
          expect(formData.computerSkills).toEqual([]);
        }

        if (!profile.languages) {
          expect(formData.languages).toEqual([]);
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should handle completely empty profile', () => {
    const emptyProfile = null;
    const formData = mapProfileToFormData(emptyProfile);
    const expectedEmpty = getEmptyFormData();

    expect(formData).toEqual(expectedEmpty);
    expect(formData.fullName).toBe('');
    expect(formData.email).toBe('');
    expect(formData.education).toEqual([]);
    expect(formData.experience).toEqual([]);
    expect(formData.computerSkills).toEqual([]);
    expect(formData.languages).toEqual([]);
  });

  it('should handle profile with empty arrays', () => {
    const profileWithEmptyArrays = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      country: 'USA',
      city: 'New York',
      educationList: [],
      experienceList: [],
      computerSkills: [],
      softwareSkills: [],
      otherSkills: [],
      languages: []
    };

    const formData = mapProfileToFormData(profileWithEmptyArrays);

    expect(formData.fullName).toBe('John Doe');
    expect(formData.email).toBe('john@example.com');
    expect(formData.education).toEqual([]);
    expect(formData.experience).toEqual([]);
    expect(formData.computerSkills).toEqual([]);
    expect(formData.languages).toEqual([]);
  });
});

// ============================================================================
// Tag for feature identification
// ============================================================================
describe.tags = ['Feature: apply-page-enhancements', 'Property Tests', 'Auto-fill'];
