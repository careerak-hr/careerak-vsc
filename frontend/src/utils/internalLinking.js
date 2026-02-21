/**
 * Internal Linking Structure for SEO
 * 
 * This utility provides a centralized internal linking structure to improve:
 * - SEO through strategic internal links
 * - User navigation and discovery
 * - Page authority distribution
 * - Crawlability for search engines
 */

/**
 * Site structure with internal links organized by category
 */
export const INTERNAL_LINKS = {
  // Main navigation links
  main: [
    { path: '/job-postings', label: { ar: 'الوظائف', en: 'Jobs', fr: 'Emplois' }, priority: 'high' },
    { path: '/courses', label: { ar: 'الدورات', en: 'Courses', fr: 'Cours' }, priority: 'high' },
    { path: '/profile', label: { ar: 'الملف الشخصي', en: 'Profile', fr: 'Profil' }, priority: 'medium' },
    { path: '/settings', label: { ar: 'الإعدادات', en: 'Settings', fr: 'Paramètres' }, priority: 'low' },
  ],

  // Job-related links
  jobs: [
    { path: '/job-postings', label: { ar: 'تصفح الوظائف', en: 'Browse Jobs', fr: 'Parcourir les emplois' } },
    { path: '/post-job', label: { ar: 'نشر وظيفة', en: 'Post a Job', fr: 'Publier un emploi' }, requiresRole: 'HR' },
    { path: '/profile', label: { ar: 'ملفي الشخصي', en: 'My Profile', fr: 'Mon profil' } },
  ],

  // Course-related links
  courses: [
    { path: '/courses', label: { ar: 'تصفح الدورات', en: 'Browse Courses', fr: 'Parcourir les cours' } },
    { path: '/post-course', label: { ar: 'نشر دورة', en: 'Post a Course', fr: 'Publier un cours' }, requiresRole: 'HR' },
    { path: '/profile', label: { ar: 'ملفي الشخصي', en: 'My Profile', fr: 'Mon profil' } },
  ],

  // Profile-related links
  profile: [
    { path: '/job-postings', label: { ar: 'البحث عن وظائف', en: 'Find Jobs', fr: 'Trouver des emplois' } },
    { path: '/courses', label: { ar: 'الدورات التدريبية', en: 'Training Courses', fr: 'Cours de formation' } },
    { path: '/settings', label: { ar: 'إعدادات الحساب', en: 'Account Settings', fr: 'Paramètres du compte' } },
    { path: '/notifications', label: { ar: 'الإشعارات', en: 'Notifications', fr: 'Notifications' } },
  ],

  // Footer links
  footer: [
    { path: '/policy', label: { ar: 'سياسة الخصوصية', en: 'Privacy Policy', fr: 'Politique de confidentialité' } },
    { path: '/job-postings', label: { ar: 'الوظائف', en: 'Jobs', fr: 'Emplois' } },
    { path: '/courses', label: { ar: 'الدورات', en: 'Courses', fr: 'Cours' } },
    { path: '/profile', label: { ar: 'الملف الشخصي', en: 'Profile', fr: 'Profil' } },
  ],

  // Related content suggestions
  related: {
    '/job-postings': [
      { path: '/courses', label: { ar: 'دورات تدريبية', en: 'Training Courses', fr: 'Cours de formation' }, description: { ar: 'طور مهاراتك', en: 'Develop your skills', fr: 'Développez vos compétences' } },
      { path: '/profile', label: { ar: 'تحديث السيرة الذاتية', en: 'Update Resume', fr: 'Mettre à jour le CV' }, description: { ar: 'حسّن فرصك', en: 'Improve your chances', fr: 'Améliorez vos chances' } },
    ],
    '/courses': [
      { path: '/job-postings', label: { ar: 'فرص عمل', en: 'Job Opportunities', fr: 'Opportunités d\'emploi' }, description: { ar: 'ابحث عن وظيفة', en: 'Find a job', fr: 'Trouver un emploi' } },
      { path: '/profile', label: { ar: 'إضافة مهارات', en: 'Add Skills', fr: 'Ajouter des compétences' }, description: { ar: 'حدّث ملفك', en: 'Update your profile', fr: 'Mettez à jour votre profil' } },
    ],
    '/profile': [
      { path: '/job-postings', label: { ar: 'تصفح الوظائف', en: 'Browse Jobs', fr: 'Parcourir les emplois' }, description: { ar: 'ابحث عن فرصتك', en: 'Find your opportunity', fr: 'Trouvez votre opportunité' } },
      { path: '/courses', label: { ar: 'دورات تدريبية', en: 'Training Courses', fr: 'Cours de formation' }, description: { ar: 'طور مهاراتك', en: 'Develop your skills', fr: 'Développez vos compétences' } },
    ],
  },

  // Breadcrumb navigation
  breadcrumbs: {
    '/job-postings': [
      { path: '/', label: { ar: 'الرئيسية', en: 'Home', fr: 'Accueil' } },
      { path: '/job-postings', label: { ar: 'الوظائف', en: 'Jobs', fr: 'Emplois' } },
    ],
    '/courses': [
      { path: '/', label: { ar: 'الرئيسية', en: 'Home', fr: 'Accueil' } },
      { path: '/courses', label: { ar: 'الدورات', en: 'Courses', fr: 'Cours' } },
    ],
    '/profile': [
      { path: '/', label: { ar: 'الرئيسية', en: 'Home', fr: 'Accueil' } },
      { path: '/profile', label: { ar: 'الملف الشخصي', en: 'Profile', fr: 'Profil' } },
    ],
    '/settings': [
      { path: '/', label: { ar: 'الرئيسية', en: 'Home', fr: 'Accueil' } },
      { path: '/profile', label: { ar: 'الملف الشخصي', en: 'Profile', fr: 'Profil' } },
      { path: '/settings', label: { ar: 'الإعدادات', en: 'Settings', fr: 'Paramètres' } },
    ],
  },
};

