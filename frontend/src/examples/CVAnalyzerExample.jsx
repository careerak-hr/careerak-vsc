/**
 * CV Analyzer Component - Usage Example
 * مثال استخدام مكون تحليل السيرة الذاتية
 */

import React from 'react';
import CVAnalyzer from '../components/CVAnalyzer/CVAnalyzer';

/**
 * مثال 1: استخدام أساسي
 * Basic Usage
 */
function BasicExample() {
  return (
    <div className="page-container">
      <CVAnalyzer />
    </div>
  );
}

/**
 * مثال 2: في صفحة الملف الشخصي
 * In Profile Page
 */
function ProfilePageExample() {
  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>ملفي الشخصي</h1>
      </div>

      <div className="profile-sections">
        {/* قسم تحليل السيرة الذاتية */}
        <section className="profile-section">
          <CVAnalyzer />
        </section>

        {/* أقسام أخرى */}
        <section className="profile-section">
          {/* ... */}
        </section>
      </div>
    </div>
  );
}

/**
 * مثال 3: في صفحة مخصصة
 * In Dedicated Page
 */
function CVAnalyzerPage() {
  return (
    <div className="cv-analyzer-page">
      <div className="page-header">
        <h1>تحليل السيرة الذاتية</h1>
        <p>احصل على تحليل شامل لسيرتك الذاتية مع اقتراحات للتحسين</p>
      </div>

      <CVAnalyzer />

      <div className="page-footer">
        <p>جميع البيانات محمية ومشفرة</p>
      </div>
    </div>
  );
}

/**
 * مثال 4: مع معالجة النتائج
 * With Result Handling
 */
function WithResultHandlingExample() {
  const [analysisResult, setAnalysisResult] = React.useState(null);

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    console.log('Analysis completed:', result);
    
    // يمكنك حفظ النتيجة أو إرسالها لمكان آخر
    // saveAnalysisToBackend(result);
  };

  return (
    <div>
      <CVAnalyzer onAnalysisComplete={handleAnalysisComplete} />
      
      {analysisResult && (
        <div className="analysis-summary">
          <h3>ملخص التحليل</h3>
          <p>درجة الجودة: {analysisResult.quality.overallScore}/100</p>
          <p>عدد المهارات: {analysisResult.parsed.skills.length}</p>
          <p>سنوات الخبرة: {analysisResult.parsed.totalExperience}</p>
        </div>
      )}
    </div>
  );
}

/**
 * مثال 5: API Usage
 * كيفية استخدام API مباشرة
 */
async function directAPIUsage() {
  // 1. تحليل CV كامل مع اقتراحات التحسين
  const formData = new FormData();
  formData.append('cv', file); // file من input

  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('/api/cv/improvement-suggestions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Parsed CV:', result.data.parsed);
      console.log('Quality Analysis:', result.data.quality);
      console.log('Improvements:', result.data.improvements);
    }
  } catch (error) {
    console.error('Error:', error);
  }

  // 2. تحليل الجودة فقط
  try {
    const response = await fetch('/api/cv/analyze-quality', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Quality Score:', result.data.quality.overallScore);
      console.log('Rating:', result.data.quality.rating);
      console.log('Scores:', result.data.quality.scores);
    }
  } catch (error) {
    console.error('Error:', error);
  }

  // 3. استخراج المهارات فقط
  try {
    const response = await fetch('/api/cv/extract-skills', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Skills:', result.skills);
      console.log('Count:', result.count);
    }
  } catch (error) {
    console.error('Error:', error);
  }

  // 4. الحصول على التحليل المحفوظ
  try {
    const response = await fetch('/api/cv/quality-analysis', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Saved Analysis:', result.data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * مثال 6: Response Structure
 * هيكل الاستجابة من API
 */
const exampleResponse = {
  success: true,
  message: 'تم توليد اقتراحات التحسين بنجاح',
  data: {
    // البيانات المستخرجة
    parsed: {
      skills: ['JavaScript', 'React', 'Node.js', 'Python'],
      experience: [
        {
          position: 'Senior Developer',
          company: 'Tech Company',
          startDate: '2020',
          endDate: '2023',
          current: false,
          description: 'Led development team...'
        }
      ],
      education: [
        {
          degree: 'Bachelor of Computer Science',
          institution: 'University Name',
          field: 'Computer Science',
          startDate: '2015',
          endDate: '2019'
        }
      ],
      totalExperience: 5
    },
    
    // إحصائيات الاستخراج
    stats: {
      skillsFound: 15,
      experienceFound: 3,
      educationFound: 2,
      contactInfoFound: true
    },
    
    // تحليل الجودة
    quality: {
      overallScore: 85,
      rating: 'good', // excellent, good, average, poor
      scores: {
        completeness: 90,
        clarity: 85,
        relevance: 80,
        formatting: 85,
        keywords: 80
      }
    },
    
    // اقتراحات التحسين
    improvements: {
      strengths: [
        'سيرة ذاتية منظمة بشكل جيد',
        'مهارات تقنية قوية',
        'خبرة عملية واضحة'
      ],
      weaknesses: [
        'ينقص قسم الإنجازات',
        'وصف الخبرات يمكن أن يكون أكثر تفصيلاً'
      ],
      suggestions: [
        {
          priority: 'high', // high, medium, low
          suggestion: 'أضف قسم الإنجازات مع أرقام قابلة للقياس',
          impact: 15 // تحسين متوقع بنسبة 15%
        },
        {
          priority: 'medium',
          suggestion: 'وسّع وصف الخبرات مع ذكر التقنيات المستخدمة',
          impact: 10
        }
      ]
    }
  }
};

/**
 * مثال 7: Error Handling
 * معالجة الأخطاء
 */
function ErrorHandlingExample() {
  const [error, setError] = React.useState(null);

  const handleFileUpload = async (file) => {
    try {
      // التحقق من نوع الملف
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('نوع الملف غير مدعوم. الأنواع المدعومة: PDF, DOCX, TXT');
      }

      // التحقق من حجم الملف (5 MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('حجم الملف كبير جداً. الحد الأقصى: 5 ميجابايت');
      }

      // رفع الملف
      const formData = new FormData();
      formData.append('cv', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/cv/improvement-suggestions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'فشل تحليل السيرة الذاتية');
      }

      // نجح التحليل
      console.log('Analysis successful:', result.data);
      setError(null);

    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    }
  };

  return (
    <div>
      <CVAnalyzer />
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

/**
 * مثال 8: Integration with Profile
 * التكامل مع الملف الشخصي
 */
function ProfileIntegrationExample() {
  const [user, setUser] = React.useState(null);

  // تحديث الملف الشخصي بعد التحليل
  const updateProfileWithCVData = async (analysisData) => {
    try {
      const token = localStorage.getItem('token');
      
      // تحديث المهارات
      await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: analysisData.parsed.skills,
          experience: analysisData.parsed.experience,
          education: analysisData.parsed.education,
        }),
      });

      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div>
      <CVAnalyzer onAnalysisComplete={updateProfileWithCVData} />
    </div>
  );
}

export {
  BasicExample,
  ProfilePageExample,
  CVAnalyzerPage,
  WithResultHandlingExample,
  directAPIUsage,
  exampleResponse,
  ErrorHandlingExample,
  ProfileIntegrationExample,
};

export default BasicExample;
