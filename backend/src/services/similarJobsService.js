const JobPosting = require('../models/JobPosting');
const redisCache = require('./redisCache');

/**
 * Find similar jobs based on title, skills, and location
 * Requirements: 4.1, 4.2
 */
exports.getSimilarJobs = async (jobId, limit = 5) => {
  const cacheKey = `similar_jobs_${jobId}_${limit}`;

  // Try to get from cache
  const cached = await redisCache.get(cacheKey);
  if (cached) return cached;

  try {
    const targetJob = await JobPosting.findById(jobId);
    if (!targetJob) return [];
    
    // Algorithm:
    // 1. Same posting type
    // 2. Overlapping skills
    // 3. Same location (city/country)
    // 4. Exclude current job
    
    const query = {
      _id: { $ne: jobId },
      status: 'Open',
      $or: [
        { postingType: targetJob.postingType },
        { skills: { $in: targetJob.skills } },
        { 'location.city': targetJob.location.city }
      ]
    };

    const similarJobs = await JobPosting.find(query)
      .limit(limit)
      .sort({ createdAt: -1 });
      
    // Calculate similarity score (optional)
    const jobsWithScore = similarJobs.map(job => {
      let score = 0;
      if (job.postingType === targetJob.postingType) score += 30;

      const commonSkills = job.skills.filter(skill => targetJob.skills.includes(skill));
      score += (commonSkills.length / Math.max(targetJob.skills.length, 1)) * 40;

      if (job.location.city === targetJob.location.city) score += 30;

      return {
        ...job.toObject(),
        similarityScore: Math.min(Math.round(score), 100)
      };
    });

    // Sort by score
    jobsWithScore.sort((a, b) => b.similarityScore - a.similarityScore);

    // Cache result for 1 hour
    await redisCache.set(cacheKey, jobsWithScore, 3600);

    return jobsWithScore;
  } catch (error) {
    console.error('Error finding similar jobs:', error);
    return [];
  }
};
