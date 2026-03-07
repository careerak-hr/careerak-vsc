/**
 * Open Graph Tags - Usage Examples
 * 
 * This file demonstrates how to implement Open Graph tags for different pages
 * to ensure attractive social media previews when sharing links.
 * 
 * Requirements:
 * - Requirements 3.4: معاينة جذابة عند المشاركة (Open Graph)
 * - FR-SEO-4: Open Graph tags
 * - FR-SEO-5: Twitter Card tags
 */

import React from 'react';
import SEOHead from '../components/SEO/SEOHead';
import {
  generateJobOGImage,
  generateCourseOGImage,
  generateCompanyOGImage,
  optimizeOGImage
} from '../utils/ogImageGenerator';

/**
 * Example 1: Job Detail Page with Open Graph Tags
 */
export const JobDetailOGExample = ({ job }) => {
  // Generate optimized title (50-60 characters)
  const title = `${job.title} at ${job.company.name} | Careerak`;
  
  // Generate optimized description (150-160 characters)
  const description = `${job.title} at ${job.company.name} in ${job.location}. Salary: ${job.salary.min}-${job.salary.max} ${job.salary.currency}. Apply now!`;
  
  // Generate keywords
  const keywords = `${job.title}, ${job.company.name}, ${job.location}, jobs, careers`;
  
  // Generate OG image
  const ogImage = optimizeOGImage(generateJobOGImage(job));
  
  // Generate canonical URL
  const canonicalUrl = `https://careerak.com/jobs/${job.id}`;

  return (
    <div>
      <SEOHead
        title={title}
        description={description}
        keywords={keywords}
        image={ogImage}
        url={canonicalUrl}
        type="article"
        siteName="Careerak"
        locale="ar_SA"
        alternateLocales={['en_US', 'fr_FR']}
        twitterCard="summary_large_image"
        twitterSite="@careerak"
        additionalMeta={{
          'article:published_time': job.createdAt,
          'article:author': job.company.name,
          'article:section': 'Jobs',
          'article:tag': job.requiredSkills?.join(', ')
        }}
      />
      
      {/* Page content */}
      <h1>{job.title}</h1>
      <p>{job.description}</p>
    </div>
  );
};

/**
 * Example 2: Course Detail Page with Open Graph Tags
 */
export const CourseDetailOGExample = ({ course }) => {
  const title = `${course.title} - Online Course | Careerak`;
  const description = `Learn ${course.title} with ${course.instructor.name}. ${course.description.substring(0, 100)}... Enroll now!`;
  const keywords = `${course.title}, online course, ${course.category}, learning`;
  const ogImage = optimizeOGImage(generateCourseOGImage(course));
  const canonicalUrl = `https://careerak.com/courses/${course.id}`;

  return (
    <div>
      <SEOHead
        title={title}
        description={description}
        keywords={keywords}
        image={ogImage}
        url={canonicalUrl}
        type="article"
        siteName="Careerak"
        twitterCard="summary_large_image"
        additionalMeta={{
          'article:published_time': course.createdAt,
          'article:author': course.instructor.name,
          'article:section': 'Courses'
        }}
      />
      
      <h1>{course.title}</h1>
      <p>{course.description}</p>
    </div>
  );
};

/**
 * Example 3: Company Profile Page with Open Graph Tags
 */
export const CompanyProfileOGExample = ({ company }) => {
  const title = `${company.name} - Company Profile | Careerak`;
  const description = `${company.name} - ${company.description.substring(0, 130)}. ${company.openPositions} open positions. View jobs now!`;
  const keywords = `${company.name}, company profile, jobs, careers`;
  const ogImage = optimizeOGImage(generateCompanyOGImage(company));
  const canonicalUrl = `https://careerak.com/companies/${company.id}`;

  return (
    <div>
      <SEOHead
        title={title}
        description={description}
        keywords={keywords}
        image={ogImage}
        url={canonicalUrl}
        type="profile"
        siteName="Careerak"
        twitterCard="summary_large_image"
        additionalMeta={{
          'profile:username': company.username
        }}
      />
      
      <h1>{company.name}</h1>
      <p>{company.description}</p>
    </div>
  );
};

/**
 * Example 4: Job Listings Page with Open Graph Tags
 */
export const JobListingsOGExample = () => {
  const title = 'Find Your Dream Job - Browse Latest Opportunities | Careerak';
  const description = 'Discover thousands of job opportunities across the Middle East. Find jobs in technology, healthcare, finance, and more. Apply now on Careerak!';
  const keywords = 'jobs, careers, employment, job search, hiring, vacancies';
  const ogImage = 'https://careerak.com/og-images/job-listings.jpg';
  const canonicalUrl = 'https://careerak.com/job-postings';

  return (
    <div>
      <SEOHead
        title={title}
        description={description}
        keywords={keywords}
        image={ogImage}
        url={canonicalUrl}
        type="website"
        siteName="Careerak"
        twitterCard="summary_large_image"
      />
      
      <h1>Job Listings</h1>
      {/* Job cards */}
    </div>
  );
};

