/**
 * Color Contrast Audit Utility
 * WCAG 2.1 Level AA Compliance
 * 
 * Requirements:
 * - Normal text (< 18pt or < 14pt bold): 4.5:1 minimum
 * - Large text (≥ 18pt or ≥ 14pt bold): 3:1 minimum
 * - UI components and graphics: 3:1 minimum
 */

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color code (e.g., '#304B60')
 * @returns {object} RGB values {r, g, b}
 */
function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace('#', '');
  
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
 * Convert RGBA to RGB (alpha blending with background)
 * @param {string} rgba - RGBA color (e.g., 'rgba(224, 224, 224, 0.5)')
 * @param {string} bgHex - Background hex color (e.g., '#1a1a1a')
 * @returns {object} RGB values {r, g, b}
 */
function rgbaToRgb(rgba, bgHex) {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return null;
  
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  const a = match[4] ? parseFloat(match[4]) : 1;
  
  // Get background RGB
  const bg = bgHex ? hexToRgb(bgHex) : { r: 227, g: 218, b: 209 };
  
  // Alpha blending with background
  return {
    r: Math.round((1 - a) * bg.r + a * r),
    g: Math.round((1 - a) * bg.g + a * g),
    b: Math.round((1 - a) * bg.b + a * b)
  };
}

/**
 * Calculate relative luminance
 * @param {object} rgb - RGB values {r, g, b}
 * @returns {number} Relative luminance
 */
