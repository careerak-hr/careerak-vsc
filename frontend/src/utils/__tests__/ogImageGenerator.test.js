/**
 * Tests for Open Graph Image Generator
 * 
 * Requirements:
 * - Requirements 3.4: معاينة جذابة عند المشاركة (Open Graph)
 * - FR-SEO-4: Open Graph tags
 */

import {
  generateJobOGImage,
  generateCourseOGImage,
  generateCompanyOGImage,
  generateUserOGImage,
  optimizeOGImage,
  getFallbackOGImage,
  getOGImageDimensions
} from '../ogImageGenerator';

// Mock window.location
const mockOrigin = 'https://careerak.com';
global.window = { location: { origin: mockOrigin } };

describe('ogImageGenerator', () => {
  describe('generateJobOGImage', () => {
    it('should return company logo if available', () => {
      const job = {
        company: {
          logo: 'https://example.com/logo.png'
        }
      };
      
      const result = generateJobOGImage(job);
      expect(result).toBe('https://example.com/logo.png');
    });

    it('should return job thumbnail if company logo not available', () => {
      const job = {
        thumbnail: 'https://example.com/thumbnail.jpg'
      };
      
      const result = generateJobOGImage(job);
      expect(result).toBe('https://example.com/thumbnail.jpg');
    });

    it('should return default logo if no images available', () => {
      const job = {};
      
      const result = generateJobOGImage(job);
      expect(result).toBe(`${mockOrigin}/logo.png`);
    });

    it('should convert relative URLs to absolute', () => {
      const job = {
        company: {
          logo: '/images/company-logo.png'
        }
      };
      
      const result = generateJobOGImage(job);
      expect(result).toBe(`${mockOrigin}/images/company-logo.png`);
    });

    it('should handle null job gracefully', () => {
      const result = generateJobOGImage(null);
      expect(result).toBe(`${mockOrigin}/logo.png`);
    });
  });

  describe('generateCourseOGImage', () => {
    it('should return course thumbnail if available', () => {
      const course = {
        thumbnail: 'https://example.com/course.jpg'
      };
      
      const result = generateCourseOGImage(course);
      expect(result).toBe('https://example.com/course.jpg');
    });

    it('should return instructor avatar if thumbnail not available', () => {
      const course = {
        instructor: {
          avatar: 'https://example.com/avatar.jpg'
        }
      };
      
      const result = generateCourseOGImage(course);
      expect(result).toBe('https://example.com/avatar.jpg');
    });

    it('should return default logo if no images available', () => {
      const course = {};
      
      const result = generateCourseOGImage(course);
      expect(result).toBe(`${mockOrigin}/logo.png`);
    });
  });

  describe('generateCompanyOGImage', () => {
    it('should return cover image if available', () => {
      const company = {
        coverImage: 'https://example.com/cover.jpg',
        logo: 'https://example.com/logo.png'
      };
      
      const result = generateCompanyOGImage(company);
      expect(result).toBe('https://example.com/cover.jpg');
    });

    it('should return logo if cover image not available', () => {
      const company = {
        logo: 'https://example.com/logo.png'
      };
      
      const result = generateCompanyOGImage(company);
      expect(result).toBe('https://example.com/logo.png');
    });

    it('should return default logo if no images available', () => {
      const company = {};
      
      const result = generateCompanyOGImage(company);
      expect(result).toBe(`${mockOrigin}/logo.png`);
    });
  });

  describe('generateUserOGImage', () => {
    it('should return profile picture if available', () => {
      const user = {
        profilePicture: 'https://example.com/profile.jpg'
      };
      
      const result = generateUserOGImage(user);
      expect(result).toBe('https://example.com/profile.jpg');
    });

    it('should return default avatar if profile picture not available', () => {
      const user = {};
      
      const result = generateUserOGImage(user);
      expect(result).toBe(`${mockOrigin}/default-avatar.png`);
    });
  });

  describe('optimizeOGImage', () => {
    it('should add Cloudinary transformations for Cloudinary URLs', () => {
      const cloudinaryUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
      
      const result = optimizeOGImage(cloudinaryUrl);
      expect(result).toContain('c_fill,w_1200,h_630,q_auto,f_auto');
      expect(result).toContain('/upload/');
    });

    it('should return non-Cloudinary URLs unchanged', () => {
      const regularUrl = 'https://example.com/image.jpg';
      
      const result = optimizeOGImage(regularUrl);
      expect(result).toBe(regularUrl);
    });

    it('should handle null URL gracefully', () => {
      const result = optimizeOGImage(null);
      expect(result).toBeNull();
    });
  });

  describe('getFallbackOGImage', () => {
    it('should return default logo URL', () => {
      const result = getFallbackOGImage();
      expect(result).toBe(`${mockOrigin}/logo.png`);
    });
  });

  describe('getOGImageDimensions', () => {
    it('should return recommended OG image dimensions', () => {
      const result = getOGImageDimensions();
      
      expect(result).toEqual({
        width: 1200,
        height: 630,
        aspectRatio: '1.91:1'
      });
    });
  });
});
