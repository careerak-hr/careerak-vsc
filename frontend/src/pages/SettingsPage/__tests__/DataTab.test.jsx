import React, { createContext } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DataTab from '../DataTab';

// Create a mock AppContext for testing
const AppContext = createContext();

// Mock useApp hook
vi.mock('../../../context/AppContext', () => ({
    useApp: () => ({
        language: 'en',
        user: null,
        token: null,
        isAuthenticated: false,
        isAuthLoading: false,
        isSettingsLoading: false,
        isAppLoading: false,
        audioEnabled: true,
        musicEnabled: true,
        notificationsEnabled: false,
        saveLanguage: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
        updateAudioSettings: vi.fn(),
        updateNotificationSettings: vi.fn(),
        startBgMusic: vi.fn()
    })
}));

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(() => 'mock-token'),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
};
global.localStorage = localStorageMock;

// Mock window.confirm
global.confirm = vi.fn(() => true);

// Helper function to render with context
const renderWithContext = (component, language = 'en') => {
    return render(component);
};

// Mock data
const mockUser = {
    _id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    twoFactorEnabled: false
};

const mockExportRequest = {
    _id: 'export123',
    status: 'pending',
    dataTypes: ['profile', 'activity'],
    format: 'json',
    requestedAt: new Date().toISOString(),
    progress: 0
};

const mockCompletedExport = {
    _id: 'export456',
    status: 'completed',
    dataTypes: ['profile', 'messages'],
    format: 'csv',
    requestedAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date().toISOString(),
    downloadUrl: '/api/settings/data/download/token123',
    expiresAt: new Date(Date.now() + 604800000).toISOString(),
    progress: 100
};

const mockPendingDeletion = {
    scheduledDate: new Date(Date.now() + 2592000000).toISOString(), // 30 days
    daysRemaining: 30
};

