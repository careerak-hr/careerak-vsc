/**
 * CV Parser Service
 * خدمة تحليل السيرة الذاتية واستخراج المعلومات تلقائياً
 * 
 * الميزات:
 * - استخراج النص من PDF/DOCX
 * - استخراج المهارات (Skills)
 * - استخراج الخبرات (Experience)
 * - استخراج التعليم (Education)
 * - استخراج معلومات الاتصال
 */

const pdf = require('pdf-parse');
const mammoth = require('mammoth');

class CVParserService {
  constructor() {
    // قائمة المهارات المعروفة (يمكن توسيعها)
    this.knownSkills = this.loadKnownSkills();
    
    // أنماط regex للاستخراج
    this.patterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
      linkedin: /linkedin\.com\/in\/[\w-]+/gi,
      github: /github\.com\/[\w-]+/gi,
      
      // أنماط التواريخ
      dateRange: /(\d{4})\s*[-–—]\s*(\d{4}|present|current|الآن|حالياً)/gi,
      monthYear: /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر)\s+\d{4}/gi,
      
      // أنماط الدرجات العلمية
      degree: /(bachelor|master|phd|doctorate|diploma|بكالوريوس|ماجستير|دكتوراه|دبلوم)/gi,
    };
    
    // كلمات مفتاحية للأقسام
    this.sectionKeywords = {
      experience: ['experience', 'work history', 'employment', 'خبرة', 'الخبرات', 'العمل'],
      education: ['education', 'academic', 'qualification', 'تعليم', 'التعليم', 'المؤهلات'],
      skills: ['skills', 'technical skills', 'competencies', 'مهارات', 'المهارات', 'الكفاءات'],
      summary: ['summary', 'profile', 'objective', 'ملخص', 'نبذة', 'الهدف'],
    };
  }

  /**
   * تحميل قائمة المهارات المعروفة
   */
  loadKnownSkills() {
    return [
      // Programming Languages
      'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift',
      'kotlin', 'typescript', 'scala', 'r', 'matlab', 'perl', 'shell', 'bash',
      
      // Web Technologies
      'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
      'spring', 'asp.net', 'laravel', 'jquery', 'bootstrap', 'tailwind', 'sass', 'webpack',
      
      // Databases
      'mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'sql server', 'sqlite',
      'cassandra', 'elasticsearch', 'dynamodb',
      
      // Cloud & DevOps
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github actions',
      'terraform', 'ansible', 'ci/cd', 'linux', 'nginx', 'apache',
      
      // Mobile
      'android', 'ios', 'react native', 'flutter', 'xamarin', 'ionic',
      
      // Data Science & AI
      'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
      'pandas', 'numpy', 'data analysis', 'nlp', 'computer vision',
      
      // Soft Skills
      'leadership', 'communication', 'teamwork', 'problem solving', 'project management',
      'agile', 'scrum', 'time management',
      
      // Arabic Skills
      'جافاسكريبت', 'بايثون', 'جافا', 'تطوير ويب', 'قواعد بيانات', 'تعلم آلي',
      'ذكاء اصطناعي', 'إدارة مشاريع', 'قيادة', 'تواصل', 'عمل جماعي',
    ];
  }

  /**
   * استخراج النص من ملف PDF
   */
  async extractTextFromPDF(buffer) {
    try {
      const data = await pdf(buffer);
      return data.text;
    } catch (error) {
      throw new Error(`فشل استخراج النص من PDF: ${error.message}`);
    }
  }

  /**
   * استخراج النص من ملف DOCX
   */
  async extractTextFromDOCX(buffer) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      throw new Error(`فشل استخراج النص من DOCX: ${error.message}`);
    }
  }

  /**
   * استخراج النص من ملف TXT
   */
  extractTextFromTXT(buffer) {
    return buffer.toString('utf-8');
  }

  /**
   * استخراج النص من ملف حسب نوعه
   */
  async extractText(buffer, mimeType) {
    if (mimeType === 'application/pdf') {
      return await this.extractTextFromPDF(buffer);
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return await this.extractTextFromDOCX(buffer);
    } else if (mimeType === 'text/plain') {
      return this.extractTextFromTXT(buffer);
    } else {
      throw new Error(`نوع الملف غير مدعوم: ${mimeType}`);
    }
  }

  /**
   * استخراج معلومات الاتصال
   */
  extractContactInfo(text) {
    const emails = text.match(this.patterns.email) || [];
    const phones = text.match(this.patterns.phone) || [];
    const linkedin = text.match(this.patterns.linkedin) || [];
    const github = text.match(this.patterns.github) || [];

    return {
      emails: [...new Set(emails)],
      phones: [...new Set(phones)],
      linkedin: linkedin.length > 0 ? linkedin[0] : null,
      github: github.length > 0 ? github[0] : null,
    };
  }

  /**
   * استخراج المهارات من النص
   */
  extractSkills(text) {
    const textLower = text.toLowerCase();
    const foundSkills = [];

    // البحث عن المهارات المعروفة
    for (const skill of this.knownSkills) {
      const skillLower = skill.toLowerCase();
      
      // تنظيف الأحرف الخاصة في regex
      const escapedSkill = skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // استخدام regex للبحث عن الكلمة الكاملة
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'gi');
      if (regex.test(textLower)) {
        foundSkills.push(skill);
      }
    }

    // إزالة التكرارات
    return [...new Set(foundSkills)];
  }

  /**
   * استخراج الخبرات من النص
   */
  extractExperience(text) {
    const experiences = [];
    const lines = text.split('\n');
    
    // البحث عن قسم الخبرات
    let inExperienceSection = false;
    let currentExperience = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineLower = line.toLowerCase();

      // التحقق من بداية قسم الخبرات
      if (this.sectionKeywords.experience.some(keyword => lineLower.includes(keyword))) {
        inExperienceSection = true;
        continue;
      }

      // التحقق من نهاية قسم الخبرات (بداية قسم آخر)
      if (inExperienceSection && (
        this.sectionKeywords.education.some(keyword => lineLower.includes(keyword)) ||
        this.sectionKeywords.skills.some(keyword => lineLower.includes(keyword))
      )) {
        if (currentExperience) {
          experiences.push(currentExperience);
        }
        break;
      }

      if (inExperienceSection && line.length > 0) {
        // البحث عن تواريخ
        const dateMatches = line.match(this.patterns.dateRange);
        
        if (dateMatches) {
          // حفظ الخبرة السابقة
          if (currentExperience) {
            experiences.push(currentExperience);
          }

          // بداية خبرة جديدة
          currentExperience = {
            title: line.replace(this.patterns.dateRange, '').trim(),
            period: dateMatches[0],
            description: [],
          };
        } else if (currentExperience) {
          // إضافة وصف للخبرة الحالية
          currentExperience.description.push(line);
        }
      }
    }

    // حفظ آخر خبرة
    if (currentExperience) {
      experiences.push(currentExperience);
    }

    // تنظيف الوصف
    return experiences.map(exp => ({
      ...exp,
      description: exp.description.join(' ').trim(),
    }));
  }

  /**
   * استخراج التعليم من النص
   */
  extractEducation(text) {
    const education = [];
    const lines = text.split('\n');
    
    // البحث عن قسم التعليم
    let inEducationSection = false;
    let currentEducation = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineLower = line.toLowerCase();

      // التحقق من بداية قسم التعليم
      if (this.sectionKeywords.education.some(keyword => lineLower.includes(keyword))) {
        inEducationSection = true;
        continue;
      }

      // التحقق من نهاية قسم التعليم
      if (inEducationSection && (
        this.sectionKeywords.experience.some(keyword => lineLower.includes(keyword)) ||
        this.sectionKeywords.skills.some(keyword => lineLower.includes(keyword))
      )) {
        if (currentEducation) {
          education.push(currentEducation);
        }
        break;
      }

      if (inEducationSection && line.length > 0) {
        // البحث عن درجات علمية
        const degreeMatch = line.match(this.patterns.degree);
        
        if (degreeMatch) {
          // حفظ التعليم السابق
          if (currentEducation) {
            education.push(currentEducation);
          }

          // بداية تعليم جديد
          currentEducation = {
            degree: degreeMatch[0],
            institution: line.replace(this.patterns.degree, '').trim(),
            year: null,
          };

          // البحث عن السنة
          const yearMatch = line.match(/\d{4}/);
          if (yearMatch) {
            currentEducation.year = yearMatch[0];
          }
        }
      }
    }

    // حفظ آخر تعليم
    if (currentEducation) {
      education.push(currentEducation);
    }

    return education;
  }

  /**
   * حساب سنوات الخبرة من قائمة الخبرات
   */
  calculateTotalExperience(experiences) {
    let totalYears = 0;

    for (const exp of experiences) {
      const match = exp.period.match(/(\d{4})\s*[-–—]\s*(\d{4}|present|current|الآن|حالياً)/i);
      if (match) {
        const startYear = parseInt(match[1]);
        const endYear = match[2].match(/\d{4}/) ? parseInt(match[2]) : new Date().getFullYear();
        totalYears += (endYear - startYear);
      }
    }

    return totalYears;
  }

  /**
   * تحليل CV كامل
   */
  async parseCV(buffer, mimeType) {
    try {
      // استخراج النص
      const text = await this.extractText(buffer, mimeType);

      // استخراج المعلومات
      const contactInfo = this.extractContactInfo(text);
      const skills = this.extractSkills(text);
      const experience = this.extractExperience(text);
      const education = this.extractEducation(text);
      const totalExperience = this.calculateTotalExperience(experience);

      return {
        success: true,
        data: {
          rawText: text,
          contactInfo,
          skills,
          experience,
          education,
          totalExperience,
          extractedAt: new Date(),
        },
        stats: {
          skillsCount: skills.length,
          experienceCount: experience.length,
          educationCount: education.length,
          totalExperienceYears: totalExperience,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new CVParserService();
