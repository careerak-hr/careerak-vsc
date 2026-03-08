const ProfileSuggestion = require('../models/ProfileSuggestion');
const ProfileCompletion = require('../models/ProfileCompletion');
const { Individual } = require('../models/User');

/**
 * Suggestions Engine
 * Requirements: 2.1, 2.2, 2.3
 */

const generateSuggestions = async (userId) => {
  const user = await Individual.findById(userId);
  const completion = await ProfileCompletion.findOne({ userId });

  if (!user || !completion) return [];

  const suggestions = [];

  // 1. Check for missing critical sections
  if (!completion.sections.profilePicture.completed) {
    suggestions.push({
      id: 'add_profile_picture',
      type: 'add',
      category: 'profile',
      priority: 'high',
      title: 'أضف صورة شخصية احترافية',
      description: 'الملفات التي تحتوي على صور تحصل على مشاهدات أكثر بنسبة 40%.',
      icon: '🖼️'
    });
  }

  if (!completion.sections.about.completed) {
    suggestions.push({
      id: 'improve_about',
      type: 'improve',
      category: 'about',
      priority: 'high',
      title: 'اكتب نبذة شخصية مفصلة',
      description: 'اكتب 100 كلمة على الأقل لتوضيح خبراتك وأهدافك المهنية.',
      icon: '📝'
    });
  }

  if (!completion.sections.skills.completed) {
    suggestions.push({
      id: 'add_more_skills',
      type: 'add',
      category: 'skills',
      priority: 'high',
      title: 'أضف المزيد من المهارات',
      description: 'أصحاب العمل يبحثون عن مهارات محددة، أضف 5 مهارات على الأقل.',
      icon: '🛠️'
    });
  }

  if (!completion.sections.portfolio.completed) {
    suggestions.push({
      id: 'add_portfolio',
      type: 'add',
      category: 'portfolio',
      priority: 'medium',
      title: 'أنشئ معرض أعمالك',
      description: 'اعرض نماذج من أعمالك السابقة لزيادة مصداقية ملفك.',
      icon: '✨'
    });
  }

  if (!completion.sections.socialLinks.completed) {
    suggestions.push({
      id: 'add_social_links',
      type: 'add',
      category: 'social',
      priority: 'medium',
      title: 'أضف روابط التواصل المهني',
      description: 'أضف رابط LinkedIn أو GitHub ليسهل الوصول إليك.',
      icon: '🔗'
    });
  }

  // Save or update suggestions in database
  await ProfileSuggestion.findOneAndUpdate(
    { userId },
    {
      userId,
      suggestions,
      generatedAt: new Date()
    },
    { upsert: true, new: true }
  );

  return suggestions;
};

const markSuggestionComplete = async (userId, suggestionId) => {
  return await ProfileSuggestion.findOneAndUpdate(
    { userId, 'suggestions.id': suggestionId },
    {
      $set: {
        'suggestions.$.completed': true,
        'suggestions.$.completedAt': new Date()
      }
    },
    { new: true }
  );
};

module.exports = {
  generateSuggestions,
  markSuggestionComplete
};
