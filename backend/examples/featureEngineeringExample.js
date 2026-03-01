/**
 * 🔧 Feature Engineering Service - أمثلة الاستخدام
 * 
 * هذا الملف يوضح كيفية استخدام خدمة Feature Engineering
 * لاستخراج features من البيانات وإنشاء user-item matrix
 * 
 * المتطلبات: Requirements 1.1, 1.2
 * المهمة: Task 2.2
 */

const featureEngineeringService = require('../src/services/featureEngineeringService');
const dataCollectionService = require('../src/services/dataCollectionService');

// ==================== مثال 1: استخراج User Features ====================

async function example1_extractUserFeatures() {
  console.log('\n📊 مثال 1: استخراج User Features\n');
  console.log('=' .repeat(60));

  // بيانات مستخدم نموذجية
  const user = {
    userId: 'user123',
    firstName: 'أحمد',
    lastName: 'محمد',
    email: 'ahmed@example.com',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    specialization: 'Software Engineering',
    bio: 'Experienced software engineer with passion for AI and machine learning',
    interests: ['Machine Learning', 'Web Development', 'Cloud Computing'],
    skills: ['JavaScript', 'Python', 'React', 'NodeJS', 'TensorFlow', 'AWS'],
    experiences: [
      {
        company: 'Tech Corp',
        position: 'Senior Developer',
        duration: 36,
        workType: 'fullTime',
        jobLevel: 'senior'
      },
      {
        company: 'Startup Inc',
        position: 'Developer',
        duration: 24,
        workType: 'fullTime',
        jobLevel: 'mid'
      }
    ],
    education: [
      {
        level: 'Bachelor',
        degree: 'Computer Science',
        institution: 'King Saud University',
        year: 2015
      },
      {
        level: 'Master',
        degree: 'Artificial Intelligence',
        institution: 'KAUST',
        year: 2018
      }
    ],
    languages: [
      { language: 'Arabic', proficiency: 'native' },
      { language: 'English', proficiency: 'advanced' }
    ],
    completeness: 90
  };

  // استخراج Features
  const features = featureEngineeringService.extractUserFeatures(user);

  console.log('✅ User Features:');
  console.log('\n1. Skills Vector:');
  console.log(JSON.stringify(features.features.skills, null, 2));

  console.log('\n2. Experience Features:');
  console.log(`   - Total Experience: ${features.features.experience.totalYears} years`);
  console.log(`   - Experience Count: ${features.features.experience.experienceCount}`);
  console.log(`   - Levels:`, features.features.experience.levels);
  console.log(`   - Work Types:`, features.features.experience.workTypes);

  console.log('\n3. Education Features:');
  console.log(`   - Highest Level: ${features.features.education.highestLevelName} (${features.features.education.highestLevel})`);
  console.log(`   - Education Count: ${features.features.education.educationCount}`);

  console.log('\n4. Location Features:');
  console.log(`   - Country: ${features.features.location.country}`);
  console.log(`   - City: ${features.features.location.city}`);

  console.log('\n5. Languages:');
  console.log(JSON.stringify(features.features.languages.languages, null, 2));

  console.log('\n6. Profile Completeness:', features.features.completeness + '%');

  console.log('\n7. Text Embedding (first 5 terms):');
  const embeddingTerms = Object.keys(features.features.textEmbedding).slice(0, 5);
  embeddingTerms.forEach(term => {
    console.log(`   - ${term}: ${features.features.textEmbedding[term].toFixed(3)}`);
  });

  console.log('\n📈 Metadata:');
  console.log(`   - Total Skills: ${features.metadata.totalSkills}`);
  console.log(`   - Total Experience: ${features.metadata.totalExperience} months`);
  console.log(`   - Education Level: ${features.metadata.educationLevel}`);

  return features;
}

// ==================== مثال 2: استخراج Job Features ====================

