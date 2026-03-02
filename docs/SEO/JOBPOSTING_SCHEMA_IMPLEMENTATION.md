# JobPosting Schema Implementation

## Overview
This document describes the implementation of JSON-LD structured data for job postings on the Careerak platform, fulfilling requirement FR-SEO-6.

**Date**: 2026-02-20  
**Status**: ✅ Implemented  
**Requirements**: FR-SEO-6, NFR-SEO-3, Property SEO-4

## Implementation Details

### 1. Components

#### StructuredData Component
**Location**: `frontend/src/components/SEO/StructuredData.jsx`

The StructuredData component generates JSON-LD structured data for search engines. It supports multiple schema types including JobPosting, Course, and Organization.

**Features**:
- Generates valid schema.org JSON-LD markup
- Validates required fields
- Supports optional fields for enhanced SEO
- Integrates with React Helmet for head management

#### SEO Helpers
**Location**: `frontend/src/utils/seoHelpers.js`

Utility functions for transforming application data to schema.org format.

**Key Functions**:
- `transformJobToSchema(job, options)` - Transforms job data to JobPosting schema
- `transformCourseToSchema(course, options)` - Transforms course data to Course schema
- `validateStructuredData(data, type)` - Validates structured data

### 2. JobPosting Schema Structure

The JobPosting schema follows schema.org specifications and includes:

**Required Fields**:
- `title` - Job title
- `description` - Job description
- `datePosted` - ISO 8601 date when job was posted
- `hiringOrganization` - Organization posting the job

**Optional Fields**:
- `validThrough` - Expiration date (30 days from posting)
- `employmentType` - FULL_TIME, PART_TIME, CONTRACTOR, TEMPORARY
- `jobLocation` - Location with address details
- `baseSalary` - Salary information with currency
- `url` - Direct link to job posting
- `identifier` - Unique job ID

### 3. Integration

#### JobPostingsPage
**Location**: `frontend/src/pages/09_JobPostingsPage.jsx`

The JobPostingsPage now includes structured data for each job listing:

```jsx
import { StructuredData } from '../components/SEO';
import { transformJobToSchema } from '../utils/seoHelpers';

// In the component:
{jobs.map((job) => {
  const jobSchemaData = transformJobToSchema(job);
  
  return (
    <React.Fragment key={job.id}>
      <StructuredData type="JobPosting" data={jobSchemaData} />
      {/* Job card UI */}
    </React.Fragment>
  );
})}
```

### 4. Data Transformation

The `transformJobToSchema` function handles:

1. **Employment Type Mapping**:
   - Full-time → FULL_TIME
   - Part-time → PART_TIME
   - Contract → CONTRACTOR
   - Temporary → TEMPORARY

2. **Location Processing**:
   - Extracts city/region from location string
   - Determines country code based on location
   - Supports all Middle East countries

3. **Salary Formatting**:
   - Converts salary range to schema format
   - Includes currency (SAR, AED, EGP, etc.)
   - Specifies unit (YEAR, MONTH, HOUR)

4. **Organization Details**:
   - Uses company name from job poster
   - Includes logo if available
   - Links to company website

### 5. Example Output

```json
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "Senior Frontend Developer",
  "description": "We are looking for an experienced frontend developer...",
  "datePosted": "2026-02-20T10:00:00Z",
  "validThrough": "2026-03-22T10:00:00Z",
  "employmentType": "FULL_TIME",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "Tech Corp",
    "logo": "https://careerak.com/logo.png",
    "sameAs": "https://careerak.com"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Riyadh",
      "addressCountry": "SA"
    }
  },
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "SAR",
    "value": {
      "@type": "QuantitativeValue",
      "value": 120000,
      "unitText": "YEAR"
    }
  },
  "url": "https://careerak.com/jobs/1",
  "identifier": {
    "@type": "PropertyValue",
    "name": "Job ID",
    "value": "1"
  }
}
```

### 6. Benefits

**SEO Benefits**:
- ✅ Enhanced search engine visibility
- ✅ Rich snippets in Google search results
- ✅ Better job posting indexing
- ✅ Improved click-through rates

**User Benefits**:
- ✅ More detailed job information in search
- ✅ Better job discovery
- ✅ Clearer job details before clicking

**Technical Benefits**:
- ✅ Standardized data format
- ✅ Easy to maintain and extend
- ✅ Validation built-in
- ✅ Reusable components

### 7. Validation

To validate the structured data:

1. **Google Rich Results Test**:
   - Visit: https://search.google.com/test/rich-results
   - Enter the job posting URL
   - Verify JobPosting schema is detected

2. **Schema.org Validator**:
   - Visit: https://validator.schema.org/
   - Paste the JSON-LD output
   - Check for errors or warnings

3. **Browser DevTools**:
   - Open page with job listings
   - View page source
   - Look for `<script type="application/ld+json">` tags
   - Verify JSON structure

### 8. Testing

**Manual Testing**:
1. Navigate to Job Postings page
2. View page source
3. Verify JSON-LD script tags are present
4. Check that each job has structured data
5. Validate required fields are populated

**Automated Testing**:
- Unit tests for `transformJobToSchema`
- Integration tests for StructuredData component
- Property-based tests for schema validation

### 9. Future Enhancements

**Phase 2**:
- Add more detailed location information (coordinates)
- Include job benefits and perks
- Add application deadline
- Include remote work options
- Add job experience level

**Phase 3**:
- Dynamic schema generation based on job type
- A/B testing for schema variations
- Analytics for structured data impact
- Integration with Google Jobs API

### 10. Maintenance

**Regular Tasks**:
- Monitor Google Search Console for structured data errors
- Update schema when schema.org specifications change
- Review and update country/location mappings
- Validate new job fields are included in schema

**Troubleshooting**:
- If structured data not appearing: Check React Helmet is working
- If validation fails: Verify required fields are present
- If wrong data: Check transformation function logic
- If multiple schemas conflict: Ensure unique keys in React

### 11. Related Files

**Frontend**:
- `frontend/src/components/SEO/StructuredData.jsx` - Main component
- `frontend/src/components/SEO/StructuredData.example.jsx` - Usage examples
- `frontend/src/utils/seoHelpers.js` - Transformation utilities
- `frontend/src/pages/09_JobPostingsPage.jsx` - Integration example

**Backend**:
- `backend/src/models/JobPosting.js` - Job data model

**Documentation**:
- `docs/JOBPOSTING_SCHEMA_IMPLEMENTATION.md` - This file
- `frontend/src/components/SEO/StructuredData.README.md` - Component docs

### 12. References

- [Schema.org JobPosting](https://schema.org/JobPosting)
- [Google Jobs Structured Data](https://developers.google.com/search/docs/appearance/structured-data/job-posting)
- [JSON-LD Specification](https://json-ld.org/)
- [React Helmet Async](https://github.com/staylor/react-helmet-async)

---

## Summary

The JobPosting schema implementation provides comprehensive structured data for all job listings on the Careerak platform. This enhances SEO, improves search visibility, and provides users with richer job information directly in search results.

**Key Achievements**:
- ✅ FR-SEO-6: JobPosting schema implemented
- ✅ NFR-SEO-3: Structured data for all jobs
- ✅ Property SEO-4: All jobs have structured data
- ✅ Schema.org compliant
- ✅ Google Rich Results compatible
- ✅ Reusable and maintainable code

**Next Steps**:
- Implement Course schema (Task 6.3.3)
- Add Organization schema (Task 6.3.4)
- Test with Google Rich Results Test
- Monitor Search Console for errors
