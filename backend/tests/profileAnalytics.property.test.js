const fc = require('fast-check');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { trackView, getAnalytics } = require('../src/services/profileAnalyticsService');
const ProfileView = require('../models/ProfileView');

describe('Profile Analytics Property Tests', () => {
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
    await ProfileView.deleteMany({});
  });

  it('Property 11: Analytics Accuracy - each tracked view should increment total count by exactly 1', async () => {
    const profileUserId = new mongoose.Types.ObjectId();

    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 1, max: 50 }), async (numViews) => {
        // Reset state for each property run
        await ProfileView.deleteMany({});

        // Simulate multiple views
        for (let i = 0; i < numViews; i++) {
          await trackView(profileUserId, {
            viewerUserId: new mongoose.Types.ObjectId(),
            viewerType: 'user',
            deviceType: 'desktop'
          });
        }

        const analytics = await getAnalytics(profileUserId.toString(), '30');
        expect(analytics.summary.totalViews).toBe(numViews);
      }),
      { numRuns: 10 }
    );
  });

  it('should correctly filter views within the specified period', async () => {
    const userId = new mongoose.Types.ObjectId();
    const now = new Date();

    // View from 40 days ago
    const oldDate = new Date();
    oldDate.setDate(now.getDate() - 40);

    await new ProfileView({
      profileUserId: userId,
      timestamp: oldDate,
      viewerType: 'user'
    }).save();

    // View from today
    await trackView(userId, { viewerType: 'user' });

    const analytics = await getAnalytics(userId.toString(), '30');
    expect(analytics.summary.totalViews).toBe(1); // Should only count the recent one
  });
});
