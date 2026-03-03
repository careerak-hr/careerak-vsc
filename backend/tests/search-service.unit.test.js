const mongoose = require('mongoose');
const searchService = require('../src/services/searchService');
const JobPosting = require('../src/models/JobPosting');
const { User } = require('../src/models/User');

describe('SearchService - Unit Tests', () => {
  let testUser;
  let testJobs;

  beforeAll(async () => {
    // الاتصال بقاعدة البيانات للاختبار
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || process.env.MONGODB_URI);
    }

    // إنشاء مستخدم اختبار
    testUser = await User.create({
      name: 'Test Company',
      email: `testcompany${Date.now()}@test.com`,
      password: 'Test123!@#',
      phone: '+201234567890',
      role: 'HR' // استخدام HR بدلاً من company
    });

    // إنشاء وظائف اختبار
    testJobs = await JobPosting.create([
      {
        title: 'Senior JavaScript Developer',
        description: 'We are looking for an experienced developer to join our team',
        requirements: 'Must have 5+ years of experience',
        skills: ['JavaScript', 'React', 'Node.js'],
        location: 'Cairo, Egypt',
        jobType: 'Full-time',
        company: {
          name: 'Tech Solutions Inc',
          size: 'Large'
        },
        experienceLevel: 'Senior',
        salary: { min: 5000, max: 8000 },
        postedBy: testUser._id,
        status: 'Open'
      },
      {
        title: 'Frontend Developer',
        description: 'Join our innovative team working on cutting-edge projects',
        requirements: 'Knowledge of modern frameworks required',
        skills: ['React', 'Vue.js', 'CSS'],
        location: 'Alexandria, Egypt',
        jobType: 'Full-time',
        company: {
          name: 'Creative Agency',
          size: 'Medium'
        },
        experienceLevel: 'Mid',
        salary: { min: 3000, max: 5000 },
        postedBy: testUser._id,
        status: 'Open'
      },
      {
        title: 'Backend Engineer',
        description: 'Build scalable backend systems with Node.js',
        requirements: 'Strong understanding of databases',
        skills: ['Node.js', 'MongoDB', 'Express'],
        location: 'Remote',
        jobType: 'Full-time',
        company: {
          name: 'Tech Solutions Inc',
          size: 'Large'
        },
        experienceLevel: 'Mid',
        salary: { min: 4000, max: 6000 },
        postedBy: testUser._id,
        status: 'Open'
      }
    ]);

    // الانتظار لضمان إنشاء text index
    try {
      await JobPosting.collection.createIndex({
        title: 'text',
        description: 'text',
        requirements: 'text',
        skills: 'text',
        'company.name': 'text'
      });
    } catch (error) {
      // Index قد يكون موجوداً بالفعل
      console.log('Text index already exists or error creating:', error.message);
    }
  });

  afterAll(async () => {
    // تنظيف البيانات
    await JobPosting.deleteMany({ postedBy: testUser._id });
    await User.deleteOne({ _id: testUser._id });
    await mongoose.connection.close();
  });

  describe('Requirement 1.1: البحث يعمل على جميع الحقول المذكورة', () => {
    
    test('يجب أن يبحث في حقل العنوان (title)', async () => {
      const result = await searchService.textSearch('JavaScript');
      
      expect(result.success).toBe(true);
      expect(result.data.results.length).toBeGreaterThan(0);
      
      const hasMatchInTitle = result.data.results.some(job => 
        job.title.includes('JavaScript')
      );
      expect(hasMatchInTitle).toBe(true);
    });

    test('يجب أن يبحث في حقل الوصف (description)', async () => {
      const result = await searchService.textSearch('team');
      
      expect(result.success).toBe(true);
      expect(result.data.results.length).toBeGreaterThan(0);
      
      const hasMatchInDescription = result.data.results.some(job => 
        job.description.toLowerCase().includes('team')
      );
      expect(hasMatchInDescription).toBe(true);
    });

    test('يجب أن يبحث في حقل المهارات (skills)', async () => {
      const result = await searchService.textSearch('React');
      
      expect(result.success).toBe(true);
      expect(result.data.results.length).toBeGreaterThan(0);
      
      const hasMatchInSkills = result.data.results.some(job => 
        job.skills && job.skills.includes('React')
      );
      expect(hasMatchInSkills).toBe(true);
    });

    test('يجب أن يبحث في حقل اسم الشركة (company.name)', async () => {
      const result = await searchService.textSearch('Tech Solutions');
      
      expect(result.success).toBe(true);
      expect(result.data.results.length).toBeGreaterThan(0);
      
      const hasMatchInCompany = result.data.results.some(job => 
        job.company && job.company.name.includes('Tech Solutions')
      );
      expect(hasMatchInCompany).toBe(true);
    });

    test('يجب أن يبحث في حقل المتطلبات (requirements)', async () => {
      const result = await searchService.textSearch('experience');
      
      expect(result.success).toBe(true);
      expect(result.data.results.length).toBeGreaterThan(0);
      
      const hasMatchInRequirements = result.data.results.some(job => 
        job.requirements.toLowerCase().includes('experience')
      );
      expect(hasMatchInRequirements).toBe(true);
    });

    test('يجب أن يبحث في جميع الحقول في نفس الوقت', async () => {
      // البحث عن كلمة موجودة في حقول مختلفة
      const result = await searchService.textSearch('Developer');
      
      expect(result.success).toBe(true);
      expect(result.data.results.length).toBeGreaterThan(0);
      
      // يجب أن يجد نتائج من حقول مختلفة
      const hasMultipleMatches = result.data.results.length >= 2;
      expect(hasMultipleMatches).toBe(true);
    });
  });

  describe('Requirement 1.2: النتائج تظهر خلال أقل من 500ms', () => {
    test('يجب أن يكون وقت الاستجابة أقل من 500ms', async () => {
      const startTime = Date.now();
      await searchService.textSearch('Developer');
      const endTime = Date.now();
      
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(500);
    });
  });

  describe('Requirement 1.4: دعم البحث بالعربية والإنجليزية', () => {
    test('يجب أن يعمل البحث بالإنجليزية', async () => {
      const result = await searchService.textSearch('Developer');
      
      expect(result.success).toBe(true);
      expect(result.data.results.length).toBeGreaterThan(0);
    });

    test('يجب أن يعيد نتائج فارغة للكلمات غير الموجودة', async () => {
      const result = await searchService.textSearch('NonExistentKeyword12345');
      
      expect(result.success).toBe(true);
      expect(result.data.results.length).toBe(0);
    });
  });

  describe('Pagination و Sorting', () => {
    test('يجب أن يدعم pagination', async () => {
      const result = await searchService.textSearch('Developer', {
        page: 1,
        limit: 2
      });
      
      expect(result.success).toBe(true);
      expect(result.data.page).toBe(1);
      expect(result.data.results.length).toBeLessThanOrEqual(2);
    });

    test('يجب أن يدعم الترتيب حسب التاريخ', async () => {
      const result = await searchService.textSearch('Developer', {
        sort: 'date'
      });
      
      expect(result.success).toBe(true);
      
      // التحقق من أن النتائج مرتبة حسب التاريخ
      if (result.data.results.length > 1) {
        const dates = result.data.results.map(job => new Date(job.createdAt));
        for (let i = 0; i < dates.length - 1; i++) {
          expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i + 1].getTime());
        }
      }
    });
  });

  describe('searchInFields - البحث في حقول محددة', () => {
    test('يجب أن يبحث في حقل واحد فقط', async () => {
      const result = await searchService.searchInFields('JavaScript', ['title']);
      
      expect(result.success).toBe(true);
      expect(result.data.searchedFields).toContain('title');
    });

    test('يجب أن يبحث في حقول متعددة', async () => {
      const result = await searchService.searchInFields('React', ['title', 'skills']);
      
      expect(result.success).toBe(true);
      expect(result.data.results.length).toBeGreaterThan(0);
    });
  });
});
