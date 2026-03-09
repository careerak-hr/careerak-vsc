import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider } from '../../../context/AppContext';
import PrivacyTab from '../PrivacyTab';

// Mock Capacitor Preferences - always return Arabic
vi.mock('@capacitor/preferences', () => ({
    Preferences: {
        get: vi.fn(({ key }) => {
            if (key === 'lang') return Promise.resolve({ value: 'ar' });
            return Promise.resolve({ value: null });
        }),
        set: vi.fn().mockResolvedValue(undefined),
        remove: vi.fn().mockResolvedValue(undefined)
    }
}));

// Mock environment variables
vi.mock('import.meta', () => ({
    env: {
        VITE_API_URL: 'http://localhost:5000'
    }
}));

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn()
};
global.localStorage = localStorageMock;

const renderPrivacyTab = () => {
    return render(
        <AppProvider>
            <PrivacyTab />
        </AppProvider>
    );
};

describe('PrivacyTab Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.getItem.mockReturnValue('fake-token');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Rendering', () => {
        it('should render privacy tab with all sections in Arabic', async () => {
            renderPrivacyTab();

            await waitFor(() => {
                expect(screen.getByText('إعدادات الخصوصية')).toBeInTheDocument();
            });

            expect(screen.getByText('رؤية الملف الشخصي')).toBeInTheDocument();
            expect(screen.getByText('معلومات الاتصال')).toBeInTheDocument();
            expect(screen.getByText('الرسائل')).toBeInTheDocument();
            expect(screen.getByText('النشاط')).toBeInTheDocument();
            expect(screen.getByText('محركات البحث')).toBeInTheDocument();
        });
    });

    describe('Loading Privacy Settings', () => {
        it('should load privacy settings on mount', async () => {
            const mockSettings = {
                privacy: {
                    profileVisibility: 'registered',
                    showEmail: true,
                    showPhone: false,
                    messagePermissions: 'contacts',
                    showOnlineStatus: false,
                    allowSearchEngineIndexing: true
                }
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockSettings
            });

            renderPrivacyTab();

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    expect.stringContaining('/api/settings/privacy'),
                    expect.objectContaining({
                        headers: {
                            'Authorization': 'Bearer fake-token'
                        }
                    })
                );
            });

            // Verify settings were loaded
            await waitFor(() => {
                const radios = screen.getAllByRole('radio');
                const registeredRadio = radios.find(r => r.name === 'profileVisibility' && r.value === 'registered');
                expect(registeredRadio).toBeChecked();
            });
        });

        it('should handle loading error gracefully', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network error'));

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            renderPrivacyTab();

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalled();
            });

            consoleSpy.mockRestore();
        });
    });

    describe('Profile Visibility', () => {
        it('should change profile visibility to "registered"', async () => {
            renderPrivacyTab();

            await waitFor(() => {
                expect(screen.getByText('إعدادات الخصوصية')).toBeInTheDocument();
            });

            const radios = screen.getAllByRole('radio');
            const registeredRadio = radios.find(r => r.name === 'profileVisibility' && r.value === 'registered');
            fireEvent.click(registeredRadio);

            expect(registeredRadio).toBeChecked();
        });

        it('should change profile visibility to "none"', async () => {
            renderPrivacyTab();

            await waitFor(() => {
                expect(screen.getByText('إعدادات الخصوصية')).toBeInTheDocument();
            });

            const radios = screen.getAllByRole('radio');
            const noneRadio = radios.find(r => r.name === 'profileVisibility' && r.value === 'none');
            fireEvent.click(noneRadio);

            expect(noneRadio).toBeChecked();
        });

        it('should show unsaved changes warning', async () => {
            renderPrivacyTab();

            await waitFor(() => {
                expect(screen.getByText('إعدادات الخصوصية')).toBeInTheDocument();
            });

            const radios = screen.getAllByRole('radio');
            // Click on a different option (registered) to trigger a change
            const registeredRadio = radios.find(r => r.name === 'profileVisibility' && r.value === 'registered');
            fireEvent.click(registeredRadio);

            expect(screen.getByText(/لديك تغييرات غير محفوظة/i)).toBeInTheDocument();
        });
    });

    describe('Contact Information', () => {
        it('should toggle show email checkbox', async () => {
            renderPrivacyTab();

            await waitFor(() => {
                expect(screen.getByText('إعدادات الخصوصية')).toBeInTheDocument();
            });

            const checkboxes = screen.getAllByRole('checkbox');
            const showEmailCheckbox = checkboxes[0]; // First checkbox is show email
            fireEvent.click(showEmailCheckbox);

            expect(showEmailCheckbox).toBeChecked();
        });

        it('should toggle show phone checkbox', async () => {
            renderPrivacyTab();

            await waitFor(() => {
                expect(screen.getByText('إعدادات الخصوصية')).toBeInTheDocument();
            });

            const checkboxes = screen.getAllByRole('checkbox');
            const showPhoneCheckbox = checkboxes[1]; // Second checkbox is show phone
            fireEvent.click(showPhoneCheckbox);

            expect(showPhoneCheckbox).toBeChecked();
        });
    });

    describe('Message Permissions', () => {
        it('should change message permissions to "contacts"', async () => {
            renderPrivacyTab();

            await waitFor(() => {
                expect(screen.getByText('إعدادات الخصوصية')).toBeInTheDocument();
            });

            const radios = screen.getAllByRole('radio');
            const contactsRadio = radios.find(r => r.name === 'messagePermissions' && r.value === 'contacts');
            fireEvent.click(contactsRadio);

            expect(contactsRadio).toBeChecked();
        });

        it('should change message permissions to "none"', async () => {
            renderPrivacyTab();

            await waitFor(() => {
                expect(screen.getByText('إعدادات الخصوصية')).toBeInTheDocument();
            });

            const radios = screen.getAllByRole('radio');
            const noneRadio = radios.find(r => r.name === 'messagePermissions' && r.value === 'none');
            fireEvent.click(noneRadio);

            expect(noneRadio).toBeChecked();
        });
    });

    describe('Activity Status', () => {
        it('should toggle online status checkbox', async () => {
            renderPrivacyTab();

            await waitFor(() => {
                expect(screen.getByText('إعدادات الخصوصية')).toBeInTheDocument();
            });

            const checkboxes = screen.getAllByRole('checkbox');
            const onlineStatusCheckbox = checkboxes[2]; // Third checkbox is online status
            
            // Initially checked
            expect(onlineStatusCheckbox).toBeChecked();

            // Toggle off
            fireEvent.click(onlineStatusCheckbox);
            expect(onlineStatusCheckbox).not.toBeChecked();

            // Toggle on
            fireEvent.click(onlineStatusCheckbox);
            expect(onlineStatusCheckbox).toBeChecked();
        });
    });

    describe('Search Engine Indexing', () => {
        it('should toggle search engine indexing checkbox', async () => {
            renderPrivacyTab();

            await waitFor(() => {
                expect(screen.getByText('إعدادات الخصوصية')).toBeInTheDocument();
            });

            const checkboxes = screen.getAllByRole('checkbox');
            const indexingCheckbox = checkboxes[3]; // Fourth checkbox is search engine indexing
            
            // Initially checked
            expect(indexingCheckbox).toBeChecked();

            // Toggle off
            fireEvent.click(indexingCheckbox);
            expect(indexingCheckbox).not.toBeChecked();

            // Toggle on
            fireEvent.click(indexingCheckbox);
            expect(indexingCheckbox).toBeChecked();
        });
    });

    describe('Saving Privacy Settings', () => {
        it('should save privacy settings successfully', async () => {
            global.fetch
                .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // Load settings
                .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) }); // Save settings

            renderPrivacyTab();

            // Wait for initial load
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledTimes(1);
            });

            // Make a change
            const checkboxes = screen.getAllByRole('checkbox');
            const showEmailCheckbox = checkboxes[0];
            fireEvent.click(showEmailCheckbox);

            // Click save button
            const saveButton = screen.getByRole('button');
            fireEvent.click(saveButton);

            await waitFor(() => {
                // Check for success message in Arabic
                expect(screen.getByText(/تم حفظ إعدادات الخصوصية بنجاح/i)).toBeInTheDocument();
            });

            // Unsaved changes warning should disappear
            expect(screen.queryByText(/لديك تغييرات غير محفوظة/i)).not.toBeInTheDocument();
        });

        it('should handle save error', async () => {
            global.fetch
                .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // Load settings
                .mockResolvedValueOnce({
                    ok: false,
                    json: async () => ({ message: 'Server error' })
                }); // Save error

            renderPrivacyTab();

            // Wait for initial load
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledTimes(1);
            });

            // Make a change
            const checkboxes = screen.getAllByRole('checkbox');
            const showEmailCheckbox = checkboxes[0];
            fireEvent.click(showEmailCheckbox);

            // Click save button
            const saveButton = screen.getByRole('button');
            fireEvent.click(saveButton);

            await waitFor(() => {
                // Check for error message (the component shows the server error message directly)
                const errorElement = screen.getByText(/Server error/i);
                expect(errorElement).toBeInTheDocument();
            });
        });

        it('should disable save button when no changes', async () => {
            global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
            
            renderPrivacyTab();

            // Wait for initial load
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledTimes(1);
            });

            const saveButton = screen.getByRole('button');
            expect(saveButton).toBeDisabled();
        });

        it('should enable save button when changes are made', async () => {
            global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
            
            renderPrivacyTab();

            // Wait for initial load
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledTimes(1);
            });

            const checkboxes = screen.getAllByRole('checkbox');
            const showEmailCheckbox = checkboxes[0];
            fireEvent.click(showEmailCheckbox);

            const saveButton = screen.getByRole('button');
            expect(saveButton).not.toBeDisabled();
        });

        it('should show loading state while saving', async () => {
            global.fetch
                .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // Load settings
                .mockImplementation(() => 
                    new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
                );

            renderPrivacyTab();

            // Wait for initial load
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledTimes(1);
            });

            // Make a change
            const checkboxes = screen.getAllByRole('checkbox');
            const showEmailCheckbox = checkboxes[0];
            fireEvent.click(showEmailCheckbox);

            // Click save button
            const saveButton = screen.getByRole('button');
            fireEvent.click(saveButton);

            // Should show loading state (check for button text containing "...")
            await waitFor(() => {
                const button = screen.getByRole('button');
                expect(button.textContent).toMatch(/\.\.\./);
            });

            await waitFor(() => {
                const button = screen.getByRole('button');
                expect(button.textContent).not.toMatch(/\.\.\./);
            }, { timeout: 3000 });
        });

        it('should handle missing authentication token', async () => {
            localStorageMock.getItem.mockReturnValue(null);

            renderPrivacyTab();

            // Wait for component to load
            await waitFor(() => {
                expect(screen.getByText('إعدادات الخصوصية')).toBeInTheDocument();
            });

            // Make a change
            const checkboxes = screen.getAllByRole('checkbox');
            const showEmailCheckbox = checkboxes[0];
            fireEvent.click(showEmailCheckbox);

            // Click save button
            const saveButton = screen.getByRole('button');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(screen.getByText(/authenticated/i)).toBeInTheDocument();
            });
        });
    });

    describe('Integration Tests', () => {
        it('should update multiple settings and save', async () => {
            global.fetch
                .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // Load settings
                .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) }); // Save settings

            renderPrivacyTab();

            // Wait for initial load
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledTimes(1);
            });

            // Change profile visibility
            const radios = screen.getAllByRole('radio');
            const registeredRadio = radios.find(r => r.name === 'profileVisibility' && r.value === 'registered');
            fireEvent.click(registeredRadio);

            // Toggle show email
            const checkboxes = screen.getAllByRole('checkbox');
            const showEmailCheckbox = checkboxes[0];
            fireEvent.click(showEmailCheckbox);

            // Change message permissions
            const contactsRadio = radios.find(r => r.name === 'messagePermissions' && r.value === 'contacts');
            fireEvent.click(contactsRadio);

            // Toggle online status
            const onlineStatusCheckbox = checkboxes[2];
            fireEvent.click(onlineStatusCheckbox);

            // Save
            const saveButton = screen.getByRole('button');
            fireEvent.click(saveButton);

            await waitFor(() => {
                // Check that fetch was called twice (load + save)
                expect(global.fetch).toHaveBeenCalledTimes(2);
                // Check that the second call was a PUT request
                const secondCall = global.fetch.mock.calls[1];
                expect(secondCall[1].method).toBe('PUT');
                expect(secondCall[1].body).toContain('"profileVisibility":"registered"');
            });
        });
    });
});
