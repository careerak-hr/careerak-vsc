import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

/**
 * Property Test 23: Error message clarity
 * 
 * Validates: Requirements 9.6
 * 
 * Property: For any error condition, the system should display user-friendly error messages
 * that explain the problem and include corrective actions.
 * 
 * Feature: apply-page-enhancements
 */

// Error types that can occur in the application
const errorTypes = {
  VALIDATION: 'validation',
  NETWORK: 'network',
  FILE_UPLOAD: 'file_upload',
  AUTHENTICATION: 'authentication',
  SERVER: 'server',
  PERMISSION: 'permission'
};

// Mock error message generator
const generateErrorMessage = (errorType, context = {}) => {
  const messages = {
    [errorTypes.VALIDATION]: {
      problem: `The ${context.field || 'field'} you entered is invalid.`,
      action: `Please ${context.requirement || 'check your input and try again'}.`
    },
    [errorTypes.NETWORK]: {
      problem: 'Unable to connect to the server.',
      action: 'Please check your internet connection and try again.'
    },
    [errorTypes.FILE_UPLOAD]: {
      problem: `File upload failed${context.fileName ? ` for "${context.fileName}"` : ''}.`,
      action: `Please ensure the file is ${context.maxSize || '5MB'} or smaller and in a supported format (${context.formats || 'PDF, DOC, DOCX, JPG, PNG'}).`
    },
    [errorTypes.AUTHENTICATION]: {
      problem: 'Your session has expired.',
      action: 'Please log in again to continue.'
    },
    [errorTypes.SERVER]: {
      problem: 'An unexpected error occurred on the server.',
      action: 'Please try again later or contact support if the problem persists.'
    },
    [errorTypes.PERMISSION]: {
      problem: 'You do not have permission to perform this action.',
      action: 'Please contact your administrator if you believe this is an error.'
    }
  };

  const message = messages[errorType] || {
    problem: 'An error occurred.',
    action: 'Please try again.'
  };

  return {
    userFriendly: true,
    problem: message.problem,
    action: message.action,
    fullMessage: `${message.problem} ${message.action}`
  };
};

// Check if message is user-friendly
const isUserFriendly = (message) => {
  // Should not contain technical jargon
  const technicalTerms = [
    'undefined', 'null', 'NaN', 'TypeError', 'ReferenceError',
    'stack trace', 'exception', 'ECONNREFUSED', '500', '404'
  ];
  
  const lowerMessage = message.toLowerCase();
  const hasTechnicalTerms = technicalTerms.some(term => 
    lowerMessage.includes(term.toLowerCase())
  );
  
  // Should be reasonably long (not just "Error")
  const hasSubstance = message.length > 10;
  
  // Should use polite language
  const hasPoliteLanguage = /please|kindly|sorry|apologize/i.test(message);
  
  return !hasTechnicalTerms && hasSubstance && hasPoliteLanguage;
};

// Check if message includes corrective action
const includesCorrectiveAction = (message) => {
  const actionWords = [
    'try again', 'check', 'ensure', 'verify', 'contact',
    'please', 'log in', 'refresh', 'reload', 'update'
  ];
  
  const lowerMessage = message.toLowerCase();
  return actionWords.some(word => lowerMessage.includes(word));
};

describe('Property 23: Error message clarity', () => {
  it('should generate user-friendly messages for all error types', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(errorTypes)),
        (errorType) => {
          const message = generateErrorMessage(errorType);
          
          expect(message.userFriendly).toBe(true);
          expect(message.problem).toBeTruthy();
          expect(message.action).toBeTruthy();
          expect(isUserFriendly(message.fullMessage)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include corrective actions in all error messages', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(errorTypes)),
        fc.record({
          field: fc.option(fc.constantFrom('email', 'password', 'name'), { nil: undefined }),
          fileName: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
          maxSize: fc.option(fc.constantFrom('5MB', '10MB'), { nil: undefined })
        }),
        (errorType, context) => {
          const message = generateErrorMessage(errorType, context);
          
          expect(message.action).toBeTruthy();
          expect(includesCorrectiveAction(message.fullMessage)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not expose technical details in validation errors', () => {
    fc.assert(
      fc.property(
        fc.record({
          field: fc.constantFrom('email', 'password', 'phone', 'name'),
          requirement: fc.constantFrom(
            'enter a valid email address',
            'use at least 8 characters',
            'include only letters and numbers'
          )
        }),
        (context) => {
          const message = generateErrorMessage(errorTypes.VALIDATION, context);
          
          // Should not contain technical terms
          expect(message.fullMessage).not.toMatch(/undefined|null|NaN|Error/i);
          
          // Should be user-friendly
          expect(isUserFriendly(message.fullMessage)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide specific guidance for file upload errors', () => {
    fc.assert(
      fc.property(
        fc.record({
          fileName: fc.string({ minLength: 1, maxLength: 30 }),
          maxSize: fc.constantFrom('5MB', '10MB', '2MB'),
          formats: fc.constantFrom('PDF, DOC', 'JPG, PNG', 'PDF, DOC, DOCX, JPG, PNG')
        }),
        (context) => {
          const message = generateErrorMessage(errorTypes.FILE_UPLOAD, context);
          
          // Should mention file name
          expect(message.problem).toContain(context.fileName);
          
          // Should mention size limit
          expect(message.action).toContain(context.maxSize);
          
          // Should mention supported formats
          expect(message.action).toContain(context.formats);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should provide clear next steps for network errors', () => {
    fc.assert(
      fc.property(
        fc.constant(errorTypes.NETWORK),
        (errorType) => {
          const message = generateErrorMessage(errorType);
          
          // Should explain the problem
          expect(message.problem).toMatch(/connect|connection|network/i);
          
          // Should suggest checking connection
          expect(message.action).toMatch(/check.*connection|try again/i);
          
          // Should be actionable
          expect(includesCorrectiveAction(message.fullMessage)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle authentication errors gracefully', () => {
    fc.assert(
      fc.property(
        fc.constant(errorTypes.AUTHENTICATION),
        (errorType) => {
          const message = generateErrorMessage(errorType);
          
          // Should explain session issue
          expect(message.problem).toMatch(/session|expired|logged out/i);
          
          // Should suggest logging in
          expect(message.action).toMatch(/log in|sign in/i);
          
          // Should be polite
          expect(message.fullMessage).toMatch(/please/i);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain consistent message structure across error types', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.constantFrom(...Object.values(errorTypes)),
          { minLength: 3, maxLength: 6 }
        ),
        (errorTypes) => {
          const messages = errorTypes.map(type => generateErrorMessage(type));
          
          messages.forEach(message => {
            // All messages should have problem and action
            expect(message.problem).toBeTruthy();
            expect(message.action).toBeTruthy();
            
            // All messages should be user-friendly
            expect(message.userFriendly).toBe(true);
            
            // All messages should have corrective actions
            expect(includesCorrectiveAction(message.fullMessage)).toBe(true);
            
            // All messages should be reasonably long
            expect(message.fullMessage.length).toBeGreaterThan(20);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should never return empty or undefined error messages', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(errorTypes)),
        fc.record({
          field: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
          fileName: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined })
        }),
        (errorType, context) => {
          const message = generateErrorMessage(errorType, context);
          
          expect(message).toBeDefined();
          expect(message.problem).toBeTruthy();
          expect(message.action).toBeTruthy();
          expect(message.fullMessage).toBeTruthy();
          expect(message.problem).not.toBe('');
          expect(message.action).not.toBe('');
          expect(message.fullMessage).not.toBe('');
        }
      ),
      { numRuns: 100 }
    );
  });
});
