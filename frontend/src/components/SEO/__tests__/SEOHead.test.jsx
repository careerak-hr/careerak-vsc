import React from 'react';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import SEOHead from '../SEOHead';

describe('SEOHead Component', () => {
  // Suppress console warnings during tests
  const originalWarn = console.warn;
  let consoleOutput = [];

  beforeEach(() => {
    consoleOutput = [];
    console.warn = (output) => consoleOutput.push(output);
  });

  afterEach(() => {
    console.warn = originalWarn;
  });

  const renderWithHelmet = (component) => {
    return render(
      <HelmetProvider>
        {component}
      </HelmetProvider>
    );
  };

  describe('Title Prop Validation (50-60 characters)', () => {
    test('should warn when title is too short (< 50 characters)', () => {
      const shortTitle = 'Short Title'; // 11 characters
      
      renderWithHelmet(
        <SEOHead
          title={shortTitle}
          description="This is a test description that is long enough to meet the requirements and falls within the recommended range of one hundred fifty to one hundred sixty characters."
        />
      );

      expect(consoleOutput.length).toBeGreaterThan(0);
      expect(consoleOutput[0]).toContain('SEO Warning');
      expect(consoleOutput[0]).toContain('11 characters');
      expect(consoleOutput[0]).toContain('50-60 characters');
    });

    test('should warn when title is too long (> 60 characters)', () => {
      const longTitle = 'This is a very long title that exceeds the recommended sixty character limit'; // 78 characters
      
      renderWithHelmet(
        <SEOHead
          title={longTitle}
          description="This is a test description that is long enough to meet the requirements and falls within the recommended range of one hundred fifty to one hundred sixty characters."
        />
      );

      expect(consoleOutput.length).toBeGreaterThan(0);
      expect(consoleOutput[0]).toContain('SEO Warning');
      expect(consoleOutput[0]).toContain('76 characters'); // Actual length
      expect(consoleOutput[0]).toContain('50-60 characters');
    });

    test('should NOT warn when title is within range (50-60 characters)', () => {
      const validTitle = 'This is a valid title between fifty and sixty chars!'; // 54 characters
      const validDescription = 'A'.repeat(155); // 155 characters - within valid range
      
      renderWithHelmet(
        <SEOHead
          title={validTitle}
          description={validDescription}
        />
      );

      expect(consoleOutput.length).toBe(0);
    });

    test('should warn with exact title in message', () => {
      const testTitle = 'Test Title';
      
      renderWithHelmet(
        <SEOHead
          title={testTitle}
          description="This is a test description that is long enough to meet the requirements and falls within the recommended range of one hundred fifty to one hundred sixty characters."
        />
      );

      expect(consoleOutput[0]).toContain(`Title: "${testTitle}"`);
    });

    test('should validate title at exactly 50 characters (boundary)', () => {
      const title50 = 'A'.repeat(50); // Exactly 50 characters
      const validDescription = 'A'.repeat(155); // 155 characters - within valid range
      
      renderWithHelmet(
        <SEOHead
          title={title50}
          description={validDescription}
        />
      );

      expect(consoleOutput.length).toBe(0);
    });

    test('should validate title at exactly 60 characters (boundary)', () => {
      const title60 = 'A'.repeat(60); // Exactly 60 characters
      const validDescription = 'A'.repeat(155); // 155 characters - within valid range
      
      renderWithHelmet(
        <SEOHead
          title={title60}
          description={validDescription}
        />
      );

      expect(consoleOutput.length).toBe(0);
    });

    test('should warn at 49 characters (just below minimum)', () => {
      const title49 = 'A'.repeat(49);
      
      renderWithHelmet(
        <SEOHead
          title={title49}
          description="This is a test description that is long enough to meet the requirements and falls within the recommended range of one hundred fifty to one hundred sixty characters."
        />
      );

      expect(consoleOutput.length).toBeGreaterThan(0);
      expect(consoleOutput[0]).toContain('49 characters');
    });

    test('should warn at 61 characters (just above maximum)', () => {
      const title61 = 'A'.repeat(61);
      
      renderWithHelmet(
        <SEOHead
          title={title61}
          description="This is a test description that is long enough to meet the requirements and falls within the recommended range of one hundred fifty to one hundred sixty characters."
        />
      );

      expect(consoleOutput.length).toBeGreaterThan(0);
      expect(consoleOutput[0]).toContain('61 characters');
    });
  });

  describe('Description Prop Validation (150-160 characters)', () => {
    test('should warn when description is too short (< 150 characters)', () => {
      const shortDescription = 'This is a short description.'; // 28 characters
      
      renderWithHelmet(
        <SEOHead
          title="Valid Title That Is Between Fifty And Sixty Characters"
          description={shortDescription}
        />
      );

      expect(consoleOutput.length).toBeGreaterThan(0);
      expect(consoleOutput.some(msg => msg.includes('Description length'))).toBe(true);
      expect(consoleOutput.some(msg => msg.includes('28 characters'))).toBe(true);
      expect(consoleOutput.some(msg => msg.includes('150-160 characters'))).toBe(true);
    });

    test('should warn when description is too long (> 160 characters)', () => {
      const longDescription = 'This is a very long description that exceeds the recommended one hundred sixty character limit for optimal SEO performance and social media sharing capabilities.'; // 175 characters
      
      renderWithHelmet(
        <SEOHead
          title="Valid Title That Is Between Fifty And Sixty Characters"
          description={longDescription}
        />
      );

      expect(consoleOutput.length).toBeGreaterThan(0);
      expect(consoleOutput.some(msg => msg.includes('Description length'))).toBe(true);
      expect(consoleOutput.some(msg => msg.includes(longDescription.length.toString() + ' characters'))).toBe(true);
      expect(consoleOutput.some(msg => msg.includes('150-160 characters'))).toBe(true);
    });

    test('should NOT warn when description is within range (150-160 characters)', () => {
      const validDescription = 'This is a valid description that meets all the requirements for SEO optimization and is within the recommended character limit of one hundred fifty chars.'; // 155 characters
      
      renderWithHelmet(
        <SEOHead
          title="Valid Title That Is Between Fifty And Sixty Characters"
          description={validDescription}
        />
      );

      expect(consoleOutput.length).toBe(0);
    });

    test('should warn with exact description in message', () => {
      const testDescription = 'Short description';
      
      renderWithHelmet(
        <SEOHead
          title="Valid Title That Is Between Fifty And Sixty Characters"
          description={testDescription}
        />
      );

      expect(consoleOutput.some(msg => msg.includes(`Description: "${testDescription}"`))).toBe(true);
    });

    test('should validate description at exactly 150 characters (boundary)', () => {
      const description150 = 'A'.repeat(150); // Exactly 150 characters
      
      renderWithHelmet(
        <SEOHead
          title="Valid Title That Is Between Fifty And Sixty Characters"
          description={description150}
        />
      );

      expect(consoleOutput.length).toBe(0);
    });

    test('should validate description at exactly 160 characters (boundary)', () => {
      const description160 = 'A'.repeat(160); // Exactly 160 characters
      
      renderWithHelmet(
        <SEOHead
          title="Valid Title That Is Between Fifty And Sixty Characters"
          description={description160}
        />
      );

      expect(consoleOutput.length).toBe(0);
    });

    test('should warn at 149 characters (just below minimum)', () => {
      const description149 = 'A'.repeat(149);
      
      renderWithHelmet(
        <SEOHead
          title="Valid Title That Is Between Fifty And Sixty Characters"
          description={description149}
        />
      );

      expect(consoleOutput.length).toBeGreaterThan(0);
      expect(consoleOutput.some(msg => msg.includes('149 characters'))).toBe(true);
    });

    test('should warn at 161 characters (just above maximum)', () => {
      const description161 = 'A'.repeat(161);
      
      renderWithHelmet(
        <SEOHead
          title="Valid Title That Is Between Fifty And Sixty Characters"
          description={description161}
        />
      );

      expect(consoleOutput.length).toBeGreaterThan(0);
      expect(consoleOutput.some(msg => msg.includes('161 characters'))).toBe(true);
    });
  });

  describe('Keywords Prop (FR-SEO-3)', () => {
    test('should accept keywords prop without errors', () => {
      const keywords = 'jobs, careers, employment, recruitment';
      
      expect(() => {
        renderWithHelmet(
          <SEOHead
            title="Valid Title That Is Between Fifty And Sixty Characters"
            description="This is a valid description that meets all the requirements for SEO optimization and is within the recommended character limit."
            keywords={keywords}
          />
        );
      }).not.toThrow();
    });

    test('should work without keywords prop (optional)', () => {
      expect(() => {
        renderWithHelmet(
          <SEOHead
            title="Valid Title That Is Between Fifty And Sixty Characters"
            description="This is a valid description that meets all the requirements for SEO optimization and is within the recommended character limit."
          />
        );
      }).not.toThrow();
    });

    test('should handle empty keywords string', () => {
      expect(() => {
        renderWithHelmet(
          <SEOHead
            title="Valid Title That Is Between Fifty And Sixty Characters"
            description="This is a valid description that meets all the requirements for SEO optimization and is within the recommended character limit."
            keywords=""
          />
        );
      }).not.toThrow();
    });

    test('should accept comma-separated keywords', () => {
      const keywords = 'job search, career development, training courses, professional growth';
      
      expect(() => {
        renderWithHelmet(
          <SEOHead
            title="Valid Title That Is Between Fifty And Sixty Characters"
            description="This is a valid description that meets all the requirements for SEO optimization and is within the recommended character limit."
            keywords={keywords}
          />
        );
      }).not.toThrow();
    });

    test('should accept keywords in multiple languages (Arabic, English, French)', () => {
      const keywords = 'وظائف, careers, emploi, تدريب, training, formation';
      
      expect(() => {
        renderWithHelmet(
          <SEOHead
            title="Valid Title That Is Between Fifty And Sixty Characters"
            description="This is a valid description that meets all the requirements for SEO optimization and is within the recommended character limit."
            keywords={keywords}
          />
        );
      }).not.toThrow();
    });

    test('should include keywords in PropTypes as optional string', () => {
      // Verify that keywords is defined in PropTypes
      expect(SEOHead.propTypes.keywords).toBeDefined();
      // PropTypes.string is a function, so we just verify it exists
      expect(typeof SEOHead.propTypes.keywords).toBe('function');
    });
  });

  describe('Basic Functionality', () => {
    test('should render without errors', () => {
      const title = 'Valid Title That Is Between Fifty And Sixty Characters';
      
      expect(() => {
        renderWithHelmet(
          <SEOHead
            title={title}
            description="Test description for the platform"
          />
        );
      }).not.toThrow();
    });

    test('should accept all required props', () => {
      expect(() => {
        renderWithHelmet(
          <SEOHead
            title="Valid Title That Is Between Fifty And Sixty Characters"
            description="This is a valid description that meets all the requirements for SEO optimization and is within the recommended character limit."
          />
        );
      }).not.toThrow();
    });

    test('should accept keywords as optional prop', () => {
      expect(() => {
        renderWithHelmet(
          <SEOHead
            title="Valid Title That Is Between Fifty And Sixty Characters"
            description="This is a valid description that meets all the requirements for SEO optimization and is within the recommended character limit."
            keywords="test, keywords, seo"
          />
        );
      }).not.toThrow();
    });
  });

  describe('Image Prop (FR-SEO-4, FR-SEO-5)', () => {
    test('should accept image prop without errors', () => {
      const imageUrl = 'https://example.com/image.jpg';
      
      expect(() => {
        renderWithHelmet(
          <SEOHead
            title="Valid Title That Is Between Fifty And Sixty Characters"
            description="This is a valid description that meets all the requirements for SEO optimization and is within the recommended character limit."
            image={imageUrl}
          />
        );
      }).not.toThrow();
    });

    test('should work without image prop (optional)', () => {
      expect(() => {
        renderWithHelmet(
          <SEOHead
            title="Valid Title That Is Between Fifty And Sixty Characters"
            description="This is a valid description that meets all the requirements for SEO optimization and is within the recommended character limit."
          />
        );
      }).not.toThrow();
    });

    test('should accept absolute image URLs', () => {
      const absoluteUrl = 'https://cdn.example.com/images/og-image.jpg';
      
      expect(() => {
        renderWithHelmet(
          <SEOHead
            title="Valid Title That Is Between Fifty And Sixty Characters"
            description="This is a valid description that meets all the requirements for SEO optimization and is within the recommended character limit."
            image={absoluteUrl}
          />
        );
      }).not.toThrow();
    });

    test('should accept relative image URLs', () => {
      const relativeUrl = '/images/og-image.jpg';
      
      expect(() => {
        renderWithHelmet(
          <SEOHead
            title="Valid Title That Is Between Fifty And Sixty Characters"
            description="This is a valid description that meets all the requirements for SEO optimization and is within the recommended character limit."
            image={relativeUrl}
          />
        );
      }).not.toThrow();
    });

    test('should accept Cloudinary image URLs', () => {
      const cloudinaryUrl = 'https://res.cloudinary.com/careerak/image/upload/v1234567890/og-image.jpg';
      
      expect(() => {
        renderWithHelmet(
          <SEOHead
            title="Valid Title That Is Between Fifty And Sixty Characters"
            description="This is a valid description that meets all the requirements for SEO optimization and is within the recommended character limit."
            image={cloudinaryUrl}
          />
        );
      }).not.toThrow();
    });

    test('should include image in PropTypes as optional string', () => {
      expect(SEOHead.propTypes.image).toBeDefined();
      expect(typeof SEOHead.propTypes.image).toBe('function');
    });

    test('should handle empty image string', () => {
      expect(() => {
        renderWithHelmet(
          <SEOHead
            title="Valid Title That Is Between Fifty And Sixty Characters"
            description="This is a valid description that meets all the requirements for SEO optimization and is within the recommended character limit."
            image=""
          />
        );
      }).not.toThrow();
    });
  });

  describe('URL Prop (FR-SEO-10)', () => {
    test('should accept url prop without errors', () => {
      const pageUrl = 'https://careerak.com/jobs/123';
      
      expect(() => {
        renderWithHelmet(
          <SEOHead
            title="Valid Title That Is Between Fifty And Sixty Characters"
            description="This is a valid description that meets all the requirements for SEO optimization and is within the recommended character limit."
            url={pageUrl}
          />
        );
      }).not.toThrow();
    });

    test('should work without url prop (optional)', () => {
      expect(() => {
        renderWithHelmet(
          <SEOHead
            title="Valid Title That Is Between Fifty And Sixty Characters"
            description="This is a valid description that meets all the requirements for SEO optimization and is within the recommended character limit."
          />
        );
      }).not.toThrow();
    });

    test('should accept absolute URLs', () => {
      const absoluteUrl = 'https://careerak.com/courses/web-development';
      
      expect(() => {
        renderWithHelmet(
          <SEOHead
            title="Valid Title That Is Between Fifty And Sixty Characters"
            description="This is a valid description that meets all the requirements for SEO optimization and is within the recommended character limit."
            url={absoluteUrl}
          />
        );
      }).not.toThrow();
    });

    test('should accept URLs with query parameters', () => {
      const urlWithParams = 'https://careerak.com/jobs?category=tech&location=dubai';
      
      expect(() => {
        renderWithHelmet(
          <SEOHead
            title="Valid Title That Is Between Fifty And Sixty Characters"
            description="This is a valid description that meets all the requirements for SEO optimization and is within the recommended character limit."
            url={urlWithParams}
          />
        );
      }).not.toThrow();
    });

    test('should accept URLs with hash fragments', () => {
      const urlWithHash = 'https://careerak.com/profile/123#experience';
      
      expect(() => {
        renderWithHelmet(
          <SEOHead
            title="Valid Title That Is Between Fifty And Sixty Characters"
            description="This is a valid description that meets all the requirements for SEO optimization and is within the recommended character limit."
            url={urlWithHash}
          />
        );
      }).not.toThrow();
    });

    test('should include url in PropTypes as optional string', () => {
      expect(SEOHead.propTypes.url).toBeDefined();
      expect(typeof SEOHead.propTypes.url).toBe('function');
    });

    test('should handle empty url string', () => {
      expect(() => {
        renderWithHelmet(
          <SEOHead
            title="Valid Title That Is Between Fifty And Sixty Characters"
            description="This is a valid description that meets all the requirements for SEO optimization and is within the recommended character limit."
            url=""
          />
        );
      }).not.toThrow();
    });
  });

  describe('Image and URL Props Together (FR-SEO-4, FR-SEO-5, FR-SEO-10)', () => {
    test('should accept both image and url props together', () => {
      const imageUrl = 'https://example.com/og-image.jpg';
      const pageUrl = 'https://careerak.com/jobs/123';
      
      expect(() => {
        renderWithHelmet(
          <SEOHead
            title="Valid Title That Is Between Fifty And Sixty Characters"
            description="This is a valid description that meets all the requirements for SEO optimization and is within the recommended character limit."
            image={imageUrl}
            url={pageUrl}
          />
        );
      }).not.toThrow();
    });

    test('should work with all props including image and url', () => {
      expect(() => {
        renderWithHelmet(
          <SEOHead
            title="Valid Title That Is Between Fifty And Sixty Characters"
            description="This is a valid description that meets all the requirements for SEO optimization and is within the recommended character limit."
            keywords="jobs, careers, employment"
            image="https://example.com/og-image.jpg"
            url="https://careerak.com/jobs/123"
            type="article"
            siteName="Careerak"
            locale="ar_SA"
            twitterCard="summary_large_image"
            twitterSite="@careerak"
          />
        );
      }).not.toThrow();
    });

    test('should handle relative image URL with absolute page URL', () => {
      expect(() => {
        renderWithHelmet(
          <SEOHead
            title="Valid Title That Is Between Fifty And Sixty Characters"
            description="This is a valid description that meets all the requirements for SEO optimization and is within the recommended character limit."
            image="/images/og-image.jpg"
            url="https://careerak.com/jobs/123"
          />
        );
      }).not.toThrow();
    });

    test('should handle Cloudinary image with custom URL', () => {
      const cloudinaryImage = 'https://res.cloudinary.com/careerak/image/upload/v1234567890/og-job.jpg';
      const jobUrl = 'https://careerak.com/jobs/software-engineer-123';
      
      expect(() => {
        renderWithHelmet(
          <SEOHead
            title="Software Engineer Position | Careerak Jobs Platform"
            description="Join our team as a Software Engineer. We're looking for talented developers with 3+ years of experience in React, Node.js, and modern web technologies."
            keywords="software engineer, react developer, node.js, jobs"
            image={cloudinaryImage}
            url={jobUrl}
          />
        );
      }).not.toThrow();
    });
  });
});
