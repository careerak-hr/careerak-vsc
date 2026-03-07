/**
 * Apply Page Enhancements - Frontend Error Conditions Tests
 * 
 * Tests error handling in the frontend application form components
 * including network failures, validation errors, and user error scenarios.
 * 
 * Coverage:
 * - Network failure handling
 * - Validation error display
 * - File upload error handling
 * - Auto-save error recovery
 * - User-friendly error messages
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import ApplicationFormContainer from '../components/ApplicationFormContainer';
import FileUploadManager from '../components/FileUploadManager';
import AutoSaveService from '../services/AutoSaveService';
import DraftManager from '../services/DraftManager';
import { AppProvider } from '../context/AppContext';

// Mock server for API calls
const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Helper to wrap components with necessary providers
const renderWithProviders = (component) => {
  return render(
    <AppProvider>
      {component}
    </AppProvider>
  );
};

describe('Frontend Error Conditions', () => {
  describe('Network Failure Handling', () => {
    test('should display error message when draft save fails', async () => {
      // Mock network failure
      server.use(
        rest.post('/api/applications/drafts', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Network error' }));
        })
      );

      renderWithProviders(
        <ApplicationFormContainer jobPostingId="123" onSubmitSuccess={() => {}} onCancel={() => {}} />
      );

      // Fill in form
      const nameInput = screen.getByLabelText(/full name/i);
      await userEvent.type(nameInput, 'Test User');

      // Trigger auto-save
      await waitFor(() => {
        expect(screen.getByText(/error.*saving/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    test('should fallback to local storage when network fails', async () => {
      const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      };
      global.localStorage = localStorageMock;

      // Mock network failure
      server.use(
        rest.post('/api/applications/drafts', (req, res, ctx) => {
          return res.networkError('Failed to connect');
        })
      );

      const draftManager = new DraftManager();
      const draftData = {
        step: 1,
        formData: { fullName: 'Test User' },
        files: []
      };

      await draftManager.saveDraft(undefined, 'job123', 1, draftData.formData, draftData.files);

      // Verify local storage was used as fallback
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    test('should retry save when connection is restored', async () => {
      let callCount = 0;
      server.use(
        rest.post('/api/applications/drafts', (req, res, ctx) => {
          callCount++;
          if (callCount === 1) {
            return res.networkError('Failed to connect');
          }
          return res(ctx.status(200), ctx.json({ draftId: 'draft123', savedAt: new Date() }));
        })
      );

      const autoSaveService = new AutoSaveService();
      
      // First attempt should fail
      await expect(
        autoSaveService.forceSave(undefined, 'job123', { fullName: 'Test' })
      ).rejects.toThrow();

      // Second attempt should succeed
      const result = await autoSaveService.forceSave(undefined, 'job123', { fullName: 'Test' });
      expect(result).toBe('draft123');
    });

    test('should display offline indicator when network is unavailable', async () => {
      // Mock offline state
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false
      });

      renderWithProviders(
        <ApplicationFormContainer jobPostingId="123" onSubmitSuccess={() => {}} onCancel={() => {}} />
      );

      await waitFor(() => {
        expect(screen.getByText(/offline/i)).toBeInTheDocument();
      });
    });

    test('should handle submission failure gracefully', async () => {
      server.use(
        rest.post('/api/applications', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Server error' }));
        })
      );

      renderWithProviders(
        <ApplicationFormContainer jobPostingId="123" onSubmitSuccess={() => {}} onCancel={() => {}} />
      );

      // Navigate to final step and submit
      // ... (fill form steps)

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed.*submit/i)).toBeInTheDocument();
      });
    });
  });

  describe('Validation Error Display', () => {
    test('should display inline validation errors for empty required fields', async () => {
      renderWithProviders(
        <ApplicationFormContainer jobPostingId="123" onSubmitSuccess={() => {}} onCancel={() => {}} />
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/full name.*required/i)).toBeInTheDocument();
        expect(screen.getByText(/email.*required/i)).toBeInTheDocument();
        expect(screen.getByText(/phone.*required/i)).toBeInTheDocument();
      });
    });

    test('should display validation error for invalid email format', async () => {
      renderWithProviders(
        <ApplicationFormContainer jobPostingId="123" onSubmitSuccess={() => {}} onCancel={() => {}} />
      );

      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'invalid-email');
      await userEvent.tab(); // Trigger blur

      await waitFor(() => {
        expect(screen.getByText(/invalid.*email/i)).toBeInTheDocument();
      });
    });

    test('should display validation error for invalid phone format', async () => {
      renderWithProviders(
        <ApplicationFormContainer jobPostingId="123" onSubmitSuccess={() => {}} onCancel={() => {}} />
      );

      const phoneInput = screen.getByLabelText(/phone/i);
      await userEvent.type(phoneInput, '123');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.getByText(/invalid.*phone/i)).toBeInTheDocument();
      });
    });

    test('should prevent navigation to next step with validation errors', async () => {
      renderWithProviders(
        <ApplicationFormContainer jobPostingId="123" onSubmitSuccess={() => {}} onCancel={() => {}} />
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      await userEvent.click(nextButton);

      // Should still be on step 1
      await waitFor(() => {
        expect(screen.getByText(/step 1/i)).toBeInTheDocument();
      });
    });

    test('should clear validation errors when field is corrected', async () => {
      renderWithProviders(
        <ApplicationFormContainer jobPostingId="123" onSubmitSuccess={() => {}} onCancel={() => {}} />
      );

      const emailInput = screen.getByLabelText(/email/i);
      
      // Enter invalid email
      await userEvent.type(emailInput, 'invalid');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.getByText(/invalid.*email/i)).toBeInTheDocument();
      });

      // Correct the email
      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 'valid@example.com');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.queryByText(/invalid.*email/i)).not.toBeInTheDocument();
      });
    });

    test('should display validation error for required custom question', async () => {
      server.use(
        rest.get('/api/job-postings/:id', (req, res, ctx) => {
          return res(ctx.json({
            _id: '123',
            title: 'Test Job',
            customQuestions: [{
              id: 'q1',
              questionText: 'Why do you want this job?',
              questionType: 'long_text',
              required: true
            }]
          }));
        })
      );

      renderWithProviders(
        <ApplicationFormContainer jobPostingId="123" onSubmitSuccess={() => {}} onCancel={() => {}} />
      );

      // Navigate to custom questions step
      // ... (navigate through steps)

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/answer.*required/i)).toBeInTheDocument();
      });
    });
  });

  describe('File Upload Error Handling', () => {
    test('should display error for invalid file type', async () => {
      renderWithProviders(
        <FileUploadManager
          files={[]}
          maxFiles={10}
          maxSizePerFile={5}
          allowedTypes={['application/pdf', 'image/jpeg', 'image/png']}
          onFilesChange={() => {}}
          onUploadProgress={() => {}}
        />
      );

      const file = new File(['content'], 'test.exe', { type: 'application/x-msdownload' });
      const input = screen.getByLabelText(/upload/i);

      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText(/invalid.*file.*type/i)).toBeInTheDocument();
      });
    });

    test('should display error for file exceeding size limit', async () => {
      renderWithProviders(
        <FileUploadManager
          files={[]}
          maxFiles={10}
          maxSizePerFile={5}
          allowedTypes={['application/pdf']}
          onFilesChange={() => {}}
          onUploadProgress={() => {}}
        />
      );

      // Create 6MB file (exceeds 5MB limit)
      const largeContent = new Array(6 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/upload/i);

      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText(/file.*too.*large/i)).toBeInTheDocument();
      });
    });

    test('should display error when maximum file count is reached', async () => {
      const existingFiles = Array.from({ length: 10 }, (_, i) => ({
        id: `file${i}`,
        name: `file${i}.pdf`,
        size: 1000000,
        type: 'application/pdf',
        url: `https://example.com/file${i}.pdf`
      }));

      renderWithProviders(
        <FileUploadManager
          files={existingFiles}
          maxFiles={10}
          maxSizePerFile={5}
          allowedTypes={['application/pdf']}
          onFilesChange={() => {}}
          onUploadProgress={() => {}}
        />
      );

      const file = new File(['content'], 'extra.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/upload/i);

      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText(/maximum.*10.*files/i)).toBeInTheDocument();
      });
    });

    test('should handle Cloudinary upload failure', async () => {
      server.use(
        rest.post('/api/upload', (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Upload failed' }));
        })
      );

      renderWithProviders(
        <FileUploadManager
          files={[]}
          maxFiles={10}
          maxSizePerFile={5}
          allowedTypes={['application/pdf']}
          onFilesChange={() => {}}
          onUploadProgress={() => {}}
        />
      );

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/upload/i);

      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText(/upload.*failed/i)).toBeInTheDocument();
      });
    });

    test('should allow retry after upload failure', async () => {
      let callCount = 0;
      server.use(
        rest.post('/api/upload', (req, res, ctx) => {
          callCount++;
          if (callCount === 1) {
            return res(ctx.status(500), ctx.json({ error: 'Upload failed' }));
          }
          return res(ctx.json({ url: 'https://example.com/test.pdf', cloudinaryId: 'test123' }));
        })
      );

      renderWithProviders(
        <FileUploadManager
          files={[]}
          maxFiles={10}
          maxSizePerFile={5}
          allowedTypes={['application/pdf']}
          onFilesChange={() => {}}
          onUploadProgress={() => {}}
        />
      );

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/upload/i);

      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText(/upload.*failed/i)).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await userEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.queryByText(/upload.*failed/i)).not.toBeInTheDocument();
        expect(screen.getByText(/test\.pdf/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Message Quality', () => {
    test('should display user-friendly error messages', async () => {
      server.use(
        rest.post('/api/applications/drafts', (req, res, ctx) => {
          return res(ctx.status(400), ctx.json({ 
            error: 'Validation failed: Email is required' 
          }));
        })
      );

      renderWithProviders(
        <ApplicationFormContainer jobPostingId="123" onSubmitSuccess={() => {}} onCancel={() => {}} />
      );

      // Trigger save
      const nameInput = screen.getByLabelText(/full name/i);
      await userEvent.type(nameInput, 'Test User');

      await waitFor(() => {
        const errorMessage = screen.getByText(/email.*required/i);
        expect(errorMessage).toBeInTheDocument();
        // Should not show technical error details
        expect(screen.queryByText(/validation failed/i)).not.toBeInTheDocument();
      });
    });

    test('should provide corrective action suggestions in error messages', async () => {
      renderWithProviders(
        <ApplicationFormContainer jobPostingId="123" onSubmitSuccess={() => {}} onCancel={() => {}} />
      );

      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'invalid');
      await userEvent.tab();

      await waitFor(() => {
        const errorMessage = screen.getByText(/please.*enter.*valid.*email/i);
        expect(errorMessage).toBeInTheDocument();
      });
    });

    test('should display specific error for each validation failure', async () => {
      renderWithProviders(
        <ApplicationFormContainer jobPostingId="123" onSubmitSuccess={() => {}} onCancel={() => {}} />
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      await userEvent.click(nextButton);

      await waitFor(() => {
        // Each field should have its own specific error
        expect(screen.getByText(/full name.*required/i)).toBeInTheDocument();
        expect(screen.getByText(/email.*required/i)).toBeInTheDocument();
        expect(screen.getByText(/phone.*required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Auto-Save Error Recovery', () => {
    test('should continue auto-saving after error', async () => {
      let callCount = 0;
      server.use(
        rest.post('/api/applications/drafts', (req, res, ctx) => {
          callCount++;
          if (callCount === 1) {
            return res(ctx.status(500), ctx.json({ error: 'Server error' }));
          }
          return res(ctx.json({ draftId: 'draft123', savedAt: new Date() }));
        })
      );

      renderWithProviders(
        <ApplicationFormContainer jobPostingId="123" onSubmitSuccess={() => {}} onCancel={() => {}} />
      );

      const nameInput = screen.getByLabelText(/full name/i);
      
      // First change triggers failed save
      await userEvent.type(nameInput, 'Test');
      
      await waitFor(() => {
        expect(screen.getByText(/error.*saving/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Second change should trigger successful save
      await userEvent.type(nameInput, ' User');
      
      await waitFor(() => {
        expect(screen.getByText(/saved/i)).toBeInTheDocument();
        expect(screen.queryByText(/error.*saving/i)).not.toBeInTheDocument();
      }, { timeout: 5000 });
    });

    test('should show last saved timestamp after successful save', async () => {
      server.use(
        rest.post('/api/applications/drafts', (req, res, ctx) => {
          return res(ctx.json({ 
            draftId: 'draft123', 
            savedAt: new Date().toISOString() 
          }));
        })
      );

      renderWithProviders(
        <ApplicationFormContainer jobPostingId="123" onSubmitSuccess={() => {}} onCancel={() => {}} />
      );

      const nameInput = screen.getByLabelText(/full name/i);
      await userEvent.type(nameInput, 'Test User');

      await waitFor(() => {
        expect(screen.getByText(/saved.*ago/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Edge Case Error Handling', () => {
    test('should handle empty profile data gracefully', async () => {
      server.use(
        rest.get('/api/users/profile', (req, res, ctx) => {
          return res(ctx.json({
            firstName: '',
            lastName: '',
            email: '',
            educationList: [],
            experienceList: [],
            computerSkills: [],
            languages: []
          }));
        })
      );

      renderWithProviders(
        <ApplicationFormContainer jobPostingId="123" onSubmitSuccess={() => {}} onCancel={() => {}} />
      );

      await waitFor(() => {
        // Form should render without errors
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
        // Fields should be empty
        expect(screen.getByLabelText(/full name/i)).toHaveValue('');
      });
    });

    test('should handle very long text inputs', async () => {
      renderWithProviders(
        <ApplicationFormContainer jobPostingId="123" onSubmitSuccess={() => {}} onCancel={() => {}} />
      );

      const longText = 'a'.repeat(10000);
      const nameInput = screen.getByLabelText(/full name/i);
      
      await userEvent.type(nameInput, longText);

      // Should handle without crashing
      expect(nameInput).toHaveValue(longText);
    });

    test('should handle special characters in input', async () => {
      renderWithProviders(
        <ApplicationFormContainer jobPostingId="123" onSubmitSuccess={() => {}} onCancel={() => {}} />
      );

      const specialChars = '<script>alert("xss")</script>';
      const nameInput = screen.getByLabelText(/full name/i);
      
      await userEvent.type(nameInput, specialChars);

      // Should sanitize or escape special characters
      expect(nameInput.value).not.toContain('<script>');
    });
  });
});
