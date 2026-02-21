/**
 * Structured Data Validation Tests
 * 
 * Tests structured data (JSON-LD) for compliance with schema.org standards
 * and Google Rich Results requirements.
 * 
 * Requirements:
 * - FR-SEO-6: JobPosting schema for job listings
 * - FR-SEO-7: Course schema for courses
 * - NFR-SEO-3: Include structured data for job postings and courses
 * - Property SEO-4: All jobs have structured data
 * 
 * Task: 6.3.5 Test structured data with Google Rich Results Test
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import StructuredData from '../components/SEO/StructuredData';
import extractStructuredData from '../utils/extractStructuredData';

describe('Structured Data Validation for Google Rich Results', () => {
  
  describe('JobPosting Schema Validation', () => {
    it('should validate JobPosting with all required fields', () => {
      const jobData = {
        title: 'Senior Software Engineer',
        description: 'We are looking for an experienced software engineer...',
        datePosted: '2024-01-15',
        hiringOrganization: {
          name: 'Tech Company Inc.',
          logo: 'https://example.com/logo.png',
          url: 'https://example.com'
        }
      };

      const validation = extractStructuredData.validateJobPosting(jobData);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should validate JobPosting with optional fields', () => {
      const jobData = {
        title: 'Senior Software Engineer',
        description: 'We are looking for an experienced software engineer...',
        datePosted: '2024-01-15',
        validThrough: '2024-03-15',
        employmentType: 'FULL_TIME',
        hiringOrganization: {
          name: 'Tech Company Inc.',
          logo: 'https://example.com/logo.png',
          url: 'https://example.com'
        },
        jobLocation: {
          streetAddress: '123 Main St',
          addressLocality: 'San Francisco',
          addressRegion: 'CA',
          postalCode: '94102',
          addressCountry: 'US'
        },
        baseSalary: {
          currency: 'USD',
          value: 120000,
          unitText: 'YEAR'
        }
      };

      const validation = extractStructuredData.validateJobPosting(jobData);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      
      // Verify optional fields are present
      expect(jobData.validThrough).toBe('2024-03-15');
      expect(jobData.employmentType).toBe('FULL_TIME');
      expect(jobData.jobLocation).toBeDefined();
      expect(jobData.baseSalary).toBeDefined();
    });

    it('should validate employmentType values are Google-compliant', () => {
      const validEmploymentTypes = [
        'FULL_TIME',
        'PART_TIME',
        'CONTRACTOR',
        'TEMPORARY',
        'INTERN',
        'VOLUNTEER',
        'PER_DIEM',
        'OTHER'
      ];

      validEmploymentTypes.forEach(employmentType => {
        const jobData = {
          title: 'Test Job',
          description: 'Test description',
          datePosted: '2024-01-15',
          employmentType,
          hiringOrganization: {
            name: 'Test Company'
          }
        };

        const validation = extractStructuredData.validateJobPosting(jobData);
        expect(validation.isValid).toBe(true);
      });
    });

    it('should reject JobPosting with invalid employmentType', () => {
      const jobData = {
        title: 'Test Job',
        description: 'Test description',
        datePosted: '2024-01-15',
        employmentType: 'full-time', // Invalid - must be uppercase
        hiringOrganization: {
          name: 'Test Company'
        }
      };

      const validation = extractStructuredData.validateJobPosting(jobData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('Invalid employmentType');
    });

    it('should reject JobPosting when required fields are missing', () => {
      const incompleteData = {
        title: 'Test Job',
        // Missing description, datePosted, hiringOrganization
      };

      const validation = extractStructuredData.validateJobPosting(incompleteData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should reject JobPosting with invalid date format', () => {
      const jobData = {
        title: 'Test Job',
        description: 'Test description',
        datePosted: '01/15/2024', // Invalid format
        hiringOrganization: {
          name: 'Test Company'
        }
      };

      const validation = extractStructuredData.validateJobPosting(jobData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('Invalid date format'))).toBe(true);
    });

    it('should render JobPosting component without errors', () => {
      const jobData = {
        title: 'Test Job',
        description: 'Test description',
        datePosted: '2024-01-15',
        hiringOrganization: {
          name: 'Test Company'
        }
      };

      const { container } = render(
        <HelmetProvider>
          <StructuredData type="JobPosting" data={jobData} />
        </HelmetProvider>
      );

      expect(container).toBeTruthy();
    });
  });

  describe('Course Schema Validation', () => {
    it('should validate Course with all required fields', () => {
      const courseData = {
        name: 'Advanced React Development',
        description: 'Learn advanced React patterns and best practices',
        provider: {
          name: 'Tech Academy',
          url: 'https://techacademy.com'
        }
      };

      const validation = extractStructuredData.validateCourse(courseData);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should validate Course with optional fields', () => {
      const courseData = {
        name: 'Advanced React Development',
        description: 'Learn advanced React patterns and best practices',
        provider: {
          name: 'Tech Academy',
          url: 'https://techacademy.com'
        },
        courseMode: 'online',
        url: 'https://techacademy.com/courses/react',
        image: 'https://techacademy.com/images/react-course.jpg',
        offers: {
          price: 299,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock'
        }
      };

      const validation = extractStructuredData.validateCourse(courseData);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      
      // Verify optional fields
      expect(courseData.courseMode).toBe('online');
      expect(courseData.url).toBeTruthy();
      expect(courseData.image).toBeTruthy();
      expect(courseData.offers).toBeDefined();
    });

    it('should reject Course when required fields are missing', () => {
      const incompleteData = {
        name: 'Test Course',
        // Missing description and provider
      };

      const validation = extractStructuredData.validateCourse(incompleteData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should render Course component without errors', () => {
      const courseData = {
        name: 'Test Course',
        description: 'Test description',
        provider: {
          name: 'Test Provider'
        }
      };

      const { container } = render(
        <HelmetProvider>
          <StructuredData type="Course" data={courseData} />
        </HelmetProvider>
      );

      expect(container).toBeTruthy();
    });
  });

  describe('Organization Schema Validation', () => {
    it('should validate Organization with required fields', () => {
      const orgData = {
        name: 'Careerak',
        url: 'https://careerak.com',
        logo: 'https://careerak.com/logo.png'
      };

      const validation = extractStructuredData.validateOrganization(orgData);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should validate Organization with optional fields', () => {
      const orgData = {
        name: 'Careerak',
        url: 'https://careerak.com',
        logo: 'https://careerak.com/logo.png',
        description: 'Professional career development platform',
        contactPoint: {
          telephone: '+1-555-0123',
          contactType: 'customer service',
          email: 'support@careerak.com',
          availableLanguage: ['en', 'ar', 'fr']
        },
        sameAs: [
          'https://facebook.com/careerak',
          'https://twitter.com/careerak'
        ]
      };

      const validation = extractStructuredData.validateOrganization(orgData);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      
      // Verify optional fields
      expect(orgData.description).toBeTruthy();
      expect(orgData.contactPoint).toBeDefined();
      expect(orgData.sameAs).toBeDefined();
      expect(Array.isArray(orgData.sameAs)).toBe(true);
    });

    it('should reject Organization when name is missing', () => {
      const incompleteData = {
        url: 'https://example.com',
        // Missing name
      };

      const validation = extractStructuredData.validateOrganization(incompleteData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should render Organization component without errors', () => {
      const orgData = {
        name: 'Test Organization'
      };

      const { container } = render(
        <HelmetProvider>
          <StructuredData type="Organization" data={orgData} />
        </HelmetProvider>
      );

      expect(container).toBeTruthy();
    });
  });

  describe('Google Rich Results Requirements', () => {
    it('should meet minimum requirements for JobPosting rich results', () => {
      const jobData = {
        title: 'Senior Software Engineer',
        description: 'We are looking for an experienced software engineer with 5+ years of experience.',
        datePosted: '2024-01-15',
        hiringOrganization: {
          name: 'Tech Company Inc.'
        }
      };

      const validation = extractStructuredData.validateJobPosting(jobData);
      expect(validation.isValid).toBe(true);
      
      // Google requires these minimum fields
      expect(jobData.title).toBeTruthy();
      expect(jobData.title.length).toBeGreaterThan(0);
      expect(jobData.description).toBeTruthy();
      expect(jobData.description.length).toBeGreaterThan(0);
      expect(jobData.datePosted).toBeTruthy();
      expect(jobData.hiringOrganization).toBeTruthy();
      expect(jobData.hiringOrganization.name).toBeTruthy();
    });

    it('should meet minimum requirements for Course rich results', () => {
      const courseData = {
        name: 'Advanced React Development',
        description: 'Learn advanced React patterns, hooks, and performance optimization.',
        provider: {
          name: 'Tech Academy'
        }
      };

      const validation = extractStructuredData.validateCourse(courseData);
      expect(validation.isValid).toBe(true);
      
      // Google requires these minimum fields
      expect(courseData.name).toBeTruthy();
      expect(courseData.name.length).toBeGreaterThan(0);
      expect(courseData.description).toBeTruthy();
      expect(courseData.description.length).toBeGreaterThan(0);
      expect(courseData.provider).toBeTruthy();
      expect(courseData.provider.name).toBeTruthy();
    });
  });

  describe('Test HTML Generation', () => {
    it('should generate valid test HTML for Google Rich Results Test', () => {
      const jobData = {
        title: 'Test Job',
        description: 'Test description',
        datePosted: '2024-01-15',
        hiringOrganization: {
          name: 'Test Company'
        }
      };

      const html = extractStructuredData.generateTestHTML(
        { '@context': 'https://schema.org', '@type': 'JobPosting', ...jobData },
        'Test Job Title'
      );

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<script type="application/ld+json">');
      expect(html).toContain('"@context": "https://schema.org"');
      expect(html).toContain('"@type": "JobPosting"');
      expect(html).toContain('Test Job Title');
    });

    it('should generate HTML with proper JSON-LD formatting', () => {
      const courseData = {
        name: 'Test Course',
        description: 'Test description',
        provider: {
          name: 'Test Provider'
        }
      };

      const html = extractStructuredData.generateTestHTML(
        { '@context': 'https://schema.org', '@type': 'Course', ...courseData },
        'Test Course Title',
        'Course content description'
      );

      expect(html).toContain('application/ld+json');
      expect(html).toContain('Test Course Title');
      expect(html).toContain('Course content description');
      
      // Verify JSON is properly formatted
      const jsonMatch = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
      expect(jsonMatch).toBeTruthy();
      
      // Should be valid JSON
      expect(() => JSON.parse(jsonMatch[1])).not.toThrow();
    });
  });

  describe('Validation Helper Functions', () => {
    it('should validate structured data by type', () => {
      const jobData = {
        title: 'Test',
        description: 'Test',
        datePosted: '2024-01-15',
        hiringOrganization: { name: 'Test' }
      };

      const validation = extractStructuredData.validateStructuredData(jobData, 'JobPosting');
      expect(validation.isValid).toBe(true);
    });

    it('should return valid for unknown types', () => {
      const customData = {
        '@type': 'CustomType',
        someField: 'value'
      };

      const validation = extractStructuredData.validateStructuredData(customData, 'CustomType');
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });
});