async function example2_extractJobFeatures() {
  console.log('\n📊 مثال 2: استخراج Job Features\n');
  console.log('=' .repeat(60));

  const job = {
    jobId: 'job123',
    title: 'Senior Full Stack Developer',
    description: 'We are looking for an experienced full stack developer with strong skills in React, NodeJS, and cloud technologies. The ideal candidate should have experience with microservices architecture and CI/CD pipelines.',
    requirements: 'Bachelor degree in Computer Science or related field. 5+ years of experience in web development. Strong knowledge of JavaScript, React, NodeJS, MongoDB, and AWS.',
    postingType: 'job',
    priceType: 'monthly',
    salary: 12000,
    location: {
      country: 'UAE',
      city: 'Dubai'
    },
    jobType: 'Full-Time',
    status: 'Open',
    company: {
      id: 'company123',
      name: 'Tech Solutions',
      industry: 'Technology'
    },
    requiredSkills: ['React', 'NodeJS', 'MongoDB', 'AWS', 'Docker', 'Kubernetes']
  };

  const features = featureEngineeringService.extractJobFeatures(job);

  console.log('✅ Job Features:');
  console.log('\n1. Required Skills:');
  console.log(JSON.stringify(features.features.skills, null, 2));

  console.log('\n2. Job Type:');
  console.log(`   - Posting Type: ${features.features.jobType.postingType}`);
  console.log(`   - Job Type: ${features.features.jobType.jobType}`);
  console.log(`   - Is Full Time: ${features.features.jobType.isFullTime}`);
  console.log(`   - Is Remote: ${features.features.jobType.isRemote}`);

  console.log('\n3. Location:');
  console.log(`   - Country: ${features.features.location.country}`);
  console.log(`   - City: ${features.features.location.city}`);

  console.log('\n4. Salary:');
  console.log(`   - Amount: ${features.features.salary.amount} SAR`);
  console.log(`   - Range: ${features.features.salary.range}`);

  console.log('\n5. Company:');
  console.log(`   - Has Company: ${features.features.company.hasCompany}`);
  console.log(`   - Industry: ${features.features.company.industry}`);

  console.log('\n6. Text Embedding (first 5 terms):');
  const embeddingTerms = Object.keys(features.features.textEmbedding).slice(0, 5);
  embeddingTerms.forEach(term => {
    console.log(`   - ${term}: ${features.features.textEmbedding[term].toFixed(3)}`);
  });

  console.log('\n📈 Metadata:');
  console.log(`   - Total Skills: ${features.metadata.totalSkills}`);
  console.log(`   - Status: ${features.metadata.status}`);

  return features;
}

// ==================== مثال 3: استخراج Course Features ====================

async function example3_extractCourseFeatures() {
  console.log('\n📊 مثال 3: استخراج Course Features\n');
  console.log('=' .repeat(60));

  const course = {
    courseId: 'course123',
    title: 'Advanced React Development',
    description: 'Master advanced React patterns, hooks, context API, and performance optimization techniques',
    content: 'This comprehensive course covers React Hooks, Context API, Redux, Performance optimization, Testing with Jest and React Testing Library, and building production-ready applications',
    category: 'Web Development',
    duration: 25,
    level: 'Advanced',
    skills: ['React', 'JavaScript', 'Redux', 'Jest', 'TypeScript'],
    maxParticipants: 50,
    enrolledCount: 42,
    instructor: {
      id: 'instructor123',
      firstName: 'محمد',
      lastName: 'أحمد'
    }
  };

  const features = featureEngineeringService.extractCourseFeatures(course);

  console.log('✅ Course Features:');
  console.log('\n1. Skills Covered:');
  console.log(JSON.stringify(features.features.skills, null, 2));

  console.log('\n2. Level:');
  console.log(`   - Level: ${features.features.level.level}`);
  console.log(`   - Level Value: ${features.features.level.levelValue}`);

  console.log('\n3. Category:');
  console.log(`   - Category: ${features.features.category.category}`);

  console.log('\n4. Duration:');
  console.log(`   - Hours: ${features.features.duration.hours}`);
  console.log(`   - Range: ${features.features.duration.range}`);

  console.log('\n5. Popularity:');
  console.log(`   - Enrolled: ${features.features.popularity.enrolledCount}`);
  console.log(`   - Max Participants: ${features.features.popularity.maxParticipants}`);
  console.log(`   - Fill Rate: ${(features.features.popularity.fillRate * 100).toFixed(1)}%`);
  console.log(`   - Is Popular: ${features.features.popularity.isPopular}`);

  console.log('\n6. Text Embedding (first 5 terms):');
  const embeddingTerms = Object.keys(features.features.textEmbedding).slice(0, 5);
  embeddingTerms.forEach(term => {
    console.log(`   - ${term}: ${features.features.textEmbedding[term].toFixed(3)}`);
  });

  return features;
}

// ==================== مثال 4: إنشاء User-Item Matrix ====================

