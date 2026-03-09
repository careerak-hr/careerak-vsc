import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SecurityTab from '../SecurityTab';
import { AppProvider } from '../../../context/AppContext';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn()
};
global.localStorage = localStorageMock;

// Mock window.confirm
global.confirm = vi.fn(() => true);

// Mock window.alert
global.alert = vi.fn();

// Mock QRCode component
vi.mock('qrcode.react', () => ({
    default: ({ value }) => <div data-testid="qr-code">{value}</div>
}));

const mockUser = {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    twoFactorEnabled: false
};

const mockSessions = [
    {
        id: 'session1',
        isCurrent: true,
        device: {
            type: 'desktop',
            os: 'Windows 10',
            browser: 'Chrome'
        },
        location: {
            ipAddress: '192.168.1.1',
            city: 'Cairo',
            country: 'Egypt'
        },
        loginTime: new Date('2024-01-01T10:00:00'),
        lastActivity: new Date('2024-01-01T12:00:00')
    },
    {
        id: 'session2',
        isCurrent: false,
        device: {
            type: 'mobile',
            os: 'Android',
            browser: 'Chrome Mobile'
        },
        location: {
            ipAddress: '192.168.1.2',
            city: 'Alexandria',
            country: 'Egypt'
        },
        loginTime: new Date('2024-01-01T09:00:00'),
        lastActivity: new Date('2024-01-01T11:00:00')
    }
];

const mockLoginHistory = [
    {
        timestamp: new Date('2024-01-01T10:00:00'),
        success: true,
        device: {
            type: 'desktop',
            os: 'Windows 10',
            browser: 'Chrome'
        },
        location: {
            ipAddress: '192.168.1.1',
            city: 'Cairo',
            country: 'Egypt'
        }
    },
    {
        timestamp: new Date('2024-01-01T09:00:00'),
        success: false,
        device: {
            type: 'mobile',
            os: 'Android',
            browser: 'Chrome Mobile'
        },
        location: {
            ipAddress: '192.168.1.3',
            city: 'Giza',
            country: 'Egypt'
        },
        failureReason: 'Invalid password'
    }
];

const renderSecurityTab = () => {
    return render(
        <AppProvider>
            <SecurityTab />
        </AppProvider>
    );
};

