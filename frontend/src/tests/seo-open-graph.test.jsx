/**
 * Open Graph Tags Tests
 * 
 * Tests for validating Open Graph and Twitter Card meta tags
 * in the SEOHead component.
 * 
 * Requirements:
 * - FR-SEO-4: Open Graph tags
 * - FR-SEO-5: Twitter Card tags
 * - Task 6.2.5: Validate Open Graph with Facebook debugger
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import SEOHead from '../components/SEO/SEOHead';

describe('Open Graph Tags', () => {
  const renderSEOHead = (props) => {
    const helmetContext = {};
    render(
      <HelmetProvider context={helmetContext}>
        <SEOHead {...props} />
      </HelmetProvider>
    );
    return helmetContext.helmet;
  };

  describe('Required Open Graph Tags', () => {
    it('should render og:title tag', () => {
      const helmet = renderSEOHead({
        title: 'Test Page - Careerak',
        description: 'This is a test description for the page that should be between 150 and 160 characters long to meet SEO requirements and best practices.',
      });

      const ogTitle = helmet.metaTags.find(
        tag => tag.property === 'og:title'
      );
      expect(ogTitle).toBeDefined();
      expect(ogTitle.content).toBe('Test Page - Careerak');
    });

    it('should render og:description tag', () => {
      const description = 'This is a test description for the page that should be between 150 and 160 characters long to meet SEO requirements and best practices.';
      const helmet = renderSEOHead({
        title: 'Test Page - Careerak',
        description,
      });

      const ogDescription = helmet.metaTags.find(
        tag => tag.property === 'og:description'
      );
      expect(ogDescription).toBeDefined();
      expect(ogDescription.content).toBe(description);
    });

    it('should render og:type tag', () => {
      const helmet = renderSEOHead({
        title: 'Test Page - Careerak',
        description: 'This is a test description for the page that should be between 150 and 160 characters long to meet SEO requirements and best practices.',
        type: 'website',
      });

      const ogType = helmet.metaTags.find(
        tag => tag.property === 'og:type'
      );
      expect(ogType).toBeDefined();
      expect(ogType.content).toBe('website');
    });

    it('should render og:url tag', () => {
      const helmet = renderSEOHead({
        title: 'Test Page - Careerak',
        description: 'This is a test description for the page that should be between 150 and 160 characters long to meet SEO requirements and best practices.',
        url: 'https://careerak.com/test',
      });

      const ogUrl = helmet.metaTags.find(
        tag => tag.property === 'og:url'
      );
      expect(ogUrl).toBeDefined();
      expect(ogUrl.content).toBe('https://careerak.com/test');
    });

    it('should render og:image tag with absolute URL', () => {
      const helmet = renderSEOHead({
        title: 'Test Page - Careerak',
        description: 'This is a test description for the page that should be between 150 and 160 characters long to meet SEO requirements and best practices.',
        image: 'https://careerak.com/images/test.jpg',
      });

      const ogImage = helmet.metaTags.find(
        tag => tag.property === 'og:image'
      );
      expect(ogImage).toBeDefined();
      expect(ogImage.content).toMatch(/^https?:\/\//);
    });

    it('should render og:site_name tag', () => {
      const helmet = renderSEOHead({
        title: 'Test Page - Careerak',
        description: 'This is a test description for the page that should be between 150 and 160 characters long to meet SEO requirements and best practices.',
        siteName: 'Careerak',
      });

      const ogSiteName = helmet.metaTags.find(
        tag => tag.property === 'og:site_name'
      );
      expect(ogSiteName).toBeDefined();
      expect(ogSiteName.content).toBe('Careerak');
    });

    it('should render og:locale tag', () => {
      const helmet = renderSEOHead({
        title: 'Test Page - Careerak',
        description: 'This is a test description for the page that should be between 150 and 160 characters long to meet SEO requirements and best practices.',
        locale: 'ar_SA',
      });

      const ogLocale = helmet.metaTags.find(
        tag => tag.property === 'og:locale'
      );
      expect(ogLocale).toBeDefined();
      expect(ogLocale.content).toBe('ar_SA');
    });

    it('should render og:locale:alternate tags', () => {
      const helmet = renderSEOHead({
        title: 'Test Page - Careerak',
        description: 'This is a test description for the page that should be between 150 and 160 characters long to meet SEO requirements and best practices.',
        locale: 'ar_SA',
        alternateLocales: ['en_US', 'fr_FR'],
      });

      const alternateLocales = helmet.metaTags.filter(
        tag => tag.property === 'og:locale:alternate'
      );
      expect(alternateLocales.length).toBe(2);
      expect(alternateLocales[0].content).toBe('en_US');
      expect(alternateLocales[1].content).toBe('fr_FR');
    });
  });

  describe('Required Twitter Card Tags', () => {
    it('should render twitter:card tag', () => {
      const helmet = renderSEOHead({
        title: 'Test Page - Careerak',
        description: 'This is a test description for the page that should be between 150 and 160 characters long to meet SEO requirements and best practices.',
        twitterCard: 'summary_large_image',
      });

      const twitterCard = helmet.metaTags.find(
        tag => tag.name === 'twitter:card'
      );
      expect(twitterCard).toBeDefined();
      expect(twitterCard.content).toBe('summary_large_image');
    });

    it('should render twitter:title tag', () => {
      const helmet = renderSEOHead({
        title: 'Test Page - Careerak',
        description: 'This is a test description for the page that should be between 150 and 160 characters long to meet SEO requirements and best practices.',
      });

      const twitterTitle = helmet.metaTags.find(
        tag => tag.name === 'twitter:title'
      );
      expect(twitterTitle).toBeDefined();
      expect(twitterTitle.content).toBe('Test Page - Careerak');
    });

    it('should render twitter:description tag', () => {
      const description = 'This is a test description for the page that should be between 150 and 160 characters long to meet SEO requirements and best practices.';
      const helmet = renderSEOHead({
        title: 'Test Page - Careerak',
        description,
      });

      const twitterDescription = helmet.metaTags.find(
        tag => tag.name === 'twitter:description'
      );
      expect(twitterDescription).toBeDefined();
      expect(twitterDescription.content).toBe(description);
    });

    it('should render twitter:image tag', () => {
      const helmet = renderSEOHead({
        title: 'Test Page - Careerak',
        description: 'This is a test description for the page that should be between 150 and 160 characters long to meet SEO requirements and best practices.',
        image: 'https://careerak.com/images/test.jpg',
      });

      const twitterImage = helmet.metaTags.find(
        tag => tag.name === 'twitter:image'
      );
      expect(twitterImage).toBeDefined();
      expect(twitterImage.content).toMatch(/^https?:\/\//);
    });

    it('should render twitter:site tag when provided', () => {
      const helmet = renderSEOHead({
        title: 'Test Page - Careerak',
        description: 'This is a test description for the page that should be between 150 and 160 characters long to meet SEO requirements and best practices.',
        twitterSite: '@careerak',
      });

      const twitterSite = helmet.metaTags.find(
        tag => tag.name === 'twitter:site'
      );
      expect(twitterSite).toBeDefined();
      expect(twitterSite.content).toBe('@careerak');
    });
  });

  describe('Image URL Validation', () => {
    it('should convert relative image URLs to absolute', () => {
      // Mock window.location
      const originalLocation = window.location;
      delete window.location;
      window.location = { origin: 'https://careerak.com' };

      const helmet = renderSEOHead({
        title: 'Test Page - Careerak',
        description: 'This is a test description for the page that should be between 150 and 160 characters long to meet SEO requirements and best practices.',
        image: '/images/test.jpg',
      });

      const ogImage = helmet.metaTags.find(
        tag => tag.property === 'og:image'
      );
      expect(ogImage.content).toBe('https://careerak.com/images/test.jpg');

      // Restore window.location
      window.location = originalLocation;
    });

    it('should keep absolute image URLs unchanged', () => {
      const helmet = renderSEOHead({
        title: 'Test Page - Careerak',
        description: 'This is a test description for the page that should be between 150 and 160 characters long to meet SEO requirements and best practices.',
        image: 'https://cdn.careerak.com/images/test.jpg',
      });

      const ogImage = helmet.metaTags.find(
        tag => tag.property === 'og:image'
      );
      expect(ogImage.content).toBe('https://cdn.careerak.com/images/test.jpg');
    });
  });

  describe('Title and Description Length Validation', () => {
    it('should warn if title is too short', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      renderSEOHead({
        title: 'Short Title',
        description: 'This is a test description for the page that should be between 150 and 160 characters long to meet SEO requirements and best practices.',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Title length is')
      );

      consoleSpy.mockRestore();
    });

    it('should warn if title is too long', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      renderSEOHead({
        title: 'This is a very long title that exceeds the recommended 60 character limit for SEO',
        description: 'This is a test description for the page that should be between 150 and 160 characters long to meet SEO requirements and best practices.',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Title length is')
      );

      consoleSpy.mockRestore();
    });

    it('should warn if description is too short', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      renderSEOHead({
        title: 'Test Page - Careerak | This is a good title',
        description: 'Short description',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Description length is')
      );

      consoleSpy.mockRestore();
    });

    it('should warn if description is too long', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      renderSEOHead({
        title: 'Test Page - Careerak | This is a good title',
        description: 'This is a very long description that exceeds the recommended 160 character limit for SEO and should trigger a warning message to help developers optimize their meta descriptions.',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Description length is')
      );

      consoleSpy.mockRestore();
    });

    it('should not warn if title length is optimal (50-60 chars)', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      renderSEOHead({
        title: 'Test Page - Careerak | Find Your Perfect Job Today',
        description: 'This is a test description for the page that should be between 150 and 160 characters long to meet SEO requirements and best practices.',
      });

      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Title length is')
      );

      consoleSpy.mockRestore();
    });

    it('should not warn if description length is optimal (150-160 chars)', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      renderSEOHead({
        title: 'Test Page - Careerak | This is a good title',
        description: 'This is a test description for the page that should be between 150 and 160 characters long to meet SEO requirements and best practices for search engines.',
      });

      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Description length is')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Multi-Language Support', () => {
    it('should support Arabic locale', () => {
      const helmet = renderSEOHead({
        title: 'صفحة الاختبار - Careerak',
        description: 'هذا وصف تجريبي للصفحة يجب أن يكون بين 150 و 160 حرفًا لتلبية متطلبات تحسين محركات البحث وأفضل الممارسات في هذا المجال والتأكد من الجودة.',
        locale: 'ar_SA',
      });

      const ogLocale = helmet.metaTags.find(
        tag => tag.property === 'og:locale'
      );
      expect(ogLocale.content).toBe('ar_SA');
    });

    it('should support English locale', () => {
      const helmet = renderSEOHead({
        title: 'Test Page - Careerak | Find Your Perfect Job',
        description: 'This is a test description for the page that should be between 150 and 160 characters long to meet SEO requirements and best practices.',
        locale: 'en_US',
      });

      const ogLocale = helmet.metaTags.find(
        tag => tag.property === 'og:locale'
      );
      expect(ogLocale.content).toBe('en_US');
    });

    it('should support French locale', () => {
      const helmet = renderSEOHead({
        title: 'Page de test - Careerak | Trouvez votre emploi',
        description: 'Ceci est une description de test pour la page qui devrait contenir entre 150 et 160 caractères pour répondre aux exigences SEO et aux meilleures pratiques.',
        locale: 'fr_FR',
      });

      const ogLocale = helmet.metaTags.find(
        tag => tag.property === 'og:locale'
      );
      expect(ogLocale.content).toBe('fr_FR');
    });
  });

  describe('Canonical URL', () => {
    it('should render canonical link tag', () => {
      const helmet = renderSEOHead({
        title: 'Test Page - Careerak',
        description: 'This is a test description for the page that should be between 150 and 160 characters long to meet SEO requirements and best practices.',
        url: 'https://careerak.com/test',
      });

      const canonical = helmet.linkTags.find(
        tag => tag.rel === 'canonical'
      );
      expect(canonical).toBeDefined();
      expect(canonical.href).toBe('https://careerak.com/test');
    });
  });
});
