/**
 * Property Test: Auto-save retry on failure
 * 
 * Property 6: Auto-save retry on failure
 * Validates: Requirements 2.6, 11.2, 11.3
 * 
 * For any auto-save operation that fails due to network issues,
 * the system should queue the operation and successfully save to
 * backend when connection is restored, ensuring no data loss.
 */

import fc from 'fast-check';
import AutoSaveService from '../services/AutoSaveService';
import DraftManager from '../services/DraftManager';
import SyncService from '../services/SyncService';

describe('Property 6: Auto-save retry on failure', () => {
  // Arbitraries for generating test data
  const draftIdArb = fc.option(fc.uuid(), { nil: undefined });
  const jobPostingIdArb = fc.uuid();
  const stepArb = fc.integer({ min: 1, max: 5 });
  const formDataArb = fc.record({
    fullName: fc.string({ minLength: 1, maxLength: 100 }),
    email: fc.emailAddress(),
    phone: fc.string({ minLength: 10, maxLength: 15 })
  });
  const filesArb = fc.array(
    fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, maxLength: 50 }),
      url: fc.webUrl()
    }),
    { maxLength: 10 }
  );

  it('should save to local storage when network fails and sync when restored', async () => {
    await fc.assert(
      fc.asyncProperty(
        draftIdArb,
        jobPostingIdArb,
        stepArb,
        formDataArb,
        filesArb,
        async (draftId, jobPostingId, step, formData, files) => {
          // Setup
          const mockDraftManager = new DraftManager();
          const mockSyncService = new SyncService(mockDraftManager);
          const autoSaveService = new AutoSaveService(mockDraftManager, mockSyncService);

          let backendSaveCalled = false;
          let localStorageSaveCalled = false;
          let syncCalled = false;

          // Mock backend save to fail initially
          mockDraftManager.saveDraft = jest.fn().mockImplementation(() => {
            backendSaveCalled = true;
            throw new Error('Network error');
          });

          // Mock local storage save
          mockDraftManager.saveToLocalStorage = jest.fn().mockImplementation((jobId, draft) => {
            localStorageSaveCalled = true;
            expect(jobId).toBe(jobPostingId);
            expect(draft.step).toBe(step);
            expect(draft.formData).toEqual(formData);
            expect(draft.files).toEqual(files);
          });

          // Mock sync service
          mockSyncService.addToRetryQueue = jest.fn();

          // Simulate network failure
          Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: true
          });

          // Step 1: Try to save (should fail and fallback to local storage)
          try {
            await autoSaveService.forceSave(draftId, jobPostingId, step, formData, files);
          } catch (error) {
            // Expected to fail
          }

          // Verify: Backend save was attempted
          expect(backendSaveCalled).toBe(true);

          // Verify: Data was saved to local storage as fallback
          expect(localStorageSaveCalled).toBe(true);

          // Verify: Draft was added to retry queue
          expect(mockSyncService.addToRetryQueue).toHaveBeenCalled();

          // Step 2: Simulate connection restoration
          backendSaveCalled = false;
          mockDraftManager.saveDraft = jest.fn().mockImplementation(() => {
            backendSaveCalled = true;
            syncCalled = true;
            return Promise.resolve(draftId || 'new-draft-id');
          });

          mockDraftManager.clearLocalStorage = jest.fn();

          // Trigger sync
          await mockSyncService.syncToBackend();

          // Verify: Data was synced to backend
          expect(syncCalled).toBe(true);

          // Verify: Local storage was cleared after successful sync
          expect(mockDraftManager.clearLocalStorage).toHaveBeenCalledWith(jobPostingId);

          // Cleanup
          autoSaveService.destroy();
          mockSyncService.destroy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve all data during network failure and recovery', async () => {
    await fc.assert(
      fc.asyncProperty(
        draftIdArb,
        jobPostingIdArb,
        stepArb,
        formDataArb,
        filesArb,
        async (draftId, jobPostingId, step, formData, files) => {
          // Setup
          const mockDraftManager = new DraftManager();
          const mockSyncService = new SyncService(mockDraftManager);
          const autoSaveService = new AutoSaveService(mockDraftManager, mockSyncService);

          let savedData = null;

          // Mock local storage save to capture data
          mockDraftManager.saveToLocalStorage = jest.fn().mockImplementation((jobId, draft) => {
            savedData = draft;
          });

          // Mock backend save to fail
          mockDraftManager.saveDraft = jest.fn().mockRejectedValue(new Error('Network error'));

          mockSyncService.addToRetryQueue = jest.fn();

          // Simulate network failure
          Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: true
          });

          // Save with network failure
          try {
            await autoSaveService.forceSave(draftId, jobPostingId, step, formData, files);
          } catch (error) {
            // Expected
          }

          // Verify: All data was preserved in local storage
          expect(savedData).not.toBeNull();
          expect(savedData.jobPostingId).toBe(jobPostingId);
          expect(savedData.step).toBe(step);
          expect(savedData.formData).toEqual(formData);
          expect(savedData.files).toEqual(files);
          expect(savedData.lastSaved).toBeDefined();
          expect(savedData.version).toBeDefined();

          // Cleanup
          autoSaveService.destroy();
          mockSyncService.destroy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle multiple network failures and eventual success', async () => {
    await fc.assert(
      fc.asyncProperty(
        draftIdArb,
        jobPostingIdArb,
        stepArb,
        formDataArb,
        filesArb,
        fc.integer({ min: 1, max: 5 }),
        async (draftId, jobPostingId, step, formData, files, failureCount) => {
          // Setup
          const mockDraftManager = new DraftManager();
          const mockSyncService = new SyncService(mockDraftManager);
          const autoSaveService = new AutoSaveService(mockDraftManager, mockSyncService);

          let attemptCount = 0;
          let finalSuccess = false;

          // Mock backend save to fail N times then succeed
          mockDraftManager.saveDraft = jest.fn().mockImplementation(() => {
            attemptCount++;
            if (attemptCount <= failureCount) {
              throw new Error('Network error');
            }
            finalSuccess = true;
            return Promise.resolve(draftId || 'new-draft-id');
          });

          mockDraftManager.saveToLocalStorage = jest.fn();
          mockDraftManager.clearLocalStorage = jest.fn();
          mockSyncService.addToRetryQueue = jest.fn();

          Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: true
          });

          // Attempt saves until success
          for (let i = 0; i <= failureCount; i++) {
            try {
              await autoSaveService.forceSave(draftId, jobPostingId, step, formData, files);
            } catch (error) {
              // Expected for first N attempts
            }
          }

          // Verify: Eventually succeeded
          expect(finalSuccess).toBe(true);

          // Verify: Local storage was used during failures
          expect(mockDraftManager.saveToLocalStorage).toHaveBeenCalled();

          // Cleanup
          autoSaveService.destroy();
          mockSyncService.destroy();
        }
      ),
      { numRuns: 50 }
    );
  });
});
