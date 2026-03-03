const searchService = require('../src/services/searchService');
const JobPosting = require('../src/models/JobPosting');
const SearchHistory = require('../src/models/SearchHistory');
const User = require('../src/models/User');
const mongoose = require('mongoose');

describe('Autocomplete Service Tests', () => {
  let testUser;

  beforeAll(async () => {
    // الاتصال بقاعدة بيانات الاختبار
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test');
    }

    // إنشاء مستخدم للاختبار
    testUser = await User.create({
      name: 'Test User',
      email: 'autocomplete-simple@test.com',
      password: 'Test123!@#',
      role: 'job_seeker'
    });
  });

  afterAll(async () => {
    // تنظيف البيانات
    await JobPosting.deleteMany({});
    await SearchHistory.deleteMany({});
    await User.deleteMany({ email: 'autocomplete-simple@test.com' });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // تنظيف البيانات قبل كل اختبار
    await JobPosting.deleteMany({});
    await SearchHistory.deleteMany({});
  });

  describe('getAutocomplete', () => {
    it('يجب أن يرجع قائمة فارغة عند إدخال أقل من 3 أحرف', async () => {
      const suggestions = await searchService.getAutocomplete('ab', 'jobs');
      expect(suggestions).toEqual([]);
    });

    it('يجب أن يرجع قائمة فارغة عند إدخال نص فارغ', async () => {
      const suggestions = await searchService.getAutocomplete('', 'jobs');
      expect(suggestions).toEqual([]);
    });

    it('يجب أن يرجع قائمة فارغة عند إدخال null', async () => {
      const suggestions = await searchService.getAutocomplete(null, 'jobs');
      expect(suggestions).toEqual([]);
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
        }
      ]);

      const suggestions = await searchService.getAutocomplete('jav', 'jobs', null, 5);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.toLowerCase().includes('javascript'))).toBe(true);
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
        }
      ]);

      const suggestions = await searchService.getAutocomplete('rea', 'jobs', null, 5);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.toLowerCase().includes('react'))).toBe(true);
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
        }
      ]);

      const suggestions = await searchService.getAutocomplete('goo', 'jobs', null, 5);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.toLowerCase().includes('google'))).toBe(true);
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

      const suggestions = await searchService.getAutocomplete('dev', 'jobs', null, 5);
      
      expect(suggestions.length).toBeLessThanOrEqual(5);
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

      const suggestions = await searchService.getAutocomplete('مطو', 'jobs', null, 5);
      
      expect(suggestions.length).toBeGreaterThan(0);
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

      const suggestions = await searchService.getAutocomplete('jav', 'jobs', null, 10);
      
      expect(suggestions.every(s => !s.includes('Closed'))).toBe(true);
    });

    it('يجب أن يرجع اقتراحات من سجل البحث للمستخدم', async () => {
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

      const suggestions = await searchService.getAutocomplete('jav', 'jobs', testUser._id, 5);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('JavaScript'))).toBe(true);
    });
  });

  describe('saveSearchHistory', () => {
    it('يجب أن يحفظ عملية بحث في السجل', async () => {
      await searchService.saveSearchHistory(
        testUser._id,
        'JavaScript Developer',
        'jobs',
        {},
        10
      );

      const history = await SearchHistory.findOne({
        userId: testUser._id,
        query: 'JavaScript Developer'
      });

      expect(history).toBeDefined();
      expect(history.searchType).toBe('jobs');
      expect(history.resultCount).toBe(10);
    });

    it('يجب أن لا يحفظ إذا كان النص أقل من 3 أحرف', async () => {
      await searchService.saveSearchHistory(
        testUser._id,
        'ab',
        'jobs',
        {},
        0
      );

      const history = await SearchHistory.findOne({
        userId: testUser._id,
        query: 'ab'
      });

      expect(history).toBeNull();
    });
  });
});
