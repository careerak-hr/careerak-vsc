const JobPosting = require('../models/JobPosting');
const redis = require('../config/redis');

/**
 * خدمة الوظائف المشابهة
 * تحسب التشابه بناءً على: المجال (40%)، المهارات (30%)، الموقع (15%)، الراتب (15%)
 */
class SimilarJobsService {
  /**
   * حساب درجة التشابه بين وظيفتين
   * @param {Object} job1 - الوظيفة الأولى
   * @param {Object} job2 - الوظيفة الثانية
   * @returns {number} - درجة التشابه (0-100)
   */
  calculateSimilarity(job1, job2) {
    let score = 0;

    // 1. نفس المجال/نوع الوظيفة (40%)
    if (job1.postingType === job2.postingType) {
      score += 40;
    }

    // 2. تشابه المهارات (30%)
    const skillScore = this.calculateSkillSimilarity(
      job1.skills || [],
      job2.skills || []
    );
    score += skillScore * 30;

    // 3. تشابه الموقع (15%)
    const locationScore = this.calculateLocationSimilarity(
      job1.location,
      job2.location
    );
    score += locationScore * 15;

    // 4. تشابه الراتب (15%)
    const salaryScore = this.calculateSalarySimilarity(
      job1.salary,
      job2.salary
    );
    score += salaryScore * 15;

    return Math.round(score);
  }

  /**
   * حساب تشابه المهارات
   * @param {Array} skills1 - مهارات الوظيفة الأولى
   * @param {Array} skills2 - مهارات الوظيفة الثانية
   * @returns {number} - نسبة التشابه (0-1)
   */
  calculateSkillSimilarity(skills1, skills2) {
    if (!skills1.length || !skills2.length) return 0;

    // تحويل المهارات إلى lowercase للمقارنة
    const normalizedSkills1 = skills1.map(s => s.toLowerCase().trim());
    const normalizedSkills2 = skills2.map(s => s.toLowerCase().trim());

    // إيجاد المهارات المشتركة
    const commonSkills = normalizedSkills1.filter(skill =>
      normalizedSkills2.includes(skill)
    );

    // حساب نسبة التشابه (Jaccard similarity)
    const totalUniqueSkills = new Set([...normalizedSkills1, ...normalizedSkills2]).size;
    return commonSkills.length / totalUniqueSkills;
  }

  /**
   * حساب تشابه الموقع
   * @param {Object} location1 - موقع الوظيفة الأولى
   * @param {Object} location2 - موقع الوظيفة الثانية
   * @returns {number} - نسبة التشابه (0-1)
   */
  calculateLocationSimilarity(location1, location2) {
    if (!location1 || !location2) return 0;

    // نفس المدينة = 100%
    if (location1.city === location2.city) {
      return 1.0;
    }

    // نفس الدولة = 50%
    if (location1.country === location2.country) {
      return 0.5;
    }

    return 0;
  }

  /**
   * حساب تشابه الراتب
   * @param {Object} salary1 - راتب الوظيفة الأولى {min, max}
   * @param {Object} salary2 - راتب الوظيفة الثانية {min, max}
   * @returns {number} - نسبة التشابه (0-1)
   */
  calculateSalarySimilarity(salary1, salary2) {
    if (!salary1 || !salary2) return 0;
    
    // استخدام متوسط الراتب للمقارنة
    const avg1 = salary1.min && salary1.max ? (salary1.min + salary1.max) / 2 : (salary1.min || salary1.max || 0);
    const avg2 = salary2.min && salary2.max ? (salary2.min + salary2.max) / 2 : (salary2.min || salary2.max || 0);
    
    if (avg1 === 0 || avg2 === 0) return 0;

    const salaryDiff = Math.abs(avg1 - avg2);
    const salaryAvg = (avg1 + avg2) / 2;

    // كلما كان الفرق أقل، كلما كان التشابه أعلى
    const similarity = Math.max(0, 1 - (salaryDiff / salaryAvg));
    return similarity;
  }

  /**
   * إيجاد الوظائف المشابهة
   * @param {string} jobId - معرف الوظيفة
   * @param {number} limit - عدد الوظائف المطلوبة (افتراضي: 6)
   * @returns {Promise<Array>} - قائمة الوظائف المشابهة مع درجات التشابه
   */
  async findSimilarJobs(jobId, limit = 6) {
    try {
      // التحقق من الـ cache أولاً
      const cacheKey = `similar_jobs:${jobId}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      // جلب الوظيفة الأصلية
      const job = await JobPosting.findById(jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      // جلب الوظائف المرشحة (نفس النوع أو المدينة أو مهارات مشتركة)
      const candidates = await JobPosting.find({
        _id: { $ne: jobId },
        status: 'Open',
        $or: [
          { postingType: job.postingType },
          { 'location.city': job.location?.city },
          { skills: { $in: job.skills || [] } }
        ]
      }).limit(50).lean();

      // حساب درجات التشابه
      const scored = candidates.map(candidate => ({
        job: candidate,
        score: this.calculateSimilarity(job, candidate)
      }));

      // ترتيب حسب الدرجة وأخذ أعلى النتائج
      const similar = scored
        .filter(s => s.score >= 40) // فقط الوظائف ذات التشابه >= 40%
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(s => ({
          ...s.job,
          similarityScore: s.score
        }));

      // حفظ في الـ cache لمدة ساعة
      await redis.setex(cacheKey, 3600, JSON.stringify(similar));

      return similar;
    } catch (error) {
      console.error('Error finding similar jobs:', error);
      throw error;
    }
  }

  /**
   * تحديث cache الوظائف المشابهة
   * @param {string} jobId - معرف الوظيفة
   */
  async invalidateCache(jobId) {
    try {
      const cacheKey = `similar_jobs:${jobId}`;
      await redis.del(cacheKey);
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  }

  /**
   * تحديث cache لجميع الوظائف (يُستخدم عند تحديث وظيفة)
   */
  async invalidateAllCache() {
    try {
      const keys = await redis.keys('similar_jobs:*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Error invalidating all cache:', error);
    }
  }
}

module.exports = new SimilarJobsService();
