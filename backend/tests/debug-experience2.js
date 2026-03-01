const cvParserService = require('../src/services/cvParserService');

const sampleCV1 = `
John Doe
Software Engineer
john.doe@example.com | +1-555-123-4567
linkedin.com/in/johndoe | github.com/johndoe

PROFESSIONAL SUMMARY
Experienced Full-Stack Developer with 5+ years of experience in web development

TECHNICAL SKILLS
Programming Languages: JavaScript, Python, Java, TypeScript
Frontend: React, Vue.js, Angular, HTML, CSS
Backend: Node.js, Express, Django, Flask
Databases: MongoDB, PostgreSQL, MySQL, Redis
Cloud: AWS, Azure, Docker, Kubernetes
Tools: Git, Jenkins, Webpack

PROFESSIONAL EXPERIENCE

Senior Software Engineer | Tech Corp Inc. | 2020 - Present
- Led development of microservices architecture using Node.js and Docker
- Managed team of 5 developers
- Improved application performance by 40%

Software Developer | Startup LLC | 2018 - 2020
- Developed REST APIs using Python and Flask
- Built responsive web applications with React
- Implemented CI/CD pipelines

Junior Developer | Web Agency | 2016 - 2018
- Created websites using HTML, CSS, and JavaScript
- Worked with MySQL databases

EDUCATION

Master of Computer Science | MIT | 2016
Specialized in Artificial Intelligence

Bachelor of Software Engineering | Stanford University | 2014
GPA: 3.8/4.0
`;

async function debug() {
  const buffer = Buffer.from(sampleCV1, 'utf-8');
  const result = await cvParserService.parseCV(buffer, 'text/plain');
  
  console.log('=== DEBUG EXPERIENCE EXTRACTION ===\n');
  console.log('Success:', result.success);
  console.log('\nExtracted Experiences:', result.data.experience.length);
  console.log(JSON.stringify(result.data.experience, null, 2));
  
  // Test the extraction directly
  console.log('\n=== DIRECT TEST ===');
  const experiences = cvParserService.extractExperience(result.data.rawText);
  console.log('Direct extraction:', experiences.length);
  console.log(JSON.stringify(experiences, null, 2));
}

debug();
