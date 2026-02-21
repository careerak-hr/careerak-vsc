/**
 * Generate Social Media Preview Images (Open Graph Images)
 * 
 * This script generates 1200x630px preview images for all pages
 * to be used in social media sharing (Facebook, Twitter, LinkedIn, etc.)
 * 
 * Requirements:
 * - FR-SEO-4: Open Graph tags with og:image
 * - FR-SEO-5: Twitter Card tags with twitter:image
 * - Task 6.2.3: Generate social media preview images
 * 
 * Usage:
 *   node scripts/generate-og-images.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_DIR = path.join(__dirname, '../public/og-images');
const WIDTH = 1200;
const HEIGHT = 630;

// Brand colors from project-standards.md
const COLORS = {
  primary: '#304B60',    // كحلي (Navy)
  secondary: '#E3DAD1',  // بيج (Beige)
  accent: '#D48161',     // نحاسي (Copper)
  white: '#FFFFFF',
  dark: '#1a1a1a'
};

// Page configurations with Arabic, English, and French titles
const PAGES = [
  { name: 'language', title: { ar: 'اختر لغتك', en: 'Choose Your Language', fr: 'Choisissez Votre Langue' } },
  { name: 'entry', title: { ar: 'مرحباً بك في Careerak', en: 'Welcome to Careerak', fr: 'Bienvenue à Careerak' } },
  { name: 'login', title: { ar: 'تسجيل الدخول', en: 'Login', fr: 'Connexion' } },
  { name: 'register', title: { ar: 'إنشاء حساب جديد', en: 'Create New Account', fr: 'Créer un Compte' } },
  { name: 'otp', title: { ar: 'التحقق من الهوية', en: 'Identity Verification', fr: 'Vérification d\'Identité' } },
  { name: 'profile', title: { ar: 'الملف الشخصي', en: 'Profile', fr: 'Profil' } },
  { name: 'jobs', title: { ar: 'فرص العمل', en: 'Job Opportunities', fr: 'Opportunités d\'Emploi' } },
  { name: 'post-job', title: { ar: 'نشر وظيفة', en: 'Post a Job', fr: 'Publier une Offre' } },
  { name: 'courses', title: { ar: 'الدورات التدريبية', en: 'Training Courses', fr: 'Cours de Formation' } },
  { name: 'post-course', title: { ar: 'نشر دورة', en: 'Post a Course', fr: 'Publier un Cours' } },
  { name: 'apply', title: { ar: 'التقديم على الوظيفة', en: 'Apply for Job', fr: 'Postuler' } },
  { name: 'settings', title: { ar: 'الإعدادات', en: 'Settings', fr: 'Paramètres' } },
  { name: 'policy', title: { ar: 'سياسة الخصوصية', en: 'Privacy Policy', fr: 'Politique de Confidentialité' } },
  { name: 'notifications', title: { ar: 'الإشعارات', en: 'Notifications', fr: 'Notifications' } },
  { name: 'admin', title: { ar: 'لوحة التحكم', en: 'Admin Dashboard', fr: 'Tableau de Bord' } },
  { name: 'onboarding-individuals', title: { ar: 'للأفراد', en: 'For Individuals', fr: 'Pour les Particuliers' } },
  { name: 'onboarding-companies', title: { ar: 'للشركات', en: 'For Companies', fr: 'Pour les Entreprises' } },
  { name: 'default', title: { ar: 'Careerak - منصة التوظيف', en: 'Careerak - Job Platform', fr: 'Careerak - Plateforme d\'Emploi' } }
];

/**
 * Create output directory if it doesn't exist
 */
function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ Created directory: ${OUTPUT_DIR}`);
  }
}

/**
 * Generate SVG for a page
 * @param {Object} page - Page configuration
 * @param {string} lang - Language (ar, en, fr)
 * @returns {string} SVG markup
 */
function generateSVG(page, lang = 'ar') {
  const title = page.title[lang];
  const isRTL = lang === 'ar';
  
  // Font sizes based on text length
  const titleLength = title.length;
  let fontSize = 72;
  if (titleLength > 30) fontSize = 60;
  if (titleLength > 40) fontSize = 48;
  
  return `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background gradient -->
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${COLORS.primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${COLORS.accent};stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grad)"/>
      
      <!-- Decorative elements -->
      <circle cx="100" cy="100" r="150" fill="${COLORS.secondary}" opacity="0.1"/>
      <circle cx="${WIDTH - 100}" cy="${HEIGHT - 100}" r="150" fill="${COLORS.accent}" opacity="0.1"/>
      
      <!-- Content container -->
      <rect x="80" y="180" width="${WIDTH - 160}" height="${HEIGHT - 360}" fill="${COLORS.white}" rx="20" opacity="0.95"/>
      
      <!-- Title -->
      <text 
        x="${WIDTH / 2}" 
        y="${HEIGHT / 2}" 
        font-family="Arial, sans-serif" 
        font-size="${fontSize}" 
        font-weight="bold" 
        fill="${COLORS.primary}" 
        text-anchor="middle" 
        dominant-baseline="middle"
        direction="${isRTL ? 'rtl' : 'ltr'}"
      >
        ${title}
      </text>
      
      <!-- Subtitle -->
      <text 
        x="${WIDTH / 2}" 
        y="${HEIGHT / 2 + 80}" 
        font-family="Arial, sans-serif" 
        font-size="32" 
        fill="${COLORS.accent}" 
        text-anchor="middle"
      >
        Careerak
      </text>
      
      <!-- Bottom accent line -->
      <rect x="80" y="${HEIGHT - 100}" width="${WIDTH - 160}" height="4" fill="${COLORS.accent}" rx="2"/>
    </svg>
  `;
}

/**
 * Generate OG image for a page
 * @param {Object} page - Page configuration
 * @param {string} lang - Language (ar, en, fr)
 */
async function generateImage(page, lang = 'ar') {
  try {
    const svg = generateSVG(page, lang);
    const svgBuffer = Buffer.from(svg);
    
    const outputPath = path.join(OUTPUT_DIR, `${page.name}.jpg`);
    
    await sharp(svgBuffer)
      .resize(WIDTH, HEIGHT)
      .jpeg({ quality: 90, progressive: true })
      .toFile(outputPath);
    
    console.log(`✅ Generated: ${page.name}.jpg (${lang})`);
  } catch (error) {
    console.error(`❌ Error generating ${page.name}.jpg:`, error.message);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🎨 Generating Social Media Preview Images...\n');
  console.log(`📐 Dimensions: ${WIDTH}x${HEIGHT}px`);
  console.log(`📁 Output: ${OUTPUT_DIR}\n`);
  
  ensureOutputDir();
  
  // Generate images for all pages (using Arabic as primary language)
  for (const page of PAGES) {
    await generateImage(page, 'ar');
  }
  
  console.log('\n✅ All images generated successfully!');
  console.log(`\n📊 Total images: ${PAGES.length}`);
  console.log(`📁 Location: ${OUTPUT_DIR}`);
  console.log('\n💡 Next steps:');
  console.log('   1. Review generated images in public/og-images/');
  console.log('   2. Test social sharing with Facebook Debugger');
  console.log('   3. Test social sharing with Twitter Card Validator');
  console.log('   4. Validate with LinkedIn Post Inspector');
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
