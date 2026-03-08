const fc = require('fast-check');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { addOrUpdateSocialLink } = require('../src/services/socialLinkService');
const SocialLink = require('../src/models/SocialLink');

describe('Social Links Property Tests', () => {
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
    await SocialLink.deleteMany({});
  });

  it('Property 7: Social Link Uniqueness - should not allow duplicate platforms for same user', async () => {
    const userId = new mongoose.Types.ObjectId();
    const platform = 'linkedin';
    const url1 = 'https://linkedin.com/in/user1';
    const url2 = 'https://linkedin.com/in/user2';

    // Add first link
    await addOrUpdateSocialLink(userId, platform, url1);

    // Update same platform with new URL
    await addOrUpdateSocialLink(userId, platform, url2);

    const links = await SocialLink.find({ userId, platform });
    expect(links.length).toBe(1);
    expect(links[0].url).toBe(url2);
  });

  it('Property 8: URL Validation - should reject invalid URLs', async () => {
    const userId = new mongoose.Types.ObjectId();
    const platform = 'github';

    const invalidUrls = ['not-a-url', 'ftp://github.com', 'http//missing-colon', 'github.com'];

    for (const url of invalidUrls) {
      await expect(addOrUpdateSocialLink(userId, platform, url))
        .rejects.toThrow('رابط غير صالح');
    }
  });

  it('should accept valid professional URLs', async () => {
    const userId = new mongoose.Types.ObjectId();
    const validUrls = [
      'https://github.com/username',
      'http://myportfolio.me',
      'https://linkedin.com/in/professional'
    ];

    for (const url of validUrls) {
      const result = await addOrUpdateSocialLink(userId, 'github', url);
      expect(result.url).toBe(url);
    }
  });
});
