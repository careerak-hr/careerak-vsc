/**
 * 🧪 Data Collection Service Tests
 * اختبارات شاملة لخدمة جمع البيانات
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dataCollectionService = require('../src/services/dataCollectionService');
const { User, Individual, Company } = require('../src/models/User');
const JobPosting = require('../src/models/JobPosting');
const EducationalCourse = require('../src/models/EducationalCourse');
const UserInteraction = require('../src/models/UserInteraction');

let mongoServer;

// إعداد قاعدة البيانات قبل الاختبارات
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
}, 60000); // زيادة timeout إلى 60 ثانية

// تنظيف بعد كل اختبار
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// إغلاق الاتصال بعد الاختبارات
afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 60000); // زيادة timeout إلى 60 ثانية

// ==================== Helper Functions ====================

/**
 * إنشاء مستخدم تجريبي
 */
async function createTestUser(overrides = {}) {
  const defaultUser = {
    email: `test${Date.now()}@example.com`,
    password: 'Test1234!',
    role: 'Employee',
    phone: `+201${Math.floor(Math.random() * 1000000000)}`,
    country: 'Egypt',
    city: 'Cairo',
    firstName: 'Test',
    lastName: 'User',
    specialization: 'Software Development',
    interests: ['Programming', 'AI'],
    bio: 'Test bio',
    computerSkills: [
      { skill: 'JavaScript', proficiency: 'advanced' },
      { skill: 'Python', proficiency: 'intermediate' }
    ],
    softwareSkills: [
      { software: 'VS Code', proficiency: 'expert' }
    ],
    otherSkills: ['Problem Solving', 'Communication'],
    educationList: [{
      level: 'Bachelor',
      degree: 'Computer Science',
      institution: 'Test University',
      year: '2020'
    }],
    experienceList: [{
      company: 'Test Company',
      position: 'Software Engineer',
      from: new Date('2020-01-01'),
      to: new Date('2022-01-01'),
      workType: 'technical',
      jobLevel: 'Mid-level'
    }],
    languages: [
      { language: 'Arabic', proficiency: 'native' },
      { language: 'English', proficiency: 'advanced' }
    ]
  };

  return await Individual.create({ ...defaultUser, ...overrides });
}

/**
 * إنشاء شركة تجريبية
 */
async function createTestCompany(overrides = {}) {
  const defaultCompany = {
    email: `company${Date.now()}@example.com`,
    password: 'Test1234!',
    role: 'HR',
    phone: `+201${Math.floor(Math.random() * 1000000000)}`,
    country: 'Egypt',
    companyName: 'Test Company',
    companyIndustry: 'Technology'
  };

  return await Company.create({ ...defaultCompany, ...overrides });
}

/**
 * إنشاء وظيفة تجريبية
 */
async function createTestJob(company, overrides = {}) {
  const defaultJob = {
    title: 'Software Engineer',
    description: 'We are looking for a skilled JavaScript and Python developer',
    requirements: 'Experience with React, Node.js, and MongoDB',
    postingType: 'Permanent Job',
    priceType: 'Salary Based',
    salary: { min: 5000, max: 8000 },
    location: 'Cairo, Egypt',
    jobType: 'Full-time',
    postedBy: company._id,
    status: 'Open'
  };

  return await JobPosting.create({ ...defaultJob, ...overrides });
}

/**
 * إنشاء دورة تجريبية
 */
async function createTestCourse(instructor, overrides = {}) {
  const defaultCourse = {
    title: 'Advanced JavaScript',
    description: 'Learn advanced JavaScript concepts including React and Node.js',
    content: 'ES6, Async/Await, React, Node.js',
    instructor: instructor._id,
    category: 'Programming',
    duration: { value: 40, unit: 'hours' },
    level: 'Advanced',
    status: 'Published',
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
  };

  return await EducationalCourse.create({ ...defaultCourse, ...overrides });
}

/**
 * إنشاء تفاعل تجريبي
 */
async function createTestInteraction(user, itemType, itemId, action = 'view') {
  return await UserInteraction.create({
    userId: user._id,
    itemType,
    itemId,
    action,
    duration: action === 'view' ? 30 : 0,
    context: {
      sourcePage: 'recommendations',
      displayType: 'list',
      position: 1,
      originalScore: 85
    }
  });
}

// ==================== Tests ====================

