#!/usr/bin/env node

/**
 * سكريبت تحميل الخطوط المحلية لتطبيق كاريرك
 * Font Download Script for Careerak App
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// مسارات الخطوط
const FONTS_DIR = path.join(__dirname, '../frontend/src/assets/fonts');

// روابط Google Fonts CSS
const FONT_CSS_URLS = {
  'amiri': 'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap',
  'cormorant-garamond': 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700&display=swap',
  'eb-garamond': 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700;1,800&display=swap'
};

// تعيين أسماء الملفات
const FILENAME_MAP = {
  'amiri': {
    'wght@400': 'Amiri-Regular',
    'wght@700': 'Amiri-Bold', 
    'ital,wght@1,400': 'Amiri-Italic',
    'ital,wght@1,700': 'Amiri-BoldItalic'
  },
  'cormorant-garamond': {
    'wght@300': 'CormorantGaramond-Light',
    'wght@400': 'CormorantGaramond-Regular',
    'wght@500': 'CormorantGaramond-Medium',
    'wght@600': 'CormorantGaramond-SemiBold',
    'wght@700': 'CormorantGaramond-Bold'
  },
  'eb-garamond': {
    'wght@400': 'EBGaramond-Regular',
    'wght@500': 'EBGaramond-Medium',
    'wght@600': 'EBGaramond-SemiBold',
    'wght@700': 'EBGaramond-Bold',
    'wght@800': 'EBGaramond-ExtraBold',
    'ital,wght@1,400': 'EBGaramond-Italic',
    'ital,wght@1,500': 'EBGaramond-MediumItalic',
    'ital,wght@1,600': 'EBGaramond-SemiBoldItalic',
    'ital,wght@1,700': 'EBGaramond-BoldItalic',
    'ital,wght@1,800': 'EBGaramond-ExtraBoldItalic'
  }
};

/**
 * الحصول على CSS من Google Fonts
 */
function getFontCSS(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };
    
    https.get(url, options, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * استخراج روابط الخطوط من CSS
 */
function extractFontUrls(css) {
  const urls = [];
  const regex = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g;
  let match;
  
  while ((match = regex.exec(css)) !== null) {
    urls.push(match[1]);
  }
  
  return urls;
}

/**
 * تحميل ملف من رابط
 */
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ تم تحميل: ${path.basename(filePath)}`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {}); // حذف الملف في حالة الخطأ
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * إنشاء المجلدات المطلوبة
 */
function createDirectories() {
  Object.keys(FONT_CSS_URLS).forEach(fontFamily => {
    const dir = path.join(FONTS_DIR, fontFamily);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 تم إنشاء مجلد: ${fontFamily}`);
    }
  });
}

/**
 * تحميل خط واحد
 */
async function downloadFont(fontFamily, cssUrl) {
  try {
    console.log(`📥 تحميل خط: ${fontFamily}`);
    
    const css = await getFontCSS(cssUrl);
    const fontUrls = extractFontUrls(css);
    
    console.log(`🔍 تم العثور على ${fontUrls.length} ملف خط`);
    
    let fileIndex = 0;
    for (const url of fontUrls) {
      const extension = url.includes('.woff2') ? '.woff2' : 
                       url.includes('.woff') ? '.woff' : '.ttf';
      
      // تحديد اسم الملف بناءً على الترتيب
      const fileNames = Object.values(FILENAME_MAP[fontFamily] || {});
      const fileName = fileNames[fileIndex] || `${fontFamily}-${fileIndex}`;
      
      const filePath = path.join(FONTS_DIR, fontFamily, `${fileName}${extension}`);
      
      try {
        await downloadFile(url, filePath);
        fileIndex++;
      } catch (error) {
        console.error(`❌ فشل تحميل ${fileName}${extension}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error(`❌ فشل في تحميل الخط ${fontFamily}: ${error.message}`);
  }
}

/**
 * تحميل جميع الخطوط
 */
async function downloadAllFonts() {
  console.log('🚀 بدء تحميل الخطوط...\n');
  
  createDirectories();
  
  for (const [fontFamily, cssUrl] of Object.entries(FONT_CSS_URLS)) {
    await downloadFont(fontFamily, cssUrl);
    console.log('');
  }
  
  console.log('🎉 تم الانتهاء من تحميل الخطوط!');
}

// تشغيل السكريبت
if (require.main === module) {
  downloadAllFonts().catch(console.error);
}

module.exports = { downloadAllFonts };