function getLuminance(rgb) {
  const { r, g, b } = rgb;
  
  // Convert to sRGB
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
 * @param {string} color1 - First color (hex or rgba)
 * @param {string} color2 - Second color (hex or rgba, used as background for rgba)
 * @returns {number} Contrast ratio
 */
export function getContrastRatio(color1, color2) {
  let rgb1, rgb2;
  
  // Parse color2 first (background)
  if (color2.startsWith('#')) {
    rgb2 = hexToRgb(color2);
  } else if (color2.startsWith('rgba')) {
    rgb2 = rgbaToRgb(color2, '#E3DAD1'); // Default background
  } else {
    return null;
  }
  
  // Parse color1 (foreground)
  if (color1.startsWith('#')) {
    rgb1 = hexToRgb(color1);
  } else if (color1.startsWith('rgba')) {
    // Use color2 as background for alpha blending
    rgb1 = rgbaToRgb(color1, color2);
  } else {
    return null;
  }
  
  if (!rgb1 || !rgb2) return null;
  
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 * @param {number} ratio - Contrast ratio
 * @param {boolean} isLargeText - Is the text large (≥18pt or ≥14pt bold)?
 * @returns {object} Compliance status
 */
export function checkWCAGCompliance(ratio, isLargeText = false) {
  const requiredRatio = isLargeText ? 3 : 4.5;
  const passes = ratio >= requiredRatio;
  
  return {
    passes,
    ratio: ratio.toFixed(2),
    required: requiredRatio,
    level: passes ? 'AA' : 'Fail',
    grade: ratio >= 7 ? 'AAA' : (passes ? 'AA' : 'Fail')
  };
}

/**
 * Audit all color combinations in the application
 * @returns {array} Array of audit results
 */
export function auditAllColors() {
  const results = [];
  
  // Light mode combinations
  const lightModeCombos = [
    // Primary text on backgrounds
    { name: 'Primary text on Secondary bg (Light)', text: '#304B60', bg: '#E3DAD1', isLarge: false },
    { name: 'Primary text on Secondary.light bg', text: '#304B60', bg: '#E8DFD6', isLarge: false },
    { name: 'Primary text on White bg', text: '#304B60', bg: '#FFFFFF', isLarge: false },
    
    // Accent text on backgrounds
    { name: 'Accent text on Secondary bg', text: '#D48161', bg: '#E3DAD1', isLarge: false },
    { name: 'Accent text on White bg', text: '#D48161', bg: '#FFFFFF', isLarge: false },
    
    // White text on colored backgrounds
    { name: 'White text on Primary bg', text: '#FFFFFF', bg: '#304B60', isLarge: false },
    { name: 'White text on Accent bg', text: '#FFFFFF', bg: '#D48161', isLarge: false },
    { name: 'White text on Danger bg', text: '#FFFFFF', bg: '#D32F2F', isLarge: false },
    { name: 'White text on Success bg', text: '#FFFFFF', bg: '#388E3C', isLarge: false },
    
    // Secondary text on Primary bg
    { name: 'Secondary text on Primary bg', text: '#E3DAD1', bg: '#304B60', isLarge: false },
    
    // Hint text
    { name: 'Hint text on Secondary bg', text: '#9CA3AF', bg: '#E3DAD1', isLarge: false },
    { name: 'Hint text on White bg', text: '#9CA3AF', bg: '#FFFFFF', isLarge: false },
    
    // Error text
    { name: 'Danger text on Secondary bg', text: '#D32F2F', bg: '#E3DAD1', isLarge: false },
    { name: 'Danger text on White bg', text: '#D32F2F', bg: '#FFFFFF', isLarge: false },
    
    // Success text
    { name: 'Success text on Secondary bg', text: '#388E3C', bg: '#E3DAD1', isLarge: false },
    { name: 'Success text on White bg', text: '#388E3C', bg: '#FFFFFF', isLarge: false },
    
    // Input borders (for reference)
    { name: 'Input border (Accent 50%) on Secondary bg', text: '#D4816180', bg: '#E3DAD1', isLarge: false },
  ];
  
  // Large text combinations (≥18pt or ≥14pt bold) - 3:1 ratio required
  const largeTextCombos = [
    // Light mode large text
    { name: 'Large Primary text on Secondary bg', text: '#304B60', bg: '#E3DAD1', isLarge: true },
    { name: 'Large Primary text on White bg', text: '#304B60', bg: '#FFFFFF', isLarge: true },
    { name: 'Large Accent text on Secondary bg', text: '#D48161', bg: '#E3DAD1', isLarge: true },
    { name: 'Large Accent text on White bg', text: '#D48161', bg: '#FFFFFF', isLarge: true },
    { name: 'Large White text on Primary bg', text: '#FFFFFF', bg: '#304B60', isLarge: true },
    { name: 'Large White text on Accent bg', text: '#FFFFFF', bg: '#D48161', isLarge: true },
    { name: 'Large Secondary text on Primary bg', text: '#E3DAD1', bg: '#304B60', isLarge: true },
    { name: 'Large Hint text on Secondary bg', text: '#9CA3AF', bg: '#E3DAD1', isLarge: true },
    { name: 'Large Hint text on White bg', text: '#9CA3AF', bg: '#FFFFFF', isLarge: true },
    
    // Dark mode large text
    { name: 'Large Dark text on Dark bg', text: '#e0e0e0', bg: '#1a1a1a', isLarge: true },
    { name: 'Large Dark text on Dark surface', text: '#e0e0e0', bg: '#2d2d2d', isLarge: true },
    { name: 'Large Dark text 80% on Dark bg', text: 'rgba(224, 224, 224, 0.8)', bg: '#1a1a1a', isLarge: true },
    { name: 'Large Dark text 60% on Dark bg', text: 'rgba(224, 224, 224, 0.6)', bg: '#1a1a1a', isLarge: true },
    { name: 'Large Dark text 50% on Dark bg', text: 'rgba(224, 224, 224, 0.5)', bg: '#1a1a1a', isLarge: true },
    { name: 'Large Accent text on Dark bg', text: '#D48161', bg: '#1a1a1a', isLarge: true },
    { name: 'Large Accent text on Dark surface', text: '#D48161', bg: '#2d2d2d', isLarge: true },
  ];
  
  // Dark mode combinations
  const darkModeCombos = [
    // Dark text on dark backgrounds
    { name: 'Dark text on Dark bg (Dark)', text: '#e0e0e0', bg: '#1a1a1a', isLarge: false },
    { name: 'Dark text on Dark surface', text: '#e0e0e0', bg: '#2d2d2d', isLarge: false },
    
    // Dark text variations
    { name: 'Dark text 80% on Dark bg', text: 'rgba(224, 224, 224, 0.8)', bg: '#1a1a1a', isLarge: false },
    { name: 'Dark text 60% on Dark bg', text: 'rgba(224, 224, 224, 0.6)', bg: '#1a1a1a', isLarge: false },
    { name: 'Dark text 50% on Dark bg', text: 'rgba(224, 224, 224, 0.5)', bg: '#1a1a1a', isLarge: false },
    { name: 'Dark text 40% on Dark bg', text: 'rgba(224, 224, 224, 0.4)', bg: '#1a1a1a', isLarge: false },
    { name: 'Dark text 30% on Dark bg', text: 'rgba(224, 224, 224, 0.3)', bg: '#1a1a1a', isLarge: false },
    
    // Dark text on surface
    { name: 'Dark text 80% on Dark surface', text: 'rgba(224, 224, 224, 0.8)', bg: '#2d2d2d', isLarge: false },
    { name: 'Dark text 60% on Dark surface', text: 'rgba(224, 224, 224, 0.6)', bg: '#2d2d2d', isLarge: false },
    { name: 'Dark text 40% on Dark surface', text: 'rgba(224, 224, 224, 0.4)', bg: '#2d2d2d', isLarge: false },
    
    // Accent on dark backgrounds
    { name: 'Accent text on Dark bg', text: '#D48161', bg: '#1a1a1a', isLarge: false },
    { name: 'Accent text on Dark surface', text: '#D48161', bg: '#2d2d2d', isLarge: false },
    
    // Error text in dark mode
    { name: 'Red-400 on Dark bg', text: '#f87171', bg: '#1a1a1a', isLarge: false },
    { name: 'Red-400 on Dark surface', text: '#f87171', bg: '#2d2d2d', isLarge: false },
    
    // Success text in dark mode
    { name: 'Green-400 on Dark bg', text: '#4ade80', bg: '#1a1a1a', isLarge: false },
    { name: 'Green-400 on Dark surface', text: '#4ade80', bg: '#2d2d2d', isLarge: false },
  ];
  
  // Audit all combinations
  [...lightModeCombos, ...largeTextCombos, ...darkModeCombos].forEach(combo => {
    const ratio = getContrastRatio(combo.text, combo.bg);
    if (ratio) {
      const compliance = checkWCAGCompliance(ratio, combo.isLarge);
      results.push({
        ...combo,
        ...compliance
      });
    }
  });
  
  return results;
}

/**
 * Audit only large text combinations (≥18pt or ≥14pt bold)
 * @returns {array} Array of large text audit results
 */
export function auditLargeText() {
  const results = auditAllColors();
  return results.filter(r => r.isLarge);
}

/**
 * Generate audit report
 * @returns {object} Audit report with summary
 */
export function generateAuditReport() {
  const results = auditAllColors();
  const largeTextResults = results.filter(r => r.isLarge);
  const normalTextResults = results.filter(r => !r.isLarge);
  
  const passing = results.filter(r => r.passes);
  const failing = results.filter(r => !r.passes);
  
  const largeTextPassing = largeTextResults.filter(r => r.passes);
  const largeTextFailing = largeTextResults.filter(r => !r.passes);
  
  const normalTextPassing = normalTextResults.filter(r => r.passes);
  const normalTextFailing = normalTextResults.filter(r => !r.passes);
  
  return {
    total: results.length,
    passing: passing.length,
    failing: failing.length,
    passRate: ((passing.length / results.length) * 100).toFixed(1),
    largeText: {
      total: largeTextResults.length,
      passing: largeTextPassing.length,
      failing: largeTextFailing.length,
      passRate: largeTextResults.length > 0 
        ? ((largeTextPassing.length / largeTextResults.length) * 100).toFixed(1)
        : '0.0',
      results: largeTextResults,
      failingCombinations: largeTextFailing
    },
    normalText: {
      total: normalTextResults.length,
      passing: normalTextPassing.length,
      failing: normalTextFailing.length,
      passRate: normalTextResults.length > 0
        ? ((normalTextPassing.length / normalTextResults.length) * 100).toFixed(1)
        : '0.0',
      results: normalTextResults,
      failingCombinations: normalTextFailing
    },
    results,
    failingCombinations: failing
  };
}

/**
 * Log audit report to console
 */
export function logAuditReport() {
  const report = generateAuditReport();
  
  console.group('🎨 Color Contrast Audit Report');
  console.log(`Total combinations: ${report.total}`);
  console.log(`✅ Passing: ${report.passing} (${report.passRate}%)`);
  console.log(`❌ Failing: ${report.failing}`);
  
  console.group('📏 Large Text (≥18pt or ≥14pt bold) - 3:1 ratio required:');
  console.log(`Total: ${report.largeText.total}`);
  console.log(`✅ Passing: ${report.largeText.passing} (${report.largeText.passRate}%)`);
  console.log(`❌ Failing: ${report.largeText.failing}`);
  if (report.largeText.failing > 0) {
    console.group('❌ Failing Large Text Combinations:');
    report.largeText.failingCombinations.forEach(combo => {
      console.log(`${combo.name}: ${combo.ratio}:1 (Required: ${combo.required}:1)`);
      console.log(`  Text: ${combo.text} | Background: ${combo.bg}`);
    });
    console.groupEnd();
  }
  console.groupEnd();
  
  console.group('📝 Normal Text (<18pt or <14pt bold) - 4.5:1 ratio required:');
  console.log(`Total: ${report.normalText.total}`);
  console.log(`✅ Passing: ${report.normalText.passing} (${report.normalText.passRate}%)`);
  console.log(`❌ Failing: ${report.normalText.failing}`);
  if (report.normalText.failing > 0) {
    console.group('❌ Failing Normal Text Combinations:');
    report.normalText.failingCombinations.forEach(combo => {
      console.log(`${combo.name}: ${combo.ratio}:1 (Required: ${combo.required}:1)`);
      console.log(`  Text: ${combo.text} | Background: ${combo.bg}`);
    });
    console.groupEnd();
  }
  console.groupEnd();
  
  console.group('📊 All Results:');
  console.table(report.results.map(r => ({
    Name: r.name,
    Type: r.isLarge ? 'Large' : 'Normal',
    Ratio: r.ratio + ':1',
    Required: r.required + ':1',
    Status: r.passes ? '✅ Pass' : '❌ Fail',
    Grade: r.grade
  })));
  console.groupEnd();
  
  console.groupEnd();
  
  return report;
}

export default {
  getContrastRatio,
  checkWCAGCompliance,
  auditAllColors,
  auditLargeText,
  generateAuditReport,
  logAuditReport
};
