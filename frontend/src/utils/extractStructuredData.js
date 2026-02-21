/**
 * Extract Structured Data Utility
 * 
 * Helper functions to extract and validate structured data (JSON-LD)
 * from pages for testing with Google Rich Results Test.
 * 
 * Task: 6.3.5 Test structured data with Google Rich Results Test
 */

/**
 * Extract all JSON-LD structured data from the current page
 * @returns {Array<Object>} Array of structured data objects
 */
export const extractAllStructuredData = () => {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  const structuredData = [];

  scripts.forEach((script) => {
    try {
      const data = JSON.parse(script.textContent);
      structuredData.push(data);
    } catch (error) {
      console.error('Error parsing structured data:', error);
    }
  });

  return structuredData;
};

/**
 * Extract structured data by type
 * @param {string} type - Schema type (e.g., 'JobPosting', 'Course', 'Organization')
 * @returns {Array<Object>} Array of structured data objects of the specified type
 */
export const extractStructuredDataByType = (type) => {
  const allData = extractAllStructuredData();
  return allData.filter(data => data['@type'] === type);
};

/**
 * Generate HTML snippet for Google Rich Results Test
 * @param {Object} structuredData - Structured data object
 * @param {string} title - Page title
 * @param {string} content - Page content (optional)
 * @returns {string} HTML snippet ready for testing
 */
export const generateTestHTML = (structuredData, title, content = '') => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <script type="application/ld+json">
  ${JSON.stringify(structuredData, null, 2)}
  </script>
</head>
<body>
  <h1>${title}</h1>
  ${content ? `<p>${content}</p>` : ''}
</body>
</html>`;
};

/**
 * Validate required fields for JobPosting schema
 * @param {Object} data - JobPosting data
 * @returns {Object} Validation result with isValid and errors
 */
export const validateJobPosting = (data) => {
  const errors = [];
  const requiredFields = ['title', 'description', 'datePosted', 'hiringOrganization'];

  requiredFields.forEach(field => {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  if (data.hiringOrganization && !data.hiringOrganization.name) {
    errors.push('Missing required field: hiringOrganization.name');
  }

  // Validate date format (ISO 8601)
  if (data.datePosted && !isValidISODate(data.datePosted)) {
    errors.push('Invalid date format for datePosted (use ISO 8601: YYYY-MM-DD)');
  }

  // Validate employment type
  const validEmploymentTypes = [
    'FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'TEMPORARY',
    'INTERN', 'VOLUNTEER', 'PER_DIEM', 'OTHER'
  ];
  if (data.employmentType && !validEmploymentTypes.includes(data.employmentType)) {
    errors.push(`Invalid employmentType: ${data.employmentType}. Must be one of: ${validEmploymentTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate required fields for Course schema
 * @param {Object} data - Course data
 * @returns {Object} Validation result with isValid and errors
 */
export const validateCourse = (data) => {
  const errors = [];
  const requiredFields = ['name', 'description', 'provider'];

  requiredFields.forEach(field => {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  if (data.provider && !data.provider.name) {
    errors.push('Missing required field: provider.name');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate required fields for Organization schema
 * @param {Object} data - Organization data
 * @returns {Object} Validation result with isValid and errors
 */
export const validateOrganization = (data) => {
  const errors = [];

  if (!data.name) {
    errors.push('Missing required field: name');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate structured data based on type
 * @param {Object} data - Structured data object
 * @param {string} type - Schema type
 * @returns {Object} Validation result
 */
export const validateStructuredData = (data, type) => {
  switch (type) {
    case 'JobPosting':
      return validateJobPosting(data);
    case 'Course':
      return validateCourse(data);
    case 'Organization':
      return validateOrganization(data);
    default:
      return { isValid: true, errors: [] };
  }
};

/**
 * Check if a string is a valid ISO 8601 date
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid ISO 8601 date
 */
const isValidISODate = (dateString) => {
  // ISO 8601 format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
  if (!isoDateRegex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Copy structured data to clipboard for testing
 * @param {Object} data - Structured data object
 * @param {string} title - Page title
 * @returns {Promise<void>}
 */
export const copyTestHTMLToClipboard = async (data, title) => {
  const html = generateTestHTML(data, title);
  
  try {
    await navigator.clipboard.writeText(html);
    console.log('✅ Test HTML copied to clipboard!');
    console.log('📋 Paste it in Google Rich Results Test: https://search.google.com/test/rich-results');
    return true;
  } catch (error) {
    console.error('❌ Failed to copy to clipboard:', error);
    console.log('📄 Test HTML:');
    console.log(html);
    return false;
  }
};

/**
 * Log structured data summary to console
 * @param {Array<Object>} structuredData - Array of structured data objects
 */
export const logStructuredDataSummary = (structuredData) => {
  console.log('📊 Structured Data Summary');
  console.log('═══════════════════════════');
  console.log(`Total schemas found: ${structuredData.length}`);
  
  structuredData.forEach((data, index) => {
    console.log(`\n${index + 1}. ${data['@type']}`);
    
    // Validate
    const validation = validateStructuredData(data, data['@type']);
    if (validation.isValid) {
      console.log('   ✅ Valid');
    } else {
      console.log('   ❌ Invalid');
      validation.errors.forEach(error => {
        console.log(`      - ${error}`);
      });
    }
    
    // Show key fields
    if (data['@type'] === 'JobPosting') {
      console.log(`   Title: ${data.title || 'N/A'}`);
      console.log(`   Company: ${data.hiringOrganization?.name || 'N/A'}`);
      console.log(`   Posted: ${data.datePosted || 'N/A'}`);
    } else if (data['@type'] === 'Course') {
      console.log(`   Name: ${data.name || 'N/A'}`);
      console.log(`   Provider: ${data.provider?.name || 'N/A'}`);
    } else if (data['@type'] === 'Organization') {
      console.log(`   Name: ${data.name || 'N/A'}`);
      console.log(`   URL: ${data.url || 'N/A'}`);
    }
  });
  
  console.log('\n═══════════════════════════');
  console.log('💡 To test in Google Rich Results Test:');
  console.log('   1. Run: extractStructuredData.copyTestHTMLToClipboard(data, "Page Title")');
  console.log('   2. Go to: https://search.google.com/test/rich-results');
  console.log('   3. Click "Code" tab and paste');
};

/**
 * Browser console helper - Extract and display all structured data
 * Usage: Run this in browser console on any page
 */
export const testStructuredData = () => {
  const allData = extractAllStructuredData();
  
  if (allData.length === 0) {
    console.log('❌ No structured data found on this page');
    return;
  }
  
  logStructuredDataSummary(allData);
  
  // Return data for further inspection
  return allData;
};

// Make functions available in browser console for development
if (typeof window !== 'undefined') {
  window.extractStructuredData = {
    extractAll: extractAllStructuredData,
    extractByType: extractStructuredDataByType,
    generateTestHTML,
    validate: validateStructuredData,
    copyToClipboard: copyTestHTMLToClipboard,
    test: testStructuredData
  };
  
  console.log('🔍 Structured Data Extractor loaded!');
  console.log('📝 Available commands:');
  console.log('   - window.extractStructuredData.test()');
  console.log('   - window.extractStructuredData.extractAll()');
  console.log('   - window.extractStructuredData.extractByType("JobPosting")');
}

export default {
  extractAllStructuredData,
  extractStructuredDataByType,
  generateTestHTML,
  validateStructuredData,
  validateJobPosting,
  validateCourse,
  validateOrganization,
  copyTestHTMLToClipboard,
  logStructuredDataSummary,
  testStructuredData
};
