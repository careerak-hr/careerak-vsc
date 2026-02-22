/**
 * Color Contrast Checker Utility
 * 
 * Validates WCAG 2.1 Level AA compliance for color contrast ratios.
 * 
 * Requirements:
 * - Normal text (< 18pt or < 14pt bold): 4.5:1 minimum
 * - Large text (≥ 18pt or ≥ 14pt bold): 3:1 minimum
 * - UI components and graphics: 3:1 minimum
 * 
 * References:
 * - FR-A11Y-8: Color contrast ratio requirements
 * - NFR-A11Y-3: WCAG 2.1 Level AA compliance
 */

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color code (e.g., "#304B60" or "#304B6080")
 * @returns {object} RGB values {r, g, b, a}
 */
export function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Handle 8-digit hex (with alpha)
  if (hex.length === 8) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const a = parseInt(hex.substring(6, 8), 16) / 255;
    return { r, g, b, a };
  }
  
  // Handle 6-digit hex
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b, a: 1 };
  }
  
  // Handle 3-digit hex
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return { r, g, b, a: 1 };
  }
  
  throw new Error(`Invalid hex color: ${hex}`);
}

/**
 * Calculate relative luminance of a color
 * @param {object} rgb - RGB values {r, g, b}
 * @returns {number} Relative luminance (0-1)
 */
