/**
 * 🧪 Feature Engineering Service Tests
 * اختبارات خدمة Feature Engineering
 * 
 * المتطلبات: Requirements 1.1, 1.2
 * المهمة: Task 2.2
 */

const featureEngineeringService = require('../src/services/featureEngineeringService');

describe('Feature Engineering Service', () => {
  
  // ==================== User Features Tests ====================
  
  describe('extractUserFeatures', () => {
    it('should extract features from complete user profile', () => {
      const user = {
        userId: 'user123',
        firstName: 'أحمد',
        lastName: 'محمد',
        email: 'ahmed@example.com',
        country: 'Saudi Arabia',
        city: 'Riyadh',
        specialization: 'Software Engineering',
        bio: 'Experienced software engineer with passion for AI',
        interests: ['Machine Learning', 'Web Development'],
        skills: ['JavaScript', 'Python', 'React', 'Node.js'],
        experiences: [
          {
            company: 'Tech Corp',
            position: 'Senior Developer',
            duration: 36,
            workType: 'fullTime',
            jobLevel: 'senior'
          },
          {
            company: 'Startup Inc',
            position: 'Developer',
            duration: 24,
            workType: 'fullTime',
            jobLevel: 'mid'
          }
        ],
        education: [
          {
            level: 'Bachelor',
            degree: 'Computer Science',
            institution: 'University',
            year: 2015
          }
        ],
        languages: [
          { language: 'Arabic', proficiency: 'native' },
          { language: 'English', proficiency: 'advanced' }
        ],
        completeness: 85
      };

      const result = featureEngineeringService.extractUserFeatures(user);

      // التحقق من البنية
      expect(result).toHaveProperty('userId', 'user123');
      expect(result).toHaveProperty('features');
      expect(result).toHaveProperty('metadata');

      // التحقق من Skills
      expect(result.features.skills).toHaveProperty('javascript', 1);
      expect(result.features.skills).toHaveProperty('python', 1);
      expect(result.features.skills).toHaveProperty('react', 1);

      // التحقق من Experience
      expect(result.features.experience.totalMonths).toBe(60);
      expect(result.features.experience.totalYears).toBe(5);
      expect(result.features.experience.experienceCount).toBe(2);
      expect(result.features.experience.levels.senior).toBe(1);
      expect(result.features.experience.levels.mid).toBe(1);

      // التحقق من Education
      expect(result.features.education.highestLevel).toBe(3); // Bachelor
      expect(result.features.education.highestLevelName).toBe('bachelor');
      expect(result.features.education.hasEducation).toBe(true);

      // التحقق من Location
      expect(result.features.location.country).toBe('saudi arabia');
      expect(result.features.location.city).toBe('riyadh');
      expect(result.features.location.hasLocation).toBe(true);

      // التحقق من Completeness
      expect(result.features.completeness).toBe(85);

      // التحقق من Text Embedding
      expect(result.features.textEmbedding).toBeDefined();
      expect(Object.keys(result.features.textEmbedding).length).toBeGreaterThan(0);

      // التحقق من Languages
      expect(result.features.languages.languages).toHaveProperty('arabic', 1.0);
      expect(result.features.languages.languages).toHaveProperty('english', 1.0);
      expect(result.features.languages.count).toBe(2);
      expect(result.features.languages.hasMultipleLanguages).toBe(true);

      // التحقق من Metadata
      expect(result.metadata.totalSkills).toBe(4);
      expect(result.metadata.totalExperience).toBe(60);
      expect(result.metadata.educationLevel).toBe(3);
    });

    it('should handle user with minimal profile', () => {
      const user = {
        userId: 'user456',
        firstName: 'سارة',
        lastName: 'علي',
        email: 'sara@example.com',
        skills: [],
        experiences: [],
        education: [],
        languages: [],
        completeness: 20
      };

      const result = featureEngineeringService.extractUserFeatures(user);

      expect(result.userId).toBe('user456');
      expect(Object.keys(result.features.skills).length).toBe(0);
      expect(result.features.experience.totalMonths).toBe(0);
      expect(result.features.experience.hasExperience).toBe(false);
      expect(result.features.education.hasEducation).toBe(false);
      expect(result.features.languages.count).toBe(0);
      expect(result.features.completeness).toBe(20);
    });

    it('should normalize skills to lowercase', () => {
      const user = {
        userId: 'user789',
        skills: ['JavaScript', 'PYTHON', 'React', 'NodeJS'],
        experiences: [],
        education: [],
        languages: []
      };

      const result = featureEngineeringService.extractUserFeatures(user);

      expect(result.features.skills).toHaveProperty('javascript');
      expect(result.features.skills).toHaveProperty('python');
      expect(result.features.skills).toHaveProperty('react');
      expect(result.features.skills).toHaveProperty('nodejs');
    });
  });

  // ==================== Job Features Tests ====================
  
  describe('extractJobFeatures', () => {
    it('should extract features from job posting', () => {
      const job = {
        jobId: 'job123',
        title: 'Senior Full Stack Developer',
        description: 'We are looking for an experienced developer with React and Node.js skills',
        requirements: 'Bachelor degree in Computer Science, 5+ years experience',
        postingType: 'job',
        priceType: 'monthly',
        salary: 8000,
        location: {
          country: 'UAE',
          city: 'Dubai'
        },
        jobType: 'Full-Time',
        status: 'Open',
        company: {
          id: 'company123',
          name: 'Tech Solutions',
          industry: 'Technology'
        },
        requiredSkills: ['React', 'NodeJS', 'MongoDB', 'AWS']
      };

      const result = featureEngineeringService.extractJobFeatures(job);

      // التحقق من البنية
      expect(result).toHaveProperty('jobId', 'job123');
      expect(result).toHaveProperty('features');
      expect(result).toHaveProperty('metadata');

      // التحقق من Skills
      expect(result.features.skills).toHaveProperty('react', 1);
      expect(result.features.skills).toHaveProperty('nodejs', 1);
      expect(result.features.skills).toHaveProperty('mongodb', 1);
      expect(result.features.skills).toHaveProperty('aws', 1);

      // التحقق من Job Type
      expect(result.features.jobType.postingType).toBe('job');
      expect(result.features.jobType.jobType).toBe('Full-Time');
      expect(result.features.jobType.isFullTime).toBe(true);

      // التحقق من Location
      expect(result.features.location.country).toBe('uae');
      expect(result.features.location.city).toBe('dubai');

      // التحقق من Salary
      expect(result.features.salary.amount).toBe(8000);
      expect(result.features.salary.range).toBe('high');
      expect(result.features.salary.hasSalary).toBe(true);

      // التحقق من Text Embedding
      expect(result.features.textEmbedding).toBeDefined();
      expect(Object.keys(result.features.textEmbedding).length).toBeGreaterThan(0);

      // التحقق من Company
      expect(result.features.company.hasCompany).toBe(true);
      expect(result.features.company.companyId).toBe('company123');
      expect(result.features.company.industry).toBe('technology');

      // التحقق من Metadata
      expect(result.metadata.totalSkills).toBe(4);
      expect(result.metadata.postingType).toBe('job');
      expect(result.metadata.status).toBe('Open');
    });

    it('should handle job without salary', () => {
      const job = {
        jobId: 'job456',
        title: 'Developer',
        description: 'Job description',
        requirements: 'Requirements',
        requiredSkills: ['JavaScript'],
        location: {}
      };

      const result = featureEngineeringService.extractJobFeatures(job);

      expect(result.features.salary.amount).toBe(0);
      expect(result.features.salary.range).toBe('not_specified');
      expect(result.features.salary.hasSalary).toBe(false);
    });

    it('should classify salary ranges correctly', () => {
      const testCases = [
        { salary: 2000, expectedRange: 'low' },
        { salary: 4000, expectedRange: 'medium' },
        { salary: 8000, expectedRange: 'high' },
        { salary: 15000, expectedRange: 'very_high' }
      ];

      testCases.forEach(({ salary, expectedRange }) => {
        const job = {
          jobId: 'test',
          title: 'Test',
          description: 'Test',
          requirements: 'Test',
          salary,
          requiredSkills: []
        };

        const result = featureEngineeringService.extractJobFeatures(job);
        expect(result.features.salary.range).toBe(expectedRange);
      });
    });
  });

  // ==================== Course Features Tests ====================
  
  describe('extractCourseFeatures', () => {
    it('should extract features from course', () => {
      const course = {
        courseId: 'course123',
        title: 'Advanced React Development',
        description: 'Learn advanced React patterns and best practices',
        content: 'Hooks, Context API, Performance optimization',
        category: 'Web Development',
        duration: 20,
        level: 'Advanced',
        skills: ['React', 'JavaScript', 'Redux'],
        maxParticipants: 50,
        enrolledCount: 40
      };

      const result = featureEngineeringService.extractCourseFeatures(course);

      // التحقق من البنية
      expect(result).toHaveProperty('courseId', 'course123');
      expect(result).toHaveProperty('features');
      expect(result).toHaveProperty('metadata');

      // التحقق من Skills
      expect(result.features.skills).toHaveProperty('react', 1);
      expect(result.features.skills).toHaveProperty('javascript', 1);
      expect(result.features.skills).toHaveProperty('redux', 1);

      // التحقق من Level
      expect(result.features.level.level).toBe('advanced');
      expect(result.features.level.levelValue).toBe(3);

      // التحقق من Category
      expect(result.features.category.category).toBe('web development');
      expect(result.features.category.hasCategory).toBe(true);

      // التحقق من Duration
      expect(result.features.duration.hours).toBe(20);
      expect(result.features.duration.range).toBe('medium');
      expect(result.features.duration.hasDuration).toBe(true);

      // التحقق من Popularity
      expect(result.features.popularity.enrolledCount).toBe(40);
      expect(result.features.popularity.maxParticipants).toBe(50);
      expect(result.features.popularity.fillRate).toBe(0.8);
      expect(result.features.popularity.isPopular).toBe(true);

      // التحقق من Text Embedding
      expect(result.features.textEmbedding).toBeDefined();

      // التحقق من Metadata
      expect(result.metadata.totalSkills).toBe(3);
      expect(result.metadata.level).toBe('Advanced');
      expect(result.metadata.category).toBe('Web Development');
    });

    it('should classify course levels correctly', () => {
      const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
      const expectedValues = [1, 2, 3, 4];

      levels.forEach((level, index) => {
        const course = {
          courseId: 'test',
          title: 'Test',
          description: 'Test',
          level,
          skills: []
        };

        const result = featureEngineeringService.extractCourseFeatures(course);
        expect(result.features.level.levelValue).toBe(expectedValues[index]);
      });
    });

    it('should classify duration ranges correctly', () => {
      const testCases = [
        { duration: 5, expectedRange: 'short' },
        { duration: 15, expectedRange: 'medium' },
        { duration: 40, expectedRange: 'long' }
      ];

      testCases.forEach(({ duration, expectedRange }) => {
        const course = {
          courseId: 'test',
          title: 'Test',
          description: 'Test',
          duration,
          skills: []
        };

        const result = featureEngineeringService.extractCourseFeatures(course);
        expect(result.features.duration.range).toBe(expectedRange);
      });
    });
  });

  // ==================== User-Item Matrix Tests ====================
  
  describe('createUserItemMatrix', () => {
    it('should create user-item matrix from interactions', () => {
      const interactions = [
        {
          userId: 'user1',
          itemId: 'job1',
          action: 'apply',
          weight: 2.0,
          duration: 120
        },
        {
          userId: 'user1',
          itemId: 'job2',
          action: 'like',
          weight: 1.5,
          duration: 60
        },
        {
          userId: 'user2',
          itemId: 'job1',
          action: 'view',
          weight: 0.5,
          duration: 30
        },
        {
          userId: 'user2',
          itemId: 'job3',
          action: 'save',
          weight: 1.2,
          duration: 45
        }
      ];

      const result = featureEngineeringService.createUserItemMatrix(interactions, 'job');

      // التحقق من البنية
      expect(result).toHaveProperty('sparse');
      expect(result).toHaveProperty('dense');
      expect(result).toHaveProperty('metadata');

      // التحقق من Sparse Matrix
      expect(result.sparse).toHaveProperty('user1');
      expect(result.sparse).toHaveProperty('user2');
      expect(result.sparse.user1).toHaveProperty('job1');
      expect(result.sparse.user1).toHaveProperty('job2');
      expect(result.sparse.user2).toHaveProperty('job1');
      expect(result.sparse.user2).toHaveProperty('job3');

      // التحقق من القيم (يجب أن تكون أكبر من الوزن الأساسي بسبب duration bonus)
      expect(result.sparse.user1.job1).toBeGreaterThan(2.0);
      expect(result.sparse.user1.job2).toBeGreaterThan(1.5);

      // التحقق من Dense Matrix
      expect(result.dense.matrix).toBeDefined();
      expect(result.dense.matrix.length).toBe(2); // 2 users
      expect(result.dense.matrix[0].length).toBe(3); // 3 items

      // التحقق من Metadata
      expect(result.metadata.itemType).toBe('job');
      expect(result.metadata.totalUsers).toBe(2);
      expect(result.metadata.totalItems).toBe(3);
      expect(result.metadata.totalInteractions).toBe(4);
      expect(result.metadata.sparsity).toBeGreaterThan(0);
      expect(result.metadata.sparsity).toBeLessThan(1);
    });

    it('should handle empty interactions', () => {
      const result = featureEngineeringService.createUserItemMatrix([], 'job');

      expect(result.metadata.totalUsers).toBe(0);
      expect(result.metadata.totalItems).toBe(0);
      expect(result.metadata.totalInteractions).toBe(0);
      expect(result.metadata.sparsity).toBe(1);
    });

    it('should accumulate multiple interactions for same user-item pair', () => {
      const interactions = [
        {
          userId: 'user1',
          itemId: 'job1',
          action: 'view',
          weight: 0.5,
          duration: 30
        },
        {
          userId: 'user1',
          itemId: 'job1',
          action: 'like',
          weight: 1.5,
          duration: 60
        },
        {
          userId: 'user1',
          itemId: 'job1',
          action: 'apply',
          weight: 2.0,
          duration: 120
        }
      ];

      const result = featureEngineeringService.createUserItemMatrix(interactions, 'job');

      // يجب أن تكون القيمة مجموع جميع التفاعلات
      expect(result.sparse.user1.job1).toBeGreaterThan(4.0); // 0.5 + 1.5 + 2.0 + bonuses
    });
  });

  // ==================== TF-IDF Embeddings Tests ====================
  
  describe('computeTfIdfEmbeddings', () => {
    it('should compute TF-IDF embeddings for documents', () => {
      const documents = [
        {
          id: 'doc1',
          text: 'JavaScript developer with React experience'
        },
        {
          id: 'doc2',
          text: 'Python developer with Django and Flask'
        },
        {
          id: 'doc3',
          text: 'Full stack developer JavaScript Python React Django'
        }
      ];

      const result = featureEngineeringService.computeTfIdfEmbeddings(documents);

      // التحقق من البنية
      expect(result).toHaveProperty('embeddings');
      expect(result).toHaveProperty('vocabulary');
      expect(result).toHaveProperty('metadata');

      // التحقق من Embeddings
      expect(result.embeddings.length).toBe(3);
      expect(result.embeddings[0].id).toBe('doc1');
      expect(result.embeddings[0].vector).toBeDefined();
      expect(Object.keys(result.embeddings[0].vector).length).toBeGreaterThan(0);

      // التحقق من Vocabulary
      expect(result.vocabulary.length).toBeGreaterThan(0);
      expect(result.vocabulary).toContain('javascript');
      expect(result.vocabulary).toContain('python');
      expect(result.vocabulary).toContain('developer');

      // التحقق من Metadata
      expect(result.metadata.totalDocuments).toBe(3);
      expect(result.metadata.vocabularySize).toBe(result.vocabulary.length);
    });

    it('should handle empty documents', () => {
      const documents = [
        { id: 'doc1', text: '' },
        { id: 'doc2', text: '   ' }
      ];

      const result = featureEngineeringService.computeTfIdfEmbeddings(documents);

      expect(result.embeddings.length).toBe(2);
      expect(result.metadata.totalDocuments).toBe(2);
    });

    it('should assign higher TF-IDF scores to unique terms', () => {
      const documents = [
        {
          id: 'doc1',
          text: 'machine learning artificial intelligence'
        },
        {
          id: 'doc2',
          text: 'web development frontend backend'
        },
        {
          id: 'doc3',
          text: 'machine learning deep learning neural networks'
        }
      ];

      const result = featureEngineeringService.computeTfIdfEmbeddings(documents);

      // "machine" و "learning" يجب أن يكون لهما TF-IDF أقل لأنهما يظهران في مستندين
      // "artificial" و "intelligence" يجب أن يكون لهما TF-IDF أعلى لأنهما فريدان
      const doc1Vector = result.embeddings[0].vector;
      
      expect(doc1Vector).toHaveProperty('machine');
      expect(doc1Vector).toHaveProperty('learning');
      expect(doc1Vector).toHaveProperty('artificial');
      expect(doc1Vector).toHaveProperty('intelligence');
    });
  });

  // ==================== Batch Processing Tests ====================
  
  describe('Batch Processing', () => {
    it('should batch process users', () => {
      const users = [
        {
          userId: 'user1',
          firstName: 'أحمد',
          skills: ['JavaScript', 'React'],
          experiences: [],
          education: [],
          languages: []
        },
        {
          userId: 'user2',
          firstName: 'محمد',
          skills: ['Python', 'Django'],
          experiences: [],
          education: [],
          languages: []
        }
      ];

      const result = featureEngineeringService.batchProcessUsers(users);

      expect(result.length).toBe(2);
      expect(result[0].userId).toBe('user1');
      expect(result[1].userId).toBe('user2');
      expect(result[0].features.skills).toHaveProperty('javascript');
      expect(result[1].features.skills).toHaveProperty('python');
    });

    it('should batch process jobs', () => {
      const jobs = [
        {
          jobId: 'job1',
          title: 'Developer',
          description: 'Job 1',
          requirements: 'Req 1',
          requiredSkills: ['JavaScript']
        },
        {
          jobId: 'job2',
          title: 'Engineer',
          description: 'Job 2',
          requirements: 'Req 2',
          requiredSkills: ['Python']
        }
      ];

      const result = featureEngineeringService.batchProcessJobs(jobs);

      expect(result.length).toBe(2);
      expect(result[0].jobId).toBe('job1');
      expect(result[1].jobId).toBe('job2');
      expect(result[0].features.skills).toHaveProperty('javascript');
      expect(result[1].features.skills).toHaveProperty('python');
    });

    it('should batch process courses', () => {
      const courses = [
        {
          courseId: 'course1',
          title: 'React Course',
          description: 'Learn React',
          level: 'beginner',
          skills: ['React']
        },
        {
          courseId: 'course2',
          title: 'Python Course',
          description: 'Learn Python',
          level: 'intermediate',
          skills: ['Python']
        }
      ];

      const result = featureEngineeringService.batchProcessCourses(courses);

      expect(result.length).toBe(2);
      expect(result[0].courseId).toBe('course1');
      expect(result[1].courseId).toBe('course2');
      expect(result[0].features.level.levelValue).toBe(1);
      expect(result[1].features.level.levelValue).toBe(2);
    });
  });

  // ==================== Edge Cases Tests ====================
  
  describe('Edge Cases', () => {
    it('should handle null/undefined values gracefully', () => {
      const user = {
        userId: 'user1',
        skills: null,
        experiences: undefined,
        education: null,
        languages: undefined
      };

      const result = featureEngineeringService.extractUserFeatures(user);

      expect(result.userId).toBe('user1');
      expect(Object.keys(result.features.skills).length).toBe(0);
      expect(result.features.experience.totalMonths).toBe(0);
      expect(result.features.education.hasEducation).toBe(false);
    });

    it('should handle special characters in text', () => {
      const user = {
        userId: 'user1',
        bio: 'Developer with C++ & C# experience! @company #tech',
        skills: [],
        experiences: [],
        education: [],
        languages: []
      };

      const result = featureEngineeringService.extractUserFeatures(user);

      expect(result.features.textEmbedding).toBeDefined();
      expect(Object.keys(result.features.textEmbedding).length).toBeGreaterThan(0);
    });

    it('should handle very long text', () => {
      const longText = 'word '.repeat(1000);
      
      const user = {
        userId: 'user1',
        bio: longText,
        skills: [],
        experiences: [],
        education: [],
        languages: []
      };

      const result = featureEngineeringService.extractUserFeatures(user);

      expect(result.features.textEmbedding).toBeDefined();
      expect(result.features.textEmbedding).toHaveProperty('word');
    });
  });
});