async function example4_createUserItemMatrix() {
  console.log('\n📊 مثال 4: إنشاء User-Item Matrix\n');
  console.log('=' .repeat(60));

  // بيانات تفاعلات نموذجية
  const interactions = [
    {
      userId: 'user1',
      itemId: 'job1',
      action: 'apply',
      weight: 2.0,
      duration: 180
    },
    {
      userId: 'user1',
      itemId: 'job2',
      action: 'like',
      weight: 1.5,
      duration: 90
    },
    {
      userId: 'user1',
      itemId: 'job3',
      action: 'view',
      weight: 0.5,
      duration: 30
    },
    {
      userId: 'user2',
      itemId: 'job1',
      action: 'like',
      weight: 1.5,
      duration: 120
    },
    {
      userId: 'user2',
      itemId: 'job2',
      action: 'view',
      weight: 0.5,
      duration: 45
    },
    {
      userId: 'user2',
      itemId: 'job4',
      action: 'save',
      weight: 1.2,
      duration: 60
    },
    {
      userId: 'user3',
      itemId: 'job1',
      action: 'apply',
      weight: 2.0,
      duration: 150
    },
    {
      userId: 'user3',
      itemId: 'job3',
      action: 'like',
      weight: 1.5,
      duration: 75
    }
  ];

  const matrix = featureEngineeringService.createUserItemMatrix(interactions, 'job');

  console.log('✅ User-Item Matrix Created:');
  console.log('\n1. Sparse Matrix:');
  Object.keys(matrix.sparse).forEach(userId => {
    console.log(`\n   User ${userId}:`);
    Object.keys(matrix.sparse[userId]).forEach(itemId => {
      console.log(`      - ${itemId}: ${matrix.sparse[userId][itemId].toFixed(2)}`);
    });
  });

  console.log('\n2. Dense Matrix Shape:');
  console.log(`   - Rows (Users): ${matrix.dense.matrix.length}`);
  console.log(`   - Columns (Items): ${matrix.dense.matrix[0]?.length || 0}`);

  console.log('\n3. Metadata:');
  console.log(`   - Item Type: ${matrix.metadata.itemType}`);
  console.log(`   - Total Users: ${matrix.metadata.totalUsers}`);
  console.log(`   - Total Items: ${matrix.metadata.totalItems}`);
  console.log(`   - Total Interactions: ${matrix.metadata.totalInteractions}`);
  console.log(`   - Sparsity: ${(matrix.metadata.sparsity * 100).toFixed(2)}%`);

  return matrix;
}

// ==================== مثال 5: حساب TF-IDF Embeddings ====================

async function example5_computeTfIdfEmbeddings() {
  console.log('\n📊 مثال 5: حساب TF-IDF Embeddings\n');
  console.log('=' .repeat(60));

  const documents = [
    {
      id: 'job1',
      text: 'Senior JavaScript developer with React and NodeJS experience. Must have strong knowledge of web development and cloud technologies.'
    },
    {
      id: 'job2',
      text: 'Python developer needed for machine learning projects. Experience with TensorFlow and PyTorch required.'
    },
    {
      id: 'job3',
      text: 'Full stack developer with JavaScript, Python, React, and Django experience. Cloud deployment experience is a plus.'
    },
    {
      id: 'job4',
      text: 'DevOps engineer with Docker, Kubernetes, and AWS experience. CI/CD pipeline knowledge required.'
    }
  ];

  const result = featureEngineeringService.computeTfIdfEmbeddings(documents);

  console.log('✅ TF-IDF Embeddings:');
  console.log('\n1. Document Embeddings:');
  result.embeddings.forEach(embedding => {
    console.log(`\n   Document ${embedding.id}:`);
    console.log(`   - Term Count: ${embedding.metadata.termCount}`);
    console.log(`   - Max TF-IDF: ${embedding.metadata.maxTfidf.toFixed(3)}`);
    
    // عرض أعلى 5 terms
    const topTerms = Object.entries(embedding.vector)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    console.log('   - Top 5 Terms:');
    topTerms.forEach(([term, score]) => {
      console.log(`      * ${term}: ${score.toFixed(3)}`);
    });
  });

  console.log('\n2. Vocabulary:');
  console.log(`   - Size: ${result.vocabulary.length}`);
  console.log(`   - Sample Terms: ${result.vocabulary.slice(0, 10).join(', ')}`);

  console.log('\n3. Metadata:');
  console.log(`   - Total Documents: ${result.metadata.totalDocuments}`);
  console.log(`   - Vocabulary Size: ${result.metadata.vocabularySize}`);

  return result;
}

