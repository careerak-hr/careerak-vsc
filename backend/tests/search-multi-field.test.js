const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const JobPosting = require('../src/models/JobPosting');
const User = require('../src/models/User');

describe('Search Service - Multi-field Search', () => {
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
      email: 'testcompany@test.com',
      password: 'Test123!@#',
      role: 'company'
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
    await JobPosting.collection.createIndex({
      title: 'text',
      description: 'text',
      requirements: 'text',
      skills: 'text',
      'company.name': 'text'
    });
  });

  afterAll(async () => {
    // تنظيف البيانات
    await JobPosting.deleteMany({ postedBy: testUser._id });
    await User.deleteOne({ _id: testUser._id });
    await mongoose.connection.close();
  });

  describe('البحث في حقل العنوان (title)', () => {
    it('يجب أن يجد الوظائف التي تحتوي على "Developer" في العنوان', async () => {
      const response = await request(app)
        .get('/search/jobs')
        .query({ q: 'Developer' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.results.length).toBeGreaterThan(0);
      
      // التحقق من أن النتائج تحتوي على الكلمة في العنوان
      const hasMatchInTitle = response.body.data.results.some(job => 
        job.title.toLowerCase().includes('developer')
      );
      expect(hasMatchInTitle).toBe(true);
    });

    it('يجب أن يجد "Frontend Developer" عند البحث عن "Frontend"', async () => {
      const response = await request(app)
        .get('/search/jobs')
        .query({ q: 'Frontend' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.results.length).toBeGreaterThan(0);
      
      const frontendJob = response.body.data.results.find(job => 
        job.title === 'Frontend Developer'
      );
      expect(frontendJob).toBeDefined();
    });
  });

  describe('البحث في حقل الوصف (description)', () => {
    it('يجب أن يجد الوظائف التي تحتوي على "team" في الوصف', async () => {
      const response = await request(app)
        .get('/search/jobs')
        .query({ q: 'team' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.results.length).toBeGreaterThan(0);
      
      const hasMatchInDescription = response.body.data.results.some(job => 
        job.description.toLowerCase().includes('team')
      );
      expect(hasMatchInDescription).toBe(true);
    });

    it('يجب أن يجد الوظائف التي تحتوي على "scalable" في الوصف', async () => {
      const response = await request(app)
        .get('/search/jobs')
        .query({ q: 'scalable' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const backendJob = response.body.data.results.find(job => 
        job.description.toLowerCase().includes('scalable')
      );
      expect(backendJob).toBeDefined();
    });
  });

  describe('البحث في حقل المهارات (skills)', () => {
    it('يجب أن يجد الوظائف التي تتطلب "React"', async () => {
      const response = await request(app)
        .get('/search/jobs')
        .query({ q: 'React' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.results.length).toBeGreaterThan(0);
      
      const hasReactSkill = response.body.data.results.some(job => 
        job.skills && job.skills.includes('React')
      );
      expect(hasReactSkill).toBe(true);
    });

    it('يجب أن يجد الوظائف التي تتطلب "Node.js"', async () => {
      const response = await request(app)
        .get('/search/jobs')
        .query({ q: 'Node.js' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.results.length).toBeGreaterThan(0);
      
      const hasNodeSkill = response.body.data.results.some(job => 
        job.skills && job.skills.includes('Node.js')
      );
      expect(hasNodeSkill).toBe(true);
    });
  });

  describe('البحث في حقل اسم الشركة (company.name)', () => {
    it('يجب أن يجد الوظائف من "Tech Solutions Inc"', async () => {
      const response = await request(app)
        .get('/search/jobs')
        .query({ q: 'Tech Solutions' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.results.length).toBeGreaterThan(0);
      
      const hasTechSolutions = response.body.data.results.some(job => 
        job.company && job.company.name === 'Tech Solutions Inc'
      );
      expect(hasTechSolutions).toBe(true);
    });

    it('يجب أن يجد الوظائف من "Creative Agency"', async () => {
      const response = await request(app)
        .get('/search/jobs')
        .query({ q: 'Creative' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const creativeJob = response.body.data.results.find(job => 
        job.company && job.company.name === 'Creative Agency'
      );
      expect(creativeJob).toBeDefined();
    });
  });

  describe('البحث في حقل المتطلبات (requirements)', () => {
    it('يجب أن يجد الوظائف التي تحتوي على "experience" في المتطلبات', async () => {
      const response = await request(app)
        .get('/search/jobs')
        .query({ q: 'experience' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.results.length).toBeGreaterThan(0);
      
      const hasExperienceRequirement = response.body.data.results.some(job => 
        job.requirements.toLowerCase().includes('experience')
      );
      expect(hasExperienceRequirement).toBe(true);
    });
  });

  describe('البحث في حقول متعددة', () => {
    it('يجب أن يجد النتائج من حقول مختلفة عند البحث عن "JavaScript"', async () => {
      const response = await request(app)
        .get('/search/jobs')
        .query({ q: 'JavaScript' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.results.length).toBeGreaterThan(0);
      
      // يجب أن يجد في العنوان أو المهارات
      const hasMatch = response.body.data.results.some(job => 
        job.title.includes('JavaScript') || 
        (job.skills && job.skills.includes('JavaScript'))
      );
      expect(hasMatch).toBe(true);
    });

    it('يجب أن يعيد نتائج فارغة للكلمات غير الموجودة', async () => {
      const response = await request(app)
        .get('/search/jobs')
        .query({ q: 'NonExistentKeyword12345' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.results.length).toBe(0);
    });
  });

  describe('دعم اللغة العربية والإنجليزية', () => {
    it('يجب أن يعمل البحث بالإنجليزية', async () => {
      const response = await request(app)
        .get('/search/jobs')
        .query({ q: 'Developer' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.results.length).toBeGreaterThan(0);
    });

    // ملاحظة: يمكن إضافة اختبارات للعربية عند وجود بيانات عربية
  });

  describe('Pagination', () => {
    it('يجب أن يدعم pagination', async () => {
      const response = await request(app)
        .get('/search/jobs')
        .query({ q: 'Developer', page: 1, limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.results.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Sorting', () => {
    it('يجب أن يدعم الترتيب حسب التاريخ', async () => {
      const response = await request(app)
        .get('/search/jobs')
        .query({ q: 'Developer', sort: 'date' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // التحقق من أن النتائج مرتبة حسب التاريخ (الأحدث أولاً)
      if (response.body.data.results.length > 1) {
        const dates = response.body.data.results.map(job => new Date(job.createdAt));
        for (let i = 0; i < dates.length - 1; i++) {
          expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i + 1].getTime());
        }
      }
    });
  });
});
