/**
 * Test script for Course Recommendation Service
 */

// Mock user data
const mockUser = {
  _id: 'user123',
  name: 'John Doe',
  email: 'john@example.com',
  city: 'Cairo',
  country: 'Egypt',
  computerSkills: [
    { skill: 'JavaScript', proficiency: 'intermediate' },
    { skill: 'HTML', proficiency: 'intermediate' },
    { skill: 'CSS', proficiency: 'intermediate' }
  ],
  softwareSkills: [
    { software: 'VS Code', proficiency: 'advanced' },
    { software: 'Git', proficiency: 'intermediate' }
  ],
  otherSkills: ['Teamwork', 'Communication'],
  experienceList: [
    {
      position: 'Frontend Developer',
      company: 'Tech Corp',
      from: '2020-01-01',
      to: '2022-12-31',
      description: 'Developed web applications'
    }
  ],
  educationList: [
    {
      degree: 'Bachelor',
      field: 'Computer Science',
      institution: 'Cairo University'
    }
  ]
};

// Mock job data
const mockJobs = [
  {
    _id: 'job1',
    title: 'Frontend Developer',
    description: 'We are looking for a skilled Frontend Developer...',
    requirements: 'Experience with React, JavaScript, HTML, CSS',
    postedBy: { companyName: 'Tech Company Inc.' },
    location: 'Cairo, Egypt'
  },
  {
    _id: 'job2',
    title: 'Full Stack Developer',
    description: 'Looking for a Full Stack Developer with Node.js experience',
    requirements: 'Node.js, React, MongoDB, Express',
    postedBy: { companyName: 'Startup XYZ' },
    location: 'Remote'
  }
];

// Mock the CourseRecommendationService
const CourseRecommendationService = require('./backend/src/services/courseRecommendationService');

async function testCourseRecommendation() {
  console.log('🚀 Testing Course Recommendation Service...\n');
  
  try {
    // Create service instance
    const service = new CourseRecommendationService();
    
    console.log('1. Testing with mock user and jobs...');
    
    // Test 1: Basic recommendation
    console.log('\nTest 1: Basic Course Recommendations');
    console.log('='.repeat(50));
    
    const result = await service.recommendCoursesBasedOnTargetJobs(mockUser, mockJobs);
    
    console.log('✅ Recommendation test completed!');
    console.log(`Success: ${result.success}`);
    console.log(`User: ${result.user.name}`);
    console.log(`Target Jobs: ${result.targetJobs.length} jobs analyzed`);
    console.log(`Recommended Courses: ${result.courseRecommendations.length} courses found`);
    console.log(`Learning Paths: ${result.learningPaths.length} paths generated`);
    
    // Display some recommendations
    console.log('\nTop Course Recommendations:');
    result.courseRecommendations.slice(0, 3).forEach((course, index) => {
      console.log(`\n${index + 1}. ${course.title}`);
      console.log(`   Level: ${course.level}`);
      console.log(`   Match Score: ${course.matchScore}%`);
      console.log(`   Skills: ${course.skills?.join(', ') || 'N/A'}`);
    });
    
    // Test 2: Learning Paths
    console.log('\n' + '='.repeat(50));
    console.log('Test 2: Learning Paths');
    console.log('='.repeat(50));
    
    if (result.learningPaths && result.learningPaths.length > 0) {
      console.log(`Generated ${result.learningPaths.length} learning paths:`);
      result.learningPaths.forEach((path, idx) => {
        console.log(`\nPath ${idx + 1}: ${path.name}`);
        console.log(`  Duration: ${path.duration}`);
        console.log(`  Courses: ${path.courses.length}`);
      });
    }
    
    // Test 3: Employment Improvement Prediction
    console.log('\n' + '='.repeat(50));
    console.log('Test 3: Employment Improvement Prediction');
    console.log('='.repeat(50));
    
    if (result.employmentImprovement) {
      console.log(`Overall Improvement: ${result.employmentImprovement.formatted}`);
      console.log(`Average Course Improvement: ${result.employmentImprovement.average}%`);
    }
    
    // Test 4: Skill Gap Analysis
    console.log('\n' + '='.repeat(50));
    console.log('Test 4: Skill Gap Analysis');
    console.log('='.repeat(50));
    
    if (result.skillGapAnalysis) {
      console.log(`Missing Skills: ${result.skillGapAnalysis.totalMissingSkills} skills needed`);
      console.log(`Top Missing Skills: ${result.skillGapAnalysis.topMissingSkills?.join(', ')}`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests completed successfully!');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    console.error(error.stack);
  }
}

// Run the test
if (require.main === module) {
  testCourseRecommendation().catch(console.error);
}

module.exports = { testCourseRecommendation };