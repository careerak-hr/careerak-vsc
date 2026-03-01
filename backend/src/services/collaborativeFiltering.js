/**
 * Collaborative Filtering Service
 * 
 * يوفر توصيات بناءً على سلوك المستخدمين المشابهين
 * Requirements: 1.2, 6.1, 6.2
 */

const UserInteraction = require('../models/UserInteraction');
const User = require('../models/User');
const JobPosting = require('../models/JobPosting');

class CollaborativeFiltering {
  constructor() {
    this.userItemMatrix = null;
    this.userSimilarityMatrix = null;
    this.lastMatrixUpdate = null;
    this.matrixUpdateInterval = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * بناء User-Item Matrix من التفاعلات
   * Requirements: 6.1
   */
  async buildUserItemMatrix() {
    try {
      console.log('Building user-item matrix...');

      // جلب جميع التفاعلات
      const interactions = await UserInteraction.find({
        itemType: 'job'
      }).lean();

      if (interactions.length === 0) {
        console.log('No interactions found. Matrix will be empty.');
        this.userItemMatrix = {};
        this.lastMatrixUpdate = new Date();
        return this.userItemMatrix;
      }

      // بناء المصفوفة
      const matrix = {};
      
      for (const interaction of interactions) {
        const userId = interaction.userId.toString();
        const itemId = interaction.itemId.toString();
        
        if (!matrix[userId]) {
          matrix[userId] = {};
        }
        
        // حساب الوزن بناءً على نوع التفاعل
        const weight = this.getInteractionWeight(interaction.action);
        
        // إذا كان هناك تفاعل سابق، نأخذ الأعلى
        if (!matrix[userId][itemId] || matrix[userId][itemId] < weight) {
          matrix[userId][itemId] = weight;
        }
      }

      this.userItemMatrix = matrix;
      this.lastMatrixUpdate = new Date();
      
      console.log(`Matrix built successfully. Users: ${Object.keys(matrix).length}, Total interactions: ${interactions.length}`);
      
      return matrix;
    } catch (error) {
      console.error('Error building user-item matrix:', error);
      throw error;
    }
  }

  /**
   * حساب وزن التفاعل
   */
  getInteractionWeight(action) {
    const weights = {
      'apply': 1.0,    // تقديم = أعلى وزن
      'like': 0.8,     // إعجاب
      'save': 0.7,     // حفظ
      'view': 0.3,     // مشاهدة
      'ignore': -0.5   // تجاهل = وزن سلبي
    };
    
    return weights[action] !== undefined ? weights[action] : 0.5;
  }

  /**
   * حساب التشابه بين مستخدمين
   * Cosine Similarity
   */
  calculateUserSimilarity(user1Items, user2Items) {
    // إيجاد العناصر المشتركة
    const commonItems = Object.keys(user1Items).filter(
      itemId => itemId in user2Items
    );

    if (commonItems.length === 0) {
      return 0;
    }

    // حساب Cosine Similarity
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (const itemId of commonItems) {
      dotProduct += user1Items[itemId] * user2Items[itemId];
    }

    for (const itemId in user1Items) {
      norm1 += user1Items[itemId] ** 2;
    }

    for (const itemId in user2Items) {
      norm2 += user2Items[itemId] ** 2;
    }

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * إيجاد المستخدمين المشابهين
   * Requirements: 1.2
   */
  async findSimilarUsers(userId, topK = 10) {
    try {
      // التأكد من تحديث المصفوفة
      await this.ensureMatrixUpdated();

      const userIdStr = userId.toString();
      
      if (!this.userItemMatrix[userIdStr]) {
        console.log(`User ${userIdStr} has no interactions yet.`);
        return [];
      }

      const userItems = this.userItemMatrix[userIdStr];
      const similarities = [];

      // حساب التشابه مع جميع المستخدمين الآخرين
      for (const otherUserId in this.userItemMatrix) {
        if (otherUserId === userIdStr) continue;

        const otherUserItems = this.userItemMatrix[otherUserId];
        const similarity = this.calculateUserSimilarity(userItems, otherUserItems);

        if (similarity > 0) {
          similarities.push({
            userId: otherUserId,
            similarity: similarity
          });
        }
      }

      // ترتيب حسب التشابه
      similarities.sort((a, b) => b.similarity - a.similarity);

      // إرجاع أفضل K مستخدمين
      return similarities.slice(0, topK);
    } catch (error) {
      console.error('Error finding similar users:', error);
      throw error;
    }
  }

  /**
   * الحصول على توصيات بناءً على المستخدمين المشابهين
   * Requirements: 1.2
   */
  async getCollaborativeRecommendations(userId, limit = 10) {
    try {
      // إيجاد المستخدمين المشابهين
      const similarUsers = await this.findSimilarUsers(userId, 20);

      if (similarUsers.length === 0) {
        console.log('No similar users found. Returning empty recommendations.');
        return [];
      }

      const userIdStr = userId.toString();
      const userItems = this.userItemMatrix[userIdStr] || {};
      
      // جمع الوظائف من المستخدمين المشابهين
      const itemScores = {};

      for (const { userId: similarUserId, similarity } of similarUsers) {
        const similarUserItems = this.userItemMatrix[similarUserId];

        for (const itemId in similarUserItems) {
          // تخطي الوظائف التي تفاعل معها المستخدم بالفعل
          if (itemId in userItems) continue;

          // حساب النتيجة المرجحة
          const weightedScore = similarUserItems[itemId] * similarity;

          if (!itemScores[itemId]) {
            itemScores[itemId] = {
              score: 0,
              count: 0
            };
          }

          itemScores[itemId].score += weightedScore;
          itemScores[itemId].count += 1;
        }
      }

      // حساب المتوسط وترتيب النتائج
      const recommendations = Object.entries(itemScores)
        .map(([itemId, data]) => ({
          itemId,
          score: data.score / data.count, // متوسط النتيجة
          supportingUsers: data.count
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      // جلب تفاصيل الوظائف
      const jobIds = recommendations.map(r => r.itemId);
      const jobs = await JobPosting.find({
        _id: { $in: jobIds },
        status: 'active'
      }).lean();

      // دمج النتائج
      const jobsMap = {};
      jobs.forEach(job => {
        jobsMap[job._id.toString()] = job;
      });

      const finalRecommendations = recommendations
        .filter(r => jobsMap[r.itemId])
        .map(r => ({
          job: jobsMap[r.itemId],
          score: Math.round(r.score * 100), // تحويل إلى 0-100
          confidence: r.score,
          supportingUsers: r.supportingUsers,
          reasons: this.generateCollaborativeReasons(r.supportingUsers, r.score)
        }));

      return finalRecommendations;
    } catch (error) {
      console.error('Error getting collaborative recommendations:', error);
      throw error;
    }
  }

  /**
   * توليد أسباب التوصية
   */
  generateCollaborativeReasons(supportingUsers, score) {
    const reasons = [];

    if (supportingUsers >= 5) {
      reasons.push(`${supportingUsers} مستخدمين مشابهين لك أعجبوا بهذه الوظيفة`);
    } else if (supportingUsers >= 2) {
      reasons.push(`عدة مستخدمين بملفات مشابهة لملفك تفاعلوا مع هذه الوظيفة`);
    } else {
      reasons.push(`مستخدم بملف مشابه لملفك أعجب بهذه الوظيفة`);
    }

    if (score > 0.7) {
      reasons.push('توصية قوية بناءً على سلوك مستخدمين مشابهين');
    } else if (score > 0.5) {
      reasons.push('توصية جيدة بناءً على تفضيلات مستخدمين مشابهين');
    }

    return reasons;
  }

  /**
   * التأكد من تحديث المصفوفة
   */
  async ensureMatrixUpdated() {
    const now = new Date();
    
    if (!this.lastMatrixUpdate || 
        (now - this.lastMatrixUpdate) > this.matrixUpdateInterval) {
      await this.buildUserItemMatrix();
    }
  }

  /**
   * إعادة بناء المصفوفة يدوياً
   */
  async rebuildMatrix() {
    return await this.buildUserItemMatrix();
  }

  /**
   * الحصول على إحصائيات المصفوفة
   */
  getMatrixStats() {
    if (!this.userItemMatrix) {
      return {
        totalUsers: 0,
        totalInteractions: 0,
        averageInteractionsPerUser: 0,
        lastUpdate: null
      };
    }

    const totalUsers = Object.keys(this.userItemMatrix).length;
    let totalInteractions = 0;

    for (const userId in this.userItemMatrix) {
      totalInteractions += Object.keys(this.userItemMatrix[userId]).length;
    }

    return {
      totalUsers,
      totalInteractions,
      averageInteractionsPerUser: totalUsers > 0 ? (totalInteractions / totalUsers).toFixed(2) : 0,
      lastUpdate: this.lastMatrixUpdate
    };
  }
}

module.exports = CollaborativeFiltering;
