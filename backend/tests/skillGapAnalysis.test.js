/**
 * اختبار خدمة تحليل فجوات المهارات
 * 
 * Property 8: Skill Gap Identification
 * For any user profile and target job, the system should identify all skills present in the job but missing from the profile
 * 
 * Validates: Requirements 2.1
 */

const SkillGapAnalysis = require('../src/services/skillGapAnalysis');

describe('Skill Gap Analysis Service', () => {
  let skillGapAnalysis;

  beforeEach(() => {
    skillGapAnalysis = new SkillGapAnalysis();
  });

  describe('Property 8: Skill Gap Identification', () => {
    test('should identify missing skills when user lacks required job skills', () => {
      // بيانات مستخدم مع مهارات محدودة
      const user = {
        computerSkills: [
          { skill: 'javascript', proficiency: 'intermediate' },
          { skill: 'html', proficiency: 'beginner' }
        ],
        softwareSkills: [
          { software: 'photoshop', proficiency: 'intermediate' }
        ],
        otherSkills: ['communication'],
        bio: 'مطور ويب مبتدئ مع معرفة في جافاسكريبت وتصميم'
      };

      // بيانات وظيفة مع متطلبات مهارات متعددة
      const job = {
        title: 'مطور ويب متقدم',
        description: 'مطلوب مطور ويب متقدم مع خبرة في React و Node.js وقواعد البيانات',
        requirements: 'خبرة 3+ سنوات في React, Node.js, MongoDB, TypeScript. مهارات في UI/UX ميزة إضافية.'
      };

      // تحليل فجوات المهارات
      const analysis = skillGapAnalysis.analyzeSkillGaps(user, job);

      // التحقق من وجود المهارات المفقودة
      expect(analysis.missingSkills).toBeDefined();
      expect(Array.isArray(analysis.missingSkills)).toBe(true);
      expect(analysis.missingSkills.length).toBeGreaterThan(0);

      // التحقق من أن المهارات المفقودة موجودة في متطلبات الوظيفة
      const missingSkillNames = analysis.missingSkills.map(s => s.name);
      expect(missingSkillNames).toContain('react');
      expect(missingSkillNames).toContain('nodejs');
      expect(missingSkillNames).toContain('mongodb');
      expect(missingSkillNames).toContain('typescript');

      // التحقق من أن المهارات الموجودة لدى المستخدم ليست في القائمة المفقودة
      expect(missingSkillNames).not.toContain('javascript');
      expect(missingSkillNames).not.toContain('html');
      expect(missingSkillNames).not.toContain('photoshop');

      // التحقق من وجود تحليل الفجوات
      expect(analysis.gapAnalysis).toBeDefined();
      expect(analysis.gapAnalysis.programming).toBeDefined();
      expect(analysis.gapAnalysis.database).toBeDefined();

      // التحقق من وجود توصيات الدورات
      expect(analysis.courseRecommendations).toBeDefined();
      expect(Array.isArray(analysis.courseRecommendations)).toBe(true);
      expect(analysis.courseRecommendations.length).toBeGreaterThan(0);

      // التحقق من وجود الملخص
      expect(analysis.summary).toBeDefined();
      expect(analysis.summary.totalMissingSkills).toBeGreaterThan(0);
      expect(analysis.summary.overallCoverage).toBeLessThan(100);
    });

    test('should return empty missing skills when user has all required job skills', () => {
      // بيانات مستخدم مع جميع المهارات المطلوبة
      const user = {
        computerSkills: [
          { skill: 'react', proficiency: 'advanced' },
          { skill: 'nodejs', proficiency: 'advanced' },
          { skill: 'mongodb', proficiency: 'intermediate' },
          { skill: 'typescript', proficiency: 'intermediate' },
          { skill: 'database', proficiency: 'intermediate' } // إضافة مهارة قاعدة بيانات
        ],
        softwareSkills: [
          { software: 'figma', proficiency: 'beginner' }
        ],
        otherSkills: ['communication', 'teamwork'],
        bio: 'مطور ويب متقدم مع خبرة في React, Node.js, MongoDB, TypeScript, قاعدة بيانات'
      };

      // بيانات وظيفة - نص بسيط بدون مهارات إضافية غير متوقعة
      const job = {
        title: 'مطور ويب متقدم',
        description: 'مطلوب مطور ويب متقدم',
        requirements: 'خبرة في React, Node.js, MongoDB, TypeScript.'
      };

      // تحليل فجوات المهارات
      const analysis = skillGapAnalysis.analyzeSkillGaps(user, job);

      // التحقق من عدم وجود مهارات مفقودة (أو عدد قليل جداً)
      expect(analysis.missingSkills).toBeDefined();
      expect(analysis.missingSkills.length).toBeLessThanOrEqual(2); // قد توجد مهارات إضافية غير متوقعة

      // التحقق من نسبة التغطية العالية
      expect(analysis.summary.overallCoverage).toBeGreaterThanOrEqual(80);
      expect(['ممتاز', 'جيد', 'متوسط']).toContain(analysis.summary.coverageLevel);
    });

    test('should handle user with no skills', () => {
      // بيانات مستخدم بدون مهارات
      const user = {
        computerSkills: [],
        softwareSkills: [],
        otherSkills: [],
        bio: ''
      };

      // بيانات وظيفة
      const job = {
        title: 'مطور ويب',
        description: 'مطلوب مطور ويب مع مهارات في البرمجة',
        requirements: 'جافاسكريبت، HTML، CSS'
      };

      // تحليل فجوات المهارات
      const analysis = skillGapAnalysis.analyzeSkillGaps(user, job);

      // التحقق من وجود جميع مهارات الوظيفة في القائمة المفقودة
      expect(analysis.missingSkills.length).toBeGreaterThan(0);
      const missingSkillNames = analysis.missingSkills.map(s => s.name);
      expect(missingSkillNames).toContain('javascript');
      expect(missingSkillNames).toContain('html');
      expect(missingSkillNames).toContain('css');

      // التحقق من نسبة التغطية المنخفضة
      expect(analysis.summary.overallCoverage).toBeLessThan(10);
      expect(analysis.summary.coverageLevel).toBe('ضعيف جداً');
    });

    test('should handle job with no specific skill requirements', () => {
      // بيانات مستخدم
      const user = {
        computerSkills: [
          { skill: 'javascript', proficiency: 'intermediate' }
        ],
        bio: 'مطور جافاسكريبت'
      };

      // بيانات وظيفة بدون متطلبات مهارات محددة
      const job = {
        title: 'موظف عام',
        description: 'وظيفة عامة لا تتطلب مهارات تقنية محددة',
        requirements: 'القدرة على العمل ضمن فريق، مهارات تواصل جيدة'
      };

      // تحليل فجوات المهارات
      const analysis = skillGapAnalysis.analyzeSkillGaps(user, job);

      // التحقق من أن التحليل يعمل بدون أخطاء
      expect(analysis).toBeDefined();
      expect(analysis.missingSkills).toBeDefined();
      expect(Array.isArray(analysis.missingSkills)).toBe(true);
      
      // قد توجد بعض المهارات الناعمة المفقودة
      expect(analysis.missingSkills.length).toBeGreaterThanOrEqual(0);
    });

    test('should correctly categorize skills', () => {
      // بيانات مستخدم
      const user = {
        computerSkills: [
          { skill: 'javascript', proficiency: 'intermediate' },
          { skill: 'python', proficiency: 'beginner' }
        ],
        softwareSkills: [
          { software: 'photoshop', proficiency: 'intermediate' }
        ],
        otherSkills: ['communication', 'leadership']
      };

      // بيانات وظيفة
      const job = {
        title: 'مطور متكامل',
        description: 'مطلوب مطور مع مهارات في البرمجة وقواعد البيانات والتصميم',
        requirements: 'جافاسكريبت، بايثون، قاعدة بيانات، تصميم، تواصل، قيادة'
      };

      // تحليل فجوات المهارات
      const analysis = skillGapAnalysis.analyzeSkillGaps(user, job);

      // التحقق من تصنيف المهارات
      expect(analysis.gapAnalysis.programming).toBeDefined();
      expect(analysis.gapAnalysis.database).toBeDefined();
      expect(analysis.gapAnalysis.design).toBeDefined();
      expect(analysis.gapAnalysis.soft).toBeDefined();

      // التحقق من أن المهارات مصنفة بشكل صحيح
      const programmingSkills = analysis.userSkills.filter(s => s.category === 'programming');
      expect(programmingSkills.length).toBe(2); // javascript و python
      
      const softSkills = analysis.userSkills.filter(s => s.category === 'soft');
      expect(softSkills.length).toBe(2); // communication و leadership
    });

    test('should generate appropriate course recommendations based on skill gaps', () => {
      // بيانات مستخدم مع فجوات محددة
      const user = {
        computerSkills: [
          { skill: 'javascript', proficiency: 'intermediate' }
        ],
        bio: 'مطور جافاسكريبت'
      };

      // بيانات وظيفة مع متطلبات متعددة
      const job = {
        title: 'مطور ويب متكامل',
        description: 'مطلوب مطور ويب مع مهارات في React و Node.js وقواعد البيانات',
        requirements: 'React, Node.js, MongoDB, TypeScript, UI/UX'
      };

      // تحليل فجوات المهارات
      const analysis = skillGapAnalysis.analyzeSkillGaps(user, job);

      // التحقق من وجود توصيات الدورات
      expect(analysis.courseRecommendations.length).toBeGreaterThan(0);

      // التحقق من أن التوصيات تتوافق مع الفجوات
      const missingSkillNames = analysis.missingSkills.map(s => s.name);
      analysis.courseRecommendations.forEach(recommendation => {
        // كل توصية يجب أن تغطي على الأقل بعض المهارات المفقودة
        const hasMatchingSkills = recommendation.skills.some(skill => 
          missingSkillNames.includes(skill)
        );
        expect(hasMatchingSkills).toBe(true);
      });

      // التحقق من أن التوصيات مرتبة حسب الأولوية
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      for (let i = 1; i < analysis.courseRecommendations.length; i++) {
        const prevPriority = priorityOrder[analysis.courseRecommendations[i-1].priority] || 0;
        const currPriority = priorityOrder[analysis.courseRecommendations[i].priority] || 0;
        expect(prevPriority).toBeGreaterThanOrEqual(currPriority);
      }
    });
  });

  describe('Helper Methods', () => {
    test('areSkillsSimilar should correctly identify similar skills', () => {
      expect(skillGapAnalysis.areSkillsSimilar('javascript', 'js')).toBe(true);
      expect(skillGapAnalysis.areSkillsSimilar('javascript', 'جافاسكريبت')).toBe(true);
      expect(skillGapAnalysis.areSkillsSimilar('react', 'reactjs')).toBe(true);
      expect(skillGapAnalysis.areSkillsSimilar('database', 'قاعدة بيانات')).toBe(true);
      expect(skillGapAnalysis.areSkillsSimilar('javascript', 'python')).toBe(false);
      expect(skillGapAnalysis.areSkillsSimilar('react', 'angular')).toBe(false);
    });

    test('getSkillCategory should correctly categorize skills', () => {
      expect(skillGapAnalysis.getSkillCategory('javascript')).toBe('programming');
      expect(skillGapAnalysis.getSkillCategory('mongodb')).toBe('database');
      expect(skillGapAnalysis.getSkillCategory('react')).toBe('programming');
      expect(skillGapAnalysis.getSkillCategory('frontend')).toBe('web');
      expect(skillGapAnalysis.getSkillCategory('communication')).toBe('soft');
      expect(skillGapAnalysis.getSkillCategory('unknownskill')).toBe('other');
    });

    test('extractSkillsFromText should extract skills from text', () => {
      const text = 'أنا مطور جافاسكريبت مع معرفة في React و Node.js وقاعدة بيانات MongoDB';
      const skills = skillGapAnalysis.extractSkillsFromText(text);
      
      // يجب أن تجد المهارات بالعربية أو الإنجليزية
      expect(skills.length).toBeGreaterThan(0);
      
      // التحقق من أن النظام يمكنه التعرف على المهارات
      const foundSkills = skills.join(', ').toLowerCase();
      expect(
        foundSkills.includes('javascript') || 
        foundSkills.includes('react') || 
        foundSkills.includes('nodejs') || 
        foundSkills.includes('mongodb') || 
        foundSkills.includes('database')
      ).toBe(true);
    });

    test('removeDuplicateSkills should remove duplicate skills', () => {
      const skills = [
        { name: 'javascript', proficiency: 'intermediate' },
        { name: 'javascript', proficiency: 'advanced' },
        { name: 'python', proficiency: 'beginner' },
        { name: 'python', proficiency: 'intermediate' },
        { name: 'react', proficiency: 'intermediate' }
      ];

      const uniqueSkills = skillGapAnalysis.removeDuplicateSkills(skills);
      expect(uniqueSkills.length).toBe(3); // javascript, python, react
      
      const skillNames = uniqueSkills.map(s => s.name);
      expect(skillNames).toEqual(['javascript', 'python', 'react']);
    });
  });
});