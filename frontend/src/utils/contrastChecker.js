/**
 * Contrast Checker Utility
 * 
 * Verifies WCAG 2.1 Level AA color contrast requirements:
 * - Normal text (< 18pt): 4.5:1 minimum
 * - Large text (≥ 18pt or ≥ 14pt bold): 3:1 minimum
 * 
 * Based on WCAG 2.1 guidelines:
 * https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 */

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color (e.g., "#1A2332" or "#D4816180")
 * @returns {object} RGB values {r, g, b}
 */
function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Handle 8-digit hex (with alpha)
  if (hex.length === 8) {
    hex = hex.substring(0, 6);
  }
  
  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return { r, g, b };
}

/**
 * Calculate relative luminance
 * @param {object} rgb - RGB values {r, g, b}
 * @returns {number} Relative luminance
 */
function getLuminance(rgb) {
  const { r, g, b } = rgb;
  
  // Convert to 0-1 range
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;
  
  // Apply gamma correction
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  // Calculate luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two colors
 * @param {string} color1 - First color (hex)
 * @param {string} color2 - Second color (hex)
 * @returns {number} Contrast ratio
 */
export function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 * @param {number} ratio - Contrast ratio
 * @param {boolean} isLargeText - Whether text is large (≥18pt or ≥14pt bold)
 * @returns {object} Result {passes, level, ratio}
 */
export function meetsWCAG(ratio, isLargeText = false) {
  const requiredRatio = isLargeText ? 3.0 : 4.5;
  const passes = ratio >= requiredRatio;
  
  // Determine WCAG level
  let level = 'Fail';
  if (ratio >= 7.0) {
    level = 'AAA';
  } else if (ratio >= 4.5) {
    level = 'AA';
  } else if (isLargeText && ratio >= 3.0) {
    level = 'AA (Large Text)';
  }
  
  return {
    passes,
    level,
    ratio: ratio.toFixed(2),
    required: requiredRatio.toFixed(1)
  };
}

/**
 * Dark mode color palette from darkMode.css
 */
export const darkModeColors = {
  backgrounds: {
    primary: '#1A2332',
    secondary: '#243447',
    tertiary: '#2E3F54',
    hover: '#384A61'
  },
  text: {
    primary: '#E3DAD1',
    secondary: '#D4CCC3',
    tertiary: '#C5BDB4',
    muted: '#A39A91',
    inverse: '#1A2332'
  },
  accent: {
    primary: '#E09A7A',
    secondary: '#EAA88A',
    hover: '#D48161'
  },
  borders: {
    primary: '#D4816180',
    secondary: '#E3DAD140',
    light: '#304B6080'
  },
  input: {
    border: '#D4816180',
    bg: '#243447',
    text: '#E3DAD1'
  },
  modal: {
    bg: '#243447',
    border: '#D48161',
    overlay: 'rgba(0, 0, 0, 0.7)'
  },
  status: {
    success: '#66BB6A',
    successLight: '#81C784',
    warning: '#FFA726',
    warningLight: '#FFB74D',
    error: '#EF5350',
    errorLight: '#E57373',
    info: '#42A5F5',
    infoLight: '#64B5F6'
  }
};

/**
 * Verify all dark mode color combinations
 * @returns {object} Verification results
 */
export function verifyDarkModeContrast() {
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };
  
  // Test combinations
  const combinations = [
    // Primary text on backgrounds
    { name: 'Primary text on primary background', text: darkModeColors.text.primary, bg: darkModeColors.backgrounds.primary, isLarge: false },
    { name: 'Primary text on secondary background', text: darkModeColors.text.primary, bg: darkModeColors.backgrounds.secondary, isLarge: false },
    { name: 'Primary text on tertiary background', text: darkModeColors.text.primary, bg: darkModeColors.backgrounds.tertiary, isLarge: false },
    { name: 'Primary text on hover background', text: darkModeColors.text.primary, bg: darkModeColors.backgrounds.hover, isLarge: false },
    
    // Secondary text on backgrounds
    { name: 'Secondary text on primary background', text: darkModeColors.text.secondary, bg: darkModeColors.backgrounds.primary, isLarge: false },
    { name: 'Secondary text on secondary background', text: darkModeColors.text.secondary, bg: darkModeColors.backgrounds.secondary, isLarge: false },
    
    // Tertiary text on backgrounds
    { name: 'Tertiary text on primary background', text: darkModeColors.text.tertiary, bg: darkModeColors.backgrounds.primary, isLarge: false },
    { name: 'Tertiary text on secondary background', text: darkModeColors.text.tertiary, bg: darkModeColors.backgrounds.secondary, isLarge: false },
    
    // Muted text on backgrounds
    { name: 'Muted text on primary background', text: darkModeColors.text.muted, bg: darkModeColors.backgrounds.primary, isLarge: false },
    { name: 'Muted text on secondary background', text: darkModeColors.text.muted, bg: darkModeColors.backgrounds.secondary, isLarge: false },
    
    // Accent colors on backgrounds
    { name: 'Accent primary on primary background', text: darkModeColors.accent.primary, bg: darkModeColors.backgrounds.primary, isLarge: false },
    { name: 'Accent primary on secondary background', text: darkModeColors.accent.primary, bg: darkModeColors.backgrounds.secondary, isLarge: false },
    { name: 'Accent secondary on primary background', text: darkModeColors.accent.secondary, bg: darkModeColors.backgrounds.primary, isLarge: false },
    
    // Input text on input background
    { name: 'Input text on input background', text: darkModeColors.input.text, bg: darkModeColors.input.bg, isLarge: false },
    
    // Status colors on backgrounds
    { name: 'Success on primary background', text: darkModeColors.status.success, bg: darkModeColors.backgrounds.primary, isLarge: false },
    { name: 'Warning on primary background', text: darkModeColors.status.warning, bg: darkModeColors.backgrounds.primary, isLarge: false },
    { name: 'Error on primary background', text: darkModeColors.status.error, bg: darkModeColors.backgrounds.primary, isLarge: false },
    { name: 'Info on primary background', text: darkModeColors.status.info, bg: darkModeColors.backgrounds.primary, isLarge: false },
    
    // Inverse text (for buttons/badges)
    { name: 'Inverse text on accent primary', text: darkModeColors.text.inverse, bg: darkModeColors.accent.primary, isLarge: false },
    
    // Large text combinations (headings)
    { name: 'Primary text on primary background (Large)', text: darkModeColors.text.primary, bg: darkModeColors.backgrounds.primary, isLarge: true },
    { name: 'Accent primary on primary background (Large)', text: darkModeColors.accent.primary, bg: darkModeColors.backgrounds.primary, isLarge: true }
  ];
  
  combinations.forEach(combo => {
    const ratio = getContrastRatio(combo.text, combo.bg);
    const result = meetsWCAG(ratio, combo.isLarge);
    
    const item = {
      name: combo.name,
      textColor: combo.text,
      bgColor: combo.bg,
      isLargeText: combo.isLarge,
      ...result
    };
    
    if (result.passes) {
      results.passed.push(item);
    } else {
      results.failed.push(item);
    }
    
    // Add warning if close to threshold
    if (result.passes && parseFloat(result.ratio) < parseFloat(result.required) + 0.5) {
      results.warnings.push({
        ...item,
        message: 'Passes but close to threshold'
      });
    }
  });
  
  return results;
}

