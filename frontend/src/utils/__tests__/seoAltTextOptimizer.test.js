/**
 * SEO Alt Text Optimizer Tests
 * 
 * Tests for SEO-optimized alt text generation and validation.
 * 
 * Requirements: FR-SEO-11, FR-A11Y-9
 */

import {
  generateSEOAltText,
  validateSEOAltText,
  optimizeAltTextForSEO,
  SEOAltTextTemplates,
} from '../seoAltTextOptimizer';

describe('SEO Alt Text Optimizer', () => {
  describe('generateSEOAltText', () => {
    test('generates logo alt text with context', () => {
      const result = generateSEOAltText({
        type: 'logo',
        context: 'homepage',
      });

      expect(result).toBe(SEOAltTextTemplates.logo.homepage);
      expect(result).toContain('Careerak');
      expect(result.length).toBeLessThanOrEqual(125);
    });

    test('generates profile alt text with name', () => {
      const result = generateSEOAltText({
        type: 'profile',
        context: 'user',
        name: 'John Doe',
      });

      expect(result).toContain('John Doe');
      expect(result).toContain('professional');
      expect(result).toContain('profile');
      expect(result.length).toBeLessThanOrEqual(125);
    });

    test('generates job posting alt text', () => {
      const result = generateSEOAltText({
        type: 'job',
        context: 'posting',
        title: 'Software Engineer',
        company: 'TechCorp',
      });

      expect(result).toContain('Software Engineer');
      expect(result).toContain('TechCorp');
      expect(result).toContain('job');
      expect(result.length).toBeLessThanOrEqual(125);
    });

    test('generates course alt text', () => {
      const result = generateSEOAltText({
        type: 'course',
        context: 'thumbnail',
        title: 'React Masterclass',
      });

      expect(result).toContain('React Masterclass');
      expect(result).toContain('course');
      expect(result.length).toBeLessThanOrEqual(125);
    });

    test('returns empty string for decorative images', () => {
      const result = generateSEOAltText({
        type: 'decorative',
      });

      expect(result).toBe('');
    });

    test('adds keywords naturally when provided', () => {
      const result = generateSEOAltText({
        type: 'job',
        context: 'posting',
        title: 'Data Scientist',
        company: 'AI Corp',
        keywords: ['remote', 'machine learning'],
      });

      expect(result).toContain('Data Scientist');
      expect(result).toContain('AI Corp');
      // Should include at least one keyword if space allows
      expect(result.length).toBeLessThanOrEqual(125);
    });

    test('truncates long alt text', () => {
      const result = generateSEOAltText({
        type: 'job',
        context: 'posting',
        title: 'Very Long Job Title That Exceeds Normal Length',
        company: 'Company With A Very Long Name That Also Exceeds Normal Length',
        keywords: ['keyword1', 'keyword2', 'keyword3'],
        maxLength: 125,
      });

      expect(result.length).toBeLessThanOrEqual(125);
    });
  });

  describe('validateSEOAltText', () => {
    test('validates excellent alt text', () => {
      const result = validateSEOAltText(
        'Careerak logo - Professional HR and career development platform'
      );

      expect(result.isValid).toBe(true);
      expect(result.seoScore).toBeGreaterThanOrEqual(80);
      expect(result.hasKeywords).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    test('detects decorative images', () => {
      const result = validateSEOAltText('');

      expect(result.isDecorative).toBe(true);
      expect(result.seoScore).toBe(0);
    });

    test('detects alt text that is too short', () => {
      const result = validateSEOAltText('Logo');

      expect(result.isValid).toBe(false);
      expect(result.seoScore).toBeLessThan(80);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    test('detects alt text that is too long', () => {
      const longText = 'This is a very long alt text that exceeds the recommended maximum length of 125 characters and should be flagged as too long for optimal SEO performance';
      const result = validateSEOAltText(longText);

      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Alt text is too long (over 125 characters)');
    });

    test('detects redundant phrases', () => {
      const result = validateSEOAltText('Image of Careerak logo');

      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => issue.includes('redundant phrase'))).toBe(true);
    });

    test('detects keyword stuffing', () => {
      const result = validateSEOAltText(
        'Careerak Careerak Careerak logo platform platform platform'
      );

      expect(result.isValid).toBe(false);
      expect(result.issues.some(issue => issue.includes('keyword stuffing'))).toBe(true);
    });

    test('detects generic alt text', () => {
      const result = validateSEOAltText('logo');

      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Alt text is too generic for SEO');
    });

    test('suggests adding keywords when missing', () => {
      const result = validateSEOAltText('Company logo for business');

      expect(result.hasKeywords).toBe(false);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('optimizeAltTextForSEO', () => {
    test('removes redundant phrases', () => {
      const result = optimizeAltTextForSEO('Image of Careerak logo');

      expect(result).not.toContain('Image of');
      expect(result).toContain('Careerak logo');
    });

    test('adds platform context when missing', () => {
      const result = optimizeAltTextForSEO('Company logo', {
        platform: true,
      });

      expect(result).toContain('Careerak');
    });

    test('adds keywords when provided', () => {
      const result = optimizeAltTextForSEO('Job posting', {
        keywords: ['recruitment', 'career'],
      });

      expect(result).toContain('recruitment');
    });

    test('truncates if too long after optimization', () => {
      const longText = 'This is a very long alt text that will be optimized and should be truncated if it exceeds the maximum length';
      const result = optimizeAltTextForSEO(longText);

      expect(result.length).toBeLessThanOrEqual(125);
    });

    test('preserves empty alt text for decorative images', () => {
      const result = optimizeAltTextForSEO('');

      expect(result).toBe('');
    });
  });

  describe('SEO Requirements', () => {
    test('all logo templates meet SEO requirements', () => {
      Object.values(SEOAltTextTemplates.logo).forEach(altText => {
        const validation = validateSEOAltText(altText);
        
        expect(validation.seoScore).toBeGreaterThanOrEqual(70);
        expect(altText).toContain('Careerak');
        expect(altText.length).toBeLessThanOrEqual(125);
      });
    });

    test('generated alt text includes relevant keywords', () => {
      const jobAlt = generateSEOAltText({
        type: 'job',
        context: 'posting',
        title: 'Developer',
        company: 'Tech',
      });

      const validation = validateSEOAltText(jobAlt);
      expect(validation.hasKeywords).toBe(true);
    });

    test('alt text length is optimal for SEO', () => {
      const altText = generateSEOAltText({
        type: 'logo',
        context: 'homepage',
      });

      expect(altText.length).toBeGreaterThanOrEqual(50);
      expect(altText.length).toBeLessThanOrEqual(125);
    });
  });

  describe('Accessibility Requirements', () => {
    test('meaningful images have descriptive alt text', () => {
      const profileAlt = generateSEOAltText({
        type: 'profile',
        context: 'user',
        name: 'Jane Smith',
      });

      expect(profileAlt.length).toBeGreaterThan(10);
      expect(profileAlt).toContain('Jane Smith');
      expect(profileAlt).toContain('profile');
    });

    test('decorative images have empty alt text', () => {
      const decorativeAlt = generateSEOAltText({
        type: 'decorative',
      });

      expect(decorativeAlt).toBe('');
    });

    test('alt text is concise and descriptive', () => {
      const courseAlt = generateSEOAltText({
        type: 'course',
        context: 'thumbnail',
        title: 'Web Development',
      });

      expect(courseAlt.length).toBeLessThanOrEqual(125);
      expect(courseAlt).toContain('Web Development');
      expect(courseAlt).toContain('course');
    });
  });
});
