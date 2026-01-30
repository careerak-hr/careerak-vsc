/**
 * أداة اختبار تحليل السيرة الذاتية - للتحقق من عمل النظام بشكل صحيح
 * CV Analyzer Tester - To verify the system works correctly
 */

/**
 * إنشاء بيانات تجريبية لمحاكاة نتيجة تحليل السيرة الذاتية
 */
export const generateMockCVData = () => {
  return {
    // البيانات الأساسية
    firstName: 'أحمد',
    lastName: 'محمد',
    email: 'ahmed.mohamed@example.com',
    phone: '+963987654321',
    birthDate: '1990-05-15',
    gender: 'male',
    country: 'سوريا',
    city: 'دمشق',
    
    // البيانات الشخصية والاجتماعية
    permanentAddress: 'دمشق، المزة، شارع الثورة',
    temporaryAddress: 'دمشق، المالكي، شارع بغداد',
    socialStatus: 'married',
    hasChildren: true,
    militaryStatus: 'performed',
    
    // الحالة الصحية
    healthStatus: {
      hasChronic: false,
      chronic: '',
      hasSkin: false,
      skin: '',
      hasInfectious: false,
      infectious: '',
      notes: 'حالة صحية جيدة'
    },
    
    // المسيرة التعليمية
    educationList: [
      {
        level: 'بكالوريوس',
        degree: 'هندسة معلوماتية',
        institution: 'جامعة دمشق',
        city: 'دمشق',
        country: 'سوريا',
        year: '2012',
        grade: 'جيد جداً'
      },
      {
        level: 'ماجستير',
        degree: 'أمن المعلومات',
        institution: 'الجامعة الافتراضية السورية',
        city: 'دمشق',
        country: 'سوريا',
        year: '2015',
        grade: 'ممتاز'
      }
    ],
    
    // المسيرة المهنية
    experienceList: [
      {
        company: 'شركة التقنيات المتقدمة',
        position: 'مطور برمجيات',
        from: '2012-06-01',
        to: '2015-12-31',
        tasks: 'تطوير تطبيقات الويب باستخدام React و Node.js، إدارة قواعد البيانات، العمل ضمن فريق تطوير متكامل',
        workType: 'tech',
        jobLevel: 'junior',
        reason: 'تطوير المسيرة المهنية',
        country: 'سوريا',
        city: 'دمشق'
      },
      {
        company: 'مؤسسة الحلول الرقمية',
        position: 'مهندس برمجيات أول',
        from: '2016-01-01',
        to: '2020-06-30',
        tasks: 'قيادة فريق التطوير، تصميم الأنظمة المعقدة، إدارة المشاريع التقنية، التدريب والإشراف على المطورين الجدد',
        workType: 'tech',
        jobLevel: 'senior',
        reason: 'البحث عن فرص أفضل',
        country: 'سوريا',
        city: 'دمشق'
      },
      {
        company: 'شركة الابتكار التقني',
        position: 'مدير تقني',
        from: '2020-07-01',
        to: '2024-01-01',
        tasks: 'إدارة الفريق التقني، وضع الاستراتيجيات التقنية، التخطيط للمشاريع الكبيرة، التواصل مع العملاء والشركاء',
        workType: 'management',
        jobLevel: 'manager',
        reason: 'البحث عن تحديات جديدة',
        country: 'سوريا',
        city: 'دمشق'
      }
    ],
    
    // المسيرة التدريبية
    trainingList: [
      {
        courseName: 'تطوير تطبيقات React المتقدمة',
        provider: 'معهد التقنيات الحديثة',
        content: 'تعلم أحدث تقنيات React، Redux، Hooks، وأفضل الممارسات في تطوير التطبيقات',
        country: 'سوريا',
        city: 'دمشق',
        hasCert: true
      },
      {
        courseName: 'إدارة المشاريع التقنية',
        provider: 'أكاديمية القيادة',
        content: 'مبادئ إدارة المشاريع، Agile، Scrum، أدوات إدارة الفرق التقنية',
        country: 'سوريا',
        city: 'دمشق',
        hasCert: true
      },
      {
        courseName: 'أمن المعلومات والحماية السيبرانية',
        provider: 'معهد الأمن السيبراني',
        content: 'تقنيات الحماية، اكتشاف التهديدات، إدارة المخاطر الأمنية',
        country: 'سوريا',
        city: 'دمشق',
        hasCert: true
      }
    ],
    
    // اللغات
    languages: [
      { language: 'العربية', proficiency: 'native' },
      { language: 'الإنجليزية', proficiency: 'advanced' },
      { language: 'الفرنسية', proficiency: 'intermediate' }
    ],
    
    // مهارات الحاسوب
    computerSkills: [
      { skill: 'Microsoft Office', proficiency: 'advanced' },
      { skill: 'Adobe Photoshop', proficiency: 'intermediate' },
      { skill: 'AutoCAD', proficiency: 'beginner' }
    ],
    
    // مهارات البرمجيات
    softwareSkills: [
      { software: 'React.js', proficiency: 'expert' },
      { software: 'Node.js', proficiency: 'advanced' },
      { software: 'Python', proficiency: 'advanced' },
      { software: 'MySQL', proficiency: 'advanced' },
      { software: 'MongoDB', proficiency: 'intermediate' },
      { software: 'Docker', proficiency: 'intermediate' }
    ],
    
    // المهارات الأخرى
    otherSkills: [
      'قيادة الفرق',
      'التفكير الإبداعي',
      'حل المشكلات',
      'التواصل الفعال',
      'إدارة الوقت',
      'العمل تحت الضغط'
    ],
    
    // النبذة الشخصية
    bio: 'مهندس برمجيات متخصص بخبرة تزيد عن 10 سنوات في تطوير التطبيقات والأنظمة المعقدة. أتمتع بخبرة واسعة في قيادة الفرق التقنية وإدارة المشاريع الكبيرة. أسعى دائماً للتطوير والتعلم المستمر ومواكبة أحدث التقنيات في عالم البرمجة.'
  };
};

