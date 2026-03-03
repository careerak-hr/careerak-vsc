const searchService = require('../src/services/searchService');
const JobPosting = require('../src/models/JobPosting');
const mongoose = require('mongoose');

describe('Map Search - Geographic Queries', () => {
  beforeAll(async () => {
    // الاتصال بقاعدة البيانات
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak-test');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // حذف جميع الوظائف
    await JobPosting.deleteMany({});
  });

  describe('Box Search (Rectangle)', () => {
    it('should search jobs within a rectangular boundary', async () => {
      // إنشاء وظائف اختبارية
      await JobPosting.create([
        {
          title: 'Job in Cairo',
          description: 'Test job',
          company: { name: 'Company A' },
          location: {
            city: 'Cairo',
            coordinates: {
              type: 'Point',
              coordinates: [31.2357, 30.0444] // Cairo
            }
          },
          status: 'Open'
        },
        {
          title: 'Job in Giza',
          description: 'Test job',
          company: { name: 'Company B' },
          location: {
            city: 'Giza',
            coordinates: {
              type: 'Point',
              coordinates: [31.2118, 30.0131] // Giza
            }
          },
          status: 'Open'
        },
        {
          title: 'Job in Dubai',
          description: 'Test job',
          company: { name: 'Company C' },
          location: {
            city: 'Dubai',
            coordinates: {
              type: 'Point',
              coordinates: [55.2708, 25.2048] // Dubai
            }
          },
          status: 'Open'
        }
      ]);

      // البحث في مستطيل يشمل القاهرة والجيزة فقط
      const bounds = {
        type: 'box',
        north: 30.1,
        south: 30.0,
        east: 31.3,
        west: 31.2
      };

      const markers = await searchService.searchJobsInBounds(bounds);

      expect(markers).toBeDefined();
      expect(markers.length).toBe(2); // Cairo and Giza only
      
      const cities = markers.map(m => m.location);
      expect(cities).toContain('Cairo');
      expect(cities).toContain('Giza');
      expect(cities).not.toContain('Dubai');
    });

    it('should return empty array when no jobs in boundary', async () => {
      await JobPosting.create({
        title: 'Job in Cairo',
        description: 'Test job',
        company: { name: 'Company A' },
        location: {
          city: 'Cairo',
          coordinates: {
            type: 'Point',
            coordinates: [31.2357, 30.0444]
          }
        },
        status: 'Open'
      });

      // البحث في منطقة فارغة
      const bounds = {
        type: 'box',
        north: 35.0,
        south: 34.0,
        east: 35.0,
        west: 34.0
      };

      const markers = await searchService.searchJobsInBounds(bounds);
      expect(markers).toHaveLength(0);
    });
  });

  describe('Circle Search', () => {
    it('should search jobs within a circular boundary', async () => {
      // إنشاء وظائف اختبارية
      await JobPosting.create([
        {
          title: 'Job in Cairo',
          description: 'Test job',
          company: { name: 'Company A' },
          location: {
            city: 'Cairo',
            coordinates: {
              type: 'Point',
              coordinates: [31.2357, 30.0444] // Cairo
            }
          },
          status: 'Open'
        },
        {
          title: 'Job in Giza',
          description: 'Test job',
          company: { name: 'Company B' },
          location: {
            city: 'Giza',
            coordinates: {
              type: 'Point',
              coordinates: [31.2118, 30.0131] // Giza (very close to Cairo)
            }
          },
          status: 'Open'
        },
        {
          title: 'Job in Alexandria',
          description: 'Test job',
          company: { name: 'Company C' },
          location: {
            city: 'Alexandria',
            coordinates: {
              type: 'Point',
              coordinates: [29.9187, 31.2001] // Alexandria (far from Cairo)
            }
          },
          status: 'Open'
        }
      ]);

      // البحث في دائرة حول القاهرة بنصف قطر 50 كم
      const bounds = {
        type: 'circle',
        lat: 30.0444,
        lng: 31.2357,
        radius: 50
      };

      const markers = await searchService.searchJobsInBounds(bounds);

      expect(markers).toBeDefined();
      expect(markers.length).toBeGreaterThanOrEqual(2); // Cairo and Giza
      
      const cities = markers.map(m => m.location);
      expect(cities).toContain('Cairo');
      expect(cities).toContain('Giza');
    });

    it('should use default radius of 10km', async () => {
      await JobPosting.create({
        title: 'Job in Cairo',
        description: 'Test job',
        company: { name: 'Company A' },
        location: {
          city: 'Cairo',
          coordinates: {
            type: 'Point',
            coordinates: [31.2357, 30.0444]
          }
        },
        status: 'Open'
      });

      // البحث بدون تحديد نصف القطر (افتراضي 10 كم)
      const bounds = {
        type: 'circle',
        lat: 30.0444,
        lng: 31.2357
        // no radius specified
      };

      const markers = await searchService.searchJobsInBounds(bounds);
      expect(markers).toBeDefined();
    });

    it('should search with smaller radius and get fewer results', async () => {
      await JobPosting.create([
        {
          title: 'Job very close',
          description: 'Test job',
          company: { name: 'Company A' },
          location: {
            city: 'Cairo Center',
            coordinates: {
              type: 'Point',
              coordinates: [31.2357, 30.0444] // Exact center
            }
          },
          status: 'Open'
        },
        {
          title: 'Job far away',
          description: 'Test job',
          company: { name: 'Company B' },
          location: {
            city: 'Cairo Outskirts',
            coordinates: {
              type: 'Point',
              coordinates: [31.3, 30.1] // ~10km away
            }
          },
          status: 'Open'
        }
      ]);

      // دائرة صغيرة جداً (5 كم)
      const bounds = {
        type: 'circle',
        lat: 30.0444,
        lng: 31.2357,
        radius: 5
      };

      const markers = await searchService.searchJobsInBounds(bounds);
      expect(markers.length).toBeLessThanOrEqual(1); // Only the close one
    });
  });

  describe('Marker Data Structure', () => {
    it('should return markers with correct structure', async () => {
      await JobPosting.create({
        title: 'Test Job',
        description: 'Test description',
        company: { name: 'Test Company' },
        location: {
          city: 'Cairo',
          coordinates: {
            type: 'Point',
            coordinates: [31.2357, 30.0444]
          }
        },
        salary: { min: 5000, max: 8000 },
        jobType: 'Full-time',
        experienceLevel: 'Mid-level',
        status: 'Open'
      });

      const bounds = {
        type: 'box',
        north: 30.1,
        south: 30.0,
        east: 31.3,
        west: 31.2
      };

      const markers = await searchService.searchJobsInBounds(bounds);
      expect(markers.length).toBeGreaterThan(0);

      const marker = markers[0];
      expect(marker).toHaveProperty('id');
      expect(marker).toHaveProperty('position');
      expect(marker.position).toHaveProperty('lat');
      expect(marker.position).toHaveProperty('lng');
      expect(marker).toHaveProperty('title');
      expect(marker).toHaveProperty('company');
      expect(marker).toHaveProperty('location');
      expect(marker).toHaveProperty('salary');
      expect(marker).toHaveProperty('jobType');
      expect(marker).toHaveProperty('experienceLevel');
    });
  });
});
