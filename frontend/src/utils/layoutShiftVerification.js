/**
 * Layout Shift Verification Utility
 * 
 * Helper script for manual verification of layout shifts (Task 8.6.7)
 * 
 * Usage in browser console:
 * ```javascript
 * import { runLayoutShiftVerification } from './utils/layoutShiftVerification';
 * runLayoutShiftVerification();
 * ```
 * 
 * Or use global functions:
 * ```javascript
 * window.verifyLayoutShifts();
 * window.testPageCLS('JobPostingsPage');
 * window.generateVerificationReport();
 * ```
 */

import clsLoadingMeasurement from './clsLoadingMeasurement';

class LayoutShiftVerification {
  constructor() {
    this.results = [];
    this.currentTest = null;
    this.thresholds = {
      good: 0.1,
      needsImprovement: 0.25,
    };
  }

  /**
   * Initialize verification system
   */
  init() {
    if (!clsLoadingMeasurement.initialized) {
      clsLoadingMeasurement.init();
    }
    
    console.log('🔍 Layout Shift Verification System Initialized');
    console.log('📊 Target: CLS < 0.1');
    console.log('');
    console.log('Available commands:');
    console.log('  window.verifyLayoutShifts() - Run full verification');
    console.log('  window.testPageCLS(pageName) - Test specific page');
    console.log('  window.measureComponentCLS(componentName) - Test component');
    console.log('  window.generateVerificationReport() - Generate report');
    console.log('  window.checkSkeletonMatch(selector) - Check skeleton dimensions');
    console.log('');
  }

  /**
   * Run full layout shift verification
   */
  async runFullVerification() {
    console.group('🔍 Running Full Layout Shift Verification');
    
    this.results = [];
    
    // Test critical pages
    const pages = [
      'JobPostingsPage',
      'CoursesPage',
      'ProfilePage',
      'AdminDashboard',
      'SettingsPage',
    ];
    
    console.log('Testing pages:', pages.join(', '));
    console.log('');
    
    for (const page of pages) {
      await this.testPage(page);
    }
    
    // Generate summary
    this.printSummary();
    
    console.groupEnd();
    
    return this.results;
  }

  /**
   * Test a specific page for layout shifts
   */
  async testPage(pageName) {
    console.group(`📄 Testing: ${pageName}`);
    
    const sessionId = clsLoadingMeasurement.startLoadingSession(pageName);
    
    // Wait for page to settle
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const result = clsLoadingMeasurement.endLoadingSession(sessionId);
    
    if (result) {
      this.results.push({
        type: 'page',
        name: pageName,
        ...result,
      });
      
      this.logTestResult(result);
    }
    
    console.groupEnd();
    
    return result;
  }

  /**
   * Test a specific component for layout shifts
   */
  async testComponent(componentName, testFn) {
    console.group(`🧩 Testing Component: ${componentName}`);
    
    const sessionId = clsLoadingMeasurement.startLoadingSession(componentName);
    
    try {
      // Run test function if provided
      if (testFn) {
        await testFn();
      }
      
      // Wait for component to settle
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = clsLoadingMeasurement.endLoadingSession(sessionId);
      
      if (result) {
        this.results.push({
          type: 'component',
          name: componentName,
          ...result,
        });
        
        this.logTestResult(result);
      }
      
      console.groupEnd();
      
      return result;
    } catch (error) {
      console.error('Test failed:', error);
      console.groupEnd();
      return null;
    }
  }