/**
 * Example 5: Testing Open Graph Tags
 * 
 * How to test:
 * 1. Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
 * 2. Twitter Card Validator: https://cards-dev.twitter.com/validator
 * 3. LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
 * 4. Open Graph Check: https://opengraphcheck.com/
 */
export const TestingOGTags = () => {
  return (
    <div className="og-testing-guide">
      <h2>Testing Open Graph Tags</h2>
      
      <div className="testing-tools">
        <h3>Recommended Testing Tools:</h3>
        <ul>
          <li>
            <strong>Facebook Sharing Debugger:</strong>
            <a href="https://developers.facebook.com/tools/debug/" target="_blank" rel="noopener noreferrer">
              https://developers.facebook.com/tools/debug/
            </a>
            <p>Test how your page appears when shared on Facebook</p>
          </li>
          
          <li>
            <strong>Twitter Card Validator:</strong>
            <a href="https://cards-dev.twitter.com/validator" target="_blank" rel="noopener noreferrer">
              https://cards-dev.twitter.com/validator
            </a>
            <p>Preview Twitter Card appearance</p>
          </li>
          
          <li>
            <strong>LinkedIn Post Inspector:</strong>
            <a href="https://www.linkedin.com/post-inspector/" target="_blank" rel="noopener noreferrer">
              https://www.linkedin.com/post-inspector/
            </a>
            <p>Check LinkedIn preview</p>
          </li>
          
          <li>
            <strong>Open Graph Check:</strong>
            <a href="https://opengraphcheck.com/" target="_blank" rel="noopener noreferrer">
              https://opengraphcheck.com/
            </a>
            <p>Comprehensive OG tags validation</p>
          </li>
        </ul>
      </div>

      <div className="testing-checklist">
        <h3>Testing Checklist:</h3>
        <ul>
          <li>✅ Title displays correctly (50-60 characters)</li>
          <li>✅ Description is clear and compelling (150-160 characters)</li>
          <li>✅ Image loads and displays properly (1200x630px recommended)</li>
          <li>✅ URL is correct and canonical</li>
          <li>✅ Type is appropriate (website, article, profile)</li>
          <li>✅ Locale matches content language</li>
          <li>✅ Twitter Card renders correctly</li>
          <li>✅ No broken images or missing data</li>
        </ul>
      </div>

      <div className="best-practices">
        <h3>Best Practices:</h3>
        <ul>
          <li>Use high-quality images (min 1200x630px)</li>
          <li>Keep titles concise and descriptive</li>
          <li>Write compelling descriptions with CTAs</li>
          <li>Include relevant keywords naturally</li>
          <li>Test on multiple platforms before launch</li>
          <li>Update OG tags when content changes</li>
          <li>Use absolute URLs for all resources</li>
          <li>Optimize images for fast loading</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Example 6: Dynamic OG Tags Based on User Language
 */
export const MultilingualOGExample = ({ job, language }) => {
  const translations = {
    ar: {
      title: `${job.title} في ${job.company.name} | كاريرك`,
      description: `${job.title} في ${job.company.name} بـ ${job.location}. الراتب: ${job.salary.min}-${job.salary.max} ${job.salary.currency}. قدّم الآن!`,
      locale: 'ar_SA'
    },
    en: {
      title: `${job.title} at ${job.company.name} | Careerak`,
      description: `${job.title} at ${job.company.name} in ${job.location}. Salary: ${job.salary.min}-${job.salary.max} ${job.salary.currency}. Apply now!`,
      locale: 'en_US'
    },
    fr: {
      title: `${job.title} chez ${job.company.name} | Careerak`,
      description: `${job.title} chez ${job.company.name} à ${job.location}. Salaire: ${job.salary.min}-${job.salary.max} ${job.salary.currency}. Postulez maintenant!`,
      locale: 'fr_FR'
    }
  };

  const content = translations[language] || translations.en;

  return (
    <div>
      <SEOHead
        title={content.title}
        description={content.description}
        keywords={`${job.title}, ${job.company.name}, ${job.location}`}
        image={generateJobOGImage(job)}
        url={`https://careerak.com/${language}/jobs/${job.id}`}
        type="article"
        locale={content.locale}
        alternateLocales={['ar_SA', 'en_US', 'fr_FR']}
        twitterCard="summary_large_image"
      />
      
      <h1>{job.title}</h1>
    </div>
  );
};

export default {
  JobDetailOGExample,
  CourseDetailOGExample,
  CompanyProfileOGExample,
  JobListingsOGExample,
  TestingOGTags,
  MultilingualOGExample
};
