/**
 * Verify Social Media Preview Images
 * 
 * This script verifies that:
 * 1. All OG images exist in public/og-images/
 * 2. All images are properly sized (1200x630px)
 * 3. All images are referenced in seoMetadata.js
 * 4. File sizes are reasonable (<500KB)
 * 
 * Usage:
 *   node scripts/verify-og-images.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OG_IMAGES_DIR = path.join(__dirname, '../public/og-images');
const SEO_METADATA_FILE = path.join(__dirname, '../src/config/seoMetadata.js');

const EXPECTED_WIDTH = 1200;
const EXPECTED_HEIGHT = 630;
const MAX_FILE_SIZE = 500 * 1024; // 500KB

// Expected images
const EXPECTED_IMAGES = [
  'language.jpg',
  'entry.jpg',
  'login.jpg',
  'register.jpg',
  'otp.jpg',
  'profile.jpg',
  'jobs.jpg',
  'post-job.jpg',
  'courses.jpg',
  'post-course.jpg',
  'apply.jpg',
  'settings.jpg',
  'policy.jpg',
  'notifications.jpg',
  'admin.jpg',
  'onboarding-individuals.jpg',
  'onboarding-companies.jpg',
  'default.jpg'
];

let errors = 0;
let warnings = 0;

/**
 * Check if all expected images exist
 */
function checkImageExistence() {
  console.log('📁 Checking image existence...\n');
  
  for (const imageName of EXPECTED_IMAGES) {
    const imagePath = path.join(OG_IMAGES_DIR, imageName);
    
    if (fs.existsSync(imagePath)) {
      console.log(`✅ ${imageName} exists`);
    } else {
      console.log(`❌ ${imageName} is missing!`);
      errors++;
    }
  }
  
  console.log('');
}

/**
 * Check image dimensions and file sizes
 */
async function checkImageProperties() {
  console.log('📐 Checking image properties...\n');
  
  for (const imageName of EXPECTED_IMAGES) {
    const imagePath = path.join(OG_IMAGES_DIR, imageName);
    
    if (!fs.existsSync(imagePath)) {
      continue; // Skip if file doesn't exist (already reported)
    }
    
    try {
      // Check dimensions
      const metadata = await sharp(imagePath).metadata();
      const { width, height, size } = metadata;
      
      // Check dimensions
      if (width === EXPECTED_WIDTH && height === EXPECTED_HEIGHT) {
        console.log(`✅ ${imageName}: ${width}x${height}px`);
      } else {
        console.log(`⚠️  ${imageName}: ${width}x${height}px (expected ${EXPECTED_WIDTH}x${EXPECTED_HEIGHT}px)`);
        warnings++;
      }
      
      // Check file size
      const stats = fs.statSync(imagePath);
      const fileSizeKB = Math.round(stats.size / 1024);
      
      if (stats.size <= MAX_FILE_SIZE) {
        console.log(`   Size: ${fileSizeKB}KB ✅`);
      } else {
        console.log(`   Size: ${fileSizeKB}KB ⚠️  (exceeds ${Math.round(MAX_FILE_SIZE / 1024)}KB)`);
        warnings++;
      }
      
    } catch (error) {
      console.log(`❌ ${imageName}: Error reading image - ${error.message}`);
      errors++;
    }
  }
  
  console.log('');
}

/**
 * Check if images are referenced in seoMetadata.js
 */
function checkSEOMetadataReferences() {
  console.log('🔗 Checking SEO metadata references...\n');
  
  if (!fs.existsSync(SEO_METADATA_FILE)) {
    console.log(`❌ seoMetadata.js not found at ${SEO_METADATA_FILE}`);
    errors++;
    return;
  }
  
  const seoMetadataContent = fs.readFileSync(SEO_METADATA_FILE, 'utf-8');
  
  for (const imageName of EXPECTED_IMAGES) {
    const imageRef = `/og-images/${imageName}`;
    
    if (seoMetadataContent.includes(imageRef)) {
      console.log(`✅ ${imageName} is referenced in seoMetadata.js`);
    } else {
      console.log(`⚠️  ${imageName} is NOT referenced in seoMetadata.js`);
      warnings++;
    }
  }
  
  console.log('');
}

/**
 * Calculate total size
 */
function calculateTotalSize() {
  console.log('📊 Calculating total size...\n');
  
  let totalSize = 0;
  let imageCount = 0;
  
  for (const imageName of EXPECTED_IMAGES) {
    const imagePath = path.join(OG_IMAGES_DIR, imageName);
    
    if (fs.existsSync(imagePath)) {
      const stats = fs.statSync(imagePath);
      totalSize += stats.size;
      imageCount++;
    }
  }
  
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  const avgSizeKB = Math.round(totalSize / imageCount / 1024);
  
  console.log(`Total images: ${imageCount}/${EXPECTED_IMAGES.length}`);
  console.log(`Total size: ${totalSizeMB}MB`);
  console.log(`Average size: ${avgSizeKB}KB per image`);
  
  if (totalSize < 2 * 1024 * 1024) {
    console.log('✅ Total size is acceptable (<2MB)');
  } else {
    console.log('⚠️  Total size exceeds 2MB');
    warnings++;
  }
  
  console.log('');
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Verifying Social Media Preview Images...\n');
  console.log('='.repeat(60));
  console.log('');
  
  // Run checks
  checkImageExistence();
  await checkImageProperties();
  checkSEOMetadataReferences();
  calculateTotalSize();
  
  // Summary
  console.log('='.repeat(60));
  console.log('\n📋 Summary:\n');
  
  if (errors === 0 && warnings === 0) {
    console.log('✅ All checks passed! Images are ready for production.');
  } else {
    if (errors > 0) {
      console.log(`❌ ${errors} error(s) found`);
    }
    if (warnings > 0) {
      console.log(`⚠️  ${warnings} warning(s) found`);
    }
  }
  
  console.log('');
  
  // Exit with appropriate code
  process.exit(errors > 0 ? 1 : 0);
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
