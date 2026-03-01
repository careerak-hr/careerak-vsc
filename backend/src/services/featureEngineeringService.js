/**
 * 🔧 Feature Engineering Service
 * خدمة استخراج وإنشاء Features لنظام التوصيات الذكية
 * 
 * تقوم بـ:
 * - استخراج features من الملفات الشخصية
 * - استخراج features من الوظائف والدورات
 * - إنشاء user-item matrix
 * - حساب text embeddings باستخدام TF-IDF
 * 
 * المتطلبات: Requirements 1.1, 1.2
 * المهمة: Task 2.2
 */

const natural = require('natural');
const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

class FeatureEngineeringService {
  constructor() {
    this.tfidf = new TfIdf();
    this.skillsVocabulary = new Set();
    this.locationVocabulary = new Set();
  }

  /**
   * استخراج features من ملف المستخدم
   * @param {Object} user - بيانات المستخدم
   * @returns {Object} feature vector للمستخدم
   */
  extractUserFeatures(user) {
    try {
      // 1. Skills Vector
      const skillsVector = this._createSkillsVector(user.skills || []);

      // 2. Experience Features
      const experienceFeatures = this._extractExperienceFeatures(user.experiences || []);

      // 3. Education Features
      const educationFeatures = this._extractEducationFeatures(user.education || []);

      // 4. Location Features
      const locationFeatures = this._extractLocationFeatures(user.country, user.city);

      // 5. Profile Completeness
      const completeness = user.completeness || 0;

      // 6. Text Embedding (Bio + Interests)
      const textEmbedding = this._createTextEmbedding(
        `${user.bio || ''} ${(user.interests || []).join(' ')}`
      );

      // 7. Language Features
      const languageFeatures = this._extractLanguageFeatures(user.languages || []);

      return {
        userId: user.userId,
        features: {
          skills: skillsVector,
          experience: experienceFeatures,
          education: educationFeatures,
          location: locationFeatures,
          completeness,
          textEmbedding,
          languages: languageFeatures
        },
        metadata: {
          totalSkills: (user.skills || []).length,
          totalExperience: experienceFeatures.totalMonths,
          educationLevel: educationFeatures.highestLevel,
          createdAt: new Date()
        }
      };
    } catch (error) {
      console.error('Error extracting user features:', error);
      throw new Error(`Failed to extract user features: ${error.message}`);
    }
  }

  /**
   * استخراج features من الوظيفة
   * @param {Object} job - بيانات الوظيفة
   * @returns {Object} feature vector للوظيفة
   */
  extractJobFeatures(job) {
    try {
      // 1. Required Skills Vector
      const skillsVector = this._createSkillsVector(job.requiredSkills || []);

      // 2. Job Type Features
      const jobTypeFeatures = this._extractJobTypeFeatures(job);

      // 3. Location Features
      const locationFeatures = this._extractLocationFeatures(
        job.location?.country,
        job.location?.city
      );

      // 4. Salary Features
      const salaryFeatures = this._extractSalaryFeatures(job);

      // 5. Text Embedding (Title + Description + Requirements)
      const textEmbedding = this._createTextEmbedding(
        `${job.title || ''} ${job.description || ''} ${job.requirements || ''}`
      );

      // 6. Company Features
      const companyFeatures = this._extractCompanyFeatures(job.company);

      return {
        jobId: job.jobId,
        features: {
          skills: skillsVector,
          jobType: jobTypeFeatures,
          location: locationFeatures,
          salary: salaryFeatures,
          textEmbedding,
          company: companyFeatures
        },
        metadata: {
          totalSkills: (job.requiredSkills || []).length,
          postingType: job.postingType,
          status: job.status,
          createdAt: new Date()
        }
      };
    } catch (error) {
      console.error('Error extracting job features:', error);
      throw new Error(`Failed to extract job features: ${error.message}`);
    }
  }

