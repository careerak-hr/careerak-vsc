const { isJobNew, isJobUrgent, getTimeSincePosted, addComputedFields } = require('../src/utils/jobHelpers');

describe('Job Badges - Helper Functions', () => {
  describe('isJobNew', () => {
    test('should return true for job posted today', () => {
      const today = new Date();
      expect(isJobNew(today)).toBe(true);
    });
    
    test('should return true for job posted 2 days ago', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      expect(isJobNew(twoDaysAgo)).toBe(true);
    });
    
    test('should return true for job posted 3 days ago', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      expect(isJobNew(threeDaysAgo)).toBe(true);
    });
    
    test('should return false for job posted 4 days ago', () => {
      const fourDaysAgo = new Date();
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
      expect(isJobNew(fourDaysAgo)).toBe(false);
    });
    
    test('should return false for job posted 1 week ago', () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      expect(isJobNew(oneWeekAgo)).toBe(false);
    });
    
    test('should return false for null date', () => {
      expect(isJobNew(null)).toBe(false);
    });
    
    test('should return false for undefined date', () => {
      expect(isJobNew(undefined)).toBe(false);
    });
  });
  
  describe('isJobUrgent', () => {
    test('should return true for job expiring in 3 days', () => {
      const threeDaysLater = new Date();
      threeDaysLater.setDate(threeDaysLater.getDate() + 3);
      expect(isJobUrgent(threeDaysLater)).toBe(true);
    });
    
    test('should return true for job expiring in 7 days', () => {
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
      expect(isJobUrgent(sevenDaysLater)).toBe(true);
    });
    
    test('should return false for job expiring in 8 days', () => {
      const eightDaysLater = new Date();
      eightDaysLater.setDate(eightDaysLater.getDate() + 8);
      expect(isJobUrgent(eightDaysLater)).toBe(false);
    });
    
    test('should return false for expired job', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isJobUrgent(yesterday)).toBe(false);
    });
    
    test('should return false for null date', () => {
      expect(isJobUrgent(null)).toBe(false);
    });
  });
  
  describe('getTimeSincePosted', () => {
    test('should return "الآن" for job posted just now (Arabic)', () => {
      const now = new Date();
      const result = getTimeSincePosted(now, 'ar');
      expect(result).toBe('الآن');
    });
    
    test('should return "Just now" for job posted just now (English)', () => {
      const now = new Date();
      const result = getTimeSincePosted(now, 'en');
      expect(result).toBe('Just now');
    });
    
    test('should return correct format for 5 minutes ago (Arabic)', () => {
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      const result = getTimeSincePosted(fiveMinutesAgo, 'ar');
      expect(result).toContain('منذ');
      expect(result).toContain('دقائق');
    });
    
    test('should return correct format for 2 hours ago (Arabic)', () => {
      const twoHoursAgo = new Date();
      twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
      const result = getTimeSincePosted(twoHoursAgo, 'ar');
      expect(result).toContain('منذ');
      expect(result).toContain('ساعتين');
    });
    
    test('should return correct format for 3 days ago (Arabic)', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const result = getTimeSincePosted(threeDaysAgo, 'ar');
      expect(result).toContain('منذ');
      expect(result).toContain('أيام');
    });
    
    test('should return correct format for 2 weeks ago (English)', () => {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const result = getTimeSincePosted(twoWeeksAgo, 'en');
      expect(result).toContain('2 weeks ago');
    });
    
    test('should default to Arabic for unsupported language', () => {
      const now = new Date();
      const result = getTimeSincePosted(now, 'de');
      expect(result).toBe('الآن');
    });
    
    test('should return empty string for null date', () => {
      expect(getTimeSincePosted(null)).toBe('');
    });
  });
  
  describe('addComputedFields', () => {
    test('should add isNew and timeSincePosted fields', () => {
      const job = {
        _id: '123',
        title: 'Test Job',
        createdAt: new Date(),
        toObject: function() { return this; }
      };
      
      const result = addComputedFields(job);
      
      expect(result).toHaveProperty('isNew');
      expect(result).toHaveProperty('timeSincePosted');
      expect(result.timeSincePosted).toHaveProperty('ar');
      expect(result.timeSincePosted).toHaveProperty('en');
      expect(result.timeSincePosted).toHaveProperty('fr');
    });
    
    test('should work with plain objects', () => {
      const job = {
        _id: '123',
        title: 'Test Job',
        createdAt: new Date()
      };
      
      const result = addComputedFields(job);
      
      expect(result).toHaveProperty('isNew');
      expect(result).toHaveProperty('timeSincePosted');
    });
    
    test('should preserve original job fields', () => {
      const job = {
        _id: '123',
        title: 'Test Job',
        description: 'Test Description',
        createdAt: new Date(),
        toObject: function() { return this; }
      };
      
      const result = addComputedFields(job);
      
      expect(result._id).toBe('123');
      expect(result.title).toBe('Test Job');
      expect(result.description).toBe('Test Description');
    });
  });
});
