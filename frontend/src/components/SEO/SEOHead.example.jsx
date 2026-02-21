import React from 'react';
import SEOHead from './SEOHead';

/**
 * Example Usage of SEOHead Component
 * 
 * This file demonstrates how to use the SEOHead component in different pages.
 */

// Example 1: Basic Usage (Homepage)
export const HomepageExample = () => {
  return (
    <div>
      <SEOHead
        title="Careerak - منصة التوظيف والموارد البشرية"
        description="منصة Careerak الرائدة في التوظيف والموارد البشرية، تقدم فرص عمل متنوعة ودورات تدريبية واستشارات مهنية في الدول العربية."
        keywords="توظيف, وظائف, موارد بشرية, دورات تدريبية, استشارات مهنية, Careerak"
        image="/images/og-homepage.jpg"
        url="https://careerak.com"
      />
      {/* Page content */}
    </div>
  );
};

// Example 2: Job Posting Page
export const JobPostingExample = () => {
  const jobTitle = "مطور برمجيات - React";
  const jobDescription = "نبحث عن مطور React محترف للانضمام إلى فريقنا. خبرة 3+ سنوات مطلوبة.";
  
  return (
    <div>
      <SEOHead
        title={`${jobTitle} | Careerak`}
        description={jobDescription}
        keywords="وظيفة, React, مطور برمجيات, توظيف"
        image="/images/og-job.jpg"
        url={`https://careerak.com/jobs/${123}`}
        type="article"
      />
      {/* Job details */}
    </div>
  );
};

// Example 3: Course Page
export const CoursePageExample = () => {
  return (
    <div>
      <SEOHead
        title="دورة تطوير الويب الشاملة | Careerak"
        description="تعلم تطوير الويب من الصفر حتى الاحتراف. دورة شاملة تغطي HTML, CSS, JavaScript, React وأكثر. سجل الآن!"
        keywords="دورة تطوير الويب, تعلم البرمجة, React, JavaScript"
        image="/images/og-course.jpg"
        url="https://careerak.com/courses/web-development"
        type="article"
      />
      {/* Course content */}
    </div>
  );
};

// Example 4: Profile Page
export const ProfilePageExample = () => {
  const userName = "أحمد محمد";
  
  return (
    <div>
      <SEOHead
        title={`${userName} - الملف الشخصي | Careerak`}
        description={`الملف الشخصي لـ ${userName} على منصة Careerak. تصفح المهارات والخبرات والإنجازات.`}
        keywords="ملف شخصي, سيرة ذاتية, مهارات, خبرات"
        image="/images/og-profile.jpg"
        url={`https://careerak.com/profile/${123}`}
        type="profile"
      />
      {/* Profile content */}
    </div>
  );
};

// Example 5: With Twitter Site Handle
export const WithTwitterExample = () => {
  return (
    <div>
      <SEOHead
        title="Careerak - Career Platform"
        description="Leading career and HR platform in the Arab world"
        keywords="jobs, careers, HR, training"
        image="/images/og-homepage.jpg"
        url="https://careerak.com"
        twitterSite="@careerak"
        twitterCard="summary_large_image"
      />
      {/* Page content */}
    </div>
  );
};

// Example 6: With Additional Meta Tags
export const WithAdditionalMetaExample = () => {
  return (
    <div>
      <SEOHead
        title="Careerak Blog - Career Tips"
        description="Read the latest career tips and job market insights"
        keywords="career tips, job market, career advice"
        image="/images/og-blog.jpg"
        url="https://careerak.com/blog"
        additionalMeta={{
          'article:author': 'Careerak Team',
          'article:published_time': '2024-02-20T10:00:00Z',
          'article:section': 'Career Advice'
        }}
      />
      {/* Blog content */}
    </div>
  );
};

// Example 7: Multi-language Support
export const MultiLanguageExample = () => {
  const currentLanguage = 'ar'; // or 'en', 'fr'
  
  const titles = {
    ar: 'Careerak - منصة التوظيف',
    en: 'Careerak - Career Platform',
    fr: 'Careerak - Plateforme de Carrière'
  };
  
  const descriptions = {
    ar: 'منصة التوظيف الرائدة في العالم العربي',
    en: 'Leading career platform in the Arab world',
    fr: 'Plateforme de carrière leader dans le monde arabe'
  };
  
  const locales = {
    ar: 'ar_SA',
    en: 'en_US',
    fr: 'fr_FR'
  };
  
  return (
    <div>
      <SEOHead
        title={titles[currentLanguage]}
        description={descriptions[currentLanguage]}
        keywords="jobs, careers, وظائف, emplois"
        image="/images/og-homepage.jpg"
        url="https://careerak.com"
        locale={locales[currentLanguage]}
        alternateLocales={Object.values(locales).filter(l => l !== locales[currentLanguage])}
      />
      {/* Page content */}
    </div>
  );
};

export default {
  HomepageExample,
  JobPostingExample,
  CoursePageExample,
  ProfilePageExample,
  WithTwitterExample,
  WithAdditionalMetaExample,
  MultiLanguageExample
};
