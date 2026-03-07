import React, { useState } from 'react';
import ViewToggle from '../components/ViewToggle/ViewToggle';
import { JobCardGrid, JobCardList } from '../components/JobCard';
import '../components/JobCard/JobCard.css';

/**
 * مثال استخدام كامل لمكونات JobCard مع ViewToggle
 * يوضح التبديل بين عرض Grid (3-2-1 أعمدة) وعرض List
 */
const JobCardsExample = () => {
  // حالة العرض (grid أو list)
  const [view, setView] = useState(() => {
    return localStorage.getItem('jobViewPreference') || 'grid';
  });

  // حالة الوظائف المحفوظة
  const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());

  // بيانات وظائف تجريبية
  const jobs = [
    {
      id: 1,
      title: 'مطور Full Stack',
      company: {
        name: 'شركة التقنية المتقدمة',
        logo: null
      },
      description: 'نبحث عن مطور Full Stack ذو خبرة في React و Node.js للانضمام إلى فريقنا المتنامي. ستعمل على مشاريع مثيرة وتساهم في بناء منتجات مبتكرة.',
      location: {
        city: 'الرياض'
      },
      type: 'دوام كامل',
      salary: 15000,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // منذ يومين
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Docker'],
      isNew: true,
      isUrgent: false,
      applicantCount: 45,
      matchPercentage: 85
    },
    {
      id: 2,
      title: 'مصمم UI/UX',
      company: {
        name: 'استوديو الإبداع',
        logo: null
      },
      description: 'نحتاج مصمم UI/UX موهوب لتصميم تجارب مستخدم استثنائية لتطبيقاتنا المحمولة والويب.',
      location: {
        city: 'جدة'
      },
      type: 'دوام كامل',
      salary: 12000,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // منذ 5 أيام
      requiredSkills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping'],
      isNew: false,
      isUrgent: true,
      applicantCount: 32,
      matchPercentage: 72
    },
    {
      id: 3,
      title: 'مهندس DevOps',
      company: {
        name: 'سحابة الخليج',
        logo: null
      },
      description: 'فرصة رائعة للانضمام إلى فريق DevOps في شركة رائدة في مجال الحوسبة السحابية.',
      location: {
        city: 'الدمام'
      },
      type: 'دوام كامل',
      salary: 18000,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // منذ يوم
      requiredSkills: ['AWS', 'Kubernetes', 'Docker', 'CI/CD', 'Terraform'],
      isNew: true,
      isUrgent: true,
      applicantCount: 28,
      matchPercentage: 90
    },
    {
      id: 4,
      title: 'محلل بيانات',
      company: {
        name: 'تحليلات الأعمال',
        logo: null
      },
      description: 'نبحث عن محلل بيانات محترف لتحليل البيانات وتقديم رؤى قيمة لدعم قرارات الأعمال.',
      location: {
        city: 'الرياض'
      },
      type: 'دوام جزئي',
      salary: 10000,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // منذ 10 أيام
      requiredSkills: ['Python', 'SQL', 'Power BI', 'Excel'],
      isNew: false,
      isUrgent: false,
      applicantCount: 67,
      matchPercentage: 65
    },
    {
      id: 5,
      title: 'مطور تطبيقات محمولة',
      company: {
        name: 'موبايل سوليوشنز',
        logo: null
      },
      description: 'انضم إلى فريقنا لتطوير تطبيقات محمولة مبتكرة باستخدام React Native و Flutter.',
      location: {
        city: 'مكة المكرمة'
      },
      type: 'دوام كامل',
      salary: 14000,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // منذ 3 أيام
      requiredSkills: ['React Native', 'Flutter', 'iOS', 'Android'],
      isNew: true,
      isUrgent: false,
      applicantCount: 52,
      matchPercentage: 78
    },
    {
      id: 6,
      title: 'مدير مشاريع تقنية',
      company: {
        name: 'إدارة المشاريع الذكية',
        logo: null
      },
      description: 'فرصة لقيادة مشاريع تقنية كبيرة وإدارة فرق متعددة التخصصات.',
      location: {
        city: 'الخبر'
      },
      type: 'دوام كامل',
      salary: 20000,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // منذ أسبوع
      requiredSkills: ['Agile', 'Scrum', 'JIRA', 'Leadership'],
      isNew: false,
      isUrgent: false,
      applicantCount: 89,
      matchPercentage: 55
    }
  ];

  // دالة تبديل العرض
  const handleToggleView = (newView) => {
    setView(newView);
    localStorage.setItem('jobViewPreference', newView);
  };

  // دالة حفظ/إزالة من المفضلة
  const handleBookmark = (jobId) => {
    setBookmarkedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
        console.log(`تم إزالة الوظيفة ${jobId} من المفضلة`);
      } else {
        newSet.add(jobId);
        console.log(`تم حفظ الوظيفة ${jobId} في المفضلة`);
      }
      return newSet;
    });
  };

  // دالة المشاركة
  const handleShare = (job) => {
    console.log('مشاركة الوظيفة:', job.title);
    // هنا يمكن إضافة منطق المشاركة الفعلي
    alert(`مشاركة: ${job.title}`);
  };

  // دالة النقر على البطاقة
  const handleJobClick = (job) => {
    console.log('تم النقر على الوظيفة:', job.title);
    // هنا يمكن التوجيه إلى صفحة تفاصيل الوظيفة
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', color: 'var(--primary-color, #304B60)' }}>
            الوظائف المتاحة
          </h1>
          <p style={{ margin: 0, color: 'rgba(48, 75, 96, 0.7)' }}>
            {jobs.length} وظيفة متاحة
          </p>
        </div>

        <ViewToggle view={view} onToggle={handleToggleView} />
      </div>

      {/* Jobs Container */}
      <div className={view === 'grid' ? 'jobs-grid' : 'jobs-list'}>
        {jobs.map(job => (
          view === 'grid' ? (
            <JobCardGrid
              key={job.id}
              job={job}
              isBookmarked={bookmarkedJobs.has(job.id)}
              onBookmark={handleBookmark}
              onShare={handleShare}
              onClick={handleJobClick}
            />
          ) : (
            <JobCardList
              key={job.id}
              job={job}
              isBookmarked={bookmarkedJobs.has(job.id)}
              onBookmark={handleBookmark}
              onShare={handleShare}
              onClick={handleJobClick}
            />
          )
        ))}
      </div>

      {/* Info Box */}
      <div style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: 'rgba(212, 129, 97, 0.1)',
        borderRadius: '12px',
        border: '2px solid var(--accent-color, #D48161)'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: 'var(--primary-color, #304B60)' }}>
          معلومات التصميم المتجاوب
        </h3>
        <ul style={{ margin: 0, paddingRight: '20px', color: 'rgba(48, 75, 96, 0.8)' }}>
          <li><strong>Desktop (≥1024px):</strong> 3 أعمدة في عرض Grid</li>
          <li><strong>Tablet (640px - 1023px):</strong> عمودين في عرض Grid</li>
          <li><strong>Mobile (&lt;640px):</strong> عمود واحد في عرض Grid</li>
          <li><strong>عرض List:</strong> صف واحد لكل وظيفة على جميع الأجهزة</li>
          <li><strong>الوظائف المحفوظة:</strong> {bookmarkedJobs.size} وظيفة</li>
        </ul>
      </div>
    </div>
  );
};

export default JobCardsExample;
