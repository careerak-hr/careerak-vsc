const fc = require('fast-check');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { addOrUpdateSkill } = require('../src/services/skillsService');
const SkillLevel = require('../src/models/SkillLevel');

describe('Skills Property Tests', () => {
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
    await SkillLevel.deleteMany({});
  });

  it('Property 9: Skill Level Consistency - percentage should match the level name', async () => {
    const userId = new mongoose.Types.ObjectId();
    const levels = [
      { id: 'beginner', expected: 25 },
      { id: 'intermediate', expected: 50 },
      { id: 'advanced', expected: 75 },
      { id: 'expert', expected: 100 }
    ];

    await fc.assert(
      fc.asyncProperty(fc.constantFrom(...levels), async (levelInfo) => {
        const skillData = {
          name: 'JavaScript',
          level: levelInfo.id,
          category: 'technical',
          yearsOfExperience: 5
        };

        const result = await addOrUpdateSkill(userId, skillData);
        const skill = result.skills.find(s => s.name === 'JavaScript');

        expect(skill.levelPercentage).toBe(levelInfo.expected);
      }),
      { numRuns: 10 }
    );
  });

  it('Property: Skill Limit - should not allow more than 20 skills', async () => {
    const userId = new mongoose.Types.ObjectId();

    // Add 20 skills
    for (let i = 0; i < 20; i++) {
      await addOrUpdateSkill(userId, {
        name: `Skill ${i}`,
        level: 'intermediate',
        category: 'technical'
      });
    }

    // Attempt to add 21st
    await expect(addOrUpdateSkill(userId, {
      name: 'Extra Skill',
      level: 'beginner',
      category: 'soft'
    })).rejects.toThrow('تم الوصول للحد الأقصى للمهارات');
  });
});
