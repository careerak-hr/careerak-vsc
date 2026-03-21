const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const CourseEnrollment = require('../models/CourseEnrollment');
const notificationService = require('./notificationService');

/**
 * Badge Service
 * Handles badge management, awarding, and progress tracking
 */
class BadgeService {
  /**
   * Initialize badge system with predefined badges
   */
  async initializeBadges() {
    const badges = this.getBadgeDefinitions();
    
    for (const badgeData of badges) {
      try {
        await Badge.findOneAndUpdate(
          { badgeId: badgeData.badgeId },
          badgeData,
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error(`Error initializing badge ${badgeData.badgeId}:`, error);
      }
    }
    
    console.log(`✅ Initialized ${badges.length} badges`);
  }

  /**
   * Get badge definitions (7+ types)
   * @returns {Array} Array of badge definitions
   */
  getBadgeDefinitions() {
    return [
      // 1. المتعلم النشط - Active Learner
      {
        badgeId: 'active-learner',
        name: {
          ar: 'المتعلم النشط',
          en: 'Active Learner',
          fr: 'Apprenant Actif'
        },
        description: {
          ar: 'أكمل 5 دورات تدريبية',
          en: 'Complete 5 training courses',
          fr: 'Terminer 5 cours de formation'
        },
        icon: '🎓',
        criteria: {
          type: 'courses_completed',
          value: 5
        },
        rarity: 'common',
        points: 50,
        category: 'learning',
        displayOrder: 1,
        color: '#4CAF50'
      },

      // 2. الخبير - Expert
      {
        badgeId: 'expert',
        name: {
          ar: 'الخبير',
          en: 'Expert',
          fr: 'Expert'
        },
        description: {
          ar: 'أكمل 10 دورات تدريبية',
          en: 'Complete 10 training courses',
          fr: 'Terminer 10 cours de formation'
        },
        icon: '🏆',
        criteria: {
          type: 'courses_completed',
          value: 10
        },
        rarity: 'rare',
        points: 100,
        category: 'achievement',
        displayOrder: 2,
        color: '#FF9800'
      },

      // 3. السريع - Speed Learner
      {
        badgeId: 'speed-learner',
        name: {
          ar: 'السريع',
          en: 'Speed Learner',
          fr: 'Apprenant Rapide'
        },
        description: {
          ar: 'أكمل دورة في أقل من 7 أيام',
          en: 'Complete a course in less than 7 days',
          fr: 'Terminer un cours en moins de 7 jours'
        },
        icon: '⚡',
        criteria: {
          type: 'course_speed',
          value: 7 // days
        },
        rarity: 'rare',
        points: 75,
        category: 'achievement',
        displayOrder: 3,
        color: '#FFC107'
      },

      // 4. المتميز - Outstanding
      {
        badgeId: 'outstanding',
        name: {
          ar: 'المتميز',
          en: 'Outstanding',
          fr: 'Exceptionnel'
        },
        description: {
          ar: 'احصل على تقييم 5 نجوم في 3 دورات',
          en: 'Get 5-star rating in 3 courses',
          fr: 'Obtenir une note de 5 étoiles dans 3 cours'
        },
        icon: '🌟',
        criteria: {
          type: 'high_ratings',
          value: {
            count: 3,
            minRating: 5
          }
        },
        rarity: 'epic',
        points: 150,
        category: 'achievement',
        displayOrder: 4,
        color: '#9C27B0'
      },

      // 5. المتخصص - Specialist
      {
        badgeId: 'specialist',
        name: {
          ar: 'المتخصص',
          en: 'Specialist',
          fr: 'Spécialiste'
        },
        description: {
          ar: 'أكمل 3 دورات في نفس المجال',
          en: 'Complete 3 courses in the same field',
          fr: 'Terminer 3 cours dans le même domaine'
        },
        icon: '📚',
        criteria: {
          type: 'specialization',
          value: {
            count: 3
            // category will be determined dynamically
          }
        },
        rarity: 'rare',
        points: 80,
        category: 'learning',
        displayOrder: 5,
        color: '#2196F3'
      },

      // 6. المثابر - Persistent
      {
        badgeId: 'persistent',
        name: {
          ar: 'المثابر',
          en: 'Persistent',
          fr: 'Persévérant'
        },
        description: {
          ar: 'سجل دخول يومي لمدة 30 يوم',
          en: 'Daily login for 30 days',
          fr: 'Connexion quotidienne pendant 30 jours'
        },
        icon: '🎯',
        criteria: {
          type: 'daily_login',
          value: 30 // consecutive days
        },
        rarity: 'epic',
        points: 120,
        category: 'engagement',
        displayOrder: 6,
        color: '#E91E63'
      },

      // 7. المحترف - Professional
      {
        badgeId: 'professional',
        name: {
          ar: 'المحترف',
          en: 'Professional',
          fr: 'Professionnel'
        },
        description: {
          ar: 'احصل على وظيفة بعد إكمال دورة',
          en: 'Get a job after completing a course',
          fr: 'Obtenir un emploi après avoir terminé un cours'
        },
        icon: '💼',
        criteria: {
          type: 'job_obtained',
          value: true
        },
        rarity: 'legendary',
        points: 200,
        category: 'career',
        displayOrder: 7,
        color: '#304B60'
      },

      // 8. جامع الشهادات - Certificate Collector
      {
        badgeId: 'certificate-collector',
        name: {
          ar: 'جامع الشهادات',
          en: 'Certificate Collector',
          fr: 'Collectionneur de Certificats'
        },
        description: {
          ar: 'احصل على 15 شهادة',
          en: 'Earn 15 certificates',
          fr: 'Obtenir 15 certificats'
        },
        icon: '📜',
        criteria: {
          type: 'certificates_earned',
          value: 15
        },
        rarity: 'epic',
        points: 180,
        category: 'achievement',
        displayOrder: 8,
        color: '#D48161'
      },

      // 9. متقن المهارات - Skills Master
      {
        badgeId: 'skills-master',
        name: {
          ar: 'متقن المهارات',
          en: 'Skills Master',
          fr: 'Maître des Compétences'
        },
        description: {
          ar: 'أتقن 20 مهارة مختلفة',
          en: 'Master 20 different skills',
          fr: 'Maîtriser 20 compétences différentes'
        },
        icon: '🎨',
        criteria: {
          type: 'skills_mastered',
          value: 20
        },
        rarity: 'legendary',
        points: 250,
        category: 'learning',
        displayOrder: 9,
        color: '#00BCD4'
      },

      // 10. المبتدئ - Beginner
      {
        badgeId: 'beginner',
        name: {
          ar: 'المبتدئ',
          en: 'Beginner',
          fr: 'Débutant'
        },
        description: {
          ar: 'أكمل أول دورة تدريبية',
          en: 'Complete your first course',
          fr: 'Terminer votre premier cours'
        },
        icon: '🌱',
        criteria: {
          type: 'courses_completed',
          value: 1
        },
        rarity: 'common',
        points: 10,
        category: 'learning',
        displayOrder: 0,
        color: '#8BC34A'
      }
    ];
  }

  /**
   * Get user statistics for badge checking
   * @param {String} userId - User ID
   * @returns {Object} User statistics
   */
  async getUserStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get completed courses count
      const completedCourses = await CourseEnrollment.countDocuments({
        userId,
        status: 'completed'
      });
      
      // Get certificates count
      const certificatesCount = await Certificate.countDocuments({
        userId,
        status: 'active'
      });
      
      // Get courses by category
      const coursesByCategory = await CourseEnrollment.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
            status: 'completed'
          }
        },
        {
          $lookup: {
            from: 'educationalcourses',
            localField: 'courseId',
            foreignField: '_id',
            as: 'course'
          }
        },
        { $unwind: '$course' },
        {
          $group: {
            _id: '$course.category',
            count: { $sum: 1 }
          }
        }
      ]);

      
      const categoryMap = {};
      coursesByCategory.forEach(item => {
        categoryMap[item._id] = item.count;
      });
      
      // Get fastest course completion
      const fastestCompletion = await CourseEnrollment.findOne({
        userId,
        status: 'completed',
        completedAt: { $exists: true }
      }).sort({ completionDays: 1 });
      
      // Get high ratings count
      const highRatingsCount = await CourseEnrollment.countDocuments({
        userId,
        status: 'completed',
        rating: 5
      });
      
      // Get average rating
      const ratingStats = await CourseEnrollment.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
            status: 'completed',
            rating: { $exists: true }
          }
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' }
          }
        }
      ]);

      
      return {
        coursesCompleted: completedCourses,
        certificatesEarned: certificatesCount,
        coursesByCategory: categoryMap,
        fastestCourseCompletion: fastestCompletion?.completionDays || Infinity,
        highRatingsCount,
        averageRating: ratingStats.length > 0 ? ratingStats[0].averageRating : 0,
        consecutiveLoginDays: user.consecutiveLoginDays || 0,
        jobObtained: user.employmentStatus === 'employed',
        skillsMastered: user.skills?.length || 0
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  /**
   * Check and award badges to user
   * @param {String} userId - User ID
   * @returns {Array} Newly awarded badges
   */
  async checkAndAwardBadges(userId) {
    try {
      const userStats = await this.getUserStats(userId);
      const allBadges = await Badge.getActiveBadges();
      const newlyAwarded = [];
      
      for (const badge of allBadges) {
        // Check if user already has this badge
        const hasBadge = await UserBadge.hasBadge(userId, badge._id);
        if (hasBadge) {
          continue;
        }
        
        // Check if user meets criteria
        const meetsCriteria = badge.checkCriteria(userStats);
        if (meetsCriteria) {
          // Award badge
          const userBadge = await UserBadge.awardBadge(userId, badge._id, {
            awardedBy: 'system',
            stats: userStats
          });
          
          newlyAwarded.push({
            badge,
            userBadge
          });
          
          // Send notification
          await this.sendBadgeNotification(userId, badge);
        }
      }
      
      return newlyAwarded;
    } catch (error) {
      console.error('Error checking and awarding badges:', error);
      throw error;
    }
  }

  /**
   * Calculate progress for all badges
   * @param {String} userId - User ID
   * @returns {Array} Badge progress
   */
  async calculateProgress(userId) {
    try {
      const userStats = await this.getUserStats(userId);
      const allBadges = await Badge.getActiveBadges();
      const progress = [];
      
      for (const badge of allBadges) {
        const hasBadge = await UserBadge.hasBadge(userId, badge._id);
        
        if (hasBadge) {
          progress.push({
            badge: badge.getDetails(),
            earned: true,
            progress: 100
          });
        } else {
          const progressValue = this.calculateBadgeProgress(badge, userStats);
          progress.push({
            badge: badge.getDetails(),
            earned: false,
            progress: progressValue
          });
        }
      }
      
      return progress;
    } catch (error) {
      console.error('Error calculating progress:', error);
      throw error;
    }
  }

  /**
   * Calculate progress for a specific badge
   * @param {Object} badge - Badge object
   * @param {Object} userStats - User statistics
   * @returns {Number} Progress percentage (0-100)
   */
  calculateBadgeProgress(badge, userStats) {
    const { type, value } = badge.criteria;
    
    switch (type) {
      case 'courses_completed':
        return Math.min(100, Math.round((userStats.coursesCompleted / value) * 100));
        
      case 'course_speed':
        return userStats.fastestCourseCompletion <= value ? 100 : 0;
        
      case 'high_ratings':
        return Math.min(100, Math.round((userStats.highRatingsCount / value.count) * 100));
        
      case 'specialization':
        const maxCategory = Math.max(...Object.values(userStats.coursesByCategory || {}), 0);
        return Math.min(100, Math.round((maxCategory / value.count) * 100));
        
      case 'daily_login':
        return Math.min(100, Math.round((userStats.consecutiveLoginDays / value) * 100));
        
      case 'job_obtained':
        return userStats.jobObtained ? 100 : 0;
        
      case 'certificates_earned':
        return Math.min(100, Math.round((userStats.certificatesEarned / value) * 100));
        
      case 'skills_mastered':
        return Math.min(100, Math.round((userStats.skillsMastered / value) * 100));
        
      default:
        return 0;
    }
  }

  /**
   * Get user's badges
   * @param {String} userId - User ID
   * @param {String} lang - Language code
   * @returns {Array} User badges
   */
  async getBadgesByUser(userId, lang = 'ar') {
    try {
      const userBadges = await UserBadge.getUserBadges(userId);
      
      return userBadges.map(ub => ({
        userBadgeId: ub._id,
        badge: ub.badgeId.getDetails(lang),
        earnedAt: ub.earnedAt,
        isDisplayed: ub.isDisplayed
      }));
    } catch (error) {
      console.error('Error getting user badges:', error);
      throw error;
    }
  }
  
  /**
   * Send badge notification
   * @param {String} userId - User ID
   * @param {Object} badge - Badge object
   */
  async sendBadgeNotification(userId, badge) {
    try {
      if (notificationService && notificationService.createNotification) {
        await notificationService.createNotification({
          recipient: userId,
          type: 'badge_earned',
          title: `🎉 حصلت على وسام جديد!`,
          message: `تهانينا! حصلت على وسام "${badge.name?.ar || badge.name}"`,
          relatedData: {
            badgeId: badge.badgeId,
            badgeName: badge.name,
            badgeIcon: badge.icon,
            badgePoints: badge.points
          },
          priority: 'high'
        });
      }

      // إرسال إشعار فوري عبر Pusher
      try {
        const pusherService = require('./pusherService');
        if (pusherService && pusherService.isEnabled()) {
          await pusherService.sendNotificationToUser(userId, {
            type: 'badge_earned',
            title: {
              ar: `🎉 حصلت على وسام جديد!`,
              en: `🎉 You earned a new badge!`,
              fr: `🎉 Vous avez gagné un nouveau badge!`
            },
            message: {
              ar: `تهانينا! حصلت على وسام "${badge.name?.ar || badge.name}"`,
              en: `Congratulations! You earned the "${badge.name?.en || badge.name}" badge`,
              fr: `Félicitations! Vous avez gagné le badge "${badge.name?.fr || badge.name}"`
            },
            badgeId: badge.badgeId,
            badgeName: badge.name,
            badgeIcon: badge.icon,
            badgePoints: badge.points,
            timestamp: new Date().toISOString()
          });
        }
      } catch (pusherError) {
        // Pusher failure should not block badge awarding
        console.error('Error sending Pusher badge notification:', pusherError);
      }
    } catch (error) {
      console.error('Error sending badge notification:', error);
    }
  }
}

module.exports = new BadgeService();
