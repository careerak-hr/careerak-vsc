# StructuredData Component

## Overview

The `StructuredData` component generates JSON-LD structured data for search engines. It helps improve SEO by providing search engines with detailed information about your content in a standardized format.

## Features

- ✅ **JobPosting Schema** - For job listings (FR-SEO-6)
- ✅ **Course Schema** - For educational courses (FR-SEO-7)
- ✅ **Organization Schema** - For company information
- ✅ **Custom Schema** - For any custom schema.org type
- ✅ **Validation** - Warns about missing required fields
- ✅ **Multiple Schemas** - Support multiple structured data on same page

## Requirements Satisfied

- **FR-SEO-6**: JobPosting schema for job listings
- **FR-SEO-7**: Course schema for courses
- **NFR-SEO-3**: Include structured data for job postings and courses
- **Property SEO-4**: All jobs have structured data

## Installation

The component is already installed as part of the SEO components:

```jsx
import { StructuredData } from '../../components/SEO';
```

## Usage

### JobPosting Schema

```jsx
import { StructuredData } from '../../components/SEO';

const JobPostingPage = ({ job }) => {
  const jobData = {
    title: 'Senior Software Engineer',
    description: 'We are looking for an experienced software engineer...',
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
      <StructuredData type="JobPosting" data={jobData} />
      {/* Your job posting UI */}
    </div>
  );
};
```

### Course Schema

```jsx
import { StructuredData } from '../../components/SEO';

const CoursePage = ({ course }) => {
  const courseData = {
    name: 'Advanced React Development',
    description: 'Learn advanced React patterns...',
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
      <StructuredData type="Course" data={courseData} />
      {/* Your course UI */}
    </div>
  );
};
```

### Organization Schema

```jsx
import { StructuredData } from '../../components/SEO';

const AboutPage = () => {
  const organizationData = {
    name: 'Careerak',
    url: 'https://careerak.com',
    logo: 'https://careerak.com/logo.png',
    description: 'Careerak is a leading platform...',
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
      <StructuredData type="Organization" data={organizationData} />
      {/* Your about page UI */}
    </div>
  );
};
```

### Custom Schema

```jsx
import { StructuredData } from '../../components/SEO';

const HomePage = () => {
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
      <StructuredData type="Custom" data={customData} />
      {/* Your home page UI */}
    </div>
  );
};
```

## Props

### StructuredData

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `type` | string | Yes | Schema type: 'JobPosting', 'Course', 'Organization', or 'Custom' |
| `data` | object | Yes | Data object for the schema (see schemas below) |

## Schema Data Structures

### JobPosting Data

```typescript
{
  title: string;                    // Required
  description: string;              // Required
  datePosted: string;               // Required (ISO 8601 date)
  validThrough?: string;            // Optional (ISO 8601 date)
  employmentType?: string;          // Optional (FULL_TIME, PART_TIME, etc.)
  hiringOrganization: {             // Required
    name: string;
    logo?: string;
    url?: string;
  };
  jobLocation?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  baseSalary?: {
    currency: string;
    value: number;
    unitText: string;               // HOUR, DAY, WEEK, MONTH, YEAR
  };
  url?: string;
  identifier?: string;
}
```

### Course Data

```typescript
{
  name: string;                     // Required
  description: string;              // Required
  provider: {                       // Required
    name: string;
    url?: string;
  };
  courseMode?: string;              // online, onsite, blended
  url?: string;
  image?: string;
  offers?: {
    price: number;
    priceCurrency: string;
    availability?: string;
  };
  hasCourseInstance?: Array<{
    courseMode?: string;
    startDate?: string;
    endDate?: string;
    instructor?: {
      name: string;
    };
  }>;
}
```

### Organization Data

```typescript
{
  name: string;                     // Required
  url?: string;
  logo?: string;
  description?: string;
  contactPoint?: {
    telephone?: string;
    contactType?: string;
    email?: string;
    availableLanguage?: string[];
  };
  sameAs?: string[];                // Social media URLs
}
```

## Multiple Structured Data

You can use multiple `StructuredData` components on the same page:

```jsx
const JobPage = () => {
  return (
    <div>
      <StructuredData type="Organization" data={organizationData} />
      <StructuredData type="JobPosting" data={jobData} />
      {/* Your page content */}
    </div>
  );
};
```

## Validation

The component validates required fields and logs errors to the console if they're missing:

```javascript
// Missing required fields
<StructuredData 
  type="JobPosting" 
  data={{ title: 'Job Title' }} // Missing description, datePosted, hiringOrganization
/>
// Console: "StructuredData: JobPosting requires title, description, datePosted, and hiringOrganization"
```

## Testing

Test your structured data with:

1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema.org Validator**: https://validator.schema.org/
3. **Google Search Console**: Monitor structured data in production

## Best Practices

1. ✅ **Always include required fields** - Check console for validation errors
2. ✅ **Use absolute URLs** - For images, logos, and page URLs
3. ✅ **Keep data accurate** - Structured data should match visible content
4. ✅ **Test before deployment** - Use Google Rich Results Test
5. ✅ **Update regularly** - Keep job postings and courses current
6. ✅ **Use ISO 8601 dates** - Format: YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS

## Common Issues

### Issue: Structured data not showing in search results

**Solution**: 
- Verify data with Google Rich Results Test
- Ensure all required fields are present
- Wait 1-2 weeks for Google to re-crawl
- Check Google Search Console for errors

### Issue: Invalid date format

**Solution**: Use ISO 8601 format (YYYY-MM-DD)

```jsx
// ❌ Wrong
datePosted: '20/02/2026'

// ✅ Correct
datePosted: '2026-02-20'
```

### Issue: Missing required fields

**Solution**: Check console for validation errors and add missing fields

```jsx
// ❌ Wrong - Missing required fields
const jobData = {
  title: 'Job Title'
};

// ✅ Correct - All required fields
const jobData = {
  title: 'Job Title',
  description: 'Job description...',
  datePosted: '2026-02-20',
  hiringOrganization: {
    name: 'Company Name'
  }
};
```

## References

- [Schema.org Documentation](https://schema.org/)
- [Google JobPosting Guidelines](https://developers.google.com/search/docs/appearance/structured-data/job-posting)
- [Google Course Guidelines](https://developers.google.com/search/docs/appearance/structured-data/course)
- [JSON-LD Specification](https://json-ld.org/)

## Support

For issues or questions, check:
- Console warnings for validation errors
- Google Rich Results Test for schema validation
- Schema.org documentation for schema details
