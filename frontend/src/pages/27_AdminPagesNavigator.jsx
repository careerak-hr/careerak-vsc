import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './27_AdminPagesNavigator.css';

const AdminPagesNavigator = () => {
  const { language, startBgMusic } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Category IDs for keyboard navigation
  const categoryIds = ['all', 'auth', 'onboarding', 'interfaces', 'jobs', 'courses', 'settings', 'admin'];

  // Keyboard navigation for categories
  const handleCategoryKeyDown = (e) => {
    const currentIndex = categoryIds.indexOf(selectedCategory);
    let newIndex = currentIndex;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      newIndex = (currentIndex + 1) % categoryIds.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      newIndex = currentIndex === 0 ? categoryIds.length - 1 : currentIndex - 1;
    } else if (e.key === 'Home') {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIndex = categoryIds.length - 1;
    }

    if (newIndex !== currentIndex) {
      setSelectedCategory(categoryIds[newIndex]);
    }
  };

  // تشغيل الموسيقى عند فتح الصفحة
  useEffect(() => {
    console.log('🗺️ AdminPagesNavigator mounted');
    if (startBgMusic) startBgMusic();
  }, [startBgMusic]);

  // قائمة شاملة بجميع صفحات التطبيق
  const allPages = [
    // صفحات البداية والدخول
    { id: 1, name: 'Language Selection', nameAr: 'اختيار اللغة', nameFr: 'Sélection de Langue', path: '/language', category: 'auth', icon: '🌐' },
    { id: 2, name: 'Entry Page', nameAr: 'صفحة الدخول', nameFr: 'Page d\'Entrée', path: '/entry', category: 'auth', icon: '🚪' },
    { id: 3, name: 'Login', nameAr: 'تسجيل الدخول', nameFr: 'Connexion', path: '/login', category: 'auth', icon: '🔐' },
    { id: 4, name: 'Registration', nameAr: 'التسجيل', nameFr: 'Inscription', path: '/auth', category: 'auth', icon: '📝' },
    { id: 5, name: 'OTP Verification', nameAr: 'التحقق OTP', nameFr: 'Vérification OTP', path: '/otp-verify', category: 'auth', icon: '🔢' },
    
    // صفحات Onboarding
    { id: 6, name: 'Onboarding Individuals', nameAr: 'إعداد الأفراد', nameFr: 'Intégration Individus', path: '/onboarding-individuals', category: 'onboarding', icon: '👤' },
    { id: 7, name: 'Onboarding Companies', nameAr: 'إعداد الشركات', nameFr: 'Intégration Entreprises', path: '/onboarding-companies', category: 'onboarding', icon: '🏢' },
    { id: 8, name: 'Onboarding Illiterate', nameAr: 'إعداد الأميين', nameFr: 'Intégration Analphabètes', path: '/onboarding-illiterate', category: 'onboarding', icon: '📖' },
    { id: 9, name: 'Onboarding Visual', nameAr: 'إعداد المكفوفين', nameFr: 'Intégration Malvoyants', path: '/onboarding-visual', category: 'onboarding', icon: '👁️' },
    { id: 10, name: 'Onboarding Ultimate', nameAr: 'إعداد شامل', nameFr: 'Intégration Ultime', path: '/onboarding-ultimate', category: 'onboarding', icon: '⭐' },
    
    // الواجهات الرئيسية
    { id: 11, name: 'Interface Individuals', nameAr: 'واجهة الأفراد', nameFr: 'Interface Individus', path: '/interface-individuals', category: 'interfaces', icon: '👥' },
    { id: 12, name: 'Interface Companies', nameAr: 'واجهة الشركات', nameFr: 'Interface Entreprises', path: '/interface-companies', category: 'interfaces', icon: '🏭' },
    { id: 13, name: 'Interface Illiterate', nameAr: 'واجهة الأميين', nameFr: 'Interface Analphabètes', path: '/interface-illiterate', category: 'interfaces', icon: '📚' },
    { id: 14, name: 'Interface Visual', nameAr: 'واجهة المكفوفين', nameFr: 'Interface Malvoyants', path: '/interface-visual', category: 'interfaces', icon: '👓' },
    { id: 15, name: 'Interface Ultimate', nameAr: 'واجهة شاملة', nameFr: 'Interface Ultime', path: '/interface-ultimate', category: 'interfaces', icon: '🌟' },
    { id: 16, name: 'Interface Shops', nameAr: 'واجهة المحلات', nameFr: 'Interface Boutiques', path: '/interface-shops', category: 'interfaces', icon: '🛒' },
    { id: 17, name: 'Interface Workshops', nameAr: 'واجهة الورش', nameFr: 'Interface Ateliers', path: '/interface-workshops', category: 'interfaces', icon: '🔧' },
    
    // صفحات الوظائف والدورات
    { id: 18, name: 'Job Postings', nameAr: 'الوظائف المتاحة', nameFr: 'Offres d\'Emploi', path: '/job-postings', category: 'jobs', icon: '💼' },
    { id: 19, name: 'Post Job', nameAr: 'نشر وظيفة', nameFr: 'Publier Emploi', path: '/post-job', category: 'jobs', icon: '➕' },
    // ملاحظة: صفحة التقديم تحتاج jobId، لذا سنوجه للوظائف بدلاً منها
    { id: 21, name: 'Courses', nameAr: 'الدورات التدريبية', nameFr: 'Cours', path: '/courses', category: 'courses', icon: '🎓' },
    { id: 22, name: 'Post Course', nameAr: 'نشر دورة', nameFr: 'Publier Cours', path: '/post-course', category: 'courses', icon: '📚' },
    
    // صفحات الإعدادات والملف الشخصي
    { id: 23, name: 'Profile', nameAr: 'الملف الشخصي', nameFr: 'Profil', path: '/profile', category: 'settings', icon: '👤' },
    { id: 24, name: 'Settings', nameAr: 'الإعدادات', nameFr: 'Paramètres', path: '/settings', category: 'settings', icon: '⚙️' },
    { id: 25, name: 'Privacy Policy', nameAr: 'سياسة الخصوصية', nameFr: 'Politique de Confidentialité', path: '/policy', category: 'settings', icon: '🔒' },
    
    // صفحات الأدمن
    { id: 26, name: 'Admin Dashboard', nameAr: 'لوحة تحكم الأدمن', nameFr: 'Tableau de Bord Admin', path: '/admin-dashboard', category: 'admin', icon: '👨‍💼' },
    { id: 27, name: 'Admin Sub Dashboard', nameAr: 'لوحة فرعية', nameFr: 'Sous-Tableau', path: '/admin-sub-dashboard', category: 'admin', icon: '📊' },
    { id: 28, name: 'Pages Navigator', nameAr: 'متصفح الصفحات', nameFr: 'Navigateur Pages', path: '/admin-pages', category: 'admin', icon: '🗺️' },
    { id: 29, name: 'System Control', nameAr: 'التحكم بالنظام', nameFr: 'Contrôle Système', path: '/admin-system', category: 'admin', icon: '🖥️' },
    { id: 30, name: 'Database Manager', nameAr: 'إدارة قاعدة البيانات', nameFr: 'Gestionnaire BD', path: '/admin-database', category: 'admin', icon: '🗄️' },
    { id: 31, name: 'Code Editor', nameAr: 'محرر الأكواد', nameFr: 'Éditeur Code', path: '/admin-code-editor', category: 'admin', icon: '💻' },
  ];

  const categories = [
    { id: 'all', nameAr: 'الكل', nameEn: 'All', nameFr: 'Tout', icon: '📋' },
    { id: 'auth', nameAr: 'المصادقة', nameEn: 'Authentication', nameFr: 'Authentification', icon: '🔐' },
    { id: 'onboarding', nameAr: 'الإعداد', nameEn: 'Onboarding', nameFr: 'Intégration', icon: '🚀' },
    { id: 'interfaces', nameAr: 'الواجهات', nameEn: 'Interfaces', nameFr: 'Interfaces', icon: '🖼️' },
    { id: 'jobs', nameAr: 'الوظائف', nameEn: 'Jobs', nameFr: 'Emplois', icon: '💼' },
    { id: 'courses', nameAr: 'الدورات', nameEn: 'Courses', nameFr: 'Cours', icon: '🎓' },
    { id: 'settings', nameAr: 'الإعدادات', nameEn: 'Settings', nameFr: 'Paramètres', icon: '⚙️' },
    { id: 'admin', nameAr: 'الأدمن', nameEn: 'Admin', nameFr: 'Admin', icon: '👨‍💼' },
  ];

  // تصفية الصفحات
  const filteredPages = allPages.filter(page => {
    const matchesCategory = selectedCategory === 'all' || page.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.nameAr.includes(searchTerm) ||
      page.nameFr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.path.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const getPageName = (page) => {
    if (language === 'ar') return page.nameAr;
    if (language === 'fr') return page.nameFr;
    return page.name;
  };

  const getCategoryName = (cat) => {
    if (language === 'ar') return cat.nameAr;
    if (language === 'fr') return cat.nameFr;
    return cat.nameEn;
  };

  const handleVisitPage = (page) => {
    // إضافة preview=true للصفحات المحمية بـ OnboardingRoute
    const onboardingPages = [
      '/onboarding-individuals',
      '/onboarding-companies',
      '/onboarding-illiterate',
      '/onboarding-visual',
      '/onboarding-ultimate'
    ];
    
    if (onboardingPages.includes(page.path)) {
      navigate(`${page.path}?preview=true`);
    } else {
      navigate(page.path);
    }
  };

  return (
    <main id="main-content" tabIndex="-1" className="admin-pages-navigator">
      {/* الهيدر */}
      <header className="apn-header">
        <button onClick={() => navigate('/admin-dashboard')} className="apn-back-btn">
          ← {language === 'ar' ? 'العودة' : language === 'fr' ? 'Retour' : 'Back'}
        </button>
        <h1 className="apn-title">
          {language === 'ar' ? '🗺️ متصفح صفحات التطبيق' : 
           language === 'fr' ? '🗺️ Navigateur de Pages' : 
           '🗺️ App Pages Navigator'}
        </h1>
      </header>

      {/* شريط البحث */}
      <div className="apn-search-bar">
        <input
          type="text"
          placeholder={language === 'ar' ? '🔍 ابحث عن صفحة...' : 
                      language === 'fr' ? '🔍 Rechercher une page...' : 
                      '🔍 Search for a page...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="apn-search-input"
        />
      </div>

      {/* فلاتر الفئات */}
      <div className="apn-categories" role="listbox" aria-label={language === 'ar' ? 'فئات الصفحات' : language === 'fr' ? 'Catégories de pages' : 'Page categories'}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            onKeyDown={handleCategoryKeyDown}
            className={`apn-category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            role="option"
            aria-selected={selectedCategory === cat.id}
            tabIndex={selectedCategory === cat.id ? 0 : -1}
          >
            <span>{cat.icon}</span>
            <span>{getCategoryName(cat)}</span>
          </button>
        ))}
      </div>

      {/* عدد النتائج */}
      <div className="apn-results-count">
        {language === 'ar' ? `${filteredPages.length} صفحة` : 
         language === 'fr' ? `${filteredPages.length} pages` : 
         `${filteredPages.length} pages`}
      </div>

      {/* قائمة الصفحات */}
      <div className="apn-pages-grid">
        {filteredPages.map(page => (
          <div key={page.id} className="apn-page-card">
            <div className="apn-page-icon">{page.icon}</div>
            <div className="apn-page-info">
              <h2 className="apn-page-name">{getPageName(page)}</h2>
              <p className="apn-page-path">{page.path}</p>
            </div>
            <button
              onClick={() => handleVisitPage(page)}
              className="apn-page-visit-btn"
            >
              {language === 'ar' ? 'زيارة' : language === 'fr' ? 'Visiter' : 'Visit'}
            </button>
          </div>
        ))}
      </div>

      {/* رسالة عدم وجود نتائج */}
      {filteredPages.length === 0 && (
        <div className="apn-no-results">
          <p>
            {language === 'ar' ? '😔 لا توجد صفحات مطابقة' : 
             language === 'fr' ? '😔 Aucune page correspondante' : 
             '😔 No matching pages'}
          </p>
        </div>
      )}
    </main>
  );
};

export default AdminPagesNavigator;
