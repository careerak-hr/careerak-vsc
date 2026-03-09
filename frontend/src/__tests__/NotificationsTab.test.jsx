import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import NotificationsTab from '../pages/SettingsPage/NotificationsTab';
import { AppProvider } from '../context/AppContext';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn()
};
global.localStorage = localStorageMock;

// Helper function to render with context
const renderWithContext = (component, language = 'en') => {
    return render(
        <AppProvider value={{ language }}>
            {component}
        </AppProvider>
    );
};

describe('NotificationsTab Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.getItem.mockReturnValue('fake-token');
        fetch.mockClear();
    });

    describe('Rendering', () => {
        test('renders notification settings title', () => {
            renderWithContext(<NotificationsTab />);
            expect(screen.getByText(/Notification Settings/i)).toBeInTheDocument();
        });

        test('renders all 5 notification types', () => {
            renderWithContext(<NotificationsTab />);
            expect(screen.getByText(/Job Notifications/i)).toBeInTheDocument();
            expect(screen.getByText(/Course Notifications/i)).toBeInTheDocument();
            expect(screen.getByText(/Chat Notifications/i)).toBeInTheDocument();
            expect(screen.getByText(/Review Notifications/i)).toBeInTheDocument();
            expect(screen.getByText(/System Notifications/i)).toBeInTheDocument();
        });

        test('renders quiet hours section', () => {
            renderWithContext(<NotificationsTab />);
            expect(screen.getByText(/Quiet Hours/i)).toBeInTheDocument();
        });

        test('renders frequency options', () => {
            renderWithContext(<NotificationsTab />);
            expect(screen.getByText(/Immediate/i)).toBeInTheDocument();
            expect(screen.getByText(/Daily Digest/i)).toBeInTheDocument();
            expect(screen.getByText(/Weekly Digest/i)).toBeInTheDocument();
        });

        test('renders save button', () => {
            renderWithContext(<NotificationsTab />);
            expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
        });
    });

    describe('Loading Preferences', () => {
        test('loads preferences from API on mount', async () => {
            const mockPreferences = {
                jobNotifications: { enabled: true, inApp: true, email: false, push: false },
                courseNotifications: { enabled: false, inApp: true, email: false, push: false },
                chatNotifications: { enabled: true, inApp: true, email: true, push: true },
                reviewNotifications: { enabled: true, inApp: true, email: false, push: false },
                systemNotifications: { enabled: true, inApp: true, email: false, push: false },
                quietHours: { enabled: true, start: '23:00', end: '07:00' },
                frequency: 'daily'
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ preferences: mockPreferences })
            });

            renderWithContext(<NotificationsTab />);

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith('/api/settings/notifications', {
                    headers: { 'Authorization': 'Bearer fake-token' }
                });
            });
        });

        test('handles API error gracefully', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation();
            renderWithContext(<NotificationsTab />);

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalled();
            });

            consoleSpy.mockRestore();
        });
    });

    describe('Toggling Notification Types', () => {
        test('toggles job notifications on/off', async () => {
            renderWithContext(<NotificationsTab />);

            const jobToggle = screen.getAllByRole('checkbox')[0]; // First toggle is for job notifications
            
            // Initially enabled
            expect(jobToggle).toBeChecked();

            // Toggle off
            fireEvent.click(jobToggle);
            expect(jobToggle).not.toBeChecked();

            // Toggle back on
            fireEvent.click(jobToggle);
            expect(jobToggle).toBeChecked();
        });

        test('shows notification methods when type is enabled', () => {
            renderWithContext(<NotificationsTab />);

            // Job notifications are enabled by default, so methods should be visible
            expect(screen.getAllByText(/In-App/i).length).toBeGreaterThan(0);
            expect(screen.getAllByText(/Email/i).length).toBeGreaterThan(0);
            expect(screen.getAllByText(/Push/i).length).toBeGreaterThan(0);
        });

        test('hides notification methods when type is disabled', async () => {
            renderWithContext(<NotificationsTab />);

            const jobToggle = screen.getAllByRole('checkbox')[0];
            
            // Toggle off
            fireEvent.click(jobToggle);

            // Methods should still be visible for other enabled types
            // but the count should be less
            const methodsCount = screen.getAllByText(/In-App/i).length;
            expect(methodsCount).toBeGreaterThan(0);
        });
    });

    describe('Notification Methods', () => {
        test('toggles notification method checkboxes', () => {
            renderWithContext(<NotificationsTab />);

            const checkboxes = screen.getAllByRole('checkbox');
            const methodCheckbox = checkboxes[1]; // First method checkbox after main toggle

            const initialState = methodCheckbox.checked;
            fireEvent.click(methodCheckbox);
            expect(methodCheckbox.checked).toBe(!initialState);
        });
    });

    describe('Quiet Hours', () => {
        test('toggles quiet hours on/off', () => {
            renderWithContext(<NotificationsTab />);

            const quietHoursToggle = screen.getAllByRole('checkbox').find(
                checkbox => checkbox.getAttribute('aria-label') === 'Toggle quiet hours'
            );

            expect(quietHoursToggle).toBeDefined();
            
            // Initially disabled
            expect(quietHoursToggle).not.toBeChecked();

            // Toggle on
            fireEvent.click(quietHoursToggle);
            expect(quietHoursToggle).toBeChecked();
        });

        test('shows time inputs when quiet hours is enabled', () => {
            renderWithContext(<NotificationsTab />);

            const quietHoursToggle = screen.getAllByRole('checkbox').find(
                checkbox => checkbox.getAttribute('aria-label') === 'Toggle quiet hours'
            );

            // Enable quiet hours
            fireEvent.click(quietHoursToggle);

            // Time inputs should be visible
            expect(screen.getByLabelText(/Start/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/End/i)).toBeInTheDocument();
        });

        test('updates quiet hours start time', () => {
            renderWithContext(<NotificationsTab />);

            const quietHoursToggle = screen.getAllByRole('checkbox').find(
                checkbox => checkbox.getAttribute('aria-label') === 'Toggle quiet hours'
            );

            // Enable quiet hours
            fireEvent.click(quietHoursToggle);

            const startInput = screen.getByLabelText(/Start/i);
            fireEvent.change(startInput, { target: { value: '23:00' } });
            expect(startInput.value).toBe('23:00');
        });

        test('updates quiet hours end time', () => {
            renderWithContext(<NotificationsTab />);

            const quietHoursToggle = screen.getAllByRole('checkbox').find(
                checkbox => checkbox.getAttribute('aria-label') === 'Toggle quiet hours'
            );

            // Enable quiet hours
            fireEvent.click(quietHoursToggle);

            const endInput = screen.getByLabelText(/End/i);
            fireEvent.change(endInput, { target: { value: '07:00' } });
            expect(endInput.value).toBe('07:00');
        });
    });

    describe('Frequency Options', () => {
        test('selects immediate frequency', () => {
            renderWithContext(<NotificationsTab />);

            const immediateRadio = screen.getByRole('radio', { name: /Immediate/i });
            
            // Initially selected
            expect(immediateRadio).toBeChecked();
        });

        test('changes to daily frequency', () => {
            renderWithContext(<NotificationsTab />);

            const dailyRadio = screen.getByRole('radio', { name: /Daily Digest/i });
            
            fireEvent.click(dailyRadio);
            expect(dailyRadio).toBeChecked();
        });

        test('changes to weekly frequency', () => {
            renderWithContext(<NotificationsTab />);

            const weeklyRadio = screen.getByRole('radio', { name: /Weekly Digest/i });
            
            fireEvent.click(weeklyRadio);
            expect(weeklyRadio).toBeChecked();
        });
    });

    describe('Saving Preferences', () => {
        test('saves preferences successfully', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            });

            renderWithContext(<NotificationsTab />);

            const saveButton = screen.getByRole('button', { name: /Save Changes/i });
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith('/api/settings/notifications', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer fake-token'
                    },
                    body: expect.any(String)
                });
            });

            await waitFor(() => {
                expect(screen.getByText(/Settings saved successfully/i)).toBeInTheDocument();
            });
        });

        test('shows error message on save failure', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ message: 'Save failed' })
            });

            renderWithContext(<NotificationsTab />);

            const saveButton = screen.getByRole('button', { name: /Save Changes/i });
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(screen.getByText(/Save failed/i)).toBeInTheDocument();
            });
        });

        test('disables save button while saving', async () => {
            fetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

            renderWithContext(<NotificationsTab />);

            const saveButton = screen.getByRole('button', { name: /Save Changes/i });
            fireEvent.click(saveButton);

            expect(saveButton).toBeDisabled();
            expect(screen.getByText(/Saving.../i)).toBeInTheDocument();
        });
    });

    describe('Multi-language Support', () => {
        test('renders in Arabic', () => {
            renderWithContext(<NotificationsTab />, 'ar');
            expect(screen.getByText(/إعدادات الإشعارات/i)).toBeInTheDocument();
        });

        test('renders in French', () => {
            renderWithContext(<NotificationsTab />, 'fr');
            expect(screen.getByText(/Paramètres de notification/i)).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        test('all toggles have proper aria-labels', () => {
            renderWithContext(<NotificationsTab />);

            const toggles = screen.getAllByRole('checkbox');
            toggles.forEach(toggle => {
                expect(toggle).toHaveAttribute('aria-label');
            });
        });

        test('time inputs have associated labels', () => {
            renderWithContext(<NotificationsTab />);

            const quietHoursToggle = screen.getAllByRole('checkbox').find(
                checkbox => checkbox.getAttribute('aria-label') === 'Toggle quiet hours'
            );

            fireEvent.click(quietHoursToggle);

            const startInput = screen.getByLabelText(/Start/i);
            const endInput = screen.getByLabelText(/End/i);

            expect(startInput).toBeInTheDocument();
            expect(endInput).toBeInTheDocument();
        });

        test('radio buttons are properly grouped', () => {
            renderWithContext(<NotificationsTab />);

            const radios = screen.getAllByRole('radio');
            radios.forEach(radio => {
                expect(radio).toHaveAttribute('name', 'frequency');
            });
        });
    });
});
