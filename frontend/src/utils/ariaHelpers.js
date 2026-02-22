/**
 * ARIA Helpers - Utility functions for accessibility attributes
 * 
 * This module provides helper functions to ensure consistent ARIA implementation
 * across the application, meeting WCAG 2.1 Level AA standards.
 * 
 * Requirements: FR-A11Y-1, FR-A11Y-2, FR-A11Y-3, FR-A11Y-4, FR-A11Y-5
 */

/**
 * Get ARIA label for common UI elements based on language
 * @param {string} key - The label key
 * @param {string} language - Current language (ar, en, fr)
 * @returns {string} Translated ARIA label
 */
export const getAriaLabel = (key, language = 'en') => {
  const labels = {
    // Navigation
    mainNav: {
      ar: 'التنقل الرئيسي',
      en: 'Main navigation',
      fr: 'Navigation principale'
    },
    footerNav: {
      ar: 'التنقل السفلي',
      en: 'Footer navigation',
      fr: 'Navigation du pied de page'
    },
    skipToMain: {
      ar: 'تخطي إلى المحتوى الرئيسي',
      en: 'Skip to main content',
      fr: 'Passer au contenu principal'
    },
    
    // Common actions
    close: {
      ar: 'إغلاق',
      en: 'Close',
      fr: 'Fermer'
    },
    open: {
      ar: 'فتح',
      en: 'Open',
      fr: 'Ouvrir'
    },
    menu: {
      ar: 'القائمة',
      en: 'Menu',
      fr: 'Menu'
    },
    settings: {
      ar: 'الإعدادات',
      en: 'Settings',
      fr: 'Paramètres'
    },
    search: {
      ar: 'بحث',
      en: 'Search',
      fr: 'Rechercher'
    },
    filter: {
      ar: 'تصفية',
      en: 'Filter',
      fr: 'Filtrer'
    },
    sort: {
      ar: 'ترتيب',
      en: 'Sort',
      fr: 'Trier'
    },
    
    // Forms
    submit: {
      ar: 'إرسال',
      en: 'Submit',
      fr: 'Soumettre'
    },
    cancel: {
      ar: 'إلغاء',
      en: 'Cancel',
      fr: 'Annuler'
    },
    save: {
      ar: 'حفظ',
      en: 'Save',
      fr: 'Enregistrer'
    },
    edit: {
      ar: 'تعديل',
      en: 'Edit',
      fr: 'Modifier'
    },
    delete: {
      ar: 'حذف',
      en: 'Delete',
      fr: 'Supprimer'
    },
    
    // Profile
    profile: {
      ar: 'الملف الشخصي',
      en: 'Profile',
      fr: 'Profil'
    },
    uploadPhoto: {
      ar: 'رفع صورة',
      en: 'Upload photo',
      fr: 'Télécharger une photo'
    },
    changePhoto: {
      ar: 'تغيير الصورة',
      en: 'Change photo',
      fr: 'Changer la photo'
    },
    
    // Jobs
    applyJob: {
      ar: 'التقديم على الوظيفة',
      en: 'Apply for job',
      fr: 'Postuler pour le poste'
    },
    viewJob: {
      ar: 'عرض الوظيفة',
      en: 'View job',
      fr: 'Voir le poste'
    },
    postJob: {
      ar: 'نشر وظيفة',
      en: 'Post job',
      fr: 'Publier un poste'
    },
    
    // Courses
    enrollCourse: {
      ar: 'التسجيل في الدورة',
      en: 'Enroll in course',
      fr: "S'inscrire au cours"
    },
    viewCourse: {
      ar: 'عرض الدورة',
      en: 'View course',
      fr: 'Voir le cours'
    },
    
    // Notifications
    notifications: {
      ar: 'الإشعارات',
      en: 'Notifications',
      fr: 'Notifications'
    },
    markAsRead: {
      ar: 'تحديد كمقروء',
      en: 'Mark as read',
      fr: 'Marquer comme lu'
    },
    
    // Theme
    toggleTheme: {
      ar: 'تبديل المظهر',
      en: 'Toggle theme',
      fr: 'Basculer le thème'
    },
    darkMode: {
      ar: 'الوضع الداكن',
      en: 'Dark mode',
      fr: 'Mode sombre'
    },
    lightMode: {
      ar: 'الوضع الفاتح',
      en: 'Light mode',
      fr: 'Mode clair'
    },
    
    // Loading
    loading: {
      ar: 'جاري التحميل',
      en: 'Loading',
      fr: 'Chargement'
    },
    processing: {
      ar: 'جاري المعالجة',
      en: 'Processing',
      fr: 'Traitement'
    },
    
    // Pagination
    nextPage: {
      ar: 'الصفحة التالية',
      en: 'Next page',
      fr: 'Page suivante'
    },
    previousPage: {
      ar: 'الصفحة السابقة',
      en: 'Previous page',
      fr: 'Page précédente'
    },
    firstPage: {
      ar: 'الصفحة الأولى',
      en: 'First page',
      fr: 'Première page'
    },
    lastPage: {
      ar: 'الصفحة الأخيرة',
      en: 'Last page',
      fr: 'Dernière page'
    }
  };

  return labels[key]?.[language] || labels[key]?.en || key;
};

/**
 * Get ARIA role for common UI patterns
 * @param {string} type - The component type
 * @returns {string} ARIA role
 */
