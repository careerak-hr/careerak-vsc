const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const JobPosting = require('../src/models/JobPosting');
const SearchHistory = require('../src/models/SearchHistory');
const User = require('../src/models/User');

describe('Autocomplete API Tests', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // الاتصال بقاعدة بيانات الاختبار
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test');
    }

    // إنشاء مستخدم للاختبار
    testUser = await User.create({
      name: 'Test User',
      email: 'autocomplete@test.com',
      password: 'Test123!@#',
      role: 'job_seeker'
    });

    // الحصول على token
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'autocomplete@test.com',
        password: 'Test123!@#'
      });

    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    // تنظيف البيانات
    await JobPosting.deleteMany({});
    await SearchHistory.deleteMany({});
    await User.deleteMany({ email: 'autocomplete@test.com' });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // تنظيف البيانات قبل كل اختبار
    await JobPosting.deleteMany({});
    await SearchHistory.deleteMany({});
  });

  describe('GET /api/search/autocomplete', () => {
    it('يجب أن يرجع قائمة فارغة عند إدخال أقل من 3 أحرف', async () => {
      const res = await request(app)
        .get('/api/search/autocomplete')
        .query({ q: 'ab', type: 'jobs' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.suggestions).toEqual([]);
      expect(res.body.data.message).toBe('يرجى إدخال 3 أحرف على الأقل');
    });

    it('يجب أن يرجع خطأ عند عدم إدخال نص البحث', async () => {
      const res = await request(app)
        .get('/api/search/autocomplete')
        .query({ type: 'jobs' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('MISSING_QUERY');
    });

    it('يجب أن يرجع خطأ عند إدخال نوع بحث غير صحيح', async () => {
      const res = await request(app)
        .get('/api/search/autocomplete')
        .query({ q: 'developer', type: 'invalid' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_TYPE');
    });

    it('يجب أن يرجع اقتراحات من العناوين', async () => {
      // إنشاء وظائف للاختبار
      await JobPosting.create([
        {
          title: 'Senior JavaScript Developer',
          description: 'Looking for experienced developer',
          requirements: 'JavaScript, React',
          location: 'Cairo',
          postedBy: testUser._id,
          status: 'Open'
        },
        {
          title: 'JavaScript Engineer',
          description: 'Frontend developer needed',
          requirements: 'JavaScript, Vue',
          location: 'Alexandria',
          postedBy: testUser._id,
          status: 'Open'
        },
        {
          title: 'Python Developer',
          description: 'Backend developer',
          requirements: 'Python, Django',
          location: 'Cairo',
          postedBy: testUser._id,
          status: 'Open'
        }
      ]);

      const res = await request(app)
        .get('/api/search/autocomplete')
        .query({ q: 'jav', type: 'jobs', limit: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.suggestions.length).toBeGreaterThan(0);
      expect(res.body.data.suggestions.some(s => s.toLowerCase().includes('javascript'))).toBe(true);
    });

    it('يجب أن يرجع اقتراحات من المهارات', async () => {
      // إنشاء وظائف مع مهارات
      await JobPosting.create([
        {
          title: 'Full Stack Developer',
          description: 'Full stack position',
          requirements: 'Various skills',
          skills: ['JavaScript', 'React', 'Node.js'],
          location: 'Cairo',
          postedBy: testUser._id,
          status: 'Open'
        },
        {
          title: 'Frontend Developer',
          description: 'Frontend position',
          requirements: 'Frontend skills',
          skills: ['JavaScript', 'Vue.js', 'CSS'],
          location: 'Alexandria',
          postedBy: testUser._id,
          status: 'Open'
        }
      ]);

      const res = await request(app)
        .get('/api/search/autocomplete')
        .query({ q: 'rea', type: 'jobs', limit: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.suggestions.length).toBeGreaterThan(0);
      expect(res.body.data.suggestions.some(s => s.toLowerCase().includes('react'))).toBe(true);
    });

    it('يجب أن يرجع اقتراحات من أسماء الشركات', async () => {
      // إنشاء وظائف مع أسماء شركات
      await JobPosting.create([
        {
          title: 'Software Engineer',
          description: 'Engineering position',
          requirements: 'Various skills',
          company: { name: 'Google Egypt', size: 'Large' },
          location: 'Cairo',
          postedBy: testUser._id,
          status: 'Open'
        },
        {
          title: 'Developer',
          description: 'Development position',
          requirements: 'Development skills',
          company: { name: 'Microsoft Egypt', size: 'Large' },
          location: 'Alexandria',
          postedBy: testUser._id,
          status: 'Open'
        }
      ]);

      const res = await request(app)
        .get('/api/search/autocomplete')
        .query({ q: 'goo', type: 'jobs', limit: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.suggestions.length).toBeGreaterThan(0);
      expect(res.body.data.suggestions.some(s => s.toLowerCase().includes('google'))).toBe(true);
    });

    it('يجب أن يرجع اقتراحات من سجل البحث للمستخدم المسجل', async () => {
      // إنشاء سجل بحث
      await SearchHistory.create([
        {
          userId: testUser._id,
          query: 'JavaScript Developer',
          searchType: 'jobs',
          resultCount: 10
        },
        {
          userId: testUser._id,
          query: 'JavaScript Engineer',
          searchType: 'jobs',
          resultCount: 5
        }
      ]);

      const res = await request(app)
        .get('/api/search/autocomplete')
        .query({ q: 'jav', type: 'jobs', limit: 5 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.suggestions.length).toBeGreaterThan(0);
      expect(res.body.data.suggestions.some(s => s.includes('JavaScript'))).toBe(true);
    });

    it('يجب أن يحترم حد الاقتراحات (limit)', async () => {
      // إنشاء وظائف متعددة
      const jobs = [];
      for (let i = 0; i < 20; i++) {
        jobs.push({
          title: `Developer Position ${i}`,
          description: 'Development position',
          requirements: 'Various skills',
          location: 'Cairo',
          postedBy: testUser._id,
          status: 'Open'
        });
      }
      await JobPosting.create(jobs);

      const res = await request(app)
        .get('/api/search/autocomplete')
        .query({ q: 'dev', type: 'jobs', limit: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.suggestions.length).toBeLessThanOrEqual(5);
    });

    it('يجب أن يعمل بدون تسجيل دخول', async () => {
      // إنشاء وظيفة
      await JobPosting.create({
        title: 'React Developer',
        description: 'React position',
        requirements: 'React skills',
        location: 'Cairo',
        postedBy: testUser._id,
        status: 'Open'
      });

      const res = await request(app)
        .get('/api/search/autocomplete')
        .query({ q: 'rea', type: 'jobs', limit: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.suggestions).toBeDefined();
    });

    it('يجب أن يدعم البحث بالعربية', async () => {
      // إنشاء وظيفة بعنوان عربي
      await JobPosting.create({
        title: 'مطور جافاسكريبت',
        description: 'وظيفة تطوير',
        requirements: 'مهارات البرمجة',
        location: 'القاهرة',
        postedBy: testUser._id,
        status: 'Open'
      });

      const res = await request(app)
        .get('/api/search/autocomplete')
        .query({ q: 'مطو', type: 'jobs', limit: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.suggestions.length).toBeGreaterThan(0);
    });

    it('يجب أن يتجاهل الوظائف المغلقة', async () => {
      // إنشاء وظائف مفتوحة ومغلقة
      await JobPosting.create([
        {
          title: 'Open JavaScript Position',
          description: 'Open position',
          requirements: 'JavaScript',
          location: 'Cairo',
          postedBy: testUser._id,
          status: 'Open'
        },
        {
          title: 'Closed JavaScript Position',
          description: 'Closed position',
          requirements: 'JavaScript',
          location: 'Cairo',
          postedBy: testUser._id,
          status: 'Closed'
        }
      ]);

      const res = await request(app)
        .get('/api/search/autocomplete')
        .query({ q: 'jav', type: 'jobs', limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.suggestions.every(s => !s.includes('Closed'))).toBe(true);
    });
  });
});
