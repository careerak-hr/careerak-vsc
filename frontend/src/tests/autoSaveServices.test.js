/**
 * Unit Tests: Auto-save Services
 * 
 * Tests for AutoSaveService, DraftManager, and SyncService
 * Requirements: 2.1, 2.6, 11.2, 11.3, 11.4, 11.6
 */

import AutoSaveService from '../services/AutoSaveService';
import DraftManager from '../services/DraftManager';
import SyncService from '../services/SyncService';

// Mock timers
jest.useFakeTimers();

describe('AutoSaveService', () => {
  let autoSaveService;
  let mockDraftManager;
  let mockSyncService;

  beforeEach(() => {
    mockDraftManager = new DraftManager();
    mockSyncService = new SyncService(mockDraftManager);
    autoSaveService = new AutoSaveService(mockDraftManager, mockSyncService);

    // Mock methods
    mockDraftManager.saveDraft = jest.fn().mockResolvedValue('draft-id');
    mockDraftManager.saveToLocalStorage = jest.fn();
    mockDraftManager.clearLocalStorage = jest.fn();
    mockSyncService.addToRetryQueue = jest.fn();
  });

  afterEach(() => {
    autoSaveService.destroy();
    jest.clearAllTimers();
  });

  describe('Debounce timing', () => {
    it('should debounce save with 3 second delay', () => {
      const onComplete = jest.fn();
      const onError = jest.fn();

      autoSaveService.scheduleSave(
        'draft-id',
        'job-id',
        1,
        { name: 'Test' },
        [],
        onComplete,
        onError
      );

      // Should not save immediately
      expect(mockDraftManager.saveDraft).not.toHaveBeenCalled();

      // Fast-forward 2 seconds
      jest.advanceTimersByTime(2000);
      expect(mockDraftManager.saveDraft).not.toHaveBeenCalled();

      // Fast-forward 1 more second (total 3 seconds)
      jest.advanceTimersByTime(1000);
      
      // Wait for async operations
      return new Promise(resolve => {
        setTimeout(() => {
          expect(mockDraftManager.saveDraft).toHaveBeenCalled();
          resolve();
        }, 0);
      });
    });

    it('should cancel previous scheduled save when new save is scheduled', () => {
      const onComplete = jest.fn();

      // Schedule first save
      autoSaveService.scheduleSave(
        'draft-id',
        'job-id',
        1,
        { name: 'Test 1' },
        [],
        onComplete,
        jest.fn()
      );

      // Fast-forward 2 seconds
      jest.advanceTimersByTime(2000);

      // Schedule second save (should cancel first)
      autoSaveService.scheduleSave(
        'draft-id',
        'job-id',
        1,
        { name: 'Test 2' },
        [],
        onComplete,
        jest.fn()
      );

      // Fast-forward 1 second (first save would have triggered)
      jest.advanceTimersByTime(1000);

      // Should not have saved yet
      expect(mockDraftManager.saveDraft).not.toHaveBeenCalled();

      // Fast-forward 2 more seconds (second save triggers)
      jest.advanceTimersByTime(2000);

      return new Promise(resolve => {
        setTimeout(() => {
          // Should only save once (second save)
          expect(mockDraftManager.saveDraft).toHaveBeenCalledTimes(1);
          resolve();
        }, 0);
      });
    });
  });

  describe('Manual save', () => {
    it('should save immediately when forceSave is called', async () => {
      await autoSaveService.forceSave('draft-id', 'job-id', 1, { name: 'Test' }, []);

      expect(mockDraftManager.saveDraft).toHaveBeenCalledWith(
        'draft-id',
        'job-id',
        1,
        { name: 'Test' },
        []
      );
    });

    it('should cancel scheduled save when forceSave is called', async () => {
      // Schedule a save
      autoSaveService.scheduleSave(
        'draft-id',
        'job-id',
        1,
        { name: 'Test 1' },
        [],
        jest.fn(),
        jest.fn()
      );

      // Force save immediately
      await autoSaveService.forceSave('draft-id', 'job-id', 1, { name: 'Test 2' }, []);

      // Fast-forward past scheduled time
      jest.advanceTimersByTime(5000);

      // Should only have saved once (force save)
      expect(mockDraftManager.saveDraft).toHaveBeenCalledTimes(1);
    });
  });

  describe('Local storage fallback', () => {
    it('should save to local storage when backend save fails', async () => {
      mockDraftManager.saveDraft = jest.fn().mockRejectedValue(new Error('Network error'));

      try {
        await autoSaveService.forceSave('draft-id', 'job-id', 1, { name: 'Test' }, []);
      } catch (error) {
        // Expected to fail
      }

      expect(mockDraftManager.saveToLocalStorage).toHaveBeenCalled();
      expect(mockSyncService.addToRetryQueue).toHaveBeenCalled();
    });

    it('should save to local storage when offline', async () => {
      // Simulate offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      autoSaveService = new AutoSaveService(mockDraftManager, mockSyncService);

      await autoSaveService.forceSave('draft-id', 'job-id', 1, { name: 'Test' }, []);

      expect(mockDraftManager.saveToLocalStorage).toHaveBeenCalled();
      expect(mockDraftManager.saveDraft).not.toHaveBeenCalled();
    });
  });

  describe('Network status monitoring', () => {
    it('should detect when device goes offline', () => {
      expect(autoSaveService.isDeviceOnline()).toBe(true);

      // Simulate offline event
      window.dispatchEvent(new Event('offline'));

      expect(autoSaveService.isDeviceOnline()).toBe(false);
    });

    it('should detect when device comes online', () => {
      // Start offline
      window.dispatchEvent(new Event('offline'));
      expect(autoSaveService.isDeviceOnline()).toBe(false);

      // Go online
      window.dispatchEvent(new Event('online'));

      expect(autoSaveService.isDeviceOnline()).toBe(true);
    });
  });
});

