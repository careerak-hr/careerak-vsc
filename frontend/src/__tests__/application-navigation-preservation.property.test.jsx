import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import fc from 'fast-check';
import { ApplicationProvider, useApplicationForm } from '../context/ApplicationContext';

/**
 * Property Test 12: Navigation data preservation
 * 
 * Property: For any form data entered across multiple steps, navigating forward 
 * and backward between steps (including to preview and back) should preserve all 
 * entered data without loss or modification.
 * 
 * Validates: Requirements 3.5, 7.7
 * 
 * Feature: apply-page-enhancements
 */

// Arbitraries for generating random form data
const educationEntryArbitrary = fc.record({
  level: fc.constantFrom('High School', 'Bachelor', 'Master', 'PhD'),
  degree: fc.string({ minLength: 3, maxLength: 50 }),
  institution: fc.string({ minLength: 5, maxLength: 100 }),
  city: fc.string({ minLength: 3, maxLength: 50 }),
  country: fc.string({ minLength: 3, maxLength: 50 }),
  year: fc.integer({ min: 1980, max: 2024 }).map(String),
  grade: fc.string({ minLength: 1, maxLength: 10 }),
});

const experienceEntryArbitrary = fc.record({
  company: fc.string({ minLength: 3, maxLength: 100 }),
  position: fc.string({ minLength: 3, maxLength: 100 }),
  from: fc.date({ min: new Date('2000-01-01'), max: new Date('2025-12-31') }).map(d => d.toISOString()),
  to: fc.date({ min: new Date('2000-01-01'), max: new Date('2027-12-31') }).map(d => d.toISOString()),
  current: fc.boolean(),
  tasks: fc.string({ minLength: 10, maxLength: 500 }),
  workType: fc.constantFrom('Full-time', 'Part-time', 'Contract', 'Freelance'),
  jobLevel: fc.constantFrom('Entry', 'Mid', 'Senior', 'Lead', 'Manager'),
  country: fc.string({ minLength: 3, maxLength: 50 }),
  city: fc.string({ minLength: 3, maxLength: 50 }),
});

const skillArbitrary = fc.record({
  skill: fc.string({ minLength: 2, maxLength: 50 }),
  proficiency: fc.constantFrom('beginner', 'intermediate', 'advanced', 'expert'),
});

const languageArbitrary = fc.record({
  language: fc.string({ minLength: 3, maxLength: 30 }),
  proficiency: fc.constantFrom('beginner', 'intermediate', 'advanced', 'native'),
});

const fileArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 5, maxLength: 50 }).map(s => `${s}.pdf`),
  size: fc.integer({ min: 1000, max: 5000000 }),
  type: fc.constantFrom('application/pdf', 'image/jpeg', 'image/png'),
  url: fc.webUrl(),
  cloudinaryId: fc.uuid(),
  uploadedAt: fc.date().map(d => d.toISOString()),
});

const formDataArbitrary = fc.record({
  // Step 1: Personal Information
  fullName: fc.string({ minLength: 5, maxLength: 100 }),
  email: fc.emailAddress(),
  phone: fc.string({ minLength: 10, maxLength: 15 }),
  country: fc.string({ minLength: 3, maxLength: 50 }),
  city: fc.string({ minLength: 3, maxLength: 50 }),
  
  // Step 2: Education & Experience
  education: fc.array(educationEntryArbitrary, { minLength: 0, maxLength: 5 }),
  experience: fc.array(experienceEntryArbitrary, { minLength: 0, maxLength: 5 }),
  
  // Step 3: Skills & Languages
  computerSkills: fc.array(skillArbitrary, { minLength: 0, maxLength: 10 }),
  softwareSkills: fc.array(skillArbitrary, { minLength: 0, maxLength: 10 }),
  otherSkills: fc.array(fc.string({ minLength: 2, maxLength: 50 }), { minLength: 0, maxLength: 10 }),
  languages: fc.array(languageArbitrary, { minLength: 0, maxLength: 5 }),
  
  // Step 4: Documents
  files: fc.array(fileArbitrary, { minLength: 0, maxLength: 10 }),
  
  // Additional fields
  coverLetter: fc.string({ minLength: 0, maxLength: 1000 }),
  expectedSalary: fc.integer({ min: 0, max: 500000 }).map(String),
  availableFrom: fc.date({ min: new Date('2026-01-01'), max: new Date('2027-12-31') }).map(d => d.toISOString()),
  noticePeriod: fc.constantFrom('Immediate', '1 week', '2 weeks', '1 month', '2 months', '3 months'),
});

