const fc = require('fast-check');
const { calculateCompletion } = require('../src/services/profileCompletionService');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { Individual } = require('../src/models/User');
const SkillLevel = require('../src/models/SkillLevel');
const PortfolioItem = require('../src/models/PortfolioItem');
const SocialLink = require('../src/models/SocialLink');
const ProfileCompletion = require('../src/models/ProfileCompletion');

describe('Profile Completion Property Tests', () => {
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
    await Individual.deleteMany({});
    await SkillLevel.deleteMany({});
    await PortfolioItem.deleteMany({});
    await SocialLink.deleteMany({});
    await ProfileCompletion.deleteMany({});
  });

  it('Property 1 & 2: Completion Percentage Accuracy and Range', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          hasImage: fc.boolean(),
          bioLength: fc.integer({ min: 0, max: 200 }),
          skillsCount: fc.integer({ min: 0, max: 10 }),
          experienceCount: fc.integer({ min: 0, max: 5 }),
          educationCount: fc.integer({ min: 0, max: 5 }),
          portfolioCount: fc.integer({ min: 0, max: 5 }),
          socialLinksCount: fc.integer({ min: 0, max: 5 }),
          trainingCount: fc.integer({ min: 0, max: 5 })
        }),
        async (profile) => {
          const userId = new mongoose.Types.ObjectId();

          // Setup DB state based on generated profile
          await new Individual({
            _id: userId,
            firstName: 'Test',
            lastName: 'User',
            phone: Math.random().toString(),
            profileImage: profile.hasImage ? 'image.jpg' : null,
            bio: 'a'.repeat(profile.bioLength),
            experienceList: Array(profile.experienceCount).fill({ company: 'Test' }),
            educationList: Array(profile.educationCount).fill({ level: 'Test' }),
            trainingList: Array(profile.trainingCount).fill({ courseName: 'Test' })
          }).save();

          if (profile.skillsCount > 0) {
            await new SkillLevel({
              userId,
              skills: Array(profile.skillsCount).fill({ name: 'Skill', level: 'beginner' })
            }).save();
          }

          if (profile.portfolioCount > 0) {
            for (let i = 0; i < profile.portfolioCount; i++) {
              await new PortfolioItem({ userId, title: 'Project', type: 'link' }).save();
            }
          }

          if (profile.socialLinksCount > 0) {
            for (let i = 0; i < profile.socialLinksCount; i++) {
              try {
                await new SocialLink({
                  userId,
                  platform: ['linkedin', 'github', 'behance', 'twitter', 'website'][i % 5],
                  url: 'http://test.com'
                }).save();
              } catch (e) { /* ignore duplicate platform errors in test setup */ }
            }
          }

          const result = await calculateCompletion(userId);

          // Validate Range (Property 2)
          expect(result.completionPercentage).toBeGreaterThanOrEqual(0);
          expect(result.completionPercentage).toBeLessThanOrEqual(100);

          // Validate Accuracy (Property 1)
          let expectedScore = 0;
          if (profile.hasImage) expectedScore += 10;
          if (profile.bioLength >= 100) expectedScore += 15;
          if (profile.skillsCount >= 5) expectedScore += 20;
          if (profile.experienceCount >= 1) expectedScore += 20;
          if (profile.educationCount >= 1) expectedScore += 15;
          if (profile.portfolioCount >= 1) expectedScore += 10;

          // Actual social links count might be lower due to uniqueness per platform
          const actualSocialLinks = await SocialLink.countDocuments({ userId });
          if (actualSocialLinks >= 2) expectedScore += 5;

          if (profile.trainingCount >= 1) expectedScore += 5;

          expect(result.completionPercentage).toBe(expectedScore);
        }
      ),
      { numRuns: 20 }
    );
  });
});