  /**
   * استخراج features من الدورة
   * @param {Object} course - بيانات الدورة
   * @returns {Object} feature vector للدورة
   */
  extractCourseFeatures(course) {
    try {
      // 1. Skills Vector
      const skillsVector = this._createSkillsVector(course.skills || []);

      // 2. Course Level Features
      const levelFeatures = this._extractCourseLevelFeatures(course.level);

      // 3. Category Features
      const categoryFeatures = this._extractCategoryFeatures(course.category);

      // 4. Duration Features
      const durationFeatures = this._extractDurationFeatures(course.duration);

      // 5. Text Embedding (Title + Description + Content)
      const textEmbedding = this._createTextEmbedding(
        `${course.title || ''} ${course.description || ''} ${course.content || ''}`
      );

      // 6. Popularity Features
      const popularityFeatures = this._extractPopularityFeatures(
        course.enrolledCount,
        course.maxParticipants
      );

      return {
        courseId: course.courseId,
        features: {
          skills: skillsVector,
          level: levelFeatures,
          category: categoryFeatures,
          duration: durationFeatures,
          textEmbedding,
          popularity: popularityFeatures
        },
        metadata: {
          totalSkills: (course.skills || []).length,
          level: course.level,
          category: course.category,
          createdAt: new Date()
        }
      };
    } catch (error) {
      console.error('Error extracting course features:', error);
      throw new Error(`Failed to extract course features: ${error.message}`);
    }
  }

  /**
   * إنشاء User-Item Matrix
   * @param {Array} interactions - قائمة التفاعلات
   * @param {String} itemType - نوع العنصر (job, course)
   * @returns {Object} User-Item Matrix
   */
  createUserItemMatrix(interactions, itemType = 'job') {
    try {
      const matrix = {};
      const userIds = new Set();
      const itemIds = new Set();

      // بناء المصفوفة
      interactions.forEach(interaction => {
        const userId = interaction.userId.toString();
        const itemId = interaction.itemId.toString();
        
        userIds.add(userId);
        itemIds.add(itemId);

        if (!matrix[userId]) {
          matrix[userId] = {};
        }

        // حساب القيمة بناءً على نوع التفاعل ووزنه
        const value = this._calculateInteractionValue(interaction);
        matrix[userId][itemId] = (matrix[userId][itemId] || 0) + value;
      });

      // تحويل المصفوفة إلى صيغة dense (اختياري)
      const denseMatrix = this._convertToDenseMatrix(matrix, Array.from(userIds), Array.from(itemIds));

      return {
        sparse: matrix,
        dense: denseMatrix,
        metadata: {
          itemType,
          totalUsers: userIds.size,
          totalItems: itemIds.size,
          totalInteractions: interactions.length,
          sparsity: this._calculateSparsity(userIds.size, itemIds.size, interactions.length),
          createdAt: new Date()
        }
      };
    } catch (error) {
      console.error('Error creating user-item matrix:', error);
      throw new Error(`Failed to create user-item matrix: ${error.message}`);
    }
  }

  /**
   * حساب TF-IDF embeddings لمجموعة من النصوص
   * @param {Array} documents - قائمة النصوص
   * @returns {Array} TF-IDF vectors
   */
  computeTfIdfEmbeddings(documents) {
    try {
      // إنشاء TF-IDF جديد
      const tfidf = new TfIdf();

      // إضافة جميع المستندات
      documents.forEach(doc => {
        tfidf.addDocument(doc.text || '');
      });

      // استخراج الـ embeddings
      const embeddings = documents.map((doc, index) => {
        const vector = {};
        
        tfidf.listTerms(index).forEach(item => {
          vector[item.term] = item.tfidf;
        });

        return {
          id: doc.id,
          vector,
          metadata: {
            termCount: Object.keys(vector).length,
            maxTfidf: Math.max(...Object.values(vector))
          }
        };
      });

      return {
        embeddings,
        vocabulary: this._extractVocabulary(tfidf, documents.length),
        metadata: {
          totalDocuments: documents.length,
          vocabularySize: this._extractVocabulary(tfidf, documents.length).length,
          createdAt: new Date()
        }
      };
    } catch (error) {
      console.error('Error computing TF-IDF embeddings:', error);
      throw new Error(`Failed to compute TF-IDF embeddings: ${error.message}`);
    }
  }

  /**
   * معالجة دفعة من المستخدمين
   * @param {Array} users - قائمة المستخدمين
   * @returns {Array} feature vectors
   */
  batchProcessUsers(users) {
    try {
      return users.map(user => this.extractUserFeatures(user));
    } catch (error) {
      console.error('Error batch processing users:', error);
      throw new Error(`Failed to batch process users: ${error.message}`);
    }
  }

  /**
   * معالجة دفعة من الوظائف
   * @param {Array} jobs - قائمة الوظائف
   * @returns {Array} feature vectors
   */
  batchProcessJobs(jobs) {
    try {
      return jobs.map(job => this.extractJobFeatures(job));
    } catch (error) {
      console.error('Error batch processing jobs:', error);
      throw new Error(`Failed to batch process jobs: ${error.message}`);
    }
  }

