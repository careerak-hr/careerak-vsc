/**
 * Property Test: Conflict resolution by timestamp
 * 
 * Property 16: Conflict resolution by timestamp
 * Validates: Requirements 11.6
 * 
 * For any situation where both backend draft and local storage backup exist,
 * the system should automatically select the version with the most recent
 * timestamp for restoration.
 */

import fc from 'fast-check';
import DraftManager from '../services/DraftManager';
import SyncService from '../services/SyncService';

describe('Property 16: Conflict resolution by timestamp', () => {
  // Arbitraries for generating test data
  const jobPostingIdArb = fc.uuid();
  const stepArb = fc.integer({ min: 1, max: 5 });
  const formDataArb = fc.record({
    fullName: fc.string({ minLength: 1, maxLength: 100 }),
    email: fc.emailAddress()
  });
  const filesArb = fc.array(
    fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, maxLength: 50 })
    }),
    { maxLength: 5 }
  );

  // Generate two timestamps with guaranteed difference
  const timestampPairArb = fc.tuple(
    fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
    fc.integer({ min: 1000, max: 86400000 }) // 1 second to 1 day in ms
  ).map(([baseDate, offset]) => {
    const olderDate = new Date(baseDate.getTime());
    const newerDate = new Date(baseDate.getTime() + offset);
    return { olderDate, newerDate };
  });

  it('should select local draft when it has newer timestamp', async () => {
    await fc.assert(
      fc.asyncProperty(
        jobPostingIdArb,
        stepArb,
        formDataArb,
        filesArb,
        timestampPairArb,
        async (jobPostingId, step, formData, files, { olderDate, newerDate }) => {
          // Setup
          const mockDraftManager = new DraftManager();
          const syncService = new SyncService(mockDraftManager);

          // Create backend draft (older)
          const backendDraft = {
            draftId: 'backend-draft-id',
            jobPostingId,
            step: step - 1, // Different step
            formData: { ...formData, fullName: 'Backend Name' },
            files: [],
            lastSaved: olderDate.toISOString(),
            version: 1
          };

          // Create local draft (newer)
          const localDraft = {
            draftId: undefined,
            jobPostingId,
            step,
            formData,
            files,
            lastSaved: newerDate.toISOString(),
            version: 2
          };

          // Mock loadDraft to return backend draft
          mockDraftManager.loadDraft = jest.fn().mockResolvedValue(backendDraft);

          // Resolve conflicts
          const resolved = await syncService.resolveConflicts(jobPostingId, localDraft);

          // Verify: Local draft was selected (newer timestamp)
          expect(resolved.step).toBe(localDraft.step);
          expect(resolved.formData).toEqual(localDraft.formData);
          expect(resolved.files).toEqual(localDraft.files);
          expect(resolved.lastSaved).toBe(localDraft.lastSaved);

          // Verify: Backend draft ID was preserved
          expect(resolved.draftId).toBe(backendDraft.draftId);

          // Cleanup
          syncService.destroy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should select backend draft when it has newer timestamp', async () => {
    await fc.assert(
      fc.asyncProperty(
        jobPostingIdArb,
        stepArb,
        formDataArb,
        filesArb,
        timestampPairArb,
        async (jobPostingId, step, formData, files, { olderDate, newerDate }) => {
          // Setup
          const mockDraftManager = new DraftManager();
          const syncService = new SyncService(mockDraftManager);

          // Create local draft (older)
          const localDraft = {
            draftId: undefined,
            jobPostingId,
            step: step - 1,
            formData: { ...formData, fullName: 'Local Name' },
            files: [],
            lastSaved: olderDate.toISOString(),
            version: 1
          };

          // Create backend draft (newer)
          const backendDraft = {
            draftId: 'backend-draft-id',
            jobPostingId,
            step,
            formData,
            files,
            lastSaved: newerDate.toISOString(),
            version: 2
          };

          // Mock loadDraft to return backend draft
          mockDraftManager.loadDraft = jest.fn().mockResolvedValue(backendDraft);

          // Resolve conflicts
          const resolved = await syncService.resolveConflicts(jobPostingId, localDraft);

          // Verify: Backend draft was selected (newer timestamp)
          expect(resolved.step).toBe(backendDraft.step);
          expect(resolved.formData).toEqual(backendDraft.formData);
          expect(resolved.files).toEqual(backendDraft.files);
          expect(resolved.lastSaved).toBe(backendDraft.lastSaved);
          expect(resolved.draftId).toBe(backendDraft.draftId);

          // Cleanup
          syncService.destroy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should use version number as tiebreaker when timestamps are equal', async () => {
    await fc.assert(
      fc.asyncProperty(
        jobPostingIdArb,
        stepArb,
        formDataArb,
        filesArb,
        fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
        fc.integer({ min: 1, max: 100 }),
        async (jobPostingId, step, formData, files, timestamp, versionDiff) => {
          // Setup
          const mockDraftManager = new DraftManager();
          const syncService = new SyncService(mockDraftManager);

          const timestampStr = timestamp.toISOString();
          const lowerVersion = 10;
          const higherVersion = lowerVersion + versionDiff;

          // Create local draft with higher version
          const localDraft = {
            draftId: undefined,
            jobPostingId,
            step,
            formData,
            files,
            lastSaved: timestampStr,
            version: higherVersion
          };

          // Create backend draft with lower version
          const backendDraft = {
            draftId: 'backend-draft-id',
            jobPostingId,
            step: step - 1,
            formData: { ...formData, fullName: 'Backend Name' },
            files: [],
            lastSaved: timestampStr,
            version: lowerVersion
          };

          // Mock loadDraft to return backend draft
          mockDraftManager.loadDraft = jest.fn().mockResolvedValue(backendDraft);

          // Resolve conflicts
          const resolved = await syncService.resolveConflicts(jobPostingId, localDraft);

          // Verify: Local draft was selected (higher version)
          expect(resolved.step).toBe(localDraft.step);
          expect(resolved.formData).toEqual(localDraft.formData);
          expect(resolved.version).toBe(localDraft.version);

          // Cleanup
          syncService.destroy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle missing backend draft gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        jobPostingIdArb,
        stepArb,
        formDataArb,
        filesArb,
        fc.date(),
        async (jobPostingId, step, formData, files, timestamp) => {
          // Setup
          const mockDraftManager = new DraftManager();
          const syncService = new SyncService(mockDraftManager);

          // Create local draft
          const localDraft = {
            draftId: undefined,
            jobPostingId,
            step,
            formData,
            files,
            lastSaved: timestamp.toISOString(),
            version: 1
          };

          // Mock loadDraft to return null (no backend draft)
          mockDraftManager.loadDraft = jest.fn().mockResolvedValue(null);

          // Resolve conflicts
          const resolved = await syncService.resolveConflicts(jobPostingId, localDraft);

          // Verify: Local draft was used
          expect(resolved).toEqual(localDraft);

          // Cleanup
          syncService.destroy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle backend errors gracefully and use local draft', async () => {
    await fc.assert(
      fc.asyncProperty(
        jobPostingIdArb,
        stepArb,
        formDataArb,
        filesArb,
        fc.date(),
        async (jobPostingId, step, formData, files, timestamp) => {
          // Setup
          const mockDraftManager = new DraftManager();
          const syncService = new SyncService(mockDraftManager);

          // Create local draft
          const localDraft = {
            draftId: undefined,
            jobPostingId,
            step,
            formData,
            files,
            lastSaved: timestamp.toISOString(),
            version: 1
          };

          // Mock loadDraft to throw error
          mockDraftManager.loadDraft = jest.fn().mockRejectedValue(new Error('Network error'));

          // Resolve conflicts
          const resolved = await syncService.resolveConflicts(jobPostingId, localDraft);

          // Verify: Local draft was used as fallback
          expect(resolved).toEqual(localDraft);

          // Cleanup
          syncService.destroy();
        }
      ),
      { numRuns: 100 }
    );
  });
});
