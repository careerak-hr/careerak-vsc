/**
 * 🤖 CAREERAK AI MATCHING ENGINE
 * يقوم هذا المحرك بإجراء تقاطعات ذكية بين طلبات الأفراد وعروض الشركات
 */

const calculateMatchScore = (individual, offer) => {
  let score = 0;
  let totalCriteria = 0;

  // 1. تقاطع المهارات (وزن كبير: 40%)
  if (individual.skills && offer.requiredSkills) {
    totalCriteria += 40;
    const indSkills = individual.skills.toLowerCase().split(',').map(s => s.trim());
    const offerSkills = offer.requiredSkills.toLowerCase().split(',').map(s => s.trim());
    const matches = indSkills.filter(s => offerSkills.some(os => os.includes(s) || s.includes(os)));
    score += (matches.length / Math.max(offerSkills.length, 1)) * 40;
  }

  // 2. تقاطع الموقع الجغرافي (وزن: 20%)
  if (individual.country && offer.location) {
    totalCriteria += 20;
    if (individual.country === offer.location || offer.location.includes(individual.country)) {
      score += 20;
    }
  }

  // 3. تقاطع المستوى التعليمي (وزن: 20%)
  if (individual.education && offer.education) {
    totalCriteria += 20;
    if (individual.education === offer.education) {
      score += 20;
    }
  }

  // 4. تقاطع سنوات الخبرة (وزن: 20%)
  if (individual.experience && offer.experienceYears) {
    totalCriteria += 20;
    const indExp = parseInt(individual.experience) || 0;
    const reqExp = parseInt(offer.experienceYears) || 0;
    if (indExp >= reqExp) {
      score += 20;
    } else if (indExp > 0) {
      score += (indExp / reqExp) * 20;
    }
  }

  return totalCriteria > 0 ? Math.round((score / totalCriteria) * 100) : 0;
};

module.exports = { calculateMatchScore };