// Navigation sequence arbitrary (forward and backward)
const navigationSequenceArbitrary = fc.array(
  fc.integer({ min: 1, max: 5 }),
  { minLength: 5, maxLength: 20 }
);

describe('Property Test 12: Navigation data preservation', () => {
  const wrapper = ({ children }) => (
    <ApplicationProvider jobPostingId="test-job-123">
      {children}
    </ApplicationProvider>
  );

  it('should preserve all form data across forward and backward navigation', () => {
    fc.assert(
      fc.property(formDataArbitrary, navigationSequenceArbitrary, (formData, navigationSequence) => {
        const { result } = renderHook(() => useApplicationForm(), { wrapper });

        // Populate form with generated data
        act(() => {
          // Step 1 fields
          result.current.setField('fullName', formData.fullName);
          result.current.setField('email', formData.email);
          result.current.setField('phone', formData.phone);
          result.current.setField('country', formData.country);
          result.current.setField('city', formData.city);

          // Step 2 fields
          formData.education.forEach(entry => {
            result.current.addEducationEntry(entry);
          });
          formData.experience.forEach(entry => {
            result.current.addExperienceEntry(entry);
          });

          // Step 3 fields
          formData.computerSkills.forEach(skill => {
            result.current.addSkill('computerSkills', skill);
          });
          formData.softwareSkills.forEach(skill => {
            result.current.addSkill('softwareSkills', skill);
          });
          formData.otherSkills.forEach(skill => {
            result.current.addSkill('otherSkills', skill);
          });
          formData.languages.forEach(lang => {
            result.current.addLanguage(lang);
          });

          // Step 4 fields
          result.current.setFiles(formData.files);

          // Additional fields
          result.current.setField('coverLetter', formData.coverLetter);
          result.current.setField('expectedSalary', formData.expectedSalary);
          result.current.setField('availableFrom', formData.availableFrom);
          result.current.setField('noticePeriod', formData.noticePeriod);
        });

        // Store original data for comparison
        const originalData = JSON.parse(JSON.stringify(result.current.formData));

        // Simulate navigation sequence
        act(() => {
          navigationSequence.forEach(step => {
            result.current.setStep(step);
          });
        });

        // Verify data is preserved after navigation
        const finalData = result.current.formData;

        // Compare all fields
        expect(finalData.fullName).toBe(originalData.fullName);
        expect(finalData.email).toBe(originalData.email);
        expect(finalData.phone).toBe(originalData.phone);
        expect(finalData.country).toBe(originalData.country);
        expect(finalData.city).toBe(originalData.city);

        // Compare arrays
        expect(finalData.education).toEqual(originalData.education);
        expect(finalData.experience).toEqual(originalData.experience);
        expect(finalData.computerSkills).toEqual(originalData.computerSkills);
        expect(finalData.softwareSkills).toEqual(originalData.softwareSkills);
        expect(finalData.otherSkills).toEqual(originalData.otherSkills);
        expect(finalData.languages).toEqual(originalData.languages);
        expect(finalData.files).toEqual(originalData.files);

        // Compare additional fields
        expect(finalData.coverLetter).toBe(originalData.coverLetter);
        expect(finalData.expectedSalary).toBe(originalData.expectedSalary);
        expect(finalData.availableFrom).toBe(originalData.availableFrom);
        expect(finalData.noticePeriod).toBe(originalData.noticePeriod);

        // Verify no data loss
        expect(JSON.stringify(finalData)).toBe(JSON.stringify(originalData));
      }),
      { numRuns: 100 } // Run 100 iterations
    );
  });

  it('should preserve data when navigating to preview (step 5) and back', () => {
    fc.assert(
      fc.property(formDataArbitrary, (formData) => {
        const { result } = renderHook(() => useApplicationForm(), { wrapper });

        // Populate form
        act(() => {
          result.current.setField('fullName', formData.fullName);
          result.current.setField('email', formData.email);
          formData.education.forEach(entry => {
            result.current.addEducationEntry(entry);
          });
        });

        const originalData = JSON.parse(JSON.stringify(result.current.formData));

        // Navigate to preview and back
        act(() => {
          result.current.setStep(5); // Preview
          result.current.setStep(1); // Back to step 1
          result.current.setStep(2); // To step 2
          result.current.setStep(5); // Back to preview
          result.current.setStep(3); // To step 3
        });

        const finalData = result.current.formData;

        // Verify no data loss
        expect(JSON.stringify(finalData)).toBe(JSON.stringify(originalData));
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve modified data after user edits during navigation', () => {
    fc.assert(
      fc.property(
        formDataArbitrary,
        fc.string({ minLength: 5, maxLength: 100 }),
        (formData, newName) => {
          const { result } = renderHook(() => useApplicationForm(), { wrapper });

          // Initial data
          act(() => {
            result.current.setField('fullName', formData.fullName);
            result.current.setField('email', formData.email);
          });

          // Navigate and modify
          act(() => {
            result.current.setStep(2);
            result.current.setStep(1);
            result.current.setField('fullName', newName); // User modifies
            result.current.setStep(3);
            result.current.setStep(1);
          });

          // Verify modified value is preserved
          expect(result.current.formData.fullName).toBe(newName);
          expect(result.current.formData.email).toBe(formData.email);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve array data (education, experience) across navigation', () => {
    fc.assert(
      fc.property(
        fc.array(educationEntryArbitrary, { minLength: 1, maxLength: 5 }),
        fc.array(experienceEntryArbitrary, { minLength: 1, maxLength: 5 }),
        (education, experience) => {
          const { result } = renderHook(() => useApplicationForm(), { wrapper });

          // Add entries
          act(() => {
            education.forEach(entry => result.current.addEducationEntry(entry));
            experience.forEach(entry => result.current.addExperienceEntry(entry));
          });

          const originalEducation = JSON.parse(JSON.stringify(result.current.formData.education));
          const originalExperience = JSON.parse(JSON.stringify(result.current.formData.experience));

          // Navigate through all steps
          act(() => {
            [1, 2, 3, 4, 5, 4, 3, 2, 1, 5].forEach(step => {
              result.current.setStep(step);
            });
          });

          // Verify arrays are preserved
          expect(result.current.formData.education).toEqual(originalEducation);
          expect(result.current.formData.experience).toEqual(originalExperience);
          expect(result.current.formData.education.length).toBe(education.length);
          expect(result.current.formData.experience.length).toBe(experience.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve file references across navigation', () => {
    fc.assert(
      fc.property(
        fc.array(fileArbitrary, { minLength: 1, maxLength: 10 }),
        (files) => {
          const { result } = renderHook(() => useApplicationForm(), { wrapper });

          // Add files
          act(() => {
            result.current.setFiles(files);
          });

          const originalFiles = JSON.parse(JSON.stringify(result.current.formData.files));

          // Navigate
          act(() => {
            result.current.setStep(4); // Documents step
            result.current.setStep(5); // Preview
            result.current.setStep(1); // Back to start
            result.current.setStep(4); // Back to documents
          });

          // Verify files are preserved
          expect(result.current.formData.files).toEqual(originalFiles);
          expect(result.current.formData.files.length).toBe(files.length);
          
          // Verify each file's properties
          result.current.formData.files.forEach((file, index) => {
            expect(file.id).toBe(originalFiles[index].id);
            expect(file.name).toBe(originalFiles[index].name);
            expect(file.url).toBe(originalFiles[index].url);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
