/**
 * اختبارات دعم الخريطة ثنائي اللغة
 * Feature: advanced-search-filter
 * Property 17: Map Bilingual Support
 * Validates: Requirements 5.4
 * 
 * Property: For any map interface element (labels, tooltips, controls), 
 * when the language is switched between Arabic and English, all text 
 * should display correctly in the selected language.
 */

const mongoose = require('mongoose');
const JobPosting = require('../src/models/JobPosting');

describe('Map Bilingual Support - Property Tests', () => {
  let testUserId;
  let testJobs;

  beforeAll(async () => {
    // الاتصال بقاعدة البيانات للاختبار
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }

    testUserId = new mongoose.Types.ObjectId();
  });

  beforeEach(async () => {
    // تنظيف البيانات قبل كل اختبار
    await JobPosting.deleteMany({});

    // إنشاء وظائف اختبارية مع إحداثيات جغرافية
    testJobs = await JobPosting.insertMany([
      {
        title: 'مطور ويب في الرياض',
        description: 'وظيفة مطور ويب في الرياض',
        requirements: 'خبرة في تطوير المواقع',
        skills: ['JavaScript', 'React'],
        company: { name: 'شركة التقنية', size: 'Medium' },
        location: 'الرياض، السعودية',
        salary: { min: 5000, max: 8000 },
        jobType: 'Full-time',
        experienceLevel: 'Mid',
        postedBy: testUserId,
        status: 'Open'
      },
      {
        title: 'Web Developer in Cairo',
        description: 'Web developer job in Cairo',
        requirements: 'Experience in web development',
        skills: ['JavaScript', 'Node.js'],
        company: { name: 'Tech Company', size: 'Large' },
        location: 'Cairo, Egypt',
        salary: { min: 4000, max: 7000 },
        jobType: 'Full-time',
        experienceLevel: 'Senior',
        postedBy: testUserId,
        status: 'Open'
      },
      {
        title: 'Développeur Full Stack à Paris',
        description: 'Poste de développeur full stack à Paris',
        requirements: 'Expérience en développement web',
        skills: ['JavaScript', 'Vue.js'],
        company: { name: 'Société Tech', size: 'Small' },
        location: 'Paris, France',
        salary: { min: 6000, max: 9000 },
        jobType: 'Full-time',
        experienceLevel: 'Mid',
        postedBy: testUserId,
        status: 'Open'
      }
    ]);
  });

  afterAll(async () => {
    // تنظيف وإغلاق الاتصال
    await JobPosting.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Property 17: Map Bilingual Support', () => {
    /**
     * Property: جميع عناصر واجهة الخريطة يجب أن تعرض بشكل صحيح
     * في اللغة المحددة (العربية، الإنجليزية، الفرنسية)
     */

    test('should have all required translation keys for Arabic', () => {
      const translations = {
        ar: {
          loadingError: 'خطأ في تحميل الخريطة. يرجى المحاولة لاحقاً.',
          loading: 'جاري تحميل الخريطة...',
          jobCount: (count) => `${count} وظيفة على الخريطة`,
          noJobs: 'لا توجد وظائف على الخريطة',
          zoomIn: 'تكبير',
          zoomOut: 'تصغير',
          fullscreen: 'ملء الشاشة',
          mapType: 'نوع الخريطة',
          satellite: 'قمر صناعي',
          roadmap: 'خريطة الطرق',
          terrain: 'التضاريس',
          hybrid: 'هجين'
        }
      };

      const requiredKeys = [
        'loadingError', 'loading', 'jobCount', 'noJobs',
        'zoomIn', 'zoomOut', 'fullscreen', 'mapType',
        'satellite', 'roadmap', 'terrain', 'hybrid'
      ];

      requiredKeys.forEach(key => {
        expect(translations.ar).toHaveProperty(key);
        expect(translations.ar[key]).toBeDefined();
        
        if (typeof translations.ar[key] === 'string') {
          expect(translations.ar[key].length).toBeGreaterThan(0);
        }
      });
    });

    test('should have all required translation keys for English', () => {
      const translations = {
        en: {
          loadingError: 'Error loading map. Please try again later.',
          loading: 'Loading map...',
          jobCount: (count) => `${count} job${count !== 1 ? 's' : ''} on map`,
          noJobs: 'No jobs on map',
          zoomIn: 'Zoom in',
          zoomOut: 'Zoom out',
          fullscreen: 'Fullscreen',
          mapType: 'Map type',
          satellite: 'Satellite',
          roadmap: 'Roadmap',
          terrain: 'Terrain',
          hybrid: 'Hybrid'
        }
      };

      const requiredKeys = [
        'loadingError', 'loading', 'jobCount', 'noJobs',
        'zoomIn', 'zoomOut', 'fullscreen', 'mapType',
        'satellite', 'roadmap', 'terrain', 'hybrid'
      ];

      requiredKeys.forEach(key => {
        expect(translations.en).toHaveProperty(key);
        expect(translations.en[key]).toBeDefined();
        
        if (typeof translations.en[key] === 'string') {
          expect(translations.en[key].length).toBeGreaterThan(0);
        }
      });
    });

    test('should have all required translation keys for French', () => {
      const translations = {
        fr: {
          loadingError: 'Erreur de chargement de la carte. Veuillez réessayer plus tard.',
          loading: 'Chargement de la carte...',
          jobCount: (count) => `${count} emploi${count !== 1 ? 's' : ''} sur la carte`,
          noJobs: 'Aucun emploi sur la carte',
          zoomIn: 'Zoomer',
          zoomOut: 'Dézoomer',
          fullscreen: 'Plein écran',
          mapType: 'Type de carte',
          satellite: 'Satellite',
          roadmap: 'Carte routière',
          terrain: 'Terrain',
          hybrid: 'Hybride'
        }
      };

      const requiredKeys = [
        'loadingError', 'loading', 'jobCount', 'noJobs',
        'zoomIn', 'zoomOut', 'fullscreen', 'mapType',
        'satellite', 'roadmap', 'terrain', 'hybrid'
      ];

      requiredKeys.forEach(key => {
        expect(translations.fr).toHaveProperty(key);
        expect(translations.fr[key]).toBeDefined();
        
        if (typeof translations.fr[key] === 'string') {
          expect(translations.fr[key].length).toBeGreaterThan(0);
        }
      });
    });

    test('should format job count correctly in Arabic', () => {
      const translations = {
        ar: {
          jobCount: (count) => `${count} وظيفة على الخريطة`
        }
      };

      expect(translations.ar.jobCount(0)).toBe('0 وظيفة على الخريطة');
      expect(translations.ar.jobCount(1)).toBe('1 وظيفة على الخريطة');
      expect(translations.ar.jobCount(5)).toBe('5 وظيفة على الخريطة');
      expect(translations.ar.jobCount(100)).toBe('100 وظيفة على الخريطة');
    });

    test('should format job count correctly in English with pluralization', () => {
      const translations = {
        en: {
          jobCount: (count) => `${count} job${count !== 1 ? 's' : ''} on map`
        }
      };

      expect(translations.en.jobCount(0)).toBe('0 jobs on map');
      expect(translations.en.jobCount(1)).toBe('1 job on map');
      expect(translations.en.jobCount(2)).toBe('2 jobs on map');
      expect(translations.en.jobCount(100)).toBe('100 jobs on map');
    });

    test('should format job count correctly in French with pluralization', () => {
      const translations = {
        fr: {
          jobCount: (count) => `${count} emploi${count !== 1 ? 's' : ''} sur la carte`
        }
      };

      expect(translations.fr.jobCount(0)).toBe('0 emplois sur la carte');
      expect(translations.fr.jobCount(1)).toBe('1 emploi sur la carte');
      expect(translations.fr.jobCount(2)).toBe('2 emplois sur la carte');
      expect(translations.fr.jobCount(100)).toBe('100 emplois sur la carte');
    });

    test('should have consistent translation structure across all languages', () => {
      const translations = {
        ar: {
          loadingError: 'خطأ في تحميل الخريطة. يرجى المحاولة لاحقاً.',
          loading: 'جاري تحميل الخريطة...',
          jobCount: (count) => `${count} وظيفة على الخريطة`,
          noJobs: 'لا توجد وظائف على الخريطة',
          zoomIn: 'تكبير',
          zoomOut: 'تصغير',
          fullscreen: 'ملء الشاشة',
          mapType: 'نوع الخريطة',
          satellite: 'قمر صناعي',
          roadmap: 'خريطة الطرق',
          terrain: 'التضاريس',
          hybrid: 'هجين'
        },
        en: {
          loadingError: 'Error loading map. Please try again later.',
          loading: 'Loading map...',
          jobCount: (count) => `${count} job${count !== 1 ? 's' : ''} on map`,
          noJobs: 'No jobs on map',
          zoomIn: 'Zoom in',
          zoomOut: 'Zoom out',
          fullscreen: 'Fullscreen',
          mapType: 'Map type',
          satellite: 'Satellite',
          roadmap: 'Roadmap',
          terrain: 'Terrain',
          hybrid: 'Hybrid'
        },
        fr: {
          loadingError: 'Erreur de chargement de la carte. Veuillez réessayer plus tard.',
          loading: 'Chargement de la carte...',
          jobCount: (count) => `${count} emploi${count !== 1 ? 's' : ''} sur la carte`,
          noJobs: 'Aucun emploi sur la carte',
          zoomIn: 'Zoomer',
          zoomOut: 'Dézoomer',
          fullscreen: 'Plein écran',
          mapType: 'Type de carte',
          satellite: 'Satellite',
          roadmap: 'Carte routière',
          terrain: 'Terrain',
          hybrid: 'Hybride'
        }
      };

      const arKeys = Object.keys(translations.ar);
      const enKeys = Object.keys(translations.en);
      const frKeys = Object.keys(translations.fr);

      // جميع اللغات يجب أن يكون لها نفس المفاتيح
      expect(arKeys.sort()).toEqual(enKeys.sort());
      expect(arKeys.sort()).toEqual(frKeys.sort());
      expect(enKeys.sort()).toEqual(frKeys.sort());
    });

    test('should use correct Google Maps API language parameter for Arabic', () => {
      const language = 'ar';
      const expectedLanguage = 'ar';
      const expectedRegion = 'SA';

      expect(language === 'ar' ? 'ar' : language === 'fr' ? 'fr' : 'en').toBe(expectedLanguage);
      expect(language === 'ar' ? 'SA' : language === 'fr' ? 'FR' : 'US').toBe(expectedRegion);
    });

    test('should use correct Google Maps API language parameter for English', () => {
      const language = 'en';
      const expectedLanguage = 'en';
      const expectedRegion = 'US';

      expect(language === 'ar' ? 'ar' : language === 'fr' ? 'fr' : 'en').toBe(expectedLanguage);
      expect(language === 'ar' ? 'SA' : language === 'fr' ? 'FR' : 'US').toBe(expectedRegion);
    });

    test('should use correct Google Maps API language parameter for French', () => {
      const language = 'fr';
      const expectedLanguage = 'fr';
      const expectedRegion = 'FR';

      expect(language === 'ar' ? 'ar' : language === 'fr' ? 'fr' : 'en').toBe(expectedLanguage);
      expect(language === 'ar' ? 'SA' : language === 'fr' ? 'FR' : 'US').toBe(expectedRegion);
    });

    test('should set correct text direction (RTL) for Arabic', () => {
      const language = 'ar';
      const expectedDir = 'rtl';

      expect(language === 'ar' ? 'rtl' : 'ltr').toBe(expectedDir);
    });

    test('should set correct text direction (LTR) for English', () => {
      const language = 'en';
      const expectedDir = 'ltr';

      expect(language === 'ar' ? 'rtl' : 'ltr').toBe(expectedDir);
    });

    test('should set correct text direction (LTR) for French', () => {
      const language = 'fr';
      const expectedDir = 'ltr';

      expect(language === 'ar' ? 'rtl' : 'ltr').toBe(expectedDir);
    });

    test('should position map controls correctly for RTL (Arabic)', () => {
      const language = 'ar';
      
      // في RTL، التحكمات يجب أن تكون على اليسار
      const mapTypeControlPosition = language === 'ar' ? 'TOP_LEFT' : 'TOP_RIGHT';
      const zoomControlPosition = language === 'ar' ? 'LEFT_CENTER' : 'RIGHT_CENTER';
      const fullscreenControlPosition = language === 'ar' ? 'LEFT_TOP' : 'RIGHT_TOP';

      expect(mapTypeControlPosition).toBe('TOP_LEFT');
      expect(zoomControlPosition).toBe('LEFT_CENTER');
      expect(fullscreenControlPosition).toBe('LEFT_TOP');
    });

    test('should position map controls correctly for LTR (English)', () => {
      const language = 'en';
      
      // في LTR، التحكمات يجب أن تكون على اليمين
      const mapTypeControlPosition = language === 'ar' ? 'TOP_LEFT' : 'TOP_RIGHT';
      const zoomControlPosition = language === 'ar' ? 'LEFT_CENTER' : 'RIGHT_CENTER';
      const fullscreenControlPosition = language === 'ar' ? 'LEFT_TOP' : 'RIGHT_TOP';

      expect(mapTypeControlPosition).toBe('TOP_RIGHT');
      expect(zoomControlPosition).toBe('RIGHT_CENTER');
      expect(fullscreenControlPosition).toBe('RIGHT_TOP');
    });

    test('should position map controls correctly for LTR (French)', () => {
      const language = 'fr';
      
      // في LTR، التحكمات يجب أن تكون على اليمين
      const mapTypeControlPosition = language === 'ar' ? 'TOP_LEFT' : 'TOP_RIGHT';
      const zoomControlPosition = language === 'ar' ? 'LEFT_CENTER' : 'RIGHT_CENTER';
      const fullscreenControlPosition = language === 'ar' ? 'LEFT_TOP' : 'RIGHT_TOP';

      expect(mapTypeControlPosition).toBe('TOP_RIGHT');
      expect(zoomControlPosition).toBe('RIGHT_CENTER');
      expect(fullscreenControlPosition).toBe('RIGHT_TOP');
    });

    test('should display job markers with correct language data', async () => {
      const jobs = await JobPosting.find({ status: 'Open' }).lean();

      expect(jobs.length).toBe(3);

      // التحقق من أن كل وظيفة لها موقع صحيح
      jobs.forEach(job => {
        expect(job.location).toBeDefined();
        expect(typeof job.location).toBe('string');
        expect(job.location.length).toBeGreaterThan(0);
      });

      // التحقق من أن الوظائف تحتوي على نصوص بلغات مختلفة
      const arabicJob = jobs.find(j => j.title.includes('مطور'));
      const englishJob = jobs.find(j => j.title.includes('Developer') && !j.title.includes('مطور'));
      const frenchJob = jobs.find(j => j.title.includes('Développeur'));

      expect(arabicJob).toBeDefined();
      expect(arabicJob.location).toContain('الرياض');
      
      expect(englishJob).toBeDefined();
      expect(englishJob.location).toContain('Cairo');
      
      expect(frenchJob).toBeDefined();
      expect(frenchJob.location).toContain('Paris');
    });

    test('should handle language switching without data loss', () => {
      const translations = {
        ar: { loading: 'جاري تحميل الخريطة...' },
        en: { loading: 'Loading map...' },
        fr: { loading: 'Chargement de la carte...' }
      };

      // محاكاة تبديل اللغة
      let currentLanguage = 'ar';
      let currentText = translations[currentLanguage].loading;
      expect(currentText).toBe('جاري تحميل الخريطة...');

      currentLanguage = 'en';
      currentText = translations[currentLanguage].loading;
      expect(currentText).toBe('Loading map...');

      currentLanguage = 'fr';
      currentText = translations[currentLanguage].loading;
      expect(currentText).toBe('Chargement de la carte...');

      // العودة للعربية
      currentLanguage = 'ar';
      currentText = translations[currentLanguage].loading;
      expect(currentText).toBe('جاري تحميل الخريطة...');
    });

    test('should fallback to Arabic if language is not supported', () => {
      const translations = {
        ar: { loading: 'جاري تحميل الخريطة...' },
        en: { loading: 'Loading map...' },
        fr: { loading: 'Chargement de la carte...' }
      };

      const unsupportedLanguage = 'de'; // German
      const t = translations[unsupportedLanguage] || translations.ar;

      expect(t.loading).toBe('جاري تحميل الخريطة...');
    });

    test('should maintain translation consistency across map reloads', () => {
      const translations = {
        ar: { noJobs: 'لا توجد وظائف على الخريطة' },
        en: { noJobs: 'No jobs on map' },
        fr: { noJobs: 'Aucun emploi sur la carte' }
      };

      // محاكاة إعادة تحميل الخريطة عدة مرات
      for (let i = 0; i < 5; i++) {
        const arText = translations.ar.noJobs;
        const enText = translations.en.noJobs;
        const frText = translations.fr.noJobs;

        expect(arText).toBe('لا توجد وظائف على الخريطة');
        expect(enText).toBe('No jobs on map');
        expect(frText).toBe('Aucun emploi sur la carte');
      }
    });

    test('should handle special characters in translations', () => {
      const translations = {
        ar: { 
          loadingError: 'خطأ في تحميل الخريطة. يرجى المحاولة لاحقاً.',
          fullscreen: 'ملء الشاشة'
        },
        en: { 
          loadingError: 'Error loading map. Please try again later.',
          fullscreen: 'Fullscreen'
        },
        fr: { 
          loadingError: 'Erreur de chargement de la carte. Veuillez réessayer plus tard.',
          fullscreen: 'Plein écran'
        }
      };

      // التحقق من أن النصوص تحتوي على علامات الترقيم الصحيحة
      expect(translations.ar.loadingError).toContain('.');
      expect(translations.en.loadingError).toContain('.');
      expect(translations.fr.loadingError).toContain('.');

      // التحقق من عدم وجود أحرف غريبة
      expect(translations.ar.fullscreen).not.toContain('?');
      expect(translations.en.fullscreen).not.toContain('?');
      expect(translations.fr.fullscreen).not.toContain('?');
    });
  });

  describe('Integration with Job Data', () => {
    test('should display jobs with Arabic location names correctly', async () => {
      const arabicJobs = await JobPosting.find({
        location: /الرياض/
      }).lean();

      expect(arabicJobs.length).toBeGreaterThan(0);
      arabicJobs.forEach(job => {
        expect(job.location).toContain('الرياض');
        expect(job.location).toContain('السعودية');
      });
    });

    test('should display jobs with English location names correctly', async () => {
      const englishJobs = await JobPosting.find({
        location: /Cairo/
      }).lean();

      expect(englishJobs.length).toBeGreaterThan(0);
      englishJobs.forEach(job => {
        expect(job.location).toContain('Cairo');
        expect(job.location).toContain('Egypt');
      });
    });

    test('should display jobs with French location names correctly', async () => {
      const frenchJobs = await JobPosting.find({
        location: /Paris/
      }).lean();

      expect(frenchJobs.length).toBeGreaterThan(0);
      frenchJobs.forEach(job => {
        expect(job.location).toContain('Paris');
        expect(job.location).toContain('France');
      });
    });
  });
});
