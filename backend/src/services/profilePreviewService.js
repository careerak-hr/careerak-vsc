const { Individual } = require('../models/User');
const profileCompletionService = require('./profileCompletionService');
const SkillLevel = require('../models/SkillLevel');
const PortfolioItem = require('../models/PortfolioItem');
const SocialLink = require('../models/SocialLink');

/**
 * Profile Preview Service
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

const maskEmail = (email) => {
  if (!email) return null;
  const [username, domain] = email.split('@');
  return `${username.slice(0, 2)}***@${domain}`;
};

const maskPhone = (phone) => {
  if (!phone) return null;
  return `***${phone.slice(-4)}`;
};

const identifyStrengths = (user, completion, skills, portfolio) => {
  const strengths = [];
  if (completion.completionPercentage >= 80) {
    strengths.push({ category: 'profile', title: 'ملف مكتمل', description: 'ملفك الشخصي يحتوي على أغلب المعلومات المطلوبة.' });
  }
  if (skills && skills.skills.length >= 5) {
    strengths.push({ category: 'skills', title: 'مهارات متنوعة', description: 'تمتلك عدداً جيداً من المهارات الموثقة.' });
  }
  if (portfolio && portfolio.length >= 3) {
    strengths.push({ category: 'portfolio', title: 'معرض أعمال قوي', description: 'لديك نماذج أعمال كافية لإثبات خبرتك.' });
  }
  if (user.experienceList && user.experienceList.length >= 3) {
    strengths.push({ category: 'experience', title: 'خبرة عملية غنية', description: 'لديك مسار مهني مستقر ومتنوع.' });
  }
  return strengths;
};

const identifyImprovements = (user, completion) => {
  const improvements = [];
  if (!completion.sections.profilePicture.completed) {
    improvements.push({ category: 'profile', title: 'الصورة الشخصية', description: 'أضف صورة احترافية لزيادة الثقة.' });
  }
  if (!completion.sections.about.completed) {
    improvements.push({ category: 'about', title: 'النبذة التعريفية', description: 'اكتب نبذة أطول لتعريف أصحاب العمل بك بشكل أفضل.' });
  }
  if (!completion.sections.socialLinks.completed) {
    improvements.push({ category: 'social', title: 'الروابط المهنية', description: 'أضف روابط LinkedIn أو GitHub ليسهل الوصول لأعمالك.' });
  }
  return improvements;
};

const getProfilePreview = async (userId) => {
  const user = await Individual.findById(userId);
  if (!user) return null;

  const completion = await profileCompletionService.calculateCompletion(userId);
  const skills = await SkillLevel.findOne({ userId });
  const portfolio = await PortfolioItem.find({ userId });
  const socialLinks = await SocialLink.find({ userId, isVisible: true });

  const rating = completion.completionPercentage >= 90 ? 'ممتاز' :
                 completion.completionPercentage >= 75 ? 'جيد جداً' :
                 completion.completionPercentage >= 50 ? 'جيد' : 'يحتاج تحسين';

  return {
    // Public Info
    name: `${user.firstName} ${user.lastName}`,
    title: user.specialization || 'باحث عن عمل',
    profileImage: user.profileImage,
    bio: user.bio,

    // Masked Private Info (Requirement 3.1)
    email: maskEmail(user.email),
    phone: maskPhone(user.phone),
    location: {
      city: user.city,
      country: user.country
    },

    // Professional Data
    skills: skills ? skills.skills : [],
    experience: user.experienceList || [],
    education: user.educationList || [],
    portfolio: portfolio || [],
    socialLinks: socialLinks || [],

    // Evaluation (Requirement 3.4)
    evaluation: {
      rating,
      percentage: completion.completionPercentage,
      strengths: identifyStrengths(user, completion, skills, portfolio),
      improvements: identifyImprovements(user, completion)
    }
  };
};

module.exports = {
  getProfilePreview
};