describe('DataTab Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        // Default successful responses
        global.fetch.mockImplementation((url) => {
            if (url === '/api/auth/me') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ user: mockUser })
                });
            }
            if (url === '/api/settings/data/exports') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ exports: [] })
                });
            }
            if (url === '/api/settings/account/deletion-status') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ pendingDeletion: null })
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({})
            });
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Component Rendering', () => {
        it('should render loading state initially', () => {
            renderWithContext(<DataTab />, 'en');
            expect(screen.getByText(/loading/i)).toBeInTheDocument();
        });

        it('should render DataTab with all sections after loading', async () => {
            renderWithContext(<DataTab />, 'en');
            
            await waitFor(() => {
                expect(screen.getByText(/data & privacy/i)).toBeInTheDocument();
            });

            // Check for main sections
            expect(screen.getByText(/manage your personal data/i)).toBeInTheDocument();
        });

        it('should render in Arabic when language is ar', async () => {
            renderWithContext(<DataTab />, 'ar');
            
            await waitFor(() => {
                expect(screen.getByText(/البيانات والخصوصية/i)).toBeInTheDocument();
            });
        });

        it('should render in French when language is fr', async () => {
            renderWithContext(<DataTab />, 'fr');
            
            await waitFor(() => {
                expect(screen.getByText(/données et confidentialité/i)).toBeInTheDocument();
            });
        });
    });

    describe('Data Export Functionality', () => {
        it('should request data export successfully', async () => {
            global.fetch.mockImplementation((url, options) => {
                if (url === '/api/settings/data/export' && options?.method === 'POST') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ export: mockExportRequest })
                    });
                }
                // Default responses for other calls
                if (url === '/api/auth/me') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ user: mockUser })
                    });
                }
                if (url === '/api/settings/data/exports') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ exports: [] })
                    });
                }
                if (url === '/api/settings/account/deletion-status') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ pendingDeletion: null })
                    });
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({})
                });
            });

            renderWithContext(<DataTab />, 'en');
            
            await waitFor(() => {
                expect(screen.getByText(/data & privacy/i)).toBeInTheDocument();
            });

            // Find and click export button (this will depend on your DataExportSection implementation)
            const exportButton = screen.getByRole('button', { name: /request export|export data/i });
            fireEvent.click(exportButton);

            await waitFor(() => {
                expect(screen.getByText(/data export requested successfully/i)).toBeInTheDocument();
            });
        });

        it('should handle export request error', async () => {
            global.fetch.mockImplementation((url, options) => {
                if (url === '/api/settings/data/export' && options?.method === 'POST') {
                    return Promise.resolve({
                        ok: false,
                        json: () => Promise.resolve({ message: 'Export failed' })
                    });
                }
                // Default responses
                if (url === '/api/auth/me') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ user: mockUser })
                    });
                }
                if (url === '/api/settings/data/exports') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ exports: [] })
                    });
                }
                if (url === '/api/settings/account/deletion-status') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ pendingDeletion: null })
                    });
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({})
                });
            });

            renderWithContext(<DataTab />, 'en');
            
            await waitFor(() => {
                expect(screen.getByText(/data & privacy/i)).toBeInTheDocument();
            });

            const exportButton = screen.getByRole('button', { name: /request export|export data/i });
            fireEvent.click(exportButton);

            await waitFor(() => {
                expect(screen.getByText(/export failed|error requesting data export/i)).toBeInTheDocument();
            });
        });
    });

    describe('Export Status Display', () => {
        it('should display export status cards when exports exist', async () => {
            global.fetch.mockImplementation((url) => {
                if (url === '/api/auth/me') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ user: mockUser })
                    });
                }
                if (url === '/api/settings/data/exports') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ exports: [mockExportRequest, mockCompletedExport] })
                    });
                }
                if (url === '/api/settings/account/deletion-status') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ pendingDeletion: null })
                    });
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({})
                });
            });

            renderWithContext(<DataTab />, 'en');
            
            await waitFor(() => {
                expect(screen.getByText(/data & privacy/i)).toBeInTheDocument();
            });

            // Check that export status cards are rendered
            await waitFor(() => {
                const statusElements = screen.getAllByText(/pending|completed/i);
                expect(statusElements.length).toBeGreaterThan(0);
            });
        });

        it('should show progress bar for pending exports', async () => {
            global.fetch.mockImplementation((url) => {
                if (url === '/api/auth/me') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ user: mockUser })
                    });
                }
                if (url === '/api/settings/data/exports') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ exports: [mockExportRequest] })
                    });
                }
                if (url === '/api/settings/account/deletion-status') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ pendingDeletion: null })
                    });
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({})
                });
            });

            renderWithContext(<DataTab />, 'en');
            
            await waitFor(() => {
                expect(screen.getByText(/data & privacy/i)).toBeInTheDocument();
            });

            // Check for progress indicator
            await waitFor(() => {
                expect(screen.getByText(/pending/i)).toBeInTheDocument();
            });
        });

        it('should show download link for completed exports', async () => {
            global.fetch.mockImplementation((url) => {
                if (url === '/api/auth/me') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ user: mockUser })
                    });
                }
                if (url === '/api/settings/data/exports') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ exports: [mockCompletedExport] })
                    });
                }
                if (url === '/api/settings/account/deletion-status') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ pendingDeletion: null })
                    });
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({})
                });
            });

            renderWithContext(<DataTab />, 'en');
            
            await waitFor(() => {
                expect(screen.getByText(/data & privacy/i)).toBeInTheDocument();
            });

            // Check for download button/link
            await waitFor(() => {
                const downloadButton = screen.getByRole('link', { name: /download/i }) || 
                                      screen.getByRole('button', { name: /download/i });
                expect(downloadButton).toBeInTheDocument();
            });
        });
    });

    describe('Account Deletion Functionality', () => {
        it('should open delete account modal when delete button clicked', async () => {
            renderWithContext(<DataTab />, 'en');
            
            await waitFor(() => {
                expect(screen.getByText(/data & privacy/i)).toBeInTheDocument();
            });

            const deleteButton = screen.getByRole('button', { name: /delete account|delete my account/i });
            fireEvent.click(deleteButton);

            await waitFor(() => {
                expect(screen.getByText(/confirm|are you sure/i)).toBeInTheDocument();
            });
        });

        it('should request account deletion successfully', async () => {
            global.fetch.mockImplementation((url, options) => {
                if (url === '/api/settings/account/delete' && options?.method === 'POST') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ pendingDeletion: mockPendingDeletion })
                    });
                }
                // Default responses
                if (url === '/api/auth/me') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ user: mockUser })
                    });
                }
                if (url === '/api/settings/data/exports') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ exports: [] })
                    });
                }
                if (url === '/api/settings/account/deletion-status') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ pendingDeletion: null })
                    });
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({})
                });
            });

            renderWithContext(<DataTab />, 'en');
            
            await waitFor(() => {
                expect(screen.getByText(/data & privacy/i)).toBeInTheDocument();
            });

            const deleteButton = screen.getByRole('button', { name: /delete account|delete my account/i });
            fireEvent.click(deleteButton);

            // Wait for modal and confirm
            await waitFor(() => {
                const confirmButton = screen.getByRole('button', { name: /confirm|yes|delete/i });
                fireEvent.click(confirmButton);
            });

            await waitFor(() => {
                expect(screen.getByText(/account deletion scheduled/i)).toBeInTheDocument();
            });
        });

        it('should handle account deletion error', async () => {
            global.fetch.mockImplementation((url, options) => {
                if (url === '/api/settings/account/delete' && options?.method === 'POST') {
                    return Promise.resolve({
                        ok: false,
                        json: () => Promise.resolve({ message: 'Deletion failed' })
                    });
                }
                // Default responses
                if (url === '/api/auth/me') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ user: mockUser })
                    });
                }
                if (url === '/api/settings/data/exports') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ exports: [] })
                    });
                }
                if (url === '/api/settings/account/deletion-status') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ pendingDeletion: null })
                    });
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({})
                });
            });

            renderWithContext(<DataTab />, 'en');
            
            await waitFor(() => {
                expect(screen.getByText(/data & privacy/i)).toBeInTheDocument();
            });

            const deleteButton = screen.getByRole('button', { name: /delete account|delete my account/i });
            fireEvent.click(deleteButton);

            await waitFor(() => {
                const confirmButton = screen.getByRole('button', { name: /confirm|yes|delete/i });
                fireEvent.click(confirmButton);
            });

            await waitFor(() => {
                expect(screen.getByText(/deletion failed|error requesting account deletion/i)).toBeInTheDocument();
            });
        });
    });

    describe('Pending Deletion Display', () => {
        it('should display pending deletion card when deletion is scheduled', async () => {
            global.fetch.mockImplementation((url) => {
                if (url === '/api/auth/me') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ user: mockUser })
                    });
                }
                if (url === '/api/settings/data/exports') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ exports: [] })
                    });
                }
                if (url === '/api/settings/account/deletion-status') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ pendingDeletion: mockPendingDeletion })
                    });
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({})
                });
            });

            renderWithContext(<DataTab />, 'en');
            
            await waitFor(() => {
                expect(screen.getByText(/data & privacy/i)).toBeInTheDocument();
            });

            // Check for pending deletion warning
            await waitFor(() => {
                expect(screen.getByText(/30 days|days remaining/i)).toBeInTheDocument();
            });
        });

        it('should hide delete account section when deletion is pending', async () => {
            global.fetch.mockImplementation((url) => {
                if (url === '/api/auth/me') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ user: mockUser })
                    });
                }
                if (url === '/api/settings/data/exports') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ exports: [] })
                    });
                }
                if (url === '/api/settings/account/deletion-status') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ pendingDeletion: mockPendingDeletion })
                    });
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({})
                });
            });

            renderWithContext(<DataTab />, 'en');
            
            await waitFor(() => {
                expect(screen.getByText(/data & privacy/i)).toBeInTheDocument();
            });

            // Delete account button should not be present
            await waitFor(() => {
                const deleteButtons = screen.queryAllByRole('button', { name: /delete account|delete my account/i });
                expect(deleteButtons.length).toBe(0);
            });
        });
    });

    describe('Cancel Deletion Functionality', () => {
        it('should cancel account deletion successfully', async () => {
            global.fetch.mockImplementation((url, options) => {
                if (url === '/api/settings/account/cancel-deletion' && options?.method === 'POST') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ message: 'Deletion cancelled' })
                    });
                }
                // Default responses
                if (url === '/api/auth/me') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ user: mockUser })
                    });
                }
                if (url === '/api/settings/data/exports') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ exports: [] })
                    });
                }
                if (url === '/api/settings/account/deletion-status') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ pendingDeletion: mockPendingDeletion })
                    });
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({})
                });
            });

            renderWithContext(<DataTab />, 'en');
            
            await waitFor(() => {
                expect(screen.getByText(/data & privacy/i)).toBeInTheDocument();
            });

            const cancelButton = screen.getByRole('button', { name: /cancel deletion|cancel/i });
            fireEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.getByText(/account deletion cancelled/i)).toBeInTheDocument();
            });
        });

        it('should handle cancel deletion error', async () => {
            global.fetch.mockImplementation((url, options) => {
                if (url === '/api/settings/account/cancel-deletion' && options?.method === 'POST') {
                    return Promise.resolve({
                        ok: false,
                        json: () => Promise.resolve({ message: 'Cancel failed' })
                    });
                }
                // Default responses
                if (url === '/api/auth/me') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ user: mockUser })
                    });
                }
                if (url === '/api/settings/data/exports') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ exports: [] })
                    });
                }
                if (url === '/api/settings/account/deletion-status') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ pendingDeletion: mockPendingDeletion })
                    });
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({})
                });
            });

            renderWithContext(<DataTab />, 'en');
            
            await waitFor(() => {
                expect(screen.getByText(/data & privacy/i)).toBeInTheDocument();
            });

            const cancelButton = screen.getByRole('button', { name: /cancel deletion|cancel/i });
            fireEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.getByText(/cancel failed|error cancelling deletion/i)).toBeInTheDocument();
            });
        });

        it('should not cancel deletion if user declines confirmation', async () => {
            global.confirm = vi.fn(() => false);

            global.fetch.mockImplementation((url) => {
                if (url === '/api/auth/me') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ user: mockUser })
                    });
                }
                if (url === '/api/settings/data/exports') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ exports: [] })
                    });
                }
                if (url === '/api/settings/account/deletion-status') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ pendingDeletion: mockPendingDeletion })
                    });
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({})
                });
            });

            renderWithContext(<DataTab />, 'en');
            
            await waitFor(() => {
                expect(screen.getByText(/data & privacy/i)).toBeInTheDocument();
            });

            const cancelButton = screen.getByRole('button', { name: /cancel deletion|cancel/i });
            fireEvent.click(cancelButton);

            // Should not make API call
            await waitFor(() => {
                const cancelCalls = global.fetch.mock.calls.filter(
                    call => call[0] === '/api/settings/account/cancel-deletion'
                );
                expect(cancelCalls.length).toBe(0);
            });
        });
    });

    describe('Error Handling', () => {
        it('should display error message when loading fails', async () => {
            global.fetch.mockImplementation(() => {
                return Promise.reject(new Error('Network error'));
            });

            renderWithContext(<DataTab />, 'en');
            
            await waitFor(() => {
                expect(screen.getByText(/error loading data/i)).toBeInTheDocument();
            });
        });

        it('should handle network errors gracefully', async () => {
            global.fetch.mockImplementation((url, options) => {
                if (options?.method === 'POST') {
                    return Promise.reject(new Error('Network error'));
                }
                // Default responses for GET requests
                if (url === '/api/auth/me') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ user: mockUser })
                    });
                }
                if (url === '/api/settings/data/exports') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ exports: [] })
                    });
                }
                if (url === '/api/settings/account/deletion-status') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ pendingDeletion: null })
                    });
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({})
                });
            });

            renderWithContext(<DataTab />, 'en');
            
            await waitFor(() => {
                expect(screen.getByText(/data & privacy/i)).toBeInTheDocument();
            });

            const exportButton = screen.getByRole('button', { name: /request export|export data/i });
            fireEvent.click(exportButton);

            await waitFor(() => {
                expect(screen.getByText(/error requesting data export/i)).toBeInTheDocument();
            });
        });
    });
});
