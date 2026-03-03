const alertService = require('../src/services/alertService');
const notificationService = require('../src/services/notificationService');

// Mock notificationService
jest.mock('../src/services/notificationService');

describe('Alert Notification Link Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendAlert with Direct Links', () => {
    it('should include direct job links in notification', async () => {
      // Arrange
      const userId = 'user123';
      const savedSearch = {
        _id: 'search123',
        name: 'مطور JavaScript',
        userId,
        searchParams: { query: 'JavaScript' }
      };

      const newJobs = [
        {
          _id: 'job1',
          title: 'مطور Frontend',
          company: { name: 'شركة ABC' },
          location: 'القاهرة'
        },
        {
          _id: 'job2',
          title: 'مطور Backend',
          company: { name: 'شركة XYZ' },
          location: 'الرياض'
        }
      ];

      notificationService.createNotification.mockResolvedValue({
        _id: 'notif123',
        recipient: userId,
        type: 'job_match'
      });

      // Act
      await alertService.sendAlert(userId, savedSearch, newJobs);

      // Assert
      expect(notificationService.createNotification).toHaveBeenCalledTimes(1);
      
      const callArgs = notificationService.createNotification.mock.calls[0][0];
      
      // التحقق من البيانات الأساسية
      expect(callArgs.recipient).toBe(userId);
      expect(callArgs.type).toBe('job_match');
      expect(callArgs.title).toBe('وظائف جديدة تطابق بحثك');
      expect(callArgs.message).toContain('2 وظيفة جديدة');
      expect(callArgs.priority).toBe('high');

      // التحقق من وجود الروابط المباشرة
      expect(callArgs.relatedData).toBeDefined();
      expect(callArgs.relatedData.jobLinks).toBeDefined();
      expect(callArgs.relatedData.jobLinks).toHaveLength(2);

      // التحقق من محتوى الرابط الأول
      const firstLink = callArgs.relatedData.jobLinks[0];
      expect(firstLink.jobId).toBe('job1');
      expect(firstLink.jobTitle).toBe('مطور Frontend');
      expect(firstLink.jobUrl).toBe('/job-postings/job1');
      expect(firstLink.company).toBe('شركة ABC');
      expect(firstLink.location).toBe('القاهرة');

      // التحقق من محتوى الرابط الثاني
      const secondLink = callArgs.relatedData.jobLinks[1];
      expect(secondLink.jobId).toBe('job2');
      expect(secondLink.jobTitle).toBe('مطور Backend');
      expect(secondLink.jobUrl).toBe('/job-postings/job2');
      expect(secondLink.company).toBe('شركة XYZ');
      expect(secondLink.location).toBe('الرياض');
    });

    it('should handle jobs without company name', async () => {
      // Arrange
      const userId = 'user123';
      const savedSearch = {
        _id: 'search123',
        name: 'مطور',
        userId,
        searchParams: {}
      };

      const newJobs = [
        {
          _id: 'job1',
          title: 'مطور',
          location: 'القاهرة'
          // لا يوجد company
        }
      ];

      notificationService.createNotification.mockResolvedValue({});

      // Act
      await alertService.sendAlert(userId, savedSearch, newJobs);

      // Assert
      const callArgs = notificationService.createNotification.mock.calls[0][0];
      const link = callArgs.relatedData.jobLinks[0];
      
      expect(link.company).toBe('غير محدد');
    });

    it('should handle jobs without location', async () => {
      // Arrange
      const userId = 'user123';
      const savedSearch = {
        _id: 'search123',
        name: 'مطور',
        userId,
        searchParams: {}
      };

      const newJobs = [
        {
          _id: 'job1',
          title: 'مطور',
          company: { name: 'شركة ABC' }
          // لا يوجد location
        }
      ];

      notificationService.createNotification.mockResolvedValue({});

      // Act
      await alertService.sendAlert(userId, savedSearch, newJobs);

      // Assert
      const callArgs = notificationService.createNotification.mock.calls[0][0];
      const link = callArgs.relatedData.jobLinks[0];
      
      expect(link.location).toBe('غير محدد');
    });

    it('should not send alert if no jobs', async () => {
      // Arrange
      const userId = 'user123';
      const savedSearch = {
        _id: 'search123',
        name: 'مطور',
        userId,
        searchParams: {}
      };

      // Act
      await alertService.sendAlert(userId, savedSearch, []);

      // Assert
      expect(notificationService.createNotification).not.toHaveBeenCalled();
    });

    it('should include savedSearchId and searchName in relatedData', async () => {
      // Arrange
      const userId = 'user123';
      const savedSearch = {
        _id: 'search123',
        name: 'مطور React',
        userId,
        searchParams: {}
      };

      const newJobs = [
        {
          _id: 'job1',
          title: 'مطور React',
          company: { name: 'شركة ABC' },
          location: 'القاهرة'
        }
      ];

      notificationService.createNotification.mockResolvedValue({});

      // Act
      await alertService.sendAlert(userId, savedSearch, newJobs);

      // Assert
      const callArgs = notificationService.createNotification.mock.calls[0][0];
      
      expect(callArgs.relatedData.savedSearchId).toBe('search123');
      expect(callArgs.relatedData.searchName).toBe('مطور React');
    });

    it('should include all job IDs in jobPostings array', async () => {
      // Arrange
      const userId = 'user123';
      const savedSearch = {
        _id: 'search123',
        name: 'مطور',
        userId,
        searchParams: {}
      };

      const newJobs = [
        { _id: 'job1', title: 'Job 1', company: {}, location: '' },
        { _id: 'job2', title: 'Job 2', company: {}, location: '' },
        { _id: 'job3', title: 'Job 3', company: {}, location: '' }
      ];

      notificationService.createNotification.mockResolvedValue({});

      // Act
      await alertService.sendAlert(userId, savedSearch, newJobs);

      // Assert
      const callArgs = notificationService.createNotification.mock.calls[0][0];
      
      expect(callArgs.relatedData.jobPostings).toEqual(['job1', 'job2', 'job3']);
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      const userId = 'user123';
      const savedSearch = {
        _id: 'search123',
        name: 'مطور',
        userId,
        searchParams: {}
      };

      const newJobs = [
        { _id: 'job1', title: 'Job 1', company: {}, location: '' }
      ];

      notificationService.createNotification.mockRejectedValue(
        new Error('Database error')
      );

      // Act & Assert
      await expect(
        alertService.sendAlert(userId, savedSearch, newJobs)
      ).rejects.toThrow('Database error');
    });
  });

  describe('URL Format Validation', () => {
    it('should generate correct URL format for job links', async () => {
      // Arrange
      const userId = 'user123';
      const savedSearch = {
        _id: 'search123',
        name: 'مطور',
        userId,
        searchParams: {}
      };

      const jobId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId
      const newJobs = [
        {
          _id: jobId,
          title: 'مطور',
          company: { name: 'شركة' },
          location: 'القاهرة'
        }
      ];

      notificationService.createNotification.mockResolvedValue({});

      // Act
      await alertService.sendAlert(userId, savedSearch, newJobs);

      // Assert
      const callArgs = notificationService.createNotification.mock.calls[0][0];
      const link = callArgs.relatedData.jobLinks[0];
      
      // التحقق من صيغة الرابط
      expect(link.jobUrl).toMatch(/^\/job-postings\/[a-f0-9]{24}$/);
      expect(link.jobUrl).toBe(`/job-postings/${jobId}`);
    });

    it('should handle special characters in job titles', async () => {
      // Arrange
      const userId = 'user123';
      const savedSearch = {
        _id: 'search123',
        name: 'مطور',
        userId,
        searchParams: {}
      };

      const newJobs = [
        {
          _id: 'job1',
          title: 'مطور Full-Stack (React & Node.js)',
          company: { name: 'شركة ABC' },
          location: 'القاهرة'
        }
      ];

      notificationService.createNotification.mockResolvedValue({});

      // Act
      await alertService.sendAlert(userId, savedSearch, newJobs);

      // Assert
      const callArgs = notificationService.createNotification.mock.calls[0][0];
      const link = callArgs.relatedData.jobLinks[0];
      
      // يجب أن يحتفظ بالعنوان كما هو
      expect(link.jobTitle).toBe('مطور Full-Stack (React & Node.js)');
    });
  });

  describe('Multiple Jobs Handling', () => {
    it('should handle 10 jobs correctly', async () => {
      // Arrange
      const userId = 'user123';
      const savedSearch = {
        _id: 'search123',
        name: 'مطور',
        userId,
        searchParams: {}
      };

      const newJobs = Array.from({ length: 10 }, (_, i) => ({
        _id: `job${i + 1}`,
        title: `مطور ${i + 1}`,
        company: { name: `شركة ${i + 1}` },
        location: `مدينة ${i + 1}`
      }));

      notificationService.createNotification.mockResolvedValue({});

      // Act
      await alertService.sendAlert(userId, savedSearch, newJobs);

      // Assert
      const callArgs = notificationService.createNotification.mock.calls[0][0];
      
      expect(callArgs.relatedData.jobLinks).toHaveLength(10);
      expect(callArgs.message).toContain('10 وظيفة جديدة');
      
      // التحقق من أن كل رابط فريد
      const urls = callArgs.relatedData.jobLinks.map(link => link.jobUrl);
      const uniqueUrls = new Set(urls);
      expect(uniqueUrls.size).toBe(10);
    });

    it('should handle single job correctly', async () => {
      // Arrange
      const userId = 'user123';
      const savedSearch = {
        _id: 'search123',
        name: 'مطور',
        userId,
        searchParams: {}
      };

      const newJobs = [
        {
          _id: 'job1',
          title: 'مطور',
          company: { name: 'شركة' },
          location: 'القاهرة'
        }
      ];

      notificationService.createNotification.mockResolvedValue({});

      // Act
      await alertService.sendAlert(userId, savedSearch, newJobs);

      // Assert
      const callArgs = notificationService.createNotification.mock.calls[0][0];
      
      expect(callArgs.relatedData.jobLinks).toHaveLength(1);
      expect(callArgs.message).toContain('1 وظيفة جديدة');
    });
  });
});