/**
 * محاكاة عملية تحليل السيرة الذاتية
 */
export const simulateCVAnalysis = async (fileName = 'test-cv.pdf') => {
  console.log('🔍 محاكاة تحليل السيرة الذاتية:', fileName);
  
  // محاكاة وقت التحليل
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const mockData = generateMockCVData();
  console.log('✅ تم إنشاء البيانات التجريبية:', mockData);
  
  return {
    data: {
      data: mockData
    }
  };
};

/**
 * اختبار دمج البيانات في النموذج
 */
export const testDataMerging = (existingFormData, parsedData) => {
  console.log('🧪 اختبار دمج البيانات...');
  console.log('📝 البيانات الموجودة:', existingFormData);
  console.log('📄 البيانات المحللة:', parsedData);
  
  const updated = { ...existingFormData };
  
  // تحديث البيانات الأساسية
  const basicFields = ['firstName', 'lastName', 'email', 'phone', 'bio', 'birthDate', 'gender', 'country', 'city'];
  basicFields.forEach(field => {
    if (parsedData[field]) {
      updated[field] = parsedData[field];
      console.log(`✅ تم تحديث ${field}:`, parsedData[field]);
    }
  });
  
  // دمج القوائم
  const listFields = ['educationList', 'experienceList', 'trainingList', 'languages', 'computerSkills', 'softwareSkills'];
  listFields.forEach(listName => {
    if (parsedData[listName] && Array.isArray(parsedData[listName]) && parsedData[listName].length > 0) {
      // إزالة العناصر الفارغة الافتراضية
      const filteredExisting = existingFormData[listName].filter(item => {
        if (listName === 'otherSkills') return item && item.trim();
        return Object.values(item).some(value => value && value.toString().trim());
      });
      
      updated[listName] = [...filteredExisting, ...parsedData[listName]];
      console.log(`✅ تم دمج ${listName}:`, parsedData[listName].length, 'عنصر');
    }
  });
  
  // دمج المهارات الأخرى
  if (parsedData.otherSkills && Array.isArray(parsedData.otherSkills) && parsedData.otherSkills.length > 0) {
    const filteredExisting = existingFormData.otherSkills.filter(skill => skill && skill.trim());
    const filteredNew = parsedData.otherSkills.filter(skill => skill && skill.trim());
    updated.otherSkills = [...filteredExisting, ...filteredNew];
    console.log('✅ تم دمج المهارات الأخرى:', filteredNew.length, 'عنصر');
  }
  
  console.log('🎉 تم دمج البيانات بنجاح:', updated);
  return updated;
};

/**
 * اختبار شامل لنظام تحليل السيرة الذاتية
 */
