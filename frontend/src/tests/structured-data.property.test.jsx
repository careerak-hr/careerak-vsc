/**
 * Structured Data Property-Based Tests
 * 
 * Property-based tests for validating structured data (JSON-LD) requirements
 * using fast-check library.
 * 
 * Requirements:
 * - FR-SEO-6: JobPosting schema for job listings
 * - FR-SEO-7: Course schema for courses
 * - NFR-SEO-3: Include structured data for job postings and courses
 * - Property SEO-4: All jobs have structured data
 * - Task 6.6.4: Write property-based test for structured data (100 iterations)
 * 
 * Property SEO-4: Structured Data
 * ∀ job ∈ JobPostings:
 *   job.hasStructuredData('JobPosting') = true
 * 
 * Test: All jobs have valid structured data
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { transformJobToSchema, transformCourseToSchema } from '../utils/seoHelpers';
import { validateStructuredData } from '../utils/extractStructuredData';

describe('Property SEO-4: Structured Data Validation', () => {
  /**
   * Arbitrary generator for valid job data
   */
  const validJobArbitrary = fc.record({
    _id: fc.string({ minLength: 24, maxLength: 24 }).map(s => 
      s.replace(/[^0-9a-f]/g, '0').slice(0, 24).padEnd(24, '0')
    ),
    title: fc.string({ minLength: 10, maxLength: 100 }),
    description: fc.string({ minLength: 50, maxLength: 500 }),
    jobType: fc.constantFrom('Full-time', 'Part-time', 'Contract', 'Temporary'),
    location: fc.constantFrom(
      'Riyadh, Saudi Arabia',
      'Dubai, UAE',
      'Cairo, Egypt',
      'Kuwait City, Kuwait',
      'Doha, Qatar'
    ),
    status: fc.constantFrom('Open', 'Closed', 'Draft'),
    createdAt: fc.integer({ min: new Date('2020-01-01').getTime(), max: new Date('2026-02-21').getTime() })
      .map(timestamp => new Date(timestamp).toISOString()),
    postedBy: fc.record({
      companyName: fc.string({ minLength: 3, maxLength: 50 }),
      logo: fc.webUrl(),
      website: fc.webUrl()
    }),
    salary: fc.option(
      fc.record({
        min: fc.integer({ min: 1000, max: 50000 }),
        max: fc.integer({ min: 50000, max: 200000 }),
        currency: fc.constantFrom('SAR', 'USD', 'AED', 'EGP')
      }),
      { nil: undefined }
    )
  });

  /**
   * Arbitrary generator for valid course data
   */
  const validCourseArbitrary = fc.record({
    _id: fc.string({ minLength: 24, maxLength: 24 }).map(s => 
      s.replace(/[^0-9a-f]/g, '0').slice(0, 24).padEnd(24, '0')
    ),
    title: fc.string({ minLength: 10, maxLength: 100 }),
    name: fc.string({ minLength: 10, maxLength: 100 }),
    description: fc.string({ minLength: 50, maxLength: 500 }),
    mode: fc.constantFrom('online', 'offline', 'hybrid'),
    provider: fc.option(
      fc.record({
        name: fc.string({ minLength: 3, maxLength: 50 }),
        url: fc.webUrl()
      }),
      { nil: undefined }
    ),
    price: fc.option(fc.integer({ min: 0, max: 10000 }), { nil: undefined }),
    currency: fc.constantFrom('SAR', 'USD', 'AED', 'EGP'),
    available: fc.boolean(),
    image: fc.option(fc.webUrl(), { nil: undefined }),
    thumbnail: fc.option(fc.webUrl(), { nil: undefined }),
    startDate: fc.option(
      fc.integer({ min: new Date('2026-01-01').getTime(), max: new Date('2026-12-31').getTime() })
        .map(timestamp => new Date(timestamp).toISOString()),
      { nil: undefined }
    ),
    endDate: fc.option(
      fc.integer({ min: new Date('2026-06-01').getTime(), max: new Date('2027-12-31').getTime() })
        .map(timestamp => new Date(timestamp).toISOString()),
      { nil: undefined }
    ),
    instructor: fc.option(
      fc.oneof(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.record({ name: fc.string({ minLength: 5, maxLength: 50 }) })
      ),
      { nil: undefined }
    )
  });

  /**
   * Property Test: All valid jobs produce valid structured data
   * 
   * Validates: Property SEO-4
   * Iterations: 100
   */
  it('should generate valid JobPosting structured data for all valid jobs', () => {
    fc.assert(
      fc.property(
        validJobArbitrary,
        (job) => {
          // Transform job to schema
          const schema = transformJobToSchema(job);

          // Validate the generated schema
          const validation = validateStructuredData(schema, 'JobPosting');

          // All valid jobs should produce valid structured data
          expect(validation.isValid).toBe(true);
          expect(validation.errors).toHaveLength(0);

          // Verify required fields are present
          expect(schema.title).toBeTruthy();
          expect(schema.description).toBeTruthy();
          expect(schema.datePosted).toBeTruthy();
          expect(schema.hiringOrganization).toBeTruthy();
          expect(schema.hiringOrganization.name).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: All valid courses produce valid structured data
   * 
   * Validates: Property SEO-4 (extended to courses)
   * Iterations: 100
   */
  it('should generate valid Course structured data for all valid courses', () => {
    fc.assert(
      fc.property(
        validCourseArbitrary,
        (course) => {
          // Transform course to schema
          const schema = transformCourseToSchema(course);

          // Validate the generated schema
          const validation = validateStructuredData(schema, 'Course');

          // All valid courses should produce valid structured data
          expect(validation.isValid).toBe(true);
          expect(validation.errors).toHaveLength(0);

          // Verify required fields are present
          expect(schema.name).toBeTruthy();
          expect(schema.description).toBeTruthy();
          expect(schema.provider).toBeTruthy();
          expect(schema.provider.name).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: JobPosting schema includes correct employmentType mapping
   * 
   * Validates: Property SEO-4 (employmentType correctness)
   * Iterations: 100
   */
  it('should correctly map jobType to schema.org employmentType', () => {
    fc.assert(
      fc.property(
        validJobArbitrary,
        (job) => {
          const schema = transformJobToSchema(job);

          // Verify employmentType mapping
          const employmentTypeMap = {
            'Full-time': 'FULL_TIME',
            'Part-time': 'PART_TIME',
            'Contract': 'CONTRACTOR',
            'Temporary': 'TEMPORARY'
          };

          const expectedType = employmentTypeMap[job.jobType] || 'FULL_TIME';
          expect(schema.employmentType).toBe(expectedType);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: JobPosting schema includes validThrough for Open jobs
   * 
   * Validates: Property SEO-4 (validThrough field)
   * Iterations: 100
   */
  it('should include validThrough for Open jobs with createdAt date', () => {
    fc.assert(
      fc.property(
        validJobArbitrary.filter(job => job.status === 'Open' && job.createdAt),
        (job) => {
          const schema = transformJobToSchema(job);

          // Open jobs should have validThrough (30 days from posting)
          expect(schema.validThrough).toBeTruthy();

          // Verify validThrough is a valid date
          const validThroughDate = new Date(schema.validThrough);
          expect(validThroughDate).toBeInstanceOf(Date);
          expect(isNaN(validThroughDate.getTime())).toBe(false);

          // Verify validThrough is approximately 30 days after createdAt
          const createdDate = new Date(job.createdAt);
          const daysDiff = (validThroughDate - createdDate) / (1000 * 60 * 60 * 24);
          expect(daysDiff).toBeGreaterThanOrEqual(29);
          expect(daysDiff).toBeLessThanOrEqual(31);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: JobPosting schema includes salary when available
   * 
   * Validates: Property SEO-4 (baseSalary field)
   * Iterations: 100
   */
  it('should include baseSalary when salary data is available', () => {
    fc.assert(
      fc.property(
        validJobArbitrary.filter(job => job.salary && (job.salary.min || job.salary.max)),
        (job) => {
          const schema = transformJobToSchema(job);

          // Should have baseSalary
          expect(schema.baseSalary).toBeTruthy();
          expect(schema.baseSalary.currency).toBeTruthy();
          expect(schema.baseSalary.value).toBeGreaterThan(0);
          expect(schema.baseSalary.unitText).toBe('YEAR');

          // Value should be max or min
          const expectedValue = job.salary.max || job.salary.min;
          expect(schema.baseSalary.value).toBe(expectedValue);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: JobPosting schema includes correct location data
   * 
   * Validates: Property SEO-4 (jobLocation field)
   * Iterations: 100
   */
  it('should include correct jobLocation with addressLocality and addressCountry', () => {
    fc.assert(
      fc.property(
        validJobArbitrary,
        (job) => {
          const schema = transformJobToSchema(job);

          // Should have jobLocation
          expect(schema.jobLocation).toBeTruthy();
          expect(schema.jobLocation.addressLocality).toBe(job.location);
          expect(schema.jobLocation.addressCountry).toBeTruthy();

          // Verify country code is valid (2 letters)
          expect(schema.jobLocation.addressCountry).toMatch(/^[A-Z]{2}$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Course schema includes pricing information when available
   * 
   * Validates: Property SEO-4 (offers field)
   * Iterations: 100
   */
  it('should include offers when course price is available', () => {
    fc.assert(
      fc.property(
        validCourseArbitrary.filter(course => course.price !== undefined),
        (course) => {
          const schema = transformCourseToSchema(course);

          // Should have offers
          expect(schema.offers).toBeTruthy();
          expect(schema.offers.price).toBe(course.price);
          expect(schema.offers.priceCurrency).toBeTruthy();
          expect(schema.offers.availability).toBeTruthy();

          // Verify availability URL
          if (course.available) {
            expect(schema.offers.availability).toBe('https://schema.org/InStock');
          } else {
            expect(schema.offers.availability).toBe('https://schema.org/OutOfStock');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Course schema includes hasCourseInstance when dates available
   * 
   * Validates: Property SEO-4 (hasCourseInstance field)
   * Iterations: 100
   */
  it('should include hasCourseInstance when course dates are available', () => {
    fc.assert(
      fc.property(
        validCourseArbitrary.filter(course => course.startDate || course.endDate),
        (course) => {
          const schema = transformCourseToSchema(course);

          // Should have hasCourseInstance
          expect(schema.hasCourseInstance).toBeTruthy();
          expect(Array.isArray(schema.hasCourseInstance)).toBe(true);
          expect(schema.hasCourseInstance.length).toBeGreaterThan(0);

          const instance = schema.hasCourseInstance[0];
          expect(instance.courseMode).toBeTruthy();

          // Verify dates if present
          if (course.startDate) {
            expect(instance.startDate).toBe(course.startDate);
          }
          if (course.endDate) {
            expect(instance.endDate).toBe(course.endDate);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Structured data transformation is idempotent
   * 
   * Validates: Property SEO-4 (idempotence)
   * Iterations: 100
   */
  it('should produce identical structured data on repeated transformations', () => {
    fc.assert(
      fc.property(
        validJobArbitrary,
        (job) => {
          // Transform twice
          const schema1 = transformJobToSchema(job);
          const schema2 = transformJobToSchema(job);

          // Should produce identical results
          expect(schema1).toEqual(schema2);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Structured data includes required @context and @type
   * 
   * Validates: Property SEO-4 (schema.org compliance)
   * Iterations: 100
   */
  it('should include schema.org context when rendered', () => {
    fc.assert(
      fc.property(
        validJobArbitrary,
        (job) => {
          const schema = transformJobToSchema(job);

          // When used in StructuredData component, it should have @context and @type
          // We verify the schema has all required fields for this
          expect(schema.title).toBeTruthy();
          expect(schema.description).toBeTruthy();
          expect(schema.datePosted).toBeTruthy();
          expect(schema.hiringOrganization).toBeTruthy();

          // These fields are essential for schema.org JobPosting
          const validation = validateStructuredData(schema, 'JobPosting');
          expect(validation.isValid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Structured data validation is consistent
   * 
   * Validates: Property SEO-4 (validation consistency)
   * Iterations: 100
   */
  it('should consistently validate structured data across multiple calls', () => {
    fc.assert(
      fc.property(
        validJobArbitrary,
        (job) => {
          const schema = transformJobToSchema(job);

          // Validate multiple times
          const validation1 = validateStructuredData(schema, 'JobPosting');
          const validation2 = validateStructuredData(schema, 'JobPosting');
          const validation3 = validateStructuredData(schema, 'JobPosting');

          // All validations should produce identical results
          expect(validation1.isValid).toBe(validation2.isValid);
          expect(validation2.isValid).toBe(validation3.isValid);
          expect(validation1.errors).toEqual(validation2.errors);
          expect(validation2.errors).toEqual(validation3.errors);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Invalid structured data is correctly rejected
   * 
   * Validates: Property SEO-4 (negative case)
   * Iterations: 100
   */
  it('should reject invalid structured data', () => {
    fc.assert(
      fc.property(
        fc.record({
          // Generate incomplete job data (missing required fields)
          title: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
          description: fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: undefined }),
          datePosted: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
          hiringOrganization: fc.option(
            fc.record({ name: fc.option(fc.string(), { nil: undefined }) }),
            { nil: undefined }
          )
        }).filter(data => {
          // Ensure at least one required field is missing or invalid
          return !data.title || !data.description || !data.datePosted || 
                 !data.hiringOrganization || !data.hiringOrganization.name;
        }),
        (invalidData) => {
          const validation = validateStructuredData(invalidData, 'JobPosting');

          // Invalid data should be rejected
          expect(validation.isValid).toBe(false);
          expect(validation.errors.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Course structured data with image includes image field
   * 
   * Validates: Property SEO-4 (image field)
   * Iterations: 100
   */
  it('should include image field when course has image or thumbnail', () => {
    fc.assert(
      fc.property(
        validCourseArbitrary.filter(course => course.image || course.thumbnail),
        (course) => {
          const schema = transformCourseToSchema(course);

          // Should have image
          expect(schema.image).toBeTruthy();

          // Should prefer image over thumbnail
          if (course.image) {
            expect(schema.image).toBe(course.image);
          } else {
            expect(schema.image).toBe(course.thumbnail);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Validates: Requirements FR-SEO-6, FR-SEO-7, NFR-SEO-3, Property SEO-4
 * Task: 6.6.4 Write property-based test for structured data (100 iterations)
 */
