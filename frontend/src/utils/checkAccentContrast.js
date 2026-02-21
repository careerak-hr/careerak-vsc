/**
 * Quick check for Accent color contrast
 */

import { getContrastRatio, checkWCAGCompliance } from './contrastAudit.js';

// Check Accent (#D48161) on White (#FFFFFF)
const ratio = getContrastRatio('#D48161', '#FFFFFF');
const largeTextCompliance = checkWCAGCompliance(ratio, true);
const normalTextCompliance = checkWCAGCompliance(ratio, false);

console.log('Accent (#D48161) on White (#FFFFFF):');
console.log('Contrast Ratio:', ratio.toFixed(2) + ':1');
console.log('Large Text (3:1 required):', largeTextCompliance.passes ? '✅ Pass' : '❌ Fail');
console.log('Normal Text (4.5:1 required):', normalTextCompliance.passes ? '✅ Pass' : '❌ Fail');
