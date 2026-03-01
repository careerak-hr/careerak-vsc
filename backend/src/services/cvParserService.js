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
      experience: [
        'experience', 'work history', 'employment', 'work experience', 
        'professional experience', 'career history', 'employment history',
        'خبرة', 'الخبرات', 'العمل', 'الخبرات العملية', 'خبرات عملية'
      ],
      education: [
        'education', 'academic', 'qualification', 'academic background',
        'educational background',
        'تعليم', 'التعليم', 'المؤهلات', 'المؤهلات العلمية', 'التعليم الأكاديمي'
      ],
      skills: [
        'skills', 'technical skills', 'competencies', 'core competencies',
        'key skills', 'professional skills',
        'مهارات', 'المهارات', 'الكفاءات', 'المهارات التقنية', 'مهارات تقنية'
      ],
      summary: [
        'summary', 'profile', 'objective', 'professional summary',
        'career objective', 'about me',
        'ملخص', 'نبذة', 'الهدف', 'الملخص المهني', 'نبذة مهنية'
      ],
      contact: [
        'contact', 'contact information', 'personal information',
        'اتصال', 'معلومات الاتصال', 'معلومات شخصية'
      ],
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
      'html', 'css', 'react', 'angular', 'vue', 'vue.js', 'node.js', 'express', 'django', 'flask',
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
      
      // Arabic Skills (محسّن جداً)
      'جافاسكريبت', 'بايثون', 'جافا', 'سي بلس بلس', 'سي شارب',
      'تطوير ويب', 'تطوير تطبيقات', 'برمجة',
      'قواعد بيانات', 'قاعدة بيانات',
      'تعلم آلي', 'ذكاء اصطناعي', 'تعلم عميق',
      'إدارة مشاريع', 'قيادة', 'تواصل', 'عمل جماعي',
      'أمن سيبراني', 'حوسبة سحابية',
      'تحليل بيانات', 'علم بيانات',
      // إضافات جديدة
      'ريأكت', 'نود', 'مونجو', 'ماي إس كيو إل',
      'دوكر', 'كوبرنيتس', 'أمازون ويب سيرفيسز',
      'فلاسك', 'جانغو', 'إكسبريس',
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

    // قاموس المرادفات للمهارات
    const skillSynonyms = {
      'javascript': ['javascript', 'js', 'جافاسكريبت'],
      'python': ['python', 'بايثون'],
      'java': ['java', 'جافا'],
      'typescript': ['typescript', 'ts'],
      'react': ['react', 'reactjs', 'react.js', 'ريأكت'],
      'vue': ['vue', 'vuejs', 'vue.js'],
      'angular': ['angular', 'angularjs'],
      'node.js': ['node', 'nodejs', 'node.js', 'نود'],
      'express': ['express', 'expressjs', 'إكسبريس'],
      'django': ['django', 'جانغو'],
      'flask': ['flask', 'فلاسك'],
      'mongodb': ['mongodb', 'mongo', 'مونجو', 'مونجو دي بي'],
      'postgresql': ['postgresql', 'postgres'],
      'mysql': ['mysql', 'ماي إس كيو إل'],
      'redis': ['redis'],
      'aws': ['aws', 'amazon web services', 'أمازون ويب سيرفيسز'],
      'azure': ['azure', 'microsoft azure'],
      'docker': ['docker', 'دوكر'],
      'kubernetes': ['kubernetes', 'k8s', 'كوبرنيتس'],
      'git': ['git'],
      'jenkins': ['jenkins'],
      'webpack': ['webpack'],
    };

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

    // البحث باستخدام المرادفات
    for (const [mainSkill, synonyms] of Object.entries(skillSynonyms)) {
      let found = false;
      for (const synonym of synonyms) {
        const escapedSynonym = synonym.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedSynonym}\\b`, 'gi');
        if (regex.test(textLower)) {
          found = true;
          break;
        }
      }
      if (found && !foundSkills.includes(mainSkill)) {
        foundSkills.push(mainSkill);
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
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // البحث عن قسم الخبرات
    let inExperienceSection = false;
    let experienceSectionStart = -1;
    let experienceSectionEnd = lines.length;

    // إيجاد حدود قسم الخبرات
    for (let i = 0; i < lines.length; i++) {
      const lineLower = lines[i].toLowerCase();

      // بداية قسم الخبرات (يجب أن يكون السطر يحتوي فقط على الكلمة المفتاحية)
      if (!inExperienceSection) {
        const isExperienceHeader = this.sectionKeywords.experience.some(keyword => {
          const keywordLower = keyword.toLowerCase();
          // التحقق من أن السطر يحتوي على الكلمة المفتاحية فقط (أو مع كلمات قليلة)
          return lineLower === keywordLower || 
                 lineLower.startsWith(keywordLower) && lineLower.length < keywordLower.length + 20;
        });
        
        if (isExperienceHeader) {
          inExperienceSection = true;
          experienceSectionStart = i + 1;
          continue;
        }
      }

      // نهاية قسم الخبرات (بداية قسم آخر)
      if (inExperienceSection) {
        const isOtherSectionHeader = 
          this.sectionKeywords.education.some(keyword => lineLower.includes(keyword.toLowerCase())) ||
          this.sectionKeywords.skills.some(keyword => lineLower.includes(keyword.toLowerCase())) ||
          this.sectionKeywords.summary.some(keyword => lineLower.includes(keyword.toLowerCase())) ||
          this.sectionKeywords.contact.some(keyword => lineLower.includes(keyword.toLowerCase()));
        
        if (isOtherSectionHeader) {
          experienceSectionEnd = i;
          break;
        }
      }
    }

    // إذا لم نجد قسم الخبرات، نرجع مصفوفة فارغة
    if (!inExperienceSection || experienceSectionStart === -1) {
      return experiences;
    }

    // استخراج الخبرات من القسم
    let currentExperience = null;

    for (let i = experienceSectionStart; i < experienceSectionEnd; i++) {
      const line = lines[i];
      
      // تجاهل السطور الفارغة
      if (line.length === 0) continue;
      
      // البحث عن نمط "المسمى الوظيفي | الشركة | التواريخ"
      const pipePattern = /^(.+?)\s*\|\s*(.+?)\s*\|\s*(\d{4}\s*[-–—]\s*(?:\d{4}|present|current|الآن|حالياً))/i;
      const pipeMatch = line.match(pipePattern);
      
      if (pipeMatch) {
        // حفظ الخبرة السابقة
        if (currentExperience) {
          experiences.push(currentExperience);
        }

        // بداية خبرة جديدة (نمط pipe)
        currentExperience = {
          title: pipeMatch[1].trim(),
          company: pipeMatch[2].trim(),
          period: pipeMatch[3].trim(),
          description: [],
        };
        continue;
      }

      // البحث عن تواريخ في السطر
      const dateMatches = line.match(this.patterns.dateRange);
      
      if (dateMatches && dateMatches.length > 0) {
        // حفظ الخبرة السابقة
        if (currentExperience) {
          experiences.push(currentExperience);
        }

        // بداية خبرة جديدة (نمط عادي)
        const titleAndCompany = line.replace(this.patterns.dateRange, '').replace(/\|/g, '').trim();
        currentExperience = {
          title: titleAndCompany,
          period: dateMatches[0],
          description: [],
        };
        continue;
      }

      // إضافة وصف للخبرة الحالية
      if (currentExperience && line.length > 0) {
        // تجاهل السطور التي تبدأ بـ "-" أو "•" (نقاط)
        if (line.startsWith('-') || line.startsWith('•')) {
          currentExperience.description.push(line.substring(1).trim());
        } else {
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
    if (experiences.length === 0) return 0;

    // جمع جميع الفترات
    const periods = [];
    
    for (const exp of experiences) {
      const match = exp.period.match(/(\d{4})\s*[-–—]\s*(\d{4}|present|current|الآن|حالياً)/i);
      if (match) {
        const startYear = parseInt(match[1]);
        const endYear = match[2].match(/\d{4}/) ? parseInt(match[2]) : new Date().getFullYear();
        periods.push({ start: startYear, end: endYear });
      }
    }

    if (periods.length === 0) return 0;

    // ترتيب الفترات حسب تاريخ البداية
    periods.sort((a, b) => a.start - b.start);

    // دمج الفترات المتداخلة وحساب الإجمالي
    let totalYears = 0;
    let currentPeriod = periods[0];

    for (let i = 1; i < periods.length; i++) {
      const nextPeriod = periods[i];
      
      if (nextPeriod.start <= currentPeriod.end) {
        // فترات متداخلة - دمجها
        currentPeriod.end = Math.max(currentPeriod.end, nextPeriod.end);
      } else {
        // فترة جديدة - حساب الفترة السابقة
        totalYears += (currentPeriod.end - currentPeriod.start);
        currentPeriod = nextPeriod;
      }
    }

    // إضافة آخر فترة
    totalYears += (currentPeriod.end - currentPeriod.start);

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