  /**
   * معالجة دفعة من الدورات
   * @param {Array} courses - قائمة الدورات
   * @returns {Array} feature vectors
   */
  batchProcessCourses(courses) {
    try {
      return courses.map(course => this.extractCourseFeatures(course));
    } catch (error) {
      console.error('Error batch processing courses:', error);
      throw new Error(`Failed to batch process courses: ${error.message}`);
    }
  }

  // ==================== Private Methods ====================

  /**
   * إنشاء skills vector
   * @private
   */
  _createSkillsVector(skills) {
    const vector = {};
    
    skills.forEach(skill => {
      const normalizedSkill = skill.toLowerCase().trim();
      this.skillsVocabulary.add(normalizedSkill);
      vector[normalizedSkill] = 1;
    });

    return vector;
  }

  /**
   * استخراج experience features
   * @private
   */
  _extractExperienceFeatures(experiences) {
    const totalMonths = experiences.reduce((sum, exp) => sum + (exp.duration || 0), 0);
    const totalYears = Math.floor(totalMonths / 12);
    
    // مستويات الخبرة
    const levels = {
      entry: 0,
      junior: 0,
      mid: 0,
      senior: 0,
      lead: 0
    };

    experiences.forEach(exp => {
      const level = (exp.jobLevel || 'entry').toLowerCase();
      if (levels.hasOwnProperty(level)) {
        levels[level]++;
      }
    });

    // أنواع العمل
    const workTypes = {
      fullTime: 0,
      partTime: 0,
      contract: 0,
      freelance: 0,
      internship: 0
    };

    experiences.forEach(exp => {
      const type = (exp.workType || 'fullTime').toLowerCase();
      const key = type.replace(/[^a-zA-Z]/g, '');
      if (workTypes.hasOwnProperty(key)) {
        workTypes[key]++;
      }
    });

    return {
      totalMonths,
      totalYears,
      experienceCount: experiences.length,
      levels,
      workTypes,
      hasExperience: experiences.length > 0
    };
  }

  /**
   * استخراج education features
   * @private
   */
  _extractEducationFeatures(education) {
    const levelMapping = {
      'high school': 1,
      'diploma': 2,
      'bachelor': 3,
      'master': 4,
      'phd': 5
    };

    let highestLevel = 0;
    let highestLevelName = 'none';

    education.forEach(edu => {
      const level = (edu.level || '').toLowerCase();
      const levelValue = levelMapping[level] || 0;
      
      if (levelValue > highestLevel) {
        highestLevel = levelValue;
        highestLevelName = level;
      }
    });

    return {
      highestLevel,
      highestLevelName,
      educationCount: education.length,
      hasEducation: education.length > 0
    };
  }

  /**
   * استخراج location features
   * @private
   */
  _extractLocationFeatures(country, city) {
    const normalizedCountry = (country || '').toLowerCase().trim();
    const normalizedCity = (city || '').toLowerCase().trim();

    if (normalizedCountry) {
      this.locationVocabulary.add(normalizedCountry);
    }
    if (normalizedCity) {
      this.locationVocabulary.add(normalizedCity);
    }

    return {
      country: normalizedCountry,
      city: normalizedCity,
      hasLocation: !!(normalizedCountry || normalizedCity)
    };
  }

  /**
   * إنشاء text embedding باستخدام TF-IDF
   * @private
   */
  _createTextEmbedding(text) {
    if (!text || text.trim().length === 0) {
      return {};
    }

    // Tokenization
    const tokens = tokenizer.tokenize(text.toLowerCase());
    
    // حساب term frequency
    const termFreq = {};
    tokens.forEach(token => {
      termFreq[token] = (termFreq[token] || 0) + 1;
    });

    // تطبيع القيم
    const maxFreq = Math.max(...Object.values(termFreq));
    const normalized = {};
    
    Object.keys(termFreq).forEach(term => {
      normalized[term] = termFreq[term] / maxFreq;
    });

    return normalized;
  }

  /**
   * استخراج language features
   * @private
   */
  _extractLanguageFeatures(languages) {
    const languageVector = {};
    
    languages.forEach(lang => {
      const langName = (lang.language || lang).toLowerCase().trim();
      const proficiency = lang.proficiency || 'intermediate';
      
      // تحويل مستوى الإتقان إلى رقم
      const proficiencyMap = {
        'beginner': 0.33,
        'intermediate': 0.66,
        'advanced': 1.0,
        'native': 1.0
      };

      languageVector[langName] = proficiencyMap[proficiency.toLowerCase()] || 0.5;
    });

    return {
      languages: languageVector,
      count: languages.length,
      hasMultipleLanguages: languages.length > 1
    };
  }

