import React from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

/**
 * StructuredData Component
 * 
 * Generates JSON-LD structured data for search engines.
 * Supports JobPosting, Course, Organization, and custom schemas.
 * 
 * Requirements:
 * - FR-SEO-6: JobPosting schema for job listings
 * - FR-SEO-7: Course schema for courses
 * - NFR-SEO-3: Include structured data for job postings and courses
 * - Property SEO-4: All jobs have structured data
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Schema type (JobPosting, Course, Organization, Custom)
 * @param {Object} props.data - Data object for the schema
 */
const StructuredData = ({ type, data }) => {
  // Generate structured data based on type
  const generateStructuredData = () => {
    switch (type) {
      case 'JobPosting':
        return generateJobPostingSchema(data);
      case 'Course':
        return generateCourseSchema(data);
      case 'Organization':
        return generateOrganizationSchema(data);
      case 'Custom':
        return data; // Allow custom schema
      default:
        console.warn(`StructuredData: Unknown schema type "${type}"`);
        return null;
    }
  };

  const structuredData = generateStructuredData();

  if (!structuredData) {
    return null;
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

/**
 * Generate JobPosting schema
 * @param {Object} data - Job posting data
 * @returns {Object} JobPosting schema
 */
const generateJobPostingSchema = (data) => {
  const {
    title,
    description,
    datePosted,
    validThrough,
    employmentType,
    hiringOrganization,
    jobLocation,
    baseSalary,
    url,
    identifier
  } = data;

  // Validate required fields
  if (!title || !description || !datePosted || !hiringOrganization) {
    console.error('StructuredData: JobPosting requires title, description, datePosted, and hiringOrganization');
    return null;
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title,
    description,
    datePosted,
    ...(validThrough && { validThrough }),
    ...(employmentType && { employmentType }),
    hiringOrganization: {
      '@type': 'Organization',
      name: hiringOrganization.name,
      ...(hiringOrganization.logo && { logo: hiringOrganization.logo }),
      ...(hiringOrganization.url && { sameAs: hiringOrganization.url })
    },
    ...(jobLocation && {
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          ...(jobLocation.streetAddress && { streetAddress: jobLocation.streetAddress }),
          ...(jobLocation.addressLocality && { addressLocality: jobLocation.addressLocality }),
          ...(jobLocation.addressRegion && { addressRegion: jobLocation.addressRegion }),
          ...(jobLocation.postalCode && { postalCode: jobLocation.postalCode }),
          ...(jobLocation.addressCountry && { addressCountry: jobLocation.addressCountry })
        }
      }
    }),
    ...(baseSalary && {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: baseSalary.currency || 'USD',
        value: {
          '@type': 'QuantitativeValue',
          value: baseSalary.value,
          unitText: baseSalary.unitText || 'YEAR'
        }
      }
    }),
    ...(url && { url }),
    ...(identifier && { identifier: { '@type': 'PropertyValue', name: 'Job ID', value: identifier } })
  };

  return schema;
};

/**
 * Generate Course schema
 * @param {Object} data - Course data
 * @returns {Object} Course schema
 */
const generateCourseSchema = (data) => {
  const {
    name,
    description,
    provider,
    courseMode,
    url,
    image,
    offers,
    hasCourseInstance
  } = data;

  // Validate required fields
  if (!name || !description || !provider) {
    console.error('StructuredData: Course requires name, description, and provider');
    return null;
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: provider.name,
      ...(provider.url && { sameAs: provider.url })
    },
    ...(courseMode && { courseMode }),
    ...(url && { url }),
    ...(image && { image }),
    ...(offers && {
      offers: {
        '@type': 'Offer',
        price: offers.price,
        priceCurrency: offers.priceCurrency || 'USD',
        ...(offers.availability && { availability: offers.availability })
      }
    }),
    ...(hasCourseInstance && {
      hasCourseInstance: hasCourseInstance.map(instance => ({
        '@type': 'CourseInstance',
        ...(instance.courseMode && { courseMode: instance.courseMode }),
        ...(instance.startDate && { startDate: instance.startDate }),
        ...(instance.endDate && { endDate: instance.endDate }),
        ...(instance.instructor && {
          instructor: {
            '@type': 'Person',
            name: instance.instructor.name
          }
        })
      }))
    })
  };

  return schema;
};

/**
 * Generate Organization schema
 * @param {Object} data - Organization data
 * @returns {Object} Organization schema
 */
const generateOrganizationSchema = (data) => {
  const {
    name,
    url,
    logo,
    description,
    contactPoint,
    sameAs
  } = data;

  // Validate required fields
  if (!name) {
    console.error('StructuredData: Organization requires name');
    return null;
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    ...(url && { url }),
    ...(logo && { logo }),
    ...(description && { description }),
    ...(contactPoint && {
      contactPoint: {
        '@type': 'ContactPoint',
        ...(contactPoint.telephone && { telephone: contactPoint.telephone }),
        ...(contactPoint.contactType && { contactType: contactPoint.contactType }),
        ...(contactPoint.email && { email: contactPoint.email }),
        ...(contactPoint.availableLanguage && { availableLanguage: contactPoint.availableLanguage })
      }
    }),
    ...(sameAs && { sameAs })
  };

  return schema;
};

StructuredData.propTypes = {
  type: PropTypes.oneOf(['JobPosting', 'Course', 'Organization', 'Custom']).isRequired,
  data: PropTypes.object.isRequired
};

export default StructuredData;
