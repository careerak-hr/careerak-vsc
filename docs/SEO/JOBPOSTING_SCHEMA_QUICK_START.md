# JobPosting Schema - Quick Start Guide

## 🚀 Quick Implementation

### 1. Import Required Components

```jsx
import { StructuredData } from '../components/SEO';
import { transformJobToSchema } from '../utils/seoHelpers';
```

### 2. Transform Job Data

```jsx
const jobSchemaData = transformJobToSchema(job, {
  baseUrl: 'https://careerak.com',
  organizationLogo: 'https://careerak.com/logo.png'
});
```

### 3. Add StructuredData Component

```jsx
<StructuredData type="JobPosting" data={jobSchemaData} />
```

## 📋 Complete Example

### Job Listing Page

```jsx
import React from 'react';
import { StructuredData } from '../components/SEO';
import { transformJobToSchema } from '../utils/seoHelpers';

const JobListingPage = ({ jobs }) => {
  return (
    <div>
      {jobs.map((job) => {
        const jobSchemaData = transformJobToSchema(job);
        
        return (
          <React.Fragment key={job.id}>
            {/* Add structured data for SEO */}
            <StructuredData type="JobPosting" data={jobSchemaData} />
            
            {/* Your job card UI */}
            <div className="job-card">
              <h2>{job.title}</h2>
              <p>{job.description}</p>
              <p>{job.location}</p>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
```

### Job Detail Page

```jsx
import React from 'react';
import { StructuredData } from '../components/SEO';
import { transformJobToSchema } from '../utils/seoHelpers';

const JobDetailPage = ({ job }) => {
  const jobSchemaData = transformJobToSchema(job);
  
  return (
    <div>
      {/* Add structured data */}
      <StructuredData type="JobPosting" data={jobSchemaData} />
      
      {/* Your job detail UI */}
      <article>
        <h1>{job.title}</h1>
        <p>{job.description}</p>
        <div>
          <strong>Company:</strong> {job.company}
        </div>
        <div>
          <strong>Location:</strong> {job.location}
        </div>
        <div>
          <strong>Salary:</strong> {job.salary.min} - {job.salary.max} {job.salary.currency}
        </div>
      </article>
    </div>
  );
};
```

## 🔧 Required Job Data Format

Your job object should have these fields:

```javascript
const job = {
  id: '12345',                    // Required: Unique identifier
  title: 'Senior Developer',      // Required: Job title
  description: 'Job details...',  // Required: Full description
  company: 'Tech Corp',            // Required: Company name
  location: 'Riyadh',             // Required: Location
  jobType: 'Full-time',           // Required: Full-time, Part-time, Contract, Temporary
  status: 'Open',                 // Required: Open or Closed
  createdAt: '2026-02-20',        // Required: ISO date string
  
  // Optional but recommended:
  salary: {
    min: 80000,
    max: 120000,
    currency: 'SAR'
  },
  postedBy: {
    companyName: 'Tech Corp',
    logo: 'https://example.com/logo.png',
    website: 'https://example.com'
  }
};
```

## ✅ Validation Checklist

Before deploying, verify:

- [ ] StructuredData component is imported
- [ ] transformJobToSchema is called for each job
- [ ] Job data includes all required fields
- [ ] Schema appears in page source (view source)
- [ ] JSON-LD is valid (use validator.schema.org)
- [ ] Google Rich Results Test passes

## 🧪 Testing

### 1. View Page Source
```bash
# Open your job page in browser
# Right-click → View Page Source
# Search for: application/ld+json
# Verify JSON structure is present
```

### 2. Google Rich Results Test
```
1. Visit: https://search.google.com/test/rich-results
2. Enter your job page URL
3. Click "Test URL"
4. Verify "JobPosting" is detected
5. Check for errors or warnings
```

### 3. Schema.org Validator
```
1. Visit: https://validator.schema.org/
2. Paste your JSON-LD output
3. Click "Validate"
4. Fix any errors shown
```

## 🐛 Troubleshooting

### Structured Data Not Appearing

**Problem**: No JSON-LD in page source

**Solutions**:
- Check React Helmet is installed and configured
- Verify StructuredData component is rendered
- Check browser console for errors
- Ensure job data is loaded before rendering

### Validation Errors

**Problem**: Schema validator shows errors

**Solutions**:
- Verify all required fields are present
- Check date format is ISO 8601
- Ensure employmentType is valid enum value
- Validate salary structure if present

### Wrong Data in Schema

**Problem**: Schema shows incorrect information

**Solutions**:
- Check transformJobToSchema input data
- Verify job object structure matches expected format
- Review transformation logic in seoHelpers.js
- Check for data type mismatches

## 📊 Expected Results

### In Search Results

Users will see:
- Job title
- Company name
- Location
- Salary range (if provided)
- Posted date
- Job type (Full-time, etc.)

### In Google Jobs

Your jobs may appear in:
- Google Jobs search
- Google for Jobs widget
- Rich snippets with job details
- Enhanced search listings

## 🎯 Best Practices

1. **Always Include Required Fields**
   - title, description, datePosted, hiringOrganization

2. **Add Optional Fields When Available**
   - Salary, location details, validThrough

3. **Keep Data Fresh**
   - Update datePosted when job is reposted
   - Set validThrough for expiring jobs
   - Mark closed jobs appropriately

4. **Validate Regularly**
   - Use Google Search Console
   - Monitor for structured data errors
   - Test after any schema changes

5. **Follow Schema.org Guidelines**
   - Use correct property names
   - Follow data type requirements
   - Include recommended fields

## 📚 Additional Resources

- [Full Implementation Guide](./JOBPOSTING_SCHEMA_IMPLEMENTATION.md)
- [StructuredData Component Docs](../frontend/src/components/SEO/StructuredData.README.md)
- [Schema.org JobPosting](https://schema.org/JobPosting)
- [Google Jobs Guidelines](https://developers.google.com/search/docs/appearance/structured-data/job-posting)

---

**Need Help?**
- Check the full implementation guide
- Review example code in StructuredData.example.jsx
- Test with Google Rich Results Test
- Validate with schema.org validator
