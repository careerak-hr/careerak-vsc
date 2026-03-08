const fc = require('fast-check');
const { getProfilePreview } = require('../src/services/profilePreviewService');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { Individual } = require('../src/models/User');
const ProfileCompletion = require('../src/models/ProfileCompletion');

describe('Profile Preview Property Tests', () => {
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
  });

  it('Property 10: Preview Privacy - sensitive information should be masked', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 10, maxLength: 15 }),
        async (email, phone) => {
          const userId = new mongoose.Types.ObjectId();

          await new Individual({
            _id: userId,
            firstName: 'Private',
            lastName: 'User',
            email: email,
            phone: phone,
            bio: 'Test bio'
          }).save();

          // Create a mock completion to avoid service failure
          await new ProfileCompletion({
            userId,
            completionPercentage: 50,
            sections: {
              profilePicture: { completed: false, weight: 10 },
              about: { completed: true, weight: 15 },
              skills: { completed: false, weight: 20 },
              experience: { completed: false, weight: 20 },
              education: { completed: false, weight: 15 },
              portfolio: { completed: false, weight: 10 },
              socialLinks: { completed: false, weight: 5 },
              certifications: { completed: false, weight: 5 }
            }
          }).save();

          const preview = await getProfilePreview(userId);

          // Verify masking
          expect(preview.email).not.toBe(email);
          expect(preview.email).toContain('***');

          expect(preview.phone).not.toBe(phone);
          expect(preview.phone).toContain('***');
          expect(preview.phone.slice(-4)).toBe(phone.slice(-4));
        }
      ),
      { numRuns: 10 }
    );
  });
});