describe('Data Collection Service', () => {
  
  describe('collectUserData', () => {
    it('should collect user data successfully', async () => {
      // إنشاء مستخدمين تجريبيين
      await createTestUser();
      await createTestUser({ firstName: 'John', lastName: 'Doe' });
      await createTestUser({ firstName: 'Jane', lastName: 'Smith' });

      // جمع البيانات
      const users = await dataCollectionService.collectUserData();

      // التحقق
      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBe(3);
      
      // التحقق من البنية
      const user = users[0];
      expect(user).toHaveProperty('userId');
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
      expect(user).toHaveProperty('skills');
      expect(user).toHaveProperty('experiences');
      expect(user).toHaveProperty('education');
      expect(user).toHaveProperty('completeness');
      
      // التحقق من المهارات
      expect(Array.isArray(user.skills)).toBe(true);
      expect(user.skills.length).toBeGreaterThan(0);
      
      // التحقق من اكتمال الملف
      expect(user.completeness).toBeGreaterThan(0);
      expect(user.completeness).toBeLessThanOrEqual(100);
    });

    it('should filter inactive users by default', async () => {
      // إنشاء مستخدمين
      await createTestUser();
      await createTestUser({ accountDisabled: true });

      // جمع البيانات
      const users = await dataCollectionService.collectUserData();

      // التحقق - يجب أن يكون مستخدم واحد فقط
      expect(users.length).toBe(1);
    });

    it('should include inactive users when specified', async () => {
      // إنشاء مستخدمين
      await createTestUser();
      await createTestUser({ accountDisabled: true });

      // جمع البيانات مع المستخدمين غير النشطين
      const users = await dataCollectionService.collectUserData({
        includeInactive: true
      });

      // التحقق - يجب أن يكون مستخدمين
      expect(users.length).toBe(2);
    });

    it('should respect limit parameter', async () => {
      // إنشاء 5 مستخدمين
      for (let i = 0; i < 5; i++) {
        await createTestUser({ firstName: `User${i}` });
      }

      // جمع البيانات مع حد 3
      const users = await dataCollectionService.collectUserData({ limit: 3 });

      // التحقق
      expect(users.length).toBe(3);
    });

    it('should filter by minimum completeness', async () => {
      // إنشاء مستخدم كامل
      await createTestUser();
      
      // إنشاء مستخدم غير كامل
      await createTestUser({
        bio: null,
        interests: [],
        computerSkills: [],
        experienceList: []
      });

      // جمع البيانات مع حد أدنى للاكتمال
      const users = await dataCollectionService.collectUserData({
        minCompleteness: 50
      });

      // التحقق - يجب أن يكون مستخدم واحد فقط
      expect(users.length).toBe(1);
      expect(users[0].completeness).toBeGreaterThanOrEqual(50);
    });
  });

  describe('collectJobData', () => {
    it('should collect job data successfully', async () => {
      // إنشاء شركة ووظائف
      const company = await createTestCompany();
      await createTestJob(company);
      await createTestJob(company, { title: 'Backend Developer' });
      await createTestJob(company, { title: 'Frontend Developer' });

      // جمع البيانات
      const jobs = await dataCollectionService.collectJobData();

      // التحقق
      expect(jobs).toBeDefined();
      expect(Array.isArray(jobs)).toBe(true);
      expect(jobs.length).toBe(3);
      
      // التحقق من البنية
      const job = jobs[0];
      expect(job).toHaveProperty('jobId');
      expect(job).toHaveProperty('title');
      expect(job).toHaveProperty('description');
      expect(job).toHaveProperty('requirements');
      expect(job).toHaveProperty('requiredSkills');
      expect(job).toHaveProperty('company');
      
      // التحقق من المهارات المستخرجة
      expect(Array.isArray(job.requiredSkills)).toBe(true);
      expect(job.requiredSkills.length).toBeGreaterThan(0);
    });

    it('should filter by status', async () => {
      const company = await createTestCompany();
      await createTestJob(company, { status: 'Open' });
      await createTestJob(company, { status: 'Closed' });

      // جمع الوظائف المفتوحة فقط
      const jobs = await dataCollectionService.collectJobData({ status: 'Open' });

      // التحقق
      expect(jobs.length).toBe(1);
      expect(jobs[0].status).toBe('Open');
    });

    it('should exclude expired jobs by default', async () => {
      const company = await createTestCompany();
      
      // وظيفة حديثة
      await createTestJob(company);
      
      // وظيفة قديمة (أكثر من 90 يوم)
      await createTestJob(company, {
        createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000)
      });

      // جمع البيانات
      const jobs = await dataCollectionService.collectJobData();

      // التحقق - يجب أن تكون وظيفة واحدة فقط
      expect(jobs.length).toBe(1);
    });

    it('should include expired jobs when specified', async () => {
      const company = await createTestCompany();
      
      await createTestJob(company);
      await createTestJob(company, {
        createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000)
      });

      // جمع البيانات مع الوظائف القديمة
      const jobs = await dataCollectionService.collectJobData({
        includeExpired: true
      });

      // التحقق
      expect(jobs.length).toBe(2);
    });
  });

  describe('collectCourseData', () => {
    it('should collect course data successfully', async () => {
      // إنشاء مدرب ودورات
      const instructor = await createTestUser();
      await createTestCourse(instructor);
      await createTestCourse(instructor, { title: 'Python Basics' });
      await createTestCourse(instructor, { title: 'React Advanced' });

      // جمع البيانات
      const courses = await dataCollectionService.collectCourseData();

      // التحقق
      expect(courses).toBeDefined();
      expect(Array.isArray(courses)).toBe(true);
      expect(courses.length).toBe(3);
      
      // التحقق من البنية
      const course = courses[0];
      expect(course).toHaveProperty('courseId');
      expect(course).toHaveProperty('title');
      expect(course).toHaveProperty('description');
      expect(course).toHaveProperty('skills');
      expect(course).toHaveProperty('instructor');
      
      // التحقق من المهارات المستخرجة
      expect(Array.isArray(course.skills)).toBe(true);
    });

    it('should filter by status', async () => {
      const instructor = await createTestUser();
      await createTestCourse(instructor, { status: 'Published' });
      await createTestCourse(instructor, { status: 'Draft' });

      // جمع الدورات المنشورة فقط
      const courses = await dataCollectionService.collectCourseData({
        status: 'Published'
      });

      // التحقق
      expect(courses.length).toBe(1);
      expect(courses[0].status).toBe('Published');
    });

    it('should exclude expired courses by default', async () => {
      const instructor = await createTestUser();
      
      // دورة نشطة
      await createTestCourse(instructor);
      
      // دورة منتهية
      await createTestCourse(instructor, {
        endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      });

      // جمع البيانات
      const courses = await dataCollectionService.collectCourseData();

      // التحقق - يجب أن تكون دورة واحدة فقط
      expect(courses.length).toBe(1);
    });
  });

  describe('collectInteractionData', () => {
    it('should collect interaction data successfully', async () => {
      // إنشاء بيانات تجريبية
      const user = await createTestUser();
      const company = await createTestCompany();
      const job = await createTestJob(company);

      // إنشاء تفاعلات
      await createTestInteraction(user, 'job', job._id, 'view');
      await createTestInteraction(user, 'job', job._id, 'like');
      await createTestInteraction(user, 'job', job._id, 'apply');

      // جمع البيانات
      const interactions = await dataCollectionService.collectInteractionData();

      // التحقق
      expect(interactions).toBeDefined();
      expect(Array.isArray(interactions)).toBe(true);
      expect(interactions.length).toBe(3);
      
      // التحقق من البنية
      const interaction = interactions[0];
      expect(interaction).toHaveProperty('interactionId');
      expect(interaction).toHaveProperty('userId');
      expect(interaction).toHaveProperty('itemType');
      expect(interaction).toHaveProperty('itemId');
      expect(interaction).toHaveProperty('action');
      expect(interaction).toHaveProperty('weight');
      
      // التحقق من الأوزان
      const applyInteraction = interactions.find(i => i.action === 'apply');
      expect(applyInteraction.weight).toBe(2.0);
    });

    it('should filter by user', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser({ email: 'user2@test.com' });
      const company = await createTestCompany();
      const job = await createTestJob(company);

      await createTestInteraction(user1, 'job', job._id, 'view');
      await createTestInteraction(user2, 'job', job._id, 'view');

      // جمع تفاعلات user1 فقط
      const interactions = await dataCollectionService.collectInteractionData({
        userId: user1._id
      });

      // التحقق
      expect(interactions.length).toBe(1);
      expect(interactions[0].userId.toString()).toBe(user1._id.toString());
    });

    it('should filter by item type', async () => {
      const user = await createTestUser();
      const company = await createTestCompany();
      const job = await createTestJob(company);
      const course = await createTestCourse(user);

      await createTestInteraction(user, 'job', job._id, 'view');
      await createTestInteraction(user, 'course', course._id, 'view');

      // جمع تفاعلات الوظائف فقط
      const interactions = await dataCollectionService.collectInteractionData({
        itemType: 'job'
      });

      // التحقق
      expect(interactions.length).toBe(1);
      expect(interactions[0].itemType).toBe('job');
    });

    it('should filter by action', async () => {
      const user = await createTestUser();
      const company = await createTestCompany();
      const job = await createTestJob(company);

      await createTestInteraction(user, 'job', job._id, 'view');
      await createTestInteraction(user, 'job', job._id, 'like');
      await createTestInteraction(user, 'job', job._id, 'apply');

      // جمع تفاعلات التقديم فقط
      const interactions = await dataCollectionService.collectInteractionData({
        action: 'apply'
      });

      // التحقق
      expect(interactions.length).toBe(1);
      expect(interactions[0].action).toBe('apply');
    });
  });

  describe('collectAllData', () => {
    it('should collect all data types successfully', async () => {
      // إنشاء بيانات تجريبية
      const user = await createTestUser();
      const company = await createTestCompany();
      const job = await createTestJob(company);
      const course = await createTestCourse(user);
      await createTestInteraction(user, 'job', job._id, 'view');

      // جمع جميع البيانات
      const allData = await dataCollectionService.collectAllData();

      // التحقق
      expect(allData).toBeDefined();
      expect(allData).toHaveProperty('users');
      expect(allData).toHaveProperty('jobs');
      expect(allData).toHaveProperty('courses');
      expect(allData).toHaveProperty('interactions');
      expect(allData).toHaveProperty('metadata');
      
      // التحقق من الأعداد
      expect(allData.users.length).toBe(1);
      expect(allData.jobs.length).toBe(1);
      expect(allData.courses.length).toBe(1);
      expect(allData.interactions.length).toBe(1);
      
      // التحقق من metadata
      expect(allData.metadata.counts.users).toBe(1);
      expect(allData.metadata.counts.jobs).toBe(1);
      expect(allData.metadata.counts.courses).toBe(1);
      expect(allData.metadata.counts.interactions).toBe(1);
    });
  });

  describe('collectUserItemMatrix', () => {
    it('should build user-item matrix successfully', async () => {
      // إنشاء بيانات تجريبية
      const user1 = await createTestUser();
      const user2 = await createTestUser({ email: 'user2@test.com' });
      const company = await createTestCompany();
      const job1 = await createTestJob(company);
      const job2 = await createTestJob(company, { title: 'Backend Developer' });

      // إنشاء تفاعلات
      await createTestInteraction(user1, 'job', job1._id, 'like');
      await createTestInteraction(user1, 'job', job2._id, 'apply');
      await createTestInteraction(user2, 'job', job1._id, 'apply');

      // جمع المصفوفة
      const result = await dataCollectionService.collectUserItemMatrix({
        itemType: 'job'
      });

      // التحقق
      expect(result).toBeDefined();
      expect(result).toHaveProperty('matrix');
      expect(result).toHaveProperty('metadata');
      
      // التحقق من المصفوفة
      const matrix = result.matrix;
      expect(Object.keys(matrix).length).toBe(2); // مستخدمين
      
      // التحقق من الأوزان
      const user1Id = user1._id.toString();
      const job1Id = job1._id.toString();
      const job2Id = job2._id.toString();
      
      expect(matrix[user1Id][job1Id]).toBe(1.5); // like weight
      expect(matrix[user1Id][job2Id]).toBe(2.0); // apply weight
      
      // التحقق من metadata
      expect(result.metadata.totalUsers).toBe(2);
      expect(result.metadata.totalItems).toBe(2);
      expect(result.metadata.totalInteractions).toBe(3);
    });
  });

  describe('collectDataStatistics', () => {
    it('should collect statistics successfully', async () => {
      // إنشاء بيانات تجريبية
      await createTestUser();
      await createTestUser({ accountDisabled: true });
      
      const company = await createTestCompany();
      await createTestJob(company);
      await createTestJob(company, { status: 'Closed' });
      
      const instructor = await createTestUser({ email: 'instructor@test.com' });
      await createTestCourse(instructor);
      await createTestCourse(instructor, { status: 'Draft' });

      // جمع الإحصائيات
      const stats = await dataCollectionService.collectDataStatistics();

      // التحقق
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('users');
      expect(stats).toHaveProperty('jobs');
      expect(stats).toHaveProperty('courses');
      expect(stats).toHaveProperty('interactions');
      
      // التحقق من إحصائيات المستخدمين
      expect(stats.users.total).toBe(2);
      expect(stats.users.active).toBe(1);
      expect(stats.users.inactive).toBe(1);
      
      // التحقق من إحصائيات الوظائف
      expect(stats.jobs.total).toBe(2);
      expect(stats.jobs.open).toBe(1);
      expect(stats.jobs.closed).toBe(1);
      
      // التحقق من إحصائيات الدورات
      expect(stats.courses.total).toBe(2);
      expect(stats.courses.published).toBe(1);
      expect(stats.courses.unpublished).toBe(1);
    });
  });
});