describe('DraftManager', () => {
  let draftManager;

  beforeEach(() => {
    draftManager = new DraftManager('http://localhost:3000');
    localStorage.clear();
  });

  describe('Local storage operations', () => {
    it('should save draft to local storage', () => {
      const draft = {
        jobPostingId: 'job-123',
        step: 1,
        formData: { name: 'Test' },
        files: []
      };

      draftManager.saveToLocalStorage('job-123', draft);

      const saved = localStorage.getItem('careerak_draft_job-123');
      expect(saved).not.toBeNull();
      expect(JSON.parse(saved)).toEqual(draft);
    });

    it('should load draft from local storage', () => {
      const draft = {
        jobPostingId: 'job-123',
        step: 1,
        formData: { name: 'Test' },
        files: []
      };

      localStorage.setItem('careerak_draft_job-123', JSON.stringify(draft));

      const loaded = draftManager.loadFromLocalStorage('job-123');
      expect(loaded).toEqual(draft);
    });

    it('should return null when draft not found in local storage', () => {
      const loaded = draftManager.loadFromLocalStorage('non-existent');
      expect(loaded).toBeNull();
    });

    it('should clear draft from local storage', () => {
      const draft = {
        jobPostingId: 'job-123',
        step: 1,
        formData: { name: 'Test' },
        files: []
      };

      localStorage.setItem('careerak_draft_job-123', JSON.stringify(draft));
      draftManager.clearLocalStorage('job-123');

      const saved = localStorage.getItem('careerak_draft_job-123');
      expect(saved).toBeNull();
    });

    it('should get all local draft keys', () => {
      localStorage.setItem('careerak_draft_job-1', '{}');
      localStorage.setItem('careerak_draft_job-2', '{}');
      localStorage.setItem('other_key', '{}');

      const keys = draftManager.getAllLocalDraftKeys();
      
      expect(keys).toHaveLength(2);
      expect(keys).toContain('careerak_draft_job-1');
      expect(keys).toContain('careerak_draft_job-2');
      expect(keys).not.toContain('other_key');
    });
  });
});