  /**
   * Check if skeleton dimensions match content
   */
  checkSkeletonMatch(skeletonSelector, contentSelector) {
    console.group('📏 Checking Skeleton Match');
    
    const skeleton = document.querySelector(skeletonSelector);
    const content = document.querySelector(contentSelector);
    
    if (!skeleton || !content) {
      console.warn('Elements not found');
      console.log('Skeleton:', skeleton);
      console.log('Content:', content);
      console.groupEnd();
      return null;
    }
    
    const skeletonRect = skeleton.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    
    const heightDiff = Math.abs(skeletonRect.height - contentRect.height);
    const widthDiff = Math.abs(skeletonRect.width - contentRect.width);
    
    const result = {
      skeleton: {
        width: skeletonRect.width,
        height: skeletonRect.height,
      },
      content: {
        width: contentRect.width,
        height: contentRect.height,
      },
      difference: {
        width: widthDiff,
        height: heightDiff,
      },
      match: heightDiff <= 5 && widthDiff <= 5,
    };
    
    console.log('Skeleton dimensions:', result.skeleton);
    console.log('Content dimensions:', result.content);
    console.log('Difference:', result.difference);
    console.log('Match (±5px):', result.match ? '✅ YES' : '❌ NO');
    
    if (!result.match) {
      console.warn('⚠️ Skeleton dimensions do not match content!');
      console.warn('This may cause layout shifts.');
    }
    
    console.groupEnd();
    
    return result;
  }

  /**
   * Measure CLS during a specific operation
   */
  async measureOperation(operationName, operationFn) {
    console.group(`⚡ Measuring: ${operationName}`);
    
    const sessionId = clsLoadingMeasurement.startLoadingSession(operationName);
    
    try {
      await operationFn();
      
      // Wait a bit for any final shifts
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = clsLoadingMeasurement.endLoadingSession(sessionId);
      
      if (result) {
        this.logTestResult(result);
      }
      
      console.groupEnd();
      
      return result;
    } catch (error) {
      console.error('Operation failed:', error);
      console.groupEnd();
      return null;
    }
  }

  /**
   * Log test result
   */
  logTestResult(result) {
    const icon = result.rating === 'good' ? '✅' : 
                 result.rating === 'needs-improvement' ? '⚠️' : '❌';
    
    console.log(`${icon} CLS: ${result.clsDuringLoading.toFixed(4)} (${result.rating})`);
    console.log(`Duration: ${Math.round(result.duration)}ms`);
    console.log(`Layout Shifts: ${result.shiftsCount}`);
    
    if (result.shifts.length > 0) {
      console.log('Shift details:', result.shifts);
    }
    
    if (!result.passed) {
      console.warn(`⚠️ FAILED: CLS exceeds threshold of ${this.thresholds.good}`);
    }
  }

