/**
 * Color Contrast Audit Script
 * 
 * Generates a detailed report of all color combinations
 * and identifies those that fail WCAG AA standards.
 */

import {
  getContrastRatio,
  meetsWCAG_AA,
  CAREERAK_COLORS,
  generateContrastReport
} from '../utils/contrastChecker.js';

console.log('='.repeat(80));
console.log('CAREERAK COLOR CONTRAST AUDIT');
console.log('='.repeat(80));
console.log('\nWCAG 2.1 Level AA Requirements:');
console.log('- Normal text (< 18pt or < 14pt bold): 4.5:1 minimum');
console.log('- Large text (≥ 18pt or ≥ 14pt bold): 3:1 minimum');
console.log('- UI components: 3:1 minimum\n');

// Light Mode Audit
console.log('\n' + '='.repeat(80));
console.log('LIGHT MODE');
console.log('='.repeat(80));

const lightCombinations = [
  { name: 'Primary text on primary background', fg: CAREERAK_COLORS.light.text.primary, bg: CAREERAK_COLORS.light.bg.primary },
  { name: 'Secondary text on primary background', fg: CAREERAK_COLORS.light.text.secondary, bg: CAREERAK_COLORS.light.bg.primary },
  { name: 'Tertiary text on primary background', fg: CAREERAK_COLORS.light.text.tertiary, bg: CAREERAK_COLORS.light.bg.primary },
  { name: 'Muted text on primary background', fg: CAREERAK_COLORS.light.text.muted, bg: CAREERAK_COLORS.light.bg.primary },
  { name: 'Accent on primary background', fg: CAREERAK_COLORS.light.accent, bg: CAREERAK_COLORS.light.bg.primary },
  { name: 'White text on accent background', fg: '#FFFFFF', bg: CAREERAK_COLORS.light.accent },
  { name: 'Primary text on secondary background', fg: CAREERAK_COLORS.light.text.primary, bg: CAREERAK_COLORS.light.bg.secondary },
  { name: 'Primary text on tertiary background', fg: CAREERAK_COLORS.light.text.primary, bg: CAREERAK_COLORS.light.bg.tertiary },
  { name: 'Primary text on hover background', fg: CAREERAK_COLORS.light.text.primary, bg: CAREERAK_COLORS.light.bg.hover },
];

let lightFailures = [];

lightCombinations.forEach(combo => {
  const ratio = getContrastRatio(combo.fg, combo.bg);
  const result = meetsWCAG_AA(ratio, 'normal');
  
  console.log(`\n${combo.name}`);
  console.log(`  Foreground: ${combo.fg}`);
  console.log(`  Background: ${combo.bg}`);
  console.log(`  Contrast Ratio: ${ratio.toFixed(2)}:1`);
  console.log(`  Status: ${result.passes ? '✅ PASS' : '❌ FAIL'} (${result.message})`);
  
  if (!result.passes) {
    lightFailures.push({ ...combo, ratio: ratio.toFixed(2), required: 4.5 });
  }
});

// Dark Mode Audit
console.log('\n' + '='.repeat(80));
console.log('DARK MODE');
console.log('='.repeat(80));

const darkCombinations = [
  { name: 'Primary text on primary background', fg: CAREERAK_COLORS.dark.text.primary, bg: CAREERAK_COLORS.dark.bg.primary },
  { name: 'Secondary text on primary background', fg: CAREERAK_COLORS.dark.text.secondary, bg: CAREERAK_COLORS.dark.bg.primary },
  { name: 'Tertiary text on primary background', fg: CAREERAK_COLORS.dark.text.tertiary, bg: CAREERAK_COLORS.dark.bg.primary },
  { name: 'Muted text on primary background', fg: CAREERAK_COLORS.dark.text.muted, bg: CAREERAK_COLORS.dark.bg.primary },
  { name: 'Accent on primary background', fg: CAREERAK_COLORS.dark.accent, bg: CAREERAK_COLORS.dark.bg.primary },
  { name: 'Primary text on secondary background', fg: CAREERAK_COLORS.dark.text.primary, bg: CAREERAK_COLORS.dark.bg.secondary },
  { name: 'Primary text on tertiary background', fg: CAREERAK_COLORS.dark.text.primary, bg: CAREERAK_COLORS.dark.bg.tertiary },
  { name: 'Primary text on hover background', fg: CAREERAK_COLORS.dark.text.primary, bg: CAREERAK_COLORS.dark.bg.hover },
];

let darkFailures = [];

darkCombinations.forEach(combo => {
  const ratio = getContrastRatio(combo.fg, combo.bg);
  const result = meetsWCAG_AA(ratio, 'normal');
  
  console.log(`\n${combo.name}`);
  console.log(`  Foreground: ${combo.fg}`);
  console.log(`  Background: ${combo.bg}`);
  console.log(`  Contrast Ratio: ${ratio.toFixed(2)}:1`);
  console.log(`  Status: ${result.passes ? '✅ PASS' : '❌ FAIL'} (${result.message})`);
  
  if (!result.passes) {
    darkFailures.push({ ...combo, ratio: ratio.toFixed(2), required: 4.5 });
  }
});

// Summary
console.log('\n' + '='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));

const totalCombinations = lightCombinations.length + darkCombinations.length;
const totalFailures = lightFailures.length + darkFailures.length;
const totalPasses = totalCombinations - totalFailures;

console.log(`\nTotal Combinations Tested: ${totalCombinations}`);
console.log(`✅ Passed: ${totalPasses}`);
console.log(`❌ Failed: ${totalFailures}`);
console.log(`Pass Rate: ${((totalPasses / totalCombinations) * 100).toFixed(1)}%`);

if (totalFailures > 0) {
  console.log('\n' + '='.repeat(80));
  console.log('FAILURES REQUIRING ATTENTION');
  console.log('='.repeat(80));
  
  if (lightFailures.length > 0) {
    console.log('\nLight Mode Failures:');
    lightFailures.forEach(failure => {
      console.log(`\n  ❌ ${failure.name}`);
      console.log(`     ${failure.fg} on ${failure.bg}`);
      console.log(`     Ratio: ${failure.ratio}:1 (needs ${failure.required}:1)`);
      console.log(`     Gap: ${(failure.required - parseFloat(failure.ratio)).toFixed(2)}`);
    });
  }
  
  if (darkFailures.length > 0) {
    console.log('\nDark Mode Failures:');
    darkFailures.forEach(failure => {
      console.log(`\n  ❌ ${failure.name}`);
      console.log(`     ${failure.fg} on ${failure.bg}`);
      console.log(`     Ratio: ${failure.ratio}:1 (needs ${failure.required}:1)`);
      console.log(`     Gap: ${(failure.required - parseFloat(failure.ratio)).toFixed(2)}`);
    });
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('RECOMMENDED ACTIONS');
  console.log('='.repeat(80));
  console.log('\n1. Adjust colors to meet 4.5:1 minimum for normal text');
  console.log('2. Use darker/lighter shades for better contrast');
  console.log('3. Consider using large text (≥18pt) for 3:1 combinations');
  console.log('4. Update CSS variables in darkMode.css');
  console.log('5. Re-run audit after changes');
} else {
  console.log('\n✅ All color combinations meet WCAG 2.1 Level AA standards!');
}

console.log('\n' + '='.repeat(80));
console.log('END OF AUDIT');
console.log('='.repeat(80) + '\n');
