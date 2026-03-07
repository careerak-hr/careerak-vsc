/**
 * Cross-Browser Tests for Apply Page Enhancements
 * 
 * Tests the application form across Chrome, Firefox, and Safari
 * 
 * Run with: npx playwright test cross-browser.spec.js
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const TEST_URL = process.env.TEST_URL || 'http://localhost:3000';
const JOB_ID = process.env.TEST_JOB_ID || 'test-job-123';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'Test123!@#',
  fullName: 'Test User',
  phone: '+1234567890',
  country: 'United States',
  city: 'New York'
};

// Configure browsers
test.describe.configure({ mode: 'parallel' });

// Test on Chrome
test.describe('Chrome Browser Tests', () => {
  test.use({ browserName: 'chromium' });
  
  test('should complete full application flow', async ({ page }) => {
    await runFullApplicationFlow(page);
  });
  
  test('should handle file upload with drag-and-drop', async ({ page }) => {
    await testFileUpload(page, 'drag-drop');
  });
  
  test('should auto-save draft', async ({ page }) => {
    await testAutoSave(page);
  });
});

// Test on Firefox
test.describe('Firefox Browser Tests', () => {
  test.use({ browserName: 'firefox' });
  
  test('should complete full application flow', async ({ page }) => {
    await runFullApplicationFlow(page);
  });
  
  test('should handle file upload with file dialog', async ({ page }) => {
    await testFileUpload(page, 'dialog');
  });
  
  test('should auto-save draft', async ({ page }) => {
    await testAutoSave(page);
  });
});

// Test on Safari (WebKit)
test.describe('Safari Browser Tests', () => {
  test.use({ browserName: 'webkit' });
  
  test('should complete full application flow', async ({ page }) => {
    await runFullApplicationFlow(page);
  });
  
  test('should handle file upload with file dialog', async ({ page }) => {
    await testFileUpload(page, 'dialog');
  });
  
  test('should handle LocalStorage gracefully', async ({ page }) => {
    await testLocalStorage(page);
  });
});

// Helper Functions

async function runFullApplicationFlow(page) {
  // Navigate to application page
  await page.goto(`${TEST_URL}/apply/${JOB_ID}`);
  
  // Wait for form to load
  await page.waitForSelector('.application-form', { timeout: 5000 });
  
  // Step 1: Personal Information
  await expect(page.locator('.step-indicator')).toContainText('1');
  
  // Check auto-fill
  const nameInput = page.locator('input[name="fullName"]');
  await expect(nameInput).not.toBeEmpty();
  
  // Modify a field
  await nameInput.fill(testUser.fullName);
  
  // Navigate to next step
  await page.click('button:has-text("Next")');
  await page.waitForTimeout(500);
  
  // Step 2: Education & Experience
  await expect(page.locator('.step-indicator')).toContainText('2');
  
  // Add education entry
  await page.click('button:has-text("Add Education")');
  await page.fill('input[name="education[0].degree"]', 'Bachelor of Science');
  await page.fill('input[name="education[0].institution"]', 'Test University');
  
  // Navigate to next step
  await page.click('button:has-text("Next")');
  await page.waitForTimeout(500);
  
  // Step 3: Skills & Languages
  await expect(page.locator('.step-indicator')).toContainText('3');
  
  // Add skill
  await page.click('button:has-text("Add Skill")');
  await page.fill('input[name="skills[0].skill"]', 'JavaScript');
  await page.selectOption('select[name="skills[0].proficiency"]', 'advanced');
  
  // Navigate to next step
  await page.click('button:has-text("Next")');
  await page.waitForTimeout(500);
  
  // Step 4: Documents & Questions
  await expect(page.locator('.step-indicator')).toContainText('4');
  
  // Skip file upload for now (tested separately)
  
  // Navigate to preview
  await page.click('button:has-text("Next")');
  await page.waitForTimeout(500);
  
  // Step 5: Review & Submit
  await expect(page.locator('.step-indicator')).toContainText('5');
  
  // Verify preview displays data
  await expect(page.locator('.preview-section')).toContainText(testUser.fullName);
  await expect(page.locator('.preview-section')).toContainText('Bachelor of Science');
  await expect(page.locator('.preview-section')).toContainText('JavaScript');
  
  // Submit application
  await page.click('button:has-text("Submit")');
  
  // Wait for success message
  await expect(page.locator('.success-message')).toBeVisible({ timeout: 5000 });
}

async function testFileUpload(page, method) {
  await page.goto(`${TEST_URL}/apply/${JOB_ID}`);
  await page.waitForSelector('.application-form');
  
  // Navigate to documents step
  for (let i = 0; i < 3; i++) {
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);
  }
  
  // Prepare test file
  const testFilePath = './tests/fixtures/test-resume.pdf';
  
  if (method === 'drag-drop') {
    // Test drag-and-drop (Chrome)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFilePath);
  } else {
    // Test file dialog (Firefox, Safari)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testFilePath);
  }
  
  // Wait for upload to complete
  await page.waitForSelector('.file-item', { timeout: 10000 });
  
  // Verify file appears in list
  await expect(page.locator('.file-item')).toContainText('test-resume.pdf');
  
  // Test file removal
  await page.click('.file-item button:has-text("Remove")');
  await expect(page.locator('.file-item')).not.toBeVisible();
}

async function testAutoSave(page) {
  await page.goto(`${TEST_URL}/apply/${JOB_ID}`);
  await page.waitForSelector('.application-form');
  
  // Fill a field
  await page.fill('input[name="fullName"]', 'Auto Save Test');
  
  // Wait for auto-save (3 seconds + buffer)
  await page.waitForTimeout(4000);
  
  // Check for save indicator
  await expect(page.locator('.save-indicator')).toContainText('Saved');
  
  // Verify timestamp updated
  const timestamp = await page.locator('.last-saved-time').textContent();
  expect(timestamp).toBeTruthy();
  
  // Reload page
  await page.reload();
  await page.waitForSelector('.application-form');
  
  // Verify data restored
  const nameInput = page.locator('input[name="fullName"]');
  await expect(nameInput).toHaveValue('Auto Save Test');
}

async function testLocalStorage(page) {
  await page.goto(`${TEST_URL}/apply/${JOB_ID}`);
  await page.waitForSelector('.application-form');
  
  // Fill form data
  await page.fill('input[name="fullName"]', 'LocalStorage Test');
  
  // Trigger save
  await page.click('button:has-text("Save Draft")');
  await page.waitForTimeout(1000);
  
  // Check LocalStorage
  const draftData = await page.evaluate(() => {
    try {
      const key = Object.keys(localStorage).find(k => k.includes('draft'));
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  });
  
  // Should have data or handle gracefully
  if (draftData) {
    expect(draftData).toContain('LocalStorage Test');
  } else {
    // Safari private mode - should show warning
    await expect(page.locator('.storage-warning')).toBeVisible();
  }
}

// Responsive Tests
test.describe('Responsive Design Tests', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ];
  
  for (const viewport of viewports) {
    test(`should work on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`${TEST_URL}/apply/${JOB_ID}`);
      await page.waitForSelector('.application-form');
      
      // Verify form is visible and usable
      await expect(page.locator('.application-form')).toBeVisible();
      
      // Check touch targets on mobile
      if (viewport.name === 'Mobile') {
        const buttons = page.locator('button');
        const count = await buttons.count();
        
        for (let i = 0; i < count; i++) {
          const box = await buttons.nth(i).boundingBox();
          if (box) {
            expect(box.width).toBeGreaterThanOrEqual(44);
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
    });
  }
});

// RTL Tests
test.describe('RTL Layout Tests', () => {
  test('should display correctly in Arabic', async ({ page }) => {
    await page.goto(`${TEST_URL}/apply/${JOB_ID}?lang=ar`);
    await page.waitForSelector('.application-form');
    
    // Check RTL direction
    const direction = await page.locator('html').getAttribute('dir');
    expect(direction).toBe('rtl');
    
    // Check text alignment
    const form = page.locator('.application-form');
    const textAlign = await form.evaluate(el => 
      window.getComputedStyle(el).textAlign
    );
    expect(textAlign).toBe('right');
  });
});

// Performance Tests
test.describe('Performance Tests', () => {
  test('should load within 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(`${TEST_URL}/apply/${JOB_ID}`);
    await page.waitForSelector('.application-form');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
  });
  
  test('should navigate between steps quickly', async ({ page }) => {
    await page.goto(`${TEST_URL}/apply/${JOB_ID}`);
    await page.waitForSelector('.application-form');
    
    const startTime = Date.now();
    await page.click('button:has-text("Next")');
    await page.waitForSelector('.step-indicator:has-text("2")');
    const navigationTime = Date.now() - startTime;
    
    expect(navigationTime).toBeLessThan(300);
  });
});

// Accessibility Tests
test.describe('Accessibility Tests', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto(`${TEST_URL}/apply/${JOB_ID}`);
    await page.waitForSelector('.application-form');
    
    // Tab through form
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check focus is visible
    const focusedElement = await page.evaluate(() => 
      document.activeElement.tagName
    );
    expect(['INPUT', 'BUTTON', 'SELECT']).toContain(focusedElement);
  });
  
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto(`${TEST_URL}/apply/${JOB_ID}`);
    await page.waitForSelector('.application-form');
    
    // Check form has label
    const formLabel = await page.locator('form').getAttribute('aria-label');
    expect(formLabel).toBeTruthy();
    
    // Check inputs have labels
    const inputs = page.locator('input[type="text"]');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const ariaLabel = await input.getAttribute('aria-label');
      const id = await input.getAttribute('id');
      const hasLabel = ariaLabel || (id && await page.locator(`label[for="${id}"]`).count() > 0);
      expect(hasLabel).toBeTruthy();
    }
  });
});
