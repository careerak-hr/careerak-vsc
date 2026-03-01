const cvParserService = require('../src/services/cvParserService');

const sampleCV = `
John Doe
Software Engineer
john.doe@example.com | +1-555-123-4567

PROFESSIONAL EXPERIENCE

Senior Software Engineer | Tech Corp Inc. | 2020 - Present
- Led development of microservices architecture
- Managed team of 5 developers

Software Developer | Startup LLC | 2018 - 2020
- Developed REST APIs using Python
- Built responsive web applications

Junior Developer | Web Agency | 2016 - 2018
- Created websites using HTML, CSS
`;

async function debug() {
  const buffer = Buffer.from(sampleCV, 'utf-8');
  const result = await cvParserService.parseCV(buffer, 'text/plain');
  
  console.log('=== DEBUG EXPERIENCE EXTRACTION ===\n');
  console.log('Success:', result.success);
  console.log('\nExtracted Experiences:', result.data.experience.length);
  console.log(JSON.stringify(result.data.experience, null, 2));
  
  console.log('\n=== RAW TEXT ===');
  console.log(result.data.rawText);
}

debug();
