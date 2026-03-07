/**
 * Property Test: Preview Data Completeness
 * 
 * Feature: apply-page-enhancements
 * Property 11: Preview data completeness
 * 
 * Validates: Requirements 3.2, 3.3
 * 
 * For any completed application form, the preview should display all entered data
 * including personal information, all education entries, all experience entries,
 * all skills, all uploaded files, and all custom question answers, with no data omitted.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import fc from 'fast-check';
import ApplicationPreview from '../components/Application/ApplicationPreview';
import { AppContext } from '../context/AppContext';

// Mock AppContext
const mockAppContext = {
  language: 'en',
  fontFamily: 'Arial, sans-serif',
};

// Arbitraries for generating test data
const personalInfoArbitrary = fc.record({
  fullName: fc.string({ minLength: 1, maxLength: 100 }),
  email: fc.emailAddress(),
  phone: fc.string({ minLength: 10, maxLength: 15 }),
  country: fc.option(fc.string({ minLength: 2, maxLength: 50 }), { nil: undefined }),
  city: fc.option(fc.string({ minLength: 2, maxLength: 50 }), { nil: undefined }),
});

const educationEntryArbitrary = fc.record({
  level: fc.constantFrom('High School', 'Bachelor', 'Master', 'PhD'),
  degree: fc.string({ minLength: 1, maxLength: 100 }),
  institution: fc.string({ minLength: 1, maxLength: 100 }),
  city: fc.option(fc.string({ minLength: 2, maxLength: 50 }), { nil: undefined }),
  country: fc.option(fc.string({ minLength: 2, maxLength: 50 }), { nil: undefined }),
  year: fc.integer({ min: 1950, max: 2030 }).map(String),
  grade: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
});

const experienceEntryArbitrary = fc.record({
  company: fc.string({ minLength: 1, maxLength: 100 }),
  position: fc.string({ minLength: 1, maxLength: 100 }),
  from: fc.date({ min: new Date('2000-01-01'), max: new Date() }),
  to: fc.option(fc.date({ min: new Date('2000-01-01'), max: new Date() }), { nil: undefined }),
  current: fc.boolean(),
  tasks: fc.option(fc.string({ minLength: 10, maxLength: 500 }), { nil: undefined }),
  workType: fc.option(fc.constantFrom('Full-time', 'Part-time', 'Contract', 'Freelance'), { nil: undefined }),
  jobLevel: fc.option(fc.constantFrom('Entry', 'Mid', 'Senior', 'Lead'), { nil: undefined }),
  city: fc.option(fc.string({ minLength: 2, maxLength: 50 }), { nil: undefined }),
  country: fc.option(fc.string({ minLength: 2, maxLength: 50 }), { nil: undefined }),
});

const skillArbitrary = fc.record({
  skill: fc.string({ minLength: 1, maxLength: 50 }),
  proficiency: fc.option(fc.constantFrom('Beginner', 'Intermediate', 'Advanced', 'Expert'), { nil: undefined }),
});

const languageArbitrary = fc.record({
  language: fc.string({ minLength: 2, maxLength: 50 }),
  proficiency: fc.option(fc.constantFrom('Beginner', 'Intermediate', 'Advanced', 'Native'), { nil: undefined }),
});

const fileArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 5, maxLength: 100 }).map(s => s + '.pdf'),
  size: fc.integer({ min: 1000, max: 5000000 }),
  type: fc.constantFrom('application/pdf', 'image/jpeg', 'image/png', 'application/msword'),
  url: fc.webUrl(),
});

const customAnswerArbitrary = fc.dictionary(
  fc.uuid(),
  fc.oneof(
    fc.string({ minLength: 1, maxLength: 500 }),
    fc.boolean(),
    fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 5 })
  )
);

const completeFormDataArbitrary = fc.record({
  ...personalInfoArbitrary.value,
  education: fc.array(educationEntryArbitrary, { minLength: 1, maxLength: 5 }),
  experience: fc.array(experienceEntryArbitrary, { minLength: 1, maxLength: 5 }),
  computerSkills: fc.array(skillArbitrary, { minLength: 1, maxLength: 10 }),
  softwareSkills: fc.array(skillArbitrary, { minLength: 0, maxLength: 10 }),
  otherSkills: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 0, maxLength: 10 }),
  languages: fc.array(languageArbitrary, { minLength: 1, maxLength: 5 }),
  files: fc.array(fileArbitrary, { minLength: 1, maxLength: 10 }),
  customAnswers: customAnswerArbitrary,
  coverLetter: fc.option(fc.string({ minLength: 50, maxLength: 1000 }), { nil: undefined }),
  expectedSalary: fc.option(fc.integer({ min: 20000, max: 200000 }).map(String), { nil: undefined }),
  availableFrom: fc.option(fc.date({ min: new Date(), max: new Date('2025-12-31') }), { nil: undefined }),
  noticePeriod: fc.option(fc.constantFrom('Immediate', '2 weeks', '1 month', '2 months'), { nil: undefined }),
});

describe('Property Test: Preview Data Completeness', () => {
  it('should display all personal information fields', () => {
    fc.assert(
      fc.property(personalInfoArbitrary, (personalInfo) => {
        const formData = {
          ...personalInfo,
          education: [],
          experience: [],
          computerSkills: [],
          softwareSkills: [],
          otherSkills: [],
          languages: [],
          files: [],
          customAnswers: {},
        };

        const { container } = render(
          <AppContext.Provider value={mockAppContext}>
            <ApplicationPreview
              formData={formData}
              onEdit={() => {}}
              onSubmit={() => {}}
              isSubmitting={false}
            />
          </AppContext.Provider>
        );

        // Verify personal information is displayed
        expect(container.textContent).toContain(personalInfo.fullName);
        expect(container.textContent).toContain(personalInfo.email);
        expect(container.textContent).toContain(personalInfo.phone);
        
        if (personalInfo.country) {
          expect(container.textContent).toContain(personalInfo.country);
        }
        
        if (personalInfo.city) {
          expect(container.textContent).toContain(personalInfo.city);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should display all education entries with complete details', () => {
    fc.assert(
      fc.property(
        fc.array(educationEntryArbitrary, { minLength: 1, maxLength: 5 }),
        (education) => {
          const formData = {
            fullName: 'Test User',
            email: 'test@example.com',
            phone: '1234567890',
            education,
            experience: [],
            computerSkills: [],
            softwareSkills: [],
            otherSkills: [],
            languages: [],
            files: [],
            customAnswers: {},
          };

          const { container } = render(
            <AppContext.Provider value={mockAppContext}>
              <ApplicationPreview
                formData={formData}
                onEdit={() => {}}
                onSubmit={() => {}}
                isSubmitting={false}
              />
            </AppContext.Provider>
          );

          // Verify all education entries are displayed
          education.forEach((entry) => {
            expect(container.textContent).toContain(entry.degree);
            expect(container.textContent).toContain(entry.institution);
            expect(container.textContent).toContain(entry.year);
          });

          // Verify count matches
          const educationCards = container.querySelectorAll('.entry-card');
          expect(educationCards.length).toBeGreaterThanOrEqual(education.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display all experience entries with complete details', () => {
    fc.assert(
      fc.property(
        fc.array(experienceEntryArbitrary, { minLength: 1, maxLength: 5 }),
        (experience) => {
          const formData = {
            fullName: 'Test User',
            email: 'test@example.com',
            phone: '1234567890',
            education: [],
            experience,
            computerSkills: [],
            softwareSkills: [],
            otherSkills: [],
            languages: [],
            files: [],
            customAnswers: {},
          };

          const { container } = render(
            <AppContext.Provider value={mockAppContext}>
              <ApplicationPreview
                formData={formData}
                onEdit={() => {}}
                onSubmit={() => {}}
                isSubmitting={false}
              />
            </AppContext.Provider>
          );

          // Verify all experience entries are displayed
          experience.forEach((entry) => {
            expect(container.textContent).toContain(entry.company);
            expect(container.textContent).toContain(entry.position);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display all skills from all categories', () => {
    fc.assert(
      fc.property(
        fc.array(skillArbitrary, { minLength: 1, maxLength: 10 }),
        fc.array(skillArbitrary, { minLength: 0, maxLength: 10 }),
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 0, maxLength: 10 }),
        (computerSkills, softwareSkills, otherSkills) => {
          const formData = {
            fullName: 'Test User',
            email: 'test@example.com',
            phone: '1234567890',
            education: [],
            experience: [],
            computerSkills,
            softwareSkills,
            otherSkills,
            languages: [],
            files: [],
            customAnswers: {},
          };

          const { container } = render(
            <AppContext.Provider value={mockAppContext}>
              <ApplicationPreview
                formData={formData}
                onEdit={() => {}}
                onSubmit={() => {}}
                isSubmitting={false}
              />
            </AppContext.Provider>
          );

          // Verify all computer skills are displayed
          computerSkills.forEach((skill) => {
            expect(container.textContent).toContain(skill.skill);
          });

          // Verify all software skills are displayed
          softwareSkills.forEach((skill) => {
            expect(container.textContent).toContain(skill.skill);
          });

          // Verify all other skills are displayed
          otherSkills.forEach((skill) => {
            expect(container.textContent).toContain(skill);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display all languages', () => {
    fc.assert(
      fc.property(
        fc.array(languageArbitrary, { minLength: 1, maxLength: 5 }),
        (languages) => {
          const formData = {
            fullName: 'Test User',
            email: 'test@example.com',
            phone: '1234567890',
            education: [],
            experience: [],
            computerSkills: [],
            softwareSkills: [],
            otherSkills: [],
            languages,
            files: [],
            customAnswers: {},
          };

          const { container } = render(
            <AppContext.Provider value={mockAppContext}>
              <ApplicationPreview
                formData={formData}
                onEdit={() => {}}
                onSubmit={() => {}}
                isSubmitting={false}
              />
            </AppContext.Provider>
          );

          // Verify all languages are displayed
          languages.forEach((lang) => {
            expect(container.textContent).toContain(lang.language);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display all uploaded files', () => {
    fc.assert(
      fc.property(
        fc.array(fileArbitrary, { minLength: 1, maxLength: 10 }),
        (files) => {
          const formData = {
            fullName: 'Test User',
            email: 'test@example.com',
            phone: '1234567890',
            education: [],
            experience: [],
            computerSkills: [],
            softwareSkills: [],
            otherSkills: [],
            languages: [],
            files,
            customAnswers: {},
          };

          const { container } = render(
            <AppContext.Provider value={mockAppContext}>
              <ApplicationPreview
                formData={formData}
                onEdit={() => {}}
                onSubmit={() => {}}
                isSubmitting={false}
              />
            </AppContext.Provider>
          );

          // Verify all files are displayed
          files.forEach((file) => {
            expect(container.textContent).toContain(file.name);
          });

          // Verify file count matches
          const fileItems = container.querySelectorAll('.file-item');
          expect(fileItems.length).toBe(files.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display all custom question answers', () => {
    fc.assert(
      fc.property(
        customAnswerArbitrary,
        (customAnswers) => {
          const formData = {
            fullName: 'Test User',
            email: 'test@example.com',
            phone: '1234567890',
            education: [],
            experience: [],
            computerSkills: [],
            softwareSkills: [],
            otherSkills: [],
            languages: [],
            files: [],
            customAnswers,
          };

          const { container } = render(
            <AppContext.Provider value={mockAppContext}>
              <ApplicationPreview
                formData={formData}
                onEdit={() => {}}
                onSubmit={() => {}}
                isSubmitting={false}
              />
            </AppContext.Provider>
          );

          // Verify all custom answers are displayed
          const answerCount = Object.keys(customAnswers).length;
          if (answerCount > 0) {
            const customAnswerElements = container.querySelectorAll('.custom-answer');
            expect(customAnswerElements.length).toBe(answerCount);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display complete application with all sections', () => {
    fc.assert(
      fc.property(completeFormDataArbitrary, (formData) => {
        const { container } = render(
          <AppContext.Provider value={mockAppContext}>
            <ApplicationPreview
              formData={formData}
              onEdit={() => {}}
              onSubmit={() => {}}
              isSubmitting={false}
            />
          </AppContext.Provider>
        );

        // Verify personal information
        expect(container.textContent).toContain(formData.fullName);
        expect(container.textContent).toContain(formData.email);
        expect(container.textContent).toContain(formData.phone);

        // Verify education count
        const educationCards = container.querySelectorAll('.entry-card');
        expect(educationCards.length).toBeGreaterThanOrEqual(formData.education.length);

        // Verify at least one skill is displayed
        const hasSkills = 
          formData.computerSkills.length > 0 ||
          formData.softwareSkills.length > 0 ||
          formData.otherSkills.length > 0;
        
        if (hasSkills) {
          const skillItems = container.querySelectorAll('.skill-item');
          expect(skillItems.length).toBeGreaterThan(0);
        }

        // Verify files count
        const fileItems = container.querySelectorAll('.file-item');
        expect(fileItems.length).toBe(formData.files.length);

        // Verify no data is omitted - all sections should be present
        expect(container.querySelector('.preview-section')).toBeTruthy();
      }),
      { numRuns: 50 } // Reduced runs for complex test
    );
  });
});