export const getAriaRole = (type) => {
  const roles = {
    navigation: 'navigation',
    main: 'main',
    complementary: 'complementary',
    banner: 'banner',
    contentinfo: 'contentinfo',
    search: 'search',
    form: 'form',
    dialog: 'dialog',
    alertdialog: 'alertdialog',
    alert: 'alert',
    status: 'status',
    progressbar: 'progressbar',
    button: 'button',
    tab: 'tab',
    tabpanel: 'tabpanel',
    tablist: 'tablist',
    menu: 'menu',
    menuitem: 'menuitem',
    menubar: 'menubar',
    listbox: 'listbox',
    option: 'option',
    combobox: 'combobox',
    grid: 'grid',
    gridcell: 'gridcell',
    tree: 'tree',
    treeitem: 'treeitem'
  };

  return roles[type] || null;
};

/**
 * Generate ARIA attributes for buttons
 * @param {Object} options - Button options
 * @returns {Object} ARIA attributes
 */
export const getButtonAriaAttributes = ({
  label,
  expanded = null,
  pressed = null,
  controls = null,
  describedBy = null,
  disabled = false,
  language = 'en'
}) => {
  const attrs = {
    'aria-label': label ? getAriaLabel(label, language) : undefined,
    'aria-expanded': expanded !== null ? String(expanded) : undefined,
    'aria-pressed': pressed !== null ? String(pressed) : undefined,
    'aria-controls': controls || undefined,
    'aria-describedby': describedBy || undefined,
    'aria-disabled': disabled ? 'true' : undefined
  };

  // Remove undefined values
  return Object.fromEntries(
    Object.entries(attrs).filter(([_, value]) => value !== undefined)
  );
};

/**
 * Generate ARIA attributes for form inputs
 * @param {Object} options - Input options
 * @returns {Object} ARIA attributes
 */
export const getInputAriaAttributes = ({
  label,
  required = false,
  invalid = false,
  describedBy = null,
  errorId = null,
  language = 'en'
}) => {
  const attrs = {
    'aria-label': label ? getAriaLabel(label, language) : undefined,
    'aria-required': required ? 'true' : undefined,
    'aria-invalid': invalid ? 'true' : undefined,
    'aria-describedby': describedBy || (invalid && errorId) || undefined
  };

  return Object.fromEntries(
    Object.entries(attrs).filter(([_, value]) => value !== undefined)
  );
};

/**
 * Generate ARIA attributes for modals/dialogs
 * @param {Object} options - Modal options
 * @returns {Object} ARIA attributes
 */
export const getModalAriaAttributes = ({
  titleId,
  descriptionId = null,
  modal = true,
  language = 'en'
}) => {
  return {
    role: 'dialog',
    'aria-modal': modal ? 'true' : 'false',
    'aria-labelledby': titleId,
    'aria-describedby': descriptionId || undefined
  };
};

/**
 * Generate ARIA attributes for navigation
 * @param {Object} options - Navigation options
 * @returns {Object} ARIA attributes
 */
export const getNavAriaAttributes = ({
  label,
  current = null,
  language = 'en'
}) => {
  return {
    role: 'navigation',
    'aria-label': getAriaLabel(label, language),
    'aria-current': current || undefined
  };
};

/**
 * Generate ARIA attributes for lists
 * @param {Object} options - List options
 * @returns {Object} ARIA attributes
 */
export const getListAriaAttributes = ({
  label,
  itemCount = null,
  language = 'en'
}) => {
  const attrs = {
    'aria-label': label ? getAriaLabel(label, language) : undefined,
    'aria-setsize': itemCount || undefined
  };

  return Object.fromEntries(
    Object.entries(attrs).filter(([_, value]) => value !== undefined)
  );
};

/**
 * Generate ARIA attributes for tabs
 * @param {Object} options - Tab options
 * @returns {Object} ARIA attributes
 */
export const getTabAriaAttributes = ({
  selected = false,
  controls,
  id
}) => {
  return {
    role: 'tab',
    'aria-selected': String(selected),
    'aria-controls': controls,
    id: id,
    tabIndex: selected ? 0 : -1
  };
};

/**
 * Generate ARIA live region attributes
 * @param {string} politeness - 'polite' | 'assertive' | 'off'
 * @param {boolean} atomic - Whether to announce entire region
 * @returns {Object} ARIA attributes
 */
export const getLiveRegionAttributes = (politeness = 'polite', atomic = true) => {
  return {
    'aria-live': politeness,
    'aria-atomic': String(atomic)
  };
};

/**
 * Check if element needs ARIA label (icon buttons, etc.)
 * @param {Object} element - Element properties
 * @returns {boolean} Whether ARIA label is needed
 */
export const needsAriaLabel = (element) => {
  const { children, textContent, ariaLabel } = element;
  
  // Already has aria-label
  if (ariaLabel) return false;
  
  // Has text content
  if (textContent && textContent.trim().length > 0) return false;
  
  // Has text children
  if (typeof children === 'string' && children.trim().length > 0) return false;
  
  // Needs aria-label (icon button, etc.)
  return true;
};

export default {
  getAriaLabel,
  getAriaRole,
  getButtonAriaAttributes,
  getInputAriaAttributes,
  getModalAriaAttributes,
  getNavAriaAttributes,
  getListAriaAttributes,
  getTabAriaAttributes,
  getLiveRegionAttributes,
  needsAriaLabel
};