describe('SyncService', () => {
  let syncService;
  let mockDraftManager;

  beforeEach(() => {
    mockDraftManager = new DraftManager();
    syncService = new SyncService(mockDraftManager);

    mockDraftManager.saveDraft = jest.fn().mockResolvedValue('draft-id');
    mockDraftManager.loadDraft = jest.fn().mockResolvedValue(null);
    mockDraftManager.clearLocalStorage = jest.fn();
    mockDraftManager.getAllLocalDraftKeys = jest.fn().mockReturnValue([]);
    mockDraftManager.loadFromLocalStorage = jest.fn().mockReturnValue(null);
  });

  afterEach(() => {
    syncService.destroy();
  });

  describe('Conflict resolution', () => {
    it('should select local draft when it has newer timestamp', async () => {
      const localDraft = {
        jobPostingId: 'job-123',
        step: 2,
        formData: { name: 'Local' },
        files: [],
        lastSaved: '2024-01-02T00:00:00.000Z',
        version: 2
      };

      const backendDraft = {
        draftId: 'backend-id',
        jobPostingId: 'job-123',
        step: 1,
        formData: { name: 'Backend' },
        files: [],
        lastSaved: '2024-01-01T00:00:00.000Z',
        version: 1
      };

      mockDraftManager.loadDraft = jest.fn().mockResolvedValue(backendDraft);

      const resolved = await syncService.resolveConflicts('job-123', localDraft);

      expect(resolved.step).toBe(2);
      expect(resolved.formData.name).toBe('Local');
      expect(resolved.draftId).toBe('backend-id'); // Preserves backend ID
    });

    it('should select backend draft when it has newer timestamp', async () => {
      const localDraft = {
        jobPostingId: 'job-123',
        step: 1,
        formData: { name: 'Local' },
        files: [],
        lastSaved: '2024-01-01T00:00:00.000Z',
        version: 1
      };

      const backendDraft = {
        draftId: 'backend-id',
        jobPostingId: 'job-123',
        step: 2,
        formData: { name: 'Backend' },
        files: [],
        lastSaved: '2024-01-02T00:00:00.000Z',
        version: 2
      };

      mockDraftManager.loadDraft = jest.fn().mockResolvedValue(backendDraft);

      const resolved = await syncService.resolveConflicts('job-123', localDraft);

      expect(resolved.step).toBe(2);
      expect(resolved.formData.name).toBe('Backend');
    });
  });

  describe('Sync on reconnection', () => {
    it('should trigger sync when connection is restored', async () => {
      const syncSpy = jest.spyOn(syncService, 'syncToBackend');

      // Simulate connection restoration
      window.dispatchEvent(new Event('online'));

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(syncSpy).toHaveBeenCalled();
    });

    it('should call registered listeners when connection is restored', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      syncService.onConnectionRestored(listener1);
      syncService.onConnectionRestored(listener2);

      // Simulate connection restoration
      window.dispatchEvent(new Event('online'));

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe('Retry queue', () => {
    it('should add draft to retry queue', () => {
      const draft = {
        jobPostingId: 'job-123',
        step: 1,
        formData: { name: 'Test' },
        files: []
      };

      syncService.addToRetryQueue(draft);

      expect(syncService.getRetryQueueSize()).toBe(1);
    });

    it('should update existing draft in retry queue', () => {
      const draft1 = {
        jobPostingId: 'job-123',
        step: 1,
        formData: { name: 'Test 1' },
        files: []
      };

      const draft2 = {
        jobPostingId: 'job-123',
        step: 2,
        formData: { name: 'Test 2' },
        files: []
      };

      syncService.addToRetryQueue(draft1);
      syncService.addToRetryQueue(draft2);

      // Should only have one entry (updated)
      expect(syncService.getRetryQueueSize()).toBe(1);
    });

    it('should clear retry queue', () => {
      syncService.addToRetryQueue({ jobPostingId: 'job-1' });
      syncService.addToRetryQueue({ jobPostingId: 'job-2' });

      expect(syncService.getRetryQueueSize()).toBe(2);

      syncService.clearRetryQueue();

      expect(syncService.getRetryQueueSize()).toBe(0);
    });
  });
});
