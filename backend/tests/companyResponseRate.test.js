const companyResponseRateService = require('../src/services/companyResponseRateService');

describe('Company Response Rate Service', () => {
  describe('determineResponseLabel', () => {
    test('should return "fast" for quick responses with high percentage', () => {
      const label = companyResponseRateService.determineResponseLabel(24, 80);
      expect(label).toBe('fast');
    });

    test('should return "fast" for responses within 48 hours and 70%+ rate', () => {
      const label = companyResponseRateService.determineResponseLabel(48, 70);
      expect(label).toBe('fast');
    });

    test('should return "medium" for responses within 7 days and 50%+ rate', () => {
      const label = companyResponseRateService.determineResponseLabel(120, 60); // 5 days
      expect(label).toBe('medium');
    });

    test('should return "medium" for responses within 7 days at threshold', () => {
      const label = companyResponseRateService.determineResponseLabel(168, 50); // 7 days
      expect(label).toBe('medium');
    });

    test('should return "slow" for responses over 7 days', () => {
      const label = companyResponseRateService.determineResponseLabel(200, 60); // 8.3 days
      expect(label).toBe('slow');
    });

    test('should return "slow" for low response percentage', () => {
      const label = companyResponseRateService.determineResponseLabel(48, 40);
      expect(label).toBe('slow');
    });

    test('should return null for insufficient data (low percentage)', () => {
      const label = companyResponseRateService.determineResponseLabel(24, 15);
      expect(label).toBeNull();
    });

    test('should return null for no response time', () => {
      const label = companyResponseRateService.determineResponseLabel(null, 80);
      expect(label).toBeNull();
    });
  });

  describe('getResponseLabelText', () => {
    test('should return Arabic text for "fast"', () => {
      const text = companyResponseRateService.getResponseLabelText('fast');
      expect(text).toBe('استجابة سريعة');
    });

    test('should return Arabic text for "medium"', () => {
      const text = companyResponseRateService.getResponseLabelText('medium');
      expect(text).toBe('استجابة متوسطة');
    });

    test('should return Arabic text for "slow"', () => {
      const text = companyResponseRateService.getResponseLabelText('slow');
      expect(text).toBe('استجابة بطيئة');
    });

    test('should return default text for unknown label', () => {
      const text = companyResponseRateService.getResponseLabelText('unknown');
      expect(text).toBe('غير محدد');
    });
  });

  describe('getResponseLabelClass', () => {
    test('should return green classes for "fast"', () => {
      const className = companyResponseRateService.getResponseLabelClass('fast');
      expect(className).toBe('bg-green-100 text-green-800');
    });

    test('should return yellow classes for "medium"', () => {
      const className = companyResponseRateService.getResponseLabelClass('medium');
      expect(className).toBe('bg-yellow-100 text-yellow-800');
    });

    test('should return red classes for "slow"', () => {
      const className = companyResponseRateService.getResponseLabelClass('slow');
      expect(className).toBe('bg-red-100 text-red-800');
    });

    test('should return gray classes for unknown label', () => {
      const className = companyResponseRateService.getResponseLabelClass('unknown');
      expect(className).toBe('bg-gray-100 text-gray-800');
    });
  });

  describe('Response Rate Calculation Logic', () => {
    test('should classify 1-day response with 80% rate as fast', () => {
      const label = companyResponseRateService.determineResponseLabel(24, 80);
      expect(label).toBe('fast');
    });

    test('should classify 3-day response with 60% rate as medium', () => {
      const label = companyResponseRateService.determineResponseLabel(72, 60);
      expect(label).toBe('medium');
    });

    test('should classify 10-day response as slow regardless of percentage', () => {
      const label = companyResponseRateService.determineResponseLabel(240, 90);
      expect(label).toBe('slow');
    });

    test('should classify low response rate as slow regardless of time', () => {
      const label = companyResponseRateService.determineResponseLabel(24, 30);
      expect(label).toBe('slow');
    });
  });

  describe('Edge Cases', () => {
    test('should handle exactly 48 hours with 70% rate', () => {
      const label = companyResponseRateService.determineResponseLabel(48, 70);
      expect(label).toBe('fast');
    });

    test('should handle exactly 168 hours (7 days) with 50% rate', () => {
      const label = companyResponseRateService.determineResponseLabel(168, 50);
      expect(label).toBe('medium');
    });

    test('should handle 48.1 hours with 70% rate as medium', () => {
      const label = companyResponseRateService.determineResponseLabel(48.1, 70);
      expect(label).toBe('medium');
    });

    test('should handle 168.1 hours with 50% rate as slow', () => {
      const label = companyResponseRateService.determineResponseLabel(168.1, 50);
      expect(label).toBe('slow');
    });
  });
});
