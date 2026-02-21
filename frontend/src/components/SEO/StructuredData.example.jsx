import React from 'react';
import StructuredData from './StructuredData';

/**
 * StructuredData Component Usage Examples
 * 
 * This file demonstrates how to use the StructuredData component
 * for different schema types.
 */

// Example 1: JobPosting Schema
export const JobPostingExample = () => {
  const jobData = {
    title: 'Senior Software Engineer',
    description: 'We are looking for an experienced software engineer to join our team. The ideal candidate will have 5+ years of experience in React, Node.js, and cloud technologies.',
    datePosted: '2026-02-20',
    validThrough: '2026-03-20',
    employmentType: 'FULL_TIME',
    hiringOrganization: {
      name: 'Careerak',
      logo: 'https://careerak.com/logo.png',
      url: 'https://careerak.com'
    },
    jobLocation: {
      streetAddress: '123 Tech Street',
      addressLocality: 'Riyadh',
      addressRegion: 'Riyadh Province',
      postalCode: '12345',
      addressCountry: 'SA'
    },
    baseSalary: {
      currency: 'SAR',
      value: 120000,
      unitText: 'YEAR'
    },
    url: 'https://careerak.com/jobs/senior-software-engineer',
    identifier: 'job-12345'
  };

  return (
    <div>
      <h1>Senior Software Engineer</h1>
      <StructuredData type="JobPosting" data={jobData} />
      {/* Rest of your job posting page */}
    </div>
  );
};

// Example 2: Course Schema
export const CourseExample = () => {
  const courseData = {
    name: 'Advanced React Development',
    description: 'Learn advanced React patterns, hooks, performance optimization, and best practices. This comprehensive course covers everything you need to become a React expert.',
    provider: {
      name: 'Careerak Academy',
      url: 'https://careerak.com/academy'
    },
    courseMode: 'online',
    url: 'https://careerak.com/courses/advanced-react',
    image: 'https://careerak.com/courses/advanced-react.jpg',
    offers: {
      price: 299,
      priceCurrency: 'SAR',
      availability: 'https://schema.org/InStock'
    },
    hasCourseInstance: [
      {
        courseMode: 'online',
        startDate: '2026-03-01',
        endDate: '2026-05-01',
        instructor: {
          name: 'John Doe'
        }
      }
    ]
  };

  return (
    <div>
      <h1>Advanced React Development</h1>
      <StructuredData type="Course" data={courseData} />
      {/* Rest of your course page */}
    </div>
  );
};

// Example 3: Organization Schema
export const OrganizationExample = () => {
  const organizationData = {
    name: 'Careerak',
    url: 'https://careerak.com',
    logo: 'https://careerak.com/logo.png',
    description: 'Careerak is a leading platform for job seekers and employers in the Middle East, offering job postings, courses, and career development resources.',
    contactPoint: {
      telephone: '+966-12-345-6789',
      contactType: 'customer service',
      email: 'careerak.hr@gmail.com',
      availableLanguage: ['Arabic', 'English', 'French']
    },
    sameAs: [
      'https://www.facebook.com/careerak',
      'https://www.twitter.com/careerak',
      'https://www.linkedin.com/company/careerak'
    ]
  };

  return (
    <div>
      <h1>About Careerak</h1>
      <StructuredData type="Organization" data={organizationData} />
      {/* Rest of your about page */}
    </div>
  );
};

// Example 4: Custom Schema
export const CustomSchemaExample = () => {
  const customData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Careerak',
    url: 'https://careerak.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://careerak.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <div>
      <h1>Careerak Home</h1>
      <StructuredData type="Custom" data={customData} />
      {/* Rest of your home page */}
    </div>
  );
};

// Example 5: Multiple Structured Data on Same Page
export const MultipleStructuredDataExample = () => {
  const organizationData = {
    name: 'Careerak',
    url: 'https://careerak.com',
    logo: 'https://careerak.com/logo.png'
  };

  const jobData = {
    title: 'Frontend Developer',
    description: 'Join our team as a frontend developer.',
    datePosted: '2026-02-20',
    hiringOrganization: {
      name: 'Careerak'
    }
  };

  return (
    <div>
      <h1>Job Posting</h1>
      {/* You can use multiple StructuredData components on the same page */}
      <StructuredData type="Organization" data={organizationData} />
      <StructuredData type="JobPosting" data={jobData} />
      {/* Rest of your page */}
    </div>
  );
};

// Example 6: Integration with Existing Pages
export const IntegrationExample = () => {
  // In your actual job posting page component:
  // import { StructuredData } from '../../components/SEO';
  
  // Then in your component:
  const job = {
    // ... your job data from API or state
  };

  const structuredJobData = {
    title: job.title,
    description: job.description,
    datePosted: job.createdAt,
    validThrough: job.expiresAt,
    employmentType: job.employmentType,
    hiringOrganization: {
      name: job.company.name,
      logo: job.company.logo,
      url: job.company.website
    },
    jobLocation: {
      addressLocality: job.location.city,
      addressRegion: job.location.region,
      addressCountry: job.location.country
    },
    baseSalary: job.salary ? {
      currency: job.salary.currency,
      value: job.salary.amount,
      unitText: job.salary.period
    } : undefined,
    url: `https://careerak.com/jobs/${job.id}`,
    identifier: job.id
  };

  return (
    <div>
      <StructuredData type="JobPosting" data={structuredJobData} />
      {/* Your existing job posting UI */}
    </div>
  );
};

export default {
  JobPostingExample,
  CourseExample,
  OrganizationExample,
  CustomSchemaExample,
  MultipleStructuredDataExample,
  IntegrationExample
};
