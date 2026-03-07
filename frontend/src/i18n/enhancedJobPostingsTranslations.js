/**
 * Enhanced Job Postings Translations
 * ترجمات صفحة الوظائف المحسّنة
 * 
 * يحتوي على جميع الترجمات للميزات التالية:
 * - Grid/List Toggle
 * - Bookmark System
 * - Share System
 * - Similar Jobs
 * - Salary Estimation
 * - Company Info
 * - Skeleton Loading
 * - Filters & Search
 */

export const enhancedJobPostingsTranslations = {
  ar: {
    // View Toggle
    viewToggle: {
      grid: 'عرض شبكي',
      list: 'عرض قائمة',
      switchToGrid: 'التبديل إلى العرض الشبكي',
      switchToList: 'التبديل إلى عرض القائمة',
    },

    // Bookmark System
    bookmark: {
      save: 'حفظ الوظيفة',
      saved: 'تم الحفظ',
      remove: 'إزالة من المحفوظات',
      myBookmarks: 'وظائفي المحفوظة',
      bookmarksCount: 'عدد الوظائف المحفوظة',
      noBookmarks: 'لا توجد وظائف محفوظة',
      bookmarkAdded: 'تمت إضافة الوظيفة إلى المحفوظات',
      bookmarkRemoved: 'تمت إزالة الوظيفة من المحفوظات',
      viewAllBookmarks: 'عرض جميع الوظائف المحفوظة',
    },

    // Share System
    share: {
      title: 'مشاركة الوظيفة',
      copyLink: 'نسخ الرابط',
      linkCopied: 'تم نسخ الرابط',
      shareVia: 'مشاركة عبر',
      whatsapp: 'واتساب',
      linkedin: 'لينكد إن',
      twitter: 'تويتر',
      facebook: 'فيسبوك',
      shareSuccess: 'تمت المشاركة بنجاح',
      shareFailed: 'فشلت المشاركة',
    },

    // Similar Jobs
    similarJobs: {
      title: 'وظائف مشابهة',
      noSimilarJobs: 'لا توجد وظائف مشابهة',
      matchPercentage: 'نسبة التطابق',
      viewAll: 'عرض الكل',
      loading: 'جاري تحميل الوظائف المشابهة...',
    },

    // Salary Estimation
    salary: {
      estimation: 'تقدير الراتب',
      provided: 'الراتب المعروض',
      marketAverage: 'متوسط السوق',
      range: 'النطاق',
      comparison: {
        below: 'أقل من المتوسط',
        average: 'متوسط السوق',
        above: 'أعلى من المتوسط',
      },
      currency: 'ريال',
      perMonth: 'شهرياً',
      notAvailable: 'غير متوفر',
      insufficientData: 'بيانات غير كافية',
    },

    // Company Info
    company: {
      info: 'معلومات الشركة',
      size: {
        small: 'شركة صغيرة',
        medium: 'شركة متوسطة',
        large: 'شركة كبيرة',
      },
      employees: 'موظف',
      rating: 'التقييم',
      reviews: 'تقييم',
      openPositions: 'وظيفة مفتوحة',
      responseRate: {
        label: 'معدل الاستجابة',
        fast: 'سريع',
        medium: 'متوسط',
        slow: 'بطيء',
      },
      viewOtherJobs: 'وظائف أخرى',
      website: 'الموقع الإلكتروني',
      noDescription: 'لا يوجد وصف متاح',
    },

    // Job Card
    jobCard: {
      postedDate: 'منذ',
      applicants: 'متقدم',
      urgent: 'عاجل',
      new: 'جديد',
      apply: 'تقديم',
      viewDetails: 'عرض التفاصيل',
      fullTime: 'دوام كامل',
      partTime: 'دوام جزئي',
      remote: 'عن بُعد',
      onSite: 'في الموقع',
      hybrid: 'مختلط',
    },

    // Filters & Search
    filters: {
      title: 'الفلاتر',
      search: 'بحث',
      searchPlaceholder: 'ابحث عن وظيفة...',
      field: 'المجال',
      location: 'الموقع',
      jobType: 'نوع العمل',
      experience: 'الخبرة',
      salary: 'الراتب',
      clearAll: 'مسح الفلاتر',
      apply: 'تطبيق',
      resultsCount: 'نتيجة',
      noResults: 'لا توجد نتائج',
      showMore: 'عرض المزيد',
      showLess: 'عرض أقل',
    },

    // Loading States
    loading: {
      jobs: 'جاري تحميل الوظائف...',
      details: 'جاري تحميل التفاصيل...',
      bookmarks: 'جاري تحميل الوظائف المحفوظة...',
      similarJobs: 'جاري تحميل الوظائف المشابهة...',
      companyInfo: 'جاري تحميل معلومات الشركة...',
    },

    // Error Messages
    errors: {
      loadFailed: 'فشل تحميل الوظائف',
      bookmarkFailed: 'فشل حفظ الوظيفة',
      shareFailed: 'فشلت المشاركة',
      tryAgain: 'حاول مرة أخرى',
      networkError: 'خطأ في الاتصال',
      unauthorized: 'يجب تسجيل الدخول أولاً',
    },

    // Success Messages
    success: {
      bookmarkAdded: 'تمت إضافة الوظيفة إلى المحفوظات',
      bookmarkRemoved: 'تمت إزالة الوظيفة من المحفوظات',
      linkCopied: 'تم نسخ الرابط بنجاح',
      applicationSubmitted: 'تم تقديم الطلب بنجاح',
    },

    // Additional Info
    additionalInfo: {
      acceptanceProbability: {
        label: 'احتمالية القبول',
        high: 'عالية',
        medium: 'متوسطة',
        low: 'منخفضة',
      },
      matchScore: 'نسبة التطابق',
      skillsMatch: 'تطابق المهارات',
      experienceMatch: 'تطابق الخبرة',
    },

    // Time Formats
    time: {
      justNow: 'الآن',
      minutesAgo: 'منذ {count} دقيقة',
      hoursAgo: 'منذ {count} ساعة',
      daysAgo: 'منذ {count} يوم',
      weeksAgo: 'منذ {count} أسبوع',
      monthsAgo: 'منذ {count} شهر',
    },
  },

  en: {
    // View Toggle
    viewToggle: {
      grid: 'Grid View',
      list: 'List View',
      switchToGrid: 'Switch to Grid View',
      switchToList: 'Switch to List View',
    },

    // Bookmark System
    bookmark: {
      save: 'Save Job',
      saved: 'Saved',
      remove: 'Remove from Bookmarks',
      myBookmarks: 'My Saved Jobs',
      bookmarksCount: 'Saved Jobs Count',
      noBookmarks: 'No saved jobs',
      bookmarkAdded: 'Job added to bookmarks',
      bookmarkRemoved: 'Job removed from bookmarks',
      viewAllBookmarks: 'View All Saved Jobs',
    },

    // Share System
    share: {
      title: 'Share Job',
      copyLink: 'Copy Link',
      linkCopied: 'Link Copied',
      shareVia: 'Share via',
      whatsapp: 'WhatsApp',
      linkedin: 'LinkedIn',
      twitter: 'Twitter',
      facebook: 'Facebook',
      shareSuccess: 'Shared successfully',
      shareFailed: 'Share failed',
    },

    // Similar Jobs
    similarJobs: {
      title: 'Similar Jobs',
      noSimilarJobs: 'No similar jobs found',
      matchPercentage: 'Match',
      viewAll: 'View All',
      loading: 'Loading similar jobs...',
    },

    // Salary Estimation
    salary: {
      estimation: 'Salary Estimation',
      provided: 'Offered Salary',
      marketAverage: 'Market Average',
      range: 'Range',
      comparison: {
        below: 'Below Average',
        average: 'Market Average',
        above: 'Above Average',
      },
      currency: 'SAR',
      perMonth: 'per month',
      notAvailable: 'Not Available',
      insufficientData: 'Insufficient Data',
    },

    // Company Info
    company: {
      info: 'Company Information',
      size: {
        small: 'Small Company',
        medium: 'Medium Company',
        large: 'Large Company',
      },
      employees: 'employees',
      rating: 'Rating',
      reviews: 'reviews',
      openPositions: 'open positions',
      responseRate: {
        label: 'Response Rate',
        fast: 'Fast',
        medium: 'Medium',
        slow: 'Slow',
      },
      viewOtherJobs: 'Other Jobs',
      website: 'Website',
      noDescription: 'No description available',
    },

    // Job Card
    jobCard: {
      postedDate: 'Posted',
      applicants: 'applicants',
      urgent: 'Urgent',
      new: 'New',
      apply: 'Apply',
      viewDetails: 'View Details',
      fullTime: 'Full Time',
      partTime: 'Part Time',
      remote: 'Remote',
      onSite: 'On Site',
      hybrid: 'Hybrid',
    },

    // Filters & Search
    filters: {
      title: 'Filters',
      search: 'Search',
      searchPlaceholder: 'Search for a job...',
      field: 'Field',
      location: 'Location',
      jobType: 'Job Type',
      experience: 'Experience',
      salary: 'Salary',
      clearAll: 'Clear Filters',
      apply: 'Apply',
      resultsCount: 'results',
      noResults: 'No results found',
      showMore: 'Show More',
      showLess: 'Show Less',
    },

    // Loading States
    loading: {
      jobs: 'Loading jobs...',
      details: 'Loading details...',
      bookmarks: 'Loading saved jobs...',
      similarJobs: 'Loading similar jobs...',
      companyInfo: 'Loading company information...',
    },

    // Error Messages
    errors: {
      loadFailed: 'Failed to load jobs',
      bookmarkFailed: 'Failed to save job',
      shareFailed: 'Share failed',
      tryAgain: 'Try Again',
      networkError: 'Network Error',
      unauthorized: 'Please login first',
    },

    // Success Messages
    success: {
      bookmarkAdded: 'Job added to bookmarks',
      bookmarkRemoved: 'Job removed from bookmarks',
      linkCopied: 'Link copied successfully',
      applicationSubmitted: 'Application submitted successfully',
    },

    // Additional Info
    additionalInfo: {
      acceptanceProbability: {
        label: 'Acceptance Probability',
        high: 'High',
        medium: 'Medium',
        low: 'Low',
      },
      matchScore: 'Match Score',
      skillsMatch: 'Skills Match',
      experienceMatch: 'Experience Match',
    },

    // Time Formats
    time: {
      justNow: 'Just now',
      minutesAgo: '{count} minutes ago',
      hoursAgo: '{count} hours ago',
      daysAgo: '{count} days ago',
      weeksAgo: '{count} weeks ago',
      monthsAgo: '{count} months ago',
    },
  },

  fr: {
    // View Toggle
    viewToggle: {
      grid: 'Vue Grille',
      list: 'Vue Liste',
      switchToGrid: 'Passer à la vue grille',
      switchToList: 'Passer à la vue liste',
    },

    // Bookmark System
    bookmark: {
      save: 'Enregistrer l\'emploi',
      saved: 'Enregistré',
      remove: 'Retirer des favoris',
      myBookmarks: 'Mes emplois enregistrés',
      bookmarksCount: 'Nombre d\'emplois enregistrés',
      noBookmarks: 'Aucun emploi enregistré',
      bookmarkAdded: 'Emploi ajouté aux favoris',
      bookmarkRemoved: 'Emploi retiré des favoris',
      viewAllBookmarks: 'Voir tous les emplois enregistrés',
    },

    // Share System
    share: {
      title: 'Partager l\'emploi',
      copyLink: 'Copier le lien',
      linkCopied: 'Lien copié',
      shareVia: 'Partager via',
      whatsapp: 'WhatsApp',
      linkedin: 'LinkedIn',
      twitter: 'Twitter',
      facebook: 'Facebook',
      shareSuccess: 'Partagé avec succès',
      shareFailed: 'Échec du partage',
    },

    // Similar Jobs
    similarJobs: {
      title: 'Emplois similaires',
      noSimilarJobs: 'Aucun emploi similaire trouvé',
      matchPercentage: 'Correspondance',
      viewAll: 'Voir tout',
      loading: 'Chargement des emplois similaires...',
    },

    // Salary Estimation
    salary: {
      estimation: 'Estimation du salaire',
      provided: 'Salaire proposé',
      marketAverage: 'Moyenne du marché',
      range: 'Fourchette',
      comparison: {
        below: 'Inférieur à la moyenne',
        average: 'Moyenne du marché',
        above: 'Supérieur à la moyenne',
      },
      currency: 'SAR',
      perMonth: 'par mois',
      notAvailable: 'Non disponible',
      insufficientData: 'Données insuffisantes',
    },

    // Company Info
    company: {
      info: 'Informations sur l\'entreprise',
      size: {
        small: 'Petite entreprise',
        medium: 'Entreprise moyenne',
        large: 'Grande entreprise',
      },
      employees: 'employés',
      rating: 'Évaluation',
      reviews: 'avis',
      openPositions: 'postes ouverts',
      responseRate: {
        label: 'Taux de réponse',
        fast: 'Rapide',
        medium: 'Moyen',
        slow: 'Lent',
      },
      viewOtherJobs: 'Autres emplois',
      website: 'Site web',
      noDescription: 'Aucune description disponible',
    },

    // Job Card
    jobCard: {
      postedDate: 'Publié',
      applicants: 'candidats',
      urgent: 'Urgent',
      new: 'Nouveau',
      apply: 'Postuler',
      viewDetails: 'Voir les détails',
      fullTime: 'Temps plein',
      partTime: 'Temps partiel',
      remote: 'À distance',
      onSite: 'Sur site',
      hybrid: 'Hybride',
    },

    // Filters & Search
    filters: {
      title: 'Filtres',
      search: 'Rechercher',
      searchPlaceholder: 'Rechercher un emploi...',
      field: 'Domaine',
      location: 'Lieu',
      jobType: 'Type d\'emploi',
      experience: 'Expérience',
      salary: 'Salaire',
      clearAll: 'Effacer les filtres',
      apply: 'Appliquer',
      resultsCount: 'résultats',
      noResults: 'Aucun résultat trouvé',
      showMore: 'Afficher plus',
      showLess: 'Afficher moins',
    },

    // Loading States
    loading: {
      jobs: 'Chargement des emplois...',
      details: 'Chargement des détails...',
      bookmarks: 'Chargement des emplois enregistrés...',
      similarJobs: 'Chargement des emplois similaires...',
      companyInfo: 'Chargement des informations sur l\'entreprise...',
    },

    // Error Messages
    errors: {
      loadFailed: 'Échec du chargement des emplois',
      bookmarkFailed: 'Échec de l\'enregistrement de l\'emploi',
      shareFailed: 'Échec du partage',
      tryAgain: 'Réessayer',
      networkError: 'Erreur réseau',
      unauthorized: 'Veuillez vous connecter d\'abord',
    },

    // Success Messages
    success: {
      bookmarkAdded: 'Emploi ajouté aux favoris',
      bookmarkRemoved: 'Emploi retiré des favoris',
      linkCopied: 'Lien copié avec succès',
      applicationSubmitted: 'Candidature soumise avec succès',
    },

    // Additional Info
    additionalInfo: {
      acceptanceProbability: {
        label: 'Probabilité d\'acceptation',
        high: 'Élevée',
        medium: 'Moyenne',
        low: 'Faible',
      },
      matchScore: 'Score de correspondance',
      skillsMatch: 'Correspondance des compétences',
      experienceMatch: 'Correspondance de l\'expérience',
    },

    // Time Formats
    time: {
      justNow: 'À l\'instant',
      minutesAgo: 'Il y a {count} minutes',
      hoursAgo: 'Il y a {count} heures',
      daysAgo: 'Il y a {count} jours',
      weeksAgo: 'Il y a {count} semaines',
      monthsAgo: 'Il y a {count} mois',
    },
  },
};

/**
 * Helper function to get translation
 * @param {string} language - Current language (ar, en, fr)
 * @param {string} key - Translation key (e.g., 'bookmark.save')
 * @param {object} params - Parameters for interpolation (e.g., {count: 5})
 * @returns {string} Translated text
 */
export const getTranslation = (language, key, params = {}) => {
  const keys = key.split('.');
  let translation = enhancedJobPostingsTranslations[language] || enhancedJobPostingsTranslations.ar;
  
  for (const k of keys) {
    translation = translation[k];
    if (!translation) {
      console.warn(`Translation not found for key: ${key} in language: ${language}`);
      return key;
    }
  }
  
  // Replace parameters
  if (typeof translation === 'string' && Object.keys(params).length > 0) {
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param]);
    });
  }
  
  return translation;
};

/**
 * Custom hook to use translations
 * @returns {object} Translation functions
 */
export const useEnhancedJobPostingsTranslations = (language = 'ar') => {
  const t = (key, params) => getTranslation(language, key, params);
  
  return {
    t,
    translations: enhancedJobPostingsTranslations[language] || enhancedJobPostingsTranslations.ar,
  };
};
