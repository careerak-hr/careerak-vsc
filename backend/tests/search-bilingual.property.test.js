const fc = require('fast-check');
const mongoose = require('mongoose');
const searchService = require('../src/services/searchService');
const JobPosting = require('../src/models/JobPosting');
const { User } = require('../src/models/User');

/**
 * 🧪 Property-Based Test: Bilingual Search Support
 * 
 * **Property 3: Bilingual Search Support**
 * 
 * For any search query in Arabic or English, the system should return 
 * relevant results in the same language, demonstrating that both languages 
 * are fully supported.
 * 
 * **Validates: Requirements 1.4**
 * 
 * Feature: advanced-search-filter
 */

describe('Property 3: Bilingual Search Support', () => {
  let testUser;
  let arabicJobs;
  let englishJobs;

  beforeAll(async () => {
    // الاتصال بقاعدة البيانات للاختبار
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || process.env.MONGODB_URI);
    }

    // إنشاء مستخدم اختبار
    testUser = await User.create({
      name: 'Test Company',
      email: `bilingual${Date.now()}@test.com`,
      password: 'Test123!@#',
      phone: '+201234567890',
      role: 'HR'
    });

    // إنشاء وظائف بالعربية
    arabicJobs = await JobPosting.create([
      {
        title: 'مطور جافاسكريبت أول',
        description: 'نبحث عن مطور متمرس للانضمام إلى فريقنا',
        requirements: 'يجب أن يكون لديك خبرة 5 سنوات على الأقل',
        skills: ['جافاسكريبت', 'رياكت', 'نود جي إس'],
        location: 'القاهرة، مصر',
        jobType: 'دوام كامل',
        company: {
          name: 'شركة التقنية المتقدمة',
          size: 'كبيرة'
        },
        experienceLevel: 'أول',
        salary: { min: 5000, max: 8000 },
        postedBy: testUser._id,
        status: 'Open'
      },
      {
        title: 'مطور واجهات أمامية',
        description: 'انضم إلى فريقنا المبتكر للعمل على مشاريع رائدة',
        requirements: 'معرفة بأطر العمل الحديثة مطلوبة',
        skills: ['رياكت', 'فيو جي إس', 'سي إس إس'],
        location: 'الإسكندرية، مصر',
        jobType: 'دوام كامل',
        company: {
          name: 'وكالة الإبداع',
          size: 'متوسطة'
        },
        experienceLevel: 'متوسط',
        salary: { min: 3000, max: 5000 },
        postedBy: testUser._id,
        status: 'Open'
      },
      {
        title: 'مهندس خلفية',
        description: 'بناء أنظمة خلفية قابلة للتوسع باستخدام نود جي إس',
        requirements: 'فهم قوي لقواعد البيانات',
        skills: ['نود جي إس', 'مونجو دي بي', 'إكسبريس'],
    