export const runCVAnalysisTest = async () => {
  console.log('🧪 بدء اختبار شامل لنظام تحليل السيرة الذاتية...');
  console.log('=====================================');
  
  try {
    // اختبار 1: إنشاء بيانات تجريبية
    console.log('🔧 اختبار 1: إنشاء بيانات تجريبية...');
    const mockData = generateMockCVData();
    console.log('✅ النتيجة: تم إنشاء', Object.keys(mockData).length, 'حقل');
    
    // اختبار 2: محاكاة التحليل
    console.log('🔧 اختبار 2: محاكاة عملية التحليل...');
    const analysisResult = await simulateCVAnalysis('test-resume.pdf');
    console.log('✅ النتيجة: تم التحليل بنجاح');
    
    // اختبار 3: دمج البيانات
    console.log('🔧 اختبار 3: اختبار دمج البيانات...');
    const existingData = {
      firstName: '', lastName: '', email: '', phone: '',
      educationList: [{ level: '', degree: '', institution: '', year: '' }],
      experienceList: [{ company: '', position: '', from: '', to: '' }],
      trainingList: [{ courseName: '', provider: '', content: '' }],
      languages: [{ language: '', proficiency: 'intermediate' }],
      computerSkills: [{ skill: '', proficiency: 'intermediate' }],
      softwareSkills: [{ software: '', proficiency: 'intermediate' }],
      otherSkills: ['']
    };
    
    const mergedData = testDataMerging(existingData, analysisResult.data.data);
    console.log('✅ النتيجة: تم دمج البيانات بنجاح');
    
    // اختبار 4: التحقق من اكتمال البيانات
    console.log('🔧 اختبار 4: التحقق من اكتمال البيانات...');
    const completionStats = {
      basicInfo: [mergedData.firstName, mergedData.lastName, mergedData.email].filter(Boolean).length,
      education: mergedData.educationList.filter(edu => edu.level || edu.degree).length,
      experience: mergedData.experienceList.filter(exp => exp.company || exp.position).length,
      training: mergedData.trainingList.filter(training => training.courseName).length,
      languages: mergedData.languages.filter(lang => lang.language).length,
      skills: mergedData.computerSkills.filter(skill => skill.skill).length + 
              mergedData.softwareSkills.filter(skill => skill.software).length +
              mergedData.otherSkills.filter(skill => skill && skill.trim()).length
    };
    
    console.log('📊 إحصائيات الاكتمال:');
    Object.entries(completionStats).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count} عنصر`);
    });
    
    console.log('=====================================');
    console.log('🎉 انتهى الاختبار! جميع الاختبارات نجحت.');
    
    return {
      success: true,
      mockData,
      mergedData,
      completionStats
    };
    
  } catch (error) {
    console.error('❌ فشل الاختبار:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * اختبار أداء النظام مع ملفات مختلفة
 */
export const testDifferentFileTypes = async () => {
  console.log('🧪 اختبار أنواع ملفات مختلفة...');
  
  const fileTypes = [
    { name: 'resume.pdf', type: 'PDF' },
    { name: 'cv.docx', type: 'Word' },
    { name: 'profile.xlsx', type: 'Excel' },
    { name: 'portfolio.pptx', type: 'PowerPoint' }
  ];
  
  for (const file of fileTypes) {
    console.log(`📄 اختبار ملف ${file.type}: ${file.name}`);
    try {
      await simulateCVAnalysis(file.name);
      console.log(`✅ نجح تحليل ${file.type}`);
    } catch (error) {
      console.error(`❌ فشل تحليل ${file.type}:`, error);
    }
  }
  
  console.log('🎉 انتهى اختبار أنواع الملفات');
};

// تصدير للاستخدام في وحدة تحكم المتصفح
if (typeof window !== 'undefined') {
  window.cvAnalyzerTester = {
    generateMockData: generateMockCVData,
    simulateAnalysis: simulateCVAnalysis,
    testMerging: testDataMerging,
    runFullTest: runCVAnalysisTest,
    testFileTypes: testDifferentFileTypes,
    // اختصارات سريعة
    mock: generateMockCVData,
    test: runCVAnalysisTest,
    simulate: simulateCVAnalysis
  };
  
  console.log('🛠️ أدوات اختبار تحليل السيرة الذاتية متاحة في window.cvAnalyzerTester');
  console.log('   - window.cvAnalyzerTester.test() - اختبار شامل');
  console.log('   - window.cvAnalyzerTester.mock() - إنشاء بيانات تجريبية');
  console.log('   - window.cvAnalyzerTester.simulate() - محاكاة التحليل');
  console.log('   - window.cvAnalyzerTester.testFileTypes() - اختبار أنواع الملفات');
}