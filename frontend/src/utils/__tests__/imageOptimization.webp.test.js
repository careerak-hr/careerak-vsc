/**
 * WebP Implementation Tests
 * 
 * Tests for WebP format with JPEG/PNG fallback functionality
 * 
 * Requirements: FR-PERF-3, FR-PERF-4
 * Task: 2.3.2 Implement WebP format with JPEG/PNG fallback
 */

import { describe, it, expect } from 'vitest';
import {
  getWebPWithFallback,
  getResponsiveWebPSrcSet,
} from '../imageOptimization';

describe('WebP Implementation', () => {
  describe('getWebPWithFallback', () => {
    it('should generate WebP, JPEG, and PNG URLs', () => {
      const publicId = 'profile/user123';
      const options = { width: 400, height: 400 };

      const urls = getWebPWithFallback(publicId, options);

      expect(urls).toHaveProperty('webp');
      expect(urls).toHaveProperty('jpeg');
      expect(urls).toHaveProperty('png');

      // Check that URLs contain correct format parameters
      expect(urls.webp).toContain('f_webp');
      expect(urls.jpeg).toContain('f_jpg');
      expect(urls.png).toContain('f_png');
    });

    it('should include transformation parameters in all URLs', () => {
      const publicId = 'test/image';
      const options = { width: 600, height: 400, crop: 'fill' };

      const urls = getWebPWithFallback(publicId, options);

      // All URLs should have width and height
      expect(urls.webp).toContain('w_600');
      expect(urls.webp).toContain('h_400');
      expect(urls.jpeg).toContain('w_600');
      expect(urls.jpeg).toContain('h_400');
      expect(urls.png).toContain('w_600');
      expect(urls.png).toContain('h_400');
    });

    it('should return empty strings for missing publicId', () => {
      const urls = getWebPWithFallback('');

      expect(urls.webp).toBe('');
      expect(urls.jpeg).toBe('');
      expect(urls.png).toBe('');
    });

    it('should handle publicId without options', () => {
      const publicId = 'test/image';
      const urls = getWebPWithFallback(publicId);

      expect(urls.webp).toBeTruthy();
      expect(urls.jpeg).toBeTruthy();
      expect(urls.png).toBeTruthy();
    });
  });

  describe('getResponsiveWebPSrcSet', () => {
    it('should generate WebP and JPEG srcsets', () => {
      const publicId = 'hero/banner';
      const widths = [640, 1024, 1920];

      const srcsets = getResponsiveWebPSrcSet(publicId, {}, widths);

      expect(srcsets).toHaveProperty('webpSrcSet');
      expect(srcsets).toHaveProperty('jpegSrcSet');

      // Check that srcsets contain all widths
      widths.forEach(width => {
        expect(srcsets.webpSrcSet).toContain(`${width}w`);
        expect(srcsets.jpegSrcSet).toContain(`${width}w`);
      });

      // Check that srcsets contain correct formats
      expect(srcsets.webpSrcSet).toContain('f_webp');
      expect(srcsets.jpegSrcSet).toContain('f_jpg');
    });

    it('should use default widths when not provided', () => {
      const publicId = 'test/image';
      const srcsets = getResponsiveWebPSrcSet(publicId);

      // Default widths: [320, 640, 768, 1024, 1280, 1920]
      expect(srcsets.webpSrcSet).toContain('320w');
      expect(srcsets.webpSrcSet).toContain('640w');
      expect(srcsets.webpSrcSet).toContain('1920w');
    });

    it('should include transformation options in srcsets', () => {
      const publicId = 'test/image';
      const options = { height: 400, crop: 'fill' };
      const widths = [640, 1024];

      const srcsets = getResponsiveWebPSrcSet(publicId, options, widths);

      // Check that height is included
      expect(srcsets.webpSrcSet).toContain('h_400');
      expect(srcsets.jpegSrcSet).toContain('h_400');
    });

    it('should return empty strings for missing publicId', () => {
      const srcsets = getResponsiveWebPSrcSet('');

      expect(srcsets.webpSrcSet).toBe('');
      expect(srcsets.jpegSrcSet).toBe('');
    });

    it('should format srcset correctly', () => {
      const publicId = 'test/image';
      const widths = [640, 1024];

      const srcsets = getResponsiveWebPSrcSet(publicId, {}, widths);

      // Check format: "url1 640w, url2 1024w"
      const webpParts = srcsets.webpSrcSet.split(', ');
      expect(webpParts).toHaveLength(2);
      expect(webpParts[0]).toMatch(/https:\/\/.+ 640w$/);
      expect(webpParts[1]).toMatch(/https:\/\/.+ 1024w$/);
    });
  });

  describe('WebP vs JPEG file size', () => {
    it('should generate different URLs for WebP and JPEG', () => {
      const publicId = 'test/image';
      const urls = getWebPWithFallback(publicId, { width: 400 });

      // URLs should be different
      expect(urls.webp).not.toBe(urls.jpeg);
      expect(urls.webp).not.toBe(urls.png);
      expect(urls.jpeg).not.toBe(urls.png);
    });

    it('should use same base URL for all formats', () => {
      const publicId = 'test/image';
      const urls = getWebPWithFallback(publicId);

      // Extract base URL (before format parameter)
      const baseUrlPattern = /https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload/;
      
      expect(urls.webp).toMatch(baseUrlPattern);
      expect(urls.jpeg).toMatch(baseUrlPattern);
      expect(urls.png).toMatch(baseUrlPattern);
    });
  });

  describe('Integration with existing functions', () => {
    it('should work with Cloudinary URLs', () => {
      const fullUrl = 'https://res.cloudinary.com/careerak/image/upload/v1234567890/profile/user123.jpg';
      const urls = getWebPWithFallback(fullUrl, { width: 400 });

      // Should extract publicId and generate URLs
      expect(urls.webp).toBeTruthy();
      expect(urls.jpeg).toBeTruthy();
      expect(urls.png).toBeTruthy();
    });

    it('should work with simple publicId', () => {
      const publicId = 'profile/user123';
      const urls = getWebPWithFallback(publicId, { width: 400 });

      expect(urls.webp).toContain(publicId);
      expect(urls.jpeg).toContain(publicId);
      expect(urls.png).toContain(publicId);
    });
  });
});
