/**
 * Property Test: Local storage synchronization
 * 
 * Property 17: Local storage synchronization
 * Validates: Requirements 11.3, 11.4
 * 
 * For any draft data saved to local storage as a backup,
 * when connection is restored and synchronization completes successfully,
 * the local storage backup should be cleared.
 */

import fc from 'fast-check';
import DraftManager from '../services/DraftManager';
import SyncService from '../services/SyncService';

describe('Property 17: Local storage synchronization', () => {
  // Arbitraries for generating test data
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

  it('should clear local storage after successful sync to backend', async () => {
    await fc.assert(
      fc.asyncProperty(
        jobPostingIdArb,
        stepArb,
        formDataArb,
        filesArb,
        async (jobPostingId, step, formData, files) => {
          // Setup
          const mockDraftManager = new DraftManager();
          const syncService = new SyncService(mockDraftManager);

          let localStorageSaved = false;
          let localStorageCleared = false;
          let backendSaved = false;

          // Mock saveToLocalStorage
          mockDraftManager.saveToLocalStorage = jest.fn().mockImplementation(() => {
            localStorageSaved = true;
          });

          // Mock loadFromLocalStorage to return draft
          mockDraftManager.loadFromLocalStorage = jest.fn().mockReturnValue({
            draftId: 'draft-id',
            jobPostingId,
            step,
            formData,
            files,
            lastSaved: new Date().toISOString(),
            version: 1
          });

          // Mock getAllLocalDraftKeys to return one key
          mockDraftManager.getAllLocalDraftKeys = jest.fn().mockReturnValue([
            `careerak_draft_${jobPostingId}`
          ]);

          // Mock saveDraft to succeed
          mockDraftManager.saveDraft = jest.fn().mockImplementation(() => {
            backendSaved = true;
            return Promise.resolve('draft-id');
          });

          // Mock clearLocalStorage
          mockDraftManager.clearLocalStorage = jest.fn().mockImplementation(() => {
            localStorageCleared = true;
          });

          // Mock loadDraft for conflict resolution
          mockDraftManager.loadDraft = jest.fn().mockResolvedValue(null);

          // Step 1: Save to local storage
          mockDraftManager.saveToLocalStorage(jobPostingId, {
            jobPostingId,
            step,
            formData,
            files
          });

          expect(localStorageSaved).toBe(true);

          // Step 2: Sync to backend
          const result = await syncService.syncToBackend();

          // Verify: Sync was successful
          expect(result.success).toBe(true);
          expect(result.synced).toBe(1);
          expect(result.failed).toBe(0);

          // Verify: Backend save was called
          expect(backendSaved).toBe(true);

          // Verify: Local storage was cleared after successful sync
          expect(localStorageCleared).toBe(true);
          expect(mockDraftManager.clearLocalStorage).toHaveBeenCalledWith(jobPostingId);

          // Cleanup
          syncService.destroy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not clear local storage if sync fails', async () => {
    await fc.assert(
      fc.asyncProperty(
        jobPostingIdArb,
        stepArb,
        formDataArb,
        filesArb,
        async (jobPostingId, step, formData, files) => {
          // Setup
          const mockDraftManager = new DraftManager();
          const syncService = new SyncService(mockDraftManager);

          let localStorageCleared = false;

          // Mock loadFromLocalStorage to return draft
          mockDraftManager.loadFromLocalStorage = jest.fn().mockReturnValue({
            draftId: 'draft-id',
            jobPostingId,
            step,
            formData,
            files,
            lastSaved: new Date().toISOString(),
            version: 1
          });

          // Mock getAllLocalDraftKeys to return one key
          mockDraftManager.getAllLocalDraftKeys = jest.fn().mockReturnValue([
            `careerak_draft_${jobPostingId}`
          ]);

          // Mock saveDraft to fail
          mockDraftManager.saveDraft = jest.fn().mockRejectedValue(new Error('Network error'));

          // Mock clearLocalStorage
          mockDraftManager.clearLocalStorage = jest.fn().mockImplementation(() => {
            localStorageCleared = true;
          });

          // Mock loadDraft for conflict resolution
          mockDraftManager.loadDraft = jest.fn().mockResolvedValue(null);

          // Sync to backend (should fail)
          const result = await syncService.syncToBackend();

          // Verify: Sync failed
          expect(result.success).toBe(true); // Overall process completes
          expect(result.synced).toBe(0);
          expect(result.failed).toBe(1);

          // Verify: Local storage was NOT cleared
          expect(localStorageCleared).toBe(false);

          // Cleanup
          syncService.destroy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should sync multiple drafts and clear all successfully synced', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            jobPostingId: fc.uuid(),
            step: fc.integer({ min: 1, max: 5 }),
            formData: fc.record({
              fullName: fc.string({ minLength: 1, maxLength: 50 }),
              email: fc.emailAddress()
            }),
            files: fc.array(
              fc.record({
                id: fc.uuid(),
                name: fc.string({ minLength: 1, maxLength: 30 })
              }),
              { maxLength: 3 }
            )
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (drafts) => {
          // Setup
          const mockDraftManager = new DraftManager();
          const syncService = new SyncService(mockDraftManager);

          const clearedJobPostingIds = new Set();
          const savedJobPostingIds = new Set();

          // Mock getAllLocalDraftKeys
          mockDraftManager.getAllLocalDraftKeys = jest.fn().mockReturnValue(
            drafts.map(d => `careerak_draft_${d.jobPostingId}`)
          );

          // Mock loadFromLocalStorage
          mockDraftManager.loadFromLocalStorage = jest.fn().mockImplementation((jobPostingId) => {
            const draft = drafts.find(d => d.jobPostingId === jobPostingId);
            if (!draft) return null;
            return {
              draftId: 'draft-id',
              ...draft,
              lastSaved: new Date().toISOString(),
              version: 1
            };
          });

          // Mock saveDraft
          mockDraftManager.saveDraft = jest.fn().mockImplementation((draftId, jobPostingId) => {
            savedJobPostingIds.add(jobPostingId);
            return Promise.resolve('draft-id');
          });

          // Mock clearLocalStorage
          mockDraftManager.clearLocalStorage = jest.fn().mockImplementation((jobPostingId) => {
            clearedJobPostingIds.add(jobPostingId);
          });

          // Mock loadDraft for conflict resolution
          mockDraftManager.loadDraft = jest.fn().mockResolvedValue(null);

          // Sync all drafts
          const result = await syncService.syncToBackend();

          // Verify: All drafts were synced
          expect(result.success).toBe(true);
          expect(result.synced).toBe(drafts.length);
          expect(result.failed).toBe(0);

          // Verify: All drafts were saved to backend
          expect(savedJobPostingIds.size).toBe(drafts.length);
          drafts.forEach(draft => {
            expect(savedJobPostingIds.has(draft.jobPostingId)).toBe(true);
          });

          // Verify: All local storage entries were cleared
          expect(clearedJobPostingIds.size).toBe(drafts.length);
          drafts.forEach(draft => {
            expect(clearedJobPostingIds.has(draft.jobPostingId)).toBe(true);
          });

          // Cleanup
          syncService.destroy();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should preserve data integrity during sync process', async () => {
    await fc.assert(
      fc.asyncProperty(
        jobPostingIdArb,
        stepArb,
        formDataArb,
        filesArb,
        async (jobPostingId, step, formData, files) => {
          // Setup
          const mockDraftManager = new DraftManager();
          const syncService = new SyncService(mockDraftManager);

          let savedData = null;

          // Mock loadFromLocalStorage
          mockDraftManager.loadFromLocalStorage = jest.fn().mockReturnValue({
            draftId: 'draft-id',
            jobPostingId,
            step,
            formData,
            files,
            lastSaved: new Date().toISOString(),
            version: 1
          });

          // Mock getAllLocalDraftKeys
          mockDraftManager.getAllLocalDraftKeys = jest.fn().mockReturnValue([
            `careerak_draft_${jobPostingId}`
          ]);

          // Mock saveDraft to capture data
          mockDraftManager.saveDraft = jest.fn().mockImplementation(
            (draftId, jobId, stepNum, formDataParam, filesParam) => {
              savedData = {
                draftId,
                jobPostingId: jobId,
                step: stepNum,
                formData: formDataParam,
                files: filesParam
              };
              return Promise.resolve('draft-id');
            }
          );

          mockDraftManager.clearLocalStorage = jest.fn();
          mockDraftManager.loadDraft = jest.fn().mockResolvedValue(null);

          // Sync
          await syncService.syncToBackend();

          // Verify: Data integrity was preserved
          expect(savedData).not.toBeNull();
          expect(savedData.jobPostingId).toBe(jobPostingId);
          expect(savedData.step).toBe(step);
          expect(savedData.formData).toEqual(formData);
          expect(savedData.files).toEqual(files);

          // Cleanup
          syncService.destroy();
        }
      ),
      { numRuns: 100 }
    );
  });
});
