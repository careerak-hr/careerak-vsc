const SkillLevel = require('../models/SkillLevel');
const profileCompletionService = require('./profileCompletionService');

/**
 * Advanced Skills Service - Manage skills with proficiency levels
 * Requirements: 7.1, 7.2, 7.3
 */

const addOrUpdateSkill = async (userId, skillData) => {
  const { name, level, category, yearsOfExperience } = skillData;

  // Map level to percentage for visual progress
  const levelMap = {
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 100
  };

  const levelPercentage = levelMap[level] || 25;

  let skillRecord = await SkillLevel.findOne({ userId });

  if (!skillRecord) {
    skillRecord = new SkillLevel({ userId, skills: [] });
  }

  // Check if skill already exists
  const existingIndex = skillRecord.skills.findIndex(s => s.name.toLowerCase() === name.toLowerCase());

  if (existingIndex > -1) {
    // Update existing
    skillRecord.skills[existingIndex] = {
      ...skillRecord.skills[existingIndex],
      level,
      levelPercentage,
      category,
      yearsOfExperience
    };
  } else {
    // Add new (Limit to 20 skills as per Requirements 7.5)
    if (skillRecord.skills.length >= 20) {
      throw new Error('تم الوصول للحد الأقصى للمهارات (20 مهارة)');
    }
    skillRecord.skills.push({ name, level, levelPercentage, category, yearsOfExperience });
  }

  await skillRecord.save();

  // Recalculate profile completion
  await profileCompletionService.calculateCompletion(userId);

  return skillRecord;
};

const deleteSkill = async (userId, skillName) => {
  const result = await SkillLevel.findOneAndUpdate(
    { userId },
    { $pull: { skills: { name: skillName } } },
    { new: true }
  );

  await profileCompletionService.calculateCompletion(userId);
  return result;
};

const getUserSkills = async (userId) => {
  return await SkillLevel.findOne({ userId });
};

module.exports = {
  addOrUpdateSkill,
  getUserSkills,
  deleteSkill
};