export function getLuminance(rgb) {
  // Convert RGB to sRGB
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;
  
  // Apply gamma correction
  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  // Calculate luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * @param {string} color1 - First color (hex)
 * @param {string} color2 - Second color (hex)
 * @returns {number} Contrast ratio (1-21)
 */
export function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  // Handle alpha transparency by blending with background
  const blendedRgb1 = rgb1.a < 1 ? blendWithWhite(rgb1) : rgb1;
  const blendedRgb2 = rgb2.a < 1 ? blendWithWhite(rgb2) : rgb2;
  
  const lum1 = getLuminance(blendedRgb1);
  const lum2 = getLuminance(blendedRgb2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Blend color with white background (for alpha transparency)
 * @param {object} rgba - RGBA values {r, g, b, a}
 * @returns {object} Blended RGB values
 */
function blendWithWhite(rgba) {
  const { r, g, b, a } = rgba;
  return {
    r: Math.round(r * a + 255 * (1 - a)),
    g: Math.round(g * a + 255 * (1 - a)),
    b: Math.round(b * a + 255 * (1 - a)),
    a: 1
  };
}

/**
 * Check if contrast ratio meets WCAG AA standards
 * @param {number} ratio - Contrast ratio
 * @param {string} level - Text level: 'normal' or 'large'
 * @returns {object} Compliance status
 */
export function meetsWCAG_AA(ratio, level = 'normal') {
  const required = level === 'large' ? 3 : 4.5;
  const passes = ratio >= required;
  
  return {
    passes,
    ratio: ratio.toFixed(2),
    required: required.toFixed(1),
    level: passes ? 'AA' : 'Fail',
    message: passes 
      ? `✅ Passes WCAG AA (${ratio.toFixed(2)}:1 ≥ ${required}:1)`
      : `❌ Fails WCAG AA (${ratio.toFixed(2)}:1 < ${required}:1)`
  };
}

/**
 * Check if contrast ratio meets WCAG AAA standards
 * @param {number} ratio - Contrast ratio
 * @param {string} level - Text level: 'normal' or 'large'
 * @returns {object} Compliance status
 */
export function meetsWCAG_AAA(ratio, level = 'normal') {
  const required = level === 'large' ? 4.5 : 7;
  const passes = ratio >= required;
  
  return {
    passes,
    ratio: ratio.toFixed(2),
    required: required.toFixed(1),
    level: passes ? 'AAA' : 'Fail',
    message: passes 
      ? `✅ Passes WCAG AAA (${ratio.toFixed(2)}:1 ≥ ${required}:1)`
      : `❌ Fails WCAG AAA (${ratio.toFixed(2)}:1 < ${required}:1)`
  };
}

/**
 * Audit a color combination
 * @param {string} foreground - Foreground color (hex)
 * @param {string} background - Background color (hex)
 * @param {string} level - Text level: 'normal' or 'large'
 * @returns {object} Audit results
 */
export function auditColorCombination(foreground, background, level = 'normal') {
  const ratio = getContrastRatio(foreground, background);
  const aa = meetsWCAG_AA(ratio, level);
  const aaa = meetsWCAG_AAA(ratio, level);
  
  return {
    foreground,
    background,
    level,
    ratio: ratio.toFixed(2),
    aa,
    aaa,
    passes: aa.passes
  };
}

/**
 * Careerak color palette (from project-standards.md)
 */
export const CAREERAK_COLORS = {
  // Light Mode
  light: {
    primary: '#304B60',      // كحلي
    secondary: '#E3DAD1',    // بيج
    accent: '#A04D2F',       // نحاسي أغمق (adjusted for 4.5:1)
    text: {
      primary: '#304B60',
      secondary: '#3D5A73',  // Adjusted for 4.5:1 contrast
      tertiary: '#304B60',   // Use primary for better contrast
      muted: '#3D5A73'       // Adjusted for 4.5:1 contrast
    },
    bg: {
      primary: '#E3DAD1',
      secondary: '#E8DFD6',
      tertiary: '#F0EBE5',
      hover: '#DDD4CB'
    }
  },
  // Dark Mode
  dark: {
    primary: '#1A2332',      // كحلي غامق
    secondary: '#243447',    // كحلي غامق
    accent: '#E09A7A',       // نحاسي أفتح
    text: {
      primary: '#E3DAD1',
      secondary: '#D4CCC3',
      tertiary: '#C5BDB4',
      muted: '#A39A91'
    },
    bg: {
      primary: '#1A2332',
      secondary: '#243447',
      tertiary: '#2E3F54',
      hover: '#384A61'
    }
  }
};

/**
 * Audit all Careerak color combinations
 * @returns {object} Audit results for light and dark modes
 */
export function auditCareerakColors() {
  const results = {
    light: [],
    dark: []
  };
  
  // Light mode combinations
  results.light.push(
    auditColorCombination(CAREERAK_COLORS.light.text.primary, CAREERAK_COLORS.light.bg.primary, 'normal'),
    auditColorCombination(CAREERAK_COLORS.light.text.secondary, CAREERAK_COLORS.light.bg.primary, 'normal'),
    auditColorCombination(CAREERAK_COLORS.light.text.tertiary, CAREERAK_COLORS.light.bg.primary, 'normal'),
    auditColorCombination(CAREERAK_COLORS.light.text.muted, CAREERAK_COLORS.light.bg.primary, 'normal'),
    auditColorCombination(CAREERAK_COLORS.light.accent, CAREERAK_COLORS.light.bg.primary, 'normal'),
    auditColorCombination('#FFFFFF', CAREERAK_COLORS.light.accent, 'normal'), // White text on accent
    auditColorCombination(CAREERAK_COLORS.light.text.primary, CAREERAK_COLORS.light.bg.secondary, 'normal')
  );
  
  // Dark mode combinations
  results.dark.push(
    auditColorCombination(CAREERAK_COLORS.dark.text.primary, CAREERAK_COLORS.dark.bg.primary, 'normal'),
    auditColorCombination(CAREERAK_COLORS.dark.text.secondary, CAREERAK_COLORS.dark.bg.primary, 'normal'),
    auditColorCombination(CAREERAK_COLORS.dark.text.tertiary, CAREERAK_COLORS.dark.bg.primary, 'normal'),
    auditColorCombination(CAREERAK_COLORS.dark.text.muted, CAREERAK_COLORS.dark.bg.primary, 'normal'),
    auditColorCombination(CAREERAK_COLORS.dark.accent, CAREERAK_COLORS.dark.bg.primary, 'normal'),
    auditColorCombination(CAREERAK_COLORS.dark.text.primary, CAREERAK_COLORS.dark.bg.secondary, 'normal'),
    auditColorCombination(CAREERAK_COLORS.dark.text.primary, CAREERAK_COLORS.dark.bg.tertiary, 'normal')
  );
  
  return results;
}

/**
 * Generate contrast report
 * @returns {string} Formatted report
 */
export function generateContrastReport() {
  const results = auditCareerakColors();
  
  let report = '# Careerak Color Contrast Audit Report\n\n';
  report += '## WCAG 2.1 Level AA Requirements\n';
  report += '- Normal text: 4.5:1 minimum\n';
  report += '- Large text: 3:1 minimum\n\n';
  
  report += '## Light Mode\n\n';
  results.light.forEach(result => {
    report += `### ${result.foreground} on ${result.background}\n`;
    report += `- Contrast Ratio: ${result.ratio}:1\n`;
    report += `- WCAG AA: ${result.aa.message}\n`;
    report += `- WCAG AAA: ${result.aaa.message}\n\n`;
  });
  
  report += '## Dark Mode\n\n';
  results.dark.forEach(result => {
    report += `### ${result.foreground} on ${result.background}\n`;
    report += `- Contrast Ratio: ${result.ratio}:1\n`;
    report += `- WCAG AA: ${result.aa.message}\n`;
    report += `- WCAG AAA: ${result.aaa.message}\n\n`;
  });
  
  return report;
}