// ==================== مثال 6: Batch Processing ====================

async function example6_batchProcessing() {
  console.log('\n📊 مثال 6: Batch Processing\n');
  console.log('=' .repeat(60));

  // معالجة دفعة من المستخدمين
  const users = [
    {
      userId: 'user1',
      firstName: 'أحمد',
      skills: ['JavaScript', 'React'],
      experiences: [{ duration: 24 }],
      education: [{ level: 'Bachelor' }],
      languages: []
    },
    {
      userId: 'user2',
      firstName: 'محمد',
      skills: ['Python', 'Django'],
      experiences: [{ duration: 36 }],
      education: [{ level: 'Master' }],
      languages: []
    },
    {
      userId: 'user3',
      firstName: 'سارة',
      skills: ['Java', 'Spring'],
      experiences: [{ duration: 48 }],
      education: [{ level: 'Bachelor' }],
      languages: []
    }
  ];

  console.log('Processing batch of users...');
  const userFeatures = featureEngineeringService.batchProcessUsers(users);

  console.log(`\n✅ Processed ${userFeatures.length} users:`);
  userFeatures.forEach(features => {
    console.log(`\n   User ${features.userId}:`);
    console.log(`   - Skills: ${Object.keys(features.features.skills).join(', ')}`);
    console.log(`   - Experience: ${features.features.experience.totalYears} years`);
    console.log(`   - Education: ${features.features.education.highestLevelName}`);
  });

  return userFeatures;
}

// ==================== مثال 7: استخدام مع Data Collection Service ====================

async function example7_withDataCollection() {
  console.log('\n📊 مثال 7: استخدام مع Data Collection Service\n');
  console.log('=' .repeat(60));

  try {
    // جمع البيانات من قاعدة البيانات
    console.log('Collecting data from database...');
    
    const users = await dataCollectionService.collectUserData({ limit: 5 });
    const jobs = await dataCollectionService.collectJobData({ limit: 5 });
    const interactions = await dataCollectionService.collectInteractionData({ limit: 20 });

    console.log(`\n✅ Data collected:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Jobs: ${jobs.length}`);
    console.log(`   - Interactions: ${interactions.length}`);

    // معالجة البيانات
    console.log('\nProcessing features...');
    
    const userFeatures = featureEngineeringService.batchProcessUsers(users);
    const jobFeatures = featureEngineeringService.batchProcessJobs(jobs);
    const matrix = featureEngineeringService.createUserItemMatrix(interactions, 'job');

    console.log(`\n✅ Features extracted:`);
    console.log(`   - User Features: ${userFeatures.length}`);
    console.log(`   - Job Features: ${jobFeatures.length}`);
    console.log(`   - Matrix Size: ${matrix.metadata.totalUsers} x ${matrix.metadata.totalItems}`);
    console.log(`   - Matrix Sparsity: ${(matrix.metadata.sparsity * 100).toFixed(2)}%`);

    return {
      userFeatures,
      jobFeatures,
      matrix
    };
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Note: This example requires database connection');
    return null;
  }
}

// ==================== تشغيل جميع الأمثلة ====================

async function runAllExamples() {
  console.log('\n🚀 Feature Engineering Service - أمثلة الاستخدام');
  console.log('='.repeat(60));

  try {
    await example1_extractUserFeatures();
    await example2_extractJobFeatures();
    await example3_extractCourseFeatures();
    await example4_createUserItemMatrix();
    await example5_computeTfIdfEmbeddings();
    await example6_batchProcessing();
    await example7_withDataCollection();

    console.log('\n✅ جميع الأمثلة اكتملت بنجاح!');
  } catch (error) {
    console.error('\n❌ خطأ:', error.message);
  }
}

// تشغيل الأمثلة إذا تم تشغيل الملف مباشرة
if (require.main === module) {
  runAllExamples();
}

module.exports = {
  example1_extractUserFeatures,
  example2_extractJobFeatures,
  example3_extractCourseFeatures,
  example4_createUserItemMatrix,
  example5_computeTfIdfEmbeddings,
  example6_batchProcessing,
  example7_withDataCollection,
  runAllExamples
};
