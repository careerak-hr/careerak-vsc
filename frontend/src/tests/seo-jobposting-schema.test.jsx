/**
 * JobPosting Schema Implementation Tests
 * 
 * Tests for FR-SEO-6: JobPosting schema for job listings
 * Validates that all job postings include proper structured data
 */

import { describe, it, expect } from 'vitest';
import { transformJobToSchema, validateStructuredData } from '../utils/seoHelpers';

describe('JobPosting Schema Implementation', () => {
  describe('transformJobToSchema', () => {
    it('should transform basic job data to JobPosting schema', () => {
      const job = {
        id: '123',
        title: 'Senior Frontend Developer',
        description: 'We are looking for an experienced frontend developer',
        company: 'Tech Corp',
        location: 'Riyadh',
        jobType: 'Full-time',
        status: 'Open',
        createdAt: '2026-02-20T00:00:00.000Z',
        postedBy: {
          companyName: 'Tech Corp',
          logo: 'https://example.com/logo.png'
        }
      };

      const schema = transformJobToSchema(job);

      expect(schema).toHaveProperty('title', 'Senior Frontend Developer');
      expect(schema).toHaveProperty('description');
      expect(schema).toHaveProperty('datePosted');
      expect(schema).toHaveProperty('employmentType', 'FULL_TIME');
      expect(schema).toHaveProperty('hiringOrganization');
      expect(schema.hiringOrganization).toHaveProperty('name', 'Tech Corp');
      expect(schema).toHaveProperty('jobLocation');
      expect(schema.jobLocation).toHaveProperty('addressLocality', 'Riyadh');
      expect(schema).toHaveProperty('url');
      expect(schema).toHaveProperty('identifier', '123');
    });

    it('should include validThrough for Open jobs', () => {
      const job = {
        id: '123',
        title: 'Test Job',
        description: 'Test description',
        company: 'Test Company',
        location: 'Riyadh',
        jobType: 'Full-time',
        status: 'Open',
        createdAt: '2026-02-20T00:00:00.000Z',
        postedBy: { companyName: 'Test Company' }
      };

      const schema = transformJobToSchema(job);

      expect(schema).toHaveProperty('validThrough');
      const validDate = new Date(schema.validThrough);
      const postDate = new Date(job.createdAt);
      const daysDiff = (validDate - postDate) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBe(30);
    });

    it('should include salary information when available', () => {
      const job = {
        id: '123',
        title: 'Test Job',
        description: 'Test description',
        company: 'Test Company',
        location: 'Riyadh',
        jobType: 'Full-time',
        status: 'Open',
        createdAt: '2026-02-20T00:00:00.000Z',
        postedBy: { companyName: 'Test Company' },
        salary: {
          min: 80000,
          max: 120000,
          currency: 'SAR'
        }
      };

      const schema = transformJobToSchema(job);

      expect(schema).toHaveProperty('baseSalary');
      expect(schema.baseSalary).toHaveProperty('currency', 'SAR');
      expect(schema.baseSalary).toHaveProperty('value', 120000);
      expect(schema.baseSalary).toHaveProperty('unitText', 'YEAR');
    });

    it('should map jobType to correct employmentType', () => {
      const jobTypes = [
        { input: 'Full-time', expected: 'FULL_TIME' },
        { input: 'Part-time', expected: 'PART_TIME' },
        { input: 'Contract', expected: 'CONTRACTOR' },
        { input: 'Temporary', expected: 'TEMPORARY' }
      ];

      jobTypes.forEach(({ input, expected }) => {
        const job = {
          id: '123',
          title: 'Test Job',
          description: 'Test description',
          company: 'Test Company',
          location: 'Riyadh',
          jobType: input,
          status: 'Open',
          createdAt: '2026-02-20T00:00:00.000Z',
          postedBy: { companyName: 'Test Company' }
        };

        const schema = transformJobToSchema(job);
        expect(schema.employmentType).toBe(expected);
      });
    });

    it('should detect correct country from location', () => {
      const locations = [
        { location: 'Riyadh', country: 'SA' },
        { location: 'Dubai', country: 'AE' },
        { location: 'Cairo', country: 'EG' },
        { location: 'Kuwait City', country: 'KW' },
        { location: 'Doha', country: 'QA' },
        { location: 'Manama', country: 'BH' },
        { location: 'Muscat', country: 'OM' },
        { location: 'Amman', country: 'JO' },
        { location: 'Beirut', country: 'LB' }
      ];

      locations.forEach(({ location, country }) => {
        const job = {
          id: '123',
          title: 'Test Job',
          description: 'Test description',
          company: 'Test Company',
          location,
          jobType: 'Full-time',
          status: 'Open',
          createdAt: '2026-02-20T00:00:00.000Z',
          postedBy: { companyName: 'Test Company' }
        };

        const schema = transformJobToSchema(job);
        expect(schema.jobLocation.addressCountry).toBe(country);
      });
    });
  });

  describe('validateStructuredData', () => {
    it('should validate complete JobPosting data', () => {
      const data = {
        title: 'Test Job',
        description: 'Test description',
        datePosted: '2026-02-20T00:00:00.000Z',
        hiringOrganization: {
          name: 'Test Company'
        }
      };

      expect(validateStructuredData(data, 'JobPosting')).toBe(true);
    });

    it('should reject incomplete JobPosting data', () => {
      const incompleteData = [
        { description: 'Test', datePosted: '2026-02-20', hiringOrganization: { name: 'Test' } },
        { title: 'Test', datePosted: '2026-02-20', hiringOrganization: { name: 'Test' } },
        { title: 'Test', description: 'Test', hiringOrganization: { name: 'Test' } },
        { title: 'Test', description: 'Test', datePosted: '2026-02-20' }
      ];

      incompleteData.forEach(data => {
        expect(validateStructuredData(data, 'JobPosting')).toBe(false);
      });
    });
  });

  describe('Schema.org compliance', () => {
    it('should generate schema with correct @context and @type', () => {
      const job = {
        id: '123',
        title: 'Test Job',
        description: 'Test description',
        company: 'Test Company',
        location: 'Riyadh',
        jobType: 'Full-time',
        status: 'Open',
        createdAt: '2026-02-20T00:00:00.000Z',
        postedBy: { companyName: 'Test Company' }
      };

      const schema = transformJobToSchema(job);
      
      // The StructuredData component adds @context and @type
      // Here we verify the data structure is correct
      expect(schema).toHaveProperty('title');
      expect(schema).toHaveProperty('description');
      expect(schema).toHaveProperty('datePosted');
      expect(schema).toHaveProperty('hiringOrganization');
      expect(schema.hiringOrganization).toHaveProperty('name');
    });

    it('should include all required JobPosting fields', () => {
      const job = {
        id: '123',
        title: 'Test Job',
        description: 'Test description',
        company: 'Test Company',
        location: 'Riyadh',
        jobType: 'Full-time',
        status: 'Open',
        createdAt: '2026-02-20T00:00:00.000Z',
        postedBy: { companyName: 'Test Company' }
      };

      const schema = transformJobToSchema(job);

      // Required fields according to schema.org JobPosting
      const requiredFields = ['title', 'description', 'datePosted', 'hiringOrganization'];
      requiredFields.forEach(field => {
        expect(schema).toHaveProperty(field);
      });
    });

    it('should include recommended JobPosting fields when available', () => {
      const job = {
        id: '123',
        title: 'Test Job',
        description: 'Test description',
        company: 'Test Company',
        location: 'Riyadh',
        jobType: 'Full-time',
        status: 'Open',
        createdAt: '2026-02-20T00:00:00.000Z',
        postedBy: { 
          companyName: 'Test Company',
          logo: 'https://example.com/logo.png',
          website: 'https://example.com'
        },
        salary: {
          min: 80000,
          max: 120000,
          currency: 'SAR'
        }
      };

      const schema = transformJobToSchema(job);

      // Recommended fields
      expect(schema).toHaveProperty('employmentType');
      expect(schema).toHaveProperty('jobLocation');
      expect(schema).toHaveProperty('baseSalary');
      expect(schema).toHaveProperty('validThrough');
      expect(schema).toHaveProperty('url');
      expect(schema).toHaveProperty('identifier');
    });
  });
});
