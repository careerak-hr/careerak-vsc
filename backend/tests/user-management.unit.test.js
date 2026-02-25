const mongoose = require('mongoose');
const { User, Individual, Company } = require('../src/models/User');
const userManagementService = require('../src/services/userManagementService');
const ActivityLog = require('../src/models/ActivityLog');
const JobApplication = require('../src/models/JobApplication');
const JobPosting = require('../src/models/JobPosting');
const Review = require('../src/models/Review');

/**
 * Unit Tests for User Management Service
 * 
 * Tests specific examples and edge cases:
 * - Search with special characters
 * - Filter with multiple criteria
 * - Delete with related data cleanup
 */

describe('User Management Unit Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await User.deleteMany({});
    await ActivityLog.deleteMany({});
    await JobApplication.deleteMany({});
    await JobPosting.deleteMany({});
    await Review.deleteMany({});
  });

  /**
   * Test: Search with special characters
   * Requirements: 8.1
   */
  describe('Search with special characters', () => {
    test('should handle email with special characters', async () => {
      // Create user with special characters in email
      const user = await Individual.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe+test@example.com',
        password: 'password123',
        phone: '+201234567890',
        role: 'Employee'
      });

      // Search for email with special characters
      const result = await userManagementService.searchUsers('john.doe+test');

      expect(result.users.length).toBe(1);
      expect(result.users[0]._id.toString()).toBe(user._id.toString());
    });

    test('should handle phone with special characters', async () => {
      // Create user with phone containing special characters
      const user = await Individual.create({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'password123',
        phone: '+20-123-456-7890',
        role: 'Employee'
      });

      // Search for phone with special characters
      const result = await userManagementService.searchUsers('+20-123');

      expect(result.users.length).toBe(1);
      expect(result.users[0]._id.toString()).toBe(user._id.toString());
    });

    test('should handle name with special characters', async () => {
      // Create user with special characters in name
      const user = await Individual.create({
        firstName: "O'Brien",
        lastName: 'Smith-Jones',
        email: 'obrien@example.com',
        password: 'password123',
        phone: '+201234567890',
        role: 'Employee'
      });

      // Search for name with apostrophe
      const result1 = await userManagementService.searchUsers("O'Brien");
      expect(result1.users.length).toBe(1);

      // Search for name with hyphen
      const result2 = await userManagementService.searchUsers('Smith-Jones');
      expect(result2.users.length).toBe(1);
    });

    test('should handle regex special characters safely', async () => {
      // Create user
      await Individual.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        phone: '+201234567890',
        role: 'Employee'
      });

      // Search with regex special characters (should not break)
      const specialChars = ['.', '*', '+', '?', '^', '$', '(', ')', '[', ']', '{', '}', '|', '\\'];
      
      for (const char of specialChars) {
        const result = await userManagementService.searchUsers(`test${char}`);
        // Should not throw error and return results
        expect(result).toBeDefined();
        expect(result.users).toBeDefined();
      }
    });
  });

  /**
   * Test: Filter with multiple criteria
   * Requirements: 8.2
   */
  describe('Filter with multiple criteria', () => {
    beforeEach(async () => {
      // Create diverse set of users
      await Individual.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '+201234567890',
        role: 'Employee',
        country: 'Egypt',
        isVerified: true,
        emailVerified: true,
        isSpecialNeeds: false,
        twoFactorEnabled: false
      });

      await Individual.create({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'password123',
        phone: '+201234567891',
        role: 'Employee',
        country: 'Egypt',
        isVerified: false,
        emailVerified: false,
        isSpecialNeeds: true,
        twoFactorEnabled: false
      });

      await Company.create({
        companyName: 'Tech Corp',
        companyIndustry: 'Technology',
        email: 'tech@example.com',
        password: 'password123',
        phone: '+201234567892',
        role: 'HR',
        country: 'Saudi Arabia',
        isVerified: true,
        emailVerified: true,
        twoFactorEnabled: true
      });

      await Individual.create({
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob@example.com',
        password: 'password123',
        phone: '+201234567893',
        role: 'Employee',
        country: 'UAE',
        isVerified: true,
        emailVerified: false,
        isSpecialNeeds: false,
        twoFactorEnabled: true
      });
    });

    test('should filter by single criterion', async () => {
      // Filter by type
      const result1 = await userManagementService.filterUsers({ type: 'Employee' });
      expect(result1.users.length).toBe(3);

      // Filter by country
      const result2 = await userManagementService.filterUsers({ country: 'Egypt' });
      expect(result2.users.length).toBe(2);

      // Filter by verification status
      const result3 = await userManagementService.filterUsers({ isVerified: true });
      expect(result3.users.length).toBe(3);
    });

    test('should filter by multiple criteria (AND logic)', async () => {
      // Filter by type AND country
      const result1 = await userManagementService.filterUsers({
        type: 'Employee',
        country: 'Egypt'
      });
      expect(result1.users.length).toBe(2);

      // Filter by type AND verification AND 2FA
      const result2 = await userManagementService.filterUsers({
        type: 'Employee',
        isVerified: true,
        twoFactorEnabled: true
      });
      expect(result2.users.length).toBe(1);
      expect(result2.users[0].firstName).toBe('Bob');

      // Filter by special needs AND country
      const result3 = await userManagementService.filterUsers({
        isSpecialNeeds: true,
        country: 'Egypt'
      });
      expect(result3.users.length).toBe(1);
      expect(result3.users[0].firstName).toBe('Jane');
    });

    test('should filter by date range', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // All users created today
      const result1 = await userManagementService.filterUsers({
        startDate: yesterday.toISOString(),
        endDate: tomorrow.toISOString()
      });
      expect(result1.users.length).toBe(4);

      // No users created in the future
      const result2 = await userManagementService.filterUsers({
        startDate: tomorrow.toISOString()
      });
      expect(result2.users.length).toBe(0);
    });

    test('should combine filters with date range', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Filter by type, country, and date range
      const result = await userManagementService.filterUsers({
        type: 'Employee',
        country: 'Egypt',
        isVerified: true,
        startDate: yesterday.toISOString(),
        endDate: tomorrow.toISOString()
      });

      expect(result.users.length).toBe(1);
      expect(result.users[0].firstName).toBe('John');
    });

    test('should return empty results when no match', async () => {
      // Filter with impossible combination
      const result = await userManagementService.filterUsers({
        type: 'Employee',
        country: 'NonExistentCountry'
      });

      expect(result.users.length).toBe(0);
      expect(result.pagination.total).toBe(0);
    });

    test('should support sorting', async () => {
      // Sort by createdAt ascending
      const result1 = await userManagementService.filterUsers({}, {
        sortBy: 'createdAt',
        sortOrder: 'asc'
      });
      expect(result1.users.length).toBe(4);

      // Sort by email descending
      const result2 = await userManagementService.filterUsers({}, {
        sortBy: 'email',
        sortOrder: 'desc'
      });
      expect(result2.users.length).toBe(4);
    });

    test('should support pagination', async () => {
      // Page 1 with limit 2
      const result1 = await userManagementService.filterUsers({}, {
        page: 1,
        limit: 2
      });
      expect(result1.users.length).toBe(2);
      expect(result1.pagination.page).toBe(1);
      expect(result1.pagination.totalPages).toBe(2);
      expect(result1.pagination.hasMore).toBe(true);

      // Page 2 with limit 2
      const result2 = await userManagementService.filterUsers({}, {
        page: 2,
        limit: 2
      });
      expect(result2.users.length).toBe(2);
      expect(result2.pagination.page).toBe(2);
      expect(result2.pagination.hasMore).toBe(false);
    });
  });

  /**
   * Test: Delete with related data cleanup
   * Requirements: 8.7
   */
  describe('Delete with related data cleanup', () => {
    test('should delete employee and their job applications', async () => {
      // Create employee
      const employee = await Individual.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '+201234567890',
        role: 'Employee'
      });

      // Create company
      const company = await Company.create({
        companyName: 'Tech Corp',
        companyIndustry: 'Technology',
        email: 'tech@example.com',
        password: 'password123',
        phone: '+201234567891',
        role: 'HR'
      });

      // Create job posting
      const job = await JobPosting.create({
        companyId: company._id,
        title: 'Software Engineer',
        description: 'Great job',
        requirements: 'Experience required',
        location: 'Cairo',
        salary: '10000',
        jobType: 'full-time'
      });

      // Create job applications
      await JobApplication.create({
        applicantId: employee._id,
        jobId: job._id,
        status: 'pending'
      });

      await JobApplication.create({
        applicantId: employee._id,
        jobId: job._id,
        status: 'reviewed'
      });

      // Verify applications exist
      const applicationsBefore = await JobApplication.countDocuments({ applicantId: employee._id });
      expect(applicationsBefore).toBe(2);

      // Create admin
      const admin = await Individual.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'password123',
        phone: '+201234567892',
        role: 'Admin'
      });

      // Delete employee
      await userManagementService.deleteUserAccount(
        employee._id.toString(),
        admin._id.toString(),
        'Test deletion',
        '127.0.0.1'
      );

      // Verify user is deleted
      const userExists = await User.findById(employee._id);
      expect(userExists).toBeNull();

      // Verify applications are deleted
      const applicationsAfter = await JobApplication.countDocuments({ applicantId: employee._id });
      expect(applicationsAfter).toBe(0);

      // Verify activity log was created
      const activityLog = await ActivityLog.findOne({
        actorId: admin._id,
        targetId: employee._id,
        actionType: 'content_deleted'
      });
      expect(activityLog).toBeDefined();
      expect(activityLog.details).toContain('deleted');
    });

    test('should delete HR and their job postings', async () => {
      // Create company
      const company = await Company.create({
        companyName: 'Tech Corp',
        companyIndustry: 'Technology',
        email: 'tech@example.com',
        password: 'password123',
        phone: '+201234567890',
        role: 'HR'
      });

      // Create job postings
      await JobPosting.create({
        companyId: company._id,
        title: 'Software Engineer',
        description: 'Great job',
        requirements: 'Experience required',
        location: 'Cairo',
        salary: '10000',
        jobType: 'full-time'
      });

      await JobPosting.create({
        companyId: company._id,
        title: 'Product Manager',
        description: 'Lead products',
        requirements: 'Leadership required',
        location: 'Cairo',
        salary: '15000',
        jobType: 'full-time'
      });

      // Verify postings exist
      const postingsBefore = await JobPosting.countDocuments({ companyId: company._id });
      expect(postingsBefore).toBe(2);

      // Create admin
      const admin = await Individual.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'password123',
        phone: '+201234567891',
        role: 'Admin'
      });

      // Delete company
      await userManagementService.deleteUserAccount(
        company._id.toString(),
        admin._id.toString(),
        'Company closed',
        '127.0.0.1'
      );

      // Verify user is deleted
      const userExists = await User.findById(company._id);
      expect(userExists).toBeNull();

      // Verify postings are deleted
      const postingsAfter = await JobPosting.countDocuments({ companyId: company._id });
      expect(postingsAfter).toBe(0);
    });

    test('should delete user and their reviews', async () => {
      // Create two users
      const user1 = await Individual.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '+201234567890',
        role: 'Employee'
      });

      const user2 = await Individual.create({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'password123',
        phone: '+201234567891',
        role: 'Employee'
      });

      // Create reviews (user1 reviews user2 and vice versa)
      await Review.create({
        reviewerId: user1._id,
        revieweeId: user2._id,
        rating: 5,
        comment: 'Great person'
      });

      await Review.create({
        reviewerId: user2._id,
        revieweeId: user1._id,
        rating: 4,
        comment: 'Good person'
      });

      // Verify reviews exist
      const reviewsBefore = await Review.countDocuments({
        $or: [
          { reviewerId: user1._id },
          { revieweeId: user1._id }
        ]
      });
      expect(reviewsBefore).toBe(2);

      // Create admin
      const admin = await Individual.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'password123',
        phone: '+201234567892',
        role: 'Admin'
      });

      // Delete user1
      await userManagementService.deleteUserAccount(
        user1._id.toString(),
        admin._id.toString(),
        'Test deletion',
        '127.0.0.1'
      );

      // Verify reviews involving user1 are deleted
      const reviewsAfter = await Review.countDocuments({
        $or: [
          { reviewerId: user1._id },
          { revieweeId: user1._id }
        ]
      });
      expect(reviewsAfter).toBe(0);
    });

    test('should handle deletion of user with no related data', async () => {
      // Create user with no related data
      const user = await Individual.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '+201234567890',
        role: 'Employee'
      });

      // Create admin
      const admin = await Individual.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'password123',
        phone: '+201234567891',
        role: 'Admin'
      });

      // Delete user
      const result = await userManagementService.deleteUserAccount(
        user._id.toString(),
        admin._id.toString(),
        'Test deletion',
        '127.0.0.1'
      );

      // Verify deletion was successful
      expect(result.success).toBe(true);
      expect(result.deletedUser.email).toBe('john@example.com');

      // Verify user is deleted
      const userExists = await User.findById(user._id);
      expect(userExists).toBeNull();
    });

    test('should throw error when deleting non-existent user', async () => {
      // Create admin
      const admin = await Individual.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'password123',
        phone: '+201234567890',
        role: 'Admin'
      });

      // Try to delete non-existent user
      const fakeUserId = new mongoose.Types.ObjectId();

      await expect(
        userManagementService.deleteUserAccount(
          fakeUserId.toString(),
          admin._id.toString(),
          'Test deletion',
          '127.0.0.1'
        )
      ).rejects.toThrow('User not found');
    });
  });
});
