const mongoose = require('mongoose');
const { performance } = require('perf_hooks');
const searchService = require('../src/services/searchService');
const JobPosting = require('../src/models/JobPosting');
require('dotenv').config();

/**
 * سكريبت قياس أداء نظام البحث
 * يقيس الوقت المستغرق لعمليات البحث المختلفة
 * الهدف: < 500ms لجميع العمليات
 */

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function measurePerformance() {
  try {
    console.log(`${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}║         Search Performance Measurement Tool               ║${colors.reset}`);
    console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);

    // الاتصال بقاعدة البيانات
    console.log(`${colors.blue}📡 Connecting to MongoDB...${colors.reset}`);
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`${colors.green}✓ Connected successfully${colors.reset}\n`);

    // التحقق من وجود بيانات
    const jobCount = await JobPosting.countDocuments({ status: 'Open' });
    console.log(`${colors.blue}📊 Found ${jobCount} open job postings${colors.reset}\n`);

    if (jobCount === 0) {
      console.log(`${colors.yellow}⚠️  No job postings found. Creating sample data...${colors.reset}`);
      await createSampleData();
    }

    console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}Performance Tests${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

    const tests = [
      {
        name: 'Simple Text Search',
        fn: () => searchService.textSearch('developer', { page: 1, limit: 10 })
      },
      {
        name: 'Arabic Text Search',
        fn: () => searchService.textSearch('مطور', { page: 1, limit: 10 })
      },
      {
        name: 'Multi-field Search',
        fn: () => searchService.searchInFields('JavaScript', ['title', 'description', 'skills'], { page: 1, limit: 10 })
      },
      {
        name: 'Search with Location Filter',
        fn: () => searchService.searchWithFilters('developer', { location: 'Cairo' }, { page: 1, limit: 10 })
      },
      {
        name: 'Search with Salary Filter',
        fn: () => searchService.searchWithFilters('developer', { salaryMin: 3000, salaryMax: 8000 }, { page: 1, limit: 10 })
      },
      {
        name: 'Search with Skills (AND)',
        fn: () => searchService.searchWithFilters('', { skills: ['JavaScript', 'React'], skillsLogic: 'AND' }, { page: 1, limit: 10 })
      },
      {
        name: 'Search with Skills (OR)',
        fn: () => searchService.searchWithFilters('', { skills: ['JavaScript', 'Python', 'Java'], skillsLogic: 'OR' }, { page: 1, limit: 10 })
      },
      {
        name: 'Search with Date Filter',
        fn: () => searchService.searchWithFilters('developer', { datePosted: 'week' }, { page: 1, limit: 10 })
      },
      {
        name: 'Complex Multi-filter Search',
        fn: () => searchService.searchWithFilters('developer', {
          location: 'Cairo',
          jobType: ['Full-time'],
          experienceLevel: ['Mid', 'Senior'],
          salaryMin: 3000,
          salaryMax: 10000,
          skills: ['JavaScript'],
          datePosted: 'month'
        }, { page: 1, limit: 10 })
      },
      {
        name: 'Large Result Set (50 items)',
        fn: () => searchService.textSearch('developer', { page: 1, limit: 50 })
      },
      {
        name: 'Deep Pagination (page 5)',
        fn: () => searchService.textSearch('developer', { page: 5, limit: 10 })
      },
      {
        name: 'Sorted by Salary',
        fn: () => searchService.textSearch('developer', { page: 1, limit: 10, sort: 'salary' })
      }
    ];

    const results = [];
    let passedCount = 0;
    let failedCount = 0;

    for (const test of tests) {
      const startTime = performance.now();
      
      try {
        const result = await test.fn();
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        const passed = duration < 500;
        const status = passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
        const durationColor = passed ? colors.green : colors.red;
        
        console.log(`${status} ${test.name.padEnd(35)} ${durationColor}${duration.toFixed(2)}ms${colors.reset}`);
        
        results.push({
          name: test.name,
          duration,
          passed,
          resultCount: result.data?.results?.length || 0
        });

        if (passed) passedCount++;
        else failedCount++;

      } catch (error) {
        console.log(`${colors.red}✗ ERROR${colors.reset} ${test.name.padEnd(35)} ${error.message}`);
        failedCount++;
      }
    }

    // ملخص الأداء
    console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}Performance Summary${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

    const durations = results.map(r => r.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);

    console.log(`Total Tests:     ${tests.length}`);
    console.log(`${colors.green}Passed:          ${passedCount}${colors.reset}`);
    console.log(`${colors.red}Failed:          ${failedCount}${colors.reset}`);
    console.log(`\nAverage Time:    ${avgDuration.toFixed(2)}ms`);
    console.log(`Min Time:        ${minDuration.toFixed(2)}ms`);
    console.log(`Max Time:        ${maxDuration.toFixed(2)}ms`);
    console.log(`Target:          < 500ms`);
    
    const overallStatus = failedCount === 0 ? 
      `${colors.green}✅ ALL TESTS PASSED${colors.reset}` : 
      `${colors.red}❌ SOME TESTS FAILED${colors.reset}`;
    
    console.log(`\nOverall Status:  ${overallStatus}\n`);

    // توصيات
    if (avgDuration > 300) {
      console.log(`${colors.yellow}⚠️  Recommendations:${colors.reset}`);
      console.log(`   - Consider adding more indexes`);
      console.log(`   - Implement caching for frequent queries`);
      console.log(`   - Review database query optimization\n`);
    }

    // أبطأ الاستعلامات
    if (results.length > 0) {
      console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
      console.log(`${colors.cyan}Slowest Queries${colors.reset}`);
      console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

      const slowest = [...results].sort((a, b) => b.duration - a.duration).slice(0, 5);
      slowest.forEach((result, index) => {
        const color = result.duration > 500 ? colors.red : result.duration > 300 ? colors.yellow : colors.green;
        console.log(`${index + 1}. ${result.name.padEnd(35)} ${color}${result.duration.toFixed(2)}ms${colors.reset}`);
      });
      console.log('');
    }

    await mongoose.connection.close();
    console.log(`${colors.blue}📡 Database connection closed${colors.reset}\n`);

    process.exit(failedCount === 0 ? 0 : 1);

  } catch (error) {
    console.error(`${colors.red}❌ Error:${colors.reset}`, error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

async function createSampleData() {
  const sampleJobs = [];
  
  for (let i = 0; i < 50; i++) {
    sampleJobs.push({
      title: `Software Developer ${i}`,
      description: `Looking for a talented developer with experience in JavaScript, React, Node.js`,
      requirements: `Bachelor's degree in Computer Science or related field`,
      postingType: 'Permanent Job',
      priceType: 'Salary Based',
      salary: { min: 3000 + (i * 100), max: 5000 + (i * 100) },
      location: i % 2 === 0 ? 'Cairo' : 'Alexandria',
      jobType: ['Full-time', 'Part-time', 'Contract'][i % 3],
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      company: {
        name: `Tech Company ${i}`,
        size: ['Small', 'Medium', 'Large'][i % 3]
      },
      experienceLevel: ['Entry', 'Mid', 'Senior', 'Expert'][i % 4],
      postedBy: new mongoose.Types.ObjectId(),
      status: 'Open',
      createdAt: new Date(Date.now() - (i * 86400000))
    });
  }

  await JobPosting.insertMany(sampleJobs);
  console.log(`${colors.green}✓ Created 50 sample job postings${colors.reset}\n`);
}

// تشغيل القياس
measurePerformance();
