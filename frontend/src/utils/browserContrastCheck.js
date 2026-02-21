/**
 * Browser-based Dark Mode Contrast Checker
 * 
 * This can be run in the browser console to verify contrast
 * of actual rendered elements in dark mode.
 * 
 * Usage:
 * 1. Open browser DevTools (F12)
 * 2. Switch to dark mode
 * 3. Run: import('./utils/browserContrastCheck.js').then(m => m.checkPageContrast())
 */

/**
 * Get computed color from element
 */
function getComputedColor(element, property) {
  const computed = window.getComputedStyle(element);
  return computed.getPropertyValue(property);
}

/**
 * Convert RGB string to hex
 */
function rgbToHex(rgb) {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return null;
  
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Calculate luminance from RGB
 */
function getLuminance(r, g, b) {
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;
  
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio
 */
function getContrastRatio(color1, color2) {
  const rgb1 = color1.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  const rgb2 = color2.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  
  if (!rgb1 || !rgb2) return null;
  
  const lum1 = getLuminance(parseInt(rgb1[1]), parseInt(rgb1[2]), parseInt(rgb1[3]));
  const lum2 = getLuminance(parseInt(rgb2[1]), parseInt(rgb2[2]), parseInt(rgb2[3]));
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if element meets WCAG standards
 */
function checkElement(element) {
  const color = getComputedColor(element, 'color');
  const bgColor = getComputedColor(element, 'background-color');
  const fontSize = parseFloat(getComputedColor(element, 'font-size'));
  const fontWeight = getComputedColor(element, 'font-weight');
  
  // Determine if large text (≥18pt or ≥14pt bold)
  const isLargeText = fontSize >= 24 || (fontSize >= 18.66 && parseInt(fontWeight) >= 700);
  
  const ratio = getContrastRatio(color, bgColor);
  if (!ratio) return null;
  
  const requiredRatio = isLargeText ? 3.0 : 4.5;
  const passes = ratio >= requiredRatio;
  
  return {
    element: element.tagName + (element.className ? '.' + element.className.split(' ')[0] : ''),
    color: rgbToHex(color),
    bgColor: rgbToHex(bgColor),
    fontSize: fontSize.toFixed(1) + 'px',
    fontWeight,
    isLargeText,
    ratio: ratio.toFixed(2),
    required: requiredRatio.toFixed(1),
    passes,
    level: ratio >= 7.0 ? 'AAA' : (ratio >= 4.5 ? 'AA' : (isLargeText && ratio >= 3.0 ? 'AA (Large)' : 'Fail'))
  };
}

/**
 * Check all text elements on the page
 */
export function checkPageContrast() {
  console.log('🔍 Checking page contrast in dark mode...\n');
  
  // Check if dark mode is active
  const isDark = document.documentElement.classList.contains('dark') || 
                 document.body.classList.contains('dark');
  
  if (!isDark) {
    console.warn('⚠️  Dark mode is not active. Please enable dark mode first.');
    return;
  }
  
  // Get all text elements
  const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, label, input, textarea, select, li, td, th');
  
  const results = {
    passed: [],
    failed: [],
    total: 0
  };
  
  textElements.forEach(element => {
    const result = checkElement(element);
    if (result) {
      results.total++;
      if (result.passes) {
        results.passed.push(result);
      } else {
        results.failed.push(result);
      }
    }
  });
  
  // Print summary
  console.log('='.repeat(80));
  console.log('DARK MODE CONTRAST CHECK RESULTS');
  console.log('='.repeat(80));
  console.log(`Total elements checked: ${results.total}`);
  console.log(`✅ Passed: ${results.passed.length} (${(results.passed.length / results.total * 100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${results.failed.length} (${(results.failed.length / results.total * 100).toFixed(1)}%)`);
  console.log('='.repeat(80));
  
  if (results.failed.length > 0) {
    console.log('\n❌ FAILED ELEMENTS:');
    console.table(results.failed);
  }
  
  if (results.passed.length > 0) {
    console.log('\n✅ SAMPLE PASSED ELEMENTS (first 10):');
    console.table(results.passed.slice(0, 10));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('WCAG 2.1 Level AA Requirements:');
  console.log('- Normal text: 4.5:1 minimum');
  console.log('- Large text (≥18pt or ≥14pt bold): 3:1 minimum');
  console.log('='.repeat(80));
  
  return results;
}

/**
 * Check specific CSS variables
 */
export function checkCSSVariables() {
  console.log('🔍 Checking CSS variable contrast...\n');
  
  const root = document.documentElement;
  const style = getComputedStyle(root);
  
  // Get all CSS variables
  const variables = {
    'Primary text on primary bg': {
      text: style.getPropertyValue('--text-primary').trim(),
      bg: style.getPropertyValue('--bg-primary').trim()
    },
    'Secondary text on primary bg': {
      text: style.getPropertyValue('--text-secondary').trim(),
      bg: style.getPropertyValue('--bg-primary').trim()
    },
    'Tertiary text on primary bg': {
      text: style.getPropertyValue('--text-tertiary').trim(),
      bg: style.getPropertyValue('--bg-primary').trim()
    },
    'Muted text on primary bg': {
      text: style.getPropertyValue('--text-muted').trim(),
      bg: style.getPropertyValue('--bg-primary').trim()
    },
    'Accent on primary bg': {
      text: style.getPropertyValue('--accent-primary').trim(),
      bg: style.getPropertyValue('--bg-primary').trim()
    },
    'Input text on input bg': {
      text: style.getPropertyValue('--input-text').trim(),
      bg: style.getPropertyValue('--input-bg').trim()
    }
  };
  
  console.table(variables);
  
  return variables;
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  window.checkDarkModeContrast = checkPageContrast;
  window.checkCSSVariables = checkCSSVariables;
  console.log('✅ Dark mode contrast checker loaded!');
  console.log('Run: checkDarkModeContrast() to check page contrast');
  console.log('Run: checkCSSVariables() to check CSS variables');
}
