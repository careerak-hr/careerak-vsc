/**
 * Semantic Form Verification Utility
 * Verifies that forms use proper semantic HTML elements
 */

export const verifySemanticForms = () => {
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  // Check for fieldset elements
  const fieldsets = document.querySelectorAll('fieldset');
  if (fieldsets.length > 0) {
    results.passed.push(`Found ${fieldsets.length} fieldset elements`);
    
    // Check each fieldset has a legend
    fieldsets.forEach((fieldset, index) => {
      const legend = fieldset.querySelector('legend');
      if (legend) {
        results.passed.push(`Fieldset ${index + 1} has a legend: "${legend.textContent.trim()}"`);
      } else {
        results.failed.push(`Fieldset ${index + 1} is missing a legend`);
      }
    });
  } else {
    results.warnings.push('No fieldset elements found - consider grouping related form fields');
  }

  // Check for proper label associations
  const inputs = document.querySelectorAll('input, select, textarea');
  let labeledInputs = 0;
  
  inputs.forEach((input, index) => {
    const id = input.getAttribute('id');
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');
    
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) {
        labeledInputs++;
        results.passed.push(`Input ${index + 1} (${input.type}) properly associated with label`);
      } else if (ariaLabel || ariaLabelledBy) {
        labeledInputs++;
        results.passed.push(`Input ${index + 1} (${input.type}) has ARIA labeling`);
      } else {
        results.failed.push(`Input ${index + 1} (${input.type}) has ID but no associated label`);
      }
    } else if (ariaLabel || ariaLabelledBy) {
      labeledInputs++;
      results.passed.push(`Input ${index + 1} (${input.type}) has ARIA labeling`);
    } else {
      results.failed.push(`Input ${index + 1} (${input.type}) has no ID or ARIA labeling`);
    }
  });

  results.passed.push(`${labeledInputs}/${inputs.length} inputs are properly labeled`);

  // Check for proper error message associations
  const errorMessages = document.querySelectorAll('[role="alert"], .error, [id*="error"]');
  if (errorMessages.length > 0) {
    results.passed.push(`Found ${errorMessages.length} error message elements`);
    
    errorMessages.forEach((error, index) => {
      const id = error.getAttribute('id');
      if (id) {
        const associatedInput = document.querySelector(`[aria-describedby*="${id}"]`);
        if (associatedInput) {
          results.passed.push(`Error message ${index + 1} is properly associated with an input`);
        } else {
          results.warnings.push(`Error message ${index + 1} has ID but no associated input`);
        }
      }
    });
  }

  // Check for proper form structure
  const forms = document.querySelectorAll('form');
  if (forms.length > 0) {
    results.passed.push(`Found ${forms.length} form elements`);
    
    forms.forEach((form, index) => {
      const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
      if (submitButtons.length > 0) {
        results.passed.push(`Form ${index + 1} has ${submitButtons.length} submit button(s)`);
      } else {
        results.warnings.push(`Form ${index + 1} has no submit button`);
      }
    });
  } else {
    results.warnings.push('No form elements found');
  }

  // Check for ARIA attributes
  const elementsWithAria = document.querySelectorAll('[aria-describedby], [aria-invalid], [aria-required], [aria-checked]');
  if (elementsWithAria.length > 0) {
    results.passed.push(`Found ${elementsWithAria.length} elements with ARIA attributes`);
  }

  return results;
};

export const printSemanticFormReport = () => {
  const results = verifySemanticForms();
  
  console.group('🔍 Semantic Form Verification Report');
  
  if (results.passed.length > 0) {
    console.group('✅ Passed Checks');
    results.passed.forEach(item => console.log(`✓ ${item}`));
    console.groupEnd();
  }
  
  if (results.warnings.length > 0) {
    console.group('⚠️ Warnings');
    results.warnings.forEach(item => console.warn(`⚠ ${item}`));
    console.groupEnd();
  }
  
  if (results.failed.length > 0) {
    console.group('❌ Failed Checks');
    results.failed.forEach(item => console.error(`✗ ${item}`));
    console.groupEnd();
  }
  
  const totalChecks = results.passed.length + results.warnings.length + results.failed.length;
  const passRate = totalChecks > 0 ? Math.round((results.passed.length / totalChecks) * 100) : 0;
  
  console.log(`📊 Overall Score: ${passRate}% (${results.passed.length}/${totalChecks} checks passed)`);
  console.groupEnd();
  
  return results;
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  window.verifySemanticForms = verifySemanticForms;
  window.printSemanticFormReport = printSemanticFormReport;
}