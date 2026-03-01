const cvParserService = require('../src/services/cvParserService');

const text = `
PROFESSIONAL EXPERIENCE

Senior Software Engineer | Tech Corp Inc. | 2020 - Present
- Led development
`;

console.log('=== TESTING SECTION DETECTION ===\n');

const lines = text.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  const lineLower = line.toLowerCase();
  
  console.log(`Line ${i}: "${line}"`);
  console.log(`  Lower: "${lineLower}"`);
  
  const hasExperience = cvParserService.sectionKeywords.experience.some(keyword => {
    const match = lineLower.includes(keyword);
    if (match) console.log(`  ✓ Matched keyword: "${keyword}"`);
    return match;
  });
  
  console.log(`  Has experience keyword: ${hasExperience}\n`);
}

console.log('\n=== FULL EXTRACTION TEST ===');
const experiences = cvParserService.extractExperience(text);
console.log('Extracted:', experiences.length);
console.log(JSON.stringify(experiences, null, 2));