describe('SecurityTab Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.getItem.mockReturnValue('fake-token');
        
        // Default fetch responses
        global.fetch.mockImplementation((url) => {
            if (url.includes('/api/auth/me')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ user: mockUser })
                });
            }
            if (url.includes('/api/settings/sessions')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ sessions: mockSessions })
                });
            }
            if (url.includes('/api/settings/login-history')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ history: mockLoginHistory })
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({})
            });
        });
    });

    describe('Initial Rendering', () => {
        it('should render security tab with all sections', async () => {
            renderSecurityTab();

            await waitFor(() => {
                expect(screen.getByText(/الأمان|Security|Sécurité/i)).toBeInTheDocument();
            });

            // Check for 2FA section
            expect(screen.getByText(/المصادقة الثنائية|Two-Factor Authentication|Authentification à deux facteurs/i)).toBeInTheDocument();

            // Check for Active Sessions section
            expect(screen.getByText(/الجلسات النشطة|Active Sessions|Sessions actives/i)).toBeInTheDocument();

            // Check for Login History section
            expect(screen.getByText(/سجل تسجيل الدخول|Login History|Historique de connexion/i)).toBeInTheDocument();
        });

        it('should display loading state initially', () => {
            renderSecurityTab();
            expect(screen.getByText(/جاري التحميل|Loading|Chargement/i)).toBeInTheDocument();
        });

        it('should load user data on mount', async () => {
            renderSecurityTab();

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    '/api/auth/me',
                    expect.objectContaining({
                        headers: expect.objectContaining({
                            'Authorization': 'Bearer fake-token'
                        })
                    })
                );
            });
        });
    });

    describe('Two-Factor Authentication', () => {
        it('should show "Enable" button when 2FA is disabled', async () => {
            renderSecurityTab();

            await waitFor(() => {
                const enableButton = screen.getByRole('button', { name: /تفعيل|Enable|Activer/i });
                expect(enableButton).toBeInTheDocument();
            });
        });

        it('should show "Disable" and "View Backup Codes" buttons when 2FA is enabled', async () => {
            const userWith2FA = { ...mockUser, twoFactorEnabled: true };
            global.fetch.mockImplementation((url) => {
                if (url.includes('/api/auth/me')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ user: userWith2FA })
                    });
                }
                if (url.includes('/api/settings/sessions')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ sessions: mockSessions })
                    });
                }
                if (url.includes('/api/settings/login-history')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ history: mockLoginHistory })
                    });
                }
                return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
            });

            renderSecurityTab();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /تعطيل|Disable|Désactiver/i })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /عرض أكواد الاحتياط|View Backup Codes|Voir les codes de secours/i })).toBeInTheDocument();
            });
        });

        it('should open Enable2FA modal when clicking enable button', async () => {
            renderSecurityTab();

            await waitFor(() => {
                const enableButton = screen.getByRole('button', { name: /تفعيل|Enable|Activer/i });
                fireEvent.click(enableButton);
            });

            // Modal should be visible
            await waitFor(() => {
                expect(screen.getByText(/تفعيل المصادقة الثنائية|Enable Two-Factor Authentication|Activer l'authentification à deux facteurs/i)).toBeInTheDocument();
            });
        });

        it('should open Disable2FA modal when clicking disable button', async () => {
            const userWith2FA = { ...mockUser, twoFactorEnabled: true };
            global.fetch.mockImplementation((url) => {
                if (url.includes('/api/auth/me')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ user: userWith2FA })
                    });
                }
                if (url.includes('/api/settings/sessions')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ sessions: mockSessions })
                    });
                }
                if (url.includes('/api/settings/login-history')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ history: mockLoginHistory })
                    });
                }
                return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
            });

            renderSecurityTab();

            await waitFor(() => {
                const disableButton = screen.getByRole('button', { name: /تعطيل|Disable|Désactiver/i });
                fireEvent.click(disableButton);
            });

            // Modal should be visible
            await waitFor(() => {
                expect(screen.getByText(/تعطيل المصادقة الثنائية|Disable Two-Factor Authentication|Désactiver l'authentification à deux facteurs/i)).toBeInTheDocument();
            });
        });
    });

    describe('Active Sessions', () => {
        it('should display all active sessions', async () => {
            renderSecurityTab();

            await waitFor(() => {
                expect(screen.getByText('Windows 10')).toBeInTheDocument();
                expect(screen.getByText('Android')).toBeInTheDocument();
            });
        });

        it('should highlight current session', async () => {
            renderSecurityTab();

            await waitFor(() => {
                const currentSessionBadge = screen.getByText(/الجلسة الحالية|Current Session|Session actuelle/i);
                expect(currentSessionBadge).toBeInTheDocument();
            });
        });

        it('should show logout button for non-current sessions', async () => {
            renderSecurityTab();

            await waitFor(() => {
                const logoutButtons = screen.getAllByRole('button', { name: /تسجيل الخروج|Logout|Déconnexion/i });
                // Should have 1 logout button (for session2) + 1 "logout all others" button
                expect(logoutButtons.length).toBeGreaterThan(0);
            });
        });

        it('should logout from specific session', async () => {
            global.fetch.mockImplementation((url, options) => {
                if (url.includes('/api/settings/sessions/session2') && options?.method === 'DELETE') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ success: true })
                    });
                }
                // Default responses
                if (url.includes('/api/auth/me')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ user: mockUser })
                    });
                }
                if (url.includes('/api/settings/sessions')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ sessions: mockSessions })
                    });
                }
                if (url.includes('/api/settings/login-history')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ history: mockLoginHistory })
                    });
                }
                return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
            });

            renderSecurityTab();

            await waitFor(() => {
                const logoutButtons = screen.getAllByRole('button', { name: /تسجيل الخروج|Logout|Déconnexion/i });
                // Click the first logout button (for session2)
                fireEvent.click(logoutButtons[0]);
            });

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    '/api/settings/sessions/session2',
                    expect.objectContaining({
                        method: 'DELETE'
                    })
                );
            });
        });

        it('should show "Logout all others" button when multiple sessions exist', async () => {
            renderSecurityTab();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /تسجيل الخروج من جميع الأجهزة الأخرى|Logout from all other devices|Se déconnecter de tous les autres appareils/i })).toBeInTheDocument();
            });
        });

        it('should logout from all other sessions', async () => {
            global.fetch.mockImplementation((url, options) => {
                if (url.includes('/api/settings/sessions/others') && options?.method === 'DELETE') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ success: true })
                    });
                }
                // Default responses
                if (url.includes('/api/auth/me')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ user: mockUser })
                    });
                }
                if (url.includes('/api/settings/sessions')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ sessions: mockSessions })
                    });
                }
                if (url.includes('/api/settings/login-history')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ history: mockLoginHistory })
                    });
                }
                return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
            });

            renderSecurityTab();

            await waitFor(() => {
                const logoutAllButton = screen.getByRole('button', { name: /تسجيل الخروج من جميع الأجهزة الأخرى|Logout from all other devices|Se déconnecter de tous les autres appareils/i });
                fireEvent.click(logoutAllButton);
            });

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    '/api/settings/sessions/others',
                    expect.objectContaining({
                        method: 'DELETE'
                    })
                );
            });
        });
    });

    describe('Login History', () => {
        it('should display login history', async () => {
            renderSecurityTab();

            await waitFor(() => {
                expect(screen.getByText(/تسجيل دخول ناجح|Successful login|Connexion réussie/i)).toBeInTheDocument();
                expect(screen.getByText(/محاولة فاشلة|Failed attempt|Tentative échouée/i)).toBeInTheDocument();
            });
        });

        it('should show success and failed login attempts', async () => {
            renderSecurityTab();

            await waitFor(() => {
                // Check for success indicator
                const successItems = screen.getAllByText(/تسجيل دخول ناجح|Successful login|Connexion réussie/i);
                expect(successItems.length).toBeGreaterThan(0);

                // Check for failed indicator
                const failedItems = screen.getAllByText(/محاولة فاشلة|Failed attempt|Tentative échouée/i);
                expect(failedItems.length).toBeGreaterThan(0);
            });
        });

        it('should display failure reason for failed attempts', async () => {
            renderSecurityTab();

            await waitFor(() => {
                expect(screen.getByText(/Invalid password/i)).toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        it('should display error message when loading fails', async () => {
            global.fetch.mockRejectedValue(new Error('Network error'));

            renderSecurityTab();

            await waitFor(() => {
                expect(screen.getByText(/حدث خطأ|Error|Erreur/i)).toBeInTheDocument();
            });
        });

        it('should handle logout error gracefully', async () => {
            global.fetch.mockImplementation((url, options) => {
                if (url.includes('/api/settings/sessions/') && options?.method === 'DELETE') {
                    return Promise.resolve({
                        ok: false,
                        json: () => Promise.resolve({ message: 'Logout failed' })
                    });
                }
                // Default responses
                if (url.includes('/api/auth/me')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ user: mockUser })
                    });
                }
                if (url.includes('/api/settings/sessions')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ sessions: mockSessions })
                    });
                }
                if (url.includes('/api/settings/login-history')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ history: mockLoginHistory })
                    });
                }
                return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
            });

            renderSecurityTab();

            await waitFor(() => {
                const logoutButtons = screen.getAllByRole('button', { name: /تسجيل الخروج|Logout|Déconnexion/i });
                fireEvent.click(logoutButtons[0]);
            });

            await waitFor(() => {
                expect(screen.getByText(/حدث خطأ أثناء تسجيل الخروج|Error logging out|Erreur lors de la déconnexion/i)).toBeInTheDocument();
            });
        });
    });
});