  /**
   * استخراج job type features
   * @private
   */
  _extractJobTypeFeatures(job) {
    return {
      postingType: job.postingType || 'job',
      jobType: job.jobType || 'full-time',
      priceType: job.priceType || 'monthly',
      isRemote: (job.jobType || '').toLowerCase().includes('remote'),
      isFullTime: (job.jobType || '').toLowerCase().includes('full')
    };
  }

  /**
   * استخراج salary features
   * @private
   */
  _extractSalaryFeatures(job) {
    const salary = job.salary || 0;
    
    // تصنيف الراتب
    let salaryRange = 'not_specified';
    if (salary > 0) {
      if (salary < 3000) salaryRange = 'low';
      else if (salary < 6000) salaryRange = 'medium';
      else if (salary < 10000) salaryRange = 'high';
      else salaryRange = 'very_high';
    }

    return {
      amount: salary,
      range: salaryRange,
      hasSalary: salary > 0
    };
  }

  /**
   * استخراج company features
   * @private
   */
  _extractCompanyFeatures(company) {
    if (!company) {
      return {
        hasCompany: false
      };
    }

    return {
      hasCompany: true,
      companyId: company.id,
      industry: (company.industry || '').toLowerCase().trim()
    };
  }

  /**
   * استخراج course level features
   * @private
   */
  _extractCourseLevelFeatures(level) {
    const levelMapping = {
      'beginner': 1,
      'intermediate': 2,
      'advanced': 3,
      'expert': 4
    };

    const normalizedLevel = (level || 'beginner').toLowerCase();
    
    return {
      level: normalizedLevel,
      levelValue: levelMapping[normalizedLevel] || 1
    };
  }

  /**
   * استخراج category features
   * @private
   */
  _extractCategoryFeatures(category) {
    return {
      category: (category || '').toLowerCase().trim(),
      hasCategory: !!(category && category.trim())
    };
  }

  /**
   * استخراج duration features
   * @private
   */
  _extractDurationFeatures(duration) {
    const durationValue = parseInt(duration) || 0;
    
    let durationRange = 'not_specified';
    if (durationValue > 0) {
      if (durationValue < 10) durationRange = 'short';
      else if (durationValue < 30) durationRange = 'medium';
      else durationRange = 'long';
    }

    return {
      hours: durationValue,
      range: durationRange,
      hasDuration: durationValue > 0
    };
  }

  /**
   * استخراج popularity features
   * @private
   */
  _extractPopularityFeatures(enrolledCount, maxParticipants) {
    const enrolled = enrolledCount || 0;
    const max = maxParticipants || 100;
    
    const fillRate = max > 0 ? (enrolled / max) : 0;
    
    return {
      enrolledCount: enrolled,
      maxParticipants: max,
      fillRate,
      isPopular: fillRate > 0.7
    };
  }

  /**
   * حساب قيمة التفاعل
   * @private
   */
  _calculateInteractionValue(interaction) {
    const baseWeight = interaction.weight || 1;
    const duration = interaction.duration || 0;
    
    // زيادة الوزن بناءً على مدة المشاهدة
    const durationBonus = Math.min(duration / 60, 1); // حتى دقيقة واحدة
    
    return baseWeight * (1 + durationBonus * 0.5);
  }

  /**
   * تحويل المصفوفة إلى dense format
   * @private
   */
  _convertToDenseMatrix(sparseMatrix, userIds, itemIds) {
    const dense = [];
    
    userIds.forEach(userId => {
      const row = [];
      itemIds.forEach(itemId => {
        row.push(sparseMatrix[userId]?.[itemId] || 0);
      });
      dense.push(row);
    });

    return {
      matrix: dense,
      userIds,
      itemIds
    };
  }

  /**
   * حساب sparsity
   * @private
   */
  _calculateSparsity(numUsers, numItems, numInteractions) {
    const totalCells = numUsers * numItems;
    const filledCells = numInteractions;
    
    return totalCells > 0 ? 1 - (filledCells / totalCells) : 1;
  }

  /**
   * استخراج vocabulary من TF-IDF
   * @private
   */
  _extractVocabulary(tfidf, numDocs) {
    const vocabulary = new Set();
    
    for (let i = 0; i < numDocs; i++) {
      tfidf.listTerms(i).forEach(item => {
        vocabulary.add(item.term);
      });
    }

    return Array.from(vocabulary);
  }
}

// تصدير instance واحد من الخدمة
module.exports = new FeatureEngineeringService();
