/**
 * Sitemap Generation Script
 * 
 * Generates sitemap.xml for SEO optimization
 * Includes all public routes with proper priority and update frequency
 * 
 * Requirements: FR-SEO-8
 * Task: 6.4.1
 */

const fs = require('fs');
const path = require('path');

// Base URL for the application
const BASE_URL = process.env.VITE_APP_URL || 'https://careerak.com';

// Route configuration with SEO metadata
const routes = [
  // Homepage - Highest priority
  {
    path: '/',
    priority: 1.0,
    changefreq: 'daily',
    public: true
  },
  
  // Entry and Language - High priority public pages
  {
    path: '/entry',
    priority: 0.9,
    changefreq: 'weekly',
    public: true
  },
  {
    path: '/language',
    priority: 0.8,
    changefreq: 'monthly',
    public: true
  },
  
  // Authentication pages - Medium-high priority
  {
    path: '/login',
    priority: 0.7,
    changefreq: 'monthly',
    public: true,
    description: 'User login page'
  },
  {
    path: '/auth',
    priority: 0.7,
    changefreq: 'monthly',
    public: true,
    description: 'User registration page'
  },
  {
    path: '/otp-verify',
    priority: 0.6,
    changefreq: 'monthly',
    public: true,
    description: 'OTP verification page'
  },
  {
    path: '/auth/callback',
    priority: 0.6,
    changefreq: 'monthly',
    public: true,
    description: 'OAuth authentication callback'
  },
  
  // Job-related pages - High priority for SEO
  {
    path: '/job-postings',
    priority: 0.8,
    changefreq: 'daily',
    public: true,
    description: 'Browse available job opportunities'
  },
  
  // Course pages - High priority
  {
    path: '/courses',
    priority: 0.7,
    changefreq: 'weekly',
    public: true,
    description: 'Explore training and educational courses'
  },
  
  // Policy page - Medium priority
  {
    path: '/policy',
    priority: 0.5,
    changefreq: 'monthly',
    public: true,
    description: 'Privacy policy and terms of service'
  },
  
  // Protected routes - Lower priority (require authentication)
  {
    path: '/profile',
    priority: 0.6,
    changefreq: 'weekly',
    public: false
  },
  {
    path: '/settings',
    priority: 0.5,
    changefreq: 'monthly',
    public: false
  },
  {
    path: '/notifications',
    priority: 0.5,
    changefreq: 'daily',
    public: false
  },
  
  // Interface pages - Medium priority
  {
    path: '/interface-individuals',
    priority: 0.6,
    changefreq: 'weekly',
    public: false
  },
  {
    path: '/interface-companies',
    priority: 0.6,
    changefreq: 'weekly',
    public: false
  },
  
  // HR-specific pages - Lower priority
  {
    path: '/post-job',
    priority: 0.5,
    changefreq: 'monthly',
    public: false
  },
  {
    path: '/post-course',
    priority: 0.5,
    changefreq: 'monthly',
    public: false
  }
];

/**
 * Generate XML sitemap content
 * @returns {string} XML sitemap content
 */
