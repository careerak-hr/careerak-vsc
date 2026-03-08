const ProfileCompletion = require('../models/ProfileCompletion');
const { Individual } = require('../models/User');
const SkillLevel = require('../models/SkillLevel');
const PortfolioItem = require('../models/PortfolioItem');
const SocialLink = require('../models/SocialLink');

/**
 * Calculates profile completion percentage and status for each section.
 * Requirements: 1.1, 1.2, 1.3
 */
const calculateCompletion = async (userId) => {
  const user = await Individual.findById(userId);
  if (!user) return null;

  const skills = await SkillLevel.findOne({ userId });
  const portfolio = await PortfolioItem.countDocuments({ userId });
  const socialLinks = await SocialLink.countDocuments({ userId });

  const sections = {
    profilePicture: {
      completed: !!user.profileImage,
      weight: 10
    },
    about: {
      completed: !!user.bio && user.bio.length >= 100,
      weight: 15
    },
    skills: {
      completed: !!skills && skills.skills.length >= 5,
      weight: 20
    },
    experience: {
      completed: !!user.experienceList && user.experienceList.length >= 1,
      weight: 20
    },
    education: {
      completed: !!user.educationList && user.educationList.length >= 1,
      weight: 15
    },
    portfolio: {
      completed: portfolio >= 1,
      weight: 10
    },
    socialLinks: {
      completed: socialLinks >= 2,
      weight: 5
    },
    certifications: {
      completed: !!user.trainingList && user.trainingList.length >= 1,
      weight: 5
    }
  };

  let totalScore = 0;
  for (const key in sections) {
    if (sections[key].completed) {
      totalScore += sections[key].weight;
    }
  }

  // Update or create ProfileCompletion record
  const completionData = {
    userId,
    completionPercentage: totalScore,
    sections,
    lastCalculated: new Date()
  };

  await ProfileCompletion.findOneAndUpdate(
    { userId },
    completionData,
    { upsert: true, new: true }
  );

  return completionData;
};

module.exports = {
  calculateCompletion
};
