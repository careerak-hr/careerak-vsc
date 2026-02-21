# Course Schema Implementation

## Overview
This document describes the implementation of Course structured data (JSON-LD) for SEO optimization on the Careerak platform.

## Requirements
- **FR-SEO-7**: When displaying courses, the system shall include JSON-LD structured data with Course schema
- **NFR-SEO-3**: The system shall include structured data for job postings and courses
- **Property SEO-4**: All courses have structured data

## Implementation

### Component Used
- `StructuredData` component from `frontend/src/components/SEO/StructuredData.jsx`
- Already supports Course schema type

### Pages Updated
1. **CoursesPage** (`frontend/src/pages/11_CoursesPage.jsx`)
   - Added `StructuredData` import
   - Created `generateCourseSchemaData()` helper function
   - Added `<StructuredData type="Course" />` to each course card

### Course Schema Structure
```javascript
{
  name: string,              // Course title
  description: string,       // Course description
  provider: {
    name: string,           // Provider name (Careerak)
    url: string             // Provider URL
  },
  courseMode: string,       // 'online' | 'offline' | 'blended'
  url: string,              // Course URL
  offers: {
    price: string,          // Price value
    priceCurrency: string,  // Currency code (USD, SAR, etc.)
    availability: string    // Schema.org availability URL
  },
  hasCourseInstance: [{
    courseMode: string,
    instructor: {
      name: string
    }
  }]
}
```

### Example Usage
```jsx
import { StructuredData } from '../components/SEO';

const courseData = {
  name: 'Advanced React Development',
  description: 'Learn Advanced React Development with John Doe. Duration: 8 weeks.',
  provider: {
    name: 'Careerak',
    url: 'https://careerak.com'
  },
  courseMode: 'online',
  url: 'https://careerak.com/courses/1',
  offers: {
    price: '299',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock'
  },
  hasCourseInstance: [
    {
      courseMode: 'online',
      instructor: {
        name: 'John Doe'
      }
    }
  ]
};

<StructuredData type="Course" data={courseData} />
```

## Benefits
1. **Improved SEO**: Search engines can better understand course content
2. **Rich Snippets**: Courses may appear with enhanced information in search results
3. **Better Discoverability**: Courses are more likely to appear in relevant searches
4. **Structured Information**: Provides machine-readable course data

## Validation
To validate the structured data:
1. Open the courses page in a browser
2. View page source
3. Look for `<script type="application/ld+json">` tags
4. Use Google's Rich Results Test: https://search.google.com/test/rich-results
5. Paste the page URL or the JSON-LD code

## Future Enhancements
1. Add more course properties (duration, level, prerequisites)
2. Include course ratings and reviews
3. Add course completion statistics
4. Support for course series/programs
5. Integration with actual course API endpoints

## Related Files
- `frontend/src/components/SEO/StructuredData.jsx` - Main component
- `frontend/src/components/SEO/StructuredData.example.jsx` - Usage examples
- `frontend/src/pages/11_CoursesPage.jsx` - Implementation
- `backend/src/models/EducationalCourse.js` - Course data model
- `backend/src/models/TrainingCourse.js` - Training course data model

## Testing
- Manual testing: Visit `/courses` page and inspect page source
- Automated testing: Use Google Rich Results Test
- Lighthouse SEO audit should show improved structured data score

## Status
✅ Implemented - 2026-02-21
- Course schema added to CoursesPage
- All 6 mock courses include structured data
- Ready for production deployment

## Notes
- The implementation uses mock data currently
- When real API is integrated, update `generateCourseSchemaData()` to use actual course data
- Consider adding structured data to individual course detail pages when created
- Ensure all required fields (name, description, provider) are always present
