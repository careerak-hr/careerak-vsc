import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';
import { Breadcrumbs } from '../components/InternalLinks';
import ComponentErrorBoundary from '../components/ErrorBoundary/ComponentErrorBoundary';
import { JobCardSkeleton } from '../components/SkeletonLoaders';
import SavedSearchesPanel from '../components/SavedSearchesPanel';
import { ResultsList } from '../components/Search';

/**
 * مثال على صفحة الوظائف مع نسب المطابقة
 * يوضح كيفية دمج مكون ResultsList في صفحة الوظائف
 */
const JobPostingsWithMatchScoreExample = () => {
    const { language, startBgMusic } = useApp();
    const seo = useSEO('jobPostings', {});
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list');

    useEffect(() => {
        startBgMusic();
        
        // محاكاة جلب الوظائف مع نسب المطابقة من API
        const fetchJobsWithMatchScores = async () => {
            setLoading(true);
            
            try {
                // في التطبيق الحقيقي، سيتم استدعاء API هنا:
                // const response = await fetch('/api/recommendations/jobs?limit=10', {
                //   headers: { 'Authorization': `Bearer ${token}` }
                // });
                // const data = await response.json();
                
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
                            salary: { min: 15000, max: 25000, currency: 'SAR' },
                            description: 'We are looking for an experienced frontend developer with expertise in React, TypeScript, and modern web technologies. You will be working on cutting-edge projects with a talented team.',
                            jobType: 'Full-time',
                            status: 'Open',
                            createdAt: new Date().toISOString(),
                            postedBy: { companyName: 'Tech Corp' }
                        },
                        matchScore: {
                            percentage: 92,
                            overall: 0.92,
                            scores: {
                                skills: 0.9,
                                experience: 0.95,
                                education: 0.85,
                                location: 1.0,
                                salary: 0.9,
                                jobType: 1.0
                            }
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
                            salary: { min: 12000, max: 20000, currency: 'SAR' },
                            description: 'Join our innovative team to build scalable web applications using modern technologies. We value creativity and continuous learning.',
                            jobType: 'Full-time',
                            status: 'Open',
                            createdAt: new Date().toISOString(),
                            postedBy: { companyName: 'Innovation Labs' }
                        },
                        matchScore: {
                            percentage: 85,
                            overall: 0.85
                        },
                        reasons: [
                            {
                                type: 'skills',
                                message: language === 'ar'
                                    ? 'لديك 7 من 10 مهارات مطلوبة'
                                    : 'You have 7 out of 10 required skills',
                                strength: 'high'
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
                            salary: { min: 18000, max: 28000, currency: 'AED' },
                            description: 'We need a skilled backend engineer to design and implement scalable microservices architecture.',
                            jobType: 'Full-time',
                            status: 'Open',
                            createdAt: new Date().toISOString(),
                            postedBy: { companyName: 'Cloud Solutions' }
                        },
                        matchScore: {
                            percentage: 72,
                            overall: 0.72
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
                            title: 'DevOps Engineer',
                            company: 'Tech Innovators',
                            location: 'Cairo, Egypt',
                            salary: { min: 10000, max: 18000, currency: 'EGP' },
                            description: 'Looking for a DevOps engineer to manage our cloud infrastructure and CI/CD pipelines.',
                            jobType: 'Full-time',
                            status: 'Open',
                            createdAt: new Date().toISOString(),
                            postedBy: { companyName: 'Tech Innovators' }
                        },
                        matchScore: {
                            percentage: 58,
                            overall: 0.58
                        },
                        reasons: [
                            {
                                type: 'skills',
                                message: language === 'ar'
                                    ? 'لديك 4 من 10 مهارات مطلوبة'
                                    : 'You have 4 out of 10 required skills',
                                strength: 'medium'
                            }
                        ]
                    },
                    {
                        job: {
                            _id: '5',
                            title: 'UI/UX Designer',
                            company: 'Design Studio',
                            location: 'Doha, Qatar',
                            salary: { min: 8000, max: 15000, currency: 'QAR' },
                            description: 'Creative UI/UX designer needed to craft beautiful and intuitive user experiences for our products.',
                            jobType: 'Full-time',
                            status: 'Open',
                            createdAt: new Date().toISOString(),
                            postedBy: { companyName: 'Design Studio' }
                        },
                        matchScore: {
                            percentage: 38,
                            overall: 0.38
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
            } catch (error) {
                console.error('Error fetching jobs:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchJobsWithMatchScores();
    }, [startBgMusic, language]);

    const handleJobClick = (job) => {
        console.log('Job clicked:', job);
        // في التطبيق الحقيقي، سيتم التوجيه إلى صفحة تفاصيل الوظيفة
        // navigate(`/jobs/${job._id}`);
    };

    const translations = {
        ar: {
            title: 'الوظائف المتاحة',
            subtitle: 'الوظائف الأكثر مطابقة لملفك الشخصي',
            viewMode: 'وضع العرض',
            listView: 'قائمة',
            gridView: 'شبكة',
            sortBy: 'ترتيب حسب',
            matchScore: 'نسبة المطابقة',
            datePosted: 'تاريخ النشر',
            salary: 'الراتب'
        },
        en: {
            title: 'Available Jobs',
            subtitle: 'Jobs that best match your profile',
            viewMode: 'View Mode',
            listView: 'List',
            gridView: 'Grid',
            sortBy: 'Sort By',
            matchScore: 'Match Score',
            datePosted: 'Date Posted',
            salary: 'Salary'
        },
        fr: {
            title: 'Emplois disponibles',
            subtitle: 'Emplois qui correspondent le mieux à votre profil',
            viewMode: 'Mode d\'affichage',
            listView: 'Liste',
            gridView: 'Grille',
            sortBy: 'Trier par',
            matchScore: 'Score de correspondance',
            datePosted: 'Date de publication',
            salary: 'Salaire'
        }
    };

    const t = translations[language] || translations.en;

    if (loading) {
        return (
            <>
                <SEOHead {...seo} />
                <main id="main-content" tabIndex="-1" className="job-postings-page">
                    <div className="container mx-auto px-4 py-8">
                        <h1 className="text-3xl font-bold mb-6">{t.title}</h1>
                        <section aria-labelledby="job-results">
                            <h2 id="job-results" className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                                {t.subtitle}
                            </h2>
                            <div className="job-listings space-y-4">
                                <JobCardSkeleton count={5} />
                            </div>
                        </section>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <SEOHead {...seo} />
            <main id="main-content" tabIndex="-1" className="job-postings-page">
                <div className="container mx-auto px-4 py-8">
                    {/* Breadcrumb Navigation */}
                    <Breadcrumbs />
                    
                    <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{t.title}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{t.subtitle}</p>
                    
                    {/* Saved Searches Panel */}
                    <ComponentErrorBoundary componentName="SavedSearchesPanel">
                        <SavedSearchesPanel />
                    </ComponentErrorBoundary>
                    
                    {/* Controls */}
                    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t.viewMode}:
                            </span>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    viewMode === 'list'
                                        ? 'bg-[#D48161] text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                {t.listView}
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    viewMode === 'grid'
                                        ? 'bg-[#D48161] text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                {t.gridView}
                            </button>
                        </div>
                    </div>
                    
                    {/* Job listings with match scores */}
                    <section aria-labelledby="job-results">
                        <h2 id="job-results" className="sr-only">{t.subtitle}</h2>
                        <ComponentErrorBoundary componentName="ResultsList">
                            <ResultsList
                                results={results}
                                loading={loading}
                                onJobClick={handleJobClick}
                                showMatchScore={true}
                                viewMode={viewMode}
                            />
                        </ComponentErrorBoundary>
                    </section>
                </div>
            </main>
        </>
    );
};

export default JobPostingsWithMatchScoreExample;
