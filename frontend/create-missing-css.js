const fs = require('fs');
const path = require('path');

// قائمة ملفات CSS المفقودة المحتملة
const missingCssFiles = [
  'src/components/Portfolio/Portfolio.css',
  'src/components/Portfolio/PortfolioGallery.css',
  'src/components/Portfolio/PortfolioItem.css',
  'src/components/Courses/CourseCard.css',
  'src/components/Courses/CourseHero.css',
  'src/components/Courses/CourseOverview.css',
  'src/components/Courses/InstructorInfo.css',
  'src/components/Courses/CourseReviews.css',
  'src/components/Skills/SkillsSection.css',
  'src/components/Skills/SkillCard.css',
  'src/components/Experience/ExperienceSection.css',
  'src/components/Experience/ExperienceCard.css',
  'src/components/Education/EducationSection.css',
  'src/components/Education/EducationCard.css',
];

const defaultCssContent = `/* Auto-generated placeholder CSS */

.component {
  /* Add your styles here */
}
`;

missingCssFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);
  
  // إنشاء المجلد إذا لم يكن موجوداً
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Created directory: ${dir}`);
  }
  
  // إنشاء الملف إذا لم يكن موجوداً
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, defaultCssContent);
    console.log(`✓ Created file: ${filePath}`);
  } else {
    console.log(`- File already exists: ${filePath}`);
  }
});

console.log('\n✅ Done!');