/**
 * Get internal links for a specific category
 * @param {string} category - Category name (main, jobs, courses, profile, footer)
 * @param {string} language - Current language (ar, en, fr)
 * @param {object} user - Current user object (for role-based filtering)
 * @returns {Array} Array of link objects with path and label
 */
export const getInternalLinks = (category, language = 'en', user = null) => {
  const links = INTERNAL_LINKS[category] || [];
  
  return links
    .filter(link => {
      // Filter by role if required
      if (link.requiresRole && (!user || user.role !== link.requiresRole)) {
        return false;
      }
      return true;
    })
    .map(link => ({
      path: link.path,
      label: link.label[language] || link.label.en,
      priority: link.priority,
      description: link.description ? link.description[language] || link.description.en : null,
    }));
};

/**
 * Get related content links for a specific page
 * @param {string} currentPath - Current page path
 * @param {string} language - Current language (ar, en, fr)
 * @returns {Array} Array of related link objects
 */
export const getRelatedLinks = (currentPath, language = 'en') => {
  const related = INTERNAL_LINKS.related[currentPath] || [];
  
  return related.map(link => ({
    path: link.path,
    label: link.label[language] || link.label.en,
    description: link.description ? link.description[language] || link.description.en : null,
  }));
};

/**
 * Get breadcrumb navigation for a specific page
 * @param {string} currentPath - Current page path
 * @param {string} language - Current language (ar, en, fr)
 * @returns {Array} Array of breadcrumb objects
 */
export const getBreadcrumbs = (currentPath, language = 'en') => {
  const breadcrumbs = INTERNAL_LINKS.breadcrumbs[currentPath] || [];
  
  return breadcrumbs.map(crumb => ({
    path: crumb.path,
    label: crumb.label[language] || crumb.label.en,
  }));
};

/**
 * Get all high-priority links for sitemap
 * @returns {Array} Array of high-priority paths
 */
export const getHighPriorityLinks = () => {
  return INTERNAL_LINKS.main
    .filter(link => link.priority === 'high')
    .map(link => link.path);
};

/**
 * Generate contextual link text for SEO
 * @param {string} targetPath - Target page path
 * @param {string} language - Current language
 * @returns {string} SEO-friendly link text
 */
export const getContextualLinkText = (targetPath, language = 'en') => {
  const linkTexts = {
    '/job-postings': {
      ar: 'استكشف فرص العمل المتاحة',
      en: 'Explore available job opportunities',
      fr: 'Explorez les opportunités d\'emploi disponibles',
    },
    '/courses': {
      ar: 'تصفح الدورات التدريبية',
      en: 'Browse training courses',
      fr: 'Parcourir les cours de formation',
    },
    '/profile': {
      ar: 'عرض الملف الشخصي',
      en: 'View profile',
      fr: 'Voir le profil',
    },
  };

  return linkTexts[targetPath]?.[language] || linkTexts[targetPath]?.en || targetPath;
};

export default {
  INTERNAL_LINKS,
  getInternalLinks,
  getRelatedLinks,
  getBreadcrumbs,
  getHighPriorityLinks,
  getContextualLinkText,
};
