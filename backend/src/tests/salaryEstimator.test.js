const salaryEstimatorService = require('../services/salaryEstimatorService');
const SalaryData = require('../models/SalaryData');
const JobPosting = require('../models/JobPosting');

describe('SalaryEstimatorService', () => {
  describe('estimateSalary', () => {
    it('should return null if job has no salary', async () => {
      const job = {
        _id: 'test-job-1',
        title: 'Software Engineer',
        field: 'Technology',
        location: { city: 'Riyadh' },
        experienceLevel: 'mid',
        salary: 0
      };

      const result = await salaryEstimatorService.estimateSalary(job);
      expect(result).toBeNull();
    });

    it('should return null if insufficient salary data (< 5 jobs)', async () => {
      const job = {
        _id: 'test-job-2',
        title: 'Software Engineer',
        field: 'Technology',
        location: { city: 'Riyadh' },
        experienceLevel: 'mid',
        salary: 8000
      };

      // Mock SalaryData.findOne to return data with count < 5
      jest.spyOn(SalaryData, 'findOne').mockResolvedValue({
        statistics: {
          average: 10000,
          min: 7000,
          max: 15000,
          count: 3 // Less than 5
        }
      });

      const result = await salaryEstimatorService.estimateSalary(job);
      expect(result).toBeNull();

      SalaryData.findOne.mockRestore();
    });

    it('should return "below" comparison when salary < average * 0.9', async () => {
      const job = {
        _id: 'test-job-3',
        title: 'Software Engineer',
        field: 'Technology',
        location: { city: 'Riyadh' },
        experienceLevel: 'mid',
        salary: 7000 // Below 10000 * 0.9 = 9000
      };

      jest.spyOn(SalaryData, 'findOne').mockResolvedValue({
        statistics: {
          average: 10000,
          min: 7000,
          max: 15000,
          count: 10
        }
      });

      const result = await salaryEstimatorService.estimateSalary(job);
      
      expect(result).not.toBeNull();
      expect(result.comparison).toBe('below');
      expect(result.percentageDiff).toBeGreaterThan(0);
      expect(result.provided).toBe(7000);
      expect(result.market.average).toBe(10000);

      SalaryData.findOne.mockRestore();
    });

    it('should return "above" comparison when salary > average * 1.1', async () => {
      const job = {
        _id: 'test-job-4',
        title: 'Software Engineer',
        field: 'Technology',
        location: { city: 'Riyadh' },
        experienceLevel: 'mid',
        salary: 13000 // Above 10000 * 1.1 = 11000
      };

      jest.spyOn(SalaryData, 'findOne').mockResolvedValue({
        statistics: {
          average: 10000,
          min: 7000,
          max: 15000,
          count: 10
        }
      });

      const result = await salaryEstimatorService.estimateSalary(job);
      
      expect(result).not.toBeNull();
      expect(result.comparison).toBe('above');
      expect(result.percentageDiff).toBeGreaterThan(0);
      expect(result.provided).toBe(13000);

      SalaryData.findOne.mockRestore();
    });

    it('should return "average" comparison when salary is within range', async () => {
      const job = {
        _id: 'test-job-5',
        title: 'Software Engineer',
        field: 'Technology',
        location: { city: 'Riyadh' },
        experienceLevel: 'mid',
        salary: 10000 // Within 9000-11000 range
      };

      jest.spyOn(SalaryData, 'findOne').mockResolvedValue({
        statistics: {
          average: 10000,
          min: 7000,
          max: 15000,
          count: 10
        }
      });

      const result = await salaryEstimatorService.estimateSalary(job);
      
      expect(result).not.toBeNull();
      expect(result.comparison).toBe('average');
      expect(result.percentageDiff).toBe(0);

      SalaryData.findOne.mockRestore();
    });

    it('should calculate percentageDiff correctly for below comparison', async () => {
      const job = {
        _id: 'test-job-6',
        title: 'Software Engineer',
        field: 'Technology',
        location: { city: 'Riyadh' },
        experienceLevel: 'mid',
        salary: 8000
      };

      jest.spyOn(SalaryData, 'findOne').mockResolvedValue({
        statistics: {
          average: 10000,
          min: 7000,
          max: 15000,
          count: 10
        }
      });

      const result = await salaryEstimatorService.estimateSalary(job);
      
      // (10000 - 8000) / 10000 * 100 = 20%
      expect(result.percentageDiff).toBe(20);

      SalaryData.findOne.mockRestore();
    });

    it('should calculate percentageDiff correctly for above comparison', async () => {
      const job = {
        _id: 'test-job-7',
        title: 'Software Engineer',
        field: 'Technology',
        location: { city: 'Riyadh' },
        experienceLevel: 'mid',
        salary: 12000
      };

      jest.spyOn(SalaryData, 'findOne').mockResolvedValue({
        statistics: {
          average: 10000,
          min: 7000,
          max: 15000,
          count: 10
        }
      });

      const result = await salaryEstimatorService.estimateSalary(job);
      
      // (12000 - 10000) / 10000 * 100 = 20%
      expect(result.percentageDiff).toBe(20);

      SalaryData.findOne.mockRestore();
    });
  });

  describe('updateSalaryData', () => {
    it('should group jobs correctly by title, field, location, and experience', async () => {
      const mockJobs = [
        {
          _id: 'job1',
          title: 'Software Engineer',
          field: 'Technology',
          location: { city: 'Riyadh' },
          experienceLevel: 'mid',
          salary: 10000
        },
        {
          _id: 'job2',
          title: 'Software Engineer',
          field: 'Technology',
          location: { city: 'Riyadh' },
          experienceLevel: 'mid',
          salary: 11000
        },
        {
          _id: 'job3',
          title: 'Software Engineer',
          field: 'Technology',
          location: { city: 'Riyadh' },
          experienceLevel: 'mid',
          salary: 9000
        }
      ];

      jest.spyOn(JobPosting, 'find').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockJobs)
      });

      jest.spyOn(SalaryData, 'findOneAndUpdate').mockResolvedValue({
        isNew: false
      });

      const result = await salaryEstimatorService.updateSalaryData();

      expect(result.success).toBe(true);
      expect(result.totalJobs).toBe(3);
      expect(SalaryData.findOneAndUpdate).toHaveBeenCalled();

      JobPosting.find.mockRestore();
      SalaryData.findOneAndUpdate.mockRestore();
    });

    it('should calculate statistics correctly', async () => {
      const mockJobs = [
        {
          _id: 'job1',
          title: 'Software Engineer',
          field: 'Technology',
          location: { city: 'Riyadh' },
          experienceLevel: 'mid',
          salary: 8000
        },
        {
          _id: 'job2',
          title: 'Software Engineer',
          field: 'Technology',
          location: { city: 'Riyadh' },
          experienceLevel: 'mid',
          salary: 10000
        },
        {
          _id: 'job3',
          title: 'Software Engineer',
          field: 'Technology',
          location: { city: 'Riyadh' },
          experienceLevel: 'mid',
          salary: 12000
        }
      ];

      jest.spyOn(JobPosting, 'find').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockJobs)
      });

      let capturedStatistics = null;
      jest.spyOn(SalaryData, 'findOneAndUpdate').mockImplementation((query, update) => {
        capturedStatistics = update.statistics;
        return Promise.resolve({ isNew: false });
      });

      await salaryEstimatorService.updateSalaryData();

      expect(capturedStatistics).not.toBeNull();
      expect(capturedStatistics.average).toBe(10000); // (8000 + 10000 + 12000) / 3
      expect(capturedStatistics.min).toBe(8000);
      expect(capturedStatistics.max).toBe(12000);
      expect(capturedStatistics.median).toBe(10000);
      expect(capturedStatistics.count).toBe(3);

      JobPosting.find.mockRestore();
      SalaryData.findOneAndUpdate.mockRestore();
    });

    it('should skip groups with less than 3 jobs', async () => {
      const mockJobs = [
        {
          _id: 'job1',
          title: 'Software Engineer',
          field: 'Technology',
          location: { city: 'Riyadh' },
          experienceLevel: 'mid',
          salary: 10000
        },
        {
          _id: 'job2',
          title: 'Software Engineer',
          field: 'Technology',
          location: { city: 'Riyadh' },
          experienceLevel: 'mid',
          salary: 11000
        }
      ];

      jest.spyOn(JobPosting, 'find').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockJobs)
      });

      jest.spyOn(SalaryData, 'findOneAndUpdate').mockResolvedValue({
        isNew: false
      });

      const result = await salaryEstimatorService.updateSalaryData();

      // Should not call findOneAndUpdate because group has < 3 jobs
      expect(SalaryData.findOneAndUpdate).not.toHaveBeenCalled();

      JobPosting.find.mockRestore();
      SalaryData.findOneAndUpdate.mockRestore();
    });
  });
});
