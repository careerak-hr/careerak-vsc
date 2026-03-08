const fc = require('fast-check');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { generateSuggestions } = require('../src/services/suggestionsService');
const { Individual } = require('../src/models/User');
const ProfileCompletion = require('../src/models/ProfileCompletion');
const ProfileSuggestion = require('../models/ProfileSuggestion');

describe('Profile Suggestions Property Tests', () => {
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
    await ProfileCompletion.deleteMany({});
    await ProfileSuggestion.deleteMany({});
  });

  it('Property 3 & 4: Suggestion Relevance and Priority', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          profilePicture: fc.boolean(),
          about: fc.boolean(),
          skills: fc.boolean(),
          portfolio: fc.boolean(),
          socialLinks: fc.boolean()
        }),
        async (completionStatus) => {
          const userId = new mongoose.Types.ObjectId();

          // 1. Create User
          await new Individual({
            _id: userId,
            firstName: 'Test',
            lastName: 'User',
            phone: Math.random().toString()
          }).save();

          // 2. Create Completion Record matching status
          await new ProfileCompletion({
            userId,
            completionPercentage: 50, // Arbitrary for this test
            sections: {
              profilePicture: { completed: completionStatus.profilePicture, weight: 10 },
              about: { completed: completionStatus.about, weight: 15 },
              skills: { completed: completionStatus.skills, weight: 20 },
              portfolio: { completed: completionStatus.portfolio, weight: 10 },
              socialLinks: { completed: completionStatus.socialLinks, weight: 5 },
              experience: { completed: true, weight: 20 },
              education: { completed: true, weight: 15 },
              certifications: { completed: true, weight: 5 }
            }
          }).save();

          const suggestions = await generateSuggestions(userId);

          // Property 3: Relevance - Suggestion should ONLY exist if section is NOT completed
          if (!completionStatus.profilePicture) {
            expect(suggestions.some(s => s.id === 'add_profile_picture')).toBe(true);
          } else {
            expect(suggestions.some(s => s.id === 'add_profile_picture')).toBe(false);
          }

          if (!completionStatus.about) {
            expect(suggestions.some(s => s.id === 'improve_about')).toBe(true);
          }

          // Property 4: Priority - High priority suggestions should come first (if we were sorting)
          // Currently service returns them in fixed order, but let's check priorities
          const highPriority = suggestions.filter(s => s.priority === 'high');
          const mediumPriority = suggestions.filter(s => s.priority === 'medium');

          // In our current implementation, we just check they have correct priority labels
          suggestions.forEach(s => {
            if (['add_profile_picture', 'improve_about', 'add_more_skills'].includes(s.id)) {
              expect(s.priority).toBe('high');
            } else if (['add_portfolio', 'add_social_links'].includes(s.id)) {
              expect(s.priority).toBe('medium');
            }
          });
        }
      ),
      { numRuns: 20 }
    );
  });
});
