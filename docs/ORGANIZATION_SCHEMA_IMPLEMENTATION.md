# Organization Schema Implementation

**Date**: 2026-02-21  
**Task**: 6.3.4 Add Organization schema for company info  
**Status**: ✅ Completed

## Overview

Added Organization structured data (JSON-LD) to the Careerak platform to improve SEO and provide search engines with comprehensive company information.

## Implementation Details

### 1. Location
The Organization schema was added to `frontend/src/App.jsx` at the root level, ensuring it's available on all pages of the application.

### 2. Schema Data Structure

```javascript
const organizationData = {
  name: 'Careerak',
  url: 'https://careerak.com',
  logo: 'https://careerak.com/logo.jpg',
  description: 'Regional platform specialized in Human Resources, Employment, Training Courses, and Career Development across Arab countries.',
  contactPoint: {
    telephone: '+966-XX-XXX-XXXX',
    contactType: 'Customer Service',
    email: 'careerak.hr@gmail.com',
    availableLanguage: ['Arabic', 'English', 'French']
  },
  sameAs: [
    'https://www.facebook.com/careerak',
    'https://www.twitter.com/careerak',
    'https://www.linkedin.com/company/careerak'
  ]
};
```

### 3. Schema.org Compliance

The implementation follows the [schema.org Organization](https://schema.org/Organization) specification and includes:

**Required Fields**:
- `name` - Organization name
- `@context` - https://schema.org (added by StructuredData component)
- `@type` - Organization (added by StructuredData component)

**Recommended Fields**:
- `url` - Official website
- `logo` - Company logo
- `description` - Company description
- `contactPoint` - Contact information
- `sameAs` - Social media profiles

### 4. Generated JSON-LD

The StructuredData component generates the following JSON-LD:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Careerak",
  "url": "https://careerak.com",
  "logo": "https://careerak.com/logo.jpg",
  "description": "Regional platform specialized in Human Resources, Employment, Training Courses, and Career Development across Arab countries.",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+966-XX-XXX-XXXX",
    "contactType": "Customer Service",
    "email": "careerak.hr@gmail.com",
    "availableLanguage": ["Arabic", "English", "French"]
  },
  "sameAs": [
    "https://www.facebook.com/careerak",
    "https://www.twitter.com/careerak",
    "https://www.linkedin.com/company/careerak"
  ]
}
```

## Files Modified

1. **frontend/src/App.jsx**
   - Added import for StructuredData component
   - Added organizationData object
   - Added StructuredData component to render tree

## Files Created

1. **frontend/src/tests/seo-organization-schema.test.jsx**
   - 8 comprehensive tests
   - Tests for required fields, optional fields, and structure validation
   - Integration test for App.jsx data structure

## Testing

All tests pass successfully:

```bash
✓ src/tests/seo-organization-schema.test.jsx (8)
  ✓ Organization Schema Implementation (8)
    ✓ StructuredData Component - Organization Type (5)
      ✓ should render Organization schema with required fields
      ✓ should include contact information when provided
      ✓ should include social media links when provided
      ✓ should handle minimal Organization data (name only)
      ✓ should not render when name is missing
    ✓ Organization Schema Structure (2)
      ✓ should have correct schema.org structure
      ✓ should have valid contact point structure
    ✓ App.jsx Integration (1)
      ✓ should verify Organization data structure used in App.jsx
```

## SEO Benefits

1. **Enhanced Search Results**: Rich snippets in Google search results
2. **Knowledge Graph**: Potential inclusion in Google Knowledge Graph
3. **Social Media**: Better link previews when sharing
4. **Voice Search**: Improved voice search optimization
5. **Local SEO**: Better local search visibility with contact information

## Validation

You can validate the structured data using:
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
- Browser DevTools → View Page Source → Search for "application/ld+json"

## Future Enhancements

Consider adding:
- `address` - Physical office address
- `foundingDate` - Company founding date
- `numberOfEmployees` - Company size
- `areaServed` - Geographic areas served
- `aggregateRating` - Company ratings (when available)

## Requirements Met

✅ Task 6.3.4: Add Organization schema for company info  
✅ Schema.org compliant structure  
✅ Includes contact information  
✅ Includes social media links  
✅ Comprehensive test coverage  
✅ No diagnostics or errors

## Notes

- The Organization schema is rendered on every page via App.jsx
- The StructuredData component was already implemented and supports Organization type
- The implementation follows the existing pattern used for JobPosting and Course schemas
- Contact telephone number is placeholder and should be updated with actual number