  /**
   * Print summary of all tests
   */
  printSummary() {
    console.group('📊 Verification Summary');
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const passRate = totalTests > 0 ? (passedTests / totalTests * 100) : 0;
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ❌`);
    console.log(`Pass Rate: ${passRate.toFixed(1)}%`);
    console.log('');
    
    if (failedTests > 0) {
      console.group('❌ Failed Tests');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`- ${r.name}: CLS ${r.clsDuringLoading.toFixed(4)} (${r.shiftsCount} shifts)`);
        });
      console.groupEnd();
    }
    
    // Overall status
    if (passRate === 100) {
      console.log('');
      console.log('🎉 ALL TESTS PASSED! Layout shifts are under control.');
    } else if (passRate >= 80) {
      console.log('');
      console.log('⚠️ MOSTLY PASSED: Some issues need attention.');
    } else {
      console.log('');
      console.log('❌ NEEDS WORK: Multiple layout shift issues detected.');
    }
    
    console.groupEnd();
  }

  /**
   * Generate detailed verification report
   */
  generateReport() {
    const summary = {
      timestamp: new Date().toISOString(),
      totalTests: this.results.length,
      passed: this.results.filter(r => r.passed).length,
      failed: this.results.filter(r => !r.passed).length,
      passRate: 0,
      results: this.results,
    };
    
    if (summary.totalTests > 0) {
      summary.passRate = (summary.passed / summary.totalTests * 100);
    }
    
    console.group('📋 Verification Report');
    console.log('Generated:', summary.timestamp);
    console.log('');
    console.log('Summary:');
    console.log(`  Total Tests: ${summary.totalTests}`);
    console.log(`  Passed: ${summary.passed} ✅`);
    console.log(`  Failed: ${summary.failed} ❌`);
    console.log(`  Pass Rate: ${summary.passRate.toFixed(1)}%`);
    console.log('');
    
    console.log('Detailed Results:');
    this.results.forEach((result, index) => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${index + 1}. ${icon} ${result.name}`);
      console.log(`   CLS: ${result.clsDuringLoading.toFixed(4)} (${result.rating})`);
      console.log(`   Duration: ${Math.round(result.duration)}ms`);
      console.log(`   Shifts: ${result.shiftsCount}`);
    });
    
    console.log('');
    console.log('Export to JSON:');
    console.log(JSON.stringify(summary, null, 2));
    
    console.groupEnd();
    
    return summary;
  }

  /**
   * Export results to JSON
   */
  exportToJSON() {
    const report = this.generateReport();
    const json = JSON.stringify(report, null, 2);
    
    // Copy to clipboard if available
    if (navigator.clipboard) {
      navigator.clipboard.writeText(json).then(() => {
        console.log('📋 Report copied to clipboard!');
      });
    }
    
    return json;
  }

  /**
   * Save results to localStorage
   */
  saveResults() {
    try {
      const data = {
        results: this.results,
        timestamp: Date.now(),
      };
      
      localStorage.setItem('layout_shift_verification', JSON.stringify(data));
      console.log('💾 Verification results saved to localStorage');
      return true;
    } catch (error) {
      console.error('Failed to save results:', error);
      return false;
    }
  }

  /**
   * Load results from localStorage
   */
  loadResults() {
    try {
      const stored = localStorage.getItem('layout_shift_verification');
      if (stored) {
        const data = JSON.parse(stored);
        this.results = data.results || [];
        console.log(`📂 Loaded ${this.results.length} verification results`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load results:', error);
      return false;
    }
  }

  /**
   * Clear all results
   */
  clearResults() {
    this.results = [];
    localStorage.removeItem('layout_shift_verification');
    console.log('🗑️ Cleared all verification results');
  }
}

// Create singleton instance
const layoutShiftVerification = new LayoutShiftVerification();

// Export instance and helper functions
export default layoutShiftVerification;

export const initVerification = () => {
  layoutShiftVerification.init();
};

export const runLayoutShiftVerification = () => {
  return layoutShiftVerification.runFullVerification();
};

export const testPageCLS = (pageName) => {
  return layoutShiftVerification.testPage(pageName);
};

export const testComponentCLS = (componentName, testFn) => {
  return layoutShiftVerification.testComponent(componentName, testFn);
};

export const checkSkeletonMatch = (skeletonSelector, contentSelector) => {
  return layoutShiftVerification.checkSkeletonMatch(skeletonSelector, contentSelector);
};

export const measureOperation = (operationName, operationFn) => {
  return layoutShiftVerification.measureOperation(operationName, operationFn);
};

export const generateVerificationReport = () => {
  return layoutShiftVerification.generateReport();
};

export const exportVerificationResults = () => {
  return layoutShiftVerification.exportToJSON();
};

export const saveVerificationResults = () => {
  return layoutShiftVerification.saveResults();
};

export const loadVerificationResults = () => {
  return layoutShiftVerification.loadResults();
};

export const clearVerificationResults = () => {
  layoutShiftVerification.clearResults();
};

// Make available globally for console access
if (typeof window !== 'undefined') {
  window.layoutShiftVerification = layoutShiftVerification;
  window.initVerification = initVerification;
  window.verifyLayoutShifts = runLayoutShiftVerification;
  window.testPageCLS = testPageCLS;
  window.testComponentCLS = testComponentCLS;
  window.checkSkeletonMatch = checkSkeletonMatch;
  window.measureOperation = measureOperation;
  window.generateVerificationReport = generateVerificationReport;
  window.exportVerificationResults = exportVerificationResults;
  window.saveVerificationResults = saveVerificationResults;
  window.loadVerificationResults = loadVerificationResults;
  window.clearVerificationResults = clearVerificationResults;
}
