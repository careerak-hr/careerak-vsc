/**
 * useAdminTheme Hook
 * 
 * Custom hook for accessing admin dashboard theme configuration
 * and utilities in React components.
 * 
 * Features:
 * - Access to theme colors, fonts, spacing, etc.
 * - Get theme colors based on current dark mode state
 * - Get font family based on current language
 * - Utility functions for theme-related operations
 */

import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import adminTheme, { getFontFamily, getThemeColors } from '../config/adminTheme';

/**
 * Custom hook to access admin theme configuration
 * @returns {object} Theme configuration and utilities
 */
export const useAdminTheme = () => {
  const { isDark } = useTheme();
  const { language } = useApp();
  
  // Get current theme colors based on dark mode
  const colors = useMemo(() => getThemeColors(isDark), [isDark]);
  
  // Get current font family based on language
  const fontFamily = useMemo(() => getFontFamily(language), [language]);
  
  // Get CSS variable value
  const getCSSVariable = (variableName) => {
    if (typeof window === 'undefined') return null;
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim();
  };
  
  // Set CSS variable value
  const setCSSVariable = (variableName, value) => {
    if (typeof window === 'undefined') return;
    document.documentElement.style.setProperty(variableName, value);
  };
  
  // Apply theme class to element
  const applyThemeClass = (element, className) => {
    if (!element) return;
    
    // Remove existing theme classes
    element.classList.remove('light', 'dark');
    
    // Add new theme class
    if (className) {
      element.classList.add(className);
    }
  };
  
  // Get inline styles for component
  const getInlineStyles = (customStyles = {}) => {
    return {
      fontFamily,
      color: colors.text,
      ...customStyles,
    };
  };
  
  // Get button styles
  const getButtonStyles = (variant = 'primary') => {
    const baseStyles = {
      padding: `${adminTheme.spacing.sm} ${adminTheme.spacing.lg}`,
      borderRadius: adminTheme.borderRadius.md,
      fontWeight: 500,
      transition: adminTheme.transitions.fast,
      cursor: 'pointer',
      border: 'none',
      outline: 'none',
      fontFamily,
    };
    
    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: colors.primary,
          color: '#FFFFFF',
        };
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: colors.secondary,
          color: colors.primary,
        };
      case 'accent':
        return {
          ...baseStyles,
          backgroundColor: colors.accent,
          color: '#FFFFFF',
        };
      default:
        return baseStyles;
    }
  };
  
  // Get card styles
  const getCardStyles = (customStyles = {}) => {
    return {
      backgroundColor: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: adminTheme.borderRadius.lg,
      padding: adminTheme.spacing.lg,
      boxShadow: adminTheme.shadows.sm,
      transition: adminTheme.transitions.normal,
      fontFamily,
      color: colors.text,
      ...customStyles,
    };
  };
  
  // Get input styles
  const getInputStyles = (customStyles = {}) => {
    return {
      padding: `${adminTheme.spacing.sm} ${adminTheme.spacing.md}`,
      border: `2px solid ${colors.border}`,
      borderRadius: adminTheme.borderRadius.md,
      backgroundColor: colors.background,
      color: colors.text,
      fontSize: '1rem',
      transition: adminTheme.transitions.fast,
      width: '100%',
      fontFamily,
      ...customStyles,
    };
  };
  
  // Get badge styles
  const getBadgeStyles = (variant = 'primary') => {
    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      padding: `${adminTheme.spacing.xs} ${adminTheme.spacing.sm}`,
      borderRadius: adminTheme.borderRadius.full,
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 1,
      fontFamily,
    };
    
    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: colors.primary,
          color: '#FFFFFF',
        };
      case 'success':
        return {
          ...baseStyles,
          backgroundColor: colors.success,
          color: '#FFFFFF',
        };
      case 'error':
        return {
          ...baseStyles,
          backgroundColor: colors.error,
          color: '#FFFFFF',
        };
      case 'warning':
        return {
          ...baseStyles,
          backgroundColor: colors.warning,
          color: '#FFFFFF',
        };
      case 'info':
        return {
          ...baseStyles,
          backgroundColor: colors.info,
          color: '#FFFFFF',
        };
      default:
        return baseStyles;
    }
  };
  
  return {
    // Theme configuration
    theme: adminTheme,
    colors,
    fontFamily,
    isDark,
    language,
    
    // Utility functions
    getCSSVariable,
    setCSSVariable,
    applyThemeClass,
    
    // Style generators
    getInlineStyles,
    getButtonStyles,
    getCardStyles,
    getInputStyles,
    getBadgeStyles,
  };
};

export default useAdminTheme;
