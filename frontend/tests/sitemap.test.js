/**
 * Sitemap Validation Tests
 * 
 * Unit tests for sitemap.xml validation
 * Ensures sitemap meets SEO requirements and protocol standards
 * 
 * Requirements: FR-SEO-8, NFR-SEO-4
 * Task: 6.6.7
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Sitemap Validation', () => {
  let sitemapContent;
  let sitemapPath;

  beforeAll(() => {
    sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    
    // Check if sitemap exists
    if (!fs.existsSync(sitemapPath)) {
      throw new Error('Sitemap file not found. Run "npm run generate-sitemap" first.');
    }

    sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  });

  describe('XML Structure', () => {
    it('should have valid XML declaration', () => {
      expect(sitemapContent).toMatch(/^<\?xml version="1\.0"/);
    });

    it('should specify UTF-8 encoding', () => {
      expect(sitemapContent).toContain('encoding="UTF-8"');
    });

    it('should have urlset element', () => {
      expect(sitemapContent).toContain('<urlset');
      expect(sitemapContent).toContain('</urlset>');
    });

    it('should have correct sitemap namespace', () => {
      expect(sitemapContent).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    });

    it('should be well-formed XML', () => {
      // Check for balanced tags
      const openTags = sitemapContent.match(/<url>/g) || [];
      const closeTags = sitemapContent.match(/<\/url>/g) || [];
      expect(openTags.length).toBe(closeTags.length);
    });
  });

  describe('URL Entries', () => {
    it('should contain URL entries', () => {
      const urlMatches = sitemapContent.match(/<url>/g);
      expect(urlMatches).toBeTruthy();
      expect(urlMatches.length).toBeGreaterThan(0);
    });

    it('should have at least 10 public pages', () => {
      const urlMatches = sitemapContent.match(/<url>/g);
      expect(urlMatches.length).toBeGreaterThanOrEqual(10);
    });

    it('should not exceed 50,000 URLs', () => {
      const urlMatches = sitemapContent.match(/<url>/g);
      expect(urlMatches.length).toBeLessThanOrEqual(50000);
    });

    it('all URLs should have loc element', () => {
      const urlBlocks = sitemapContent.match(/<url>[\s\S]*?<\/url>/g) || [];
      urlBlocks.forEach(block => {
        expect(block).toContain('<loc>');
        expect(block).toContain('</loc>');
      });
    });

    it('all URLs should be valid HTTPS URLs', () => {
      const locMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g) || [];
      locMatches.forEach(loc => {
        const url = loc.replace(/<\/?loc>/g, '');
        expect(url).toMatch(/^https:\/\//);
        expect(() => new URL(url)).not.toThrow();
      });
    });

    it('all URLs should use the correct base URL', () => {
      const locMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g) || [];
      locMatches.forEach(loc => {
        const url = loc.replace(/<\/?loc>/g, '');
        expect(url).toMatch(/^https:\/\/careerak\.com/);
      });
    });
  });

  describe('Required Public Pages', () => {
    it('should include homepage', () => {
      expect(sitemapContent).toContain('<loc>https://careerak.com/</loc>');
    });

    it('should include job postings page', () => {
      expect(sitemapContent).toContain('<loc>https://careerak.com/job-postings</loc>');
    });

    it('should include courses page', () => {
      expect(sitemapContent).toContain('<loc>https://careerak.com/courses</loc>');
    });

    it('should include authentication pages', () => {
      expect(sitemapContent).toContain('<loc>https://careerak.com/login</loc>');
      expect(sitemapContent).toContain('<loc>https://careerak.com/auth</loc>');
    });

    it('should include policy page', () => {
      expect(sitemapContent).toContain('<loc>https://careerak.com/policy</loc>');
    });
  });

  describe('SEO Metadata', () => {
    it('all URLs should have lastmod dates', () => {
      const urlBlocks = sitemapContent.match(/<url>[\s\S]*?<\/url>/g) || [];
      urlBlocks.forEach(block => {
        expect(block).toContain('<lastmod>');
        expect(block).toContain('</lastmod>');
      });
    });

    it('lastmod dates should be in valid format', () => {
      const lastmodMatches = sitemapContent.match(/<lastmod>(.*?)<\/lastmod>/g) || [];
      lastmodMatches.forEach(lastmod => {
        const date = lastmod.replace(/<\/?lastmod>/g, '');
        // Should be YYYY-MM-DD format
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}/);
      });
    });

    it('all URLs should have changefreq', () => {
      const urlBlocks = sitemapContent.match(/<url>[\s\S]*?<\/url>/g) || [];
      urlBlocks.forEach(block => {
        expect(block).toContain('<changefreq>');
        expect(block).toContain('</changefreq>');
      });
    });

    it('changefreq values should be valid', () => {
      const validFreqs = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
      const changefreqMatches = sitemapContent.match(/<changefreq>(.*?)<\/changefreq>/g) || [];
      
      changefreqMatches.forEach(changefreq => {
        const freq = changefreq.replace(/<\/?changefreq>/g, '');
        expect(validFreqs).toContain(freq);
      });
    });

    it('all URLs should have priority', () => {
      const urlBlocks = sitemapContent.match(/<url>[\s\S]*?<\/url>/g) || [];
      urlBlocks.forEach(block => {
        expect(block).toContain('<priority>');
        expect(block).toContain('</priority>');
      });
    });

    it('priority values should be between 0.0 and 1.0', () => {
      const priorityMatches = sitemapContent.match(/<priority>(.*?)<\/priority>/g) || [];
      
      priorityMatches.forEach(priority => {
        const value = parseFloat(priority.replace(/<\/?priority>/g, ''));
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
    });

    it('homepage should have highest priority (1.0)', () => {
      const homepageMatch = sitemapContent.match(
        /<url>[\s\S]*?<loc>https:\/\/careerak\.com\/<\/loc>[\s\S]*?<priority>(.*?)<\/priority>[\s\S]*?<\/url>/
      );
      
      expect(homepageMatch).toBeTruthy();
      const priority = parseFloat(homepageMatch[1]);
      expect(priority).toBe(1.0);
    });
  });

  describe('File Size and Limits', () => {
    it('should not exceed 50MB', () => {
      const stats = fs.statSync(sitemapPath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      expect(fileSizeInMB).toBeLessThan(50);
    });

    it('should be reasonably sized for current content', () => {
      const stats = fs.statSync(sitemapPath);
      const fileSizeInKB = stats.size / 1024;
      // Should be less than 100KB for ~10-20 URLs
      expect(fileSizeInKB).toBeLessThan(100);
    });
  });

  describe('Protocol Compliance', () => {
    it('should not contain invalid characters in URLs', () => {
      const locMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g) || [];
      locMatches.forEach(loc => {
        const url = loc.replace(/<\/?loc>/g, '');
        // URLs should not contain spaces or other invalid characters
        expect(url).not.toMatch(/\s/);
        expect(url).not.toMatch(/[<>"{}|\\^`\[\]]/);
      });
    });

    it('should properly escape XML special characters', () => {
      // If any URLs contain &, they should be escaped as &amp;
      if (sitemapContent.includes('&')) {
        // Check that & is properly escaped (except in &amp;, &lt;, &gt;, &quot;, &apos;)
        const unescapedAmpersand = sitemapContent.match(/&(?!(amp|lt|gt|quot|apos);)/);
        expect(unescapedAmpersand).toBeNull();
      }
    });

    it('should not contain duplicate URLs', () => {
      const locMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g) || [];
      const urls = locMatches.map(loc => loc.replace(/<\/?loc>/g, ''));
      const uniqueUrls = new Set(urls);
      expect(urls.length).toBe(uniqueUrls.size);
    });
  });

  describe('Integration with robots.txt', () => {
    it('sitemap should be referenced in robots.txt', () => {
      const robotsPath = path.join(__dirname, '..', 'public', 'robots.txt');
      
      if (fs.existsSync(robotsPath)) {
        const robotsContent = fs.readFileSync(robotsPath, 'utf8');
        expect(robotsContent).toContain('Sitemap:');
        expect(robotsContent).toContain('https://careerak.com/sitemap.xml');
      }
    });
  });

  describe('SEO Requirements Compliance', () => {
    it('should meet FR-SEO-8: generate sitemap with all public pages', () => {
      // Verify sitemap exists and contains public pages
      expect(sitemapContent).toBeTruthy();
      expect(sitemapContent).toContain('<loc>https://careerak.com/</loc>');
      expect(sitemapContent).toContain('<loc>https://careerak.com/job-postings</loc>');
      expect(sitemapContent).toContain('<loc>https://careerak.com/courses</loc>');
    });

    it('should meet NFR-SEO-4: generate valid sitemap.xml', () => {
      // Verify sitemap is valid according to protocol
      expect(sitemapContent).toMatch(/^<\?xml version="1\.0"/);
      expect(sitemapContent).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
      expect(sitemapContent).toContain('<urlset');
      expect(sitemapContent).toContain('</urlset>');
      
      const urlMatches = sitemapContent.match(/<url>/g);
      expect(urlMatches).toBeTruthy();
      expect(urlMatches.length).toBeGreaterThan(0);
    });
  });
});