function generateSitemapXML() {
  const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Filter to include only public routes or all routes based on configuration
  const includeProtectedRoutes = process.env.SITEMAP_INCLUDE_PROTECTED === 'true';
  const routesToInclude = includeProtectedRoutes 
    ? routes 
    : routes.filter(route => route.public);
  
  routesToInclude.forEach(route => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${route.path}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  
  return xml;
}

/**
 * Write sitemap to file
 * @param {string} content - XML content
 * @param {string} outputPath - Output file path
 */
function writeSitemap(content, outputPath) {
  try {
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log('✅ Sitemap generated successfully!');
    console.log(`📄 Location: ${outputPath}`);
    console.log(`📊 Total URLs: ${routes.filter(r => r.public || process.env.SITEMAP_INCLUDE_PROTECTED === 'true').length}`);
    console.log(`🌐 Base URL: ${BASE_URL}`);
  } catch (error) {
    console.error('❌ Error writing sitemap:', error.message);
    process.exit(1);
  }
}

/**
 * Generate sitemap statistics
 */
function generateStats() {
  const publicRoutes = routes.filter(r => r.public).length;
  const protectedRoutes = routes.filter(r => !r.public).length;
  const totalRoutes = routes.length;
  
  console.log('\n📊 Sitemap Statistics:');
  console.log(`   Total routes: ${totalRoutes}`);
  console.log(`   Public routes: ${publicRoutes}`);
  console.log(`   Protected routes: ${protectedRoutes}`);
  console.log(`   Included in sitemap: ${process.env.SITEMAP_INCLUDE_PROTECTED === 'true' ? totalRoutes : publicRoutes}`);
  
  // Priority distribution
  const priorities = {
    high: routes.filter(r => r.priority >= 0.8).length,
    medium: routes.filter(r => r.priority >= 0.5 && r.priority < 0.8).length,
    low: routes.filter(r => r.priority < 0.5).length
  };
  
  console.log('\n🎯 Priority Distribution:');
  console.log(`   High (≥0.8): ${priorities.high} routes`);
  console.log(`   Medium (0.5-0.7): ${priorities.medium} routes`);
  console.log(`   Low (<0.5): ${priorities.low} routes`);
  
  // Update frequency distribution
  const frequencies = {
    daily: routes.filter(r => r.changefreq === 'daily').length,
    weekly: routes.filter(r => r.changefreq === 'weekly').length,
    monthly: routes.filter(r => r.changefreq === 'monthly').length
  };
  
  console.log('\n⏱️  Update Frequency:');
  console.log(`   Daily: ${frequencies.daily} routes`);
  console.log(`   Weekly: ${frequencies.weekly} routes`);
  console.log(`   Monthly: ${frequencies.monthly} routes`);
}

/**
 * Validate sitemap XML
 * @param {string} xml - XML content to validate
 * @returns {boolean} True if valid
 */
function validateSitemap(xml) {
  // Basic validation checks
  const checks = [
    { test: xml.includes('<?xml version="1.0"'), message: 'XML declaration' },
    { test: xml.includes('<urlset'), message: 'URLset element' },
    { test: xml.includes('</urlset>'), message: 'Closing URLset' },
    { test: xml.includes('<loc>'), message: 'Location elements' },
    { test: xml.includes('<priority>'), message: 'Priority elements' },
    { test: xml.includes('<changefreq>'), message: 'Change frequency elements' }
  ];
  
  console.log('\n🔍 Validating sitemap...');
  let isValid = true;
  
  checks.forEach(check => {
    if (check.test) {
      console.log(`   ✅ ${check.message}`);
    } else {
      console.log(`   ❌ ${check.message}`);
      isValid = false;
    }
  });
  
  return isValid;
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting sitemap generation...\n');
  
  // Generate sitemap XML
  const sitemapXML = generateSitemapXML();
  
  // Validate sitemap
  if (!validateSitemap(sitemapXML)) {
    console.error('\n❌ Sitemap validation failed!');
    process.exit(1);
  }
  
  // Determine output path
  const outputDir = path.join(__dirname, '..', 'public');
  const outputPath = path.join(outputDir, 'sitemap.xml');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write sitemap
  writeSitemap(sitemapXML, outputPath);
  
  // Generate statistics
  generateStats();
  
  console.log('\n✨ Sitemap generation complete!\n');
  console.log('📝 Next steps:');
  console.log('   1. Submit sitemap to Google Search Console');
  console.log('   2. Add sitemap URL to robots.txt');
  console.log('   3. Verify sitemap at: https://www.xml-sitemaps.com/validate-xml-sitemap.html');
  console.log(`   4. Sitemap URL: ${BASE_URL}/sitemap.xml\n`);
}

// Run the script
if (require.main === module) {
  main();
}

// Export for testing
module.exports = {
  generateSitemapXML,
  routes,
  BASE_URL
};