/**
 * Generate a contrast report
 * @returns {string} Formatted report
 */
export function generateContrastReport() {
  const results = verifyDarkModeContrast();
  
  let report = '='.repeat(80) + '\n';
  report += 'DARK MODE CONTRAST VERIFICATION REPORT\n';
  report += '='.repeat(80) + '\n\n';
  
  report += `Total Combinations Tested: ${results.passed.length + results.failed.length}\n`;
  report += `✅ Passed: ${results.passed.length}\n`;
  report += `❌ Failed: ${results.failed.length}\n`;
  report += `⚠️  Warnings: ${results.warnings.length}\n\n`;
  
  if (results.failed.length > 0) {
    report += '❌ FAILED COMBINATIONS:\n';
    report += '-'.repeat(80) + '\n';
    results.failed.forEach(item => {
      report += `\n${item.name}\n`;
      report += `  Text: ${item.textColor}\n`;
      report += `  Background: ${item.bgColor}\n`;
      report += `  Ratio: ${item.ratio}:1 (Required: ${item.required}:1)\n`;
      report += `  Level: ${item.level}\n`;
    });
    report += '\n';
  }
  
  if (results.warnings.length > 0) {
    report += '⚠️  WARNINGS (Close to threshold):\n';
    report += '-'.repeat(80) + '\n';
    results.warnings.forEach(item => {
      report += `\n${item.name}\n`;
      report += `  Text: ${item.textColor}\n`;
      report += `  Background: ${item.bgColor}\n`;
      report += `  Ratio: ${item.ratio}:1 (Required: ${item.required}:1)\n`;
      report += `  Message: ${item.message}\n`;
    });
    report += '\n';
  }
  
  report += '✅ PASSED COMBINATIONS:\n';
  report += '-'.repeat(80) + '\n';
  results.passed.forEach(item => {
    report += `\n${item.name}\n`;
    report += `  Text: ${item.textColor}\n`;
    report += `  Background: ${item.bgColor}\n`;
    report += `  Ratio: ${item.ratio}:1 (Required: ${item.required}:1)\n`;
    report += `  Level: ${item.level}\n`;
  });
  
  report += '\n' + '='.repeat(80) + '\n';
  report += 'WCAG 2.1 Level AA Requirements:\n';
  report += '- Normal text: 4.5:1 minimum\n';
  report += '- Large text (≥18pt or ≥14pt bold): 3:1 minimum\n';
  report += '='.repeat(80) + '\n';
  
  return report;
}
