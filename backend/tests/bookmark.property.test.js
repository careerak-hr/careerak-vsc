const fc = require('fast-check');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bookmarkService = require('../src/services/bookmarkService');
const JobBookmark = require('../src/models/JobBookmark');
const JobPosting = require('../src/models/JobPosting');
const { User } = require('../src/models/User');

describe('Bookmark System Property Tests', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await JobBookmark.deleteMany({});
    await JobPosting.deleteMany({});
    await User.deleteMany({});
  });

  it('Property 1: Bookmark Uniqueness - a user cannot bookmark the same job multiple times', async () => {
    const userId = new mongoose.Types.ObjectId();
    const jobId = new mongoose.Types.ObjectId();

    // Create a dummy job
    await new JobPosting({
      _id: jobId,
      title: 'Test Job',
      description: 'Desc',
      requirements: 'Req',
      postedBy: new mongoose.Types.ObjectId(),
      bookmarkCount: 0
    }).save();

    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 2, max: 5 }), async (numToggles) => {
        // Toggle multiple times
        // If we toggle an even number of times starting from unbookmarked, result should be unbookmarked
        // If odd, bookmarked.
        // But the core property is that we shouldn't have duplicate records in DB.

        for (let i = 0; i < numToggles; i++) {
          await bookmarkService.toggleBookmark(userId, jobId);
        }

        const count = await JobBookmark.countDocuments({ user: userId, job: jobId });
        expect(count).toBeLessThanOrEqual(1);

        // Final state based on parity
        expect(count).toBe(numToggles % 2);
      }),
      { numRuns: 10 }
    );
  });

  it('Property 2: Bookmark Count Consistency - Job bookmarkCount must match total bookmarks', async () => {
    const jobId = new mongoose.Types.ObjectId();
    await new JobPosting({
      _id: jobId,
      title: 'Consistency Job',
      description: 'Desc',
      requirements: 'Req',
      postedBy: new mongoose.Types.ObjectId(),
      bookmarkCount: 0
    }).save();

    await fc.assert(
      fc.asyncProperty(fc.array(fc.uniqueArray(fc.string(), { minLength: 1, maxLength: 20 })), async (userIds) => {
        // Reset state
        await JobBookmark.deleteMany({ job: jobId });
        await JobPosting.findByIdAndUpdate(jobId, { bookmarkCount: 0 });

        // Bookmark with multiple unique users
        for (const idStr of userIds) {
          const uId = new mongoose.Types.ObjectId(); // Ensure valid Mongo ID
          await bookmarkService.toggleBookmark(uId, jobId);
        }

        const job = await JobPosting.findById(jobId);
        const actualCount = await JobBookmark.countDocuments({ job: jobId });

        expect(job.bookmarkCount).toBe(actualCount);
        expect(job.bookmarkCount).toBe(userIds.length);
      }),
      { numRuns: 5 }
    );
  });
});
