const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_IMAGE = path.join(__dirname, '../public/logo.png');
const OUTPUT_DIR = path.join(__dirname, '../public');

// Icon configurations
const icons = [
  // Standard icons
  { size: 192, name: 'icon-192x192.png', purpose: 'any' },
  { size: 512, name: 'icon-512x512.png', purpose: 'any' },
  
  // Maskable icons (with safe zone padding)
  { size: 192, name: 'icon-192x192-maskable.png', purpose: 'maskable', padding: 0.1 },
  { size: 512, name: 'icon-512x512-maskable.png', purpose: 'maskable', padding: 0.1 },
];

async function generateIcons() {
  console.log('🎨 Starting icon generation...\n');

  // Check if input image exists
  if (!fs.existsSync(INPUT_IMAGE)) {
    console.error(`❌ Error: Input image not found at ${INPUT_IMAGE}`);
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  try {
    for (const icon of icons) {
      const outputPath = path.join(OUTPUT_DIR, icon.name);
      
      console.log(`📦 Generating ${icon.name} (${icon.size}x${icon.size})...`);

      if (icon.purpose === 'maskable') {
        // For maskable icons, add padding (safe zone)
        // Maskable icons need 10% padding on all sides
        const paddingSize = Math.floor(icon.size * icon.padding);
        const contentSize = icon.size - (paddingSize * 2);

        await sharp(INPUT_IMAGE)
          .resize(contentSize, contentSize, {
            fit: 'contain',
            background: { r: 227, g: 218, b: 209, alpha: 1 } // #E3DAD1 (Secondary color)
          })
          .extend({
            top: paddingSize,
            bottom: paddingSize,
            left: paddingSize,
            right: paddingSize,
            background: { r: 227, g: 218, b: 209, alpha: 1 }
          })
          .png({ quality: 100 })
          .toFile(outputPath);
      } else {
        // Standard icons
        await sharp(INPUT_IMAGE)
          .resize(icon.size, icon.size, {
            fit: 'contain',
            background: { r: 227, g: 218, b: 209, alpha: 1 } // #E3DAD1 (Secondary color)
          })
          .png({ quality: 100 })
          .toFile(outputPath);
      }

      console.log(`✅ Generated ${icon.name}`);
    }

    console.log('\n🎉 All icons generated successfully!');
    console.log('\n📋 Generated files:');
    icons.forEach(icon => {
      const filePath = path.join(OUTPUT_DIR, icon.name);
      const stats = fs.statSync(filePath);
      console.log(`   - ${icon.name} (${(stats.size / 1024).toFixed(2)} KB)`);
    });

    console.log('\n✨ Next steps:');
    console.log('   1. Update manifest.json to reference the new icon files');
    console.log('   2. Test PWA installation on mobile devices');
    console.log('   3. Verify icons appear correctly in different contexts');

  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

// Run the script
generateIcons();
