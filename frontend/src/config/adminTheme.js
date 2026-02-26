/**
 * Admin Dashboard Theme Configuration
 * 
 * This file defines the color palette, fonts, and theme variables
 * for the admin dashboard according to project standards.
 * 
 * Color Palette (from project-standards.md):
 * - Primary (كحلي): #304B60
 * - Secondary (بيج): #E3DAD1
 * - Accent (نحاسي): #D48161
 * 
 * Fonts:
 * - Arabic: Amiri, Cairo, serif
 * - English: Cormorant Garamond, serif
 * - French: EB Garamond, serif
 */

export const adminTheme = {
  // Color Palette
  colors: {
    primary: '#304B60',      // كحلي (Navy Blue)
    secondary: '#E3DAD1',    // بيج (Beige)
    accent: '#D48161',       // نحاسي (Copper)
    
    // Derived colors for light theme
    light: {
      background: '#FFFFFF',
      surface: '#F5F5F5',
      surfaceAlt: '#E3DAD1',  // Secondary color
      text: '#1A1A1A',
      textSecondary: '#666666',
      border: '#D4816180',     // Accent with 50% opacity
      hover: '#304B6010',      // Primary with 6% opacity
      active: '#304B6020',     // Primary with 12% opacity
      disabled: '#CCCCCC',
      error: '#D32F2F',
      success: '#388E3C',
      warning: '#F57C00',
      info: '#1976D2',
    },
    
    // Derived colors for dark theme
    dark: {
      background: '#1A1A1A',
      surface: '#2D2D2D',
      surfaceAlt: '#3A3A3A',
      text: '#E3DAD1',         // Secondary color for text
      textSecondary: '#B0B0B0',
      border: '#D4816180',     // Accent with 50% opacity
      hover: '#E3DAD110',      // Secondary with 6% opacity
      active: '#E3DAD120',     // Secondary with 12% opacity
      disabled: '#555555',
      error: '#EF5350',
      success: '#66BB6A',
      warning: '#FFA726',
      info: '#42A5F5',
    },
  },
  
  // Font Families
  fonts: {
    arabic: "'Amiri', 'Cairo', serif",
    english: "'Cormorant Garamond', serif",
    french: "'EB Garamond', serif",
    system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  },
  
  // Spacing scale (8px base)
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },
  
  // Border radius
  borderRadius: {
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
  
  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

/**
 * Get font family based on language
 * @param {string} language - Language code (ar, en, fr)
 * @returns {string} Font family CSS value
 */
export const getFontFamily = (language) => {
  switch (language) {
    case 'ar':
      return adminTheme.fonts.arabic;
    case 'en':
      return adminTheme.fonts.english;
    case 'fr':
      return adminTheme.fonts.french;
    default:
      return adminTheme.fonts.system;
  }
};

/**
 * Get theme colors based on dark mode
 * @param {boolean} isDark - Whether dark mode is enabled
 * @returns {object} Theme colors
 */
export const getThemeColors = (isDark) => {
  return {
    ...adminTheme.colors,
    ...(isDark ? adminTheme.colors.dark : adminTheme.colors.light),
  };
};

export default adminTheme;
