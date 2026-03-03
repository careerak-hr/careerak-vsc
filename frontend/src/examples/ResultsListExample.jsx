import React, { useState, useEffect } from 'react';
import { ResultsList } from '../components/Search';
import { useApp } from '../context/AppContext';

/**
 * مثال على استخدام مكون ResultsList
 * يوضح كيفية عرض نتائج البحث مع نسب المطابقة
 */
const ResultsListExample = () => {
  const { language } = useApp();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    // محاكاة جلب النتائج من API
    const fetchResults = async () => {
      setLoading(true);
      
      // محاكاة تأخير API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // بيانات تجريبية مع نسب مطابقة
      const mockResults = [
        {
          job: {
            _id: '1',
            title: 'Senior Frontend Developer',
            company: 'Tech Corp',
            location: 'Riyadh, Saudi Arabia',
            salary: {
              min: 15000,
              max: 25000,
              currency: 'SAR'
            },
            description: 'We are looking for an experienced frontend developer with expertise in React, TypeScript, and modern web technologies. You will be working on cutting-edge projects with a talented team.',
            postedBy: {
              companyName: 'Tech Corp'
            }
          },
          matchScore: {
            percentage: 92,
            overall: 0.92
          },
          reasons: [
            {
              type: 'skills',
              message: language === 'ar' 
                ? 'لديك 8 من 10 مهارات مطلوبة (React, TypeScript, JavaScript, HTML, CSS, Git, REST APIs, Redux)'
                : 'You have 8 out of 10 required skills (React, TypeScript, JavaScript, HTML, CSS, Git, REST APIs, Redux)',
              strength: 'high'
            },
            {
              type: 'experience',
              message: language === 'ar'
                ? 'خبرتك (5 سنوات) تطابق المتطلبات (3-7 سنوات)'
                : 'Your experience (5 years) matches requirements (3-7 years)',
              strength: 'high'
            },
            {
              type: 'location',
              message: language === 'ar'
                ? 'الموقع يطابق تفضيلاتك (الرياض)'
                : 'Location matches your preferences (Riyadh)',
              strength: 'medium'
            }
          ]
        },
        {
          job: {
            _id: '2',
            title: 'Full Stack Developer',
            company: 'Innovation Labs',
            location: 'Jeddah, Saudi Arabia',
            salary: {
              min: 12000,
              max: 20000,
              currency: 'SAR'
            },
            description: 'Join our innovative team to build scalable web applications using modern technologies. We value creativity and continuous learning.',
            postedBy: {
              companyName: 'Innovation Labs'
            }
          },
          matchScore: {
            percentage: 78,
            overall: 0.78
          },
          reasons: [
            {
              type: 'skills',
              message: language === 'ar'
                ? 'لديك 6 من 10 مهارات مطلوبة'
                : 'You have 6 out of 10 required skills',
              strength: 'medium'
            },
            {
              type: 'experience',
              message: language === 'ar'
                ? 'خبرتك تطابق المتطلبات'
                : 'Your experience matches requirements',
              strength: 'high'
            }
          ]
        },
        {
          job: {
            _id: '3',
            title: 'Backend Engineer',
            company: 'Cloud Solutions',
            location: 'Dubai, UAE',
            salary: {
              min: 18000,
              max: 28000,
              currency: 'AED'
            },
            description: 'We need a skilled backend engineer to design and implement scalable microservices architecture.',
            postedBy: {
              companyName: 'Cloud Solutions'
            }
          },
          matchScore: {
            percentage: 65,
            overall: 0.65
          },
          reasons: [
            {
              type: 'skills',
              message: language === 'ar'
                ? 'لديك 5 من 10 مهارات مطلوبة'
                : 'You have 5 out of 10 required skills',
              strength: 'medium'
            },
            {
              type: 'salary',
              message: language === 'ar'
                ? 'الراتب يطابق توقعاتك'
                : 'Salary matches your expectations',
              strength: 'medium'
            }
          ]
        },
        {
          job: {
            _id: '4',
            title: 'UI/UX Designer',
            company: 'Design Studio',
            location: 'Cairo, Egypt',
            salary: {
              min: 8000,
              max: 15000,
              currency: 'EGP'
            },
            description: 'Creative UI/UX designer needed to craft beautiful and intuitive user experiences for our products.',
            postedBy: {
              companyName: 'Design Studio'
            }
          },
          matchScore: {
            percentage: 45,
            overall: 0.45
          },
          reasons: [
            {
              type: 'general',
              message: language === 'ar'
                ? 'هذه الوظيفة قد تكون فرصة لتطوير مهاراتك'
                : 'This job could be an opportunity to develop your skills',
              strength: 'low'
            }
          ]
        }
      ];
      
      setResults(mockResults);
      setLoading(false);
    };
    
    fetchResults();
  }, [language]);

  const handleJobClick = (job) => {
    console.log('Job clicked:', job);
    alert(`Viewing details for: ${job.title}`);
  };

  const translations = {
    ar: {
      title: 'مثال على قائمة النتائج',
      subtitle: 'عرض نتائج البحث مع نسب المطابقة',
      viewMode: 'وضع العرض',
      listView: 'قائمة',
      gridView: 'شبكة',
      showMatch: 'عرض نسبة المطابقة',
      loading: 'جاري التحميل...'
    },
    en: {
      title: 'Results List Example',
      subtitle: 'Display search results with match scores',
      viewMode: 'View Mode',
      listView: 'List',
      gridView: 'Grid',
      showMatch: 'Show Match Score',
      loading: 'Loading...'
    },
    fr: {
      title: 'Exemple de liste de résultats',
      subtitle: 'Afficher les résultats de recherche avec scores de correspondance',
      viewMode: 'Mode d\'affichage',
      listView: 'Liste',
      gridView: 'Grille',
      showMatch: 'Afficher le score',
      loading: 'Chargement...'
    }
  };

  const t = translations[language] || translations.en;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.5rem', color: '#304B60' }}>{t.title}</h1>
      <p style={{ marginBottom: '2rem', color: '#6b7280' }}>{t.subtitle}</p>
      
      {/* Controls */}
      <div style={{ 
        marginBottom: '2rem', 
        padding: '1rem', 
        background: '#f9fafb',
        borderRadius: '8px',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div>
          <label style={{ marginRight: '0.5rem', fontWeight: '500' }}>
            {t.viewMode}:
          </label>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '0.5rem 1rem',
              marginRight: '0.5rem',
              background: viewMode === 'list' ? '#D48161' : 'white',
              color: viewMode === 'list' ? 'white' : '#304B60',
              border: '2px solid #D4816180',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {t.listView}
          </button>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '0.5rem 1rem',
              background: viewMode === 'grid' ? '#D48161' : 'white',
              color: viewMode === 'grid' ? 'white' : '#304B60',
              border: '2px solid #D4816180',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {t.gridView}
          </button>
        </div>
      </div>

      {/* Results List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
          {t.loading}
        </div>
      ) : (
        <ResultsList
          results={results}
          loading={loading}
          onJobClick={handleJobClick}
          showMatchScore={true}
          viewMode={viewMode}
        />
      )}
    </div>
  );
};

export default ResultsListExample;
